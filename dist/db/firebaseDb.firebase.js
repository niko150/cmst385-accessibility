'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_firebase2.default.initializeApp(_config2.default.firebase.initializeConfig);
_firebase2.default.auth().signInWithCustomToken(_config2.default.firebase.authCustomToken);

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
        var path, txrPromise;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                path = pathRef;

                if (pathFinal) path += pathFinal;

                txrPromise = void 0;
                _context.t0 = command;
                _context.next = _context.t0 === 'get' ? 6 : _context.t0 === 'put' ? 8 : _context.t0 === 'patch' ? 10 : _context.t0 === 'post' ? 12 : _context.t0 === 'delete' ? 14 : 16;
                break;

              case 6:
                txrPromise = _firebase2.default.database().ref(path).once('value');
                return _context.abrupt('break', 16);

              case 8:
                txrPromise = _firebase2.default.database().ref(path).set(payload);
                return _context.abrupt('break', 16);

              case 10:
                txrPromise = _firebase2.default.database().ref(path).update(payload);
                return _context.abrupt('break', 16);

              case 12:
                txrPromise = _firebase2.default.database().ref(path).push(payload);
                return _context.abrupt('break', 16);

              case 14:
                txrPromise = _firebase2.default.database().ref(path).remove();
                return _context.abrupt('break', 16);

              case 16:
                _context.next = 18;
                return txrPromise.then(function (snapshot) {
                  return snapshot.val();
                }).catch(function (e) {
                  throw new Error('[FirebaseDb] ' + FirebaseDb.fbcrest[command] + ' - error with firebase. (reason: ' + e.code + '), ' + command + ', ' + path + ', ' + payload + ', ' + (0, _stringify2.default)(queryParams));
                });

              case 18:
                return _context.abrupt('return', _context.sent);

              case 19:
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

exports.default = FirebaseDb;