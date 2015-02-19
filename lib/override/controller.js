/**
 * Module dependencies.
 */
var once = require('once')
  , TestError = require('../errors/testerror');


function wrap(controller, filter, i, e, cb) {
  cb = once(cb);
  
  return function forward() {
    console.log('EXECING %d of %d', i, e);
    
    var args = [].slice.call(arguments)
    var iter = args.pop();
    var tid;
    
    
    
    if (i == e) {
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
  console.log('!!!! OVERRIDE DEVOKE');
  
  // NOTE: `TestError`s are thrown when unexpected conditions are encountered
  //       while executing the test case.  These are immediately rethrown,
  //       causing them to bubble up to the test runner.
  if (err instanceof TestError) { throw err; }
  
  if (this.__devoked) { return; }
  this.__devoked = true;

  var self = this
    , action = this.__action
    , filters = this.__afterFilters
    , filter, wrapped
    , i = 0
    , expected = 0
    , execed = 0
    , j, len, arity;
  
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

  
  
  console.log('TOTAL AFTER FILTERS: ' + this.__afterFilters.length)
  console.log('EXPECTING THIS MANY AFTER FILTERS: ' + expected);

  function complete() {
    console.log('TEST COMPLETE!!!');
  
    if (!self.__testComplete) { throw new TestError('controller should not complete processing'); }
    self.__testComplete.call(this, self.__res);
  }

  (function iter(err) {
    if (execed == expected) { return complete(); }
    
    filter = filters[i++];
    console.log('EXECING FILTER: ' + (execed + 1) + ' ' + i);
    
    if (!filter) {
      if (cb) { return cb(err); }
      throw new TestError('controller expected to execute ' + expected + ' after filters, but executed ' + execed);
    }
    
    wrapped = wrap(self, filter.fn, i, expected, complete);

    if (filter.action != '*' && filter.action != action) { return iter(err); }

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
