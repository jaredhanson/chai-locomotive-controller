
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
function Response() {
  EventEmitter.call(this);
  this.statusCode = 200;
  this._headers = {};
  this._data = '';
  
  this.locals = {};
  this._render = {};
}

util.inherits(Response, EventEmitter);

Response.prototype.getHeader = function(name) {
  return this._headers[name];
};

Response.prototype.setHeader = function(name, value) {
  this._headers[name] = value;
};

Response.prototype.render = function(view, options) {
  this._render = { view: view, option: options };
  this.end();
};

Response.prototype.redirect = function(url) {
  var address = url;
  var status = 302;
  
  // allow status / url
  if (arguments.length === 2) {
    if (typeof arguments[0] === 'number') {
      status = arguments[0];
      address = arguments[1];
    }
  }
  
  this.statusCode = status;
  this.setHeader('Location', url);
  this.end();
};

Response.prototype.end = function(data, encoding) {
  if (data) { this._data += data; }
  this.emit('finish');
};


/**
 * Expose `Response`.
 */
module.exports = Response;
