/**
 * `TestError` error.
 *
 * @api private
 */
function TestError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'TestError';
  this.message = message;
}

/**
 * Inherit from `Error`.
 */
TestError.prototype.__proto__ = Error.prototype;


/**
 * Expose `TestError`.
 */
module.exports = TestError;
