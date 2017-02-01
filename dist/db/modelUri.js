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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Model - uses a generic db object that recieves REST commands and converts 
them for use in the database. It also recieves a models/ type, which describes
the model for the database (a sort of DAO). It also connects the router to its
REST calls. This provides the opportunity to */
var ModelUri = function () {
  function ModelUri(model, db) {
    (0, _classCallCheck3.default)(this, ModelUri);

    this.db = db;
    this.name = model.name;
  }

  (0, _createClass3.default)(ModelUri, [{
    key: 'wireRouter',
    value: function wireRouter(router) {
      var _this = this;

      var allAtName = new RegExp('^\/api\/' + this.name + '(?:\/|$)');
      router.get(allAtName, function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
          return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return _this.get(ctx.path, ctx.query);

                case 2:
                  ctx.body = _context.sent;

                case 3:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
      router.put(allAtName, function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
          return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return _this.put(ctx.path, ctx.request.body, ctx.query);

                case 2:
                  ctx.body = _context2.sent;

                case 3:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this);
        }));

        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
      router.patch(allAtName, function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx, next) {
          return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return _this.patch(ctx.path, ctx.request.body, ctx.query);

                case 2:
                  ctx.body = _context3.sent;

                case 3:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, _this);
        }));

        return function (_x5, _x6) {
          return _ref3.apply(this, arguments);
        };
      }());
      router.post(allAtName, function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(ctx, next) {
          return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return _this.post(ctx.path, ctx.request.body, ctx.query);

                case 2:
                  ctx.body = _context4.sent;

                case 3:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, _this);
        }));

        return function (_x7, _x8) {
          return _ref4.apply(this, arguments);
        };
      }());
      router.delete(allAtName, function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(ctx, next) {
          return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return _this.delete(ctx.path, ctx.query);

                case 2:
                  ctx.body = _context5.sent;

                case 3:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, _this);
        }));

        return function (_x9, _x10) {
          return _ref5.apply(this, arguments);
        };
      }());
    }
  }, {
    key: 'get',
    value: function get(pathFinal, queryParams) {
      return this.db.tx('get', this.name, pathFinal, queryParams);
    }
  }, {
    key: 'put',
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(pathFinal, payload, queryParams) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.db.tx('put', this.name, pathFinal, payload, queryParams);

              case 2:
                return _context6.abrupt('return', _context6.sent);

              case 3:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function put(_x11, _x12, _x13) {
        return _ref6.apply(this, arguments);
      }

      return put;
    }()
  }, {
    key: 'patch',
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(pathFinal, payload, queryParams) {
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return this.db.tx('patch', this.name, pathFinal, payload, queryParams);

              case 2:
                return _context7.abrupt('return', _context7.sent);

              case 3:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function patch(_x14, _x15, _x16) {
        return _ref7.apply(this, arguments);
      }

      return patch;
    }()
  }, {
    key: 'post',
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(pathFinal, payload, queryParams) {
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return this.db.tx('post', this.name, pathFinal, payload, queryParams);

              case 2:
                return _context8.abrupt('return', _context8.sent);

              case 3:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function post(_x17, _x18, _x19) {
        return _ref8.apply(this, arguments);
      }

      return post;
    }()
  }, {
    key: 'delete',
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(pathFinal, queryParams) {
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _context9.next = 2;
                return this.db.tx('delete', this.name, pathFinal, queryParams);

              case 2:
                return _context9.abrupt('return', _context9.sent);

              case 3:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function _delete(_x20, _x21) {
        return _ref9.apply(this, arguments);
      }

      return _delete;
    }()
  }]);
  return ModelUri;
}();

