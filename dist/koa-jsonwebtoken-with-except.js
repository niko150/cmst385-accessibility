"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (e) {
  function r(n) {
    if (t[n]) return t[n].exports;var o = t[n] = { i: n, l: !1, exports: {} };return e[n].call(o.exports, o, o.exports, r), o.l = !0, o.exports;
  }var t = {};return r.m = e, r.c = t, r.i = function (e) {
    return e;
  }, r.d = function (e, r, t) {
    (0, _defineProperty2.default)(e, r, { configurable: !1, enumerable: !0, get: t });
  }, r.o = function (e, r) {
    return Object.prototype.hasOwnProperty.call(e, r);
  }, r.p = "", r(r.s = 4);
}([function (e, r) {
  e.exports = require("es6-promisify");
}, function (e, r) {
  e.exports = require("jsonwebtoken");
}, function (e, r) {
  e.exports = require("koa-except");
}, function (e, r) {
  e.exports = require("util");
}, function (e, r, t) {
  "use strict";
  function n(e) {
    return function () {
      var r = e.apply(this, arguments);return new _promise2.default(function (e, t) {
        function n(o, i) {
          try {
            var u = r[o](i),
                s = u.value;
          } catch (e) {
            return void t(e);
          }return u.done ? void e(s) : _promise2.default.resolve(s).then(function (e) {
            return n("next", e);
          }, function (e) {
            return n("throw", e);
          });
        }return n("next");
      });
    };
  }var o = t(1),
      i = o && o.__esModule ? function () {
    return o.default;
  } : function () {
    return o;
  };t.d(i, "a", i);var u = t(2),
      s = u && u.__esModule ? function () {
    return u.default;
  } : function () {
    return u;
  };t.d(s, "a", s);var c = t(3),
      f = c && c.__esModule ? function () {
    return c.default;
  } : function () {
    return c;
  };t.d(f, "a", f);var a = t(0),
      d = a && a.__esModule ? function () {
    return a.default;
  } : function () {
    return a;
  };t.d(d, "a", d);var l = d()(o.verify, i.a);t.o(o, "verify") && t.d(r, "verify", function () {
    return o.verify;
  }), t.o(o, "decode") && t.d(r, "decode", function () {
    return o.decode;
  }), t.o(o, "sign") && t.d(r, "sign", function () {
    return o.sign;
  });var h = !0;r.__esModule = h, r.default = function () {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (!e.secret) throw new Error("secret must be specified");if (!e.extractToken || !t.i(c.isFunction)(e.extractToken)) throw new Error("token extraction strategy must be specified and should be a function");if (e.checkRevoked && !t.i(c.isFunction)(e.checkRevoked)) throw new Error("token revokation check must be a function");if (e.doRefresh && !t.i(c.isFunction)(e.doRefresh)) throw new Error("token refresh strategy must be specified and should be a function");
    var secret = e.secret,
        _e$key = e.key,
        key = _e$key === undefined ? "user" : _e$key,
        extractToken = e.extractToken,
        _e$checkRevoked = e.checkRevoked,
        checkRevoked = _e$checkRevoked === undefined ? false : _e$checkRevoked,
        _e$doRefresh = e.doRefresh,
        doRefresh = _e$doRefresh === undefined ? false : _e$doRefresh,
        r = function () {
      var r = n(_regenerator2.default.mark(function _callee(r, t) {
        var _n, _o, _t, _n2, _o2;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _n = extractToken(r, e);
                _context.next = 4;
                return l(_n, secret, e);

              case 4:
                _o = _context.sent;
                _context.t0 = checkRevoked;

                if (!_context.t0) {
                  _context.next = 9;
                  break;
                }

                _context.next = 9;
                return checkRevoked(_o, e);

              case 9:
                r.state = r.state || {};
                r.state[key] = _o;
                _context.next = 36;
                break;

              case 13:
                _context.prev = 13;
                _context.t1 = _context["catch"](0);

                if (!("jwt expired" === _context.t1.message && doRefresh)) {
                  _context.next = 35;
                  break;
                }

                _context.prev = 16;
                _t = p(r, e, !0);
                _n2 = extractToken(r, e);
                _context.next = 21;
                return l(_n2, secret, { ignoreExpiration: !0 });

              case 21:
                _o2 = _context.sent;
                _context.next = 24;
                return doRefresh(r, e, _t, _o2);

              case 24:
                r.state = r.state || {};
                r.state[key] = _o2;
                _context.next = 31;
                break;

              case 28:
                _context.prev = 28;
                _context.t2 = _context["catch"](16);
                r.throw(401, "Invalid token - " + _context.t2.message);

              case 31:
                _context.next = 33;
                return t();

              case 33:
                _context.next = 36;
                break;

              case 35:
                r.throw(401, "Invalid token - " + _context.t1.message);

              case 36:
                _context.next = 38;
                return t();

              case 38:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 13], [16, 28]]);
      }));return function (e, t) {
        return r.apply(this, arguments);
      };
    }();

    return r.except = s.a, r;
  };var p = function p(e, r) {
    var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (t) {
      if (r.refreshCookie && e.cookies.get(r.refreshCookie)) return e.cookies.get(r.refreshCookie);throw new Error("the refresh cookie was not found\n");
    }if (r.cookie && e.cookies.get(r.cookie)) return e.cookies.get(r.cookie);throw new Error("the specified cookie was not found\n");
  };r.fromCookies = p;var w = function w(e, r) {
    if (!e.header || !e.header.authorization) throw new Error("can't find authorization header");var t = e.header.authorization.split(" ");if (2 === t.length) {
      var _e = t[0],
          _r = t[1];if (/^Bearer$/i.test(_e)) return _r;throw new Error("Bad Authorization header format. Format is \"Authorization: Bearer token\"\n");
    }throw new Error("Bad Authorization header format. Format is \"Authorization: Bearer token\"\n");
  };r.fromAuthorizationHeader = w;
}]);
//# sourceMappingURL=./build/index.js.map