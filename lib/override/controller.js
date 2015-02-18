/**
 * Module dependencies.
 */
var once = require('once')


function wrap(controller, filter, i, e, cb) {
  // TODO: Implement this
  //if (i > e) { console.log('THROW IT'); throw new Error('Attempted to execute more after filters than expected (' + i + ' of ' + e + ')'); }
  
  console.log('WRAPING FILTER WITH ARITY: ' + filter.length);
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
  
  if (this.__devoked) { return; }
  this.__devoked = true;

  var self = this
    , action = this.__action
    , filters = this.__afterFilters
    , filter, wrapped
    , i = 0
    , expect = 0
    , j, len;

  // TODO: Better count of only filters for this action

  if (typeof this.__testExpectNAfterFilters == 'number') {
    console.log('*** SET EXPECTED');
    expect = this.__testExpectNAfterFilters;
  } else {
    console.log('TODO: AUTO DETECT FILTERS');
    
    for (j = 0, len = this.__afterFilters.length; j < len; j++) {
    
    }
  }

  
  
  console.log('TOTAL AFTER FILTERS: ' + this.__afterFilters.length)
  console.log('EXPECTING THIS MANY AFTER FILTERS: ' + expect);

  function complete() {
    console.log('TEST COMPLETE!!!');
  
    if (!self.__testComplete) { throw new Error('controller should not complete processing'); }
    self.__testComplete.call(this, self.__res);
  }

  (function iter(err) {
    filter = filters[i++];
    console.log('EXECING FILTER: ' + i);
    
    if (i > expect) {
      console.log('DO COMPLETE');
      return complete();
    }
    
    // FIXME: why doesn't this bubble up to the test
    //return cb(new Error('foo'))
    
    wrapped = wrap(self, filter.fn, i, expect, complete);
    
    if (!filter) {
      // filters done
      cb && cb(err);
      return;
    }

    if (filter.action != '*' && filter.action != action) { return iter(err); }

    // invoke after filters
    try {
      var arity = filter.fn.length;
      if (err) {
        if (arity == 4) {
          wrapped.call(self, err, self.req, self.res, iter);
        } else {
          iter(err);
        }
      } else {
        if (arity == 2 || arity == 3) {
          // Support for Connect middleware being used directly as a filter.
          wrapped.call(self, self.req, self.res, iter);
        } else if (arity < 2) {
          wrapped.call(self, iter);
        } else {
          iter();
        }
      }
    } catch (ex) {
      console.log('CAUGHT DEVOKE ERROR');
      iter(ex);
    }
  })(err);
}
