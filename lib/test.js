/**
 * Module dependencies.
 */
var Application = require('./application')
  , Request = require('./request')
  , Response = require('./response')
  , override = require('./override/controller');


/**
 * Creates an instance of `Test`.
 *
 * @constructor
 * @api protected
 */
function Test(controller) {
  this._controller = controller;
}

Test.prototype.id = function(id) {
  this._id = id;
  return this;
};

/**
 * Register a callback to be invoked when application is prepared.
 *
 * @param {Function} cb
 * @return {Test} for chaining
 * @api public
 */
Test.prototype.app = function(cb) {
  this._app = cb;
  return this;
};

/**
 * Register a callback to be invoked when request is prepared.
 *
 * @param {Function} cb
 * @return {Test} for chaining
 * @api public
 */
Test.prototype.req = function(cb) {
  this._req = cb;
  return this;
};

/**
 * Register a callback to be invoked when response is prepared.
 *
 * @param {Function} cb
 * @return {Test} for chaining
 * @api public
 */
Test.prototype.res = function(cb) {
  this._res = cb;
  return this;
};

// TODO: Implement trap for `invoke()`

Test.prototype.after = function(c) {
  this._after = c;
  return this;
};

Test.prototype.delay = function(ms) {
  this._delay = ms;
  return this;
};

/**
 * Register a callback to be invoked when controller completes processing.
 *
 * @param {Function} cb
 * @return {Test} for chaining
 * @api public
 */
Test.prototype.complete = function(cb) {
  this._complete = cb;
  return this;
};

/**
 * Register a callback to be invoked when controller leaves processing
 * incomplete and hands control back to the underlying framework (typically
 * Express).
 *
 * @param {Function} cb
 * @return {Test} for chaining
 * @api public
 */
Test.prototype.incomplete = function(cb) {
  this._incomplete = cb;
  return this;
};

Test.prototype.dispatch = function(action) {
  var self = this
    , app = new Application()
    , req = new Request()
    , ctrl = this._controller
    , before = this._req;
  
  function ready() {
    var res = new Response();
    if (self._res) { self._res(res); }
    
    
    // override controller internals for test monitoring
    ctrl.__testExpectNAfterFilters = self._after;
    ctrl.__testDelay = self._delay;
    ctrl.__testComplete = self._complete;
    
    ctrl._devoke = override._devoke;
    /*
    var _devoke = ctrl._devoke;
    ctrl._devoke = function(err, cb) {
      console.log('!! IN PROXY DEVOKE');
    
      ctrl._devoke = _devoke;
      ctrl._devoke(err, function next(err) {
        console.log('!! IN PROXY DEVOKE CB');
      });
    };
    */
    
    
    ctrl._init(app, this._id || 'unknown');
    ctrl._prepare(req, res, function next(err) {
      console.log('NEXT CALLED!!!');
      console.log(err)
      if (!self._incomplete) { throw new Error('controller should not leave processing incomplete'); }
      self._incomplete.call(this, err);
    });
    ctrl._invoke(action);
  }
  
  if (self._app) { self._app(app); }
  
  if (before && before.length == 2) {
    before(req, ready);
  } else if (before) {
    before(req);
    ready();
  } else {
    ready();
  }
}

/**
 * Expose `Test`.
 */
module.exports = Test;
