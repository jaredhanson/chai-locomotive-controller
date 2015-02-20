/**
 * Module dependencies.
 */
var once = require('once')
  , TestError = require('../errors/testerror');


function wrap(controller, filter, i, n, cb) {
  cb = once(cb);
  
  return function forward() {
    var args = [].slice.call(arguments)
    var iter = args.pop();
    var tid;
    
    if (i == n) {
      tid = setTimeout(cb, controller.__testDelay || 1);
    }
    
    args.push(function next(err) {
      if (tid) { clearTimeout(tid); }
      if (err) { return iter(err); }
      
      // TODO: Throw if cb is called more than once (handles case where timing is inconsistent)
      
      (i == e) ? cb() : iter();
    });
    filter.apply(controller, args);
  }
}


/**
 * Override Controller#_devoke.
 *
 * This function is used as an override of Locomotive's Controller#_devoke
 * function.  The intent is to monitor execution of the after filter chain, in
 * order to trigger test completion once the chain is complete.
 *
 * @param {Error} err
 * @param {Function} cb
 * @api private
 */
exports._devoke = function(err, cb) {
  // NOTE: `TestError`s are thrown when unexpected conditions are encountered
  //       while executing the test case.  These are immediately rethrown,
  //       causing them to bubble up to the test runner.
  if (err instanceof TestError) { throw err; }
  
  if (this.__devoked) { return; }
  this.__devoked = true;

  var self = this
    , action = this.__action
    , filters = this.__afterFilters
    , filter
    , i = 0
    , expected = 0
    , execed = 0
    , j, len, arity, wrapped;
  
  // Set explicit number of expected after filters, or auto-detect if not
  // specified.
  if (typeof this.__testExpectNAfterFilters == 'number') {
    expected = this.__testExpectNAfterFilters;
  } else {
    for (j = 0, len = this.__afterFilters.length; j < len; j++) {
      filter = filters[j];
      if (filter.action == '*' || filter.action == action) {
        arity = filter.fn.length;
        if (err) {
          if (arity == 4) { expected++; }
        } else {
          if (arity < 4) { expected++; }
        }
      }
    }
  }
  
  function complete() {
    if (!self.__testComplete) { throw new TestError('Controller should not complete processing'); }
    self.__testComplete.call(this, self.__res);
  }

  (function iter(err) {
    if (execed == expected) { return complete(); }
    
    filter = filters[i++];
    if (!filter) {
      if (cb) { return cb(err); }
      throw new TestError('Controller expected to execute ' + expected + ' after filters, but executed ' + execed);
    }

    if (filter.action != '*' && filter.action != action) { return iter(err); }
    
    wrapped = wrap(self, filter.fn, execed + 1, expected, complete);

    // invoke after filters
    try {
      var arity = filter.fn.length;
      if (err) {
        if (arity == 4) {
          execed++;
          wrapped.call(self, err, self.req, self.res, iter);
        } else {
          iter(err);
        }
      } else {
        if (arity == 2 || arity == 3) {
          // Support for Connect middleware being used directly as a filter.
          execed++;
          wrapped.call(self, self.req, self.res, iter);
        } else if (arity < 2) {
          execed++;
          wrapped.call(self, iter);
        } else {
          iter();
        }
      }
    } catch (ex) {
      if (ex instanceof TestError) { throw ex; }
      iter(ex);
    }
  })(err);
}
