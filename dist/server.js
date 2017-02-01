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

var _koaJsonwebtokenWithExcept = require('./koa-jsonwebtoken-with-except');

var _koaJsonwebtokenWithExcept2 = _interopRequireDefault(_koaJsonwebtokenWithExcept);

var _koaPass = require('koa-pass');

var _koaPass2 = _interopRequireDefault(_koaPass);

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

var app = new _koa2.default();
//Internal
//External

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
  console.log('loaded serverCredentials: ' + (0, _koaJsonwebtokenWithExcept.sign)(profile, serverCredentials.shared /*, {expiresIn: 1111}*/));

  app.use((0, _koaJsonwebtokenWithExcept2.default)({
    secret: serverCredentials.shared,
    extractToken: _koaJsonwebtokenWithExcept.fromAuthorizationHeader
  })
  //.unless({ path: [/^\/(?!api)/] })
  // .pass([
  // { method: 'GET', path: '/api/Classes' },
  // { path: '^\/(?!api)' }
  // ])
  .except({ method: 'GET', path: /^\/api\/Classes/ }).and({ path: /^\/(?!api)/ }));

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