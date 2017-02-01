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