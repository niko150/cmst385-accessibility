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