exports.default = ModelUri;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRiL21vZGVsVXJpLmpzIl0sIm5hbWVzIjpbIk1vZGVsVXJpIiwibW9kZWwiLCJkYiIsIm5hbWUiLCJyb3V0ZXIiLCJhbGxBdE5hbWUiLCJSZWdFeHAiLCJnZXQiLCJjdHgiLCJuZXh0IiwicGF0aCIsInF1ZXJ5IiwiYm9keSIsInB1dCIsInJlcXVlc3QiLCJwYXRjaCIsInBvc3QiLCJkZWxldGUiLCJwYXRoRmluYWwiLCJxdWVyeVBhcmFtcyIsInR4IiwicGF5bG9hZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7SUFJTUEsUTtBQUNKLG9CQUFZQyxLQUFaLEVBQW1CQyxFQUFuQixFQUF1QjtBQUFBOztBQUNyQixTQUFLQSxFQUFMLEdBQVVBLEVBQVY7QUFDQSxTQUFLQyxJQUFMLEdBQVlGLE1BQU1FLElBQWxCO0FBQ0Q7Ozs7K0JBRVVDLE0sRUFBUTtBQUFBOztBQUNqQixVQUFNQyxZQUFZLElBQUlDLE1BQUosQ0FBVyxhQUFXLEtBQUtILElBQWhCLEdBQXFCLFVBQWhDLENBQWxCO0FBQ0FDLGFBQU9HLEdBQVAsQ0FBV0YsU0FBWDtBQUFBLDhFQUFzQixpQkFBT0csR0FBUCxFQUFZQyxJQUFaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHlCQUNKLE1BQUtGLEdBQUwsQ0FBU0MsSUFBSUUsSUFBYixFQUFtQkYsSUFBSUcsS0FBdkIsQ0FESTs7QUFBQTtBQUNyQkgsc0JBQUlJLElBRGlCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQXRCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBR0FSLGFBQU9TLEdBQVAsQ0FBV1IsU0FBWDtBQUFBLCtFQUFzQixrQkFBT0csR0FBUCxFQUFZQyxJQUFaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHlCQUNKLE1BQUtJLEdBQUwsQ0FBU0wsSUFBSUUsSUFBYixFQUFtQkYsSUFBSU0sT0FBSixDQUFZRixJQUEvQixFQUFxQ0osSUFBSUcsS0FBekMsQ0FESTs7QUFBQTtBQUNyQkgsc0JBQUlJLElBRGlCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQXRCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBR0FSLGFBQU9XLEtBQVAsQ0FBYVYsU0FBYjtBQUFBLCtFQUF3QixrQkFBT0csR0FBUCxFQUFZQyxJQUFaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHlCQUNOLE1BQUtNLEtBQUwsQ0FBV1AsSUFBSUUsSUFBZixFQUFxQkYsSUFBSU0sT0FBSixDQUFZRixJQUFqQyxFQUF1Q0osSUFBSUcsS0FBM0MsQ0FETTs7QUFBQTtBQUN2Qkgsc0JBQUlJLElBRG1COztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQXhCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBR0FSLGFBQU9ZLElBQVAsQ0FBWVgsU0FBWjtBQUFBLCtFQUF1QixrQkFBT0csR0FBUCxFQUFZQyxJQUFaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHlCQUNMLE1BQUtPLElBQUwsQ0FBVVIsSUFBSUUsSUFBZCxFQUFvQkYsSUFBSU0sT0FBSixDQUFZRixJQUFoQyxFQUFzQ0osSUFBSUcsS0FBMUMsQ0FESzs7QUFBQTtBQUN0Qkgsc0JBQUlJLElBRGtCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQXZCOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBR0FSLGFBQU9hLE1BQVAsQ0FBY1osU0FBZDtBQUFBLCtFQUF5QixrQkFBT0csR0FBUCxFQUFZQyxJQUFaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHlCQUNQLE1BQUtRLE1BQUwsQ0FBWVQsSUFBSUUsSUFBaEIsRUFBc0JGLElBQUlHLEtBQTFCLENBRE87O0FBQUE7QUFDeEJILHNCQUFJSSxJQURvQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUF6Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUdEOzs7d0JBRUdNLFMsRUFBV0MsVyxFQUFZO0FBQ3pCLGFBQU8sS0FBS2pCLEVBQUwsQ0FBUWtCLEVBQVIsQ0FBVyxLQUFYLEVBQWtCLEtBQUtqQixJQUF2QixFQUE2QmUsU0FBN0IsRUFBd0NDLFdBQXhDLENBQVA7QUFDRDs7OzsrRkFDU0QsUyxFQUFXRyxPLEVBQVNGLFc7Ozs7Ozt1QkFDZixLQUFLakIsRUFBTCxDQUFRa0IsRUFBUixDQUFXLEtBQVgsRUFBa0IsS0FBS2pCLElBQXZCLEVBQTZCZSxTQUE3QixFQUF3Q0csT0FBeEMsRUFBaURGLFdBQWpELEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0ZBRUhELFMsRUFBV0csTyxFQUFTRixXOzs7Ozs7dUJBQ2pCLEtBQUtqQixFQUFMLENBQVFrQixFQUFSLENBQVcsT0FBWCxFQUFvQixLQUFLakIsSUFBekIsRUFBK0JlLFNBQS9CLEVBQTBDRyxPQUExQyxFQUFtREYsV0FBbkQsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzsrRkFFSkQsUyxFQUFXRyxPLEVBQVNGLFc7Ozs7Ozt1QkFDaEIsS0FBS2pCLEVBQUwsQ0FBUWtCLEVBQVIsQ0FBVyxNQUFYLEVBQW1CLEtBQUtqQixJQUF4QixFQUE4QmUsU0FBOUIsRUFBeUNHLE9BQXpDLEVBQWtERixXQUFsRCxDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OytGQUVGRCxTLEVBQVdDLFc7Ozs7Ozt1QkFDVCxLQUFLakIsRUFBTCxDQUFRa0IsRUFBUixDQUFXLFFBQVgsRUFBcUIsS0FBS2pCLElBQTFCLEVBQWdDZSxTQUFoQyxFQUEyQ0MsV0FBM0MsQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBSUZuQixRIiwiZmlsZSI6ImRiL21vZGVsVXJpLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogTW9kZWwgLSB1c2VzIGEgZ2VuZXJpYyBkYiBvYmplY3QgdGhhdCByZWNpZXZlcyBSRVNUIGNvbW1hbmRzIGFuZCBjb252ZXJ0cyBcclxudGhlbSBmb3IgdXNlIGluIHRoZSBkYXRhYmFzZS4gSXQgYWxzbyByZWNpZXZlcyBhIG1vZGVscy8gdHlwZSwgd2hpY2ggZGVzY3JpYmVzXHJcbnRoZSBtb2RlbCBmb3IgdGhlIGRhdGFiYXNlIChhIHNvcnQgb2YgREFPKS4gSXQgYWxzbyBjb25uZWN0cyB0aGUgcm91dGVyIHRvIGl0c1xyXG5SRVNUIGNhbGxzLiBUaGlzIHByb3ZpZGVzIHRoZSBvcHBvcnR1bml0eSB0byAqL1xyXG5jbGFzcyBNb2RlbFVyaSB7XHJcbiAgY29uc3RydWN0b3IobW9kZWwsIGRiKSB7XHJcbiAgICB0aGlzLmRiID0gZGJcclxuICAgIHRoaXMubmFtZSA9IG1vZGVsLm5hbWVcclxuICB9XHJcblxyXG4gIHdpcmVSb3V0ZXIocm91dGVyKSB7XHJcbiAgICBjb25zdCBhbGxBdE5hbWUgPSBuZXcgUmVnRXhwKCdeXFwvYXBpXFwvJyt0aGlzLm5hbWUrJyg/OlxcL3wkKScpXHJcbiAgICByb3V0ZXIuZ2V0KGFsbEF0TmFtZSwgYXN5bmMgKGN0eCwgbmV4dCkgPT4ge1xyXG5cdCAgICBjdHguYm9keSA9IGF3YWl0IHRoaXMuZ2V0KGN0eC5wYXRoLCBjdHgucXVlcnkpXHJcbiAgICB9KVxyXG4gICAgcm91dGVyLnB1dChhbGxBdE5hbWUsIGFzeW5jIChjdHgsIG5leHQpID0+IHtcclxuXHQgICAgY3R4LmJvZHkgPSBhd2FpdCB0aGlzLnB1dChjdHgucGF0aCwgY3R4LnJlcXVlc3QuYm9keSwgY3R4LnF1ZXJ5KVxyXG4gICAgfSlcclxuICAgIHJvdXRlci5wYXRjaChhbGxBdE5hbWUsIGFzeW5jIChjdHgsIG5leHQpID0+IHtcclxuXHQgICAgY3R4LmJvZHkgPSBhd2FpdCB0aGlzLnBhdGNoKGN0eC5wYXRoLCBjdHgucmVxdWVzdC5ib2R5LCBjdHgucXVlcnkpXHJcbiAgICB9KVxyXG4gICAgcm91dGVyLnBvc3QoYWxsQXROYW1lLCBhc3luYyAoY3R4LCBuZXh0KSA9PiB7XHJcblx0ICAgIGN0eC5ib2R5ID0gYXdhaXQgdGhpcy5wb3N0KGN0eC5wYXRoLCBjdHgucmVxdWVzdC5ib2R5LCBjdHgucXVlcnkpXHJcbiAgICB9KVxyXG4gICAgcm91dGVyLmRlbGV0ZShhbGxBdE5hbWUsIGFzeW5jIChjdHgsIG5leHQpID0+IHtcclxuXHQgICAgY3R4LmJvZHkgPSBhd2FpdCB0aGlzLmRlbGV0ZShjdHgucGF0aCwgY3R4LnF1ZXJ5KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGdldChwYXRoRmluYWwsIHF1ZXJ5UGFyYW1zKXtcclxuICAgIHJldHVybiB0aGlzLmRiLnR4KCdnZXQnLCB0aGlzLm5hbWUsIHBhdGhGaW5hbCwgcXVlcnlQYXJhbXMpXHJcbiAgfVxyXG4gIGFzeW5jIHB1dChwYXRoRmluYWwsIHBheWxvYWQsIHF1ZXJ5UGFyYW1zKXtcclxuICAgIHJldHVybiBhd2FpdCB0aGlzLmRiLnR4KCdwdXQnLCB0aGlzLm5hbWUsIHBhdGhGaW5hbCwgcGF5bG9hZCwgcXVlcnlQYXJhbXMpICAgIFxyXG4gIH1cclxuICBhc3luYyBwYXRjaChwYXRoRmluYWwsIHBheWxvYWQsIHF1ZXJ5UGFyYW1zKXtcclxuICAgIHJldHVybiBhd2FpdCB0aGlzLmRiLnR4KCdwYXRjaCcsIHRoaXMubmFtZSwgcGF0aEZpbmFsLCBwYXlsb2FkLCBxdWVyeVBhcmFtcylcclxuICB9XHJcbiAgYXN5bmMgcG9zdChwYXRoRmluYWwsIHBheWxvYWQgLHF1ZXJ5UGFyYW1zKXtcclxuICAgIHJldHVybiBhd2FpdCB0aGlzLmRiLnR4KCdwb3N0JywgdGhpcy5uYW1lLCBwYXRoRmluYWwsIHBheWxvYWQsIHF1ZXJ5UGFyYW1zKVxyXG4gIH1cclxuICBhc3luYyBkZWxldGUocGF0aEZpbmFsLCBxdWVyeVBhcmFtcyl7XHJcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5kYi50eCgnZGVsZXRlJywgdGhpcy5uYW1lLCBwYXRoRmluYWwsIHF1ZXJ5UGFyYW1zKVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW9kZWxVcmkiXX0=
