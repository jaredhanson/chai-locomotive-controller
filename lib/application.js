/**
 * Module dependencies.
 */
var underscore = require('./utils').underscore;

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
  this._formats = {};
  this._helpers = {};
  this._dynamicHelpers = {};
  
  this.views = {
    resolve: function(id) {
      return underscore(id);
    }
  }
}


/**
 * Expose `Application`.
 */
module.exports = Application;
