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

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FirebaseREST = require('firebase-rest').default;

/* ModelDb is a specific ModelDb Firebase object. It receives REST calls
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
                dbcmd = FirebaseDb.db[FirebaseDb.fbcrest[command]];
                unary = command === 'get' || commmand === 'delete';
                _context.next = 4;
                return unary ? dbcmd(path) : dbcmd(path, payload);

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
FirebaseDb.db = new FirebaseREST.JSONClient('https://' + _config2.default.firebase.project + '.firebaseio.com', { auth: _config2.default.firebase.auth });

exports.default = FirebaseDb;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiL2ZpcmViYXNlRGIuanMiXSwibmFtZXMiOlsiRmlyZWJhc2VSRVNUIiwicmVxdWlyZSIsImRlZmF1bHQiLCJGaXJlYmFzZURiIiwiY29tbWFuZCIsInBhdGgiLCJwYXlsb2FkIiwicXVlcnlQYXJhbXMiLCJkYmNtZCIsImRiIiwiZmJjcmVzdCIsInVuYXJ5IiwiY29tbW1hbmQiLCJvcGVyYXRpb24iLCJvayIsIkVycm9yIiwic3RhdHVzIiwic3RhdHVzVGV4dCIsImJvZHkiLCJnZXQiLCJwdXQiLCJwYXRjaCIsInBvc3QiLCJkZWxldGUiLCJKU09OQ2xpZW50IiwiZmlyZWJhc2UiLCJwcm9qZWN0IiwiYXV0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBOzs7Ozs7QUFEQSxJQUFNQSxlQUFlQyxRQUFRLGVBQVIsRUFBeUJDLE9BQTlDOztBQUdBOzs7O0lBSU1DLFU7QUFDSix3QkFBYztBQUFBO0FBQUU7Ozs7OzZGQUVQQyxPLEVBQVNDLEksRUFBTUMsTyxFQUFTQyxXOzs7Ozs7QUFDekJDLHFCLEdBQVFMLFdBQVdNLEVBQVgsQ0FBY04sV0FBV08sT0FBWCxDQUFtQk4sT0FBbkIsQ0FBZCxDO0FBQ1JPLHFCLEdBQVNQLFlBQVksS0FBWixJQUFxQlEsYUFBYSxROzt1QkFDeEJELFFBQU9ILE1BQU1ILElBQU4sQ0FBUCxHQUFvQkcsTUFBTUgsSUFBTixFQUFZQyxPQUFaLEM7OztBQUF2Q08seUI7O29CQUVGQSxVQUFVQyxFOzs7OztzQkFDTixJQUFJQyxLQUFKLG1CQUEwQlosV0FBV08sT0FBWCxDQUFtQk4sT0FBbkIsQ0FBMUIsa0NBQWtGUyxVQUFVRyxNQUE1RixVQUF1R0gsVUFBVUksVUFBakgsTzs7O2lEQUVESixVQUFVSyxJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUlyQmYsV0FBV08sT0FBWCxHQUFxQjtBQUNuQlMsT0FBSyxLQURjO0FBRW5CQyxPQUFLLEtBRmM7QUFHbkJDLFNBQU8sUUFIWTtBQUluQkMsUUFBTSxNQUphO0FBS25CQyxVQUFRO0FBTFcsQ0FBckI7QUFPQXBCLFdBQVdNLEVBQVgsR0FBZ0IsSUFBSVQsYUFBYXdCLFVBQWpCLENBQ2QsYUFBVyxpQkFBT0MsUUFBUCxDQUFnQkMsT0FBM0IsR0FBbUMsaUJBRHJCLEVBRWQsRUFBRUMsTUFBTSxpQkFBT0YsUUFBUCxDQUFnQkUsSUFBeEIsRUFGYyxDQUFoQjs7a0JBSWV4QixVIiwiZmlsZSI6ImRiL2ZpcmViYXNlRGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBGaXJlYmFzZVJFU1QgPSByZXF1aXJlKCdmaXJlYmFzZS1yZXN0JykuZGVmYXVsdDtcclxuaW1wb3J0IGNvbmZpZyBmcm9tICdjb25maWcnXHJcblxyXG4vKiBNb2RlbERiIGlzIGEgc3BlY2lmaWMgTW9kZWxEYiBGaXJlYmFzZSBvYmplY3QuIEl0IHJlY2VpdmVzIFJFU1QgY2FsbHNcclxuICAgYW5kIGNvbnZlcnRzIHRoZW0gdG8gZmlyZWJhc2UgUkVTVCBjYWxscywgZXhlY3V0ZXMgdGhlbSBvbiBhIGZpcmViYXNlIFxyXG4gICBjb25uZWN0aW9uLCByZXR1cm5pbmcgdGhlIHJlc3VsdCBvciBlcnJvcmluZyBvdXQgaWYgdGhlcmUgaXMgYW4gZXJyb3IuIHRoaXNcclxuICAgY291bGQgYmUgc3dhcHBlZCBvdXQgd2l0aCBhIHNpbWlsYXIgb25lIGZvciBNb25nb0RCLCBldGMgKi9cclxuY2xhc3MgRmlyZWJhc2VEYiB7XHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICBhc3luYyB0eChjb21tYW5kLCBwYXRoLCBwYXlsb2FkLCBxdWVyeVBhcmFtcykge1xyXG4gICAgY29uc3QgZGJjbWQgPSBGaXJlYmFzZURiLmRiW0ZpcmViYXNlRGIuZmJjcmVzdFtjb21tYW5kXV1cclxuICAgIGNvbnN0IHVuYXJ5ID0gKGNvbW1hbmQgPT09ICdnZXQnIHx8IGNvbW1tYW5kID09PSAnZGVsZXRlJylcclxuICAgIGNvbnN0IG9wZXJhdGlvbiA9IGF3YWl0ICh1bmFyeT8gZGJjbWQocGF0aCk6IGRiY21kKHBhdGgsIHBheWxvYWQpKVxyXG5cclxuICAgIGlmKCFvcGVyYXRpb24ub2spXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgW0ZpcmViYXNlRGJdICR7RmlyZWJhc2VEYi5mYmNyZXN0W2NvbW1hbmRdfSAtIGVycm9yIHdpdGggVFguIChzdGF0dXMgJHtvcGVyYXRpb24uc3RhdHVzfTogJHtvcGVyYXRpb24uc3RhdHVzVGV4dH0pYClcclxuXHJcbiAgICByZXR1cm4gb3BlcmF0aW9uLmJvZHlcclxuICB9XHJcblxyXG59XHJcbkZpcmViYXNlRGIuZmJjcmVzdCA9IHtcclxuICBnZXQ6ICdnZXQnLFxyXG4gIHB1dDogJ3NldCcsXHJcbiAgcGF0Y2g6ICd1cGRhdGUnLFxyXG4gIHBvc3Q6ICdwdXNoJyxcclxuICBkZWxldGU6ICdyZW1vdmUnXHJcbn1cclxuRmlyZWJhc2VEYi5kYiA9IG5ldyBGaXJlYmFzZVJFU1QuSlNPTkNsaWVudChcclxuICAnaHR0cHM6Ly8nK2NvbmZpZy5maXJlYmFzZS5wcm9qZWN0KycuZmlyZWJhc2Vpby5jb20nLCBcclxuICB7IGF1dGg6IGNvbmZpZy5maXJlYmFzZS5hdXRoIH0pXHJcblxyXG5leHBvcnQgZGVmYXVsdCBGaXJlYmFzZURiIl19
