/**
 * Creates an instance of `Request`.
 *
 * @constructor
 * @api protected
 */
function Request() {
  this.method = 'GET';
  this.url = '/';
  this.headers = {};
}


/**
 * Expose `Request`.
 */
module.exports = Request;
