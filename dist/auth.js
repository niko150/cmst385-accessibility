'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serverCredentials = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _thenYield = require('then-yield');

var _thenYield2 = _interopRequireDefault(_thenYield);

var _md = require('md5');

var _md2 = _interopRequireDefault(_md);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = _bluebird2.default.promisifyAll(require('fs'));

var serverCredentials = _thenYield2.default.spawn(_regenerator2.default.mark(function _callee() {
  var src;
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          src = void 0;
          _context.prev = 1;
          _context.next = 4;
          return fs.readFileAsync('./serverCredentials.json', 'utf8');

        case 4:
          src = _context.sent;
          _context.next = 11;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context['catch'](1);

          console.error('Error when opening serverCredentials file: ' + _context.t0.message);
          throw _context.t0;

        case 11:
          return _context.abrupt('return', JSON.parse(src));

        case 12:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, this, [[1, 7]]);
}));

exports.serverCredentials = serverCredentials;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1dGguanMiXSwibmFtZXMiOlsiZnMiLCJwcm9taXNpZnlBbGwiLCJyZXF1aXJlIiwic2VydmVyQ3JlZGVudGlhbHMiLCJzcGF3biIsInNyYyIsInJlYWRGaWxlQXN5bmMiLCJjb25zb2xlIiwiZXJyb3IiLCJtZXNzYWdlIiwiSlNPTiIsInBhcnNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBQ0EsSUFBTUEsS0FBSyxtQkFBUUMsWUFBUixDQUFxQkMsUUFBUSxJQUFSLENBQXJCLENBQVg7O0FBRUEsSUFBTUMsb0JBQW9CLG9CQUFHQyxLQUFILDRCQUFTO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUM3QkMsYUFENkI7QUFBQTtBQUFBO0FBQUEsaUJBR25CTCxHQUFHTSxhQUFILENBQWlCLDBCQUFqQixFQUE0QyxNQUE1QyxDQUhtQjs7QUFBQTtBQUcvQkQsYUFIK0I7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFLL0JFLGtCQUFRQyxLQUFSLENBQWMsZ0RBQWdELFlBQUVDLE9BQWhFO0FBTCtCOztBQUFBO0FBQUEsMkNBUTFCQyxLQUFLQyxLQUFMLENBQVdOLEdBQVgsQ0FSMEI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBVCxFQUExQjs7UUFXUUYsaUIsR0FBQUEsaUIiLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eSBmcm9tICd0aGVuLXlpZWxkJ1xyXG5pbXBvcnQgbWQ1IGZyb20gJ21kNSdcclxuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnXHJcbmNvbnN0IGZzID0gUHJvbWlzZS5wcm9taXNpZnlBbGwocmVxdWlyZSgnZnMnKSk7XHJcblxyXG5jb25zdCBzZXJ2ZXJDcmVkZW50aWFscyA9IHR5LnNwYXduKGZ1bmN0aW9uKiAoKSB7XHJcbiAgbGV0IHNyY1xyXG4gIHRyeSB7XHJcbiAgICBzcmMgPSB5aWVsZCBmcy5yZWFkRmlsZUFzeW5jKCcuL3NlcnZlckNyZWRlbnRpYWxzLmpzb24nLCd1dGY4JylcclxuICB9IGNhdGNoKGUpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHdoZW4gb3BlbmluZyBzZXJ2ZXJDcmVkZW50aWFscyBmaWxlOiAnICsgZS5tZXNzYWdlKTtcclxuICAgIHRocm93IGVcclxuICB9XHJcbiAgcmV0dXJuIEpTT04ucGFyc2Uoc3JjKVxyXG59KVxyXG5cclxuZXhwb3J0IHtzZXJ2ZXJDcmVkZW50aWFsc30iXX0=
