/**
 * Creates an instance of `Application`.
 *
 * This class is used as a mock when testing Locomotive helpers, substituted in
 * place of of a `locomotive.Application`.
 *
 * @constructor
 * @api protected
 */
function Application() {
  this._helpers = {};
  this._dynamicHelpers = {};
}


/**
 * Expose `Application`.
 */
module.exports = Application;
