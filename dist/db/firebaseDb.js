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

var _firebaseRest = require('firebase-rest');

var _firebaseRest2 = _interopRequireDefault(_firebaseRest);

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
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(command, pathRef, pathFinal, payload, queryParams) {
        var path,
            dbcmd,
            unary,
            operation,
            _args = arguments;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log(_args);
                path = pathRef;

                if (pathFinal) path += '/' + pathFinal;

                dbcmd = FirebaseDb.db[FirebaseDb.fbcrest[command]].bind(FirebaseDb.db);
                unary = command === 'get' || command === 'delete';
                _context.next = 7;
                return unary ? dbcmd(path, queryParams) : dbcmd(path, payload, queryParams);

              case 7:
                operation = _context.sent;

                if (operation.ok) {
                  _context.next = 10;
                  break;
                }

                throw new Error('[FirebaseDb] ' + FirebaseDb.fbcrest[command] + ' - error with TX. (status ' + operation.status + ': ' + operation.statusText + ')');

              case 10:
                return _context.abrupt('return', operation.body);

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function tx(_x, _x2, _x3, _x4, _x5) {
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
FirebaseDb.db = new _firebaseRest2.default.JSONClient('https://' + _config2.default.firebase.project + '.firebaseio.com', { auth: _config2.default.firebase.auth });

exports.default = FirebaseDb;