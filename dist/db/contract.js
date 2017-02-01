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

var _ModelUri = require('./ModelUri');

var _ModelUri2 = _interopRequireDefault(_ModelUri);

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
                modelUri = new _ModelUri2.default(model, db);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiL2NvbnRyYWN0LmpzIl0sIm5hbWVzIjpbIkNvbnRyYWN0IiwibW9kZWxVcmlzIiwibW9kZWwiLCJkYiIsInJvdXRlciIsIm1vZGVsVXJpIiwicHVzaCIsIndpcmVSb3V0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0lBRU1BLFE7QUFDSixzQkFBYztBQUFBO0FBQUUsU0FBS0MsU0FBTCxHQUFpQixFQUFqQjtBQUFxQjs7Ozs7NkZBQ2pCQyxLLEVBQU9DLEUsRUFBSUMsTTs7Ozs7O0FBQ3ZCQyx3QixHQUFXLHVCQUFhSCxLQUFiLEVBQW9CQyxFQUFwQixDOztBQUNqQixxQkFBS0YsU0FBTCxDQUFlSyxJQUFmLENBQXFCRCxRQUFyQjs7dUJBQ01BLFNBQVNFLFVBQVQsQ0FBb0JILE1BQXBCLEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQUlLSixRIiwiZmlsZSI6ImRiL2NvbnRyYWN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1vZGVsVXJpIGZyb20gJy4vTW9kZWxVcmknXHJcblxyXG5jbGFzcyBDb250cmFjdCB7XHJcbiAgY29uc3RydWN0b3IoKSB7IHRoaXMubW9kZWxVcmlzID0gW10gfVxyXG4gIGFzeW5jIGFkZENvbGxlY3Rpb24obW9kZWwsIGRiLCByb3V0ZXIpIHtcclxuICAgIGNvbnN0IG1vZGVsVXJpID0gbmV3IE1vZGVsVXJpKG1vZGVsLCBkYilcclxuICAgIHRoaXMubW9kZWxVcmlzLnB1c2goIG1vZGVsVXJpIClcclxuICAgIGF3YWl0IG1vZGVsVXJpLndpcmVSb3V0ZXIocm91dGVyKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ29udHJhY3RcclxuIl19
