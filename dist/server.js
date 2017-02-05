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

var _koaSendfile = require('koa-sendfile');

var _koaSendfile2 = _interopRequireDefault(_koaSendfile);

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

(0, _koaQs2.default)(app); // let's give our app nice query strings

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

var default_route = function () {
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
            ctx.body = _fs2.default.createReadStream('public/index.html');

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function default_route(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

router.get('/', default_route);
router.get(/^\/assets\/(.*)$/, function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx, next) {
    var name, ext;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            name = ctx.params[0];
            ext = name.split('.').slice(-1)[0];
            _context3.t0 = ext;
            _context3.next = _context3.t0 === 'png' ? 5 : _context3.t0 === 'jpg' ? 7 : _context3.t0 === 'jpeg' ? 7 : 9;
            break;

          case 5:
            ctx.type = 'image/png';
            return _context3.abrupt('break', 9);

          case 7:
            ctx.type = 'image/jpeg';
            return _context3.abrupt('break', 9);

          case 9:
            ctx.body = _fs2.default.createReadStream('public/assets/' + ctx.params[0]);

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function (_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}());
router.get(/^\/public\/?(.*)$/, function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(ctx, next) {
    var fspath, fh, stats;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            fspath = ctx.params[0] || 'index.html';
            fh = _config2.default.public + '/' + fspath;
            _context4.next = 4;
            return (0, _koaSendfile2.default)(ctx, fh);

          case 4:
            stats = _context4.sent;

            if (!ctx.status) undefined.throw(404);

          case 6:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function (_x5, _x6) {
    return _ref4.apply(this, arguments);
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
  }).except({ method: 'GET', path: /^\/api\/Classes/ }).and({ path: /^\/api\/error/ }).and({ path: /^\/(?!api)/ }));

  var contract = new _contract2.default();
  contract.addCollection(_Classes2.default, _db2.default, router).then(function () {
    app.use(router.routes());
    app.use(default_route);

    app.listen(_config2.default.port, function () {
      console.info('Listening to http://localhost:' + _config2.default.port);
    });
  }).catch(function (err) {
    return console.error('ERR:', err);
  });
});