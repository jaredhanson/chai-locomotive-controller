module.exports = function(chai, _) {
  var Test = require('./test');
  
  chai.locomotive = chai.locomotive || {};
  chai.locomotive.controller = function(controller) {
    return new Test(controller);
  };
  
  
  /**
   * Aliases.
   */
  var Assertion = chai.Assertion;
  
  /**
   * ### .status (code)
   *
   * Assert that a response has a supplied status.
   *
   * ```js
   * expect(res).to.have.status(200);
   * ```
   *
   * @param {Number} code
   * @name status
   * @api public
   */
  Assertion.addMethod('status', function(code) {
    new Assertion(this._obj).to.have.property('statusCode');
    var statusCode = this._obj.statusCode;

    this.assert(
        statusCode == code
      , 'expected #{this} to have status code #{exp} but got #{act}'
      , 'expected #{this} to not have status code #{act}'
      , code  // expected
      , statusCode  // actual
    );
  });
  
  Assertion.addMethod('render', function(view) {
    new Assertion(this._obj).to.have.property('_render');
    var renderedView = this._obj._render.view;

    this.assert(
        renderedView == view
      , 'expected #{this} to render view #{exp} but rendered #{act}'
      , 'expected #{this} to not render view #{act}'
      , view  // expected
      , renderedView  // actual
    );
  });
};
