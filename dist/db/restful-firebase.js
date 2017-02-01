'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TIMEOUT = 5000;
var baseRequest = _request2.default.defaults({ timeout: TIMEOUT, json: true });
var VALID_ID = /^[-0-9a-zA-Z]{2,}$/;
var VALID_URL = /^https?:\/\/[\da-z\.-]+(\:\d+)?\/?$/;
var ERR_INVALID_ID = 'Invalid Firebase id.';
var ERR_NO_SECRET = 'A Firebase secret is required for this operation.';

var ResponseError = function (_Error) {
  (0, _inherits3.default)(ResponseError, _Error);

  function ResponseError(opts, resp, body) {
    (0, _classCallCheck3.default)(this, ResponseError);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ResponseError.__proto__ || (0, _getPrototypeOf2.default)(ResponseError)).call(this, resp.statusMessage));

    _this.name = 'ResponseError';

    _this.url = opts.url;
    _this.method = opts.method;
    _this.status = resp.statusCode;
    _this.authDebug = resp.headers['x-firebase-auth-debug'];
    _this.body = body;
    return _this;
  }

  return ResponseError;
}(Error);

var Request = function () {
  function Request(opts) {
    (0, _classCallCheck3.default)(this, Request);

    this.rootPath = trimPath(opts.rootPath);
    this.url = opts.url;
    this.auth = opts.auth;
    this.$logger = opts.logger || console;
  }

  (0, _createClass3.default)(Request, [{
    key: 'toString',
    value: function toString() {
      return Request.fixUrl(this.url);
    }
  }, {
    key: 'process',
    value: function process(url, method, qs, payload) {
      var _this2 = this;

      return new _promise2.default(function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(resolve, reject) {
          var opts;
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  opts = {
                    url: Request.fixUrl(url),
                    method: method,
                    qs: (0, _assign2.default)({ auth: _this2.auth }, qs)
                  };


                  if (payload !== undefined) {
                    opts.body = payload;
                  }

                  baseRequest(opts, function (err, resp, body) {
                    if (err) {
                      reject(err);
                      return;
                    }

                    var debugMessage = resp.headers['x-firebase-auth-debug'];

                    if (debugMessage) {
                      _this2.$logger.warn(debugMessage);
                    }

                    if (resp.statusCode >= 300) {
                      reject(new ResponseError(opts, resp, body));
                      return;
                    }

                    resolve(body);
                  });

                case 3:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this2);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: 'rules',
    value: function rules(_rules) {
      if (!this.auth) {
        return _promise2.default.reject(new Error(ERR_NO_SECRET));
      }

      var opts = {
        'method': 'GET',
        'url': this.rootPath + '/.settings/rules.json',
        'qs': { auth: this.auth }
      };

      return new _promise2.default(function (resolve, reject) {
        if (_rules) {
          opts.method = 'PUT';
          opts.body = _rules;
          opts.json = (typeof _rules === 'undefined' ? 'undefined' : (0, _typeof3.default)(_rules)) === 'object';
        }

        (0, _request2.default)(opts, function (err, resp, body) {
          if (err) {
            reject(err);
            return;
          }

          if (resp.statusCode >= 300) {
            reject(new ResponseError(opts, resp, body));
            return;
          }

          resolve(body);
        });
      });
    }
  }, {
    key: 'get',
    value: function get(path, qs) {
      var url = this.url;
      if (path) url += '/' + path;
      return this.process(url, 'GET', qs);
    }
  }, {
    key: 'set',
    value: function set(path, payload, qs) {
      var url = this.url;
      if (path) url += '/' + path;
      return this.process(url, 'PUT', qs, payload);
    }
  }, {
    key: 'update',
    value: function update(path, payload, qs) {
      var url = this.url;
      if (path) url += '/' + path;

      if (url.endsWith('/.json')) {
        // no-op
      } else if (url.endsWith('.json')) {
        url = url.slice(0, -5) + '/.json';
      } else if (url.endsWith('/')) {
        url = url + '.json';
      } else {
        url = url + '/.json';
      }

      return this.process(url, 'PATCH', qs, payload);
    }
  }, {
    key: 'push',
    value: function push(path, patch, qs) {
      var url = this.url;
      if (path) url += '/' + path;
      return this.process(url, 'POST', qs, patch);
    }
  }, {
    key: 'remove',
    value: function remove(path, qs) {
      var url = this.url;
      if (path) url += '/' + path;
      return this.process(url, 'DELETE', qs);
    }
  }], [{
    key: 'fixUrl',
    value: function fixUrl(url) {
      return url.endsWith('.json') ? url : url + '.json';
    }
  }]);
  return Request;
}();

function trimPath(path) {
  return path.replace(/\/+$/, '');
}

/**
 * Create a firebase rest client factory.
 *
 * The clients will be bound to a firebase ID. You then can use relative path
 * to create references to entities in your Firebase DB.
 *
 * Usage:
 *
 *    const restFirebase = require('rest-firebase');
 *    const firebase = restFirebase.factory('some-id');
 *    const ref = firebase({paths: 'some/path', auth: 'some-oauth-token'});
 *
 *    // you can pass parameters
 *    // (see https://www.firebase.com/docs/rest/api/#section-query-parameters)
 *    ref.get({shallow: true}).then(value => {
 *        // ...
 *    });
 *
 * @param  {string}   target Firebase ID or URL
 * @return {function}
 *
 */
function restFirebaseFactory(target) {
  var rootPath = void 0;

  if (VALID_URL.test(target)) {
    rootPath = trimPath(target);
  } else if (VALID_ID.test(target)) {
    rootPath = 'https://' + target + '.firebaseio.com';
  } else {
    throw new Error(ERR_INVALID_ID);
  }

  function restFirebase(opts) {
    var relPaths = opts && opts.paths || '';
    var url = [rootPath].concat(relPaths).join('/');

    return new Request((0, _assign2.default)({}, opts, { rootPath: rootPath, url: url }));
  }

  return restFirebase;
}

exports.Request = Request;
exports.factory = restFirebaseFactory;