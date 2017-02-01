"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
	var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
		var resError;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						_context.prev = 0;
						_context.next = 3;
						return next();

					case 3:
						_context.next = 10;
						break;

					case 5:
						_context.prev = 5;
						_context.t0 = _context["catch"](0);
						resError = {
							code: 500,
							message: _context.t0.message,
							errors: _context.t0.errors
						};

						if (_context.t0 instanceof Error) {
							(0, _assign2.default)(resError, { stack: _context.t0.stack });
						}
						(0, _assign2.default)(ctx, { body: resError, status: _context.t0.status || 500 });

					case 10:
					case "end":
						return _context.stop();
				}
			}
		}, _callee, undefined, [[0, 5]]);
	}));

	return function (_x, _x2) {
		return _ref.apply(this, arguments);
	};
}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1pZGRsZXdhcmVzL2hhbmRsZUVycm9ycy9pbmRleC5qcyJdLCJuYW1lcyI6WyJjdHgiLCJuZXh0IiwicmVzRXJyb3IiLCJjb2RlIiwibWVzc2FnZSIsImVycm9ycyIsIkVycm9yIiwic3RhY2siLCJib2R5Iiwic3RhdHVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUVBQWUsaUJBQU9BLEdBQVAsRUFBWUMsSUFBWjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFFUEEsTUFGTzs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBSVBDLGNBSk8sR0FJSTtBQUNoQkMsYUFBTSxHQURVO0FBRWhCQyxnQkFBUyxZQUFFQSxPQUZLO0FBR2hCQyxlQUFRLFlBQUVBO0FBSE0sT0FKSjs7QUFTYixVQUFJLHVCQUFhQyxLQUFqQixFQUF3QjtBQUN2Qiw2QkFBY0osUUFBZCxFQUF3QixFQUFDSyxPQUFPLFlBQUVBLEtBQVYsRUFBeEI7QUFDQTtBQUNELDRCQUFjUCxHQUFkLEVBQW1CLEVBQUNRLE1BQU1OLFFBQVAsRUFBaUJPLFFBQVEsWUFBRUEsTUFBRixJQUFZLEdBQXJDLEVBQW5COztBQVphO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEUiLCJmaWxlIjoibWlkZGxld2FyZXMvaGFuZGxlRXJyb3JzL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgYXN5bmMgKGN0eCwgbmV4dCkgPT4ge1xyXG5cdHRyeSB7XHJcblx0XHRhd2FpdCBuZXh0KCk7XHJcblx0fSBjYXRjaCAoZSkge1xyXG5cdFx0Y29uc3QgcmVzRXJyb3IgPSB7XHJcblx0XHRcdGNvZGU6IDUwMCxcclxuXHRcdFx0bWVzc2FnZTogZS5tZXNzYWdlLFxyXG5cdFx0XHRlcnJvcnM6IGUuZXJyb3JzXHJcblx0XHR9O1xyXG5cdFx0aWYgKGUgaW5zdGFuY2VvZiBFcnJvcikge1xyXG5cdFx0XHRPYmplY3QuYXNzaWduKHJlc0Vycm9yLCB7c3RhY2s6IGUuc3RhY2t9KTtcclxuXHRcdH1cclxuXHRcdE9iamVjdC5hc3NpZ24oY3R4LCB7Ym9keTogcmVzRXJyb3IsIHN0YXR1czogZS5zdGF0dXMgfHwgNTAwfSk7XHJcblx0fVxyXG59Il19
