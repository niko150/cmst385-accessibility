'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _koa = require('koa');

var _koa2 = _interopRequireDefault(_koa);

var _koaRouter = require('koa-router');

var _koaRouter2 = _interopRequireDefault(_koaRouter);

var _koaBodyparser = require('koa-bodyparser');

var _koaBodyparser2 = _interopRequireDefault(_koaBodyparser);

var _koaQs = require('koa-qs');

var _koaQs2 = _interopRequireDefault(_koaQs);

var _koaJsonwebtoken = require('koa-jsonwebtoken');

var _koaJsonwebtoken2 = _interopRequireDefault(_koaJsonwebtoken);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _handleErrors = require('./middlewares/handleErrors');

var _handleErrors2 = _interopRequireDefault(_handleErrors);

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _contract = require('./db/contract');

var _contract2 = _interopRequireDefault(_contract);

var _Classes = require('./db/models/Classes');

var _Classes2 = _interopRequireDefault(_Classes);

var _auth = require('./auth');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//External
var app = new _koa2.default();
//Internal

(0, _koaQs2.default)(app);

app.use(_handleErrors2.default);
app.use((0, _koaBodyparser2.default)());

var router = new _koaRouter2.default();
router.get('/api/error', (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
  return _regenerator2.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          throw Error('Error handling works!');

        case 1:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
})));
router.get('/', function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!/^\/api/.test(ctx.url)) {
              _context2.next = 2;
              break;
            }

            return _context2.abrupt('return', next());

          case 2:
            ctx.type = 'html';
            ctx.body = _fs2.default.createReadStream('views/index.html');

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}());

