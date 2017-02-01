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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1pZGRsZXdhcmVzL2hhbmRsZUVycm9ycy9oYW5kbGVFcnJvcnMuanMiXSwibmFtZXMiOlsiY3R4IiwibmV4dCIsInJlc0Vycm9yIiwiY29kZSIsIm1lc3NhZ2UiLCJlcnJvcnMiLCJFcnJvciIsInN0YWNrIiwiYm9keSIsInN0YXR1cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VFQUFlLGlCQUFPQSxHQUFQLEVBQVlDLElBQVo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBRVBBLE1BRk87O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUlQQyxjQUpPLEdBSUk7QUFDaEJDLGFBQU0sR0FEVTtBQUVoQkMsZ0JBQVMsWUFBRUEsT0FGSztBQUdoQkMsZUFBUSxZQUFFQTtBQUhNLE9BSko7O0FBU2IsVUFBSSx1QkFBYUMsS0FBakIsRUFBd0I7QUFDdkIsNkJBQWNKLFFBQWQsRUFBd0IsRUFBQ0ssT0FBTyxZQUFFQSxLQUFWLEVBQXhCO0FBQ0E7QUFDRCw0QkFBY1AsR0FBZCxFQUFtQixFQUFDUSxNQUFNTixRQUFQLEVBQWlCTyxRQUFRLFlBQUVBLE1BQUYsSUFBWSxHQUFyQyxFQUFuQjs7QUFaYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFIiwiZmlsZSI6Im1pZGRsZXdhcmVzL2hhbmRsZUVycm9ycy9oYW5kbGVFcnJvcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBhc3luYyAoY3R4LCBuZXh0KSA9PiB7XHJcblx0dHJ5IHtcclxuXHRcdGF3YWl0IG5leHQoKTtcclxuXHR9IGNhdGNoIChlKSB7XHJcblx0XHRjb25zdCByZXNFcnJvciA9IHtcclxuXHRcdFx0Y29kZTogNTAwLFxyXG5cdFx0XHRtZXNzYWdlOiBlLm1lc3NhZ2UsXHJcblx0XHRcdGVycm9yczogZS5lcnJvcnNcclxuXHRcdH07XHJcblx0XHRpZiAoZSBpbnN0YW5jZW9mIEVycm9yKSB7XHJcblx0XHRcdE9iamVjdC5hc3NpZ24ocmVzRXJyb3IsIHtzdGFjazogZS5zdGFja30pO1xyXG5cdFx0fVxyXG5cdFx0T2JqZWN0LmFzc2lnbihjdHgsIHtib2R5OiByZXNFcnJvciwgc3RhdHVzOiBlLnN0YXR1cyB8fCA1MDB9KTtcclxuXHR9XHJcbn0iXX0=
