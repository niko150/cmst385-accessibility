'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _modelUri = require('./modelUri');

var _modelUri2 = _interopRequireDefault(_modelUri);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Contract = function () {
  function Contract() {
    (0, _classCallCheck3.default)(this, Contract);
    this.modelUris = [];
  }

  (0, _createClass3.default)(Contract, [{
    key: 'addCollection',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(model, db, router) {
        var modelUri;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                modelUri = new _modelUri2.default(model, db);

                this.modelUris.push(modelUri);
                _context.next = 4;
                return modelUri.wireRouter(router);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function addCollection(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return addCollection;
    }()
  }]);
  return Contract;
}();

exports.default = Contract;