_auth.serverCredentials.then(function (serverCredentials) {
  var profile = {
    id: 1 // we're just making a dummy profile to connect with
  };
  console.log('loaded serverCredentials: ' + (0, _koaJsonwebtoken.sign)(profile, serverCredentials.shared /*, {expiresIn: 1111}*/));
  app.use((0, _koaJsonwebtoken2.default)({
    secret: serverCredentials.shared,
    extractToken: _koaJsonwebtoken.fromAuthorizationHeader
  }).unless({ path: [/^\/(?!api)/] }));

  var contract = new _contract2.default();
  contract.addCollection(_Classes2.default, _db2.default, router).then(function () {
    app.use(router.routes());

    app.listen(_config2.default.port, function () {
      console.info('Listening to http://localhost:' + _config2.default.port);
    });
  }).catch(function (err) {
    return console.error('ERR:', err);
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZlci5qcyJdLCJuYW1lcyI6WyJhcHAiLCJ1c2UiLCJyb3V0ZXIiLCJnZXQiLCJFcnJvciIsImN0eCIsIm5leHQiLCJ0ZXN0IiwidXJsIiwidHlwZSIsImJvZHkiLCJjcmVhdGVSZWFkU3RyZWFtIiwidGhlbiIsInByb2ZpbGUiLCJpZCIsImNvbnNvbGUiLCJsb2ciLCJzZXJ2ZXJDcmVkZW50aWFscyIsInNoYXJlZCIsInNlY3JldCIsImV4dHJhY3RUb2tlbiIsInVubGVzcyIsInBhdGgiLCJjb250cmFjdCIsImFkZENvbGxlY3Rpb24iLCJyb3V0ZXMiLCJsaXN0ZW4iLCJwb3J0IiwiaW5mbyIsImNhdGNoIiwiZXJyIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFiQTtBQWVBLElBQU1BLE1BQU0sbUJBQVo7QUFQQTs7QUFRQSxxQkFBR0EsR0FBSDs7QUFFQUEsSUFBSUMsR0FBSjtBQUNBRCxJQUFJQyxHQUFKLENBQVEsOEJBQVI7O0FBRUEsSUFBTUMsU0FBUyx5QkFBZjtBQUNBQSxPQUFPQyxHQUFQLENBQVcsWUFBWCw2REFBeUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGdCQUNqQkMsTUFBTSx1QkFBTixDQURpQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxDQUF6QjtBQUdBRixPQUFPQyxHQUFQLENBQVcsR0FBWDtBQUFBLHlFQUFnQixrQkFBT0UsR0FBUCxFQUFZQyxJQUFaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxpQkFDVixTQUFTQyxJQUFULENBQWNGLElBQUlHLEdBQWxCLENBRFU7QUFBQTtBQUFBO0FBQUE7O0FBQUEsOENBRUxGLE1BRks7O0FBQUE7QUFHZEQsZ0JBQUlJLElBQUosR0FBVyxNQUFYO0FBQ0FKLGdCQUFJSyxJQUFKLEdBQVcsYUFBR0MsZ0JBQUgsQ0FBb0Isa0JBQXBCLENBQVg7O0FBSmM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBaEI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBT0Esd0JBQW1CQyxJQUFuQixDQUF3Qiw2QkFBcUI7QUFDM0MsTUFBTUMsVUFBVTtBQUNkQyxRQUFJLENBRFUsQ0FDUjtBQURRLEdBQWhCO0FBR0FDLFVBQVFDLEdBQVIsQ0FBWSwrQkFDViwyQkFBS0gsT0FBTCxFQUFjSSxrQkFBa0JDLE1BQWhDLENBQXNDLHVCQUF0QyxDQURGO0FBRUFsQixNQUFJQyxHQUFKLENBQ0UsK0JBQUk7QUFDRmtCLFlBQVFGLGtCQUFrQkMsTUFEeEI7QUFFRkU7QUFGRSxHQUFKLEVBSUNDLE1BSkQsQ0FJUSxFQUFFQyxNQUFNLENBQUMsWUFBRCxDQUFSLEVBSlIsQ0FERjs7QUFRQSxNQUFNQyxXQUFXLHdCQUFqQjtBQUNBQSxXQUFTQyxhQUFULGtDQUFvQ3RCLE1BQXBDLEVBQTRDVSxJQUE1QyxDQUFpRCxZQUFNO0FBQ3JEWixRQUFJQyxHQUFKLENBQVFDLE9BQU91QixNQUFQLEVBQVI7O0FBRUF6QixRQUFJMEIsTUFBSixDQUFXLGlCQUFPQyxJQUFsQixFQUF3QixZQUFNO0FBQzVCWixjQUFRYSxJQUFSLG9DQUE4QyxpQkFBT0QsSUFBckQ7QUFDRCxLQUZEO0FBR0QsR0FORCxFQU1HRSxLQU5ILENBTVMsVUFBQ0MsR0FBRDtBQUFBLFdBQVNmLFFBQVFnQixLQUFSLENBQWMsTUFBZCxFQUFzQkQsR0FBdEIsQ0FBVDtBQUFBLEdBTlQ7QUFRRCxDQXZCRCIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvL0V4dGVybmFsXHJcbmltcG9ydCBLb2EgZnJvbSAna29hJ1xyXG5pbXBvcnQgUm91dGVyIGZyb20gJ2tvYS1yb3V0ZXInXHJcbmltcG9ydCBib2R5UGFyc2VyIGZyb20gJ2tvYS1ib2R5cGFyc2VyJ1xyXG5pbXBvcnQgUXMgZnJvbSAna29hLXFzJ1xyXG5pbXBvcnQgand0LCB7IGZyb21BdXRob3JpemF0aW9uSGVhZGVyLCBzaWduIH0gZnJvbSAna29hLWpzb253ZWJ0b2tlbic7XHJcbmltcG9ydCBjb25maWcgZnJvbSAnY29uZmlnJ1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnXHJcbi8vSW50ZXJuYWxcclxuaW1wb3J0IGhhbmRsZUVycm9ycyBmcm9tICcuL21pZGRsZXdhcmVzL2hhbmRsZUVycm9ycydcclxuaW1wb3J0IGRiIGZyb20gJy4vZGInXHJcbmltcG9ydCBDb250cmFjdCBmcm9tICcuL2RiL2NvbnRyYWN0J1xyXG5pbXBvcnQgQ2xhc3NlcyBmcm9tICcuL2RiL21vZGVscy9DbGFzc2VzJ1xyXG5pbXBvcnQge3NlcnZlckNyZWRlbnRpYWxzIGFzIGNyZWRlbnRpYWxzUHJvbWlzZX0gZnJvbSAnLi9hdXRoJ1xyXG4gXHJcbmNvbnN0IGFwcCA9IG5ldyBLb2EoKVxyXG5RcyhhcHApXHJcbiBcclxuYXBwLnVzZShoYW5kbGVFcnJvcnMpXHJcbmFwcC51c2UoYm9keVBhcnNlcigpKVxyXG5cclxuY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlcigpXHJcbnJvdXRlci5nZXQoJy9hcGkvZXJyb3InLCBhc3luYyAoKSA9PiB7XHJcbiAgdGhyb3cgRXJyb3IoJ0Vycm9yIGhhbmRsaW5nIHdvcmtzIScpXHJcbn0pXHJcbnJvdXRlci5nZXQoJy8nLCBhc3luYyAoY3R4LCBuZXh0KSA9PiB7XHJcbiAgaWYgKC9eXFwvYXBpLy50ZXN0KGN0eC51cmwpKSBcclxuICAgIHJldHVybiBuZXh0KClcclxuICBjdHgudHlwZSA9ICdodG1sJ1xyXG4gIGN0eC5ib2R5ID0gZnMuY3JlYXRlUmVhZFN0cmVhbSgndmlld3MvaW5kZXguaHRtbCcpXHJcbn0pXHJcblxyXG5jcmVkZW50aWFsc1Byb21pc2UudGhlbihzZXJ2ZXJDcmVkZW50aWFscyA9PiB7XHJcbiAgY29uc3QgcHJvZmlsZSA9IHtcclxuICAgIGlkOiAxIC8vIHdlJ3JlIGp1c3QgbWFraW5nIGEgZHVtbXkgcHJvZmlsZSB0byBjb25uZWN0IHdpdGhcclxuICB9XHJcbiAgY29uc29sZS5sb2coJ2xvYWRlZCBzZXJ2ZXJDcmVkZW50aWFsczogJyArIFxyXG4gICAgc2lnbihwcm9maWxlLCBzZXJ2ZXJDcmVkZW50aWFscy5zaGFyZWQvKiwge2V4cGlyZXNJbjogMTExMX0qLykpICAgIFxyXG4gIGFwcC51c2UoXHJcbiAgICBqd3Qoe1xyXG4gICAgICBzZWNyZXQ6IHNlcnZlckNyZWRlbnRpYWxzLnNoYXJlZCwgXHJcbiAgICAgIGV4dHJhY3RUb2tlbjogZnJvbUF1dGhvcml6YXRpb25IZWFkZXJcclxuICAgIH0pXHJcbiAgICAudW5sZXNzKHsgcGF0aDogWy9eXFwvKD8hYXBpKS9dIH0pXHJcbiAgKTtcclxuXHJcbiAgY29uc3QgY29udHJhY3QgPSBuZXcgQ29udHJhY3QoKVxyXG4gIGNvbnRyYWN0LmFkZENvbGxlY3Rpb24oQ2xhc3NlcywgZGIsIHJvdXRlcikudGhlbigoKSA9PiB7XHJcbiAgICBhcHAudXNlKHJvdXRlci5yb3V0ZXMoKSlcclxuXHJcbiAgICBhcHAubGlzdGVuKGNvbmZpZy5wb3J0LCAoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuaW5mbyhgTGlzdGVuaW5nIHRvIGh0dHA6Ly9sb2NhbGhvc3Q6JHtjb25maWcucG9ydH1gKVxyXG4gICAgfSlcclxuICB9KS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKCdFUlI6JywgZXJyKSlcclxuXHJcbn0pIl19
