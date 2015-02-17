module.exports = function(chai, _) {
  var Test = require('./test');
  
  chai.locomotive = chai.locomotive || {};
  chai.locomotive.controller = function(controller) {
    return new Test(controller);
  };
};
