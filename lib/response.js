
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
}

util.inherits(Response, EventEmitter);

Response.prototype.getHeader = function(name) {
  return this._headers[name];
};

Response.prototype.setHeader = function(name, value) {
  this._headers[name] = value;
};


/**
 * Expose `Response`.
 */
module.exports = Response;
