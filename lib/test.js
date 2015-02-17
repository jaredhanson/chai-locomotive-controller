/**
 * Module dependencies.
 */
var Application = require('./application')
  , Request = require('./request')
  , Response = require('./response');


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

/**
 * Register a callback to be invoked when controller calls `render()`.
 *
 * @param {Function} cb
 * @return {Test} for chaining
 * @api public
 */
Test.prototype.render = function(cb) {
  this._render = cb;
  return this;
};

/**
 * Register a callback to be invoked when controller calls `next()`.
 *
 * @param {Function} cb
 * @return {Test} for chaining
 * @api public
 */
Test.prototype.next = function(cb) {
  this._next = cb;
  return this;
};

/**
 * Register a callback to be invoked when response is `end()`ed.
 *
 * @param {Function} cb
 * @return {Test} for chaining
 * @api public
 */
Test.prototype.end = function(cb) {
  this._end = cb;
  return this;
};

Test.prototype.dispatch = function(action) {
  var self = this
    , app = new Application()
    , req = new Request()
    , ctrl = this._controller
    , before = this._req;
  
  function ready() {
    var res = new Response(function() {
      if (!self._end) { throw new Error('res#end should not be called'); }
      self._end.call(this, res);
    }, function(view, options) {
      if (!self._render) { throw new Error('render should not be called'); }
      self._render.call(this, view, options);
    });
    if (self._res) { self._res(res); }
    
    ctrl._init(app, this._id || 'unknown');
    ctrl._prepare(req, res, function next(err) {
      if (!self._next) { throw new Error('next should not be called'); }
      self._next.call(this, err);
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
