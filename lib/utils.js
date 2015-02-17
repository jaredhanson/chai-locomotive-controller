/**
 * Underscore the given `str`.
 *
 * Examples:
 *
 *    underscore('FooBar');
 *    // => "foo_bar"
 *  
 *    underscore('SSLError');
 *    // => "ssl_error"
 *
 * @param {String} str
 * @return {String}
 * @api protected
 */
exports.underscore = function(str) {
  str = str.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
  str = str.replace(/([a-z\d])([A-Z])/g, '$1_$2');
  str = str.replace(/-/g, '_');
  return str.toLowerCase();
};
