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

var _restfulFirebase = require('./restful-firebase');

var _restfulFirebase2 = _interopRequireDefault(_restfulFirebase);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* FirebaseDb is a specific Model Db Firebase object. It receives REST calls
   and converts them to firebase REST calls, executes them on a firebase 
   connection, returning the result or erroring out if there is an error. this
   could be swapped out with a similar one for MongoDB, etc */
var FirebaseDb = function () {
  function FirebaseDb() {
    (0, _classCallCheck3.default)(this, FirebaseDb);
  }

  (0, _createClass3.default)(FirebaseDb, [{
    key: 'tx',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(command, path, payload, queryParams) {
        var dbcmd, unary, operation;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                dbcmd = FirebaseDb.ref[FirebaseDb.fbcrest[command]];
                unary = command === 'get' || commmand === 'delete';
                _context.next = 4;
                return unary ? dbcmd(path, queryParams) : dbcmd(path, payload, queryParams);

              case 4:
                operation = _context.sent;

                if (operation.ok) {
                  _context.next = 7;
                  break;
                }

                throw new Error('[FirebaseDb] ' + FirebaseDb.fbcrest[command] + ' - error with TX. (status ' + operation.status + ': ' + operation.statusText + ')');

              case 7:
                return _context.abrupt('return', operation.body);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function tx(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return tx;
    }()
  }]);
  return FirebaseDb;
}();

FirebaseDb.fbcrest = {
  get: 'get',
  put: 'set',
  patch: 'update',
  post: 'push',
  delete: 'remove'
};
FirebaseDb.db = _restfulFirebase2.default.factory(_config2.default.firebase.project);
FirebaseDb.ref = FirebaseDb.db({
  paths: '/',
  auth: _config2.default.firebase.auth
});

exports.default = FirebaseDb;