
/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
  , util = require('util');


/**
 * Creates an instance of `Response`.
 *
 * This class is used as a mock when testing Locomotive helpers, substituted in
 * place of of a Node's `http.ServerResponse`.
 *
 * @constructor
 * @api protected
 */
function Response(endCb, renderCb) {
  EventEmitter.call(this);
  this.locals = {};
  this.statusCode = 200;
  this._headers = {};
  this._data = '';
  this.__cb = endCb;
  this.__renderCb = renderCb;
}

util.inherits(Response, EventEmitter);

Response.prototype.getHeader = function(name) {
  return this._headers[name];
};

Response.prototype.setHeader = function(name, value) {
  this._headers[name] = value;
};

Response.prototype.render = function(view, options) {
  this.__renderCb(view, this.locals, options)
};

Response.prototype.redirect = function(url, status) {
  this.statusCode = status || 302;
  this.setHeader('Location', url);
  this.end();
};

Response.prototype.end = function(data, encoding) {
  if (data) { this._data += data; }
  this.emit('finish');
  if (this.__cb) { this.__cb(); }
};


/**
 * Expose `Response`.
 */
module.exports = Response;
