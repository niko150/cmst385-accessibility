(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var Vue // late bind
var map = window.__VUE_HOT_MAP__ = Object.create(null)
var installed = false
var isBrowserify = false
var initHookName = 'beforeCreate'

exports.install = function (vue, browserify) {
  if (installed) return
  installed = true

  Vue = vue
  isBrowserify = browserify

  // compat with < 2.0.0-alpha.7
  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {
    initHookName = 'init'
  }

  exports.compatible = Number(Vue.version.split('.')[0]) >= 2
  if (!exports.compatible) {
    console.warn(
      '[HMR] You are using a version of vue-hot-reload-api that is ' +
      'only compatible with Vue.js core ^2.0.0.'
    )
    return
  }
}

/**
 * Create a record for a hot module, which keeps track of its constructor
 * and instances
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  var Ctor = null
  if (typeof options === 'function') {
    Ctor = options
    options = Ctor.options
  }
  makeOptionsHot(id, options)
  map[id] = {
    Ctor: Vue.extend(options),
    instances: []
  }
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot (id, options) {
  injectHook(options, initHookName, function () {
    map[id].instances.push(this)
  })
  injectHook(options, 'beforeDestroy', function () {
    var instances = map[id].instances
    instances.splice(instances.indexOf(this), 1)
  })
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook (options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing)
      ? existing.concat(hook)
      : [existing, hook]
    : [hook]
}

function tryWrap (fn) {
  return function (id, arg) {
    try { fn(id, arg) } catch (e) {
      console.error(e)
      console.warn('Something went wrong during Vue component hot-reload. Full reload required.')
    }
  }
}

exports.rerender = tryWrap(function (id, options) {
  var record = map[id]
  if (typeof options === 'function') {
    options = options.options
  }
  record.Ctor.options.render = options.render
  record.Ctor.options.staticRenderFns = options.staticRenderFns
  record.instances.slice().forEach(function (instance) {
    instance.$options.render = options.render
    instance.$options.staticRenderFns = options.staticRenderFns
    instance._staticTrees = [] // reset static trees
    instance.$forceUpdate()
  })
})

exports.reload = tryWrap(function (id, options) {
  if (typeof options === 'function') {
    options = options.options
  }
  makeOptionsHot(id, options)
  var record = map[id]
  record.Ctor.extendOptions = options
  var newCtor = Vue.extend(options)
  record.Ctor.options = newCtor.options
  record.Ctor.cid = newCtor.cid
  if (newCtor.release) {
    // temporary global mixin strategy used in < 2.0.0-alpha.6
    newCtor.release()
  }
  record.instances.slice().forEach(function (instance) {
    if (instance.$vnode && instance.$vnode.context) {
      instance.$vnode.context.$forceUpdate()
    } else {
      console.warn('Root or manually mounted instance modified. Full reload required.')
    }
  })
})

},{}],3:[function(require,module,exports){
/*!
 * vue-resource v1.1.2
 * https://github.com/vuejs/vue-resource
 * Released under the MIT License.
 */

'use strict';

/**
 * Promises/A+ polyfill v1.1.4 (https://github.com/bramstein/promis)
 */

var RESOLVED = 0;
var REJECTED = 1;
var PENDING  = 2;

function Promise$1(executor) {

    this.state = PENDING;
    this.value = undefined;
    this.deferred = [];

    var promise = this;

    try {
        executor(function (x) {
            promise.resolve(x);
        }, function (r) {
            promise.reject(r);
        });
    } catch (e) {
        promise.reject(e);
    }
}

Promise$1.reject = function (r) {
    return new Promise$1(function (resolve, reject) {
        reject(r);
    });
};

Promise$1.resolve = function (x) {
    return new Promise$1(function (resolve, reject) {
        resolve(x);
    });
};

Promise$1.all = function all(iterable) {
    return new Promise$1(function (resolve, reject) {
        var count = 0, result = [];

        if (iterable.length === 0) {
            resolve(result);
        }

        function resolver(i) {
            return function (x) {
                result[i] = x;
                count += 1;

                if (count === iterable.length) {
                    resolve(result);
                }
            };
        }

        for (var i = 0; i < iterable.length; i += 1) {
            Promise$1.resolve(iterable[i]).then(resolver(i), reject);
        }
    });
};

Promise$1.race = function race(iterable) {
    return new Promise$1(function (resolve, reject) {
        for (var i = 0; i < iterable.length; i += 1) {
            Promise$1.resolve(iterable[i]).then(resolve, reject);
        }
    });
};

var p$1 = Promise$1.prototype;

p$1.resolve = function resolve(x) {
    var promise = this;

    if (promise.state === PENDING) {
        if (x === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        var called = false;

        try {
            var then = x && x['then'];

            if (x !== null && typeof x === 'object' && typeof then === 'function') {
                then.call(x, function (x) {
                    if (!called) {
                        promise.resolve(x);
                    }
                    called = true;

                }, function (r) {
                    if (!called) {
                        promise.reject(r);
                    }
                    called = true;
                });
                return;
            }
        } catch (e) {
            if (!called) {
                promise.reject(e);
            }
            return;
        }

        promise.state = RESOLVED;
        promise.value = x;
        promise.notify();
    }
};

p$1.reject = function reject(reason) {
    var promise = this;

    if (promise.state === PENDING) {
        if (reason === promise) {
            throw new TypeError('Promise settled with itself.');
        }

        promise.state = REJECTED;
        promise.value = reason;
        promise.notify();
    }
};

p$1.notify = function notify() {
    var promise = this;

    nextTick(function () {
        if (promise.state !== PENDING) {
            while (promise.deferred.length) {
                var deferred = promise.deferred.shift(),
                    onResolved = deferred[0],
                    onRejected = deferred[1],
                    resolve = deferred[2],
                    reject = deferred[3];

                try {
                    if (promise.state === RESOLVED) {
                        if (typeof onResolved === 'function') {
                            resolve(onResolved.call(undefined, promise.value));
                        } else {
                            resolve(promise.value);
                        }
                    } else if (promise.state === REJECTED) {
                        if (typeof onRejected === 'function') {
                            resolve(onRejected.call(undefined, promise.value));
                        } else {
                            reject(promise.value);
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            }
        }
    });
};

p$1.then = function then(onResolved, onRejected) {
    var promise = this;

    return new Promise$1(function (resolve, reject) {
        promise.deferred.push([onResolved, onRejected, resolve, reject]);
        promise.notify();
    });
};

p$1.catch = function (onRejected) {
    return this.then(undefined, onRejected);
};

/**
 * Promise adapter.
 */

if (typeof Promise === 'undefined') {
    window.Promise = Promise$1;
}

function PromiseObj(executor, context) {

    if (executor instanceof Promise) {
        this.promise = executor;
    } else {
        this.promise = new Promise(executor.bind(context));
    }

    this.context = context;
}

PromiseObj.all = function (iterable, context) {
    return new PromiseObj(Promise.all(iterable), context);
};

PromiseObj.resolve = function (value, context) {
    return new PromiseObj(Promise.resolve(value), context);
};

PromiseObj.reject = function (reason, context) {
    return new PromiseObj(Promise.reject(reason), context);
};

PromiseObj.race = function (iterable, context) {
    return new PromiseObj(Promise.race(iterable), context);
};

var p = PromiseObj.prototype;

p.bind = function (context) {
    this.context = context;
    return this;
};

p.then = function (fulfilled, rejected) {

    if (fulfilled && fulfilled.bind && this.context) {
        fulfilled = fulfilled.bind(this.context);
    }

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    return new PromiseObj(this.promise.then(fulfilled, rejected), this.context);
};

p.catch = function (rejected) {

    if (rejected && rejected.bind && this.context) {
        rejected = rejected.bind(this.context);
    }

    return new PromiseObj(this.promise.catch(rejected), this.context);
};

p.finally = function (callback) {

    return this.then(function (value) {
            callback.call(this);
            return value;
        }, function (reason) {
            callback.call(this);
            return Promise.reject(reason);
        }
    );
};

/**
 * Utility functions.
 */

var debug = false;
var util = {};
var ref = {};
var hasOwnProperty = ref.hasOwnProperty;

var ref$1 = [];
var slice = ref$1.slice;

var inBrowser = typeof window !== 'undefined';

var Util = function (Vue) {
    util = Vue.util;
    debug = Vue.config.debug || !Vue.config.silent;
};

function warn(msg) {
    if (typeof console !== 'undefined' && debug) {
        console.warn('[VueResource warn]: ' + msg);
    }
}

function error(msg) {
    if (typeof console !== 'undefined') {
        console.error(msg);
    }
}

function nextTick(cb, ctx) {
    return util.nextTick(cb, ctx);
}

function trim(str) {
    return str ? str.replace(/^\s*|\s*$/g, '') : '';
}

function toLower(str) {
    return str ? str.toLowerCase() : '';
}

function toUpper(str) {
    return str ? str.toUpperCase() : '';
}

var isArray = Array.isArray;

function isString(val) {
    return typeof val === 'string';
}



function isFunction(val) {
    return typeof val === 'function';
}

function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

function isPlainObject(obj) {
    return isObject(obj) && Object.getPrototypeOf(obj) == Object.prototype;
}

function isBlob(obj) {
    return typeof Blob !== 'undefined' && obj instanceof Blob;
}

function isFormData(obj) {
    return typeof FormData !== 'undefined' && obj instanceof FormData;
}

function when(value, fulfilled, rejected) {

    var promise = PromiseObj.resolve(value);

    if (arguments.length < 2) {
        return promise;
    }

    return promise.then(fulfilled, rejected);
}

function options(fn, obj, opts) {

    opts = opts || {};

    if (isFunction(opts)) {
        opts = opts.call(obj);
    }

    return merge(fn.bind({$vm: obj, $options: opts}), fn, {$options: opts});
}

function each(obj, iterator) {

    var i, key;

    if (isArray(obj)) {
        for (i = 0; i < obj.length; i++) {
            iterator.call(obj[i], obj[i], i);
        }
    } else if (isObject(obj)) {
        for (key in obj) {
            if (hasOwnProperty.call(obj, key)) {
                iterator.call(obj[key], obj[key], key);
            }
        }
    }

    return obj;
}

var assign = Object.assign || _assign;

function merge(target) {

    var args = slice.call(arguments, 1);

    args.forEach(function (source) {
        _merge(target, source, true);
    });

    return target;
}

function defaults(target) {

    var args = slice.call(arguments, 1);

    args.forEach(function (source) {

        for (var key in source) {
            if (target[key] === undefined) {
                target[key] = source[key];
            }
        }

    });

    return target;
}

function _assign(target) {

    var args = slice.call(arguments, 1);

    args.forEach(function (source) {
        _merge(target, source);
    });

    return target;
}

function _merge(target, source, deep) {
    for (var key in source) {
        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
            if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                target[key] = {};
            }
            if (isArray(source[key]) && !isArray(target[key])) {
                target[key] = [];
            }
            _merge(target[key], source[key], deep);
        } else if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }
}

/**
 * Root Prefix Transform.
 */

var root = function (options$$1, next) {

    var url = next(options$$1);

    if (isString(options$$1.root) && !url.match(/^(https?:)?\//)) {
        url = options$$1.root + '/' + url;
    }

    return url;
};

/**
 * Query Parameter Transform.
 */

var query = function (options$$1, next) {

    var urlParams = Object.keys(Url.options.params), query = {}, url = next(options$$1);

    each(options$$1.params, function (value, key) {
        if (urlParams.indexOf(key) === -1) {
            query[key] = value;
        }
    });

    query = Url.params(query);

    if (query) {
        url += (url.indexOf('?') == -1 ? '?' : '&') + query;
    }

    return url;
};

/**
 * URL Template v2.0.6 (https://github.com/bramstein/url-template)
 */

function expand(url, params, variables) {

    var tmpl = parse(url), expanded = tmpl.expand(params);

    if (variables) {
        variables.push.apply(variables, tmpl.vars);
    }

    return expanded;
}

function parse(template) {

    var operators = ['+', '#', '.', '/', ';', '?', '&'], variables = [];

    return {
        vars: variables,
        expand: function expand(context) {
            return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
                if (expression) {

                    var operator = null, values = [];

                    if (operators.indexOf(expression.charAt(0)) !== -1) {
                        operator = expression.charAt(0);
                        expression = expression.substr(1);
                    }

                    expression.split(/,/g).forEach(function (variable) {
                        var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                        values.push.apply(values, getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                        variables.push(tmp[1]);
                    });

                    if (operator && operator !== '+') {

                        var separator = ',';

                        if (operator === '?') {
                            separator = '&';
                        } else if (operator !== '#') {
                            separator = operator;
                        }

                        return (values.length !== 0 ? operator : '') + values.join(separator);
                    } else {
                        return values.join(',');
                    }

                } else {
                    return encodeReserved(literal);
                }
            });
        }
    };
}

function getValues(context, operator, key, modifier) {

    var value = context[key], result = [];

    if (isDefined(value) && value !== '') {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            value = value.toString();

            if (modifier && modifier !== '*') {
                value = value.substring(0, parseInt(modifier, 10));
            }

            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
        } else {
            if (modifier === '*') {
                if (Array.isArray(value)) {
                    value.filter(isDefined).forEach(function (value) {
                        result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
                    });
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (isDefined(value[k])) {
                            result.push(encodeValue(operator, value[k], k));
                        }
                    });
                }
            } else {
                var tmp = [];

                if (Array.isArray(value)) {
                    value.filter(isDefined).forEach(function (value) {
                        tmp.push(encodeValue(operator, value));
                    });
                } else {
                    Object.keys(value).forEach(function (k) {
                        if (isDefined(value[k])) {
                            tmp.push(encodeURIComponent(k));
                            tmp.push(encodeValue(operator, value[k].toString()));
                        }
                    });
                }

                if (isKeyOperator(operator)) {
                    result.push(encodeURIComponent(key) + '=' + tmp.join(','));
                } else if (tmp.length !== 0) {
                    result.push(tmp.join(','));
                }
            }
        }
    } else {
        if (operator === ';') {
            result.push(encodeURIComponent(key));
        } else if (value === '' && (operator === '&' || operator === '?')) {
            result.push(encodeURIComponent(key) + '=');
        } else if (value === '') {
            result.push('');
        }
    }

    return result;
}

function isDefined(value) {
    return value !== undefined && value !== null;
}

function isKeyOperator(operator) {
    return operator === ';' || operator === '&' || operator === '?';
}

function encodeValue(operator, value, key) {

    value = (operator === '+' || operator === '#') ? encodeReserved(value) : encodeURIComponent(value);

    if (key) {
        return encodeURIComponent(key) + '=' + value;
    } else {
        return value;
    }
}

function encodeReserved(str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
        if (!/%[0-9A-Fa-f]/.test(part)) {
            part = encodeURI(part);
        }
        return part;
    }).join('');
}

/**
 * URL Template (RFC 6570) Transform.
 */

var template = function (options) {

    var variables = [], url = expand(options.url, options.params, variables);

    variables.forEach(function (key) {
        delete options.params[key];
    });

    return url;
};

/**
 * Service for URL templating.
 */

function Url(url, params) {

    var self = this || {}, options$$1 = url, transform;

    if (isString(url)) {
        options$$1 = {url: url, params: params};
    }

    options$$1 = merge({}, Url.options, self.$options, options$$1);

    Url.transforms.forEach(function (handler) {
        transform = factory(handler, transform, self.$vm);
    });

    return transform(options$$1);
}

/**
 * Url options.
 */

Url.options = {
    url: '',
    root: null,
    params: {}
};

/**
 * Url transforms.
 */

Url.transforms = [template, query, root];

/**
 * Encodes a Url parameter string.
 *
 * @param {Object} obj
 */

Url.params = function (obj) {

    var params = [], escape = encodeURIComponent;

    params.add = function (key, value) {

        if (isFunction(value)) {
            value = value();
        }

        if (value === null) {
            value = '';
        }

        this.push(escape(key) + '=' + escape(value));
    };

    serialize(params, obj);

    return params.join('&').replace(/%20/g, '+');
};

/**
 * Parse a URL and return its components.
 *
 * @param {String} url
 */

Url.parse = function (url) {

    var el = document.createElement('a');

    if (document.documentMode) {
        el.href = url;
        url = el.href;
    }

    el.href = url;

    return {
        href: el.href,
        protocol: el.protocol ? el.protocol.replace(/:$/, '') : '',
        port: el.port,
        host: el.host,
        hostname: el.hostname,
        pathname: el.pathname.charAt(0) === '/' ? el.pathname : '/' + el.pathname,
        search: el.search ? el.search.replace(/^\?/, '') : '',
        hash: el.hash ? el.hash.replace(/^#/, '') : ''
    };
};

function factory(handler, next, vm) {
    return function (options$$1) {
        return handler.call(vm, options$$1, next);
    };
}

function serialize(params, obj, scope) {

    var array = isArray(obj), plain = isPlainObject(obj), hash;

    each(obj, function (value, key) {

        hash = isObject(value) || isArray(value);

        if (scope) {
            key = scope + '[' + (plain || hash ? key : '') + ']';
        }

        if (!scope && array) {
            params.add(value.name, value.value);
        } else if (hash) {
            serialize(params, value, key);
        } else {
            params.add(key, value);
        }
    });
}

/**
 * XDomain client (Internet Explorer).
 */

var xdrClient = function (request) {
    return new PromiseObj(function (resolve) {

        var xdr = new XDomainRequest(), handler = function (ref) {
            var type = ref.type;


            var status = 0;

            if (type === 'load') {
                status = 200;
            } else if (type === 'error') {
                status = 500;
            }

            resolve(request.respondWith(xdr.responseText, {status: status}));
        };

        request.abort = function () { return xdr.abort(); };

        xdr.open(request.method, request.getUrl());

        if (request.timeout) {
            xdr.timeout = request.timeout;
        }

        xdr.onload = handler;
        xdr.onabort = handler;
        xdr.onerror = handler;
        xdr.ontimeout = handler;
        xdr.onprogress = function () {};
        xdr.send(request.getBody());
    });
};

/**
 * CORS Interceptor.
 */

var SUPPORTS_CORS = inBrowser && 'withCredentials' in new XMLHttpRequest();

var cors = function (request, next) {

    if (inBrowser) {

        var orgUrl = Url.parse(location.href);
        var reqUrl = Url.parse(request.getUrl());

        if (reqUrl.protocol !== orgUrl.protocol || reqUrl.host !== orgUrl.host) {

            request.crossOrigin = true;
            request.emulateHTTP = false;

            if (!SUPPORTS_CORS) {
                request.client = xdrClient;
            }
        }
    }

    next();
};

/**
 * Body Interceptor.
 */

var body = function (request, next) {

    if (isFormData(request.body)) {

        request.headers.delete('Content-Type');

    } else if (isObject(request.body) || isArray(request.body)) {

        if (request.emulateJSON) {
            request.body = Url.params(request.body);
            request.headers.set('Content-Type', 'application/x-www-form-urlencoded');
        } else {
            request.body = JSON.stringify(request.body);
        }
    }

    next(function (response) {

        Object.defineProperty(response, 'data', {

            get: function get() {
                return this.body;
            },

            set: function set(body) {
                this.body = body;
            }

        });

        return response.bodyText ? when(response.text(), function (text) {

            var type = response.headers.get('Content-Type') || '';

            if (type.indexOf('application/json') === 0 || isJson(text)) {

                try {
                    response.body = JSON.parse(text);
                } catch (e) {
                    response.body = null;
                }

            } else {
                response.body = text;
            }

            return response;

        }) : response;

    });
};

function isJson(str) {

    var start = str.match(/^\[|^\{(?!\{)/), end = {'[': /]$/, '{': /}$/};

    return start && end[start[0]].test(str);
}

/**
 * JSONP client.
 */

var jsonpClient = function (request) {
    return new PromiseObj(function (resolve) {

        var name = request.jsonp || 'callback', callback = request.jsonpCallback || '_jsonp' + Math.random().toString(36).substr(2), body = null, handler, script;

        handler = function (ref) {
            var type = ref.type;


            var status = 0;

            if (type === 'load' && body !== null) {
                status = 200;
            } else if (type === 'error') {
                status = 500;
            }

            if (status && window[callback]) {
                delete window[callback];
                document.body.removeChild(script);
            }

            resolve(request.respondWith(body, {status: status}));
        };

        window[callback] = function (result) {
            body = JSON.stringify(result);
        };

        request.abort = function () {
            handler({type: 'abort'});
        };

        request.params[name] = callback;

        if (request.timeout) {
            setTimeout(request.abort, request.timeout);
        }

        script = document.createElement('script');
        script.src = request.getUrl();
        script.type = 'text/javascript';
        script.async = true;
        script.onload = handler;
        script.onerror = handler;

        document.body.appendChild(script);
    });
};

/**
 * JSONP Interceptor.
 */

var jsonp = function (request, next) {

    if (request.method == 'JSONP') {
        request.client = jsonpClient;
    }

    next();
};

/**
 * Before Interceptor.
 */

var before = function (request, next) {

    if (isFunction(request.before)) {
        request.before.call(this, request);
    }

    next();
};

/**
 * HTTP method override Interceptor.
 */

var method = function (request, next) {

    if (request.emulateHTTP && /^(PUT|PATCH|DELETE)$/i.test(request.method)) {
        request.headers.set('X-HTTP-Method-Override', request.method);
        request.method = 'POST';
    }

    next();
};

/**
 * Header Interceptor.
 */

var header = function (request, next) {

    var headers = assign({}, Http.headers.common,
        !request.crossOrigin ? Http.headers.custom : {},
        Http.headers[toLower(request.method)]
    );

    each(headers, function (value, name) {
        if (!request.headers.has(name)) {
            request.headers.set(name, value);
        }
    });

    next();
};

/**
 * XMLHttp client.
 */

var SUPPORTS_BLOB = typeof Blob !== 'undefined' && typeof FileReader !== 'undefined';

var xhrClient = function (request) {
    return new PromiseObj(function (resolve) {

        var xhr = new XMLHttpRequest(), handler = function (event) {

            var response = request.respondWith(
                'response' in xhr ? xhr.response : xhr.responseText, {
                    status: xhr.status === 1223 ? 204 : xhr.status, // IE9 status bug
                    statusText: xhr.status === 1223 ? 'No Content' : trim(xhr.statusText)
                }
            );

            each(trim(xhr.getAllResponseHeaders()).split('\n'), function (row) {
                response.headers.append(row.slice(0, row.indexOf(':')), row.slice(row.indexOf(':') + 1));
            });

            resolve(response);
        };

        request.abort = function () { return xhr.abort(); };

        if (request.progress) {
            if (request.method === 'GET') {
                xhr.addEventListener('progress', request.progress);
            } else if (/^(POST|PUT)$/i.test(request.method)) {
                xhr.upload.addEventListener('progress', request.progress);
            }
        }

        xhr.open(request.method, request.getUrl(), true);

        if (request.timeout) {
            xhr.timeout = request.timeout;
        }

        if (request.credentials === true) {
            xhr.withCredentials = true;
        }

        if ('responseType' in xhr && SUPPORTS_BLOB) {
            xhr.responseType = 'blob';
        }

        request.headers.forEach(function (value, name) {
            xhr.setRequestHeader(name, value);
        });

        xhr.onload = handler;
        xhr.onabort = handler;
        xhr.onerror = handler;
        xhr.ontimeout = handler;
        xhr.send(request.getBody());
    });
};

/**
 * Base client.
 */

var Client = function (context) {

    var reqHandlers = [sendRequest], resHandlers = [], handler;

    if (!isObject(context)) {
        context = null;
    }

    function Client(request) {
        return new PromiseObj(function (resolve) {

            function exec() {

                handler = reqHandlers.pop();

                if (isFunction(handler)) {
                    handler.call(context, request, next);
                } else {
                    warn(("Invalid interceptor of type " + (typeof handler) + ", must be a function"));
                    next();
                }
            }

            function next(response) {

                if (isFunction(response)) {

                    resHandlers.unshift(response);

                } else if (isObject(response)) {

                    resHandlers.forEach(function (handler) {
                        response = when(response, function (response) {
                            return handler.call(context, response) || response;
                        });
                    });

                    when(response, resolve);

                    return;
                }

                exec();
            }

            exec();

        }, context);
    }

    Client.use = function (handler) {
        reqHandlers.push(handler);
    };

    return Client;
};

function sendRequest(request, resolve) {

    var client = request.client || xhrClient;

    resolve(client(request));
}

/**
 * HTTP Headers.
 */

var Headers = function Headers(headers) {
    var this$1 = this;


    this.map = {};

    each(headers, function (value, name) { return this$1.append(name, value); });
};

Headers.prototype.has = function has (name) {
    return getName(this.map, name) !== null;
};

Headers.prototype.get = function get (name) {

    var list = this.map[getName(this.map, name)];

    return list ? list[0] : null;
};

Headers.prototype.getAll = function getAll (name) {
    return this.map[getName(this.map, name)] || [];
};

Headers.prototype.set = function set (name, value) {
    this.map[normalizeName(getName(this.map, name) || name)] = [trim(value)];
};

Headers.prototype.append = function append (name, value){

    var list = this.getAll(name);

    if (list.length) {
        list.push(trim(value));
    } else {
        this.set(name, value);
    }
};

Headers.prototype.delete = function delete$1 (name){
    delete this.map[getName(this.map, name)];
};

Headers.prototype.deleteAll = function deleteAll (){
    this.map = {};
};

Headers.prototype.forEach = function forEach (callback, thisArg) {
        var this$1 = this;

    each(this.map, function (list, name) {
        each(list, function (value) { return callback.call(thisArg, value, name, this$1); });
    });
};

function getName(map, name) {
    return Object.keys(map).reduce(function (prev, curr) {
        return toLower(name) === toLower(curr) ? curr : prev;
    }, null);
}

function normalizeName(name) {

    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
        throw new TypeError('Invalid character in header field name');
    }

    return trim(name);
}

/**
 * HTTP Response.
 */

var Response = function Response(body, ref) {
    var url = ref.url;
    var headers = ref.headers;
    var status = ref.status;
    var statusText = ref.statusText;


    this.url = url;
    this.ok = status >= 200 && status < 300;
    this.status = status || 0;
    this.statusText = statusText || '';
    this.headers = new Headers(headers);
    this.body = body;

    if (isString(body)) {

        this.bodyText = body;

    } else if (isBlob(body)) {

        this.bodyBlob = body;

        if (isBlobText(body)) {
            this.bodyText = blobText(body);
        }
    }
};

Response.prototype.blob = function blob () {
    return when(this.bodyBlob);
};

Response.prototype.text = function text () {
    return when(this.bodyText);
};

Response.prototype.json = function json () {
    return when(this.text(), function (text) { return JSON.parse(text); });
};

function blobText(body) {
    return new PromiseObj(function (resolve) {

        var reader = new FileReader();

        reader.readAsText(body);
        reader.onload = function () {
            resolve(reader.result);
        };

    });
}

function isBlobText(body) {
    return body.type.indexOf('text') === 0 || body.type.indexOf('json') !== -1;
}

/**
 * HTTP Request.
 */

var Request = function Request(options$$1) {

    this.body = null;
    this.params = {};

    assign(this, options$$1, {
        method: toUpper(options$$1.method || 'GET')
    });

    if (!(this.headers instanceof Headers)) {
        this.headers = new Headers(this.headers);
    }
};

Request.prototype.getUrl = function getUrl (){
    return Url(this);
};

Request.prototype.getBody = function getBody (){
    return this.body;
};

Request.prototype.respondWith = function respondWith (body, options$$1) {
    return new Response(body, assign(options$$1 || {}, {url: this.getUrl()}));
};

/**
 * Service for sending network requests.
 */

var CUSTOM_HEADERS = {'X-Requested-With': 'XMLHttpRequest'};
var COMMON_HEADERS = {'Accept': 'application/json, text/plain, */*'};
var JSON_CONTENT_TYPE = {'Content-Type': 'application/json;charset=utf-8'};

function Http(options$$1) {

    var self = this || {}, client = Client(self.$vm);

    defaults(options$$1 || {}, self.$options, Http.options);

    Http.interceptors.forEach(function (handler) {
        client.use(handler);
    });

    return client(new Request(options$$1)).then(function (response) {

        return response.ok ? response : PromiseObj.reject(response);

    }, function (response) {

        if (response instanceof Error) {
            error(response);
        }

        return PromiseObj.reject(response);
    });
}

Http.options = {};

Http.headers = {
    put: JSON_CONTENT_TYPE,
    post: JSON_CONTENT_TYPE,
    patch: JSON_CONTENT_TYPE,
    delete: JSON_CONTENT_TYPE,
    custom: CUSTOM_HEADERS,
    common: COMMON_HEADERS
};

Http.interceptors = [before, method, body, jsonp, header, cors];

['get', 'delete', 'head', 'jsonp'].forEach(function (method$$1) {

    Http[method$$1] = function (url, options$$1) {
        return this(assign(options$$1 || {}, {url: url, method: method$$1}));
    };

});

['post', 'put', 'patch'].forEach(function (method$$1) {

    Http[method$$1] = function (url, body$$1, options$$1) {
        return this(assign(options$$1 || {}, {url: url, method: method$$1, body: body$$1}));
    };

});

/**
 * Service for interacting with RESTful services.
 */

function Resource(url, params, actions, options$$1) {

    var self = this || {}, resource = {};

    actions = assign({},
        Resource.actions,
        actions
    );

    each(actions, function (action, name) {

        action = merge({url: url, params: assign({}, params)}, options$$1, action);

        resource[name] = function () {
            return (self.$http || Http)(opts(action, arguments));
        };
    });

    return resource;
}

function opts(action, args) {

    var options$$1 = assign({}, action), params = {}, body;

    switch (args.length) {

        case 2:

            params = args[0];
            body = args[1];

            break;

        case 1:

            if (/^(POST|PUT|PATCH)$/i.test(options$$1.method)) {
                body = args[0];
            } else {
                params = args[0];
            }

            break;

        case 0:

            break;

        default:

            throw 'Expected up to 2 arguments [params, body], got ' + args.length + ' arguments';
    }

    options$$1.body = body;
    options$$1.params = assign({}, options$$1.params, params);

    return options$$1;
}

Resource.actions = {

    get: {method: 'GET'},
    save: {method: 'POST'},
    query: {method: 'GET'},
    update: {method: 'PUT'},
    remove: {method: 'DELETE'},
    delete: {method: 'DELETE'}

};

/**
 * Install plugin.
 */

function plugin(Vue) {

    if (plugin.installed) {
        return;
    }

    Util(Vue);

    Vue.url = Url;
    Vue.http = Http;
    Vue.resource = Resource;
    Vue.Promise = PromiseObj;

    Object.defineProperties(Vue.prototype, {

        $url: {
            get: function get() {
                return options(Vue.url, this, this.$options.url);
            }
        },

        $http: {
            get: function get() {
                return options(Vue.http, this, this.$options.http);
            }
        },

        $resource: {
            get: function get() {
                return Vue.resource.bind(this);
            }
        },

        $promise: {
            get: function get() {
                var this$1 = this;

                return function (executor) { return new Vue.Promise(executor, this$1); };
            }
        }

    });
}

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin);
}

module.exports = plugin;

},{}],4:[function(require,module,exports){
(function (process){
/**
  * vue-router v2.2.0
  * (c) 2017 Evan You
  * @license MIT
  */
'use strict';

/*  */

function assert (condition, message) {
  if (!condition) {
    throw new Error(("[vue-router] " + message))
  }
}

function warn (condition, message) {
  if (!condition) {
    typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
  }
}

var View = {
  name: 'router-view',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render: function render (h, ref) {
    var props = ref.props;
    var children = ref.children;
    var parent = ref.parent;
    var data = ref.data;

    data.routerView = true;

    var name = props.name;
    var route = parent.$route;
    var cache = parent._routerViewCache || (parent._routerViewCache = {});

    // determine current view depth, also check to see if the tree
    // has been toggled inactive but kept-alive.
    var depth = 0;
    var inactive = false;
    while (parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++;
      }
      if (parent._inactive) {
        inactive = true;
      }
      parent = parent.$parent;
    }
    data.routerViewDepth = depth;

    // render previous view if the tree is inactive and kept-alive
    if (inactive) {
      return h(cache[name], data, children)
    }

    var matched = route.matched[depth];
    // render empty node if no matched route
    if (!matched) {
      cache[name] = null;
      return h()
    }

    var component = cache[name] = matched.components[name];

    // inject instance registration hooks
    var hooks = data.hook || (data.hook = {});
    hooks.init = function (vnode) {
      matched.instances[name] = vnode.child;
    };
    hooks.prepatch = function (oldVnode, vnode) {
      matched.instances[name] = vnode.child;
    };
    hooks.destroy = function (vnode) {
      if (matched.instances[name] === vnode.child) {
        matched.instances[name] = undefined;
      }
    };

    // resolve props
    data.props = resolveProps(route, matched.props && matched.props[name]);

    return h(component, data, children)
  }
};

function resolveProps (route, config) {
  switch (typeof config) {
    case 'undefined':
      return
    case 'object':
      return config
    case 'function':
      return config(route)
    case 'boolean':
      return config ? route.params : undefined
    default:
      warn(false, ("props in \"" + (route.path) + "\" is a " + (typeof config) + ", expecting an object, function or boolean."));
  }
}

/*  */

var encodeReserveRE = /[!'()*]/g;
var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
var commaRE = /%2C/g;

// fixed encodeURIComponent which is more comformant to RFC3986:
// - escapes [!'()*]
// - preserve commas
var encode = function (str) { return encodeURIComponent(str)
  .replace(encodeReserveRE, encodeReserveReplacer)
  .replace(commaRE, ','); };

var decode = decodeURIComponent;

function resolveQuery (
  query,
  extraQuery
) {
  if ( extraQuery === void 0 ) extraQuery = {};

  if (query) {
    var parsedQuery;
    try {
      parsedQuery = parseQuery(query);
    } catch (e) {
      process.env.NODE_ENV !== 'production' && warn(false, e.message);
      parsedQuery = {};
    }
    for (var key in extraQuery) {
      parsedQuery[key] = extraQuery[key];
    }
    return parsedQuery
  } else {
    return extraQuery
  }
}

function parseQuery (query) {
  var res = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res
  }

  query.split('&').forEach(function (param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = decode(parts.shift());
    var val = parts.length > 0
      ? decode(parts.join('='))
      : null;

    if (res[key] === undefined) {
      res[key] = val;
    } else if (Array.isArray(res[key])) {
      res[key].push(val);
    } else {
      res[key] = [res[key], val];
    }
  });

  return res
}

function stringifyQuery (obj) {
  var res = obj ? Object.keys(obj).map(function (key) {
    var val = obj[key];

    if (val === undefined) {
      return ''
    }

    if (val === null) {
      return encode(key)
    }

    if (Array.isArray(val)) {
      var result = [];
      val.slice().forEach(function (val2) {
        if (val2 === undefined) {
          return
        }
        if (val2 === null) {
          result.push(encode(key));
        } else {
          result.push(encode(key) + '=' + encode(val2));
        }
      });
      return result.join('&')
    }

    return encode(key) + '=' + encode(val)
  }).filter(function (x) { return x.length > 0; }).join('&') : null;
  return res ? ("?" + res) : ''
}

/*  */

var trailingSlashRE = /\/?$/;

function createRoute (
  record,
  location,
  redirectedFrom
) {
  var route = {
    name: location.name || (record && record.name),
    meta: (record && record.meta) || {},
    path: location.path || '/',
    hash: location.hash || '',
    query: location.query || {},
    params: location.params || {},
    fullPath: getFullPath(location),
    matched: record ? formatMatch(record) : []
  };
  if (redirectedFrom) {
    route.redirectedFrom = getFullPath(redirectedFrom);
  }
  return Object.freeze(route)
}

// the starting route that represents the initial state
var START = createRoute(null, {
  path: '/'
});

function formatMatch (record) {
  var res = [];
  while (record) {
    res.unshift(record);
    record = record.parent;
  }
  return res
}

function getFullPath (ref) {
  var path = ref.path;
  var query = ref.query; if ( query === void 0 ) query = {};
  var hash = ref.hash; if ( hash === void 0 ) hash = '';

  return (path || '/') + stringifyQuery(query) + hash
}

function isSameRoute (a, b) {
  if (b === START) {
    return a === b
  } else if (!b) {
    return false
  } else if (a.path && b.path) {
    return (
      a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query)
    )
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      a.hash === b.hash &&
      isObjectEqual(a.query, b.query) &&
      isObjectEqual(a.params, b.params)
    )
  } else {
    return false
  }
}

function isObjectEqual (a, b) {
  if ( a === void 0 ) a = {};
  if ( b === void 0 ) b = {};

  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every(function (key) { return String(a[key]) === String(b[key]); })
}

function isIncludedRoute (current, target) {
  return (
    current.path.replace(trailingSlashRE, '/').indexOf(
      target.path.replace(trailingSlashRE, '/')
    ) === 0 &&
    (!target.hash || current.hash === target.hash) &&
    queryIncludes(current.query, target.query)
  )
}

function queryIncludes (current, target) {
  for (var key in target) {
    if (!(key in current)) {
      return false
    }
  }
  return true
}

/*  */

// work around weird flow bug
var toTypes = [String, Object];
var eventTypes = [String, Array];

var Link = {
  name: 'router-link',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render: function render (h) {
    var this$1 = this;

    var router = this.$router;
    var current = this.$route;
    var ref = router.resolve(this.to, current, this.append);
    var location = ref.location;
    var route = ref.route;
    var href = ref.href;
    var classes = {};
    var activeClass = this.activeClass || router.options.linkActiveClass || 'router-link-active';
    var compareTarget = location.path ? createRoute(null, location) : route;
    classes[activeClass] = this.exact
      ? isSameRoute(current, compareTarget)
      : isIncludedRoute(current, compareTarget);

    var handler = function (e) {
      if (guardEvent(e)) {
        if (this$1.replace) {
          router.replace(location);
        } else {
          router.push(location);
        }
      }
    };

    var on = { click: guardEvent };
    if (Array.isArray(this.event)) {
      this.event.forEach(function (e) { on[e] = handler; });
    } else {
      on[this.event] = handler;
    }

    var data = {
      class: classes
    };

    if (this.tag === 'a') {
      data.on = on;
      data.attrs = { href: href };
    } else {
      // find the first <a> child and apply listener and href
      var a = findAnchor(this.$slots.default);
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false;
        var extend = _Vue.util.extend;
        var aData = a.data = extend({}, a.data);
        aData.on = on;
        var aAttrs = a.data.attrs = extend({}, a.data.attrs);
        aAttrs.href = href;
      } else {
        // doesn't have <a> child, apply listener to self
        data.on = on;
      }
    }

    return h(this.tag, data, this.$slots.default)
  }
};

function guardEvent (e) {
  // don't redirect with control keys
  if (e.metaKey || e.ctrlKey || e.shiftKey) { return }
  // don't redirect when preventDefault called
  if (e.defaultPrevented) { return }
  // don't redirect on right click
  if (e.button !== undefined && e.button !== 0) { return }
  // don't redirect if `target="_blank"`
  if (e.target && e.target.getAttribute) {
    var target = e.target.getAttribute('target');
    if (/\b_blank\b/i.test(target)) { return }
  }
  // this may be a Weex event which doesn't have this method
  if (e.preventDefault) {
    e.preventDefault();
  }
  return true
}

function findAnchor (children) {
  if (children) {
    var child;
    for (var i = 0; i < children.length; i++) {
      child = children[i];
      if (child.tag === 'a') {
        return child
      }
      if (child.children && (child = findAnchor(child.children))) {
        return child
      }
    }
  }
}

var _Vue;

function install (Vue) {
  if (install.installed) { return }
  install.installed = true;

  _Vue = Vue;

  Object.defineProperty(Vue.prototype, '$router', {
    get: function get () { return this.$root._router }
  });

  Object.defineProperty(Vue.prototype, '$route', {
    get: function get () { return this.$root._route }
  });

  Vue.mixin({
    beforeCreate: function beforeCreate () {
      if (this.$options.router) {
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, '_route', this._router.history.current);
      }
    }
  });

  Vue.component('router-view', View);
  Vue.component('router-link', Link);

  var strats = Vue.config.optionMergeStrategies;
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.created;
}

/*  */

var inBrowser = typeof window !== 'undefined';

/*  */

function resolvePath (
  relative,
  base,
  append
) {
  if (relative.charAt(0) === '/') {
    return relative
  }

  if (relative.charAt(0) === '?' || relative.charAt(0) === '#') {
    return base + relative
  }

  var stack = base.split('/');

  // remove trailing segment if:
  // - not appending
  // - appending to trailing slash (last segment is empty)
  if (!append || !stack[stack.length - 1]) {
    stack.pop();
  }

  // resolve relative path
  var segments = relative.replace(/^\//, '').split('/');
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    if (segment === '.') {
      continue
    } else if (segment === '..') {
      stack.pop();
    } else {
      stack.push(segment);
    }
  }

  // ensure leading slash
  if (stack[0] !== '') {
    stack.unshift('');
  }

  return stack.join('/')
}

function parsePath (path) {
  var hash = '';
  var query = '';

  var hashIndex = path.indexOf('#');
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex);
    path = path.slice(0, hashIndex);
  }

  var queryIndex = path.indexOf('?');
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1);
    path = path.slice(0, queryIndex);
  }

  return {
    path: path,
    query: query,
    hash: hash
  }
}

function cleanPath (path) {
  return path.replace(/\/\//g, '/')
}

/*  */

function createRouteMap (
  routes,
  oldPathMap,
  oldNameMap
) {
  var pathMap = oldPathMap || Object.create(null);
  var nameMap = oldNameMap || Object.create(null);

  routes.forEach(function (route) {
    addRouteRecord(pathMap, nameMap, route);
  });

  return {
    pathMap: pathMap,
    nameMap: nameMap
  }
}

function addRouteRecord (
  pathMap,
  nameMap,
  route,
  parent,
  matchAs
) {
  var path = route.path;
  var name = route.name;
  if (process.env.NODE_ENV !== 'production') {
    assert(path != null, "\"path\" is required in a route configuration.");
    assert(
      typeof route.component !== 'string',
      "route config \"component\" for path: " + (String(path || name)) + " cannot be a " +
      "string id. Use an actual component instead."
    );
  }

  var record = {
    path: normalizePath(path, parent),
    components: route.components || { default: route.component },
    instances: {},
    name: name,
    parent: parent,
    matchAs: matchAs,
    redirect: route.redirect,
    beforeEnter: route.beforeEnter,
    meta: route.meta || {},
    props: route.props == null
      ? {}
      : route.components
        ? route.props
        : { default: route.props }
  };

  if (route.children) {
    // Warn if route is named and has a default child route.
    // If users navigate to this route by name, the default child will
    // not be rendered (GH Issue #629)
    if (process.env.NODE_ENV !== 'production') {
      if (route.name && route.children.some(function (child) { return /^\/?$/.test(child.path); })) {
        warn(
          false,
          "Named Route '" + (route.name) + "' has a default child route. " +
          "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
          "the default child route will not be rendered. Remove the name from " +
          "this route and use the name of the default child route for named " +
          "links instead."
        );
      }
    }
    route.children.forEach(function (child) {
      var childMatchAs = matchAs
        ? cleanPath((matchAs + "/" + (child.path)))
        : undefined;
      addRouteRecord(pathMap, nameMap, child, record, childMatchAs);
    });
  }

  if (route.alias !== undefined) {
    if (Array.isArray(route.alias)) {
      route.alias.forEach(function (alias) {
        var aliasRoute = {
          path: alias,
          children: route.children
        };
        addRouteRecord(pathMap, nameMap, aliasRoute, parent, record.path);
      });
    } else {
      var aliasRoute = {
        path: route.alias,
        children: route.children
      };
      addRouteRecord(pathMap, nameMap, aliasRoute, parent, record.path);
    }
  }

  if (!pathMap[record.path]) {
    pathMap[record.path] = record;
  }

  if (name) {
    if (!nameMap[name]) {
      nameMap[name] = record;
    } else if (process.env.NODE_ENV !== 'production' && !matchAs) {
      warn(
        false,
        "Duplicate named routes definition: " +
        "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
      );
    }
  }
}

function normalizePath (path, parent) {
  path = path.replace(/\/$/, '');
  if (path[0] === '/') { return path }
  if (parent == null) { return path }
  return cleanPath(((parent.path) + "/" + path))
}

var index$1 = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

var isarray = index$1;

/**
 * Expose `pathToRegexp`.
 */
var index = pathToRegexp;
var parse_1 = parse;
var compile_1 = compile;
var tokensToFunction_1 = tokensToFunction;
var tokensToRegExp_1 = tokensToRegExp;

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment;
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys;
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      });
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options);
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}

index.parse = parse_1;
index.compile = compile_1;
index.tokensToFunction = tokensToFunction_1;
index.tokensToRegExp = tokensToRegExp_1;

/*  */

var regexpCache = Object.create(null);

function getRouteRegex (path) {
  var hit = regexpCache[path];
  var keys, regexp;

  if (hit) {
    keys = hit.keys;
    regexp = hit.regexp;
  } else {
    keys = [];
    regexp = index(path, keys);
    regexpCache[path] = { keys: keys, regexp: regexp };
  }

  return { keys: keys, regexp: regexp }
}

var regexpCompileCache = Object.create(null);

function fillParams (
  path,
  params,
  routeMsg
) {
  try {
    var filler =
      regexpCompileCache[path] ||
      (regexpCompileCache[path] = index.compile(path));
    return filler(params || {}, { pretty: true })
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      warn(false, ("missing param for " + routeMsg + ": " + (e.message)));
    }
    return ''
  }
}

/*  */

function normalizeLocation (
  raw,
  current,
  append
) {
  var next = typeof raw === 'string' ? { path: raw } : raw;
  // named target
  if (next.name || next._normalized) {
    return next
  }

  // relative params
  if (!next.path && next.params && current) {
    next = assign({}, next);
    next._normalized = true;
    var params = assign(assign({}, current.params), next.params);
    if (current.name) {
      next.name = current.name;
      next.params = params;
    } else if (current.matched) {
      var rawPath = current.matched[current.matched.length - 1].path;
      next.path = fillParams(rawPath, params, ("path " + (current.path)));
    } else if (process.env.NODE_ENV !== 'production') {
      warn(false, "relative params navigation requires a current route.");
    }
    return next
  }

  var parsedPath = parsePath(next.path || '');
  var basePath = (current && current.path) || '/';
  var path = parsedPath.path
    ? resolvePath(parsedPath.path, basePath, append || next.append)
    : (current && current.path) || '/';
  var query = resolveQuery(parsedPath.query, next.query);
  var hash = next.hash || parsedPath.hash;
  if (hash && hash.charAt(0) !== '#') {
    hash = "#" + hash;
  }

  return {
    _normalized: true,
    path: path,
    query: query,
    hash: hash
  }
}

function assign (a, b) {
  for (var key in b) {
    a[key] = b[key];
  }
  return a
}

/*  */

function createMatcher (routes) {
  var ref = createRouteMap(routes);
  var pathMap = ref.pathMap;
  var nameMap = ref.nameMap;

  function addRoutes (routes) {
    createRouteMap(routes, pathMap, nameMap);
  }

  function match (
    raw,
    currentRoute,
    redirectedFrom
  ) {
    var location = normalizeLocation(raw, currentRoute);
    var name = location.name;

    if (name) {
      var record = nameMap[name];
      if (process.env.NODE_ENV !== 'production') {
        warn(record, ("Route with name '" + name + "' does not exist"));
      }
      var paramNames = getRouteRegex(record.path).keys
        .filter(function (key) { return !key.optional; })
        .map(function (key) { return key.name; });

      if (typeof location.params !== 'object') {
        location.params = {};
      }

      if (currentRoute && typeof currentRoute.params === 'object') {
        for (var key in currentRoute.params) {
          if (!(key in location.params) && paramNames.indexOf(key) > -1) {
            location.params[key] = currentRoute.params[key];
          }
        }
      }

      if (record) {
        location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
        return _createRoute(record, location, redirectedFrom)
      }
    } else if (location.path) {
      location.params = {};
      for (var path in pathMap) {
        if (matchRoute(path, location.params, location.path)) {
          return _createRoute(pathMap[path], location, redirectedFrom)
        }
      }
    }
    // no match
    return _createRoute(null, location)
  }

  function redirect (
    record,
    location
  ) {
    var originalRedirect = record.redirect;
    var redirect = typeof originalRedirect === 'function'
        ? originalRedirect(createRoute(record, location))
        : originalRedirect;

    if (typeof redirect === 'string') {
      redirect = { path: redirect };
    }

    if (!redirect || typeof redirect !== 'object') {
      process.env.NODE_ENV !== 'production' && warn(
        false, ("invalid redirect option: " + (JSON.stringify(redirect)))
      );
      return _createRoute(null, location)
    }

    var re = redirect;
    var name = re.name;
    var path = re.path;
    var query = location.query;
    var hash = location.hash;
    var params = location.params;
    query = re.hasOwnProperty('query') ? re.query : query;
    hash = re.hasOwnProperty('hash') ? re.hash : hash;
    params = re.hasOwnProperty('params') ? re.params : params;

    if (name) {
      // resolved named direct
      var targetRecord = nameMap[name];
      if (process.env.NODE_ENV !== 'production') {
        assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
      }
      return match({
        _normalized: true,
        name: name,
        query: query,
        hash: hash,
        params: params
      }, undefined, location)
    } else if (path) {
      // 1. resolve relative redirect
      var rawPath = resolveRecordPath(path, record);
      // 2. resolve params
      var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
      // 3. rematch with existing query and hash
      return match({
        _normalized: true,
        path: resolvedPath,
        query: query,
        hash: hash
      }, undefined, location)
    } else {
      warn(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
      return _createRoute(null, location)
    }
  }

  function alias (
    record,
    location,
    matchAs
  ) {
    var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
    var aliasedMatch = match({
      _normalized: true,
      path: aliasedPath
    });
    if (aliasedMatch) {
      var matched = aliasedMatch.matched;
      var aliasedRecord = matched[matched.length - 1];
      location.params = aliasedMatch.params;
      return _createRoute(aliasedRecord, location)
    }
    return _createRoute(null, location)
  }

  function _createRoute (
    record,
    location,
    redirectedFrom
  ) {
    if (record && record.redirect) {
      return redirect(record, redirectedFrom || location)
    }
    if (record && record.matchAs) {
      return alias(record, location, record.matchAs)
    }
    return createRoute(record, location, redirectedFrom)
  }

  return {
    match: match,
    addRoutes: addRoutes
  }
}

function matchRoute (
  path,
  params,
  pathname
) {
  var ref = getRouteRegex(path);
  var regexp = ref.regexp;
  var keys = ref.keys;
  var m = pathname.match(regexp);

  if (!m) {
    return false
  } else if (!params) {
    return true
  }

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];
    var val = typeof m[i] === 'string' ? decodeURIComponent(m[i]) : m[i];
    if (key) { params[key.name] = val; }
  }

  return true
}

function resolveRecordPath (path, record) {
  return resolvePath(path, record.parent ? record.parent.path : '/', true)
}

/*  */


var positionStore = Object.create(null);

function setupScroll () {
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.key) {
      setStateKey(e.state.key);
    }
  });

  window.addEventListener('scroll', saveScrollPosition);
}

function handleScroll (
  router,
  to,
  from,
  isPop
) {
  if (!router.app) {
    return
  }

  var behavior = router.options.scrollBehavior;
  if (!behavior) {
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    assert(typeof behavior === 'function', "scrollBehavior must be a function");
  }

  // wait until re-render finishes before scrolling
  router.app.$nextTick(function () {
    var position = getScrollPosition();
    var shouldScroll = behavior(to, from, isPop ? position : null);
    if (!shouldScroll) {
      return
    }
    var isObject = typeof shouldScroll === 'object';
    if (isObject && typeof shouldScroll.selector === 'string') {
      var el = document.querySelector(shouldScroll.selector);
      if (el) {
        position = getElementPosition(el);
      } else if (isValidPosition(shouldScroll)) {
        position = normalizePosition(shouldScroll);
      }
    } else if (isObject && isValidPosition(shouldScroll)) {
      position = normalizePosition(shouldScroll);
    }

    if (position) {
      window.scrollTo(position.x, position.y);
    }
  });
}

function saveScrollPosition () {
  var key = getStateKey();
  if (key) {
    positionStore[key] = {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  }
}

function getScrollPosition () {
  var key = getStateKey();
  if (key) {
    return positionStore[key]
  }
}

function getElementPosition (el) {
  var docRect = document.documentElement.getBoundingClientRect();
  var elRect = el.getBoundingClientRect();
  return {
    x: elRect.left - docRect.left,
    y: elRect.top - docRect.top
  }
}

function isValidPosition (obj) {
  return isNumber(obj.x) || isNumber(obj.y)
}

function normalizePosition (obj) {
  return {
    x: isNumber(obj.x) ? obj.x : window.pageXOffset,
    y: isNumber(obj.y) ? obj.y : window.pageYOffset
  }
}

function isNumber (v) {
  return typeof v === 'number'
}

/*  */

var supportsPushState = inBrowser && (function () {
  var ua = window.navigator.userAgent;

  if (
    (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
    ua.indexOf('Mobile Safari') !== -1 &&
    ua.indexOf('Chrome') === -1 &&
    ua.indexOf('Windows Phone') === -1
  ) {
    return false
  }

  return window.history && 'pushState' in window.history
})();

// use User Timing api (if present) for more accurate key precision
var Time = inBrowser && window.performance && window.performance.now
  ? window.performance
  : Date;

var _key = genKey();

function genKey () {
  return Time.now().toFixed(3)
}

function getStateKey () {
  return _key
}

function setStateKey (key) {
  _key = key;
}

function pushState (url, replace) {
  // try...catch the pushState call to get around Safari
  // DOM Exception 18 where it limits to 100 pushState calls
  var history = window.history;
  try {
    if (replace) {
      history.replaceState({ key: _key }, '', url);
    } else {
      _key = genKey();
      history.pushState({ key: _key }, '', url);
    }
    saveScrollPosition();
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url);
  }
}

function replaceState (url) {
  pushState(url, true);
}

/*  */

function runQueue (queue, fn, cb) {
  var step = function (index) {
    if (index >= queue.length) {
      cb();
    } else {
      if (queue[index]) {
        fn(queue[index], function () {
          step(index + 1);
        });
      } else {
        step(index + 1);
      }
    }
  };
  step(0);
}

/*  */


var History = function History (router, base) {
  this.router = router;
  this.base = normalizeBase(base);
  // start with a route object that stands for "nowhere"
  this.current = START;
  this.pending = null;
  this.ready = false;
  this.readyCbs = [];
};

History.prototype.listen = function listen (cb) {
  this.cb = cb;
};

History.prototype.onReady = function onReady (cb) {
  if (this.ready) {
    cb();
  } else {
    this.readyCbs.push(cb);
  }
};

History.prototype.transitionTo = function transitionTo (location, onComplete, onAbort) {
    var this$1 = this;

  var route = this.router.match(location, this.current);
  this.confirmTransition(route, function () {
    this$1.updateRoute(route);
    onComplete && onComplete(route);
    this$1.ensureURL();

    // fire ready cbs once
    if (!this$1.ready) {
      this$1.ready = true;
      this$1.readyCbs.forEach(function (cb) {
        cb(route);
      });
    }
  }, onAbort);
};

History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
    var this$1 = this;

  var current = this.current;
  var abort = function () { onAbort && onAbort(); };
  if (
    isSameRoute(route, current) &&
    // in the case the route map has been dynamically appended to
    route.matched.length === current.matched.length
  ) {
    this.ensureURL();
    return abort()
  }

  var ref = resolveQueue(this.current.matched, route.matched);
    var updated = ref.updated;
    var deactivated = ref.deactivated;
    var activated = ref.activated;

  var queue = [].concat(
    // in-component leave guards
    extractLeaveGuards(deactivated),
    // global before hooks
    this.router.beforeHooks,
    // in-component update hooks
    extractUpdateHooks(updated),
    // in-config enter guards
    activated.map(function (m) { return m.beforeEnter; }),
    // async components
    resolveAsyncComponents(activated)
  );

  this.pending = route;
  var iterator = function (hook, next) {
    if (this$1.pending !== route) {
      return abort()
    }
    hook(route, current, function (to) {
      if (to === false) {
        // next(false) -> abort navigation, ensure current URL
        this$1.ensureURL(true);
        abort();
      } else if (typeof to === 'string' || typeof to === 'object') {
        // next('/') or next({ path: '/' }) -> redirect
        (typeof to === 'object' && to.replace) ? this$1.replace(to) : this$1.push(to);
        abort();
      } else {
        // confirm transition and pass on the value
        next(to);
      }
    });
  };

  runQueue(queue, iterator, function () {
    var postEnterCbs = [];
    var isValid = function () { return this$1.current === route; };
    var enterGuards = extractEnterGuards(activated, postEnterCbs, isValid);
    // wait until async components are resolved before
    // extracting in-component enter guards
    runQueue(enterGuards, iterator, function () {
      if (this$1.pending !== route) {
        return abort()
      }
      this$1.pending = null;
      onComplete(route);
      if (this$1.router.app) {
        this$1.router.app.$nextTick(function () {
          postEnterCbs.forEach(function (cb) { return cb(); });
        });
      }
    });
  });
};

History.prototype.updateRoute = function updateRoute (route) {
  var prev = this.current;
  this.current = route;
  this.cb && this.cb(route);
  this.router.afterHooks.forEach(function (hook) {
    hook && hook(route, prev);
  });
};

function normalizeBase (base) {
  if (!base) {
    if (inBrowser) {
      // respect <base> tag
      var baseEl = document.querySelector('base');
      base = baseEl ? baseEl.getAttribute('href') : '/';
    } else {
      base = '/';
    }
  }
  // make sure there's the starting slash
  if (base.charAt(0) !== '/') {
    base = '/' + base;
  }
  // remove trailing slash
  return base.replace(/\/$/, '')
}

function resolveQueue (
  current,
  next
) {
  var i;
  var max = Math.max(current.length, next.length);
  for (i = 0; i < max; i++) {
    if (current[i] !== next[i]) {
      break
    }
  }
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i)
  }
}

function extractGuards (
  records,
  name,
  bind,
  reverse
) {
  var guards = flatMapComponents(records, function (def, instance, match, key) {
    var guard = extractGuard(def, name);
    if (guard) {
      return Array.isArray(guard)
        ? guard.map(function (guard) { return bind(guard, instance, match, key); })
        : bind(guard, instance, match, key)
    }
  });
  return flatten(reverse ? guards.reverse() : guards)
}

function extractGuard (
  def,
  key
) {
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    def = _Vue.extend(def);
  }
  return def.options[key]
}

function extractLeaveGuards (deactivated) {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
}

function extractUpdateHooks (updated) {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
}

function bindGuard (guard, instance) {
  return function boundRouteGuard () {
    return guard.apply(instance, arguments)
  }
}

function extractEnterGuards (
  activated,
  cbs,
  isValid
) {
  return extractGuards(activated, 'beforeRouteEnter', function (guard, _, match, key) {
    return bindEnterGuard(guard, match, key, cbs, isValid)
  })
}

function bindEnterGuard (
  guard,
  match,
  key,
  cbs,
  isValid
) {
  return function routeEnterGuard (to, from, next) {
    return guard(to, from, function (cb) {
      next(cb);
      if (typeof cb === 'function') {
        cbs.push(function () {
          // #750
          // if a router-view is wrapped with an out-in transition,
          // the instance may not have been registered at this time.
          // we will need to poll for registration until current route
          // is no longer valid.
          poll(cb, match.instances, key, isValid);
        });
      }
    })
  }
}

function poll (
  cb, // somehow flow cannot infer this is a function
  instances,
  key,
  isValid
) {
  if (instances[key]) {
    cb(instances[key]);
  } else if (isValid()) {
    setTimeout(function () {
      poll(cb, instances, key, isValid);
    }, 16);
  }
}

function resolveAsyncComponents (matched) {
  return flatMapComponents(matched, function (def, _, match, key) {
    // if it's a function and doesn't have Vue options attached,
    // assume it's an async component resolve function.
    // we are not using Vue's default async resolving mechanism because
    // we want to halt the navigation until the incoming component has been
    // resolved.
    if (typeof def === 'function' && !def.options) {
      return function (to, from, next) {
        var resolve = once(function (resolvedDef) {
          match.components[key] = resolvedDef;
          next();
        });

        var reject = once(function (reason) {
          warn(false, ("Failed to resolve async component " + key + ": " + reason));
          next(false);
        });

        var res = def(resolve, reject);
        if (res && typeof res.then === 'function') {
          res.then(resolve, reject);
        }
      }
    }
  })
}

function flatMapComponents (
  matched,
  fn
) {
  return flatten(matched.map(function (m) {
    return Object.keys(m.components).map(function (key) { return fn(
      m.components[key],
      m.instances[key],
      m, key
    ); })
  }))
}

function flatten (arr) {
  return Array.prototype.concat.apply([], arr)
}

// in Webpack 2, require.ensure now also returns a Promise
// so the resolve/reject functions may get called an extra time
// if the user uses an arrow function shorthand that happens to
// return that Promise.
function once (fn) {
  var called = false;
  return function () {
    if (called) { return }
    called = true;
    return fn.apply(this, arguments)
  }
}

/*  */


var HTML5History = (function (History$$1) {
  function HTML5History (router, base) {
    var this$1 = this;

    History$$1.call(this, router, base);

    var expectScroll = router.options.scrollBehavior;

    if (expectScroll) {
      setupScroll();
    }

    window.addEventListener('popstate', function (e) {
      this$1.transitionTo(getLocation(this$1.base), function (route) {
        if (expectScroll) {
          handleScroll(router, route, this$1.current, true);
        }
      });
    });
  }

  if ( History$$1 ) HTML5History.__proto__ = History$$1;
  HTML5History.prototype = Object.create( History$$1 && History$$1.prototype );
  HTML5History.prototype.constructor = HTML5History;

  HTML5History.prototype.go = function go (n) {
    window.history.go(n);
  };

  HTML5History.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      pushState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, this$1.current, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      replaceState(cleanPath(this$1.base + route.fullPath));
      handleScroll(this$1.router, route, this$1.current, false);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HTML5History.prototype.ensureURL = function ensureURL (push) {
    if (getLocation(this.base) !== this.current.fullPath) {
      var current = cleanPath(this.base + this.current.fullPath);
      push ? pushState(current) : replaceState(current);
    }
  };

  HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
    return getLocation(this.base)
  };

  return HTML5History;
}(History));

function getLocation (base) {
  var path = window.location.pathname;
  if (base && path.indexOf(base) === 0) {
    path = path.slice(base.length);
  }
  return (path || '/') + window.location.search + window.location.hash
}

/*  */


var HashHistory = (function (History$$1) {
  function HashHistory (router, base, fallback) {
    History$$1.call(this, router, base);
    // check history fallback deeplinking
    if (fallback && checkFallback(this.base)) {
      return
    }
    ensureSlash();
  }

  if ( History$$1 ) HashHistory.__proto__ = History$$1;
  HashHistory.prototype = Object.create( History$$1 && History$$1.prototype );
  HashHistory.prototype.constructor = HashHistory;

  // this is delayed until the app mounts
  // to avoid the hashchange listener being fired too early
  HashHistory.prototype.setupListeners = function setupListeners () {
    var this$1 = this;

    window.addEventListener('hashchange', function () {
      if (!ensureSlash()) {
        return
      }
      this$1.transitionTo(getHash(), function (route) {
        replaceHash(route.fullPath);
      });
    });
  };

  HashHistory.prototype.push = function push (location, onComplete, onAbort) {
    this.transitionTo(location, function (route) {
      pushHash(route.fullPath);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    this.transitionTo(location, function (route) {
      replaceHash(route.fullPath);
      onComplete && onComplete(route);
    }, onAbort);
  };

  HashHistory.prototype.go = function go (n) {
    window.history.go(n);
  };

  HashHistory.prototype.ensureURL = function ensureURL (push) {
    var current = this.current.fullPath;
    if (getHash() !== current) {
      push ? pushHash(current) : replaceHash(current);
    }
  };

  HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    return getHash()
  };

  return HashHistory;
}(History));

function checkFallback (base) {
  var location = getLocation(base);
  if (!/^\/#/.test(location)) {
    window.location.replace(
      cleanPath(base + '/#' + location)
    );
    return true
  }
}

function ensureSlash () {
  var path = getHash();
  if (path.charAt(0) === '/') {
    return true
  }
  replaceHash('/' + path);
  return false
}

function getHash () {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var index = href.indexOf('#');
  return index === -1 ? '' : href.slice(index + 1)
}

function pushHash (path) {
  window.location.hash = path;
}

function replaceHash (path) {
  var i = window.location.href.indexOf('#');
  window.location.replace(
    window.location.href.slice(0, i >= 0 ? i : 0) + '#' + path
  );
}

/*  */


var AbstractHistory = (function (History$$1) {
  function AbstractHistory (router, base) {
    History$$1.call(this, router, base);
    this.stack = [];
    this.index = -1;
  }

  if ( History$$1 ) AbstractHistory.__proto__ = History$$1;
  AbstractHistory.prototype = Object.create( History$$1 && History$$1.prototype );
  AbstractHistory.prototype.constructor = AbstractHistory;

  AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
      this$1.index++;
      onComplete && onComplete(route);
    }, onAbort);
  };

  AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
    var this$1 = this;

    this.transitionTo(location, function (route) {
      this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
      onComplete && onComplete(route);
    }, onAbort);
  };

  AbstractHistory.prototype.go = function go (n) {
    var this$1 = this;

    var targetIndex = this.index + n;
    if (targetIndex < 0 || targetIndex >= this.stack.length) {
      return
    }
    var route = this.stack[targetIndex];
    this.confirmTransition(route, function () {
      this$1.index = targetIndex;
      this$1.updateRoute(route);
    });
  };

  AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
    var current = this.stack[this.stack.length - 1];
    return current ? current.fullPath : '/'
  };

  AbstractHistory.prototype.ensureURL = function ensureURL () {
    // noop
  };

  return AbstractHistory;
}(History));

/*  */

var VueRouter = function VueRouter (options) {
  if ( options === void 0 ) options = {};

  this.app = null;
  this.apps = [];
  this.options = options;
  this.beforeHooks = [];
  this.afterHooks = [];
  this.matcher = createMatcher(options.routes || []);

  var mode = options.mode || 'hash';
  this.fallback = mode === 'history' && !supportsPushState;
  if (this.fallback) {
    mode = 'hash';
  }
  if (!inBrowser) {
    mode = 'abstract';
  }
  this.mode = mode;

  switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base);
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback);
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base);
      break
    default:
      if (process.env.NODE_ENV !== 'production') {
        assert(false, ("invalid mode: " + mode));
      }
  }
};

var prototypeAccessors = { currentRoute: {} };

VueRouter.prototype.match = function match (
  raw,
  current,
  redirectedFrom
) {
  return this.matcher.match(raw, current, redirectedFrom)
};

prototypeAccessors.currentRoute.get = function () {
  return this.history && this.history.current
};

VueRouter.prototype.init = function init (app /* Vue component instance */) {
    var this$1 = this;

  process.env.NODE_ENV !== 'production' && assert(
    install.installed,
    "not installed. Make sure to call `Vue.use(VueRouter)` " +
    "before creating root instance."
  );

  this.apps.push(app);

  // main app already initialized.
  if (this.app) {
    return
  }

  this.app = app;

  var history = this.history;

  if (history instanceof HTML5History) {
    history.transitionTo(history.getCurrentLocation());
  } else if (history instanceof HashHistory) {
    var setupHashListener = function () {
      history.setupListeners();
    };
    history.transitionTo(
      history.getCurrentLocation(),
      setupHashListener,
      setupHashListener
    );
  }

  history.listen(function (route) {
    this$1.apps.forEach(function (app) {
      app._route = route;
    });
  });
};

VueRouter.prototype.beforeEach = function beforeEach (fn) {
  this.beforeHooks.push(fn);
};

VueRouter.prototype.afterEach = function afterEach (fn) {
  this.afterHooks.push(fn);
};

VueRouter.prototype.onReady = function onReady (cb) {
  this.history.onReady(cb);
};

VueRouter.prototype.push = function push (location, onComplete, onAbort) {
  this.history.push(location, onComplete, onAbort);
};

VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
  this.history.replace(location, onComplete, onAbort);
};

VueRouter.prototype.go = function go (n) {
  this.history.go(n);
};

VueRouter.prototype.back = function back () {
  this.go(-1);
};

VueRouter.prototype.forward = function forward () {
  this.go(1);
};

VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
  var route = to
    ? this.resolve(to).route
    : this.currentRoute;
  if (!route) {
    return []
  }
  return [].concat.apply([], route.matched.map(function (m) {
    return Object.keys(m.components).map(function (key) {
      return m.components[key]
    })
  }))
};

VueRouter.prototype.resolve = function resolve (
  to,
  current,
  append
) {
  var location = normalizeLocation(to, current || this.history.current, append);
  var route = this.match(location, current);
  var fullPath = route.redirectedFrom || route.fullPath;
  var base = this.history.base;
  var href = createHref(base, fullPath, this.mode);
  return {
    location: location,
    route: route,
    href: href,
    // for backwards compat
    normalizedTo: location,
    resolved: route
  }
};

VueRouter.prototype.addRoutes = function addRoutes (routes) {
  this.matcher.addRoutes(routes);
  if (this.history.current !== START) {
    this.history.transitionTo(this.history.getCurrentLocation());
  }
};

Object.defineProperties( VueRouter.prototype, prototypeAccessors );

function createHref (base, fullPath, mode) {
  var path = mode === 'hash' ? '#' + fullPath : fullPath;
  return base ? cleanPath(base + '/' + path) : path
}

VueRouter.install = install;
VueRouter.version = '2.2.0';

if (inBrowser && window.Vue) {
  window.Vue.use(VueRouter);
}

module.exports = VueRouter;

}).call(this,require('_process'))

},{"_process":1}],5:[function(require,module,exports){
(function (process,global){
/*!
 * Vue.js v2.1.10
 * (c) 2014-2017 Evan You
 * Released under the MIT License.
 */
'use strict';

/*  */

/**
 * Convert a value to a string that is actually rendered.
 */
function _toString (val) {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Remove an item from an array
 */
function remove$1 (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Check if value is primitive
 */
function isPrimitive (value) {
  return typeof value === 'string' || typeof value === 'number'
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /([^-])([A-Z])/g;
var hyphenate = cached(function (str) {
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase()
});

/**
 * Simple bind, faster than native
 */
function bind$1 (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length;
  return boundFn
}

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/**
 * Perform no operation.
 */
function noop () {}

/**
 * Always return false.
 */
var no = function () { return false; };

/**
 * Return same value
 */
var identity = function (_) { return _; };

/**
 * Generate a static keys string from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    return JSON.stringify(a) === JSON.stringify(b)
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

function looseIndexOf (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/*  */

var config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Whether to enable devtools
   */
  devtools: process.env.NODE_ENV !== 'production',

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * List of asset types that a component can own.
   */
  _assetTypes: [
    'component',
    'directive',
    'filter'
  ],

  /**
   * List of lifecycle hooks.
   */
  _lifecycleHooks: [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated'
  ],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   */
  _maxUpdateCount: 100
};

/*  */

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = /[^\w.$]/;
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  } else {
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }
}

/*  */
/* globals MutationObserver */

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = UA && UA.indexOf('android') > 0;
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && typeof global !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = global['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return /native code/.test(Ctor.toString())
}

/**
 * Defer a task to execute it asynchronously.
 */
var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;

  function nextTickHandler () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // the nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    var logError = function (err) { console.error(err); };
    timerFunc = function () {
      p.then(nextTickHandler).catch(logError);
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
  } else if (typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // use MutationObserver where native Promise is not available,
    // e.g. PhantomJS IE11, iOS7, Android 4.4
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
  } else {
    // fallback to setTimeout
    /* istanbul ignore next */
    timerFunc = function () {
      setTimeout(nextTickHandler, 0);
    };
  }

  return function queueNextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) { cb.call(ctx); }
      if (_resolve) { _resolve(ctx); }
    });
    if (!pending) {
      pending = true;
      timerFunc();
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }
})();

var _Set;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = (function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}

var warn = noop;
var formatComponentName;

if (process.env.NODE_ENV !== 'production') {
  var hasConsole = typeof console !== 'undefined';

  warn = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.error("[Vue warn]: " + msg + " " + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ));
    }
  };

  formatComponentName = function (vm) {
    if (vm.$root === vm) {
      return 'root instance'
    }
    var name = vm._isVue
      ? vm.$options.name || vm.$options._componentTag
      : vm.name;
    return (
      (name ? ("component <" + name + ">") : "anonymous component") +
      (vm._isVue && vm.$options.__file ? (" at " + (vm.$options.__file)) : '')
    )
  };

  var formatLocation = function (str) {
    if (str === 'anonymous component') {
      str += " - use the \"name\" option for better debugging messages.";
    }
    return ("\n(found in " + str + ")")
  };
}

/*  */


var uid$1 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid$1++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove$1(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stablize the subscriber list first
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;
var targetStack = [];

function pushTarget (_target) {
  if (Dep.target) { targetStack.push(Dep.target); }
  Dep.target = _target;
}

function popTarget () {
  Dep.target = targetStack.pop();
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var arguments$1 = arguments;

    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments$1[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
var observerState = {
  shouldConvert: true,
  isSettingProps: false
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    var augment = hasProto
      ? protoAugment
      : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (value, asRootData) {
  if (!isObject(value)) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (Array.isArray(value)) {
          dependArray(value);
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set$1 (obj, key, val) {
  if (Array.isArray(obj)) {
    obj.length = Math.max(obj.length, key);
    obj.splice(key, 1, val);
    return val
  }
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return
  }
  var ob = obj.__ob__;
  if (obj._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return
  }
  if (!ob) {
    obj[key] = val;
    return
  }
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (obj, key) {
  var ob = obj.__ob__;
  if (obj._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  if (!hasOwn(obj, key)) {
    return
  }
  delete obj[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
if (process.env.NODE_ENV !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) { return to }
  var key, toVal, fromVal;
  var keys = Object.keys(from);
  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set$1(to, key, fromVal);
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        childVal.call(this),
        parentVal.call(this)
      )
    }
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal;
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
};

/**
 * Hooks and param attributes are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

config._lifecycleHooks.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (parentVal, childVal) {
  var res = Object.create(parentVal || null);
  return childVal
    ? extend(res, childVal)
    : res
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (parentVal, childVal) {
  /* istanbul ignore if */
  if (!childVal) { return parentVal }
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent
      ? parent.concat(child)
      : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.computed = function (parentVal, childVal) {
  if (!childVal) { return parentVal }
  if (!parentVal) { return childVal }
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret
};

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (var key in options.components) {
    var lower = key.toLowerCase();
    if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + key
      );
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  }
  options.props = res;
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def = dirs[key];
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child);
  }
  normalizeProps(child);
  normalizeDirectives(child);
  var extendsFrom = child.extends;
  if (extendsFrom) {
    parent = typeof extendsFrom === 'function'
      ? mergeOptions(parent, extendsFrom.options, vm)
      : mergeOptions(parent, extendsFrom, vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      var mixin = child.mixins[i];
      if (mixin.prototype instanceof Vue$2) {
        mixin = mixin.options;
      }
      parent = mergeOptions(parent, mixin, vm);
    }
  }
  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) { return assets[id] }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
  // fallback to prototype chain
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */

function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // handle boolean props
  if (isType(Boolean, prop.type)) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (!isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
      value = true;
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldConvert = observerState.shouldConvert;
    observerState.shouldConvert = true;
    observe(value);
    observerState.shouldConvert = prevShouldConvert;
  }
  if (process.env.NODE_ENV !== 'production') {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm[key] !== undefined) {
    return vm[key]
  }
  // call factory function for non-Function types
  return typeof def === 'function' && prop.type !== Function
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    warn(
      'Invalid prop: type check failed for prop "' + name + '".' +
      ' Expected ' + expectedTypes.map(capitalize).join(', ') +
      ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
      vm
    );
    return
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

/**
 * Assert the type of a value
 */
function assertType (value, type) {
  var valid;
  var expectedType = getType(type);
  if (expectedType === 'String') {
    valid = typeof value === (expectedType = 'string');
  } else if (expectedType === 'Number') {
    valid = typeof value === (expectedType = 'number');
  } else if (expectedType === 'Boolean') {
    valid = typeof value === (expectedType = 'boolean');
  } else if (expectedType === 'Function') {
    valid = typeof value === (expectedType = 'function');
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match && match[1]
}

function isType (type, fn) {
  if (!Array.isArray(fn)) {
    return getType(fn) === getType(type)
  }
  for (var i = 0, len = fn.length; i < len; i++) {
    if (getType(fn[i]) === getType(type)) {
      return true
    }
  }
  /* istanbul ignore next */
  return false
}



var util = Object.freeze({
	defineReactive: defineReactive$$1,
	_toString: _toString,
	toNumber: toNumber,
	makeMap: makeMap,
	isBuiltInTag: isBuiltInTag,
	remove: remove$1,
	hasOwn: hasOwn,
	isPrimitive: isPrimitive,
	cached: cached,
	camelize: camelize,
	capitalize: capitalize,
	hyphenate: hyphenate,
	bind: bind$1,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	toObject: toObject,
	noop: noop,
	no: no,
	identity: identity,
	genStaticKeys: genStaticKeys,
	looseEqual: looseEqual,
	looseIndexOf: looseIndexOf,
	isReserved: isReserved,
	def: def,
	parsePath: parsePath,
	hasProto: hasProto,
	inBrowser: inBrowser,
	UA: UA,
	isIE: isIE,
	isIE9: isIE9,
	isEdge: isEdge,
	isAndroid: isAndroid,
	isIOS: isIOS,
	isServerRendering: isServerRendering,
	devtools: devtools,
	nextTick: nextTick,
	get _Set () { return _Set; },
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	get warn () { return warn; },
	get formatComponentName () { return formatComponentName; },
	validateProp: validateProp
});

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

if (process.env.NODE_ENV !== 'production') {
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn(
      "Property or method \"" + key + "\" is not defined on the instance but " +
      "referenced during render. Make sure to declare reactive data " +
      "properties in the data option.",
      target
    );
  };

  var hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  var hasHandler = {
    has: function has (target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) || key.charAt(0) === '_';
      if (!has && !isAllowed) {
        warnNonPresent(target, key);
      }
      return has || !isAllowed
    }
  };

  var getHandler = {
    get: function get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        warnNonPresent(target, key);
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  context,
  componentOptions
) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.functionalContext = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
};

var prototypeAccessors = { child: {} };

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
prototypeAccessors.child.get = function () {
  return this.componentInstance
};

Object.defineProperties( VNode.prototype, prototypeAccessors );

var createEmptyVNode = function () {
  var node = new VNode();
  node.text = '';
  node.isComment = true;
  return node
};

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isCloned = true;
  return cloned
}

function cloneVNodes (vnodes) {
  var res = new Array(vnodes.length);
  for (var i = 0; i < vnodes.length; i++) {
    res[i] = cloneVNode(vnodes[i]);
  }
  return res
}

/*  */

var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy$1 };
var hooksToMerge = Object.keys(hooks);

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (!Ctor) {
    return
  }

  var baseCtor = context.$options._base;
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(("Invalid Component definition: " + (String(Ctor))), context);
    }
    return
  }

  // async component
  if (!Ctor.cid) {
    if (Ctor.resolved) {
      Ctor = Ctor.resolved;
    } else {
      Ctor = resolveAsyncComponent(Ctor, baseCtor, function () {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered by the scheduler.
        context.$forceUpdate();
      });
      if (!Ctor) {
        // return nothing if this is indeed an async component
        // wait for the callback to trigger parent update.
        return
      }
    }
  }

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  data = data || {};

  // extract props
  var propsData = extractProps(data, Ctor);

  // functional component
  if (Ctor.options.functional) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  data.on = data.nativeOn;

  if (Ctor.options.abstract) {
    // abstract components do not keep anything
    // other than props & listeners
    data = {};
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children }
  );
  return vnode
}

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  context,
  children
) {
  var props = {};
  var propOptions = Ctor.options.props;
  if (propOptions) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData);
    }
  }
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  var _context = Object.create(context);
  var h = function (a, b, c, d) { return createElement(_context, a, b, c, d, true); };
  var vnode = Ctor.options.render.call(null, h, {
    props: props,
    data: data,
    parent: context,
    children: children,
    slots: function () { return resolveSlots(children, context); }
  });
  if (vnode instanceof VNode) {
    vnode.functionalContext = context;
    if (data.slot) {
      (vnode.data || (vnode.data = {})).slot = data.slot;
    }
  }
  return vnode
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent, // activeInstance in lifecycle state
  parentElm,
  refElm
) {
  var vnodeComponentOptions = vnode.componentOptions;
  var options = {
    _isComponent: true,
    parent: parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children,
    _parentElm: parentElm || null,
    _refElm: refElm || null
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (inlineTemplate) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnodeComponentOptions.Ctor(options)
}

function init (
  vnode,
  hydrating,
  parentElm,
  refElm
) {
  if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
    var child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance,
      parentElm,
      refElm
    );
    child.$mount(hydrating ? vnode.elm : undefined, hydrating);
  } else if (vnode.data.keepAlive) {
    // kept-alive components, treat as a patch
    var mountedNode = vnode; // work around flow
    prepatch(mountedNode, mountedNode);
  }
}

function prepatch (
  oldVnode,
  vnode
) {
  var options = vnode.componentOptions;
  var child = vnode.componentInstance = oldVnode.componentInstance;
  child._updateFromParent(
    options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
  );
}

function insert (vnode) {
  if (!vnode.componentInstance._isMounted) {
    vnode.componentInstance._isMounted = true;
    callHook(vnode.componentInstance, 'mounted');
  }
  if (vnode.data.keepAlive) {
    vnode.componentInstance._inactive = false;
    callHook(vnode.componentInstance, 'activated');
  }
}

function destroy$1 (vnode) {
  if (!vnode.componentInstance._isDestroyed) {
    if (!vnode.data.keepAlive) {
      vnode.componentInstance.$destroy();
    } else {
      vnode.componentInstance._inactive = true;
      callHook(vnode.componentInstance, 'deactivated');
    }
  }
}

function resolveAsyncComponent (
  factory,
  baseCtor,
  cb
) {
  if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb);
  } else {
    factory.requested = true;
    var cbs = factory.pendingCallbacks = [cb];
    var sync = true;

    var resolve = function (res) {
      if (isObject(res)) {
        res = baseCtor.extend(res);
      }
      // cache resolved
      factory.resolved = res;
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        for (var i = 0, l = cbs.length; i < l; i++) {
          cbs[i](res);
        }
      }
    };

    var reject = function (reason) {
      process.env.NODE_ENV !== 'production' && warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      );
    };

    var res = factory(resolve, reject);

    // handle promise
    if (res && typeof res.then === 'function' && !factory.resolved) {
      res.then(resolve, reject);
    }

    sync = false;
    // return in case resolved synchronously
    return factory.resolved
  }
}

function extractProps (data, Ctor) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (!propOptions) {
    return
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  var domProps = data.domProps;
  if (attrs || props || domProps) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey) ||
      checkProp(res, domProps, key, altKey);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (hash) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

function mergeHooks (data) {
  if (!data.hook) {
    data.hook = {};
  }
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var fromParent = data.hook[key];
    var ours = hooks[key];
    data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
  }
}

function mergeHook$1 (one, two) {
  return function (a, b, c, d) {
    one(a, b, c, d);
    two(a, b, c, d);
  }
}

/*  */

function mergeVNodeHook (def, hookKey, hook, key) {
  key = key + hookKey;
  var injectedHash = def.__injected || (def.__injected = {});
  if (!injectedHash[key]) {
    injectedHash[key] = true;
    var oldHook = def[hookKey];
    if (oldHook) {
      def[hookKey] = function () {
        oldHook.apply(this, arguments);
        hook.apply(this, arguments);
      };
    } else {
      def[hookKey] = hook;
    }
  }
}

/*  */

var normalizeEvent = cached(function (name) {
  var once = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once,
    capture: capture
  }
});

function createEventHandle (fn) {
  var handle = {
    fn: fn,
    invoker: function () {
      var arguments$1 = arguments;

      var fn = handle.fn;
      if (Array.isArray(fn)) {
        for (var i = 0; i < fn.length; i++) {
          fn[i].apply(null, arguments$1);
        }
      } else {
        fn.apply(null, arguments);
      }
    }
  };
  return handle
}

function updateListeners (
  on,
  oldOn,
  add,
  remove$$1,
  vm
) {
  var name, cur, old, event;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if (!cur) {
      process.env.NODE_ENV !== 'production' && warn(
        "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
        vm
      );
    } else if (!old) {
      if (!cur.invoker) {
        cur = on[name] = createEventHandle(cur);
      }
      add(event.name, cur.invoker, event.once, event.capture);
    } else if (cur !== old) {
      old.fn = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (!on[name]) {
      event = normalizeEvent(name);
      remove$$1(event.name, oldOn[name].invoker, event.capture);
    }
  }
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// nomralization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constrcuts that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren (children) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function normalizeArrayChildren (children, nestedIndex) {
  var res = [];
  var i, c, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (c == null || typeof c === 'boolean') { continue }
    last = res[res.length - 1];
    //  nested
    if (Array.isArray(c)) {
      res.push.apply(res, normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i)));
    } else if (isPrimitive(c)) {
      if (last && last.text) {
        last.text += String(c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (c.text && last && last.text) {
        res[res.length - 1] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (c.tag && c.key == null && nestedIndex != null) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

function getFirstComponentChild (children) {
  return children && children.filter(function (c) { return c && c.componentOptions; })[0]
}

/*  */

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (alwaysNormalize) { normalizationType = ALWAYS_NORMALIZE; }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  if (data && data.__ob__) {
    process.env.NODE_ENV !== 'production' && warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return createEmptyVNode()
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
      typeof children[0] === 'function') {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (vnode) {
    if (ns) { applyNS(vnode, ns); }
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    return
  }
  if (vnode.children) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];
      if (child.tag && !child.ns) {
        applyNS(child, ns);
      }
    }
  }
}

/*  */

function initRender (vm) {
  vm.$vnode = null; // the placeholder node in parent tree
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null;
  var parentVnode = vm.$options._parentVnode;
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext);
  vm.$scopedSlots = {};
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };
}

function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var staticRenderFns = ref.staticRenderFns;
    var _parentVnode = ref._parentVnode;

    if (vm._isMounted) {
      // clone slot nodes on re-renders
      for (var key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key]);
      }
    }

    if (_parentVnode && _parentVnode.data.scopedSlots) {
      vm.$scopedSlots = _parentVnode.data.scopedSlots;
    }

    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = [];
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      /* istanbul ignore else */
      if (config.errorHandler) {
        config.errorHandler.call(null, e, vm);
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn(("Error when rendering " + (formatComponentName(vm)) + ":"));
        }
        throw e
      }
      // return previous vnode to prevent render error causing blank component
      vnode = vm._vnode;
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };

  // toString for mustaches
  Vue.prototype._s = _toString;
  // convert text to vnode
  Vue.prototype._v = createTextVNode;
  // number conversion
  Vue.prototype._n = toNumber;
  // empty vnode
  Vue.prototype._e = createEmptyVNode;
  // loose equal
  Vue.prototype._q = looseEqual;
  // loose indexOf
  Vue.prototype._i = looseIndexOf;

  // render static tree by index
  Vue.prototype._m = function renderStatic (
    index,
    isInFor
  ) {
    var tree = this._staticTrees[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree by doing a shallow clone.
    if (tree && !isInFor) {
      return Array.isArray(tree)
        ? cloneVNodes(tree)
        : cloneVNode(tree)
    }
    // otherwise, render a fresh tree.
    tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy);
    markStatic(tree, ("__static__" + index), false);
    return tree
  };

  // mark node as static (v-once)
  Vue.prototype._o = function markOnce (
    tree,
    index,
    key
  ) {
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  };

  function markStatic (tree, key, isOnce) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  // filter resolution helper
  Vue.prototype._f = function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  };

  // render v-for
  Vue.prototype._l = function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
    return ret
  };

  // renderSlot
  Vue.prototype._t = function (
    name,
    fallback,
    props,
    bindObject
  ) {
    var scopedSlotFn = this.$scopedSlots[name];
    if (scopedSlotFn) { // scoped slot
      props = props || {};
      if (bindObject) {
        extend(props, bindObject);
      }
      return scopedSlotFn(props) || fallback
    } else {
      var slotNodes = this.$slots[name];
      // warn duplicate slot usage
      if (slotNodes && process.env.NODE_ENV !== 'production') {
        slotNodes._rendered && warn(
          "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
          "- this will likely cause render errors.",
          this
        );
        slotNodes._rendered = true;
      }
      return slotNodes || fallback
    }
  };

  // apply v-bind object
  Vue.prototype._b = function bindProps (
    data,
    tag,
    value,
    asProp
  ) {
    if (value) {
      if (!isObject(value)) {
        process.env.NODE_ENV !== 'production' && warn(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        for (var key in value) {
          if (key === 'class' || key === 'style') {
            data[key] = value[key];
          } else {
            var type = data.attrs && data.attrs.type;
            var hash = asProp || config.mustUseProp(tag, type, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
            hash[key] = value[key];
          }
        }
      }
    }
    return data
  };

  // check v-on keyCodes
  Vue.prototype._k = function checkKeyCodes (
    eventKeyCode,
    key,
    builtInAlias
  ) {
    var keyCodes = config.keyCodes[key] || builtInAlias;
    if (Array.isArray(keyCodes)) {
      return keyCodes.indexOf(eventKeyCode) === -1
    } else {
      return keyCodes !== eventKeyCode
    }
  };
}

function resolveSlots (
  children,
  context
) {
  var slots = {};
  if (!children) {
    return slots
  }
  var defaultSlot = [];
  var name, child;
  for (var i = 0, l = children.length; i < l; i++) {
    child = children[i];
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.functionalContext === context) &&
        child.data && (name = child.data.slot)) {
      var slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children);
      } else {
        slot.push(child);
      }
    } else {
      defaultSlot.push(child);
    }
  }
  // ignore single whitespace
  if (defaultSlot.length && !(
    defaultSlot.length === 1 &&
    (defaultSlot[0].text === ' ' || defaultSlot[0].isComment)
  )) {
    slots.default = defaultSlot;
  }
  return slots
}

/*  */

function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add$1 (event, fn, once) {
  if (once) {
    target.$once(event, fn);
  } else {
    target.$on(event, fn);
  }
}

function remove$2 (event, fn) {
  target.$off(event, fn);
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add$1, remove$2, vm);
}

function eventsMixin (Vue) {
  var hookRE = /^hook:/;
  Vue.prototype.$on = function (event, fn) {
    var vm = this;(vm._events[event] || (vm._events[event] = [])).push(fn);
    // optimize hook:event cost by using a boolean flag marked at registration
    // instead of a hash lookup
    if (hookRE.test(event)) {
      vm._hasHookEvent = true;
    }
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (arguments.length === 1) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(vm, args);
      }
    }
    return vm
  };
}

/*  */

var activeInstance = null;

function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin (Vue) {
  Vue.prototype._mount = function (
    el,
    hydrating
  ) {
    var vm = this;
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode;
      if (process.env.NODE_ENV !== 'production') {
        /* istanbul ignore if */
        if (vm.$options.template && vm.$options.template.charAt(0) !== '#') {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'option is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    callHook(vm, 'beforeMount');
    vm._watcher = new Watcher(vm, function updateComponent () {
      vm._update(vm._render(), hydrating);
    }, noop);
    hydrating = false;
    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
      vm._isMounted = true;
      callHook(vm, 'mounted');
    }
    return vm
  };

  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate');
    }
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      );
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    activeInstance = prevActiveInstance;
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  Vue.prototype._updateFromParent = function (
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    var vm = this;
    var hasChildren = !!(vm.$options._renderChildren || renderChildren);
    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // update vm's placeholder node without re-render
    if (vm._vnode) { // update child tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;
    // update props
    if (propsData && vm.$options.props) {
      observerState.shouldConvert = false;
      if (process.env.NODE_ENV !== 'production') {
        observerState.isSettingProps = true;
      }
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        vm[key] = validateProp(key, vm.$options.props, propsData, vm);
      }
      observerState.shouldConvert = true;
      if (process.env.NODE_ENV !== 'production') {
        observerState.isSettingProps = false;
      }
      vm.$options.propsData = propsData;
    }
    // update listeners
    if (listeners) {
      var oldListeners = vm.$options._parentListeners;
      vm.$options._parentListeners = listeners;
      updateComponentListeners(vm, listeners, oldListeners);
    }
    // resolve slots + force update if has children
    if (hasChildren) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove$1(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
  };
}

function callHook (vm, hook) {
  var handlers = vm.$options[hook];
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm);
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
}

/*  */


var queue = [];
var has$1 = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  queue.length = 0;
  has$1 = {};
  if (process.env.NODE_ENV !== 'production') {
    circular = {};
  }
  waiting = flushing = false;
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  flushing = true;
  var watcher, id, vm;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    id = watcher.id;
    has$1[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has$1[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // call updated hooks
  index = queue.length;
  while (index--) {
    watcher = queue[index];
    vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated');
    }
  }

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }

  resetSchedulerState();
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has$1[id] == null) {
    has$1[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i >= 0 && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options
) {
  this.vm = vm;
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression = process.env.NODE_ENV !== 'production'
    ? expOrFn.toString()
    : '';
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = function () {};
      process.env.NODE_ENV !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value = this.getter.call(this.vm, this.vm);
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  popTarget();
  this.cleanupDeps();
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    var dep = this$1.deps[i];
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          /* istanbul ignore else */
          if (config.errorHandler) {
            config.errorHandler.call(null, e, this.vm);
          } else {
            process.env.NODE_ENV !== 'production' && warn(
              ("Error in watcher \"" + (this.expression) + "\""),
              this.vm
            );
            throw e
          }
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
    var this$1 = this;

  var i = this.deps.length;
  while (i--) {
    this$1.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
    var this$1 = this;

  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove$1(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this$1.deps[i].removeSub(this$1);
    }
    this.active = false;
  }
};

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
var seenObjects = new _Set();
function traverse (val) {
  seenObjects.clear();
  _traverse(val, seenObjects);
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || !Object.isExtensible(val)) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

/*  */

function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch) { initWatch(vm, opts.watch); }
}

var isReservedProp = { key: 1, ref: 1, slot: 1 };

function initProps (vm, props) {
  var propsData = vm.$options.propsData || {};
  var keys = vm.$options._propKeys = Object.keys(props);
  var isRoot = !vm.$parent;
  // root instance props should be converted
  observerState.shouldConvert = isRoot;
  var loop = function ( i ) {
    var key = keys[i];
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      if (isReservedProp[key]) {
        warn(
          ("\"" + key + "\" is a reserved attribute and cannot be used as component prop."),
          vm
        );
      }
      defineReactive$$1(vm, key, validateProp(key, props, propsData, vm), function () {
        if (vm.$parent && !observerState.isSettingProps) {
          warn(
            "Avoid mutating a prop directly since the value will be " +
            "overwritten whenever the parent component re-renders. " +
            "Instead, use a data or computed property based on the prop's " +
            "value. Prop being mutated: \"" + key + "\"",
            vm
          );
        }
      });
    } else {
      defineReactive$$1(vm, key, validateProp(key, props, propsData, vm));
    }
  };

  for (var i = 0; i < keys.length; i++) loop( i );
  observerState.shouldConvert = true;
}

function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? data.call(vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var i = keys.length;
  while (i--) {
    if (props && hasOwn(props, keys[i])) {
      process.env.NODE_ENV !== 'production' && warn(
        "The data property \"" + (keys[i]) + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else {
      proxy(vm, keys[i]);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}

var computedSharedDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function initComputed (vm, computed) {
  for (var key in computed) {
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && key in vm) {
      warn(
        "existing instance property \"" + key + "\" will be " +
        "overwritten by a computed property with the same name.",
        vm
      );
    }
    var userDef = computed[key];
    if (typeof userDef === 'function') {
      computedSharedDefinition.get = makeComputedGetter(userDef, vm);
      computedSharedDefinition.set = noop;
    } else {
      computedSharedDefinition.get = userDef.get
        ? userDef.cache !== false
          ? makeComputedGetter(userDef.get, vm)
          : bind$1(userDef.get, vm)
        : noop;
      computedSharedDefinition.set = userDef.set
        ? bind$1(userDef.set, vm)
        : noop;
    }
    Object.defineProperty(vm, key, computedSharedDefinition);
  }
}

function makeComputedGetter (getter, owner) {
  var watcher = new Watcher(owner, getter, noop, {
    lazy: true
  });
  return function computedGetter () {
    if (watcher.dirty) {
      watcher.evaluate();
    }
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value
  }
}

function initMethods (vm, methods) {
  for (var key in methods) {
    vm[key] = methods[key] == null ? noop : bind$1(methods[key], vm);
    if (process.env.NODE_ENV !== 'production' && methods[key] == null) {
      warn(
        "method \"" + key + "\" has an undefined value in the component definition. " +
        "Did you reference the function correctly?",
        vm
      );
    }
  }
}

function initWatch (vm, watch) {
  for (var key in watch) {
    var handler = watch[key];
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (vm, key, handler) {
  var options;
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  vm.$watch(key, handler, options);
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () {
    return this._data
  };
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function (newData) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);

  Vue.prototype.$set = set$1;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

function proxy (vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return vm._data[key]
      },
      set: function proxySetter (val) {
        vm._data[key] = val;
      }
    });
  }
}

/*  */

var uid = 0;

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid++;
    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    }
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initState(vm);
    callHook(vm, 'created');
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  opts.parent = options.parent;
  opts.propsData = options.propsData;
  opts._parentVnode = options._parentVnode;
  opts._parentListeners = options._parentListeners;
  opts._renderChildren = options._renderChildren;
  opts._componentTag = options._componentTag;
  opts._parentElm = options._parentElm;
  opts._refElm = options._refElm;
  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions (Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = Ctor.super.options;
    var cachedSuperOptions = Ctor.superOptions;
    var extendOptions = Ctor.extendOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed
      Ctor.superOptions = superOptions;
      extendOptions.render = options.render;
      extendOptions.staticRenderFns = options.staticRenderFns;
      extendOptions._scopeId = options._scopeId;
      options = Ctor.options = mergeOptions(superOptions, extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

function Vue$2 (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue$2)) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue$2);
stateMixin(Vue$2);
eventsMixin(Vue$2);
lifecycleMixin(Vue$2);
renderMixin(Vue$2);

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return
    }
    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }
    var name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characters and the hyphen, ' +
          'and must start with a letter.'
        );
      }
    }
    var Sub = function VueComponent (options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;
    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub
  };
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  config._assetTypes.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && config.isReservedTag(id)) {
            warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            );
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */

var patternTypes = [String, RegExp];

function getComponentName (opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name) {
  if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else {
    return pattern.test(name)
  }
}

function pruneCache (cache, filter) {
  for (var key in cache) {
    var cachedNode = cache[key];
    if (cachedNode) {
      var name = getComponentName(cachedNode.componentOptions);
      if (name && !filter(name)) {
        pruneCacheEntry(cachedNode);
        cache[key] = null;
      }
    }
  }
}

function pruneCacheEntry (vnode) {
  if (vnode) {
    if (!vnode.componentInstance._inactive) {
      callHook(vnode.componentInstance, 'deactivated');
    }
    vnode.componentInstance.$destroy();
  }
}

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes
  },

  created: function created () {
    this.cache = Object.create(null);
  },

  destroyed: function destroyed () {
    var this$1 = this;

    for (var key in this.cache) {
      pruneCacheEntry(this$1.cache[key]);
    }
  },

  watch: {
    include: function include (val) {
      pruneCache(this.cache, function (name) { return matches(val, name); });
    },
    exclude: function exclude (val) {
      pruneCache(this.cache, function (name) { return !matches(val, name); });
    }
  },

  render: function render () {
    var vnode = getFirstComponentChild(this.$slots.default);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      if (name && (
        (this.include && !matches(this.include, name)) ||
        (this.exclude && matches(this.exclude, name))
      )) {
        return vnode
      }
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
      if (this.cache[key]) {
        vnode.componentInstance = this.cache[key].componentInstance;
      } else {
        this.cache[key] = vnode;
      }
      vnode.data.keepAlive = true;
    }
    return vnode
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive
};

/*  */

function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);
  Vue.util = util;
  Vue.set = set$1;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  Vue.options = Object.create(null);
  config._assetTypes.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue$2);

Object.defineProperty(Vue$2.prototype, '$isServer', {
  get: isServerRendering
});

Vue$2.version = '2.1.10';

/*  */

// attributes that should be using props for binding
var acceptValue = makeMap('input,textarea,option,select');
var mustUseProp = function (tag, type, attr) {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
);

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (childNode.componentInstance) {
    childNode = childNode.componentInstance._vnode;
    if (childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return genClassFromData(data)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: child.class
      ? [child.class, parent.class]
      : parent.class
  }
}

function genClassFromData (data) {
  var dynamicClass = data.class;
  var staticClass = data.staticClass;
  if (staticClass || dynamicClass) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  var res = '';
  if (!value) {
    return res
  }
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        if ((stringified = stringifyClass(value[i]))) {
          res += stringified + ' ';
        }
      }
    }
    return res.slice(0, -1)
  }
  if (isObject(value)) {
    for (var key in value) {
      if (value[key]) { res += key + ' '; }
    }
    return res.slice(0, -1)
  }
  /* istanbul ignore next */
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,' +
  'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);



var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + selector
      );
      return document.createElement('div')
    }
  }
  return el
}

/*  */

function createElement$1 (tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  if (vnode.data && vnode.data.attrs && 'multiple' in vnode.data.attrs) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function setAttribute (node, key, val) {
  node.setAttribute(key, val);
}


var nodeOps = Object.freeze({
	createElement: createElement$1,
	createElementNS: createElementNS,
	createTextNode: createTextNode,
	createComment: createComment,
	insertBefore: insertBefore,
	removeChild: removeChild,
	appendChild: appendChild,
	parentNode: parentNode,
	nextSibling: nextSibling,
	tagName: tagName,
	setTextContent: setTextContent,
	setAttribute: setAttribute
});

/*  */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!key) { return }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove$1(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (Array.isArray(refs[key]) && refs[key].indexOf(ref) < 0) {
        refs[key].push(ref);
      } else {
        refs[key] = [ref];
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *

/*
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks$1 = ['create', 'activate', 'update', 'remove', 'destroy'];

function isUndef (s) {
  return s == null
}

function isDef (s) {
  return s != null
}

function sameVnode (vnode1, vnode2) {
  return (
    vnode1.key === vnode2.key &&
    vnode1.tag === vnode2.tag &&
    vnode1.isComment === vnode2.isComment &&
    !vnode1.data === !vnode2.data
  )
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
  }
  return map
}

function createPatchFunction (backend) {
  var i, j;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks$1.length; ++i) {
    cbs[hooks$1[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks$1[i]] !== undefined) { cbs[hooks$1[i]].push(modules[j][hooks$1[i]]); }
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove$$1 () {
      if (--remove$$1.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove$$1.listeners = listeners;
    return remove$$1
  }

  function removeNode (el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (parent) {
      nodeOps.removeChild(parent, el);
    }
  }

  var inPre = 0;
  function createElm (vnode, insertedVnodeQueue, parentElm, refElm, nested) {
    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      if (process.env.NODE_ENV !== 'production') {
        if (data && data.pre) {
          inPre++;
        }
        if (
          !inPre &&
          !vnode.ns &&
          !(config.ignoredElements.length && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if (process.env.NODE_ENV !== 'production' && data && data.pre) {
        inPre--;
      }
    } else if (vnode.isComment) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */, parentElm, refElm);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        if (isReactivated) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (vnode.data.pendingInsert) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert (parent, elm, ref) {
    if (parent) {
      if (ref) {
        nodeOps.insertBefore(parent, elm, ref);
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text));
    }
  }

  function isPatchable (vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (i.create) { i.create(emptyNode, vnode); }
      if (i.insert) { insertedVnodeQueue.push(vnode); }
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i;
    if (isDef(i = vnode.context) && isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '');
    }
    if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '');
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm);
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (rm || isDef(vnode.data)) {
      var listeners = cbs.remove.length + 1;
      if (!rm) {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      } else {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null;
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !elmToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            );
          }
          if (sameVnode(elmToMove, newStartVnode)) {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          }
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) {
      return
    }
    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (vnode.isStatic &&
        oldVnode.isStatic &&
        vnode.key === oldVnode.key &&
        (vnode.isCloned || vnode.isOnce)) {
      vnode.elm = oldVnode.elm;
      vnode.componentInstance = oldVnode.componentInstance;
      return
    }
    var i;
    var data = vnode.data;
    var hasData = isDef(data);
    if (hasData && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }
    var elm = vnode.elm = oldVnode.elm;
    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (hasData && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (hasData) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (initial && vnode.parent) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var bailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  var isRenderedModule = makeMap('attrs,style,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue) {
    if (process.env.NODE_ENV !== 'production') {
      if (!assertNodeMatch(elm, vnode)) {
        return false
      }
    }
    vnode.elm = elm;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          var childrenMatch = true;
          var childNode = elm.firstChild;
          for (var i$1 = 0; i$1 < children.length; i$1++) {
            if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue)) {
              childrenMatch = false;
              break
            }
            childNode = childNode.nextSibling;
          }
          // if childNode is not null, it means the actual childNodes list is
          // longer than the virtual children list.
          if (!childrenMatch || childNode) {
            if (process.env.NODE_ENV !== 'production' &&
                typeof console !== 'undefined' &&
                !bailed) {
              bailed = true;
              console.warn('Parent: ', elm);
              console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
            }
            return false
          }
        }
      }
      if (isDef(data)) {
        for (var key in data) {
          if (!isRenderedModule(key)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }
    return true
  }

  function assertNodeMatch (node, vnode) {
    if (vnode.tag) {
      return (
        vnode.tag.indexOf('vue-component') === 0 ||
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
    if (!vnode) {
      if (oldVnode) { invokeDestroyHook(oldVnode); }
      return
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (!oldVnode) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue, parentElm, refElm);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute('server-rendered')) {
            oldVnode.removeAttribute('server-rendered');
            hydrating = true;
          }
          if (hydrating) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else if (process.env.NODE_ENV !== 'production') {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }
        // replacing existing element
        var oldElm = oldVnode.elm;
        var parentElm$1 = nodeOps.parentNode(oldElm);
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm$1,
          nodeOps.nextSibling(oldElm)
        );

        if (vnode.parent) {
          // component root element replaced.
          // update parent placeholder node element, recursively
          var ancestor = vnode.parent;
          while (ancestor) {
            ancestor.elm = vnode.elm;
            ancestor = ancestor.parent;
          }
          if (isPatchable(vnode)) {
            for (var i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, vnode.parent);
            }
          }
        }

        if (parentElm$1 !== null) {
          removeVnodes(parentElm$1, [oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update (oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', callInsert, 'dir-insert');
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    }, 'dir-postpatch');
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  var res = Object.create(null);
  if (!dirs) {
    return res
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  return res
}

function getRawDirName (dir) {
  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
}

function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];
  if (fn) {
    fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  if (!oldVnode.data.attrs && !vnode.data.attrs) {
    return
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  /* istanbul ignore if */
  if (isIE9 && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (attrs[key] == null) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value) {
  if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, key);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (!data.staticClass && !data.class &&
      (!oldData || (!oldData.staticClass && !oldData.class))) {
    return
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

/*  */

var target$1;

function add$2 (
  event,
  handler,
  once,
  capture
) {
  if (once) {
    var oldHandler = handler;
    var _target = target$1; // save current target element in closure
    handler = function (ev) {
      remove$3(event, handler, capture, _target);
      arguments.length === 1
        ? oldHandler(ev)
        : oldHandler.apply(null, arguments);
    };
  }
  target$1.addEventListener(event, handler, capture);
}

function remove$3 (
  event,
  handler,
  capture,
  _target
) {
  (_target || target$1).removeEventListener(event, handler, capture);
}

function updateDOMListeners (oldVnode, vnode) {
  if (!oldVnode.data.on && !vnode.data.on) {
    return
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  updateListeners(on, oldOn, add$2, remove$3, vnode.context);
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

function updateDOMProps (oldVnode, vnode) {
  if (!oldVnode.data.domProps && !vnode.data.domProps) {
    return
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (props.__ob__) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = '';
    }
  }
  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) { vnode.children.length = 0; }
      if (cur === oldProps[key]) { continue }
    }

    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = cur == null ? '' : String(cur);
      if (shouldUpdateValue(elm, vnode, strCur)) {
        elm.value = strCur;
      }
    } else {
      elm[key] = cur;
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue (
  elm,
  vnode,
  checkVal
) {
  return (!elm.composing && (
    vnode.tag === 'option' ||
    isDirty(elm, checkVal) ||
    isInputChanged(vnode, checkVal)
  ))
}

function isDirty (elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is not equal to the updated value
  return document.activeElement !== elm && elm.value !== checkVal
}

function isInputChanged (vnode, newVal) {
  var value = vnode.elm.value;
  var modifiers = vnode.elm._vModifiers; // injected by v-model runtime
  if ((modifiers && modifiers.number) || vnode.elm.type === 'number') {
    return toNumber(value) !== toNumber(newVal)
  }
  if (modifiers && modifiers.trim) {
    return value.trim() !== newVal.trim()
  }
  return value !== newVal
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (childNode.data && (styleData = normalizeStyleData(childNode.data))) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(name, val.replace(importantRE, ''), 'important');
  } else {
    el.style[normalize(name)] = val;
  }
};

var prefixes = ['Webkit', 'Moz', 'ms'];

var testEl;
var normalize = cached(function (prop) {
  testEl = testEl || document.createElement('div');
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in testEl.style)) {
    return prop
  }
  var upper = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < prefixes.length; i++) {
    var prefixed = prefixes[i] + upper;
    if (prefixed in testEl.style) {
      return prefixed
    }
  }
});

function updateStyle (oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (!data.staticStyle && !data.style &&
      !oldData.staticStyle && !oldData.style) {
    return
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldVnode.data.staticStyle;
  var oldStyleBinding = oldVnode.data.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};

  vnode.data.style = style.__ob__ ? extend({}, style) : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (newStyle[name] == null) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !cls.trim()) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !cls.trim()) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); });
    } else {
      el.classList.remove(cls);
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    el.setAttribute('class', cur.trim());
  }
}

/*  */

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
var raf = inBrowser && window.requestAnimationFrame
  ? window.requestAnimationFrame.bind(window)
  : setTimeout;

function nextFrame (fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  (el._transitionClasses || (el._transitionClasses = [])).push(cls);
  addClass(el, cls);
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove$1(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el);
  var transitioneDelays = styles[transitionProp + 'Delay'].split(', ');
  var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
  var transitionTimeout = getTimeout(transitioneDelays, transitionDurations);
  var animationDelays = styles[animationProp + 'Delay'].split(', ');
  var animationDurations = styles[animationProp + 'Duration'].split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs (s) {
  return Number(s.slice(0, -1)) * 1000
}

/*  */

function enter (vnode, toggleDisplay) {
  var el = vnode.elm;

  // call leave callback now
  if (el._leaveCb) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (!data) {
    return
  }

  /* istanbul ignore if */
  if (el._enterCb || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    transitionNode = transitionNode.parent;
    context = transitionNode.context;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear ? appearClass : enterClass;
  var activeClass = isAppear ? appearActiveClass : enterActiveClass;
  var toClass = isAppear ? appearToClass : enterToClass;
  var beforeEnterHook = isAppear ? (beforeAppear || beforeEnter) : beforeEnter;
  var enterHook = isAppear ? (typeof appear === 'function' ? appear : enter) : enter;
  var afterEnterHook = isAppear ? (afterAppear || afterEnter) : afterEnter;
  var enterCancelledHook = isAppear ? (appearCancelled || enterCancelled) : enterCancelled;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl =
    enterHook &&
    // enterHook may be a bound method which exposes
    // the length of original fn as _length
    (enterHook._length || enterHook.length) > 1;

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    }, 'transition-insert');
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      addTransitionClass(el, toClass);
      removeTransitionClass(el, startClass);
      if (!cb.cancelled && !userWantsControl) {
        whenTransitionEnds(el, type, cb);
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (el._enterCb) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (!data) {
    return rm()
  }

  /* istanbul ignore if */
  if (el._leaveCb || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl =
    leave &&
    // leave hook may be a bound method which exposes
    // the length of original fn as _length
    (leave._length || leave.length) > 1;

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        addTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled && !userWantsControl) {
          whenTransitionEnds(el, type, cb);
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

function resolveTransition (def$$1) {
  if (!def$$1) {
    return
  }
  /* istanbul ignore else */
  if (typeof def$$1 === 'object') {
    var res = {};
    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }
    extend(res, def$$1);
    return res
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    leaveClass: (name + "-leave"),
    appearClass: (name + "-enter"),
    enterToClass: (name + "-enter-to"),
    leaveToClass: (name + "-leave-to"),
    appearToClass: (name + "-enter-to"),
    enterActiveClass: (name + "-enter-active"),
    leaveActiveClass: (name + "-leave-active"),
    appearActiveClass: (name + "-enter-active")
  }
});

function once (fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn();
    }
  }
}

function _enter (_, vnode) {
  if (!vnode.data.show) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove (vnode, rm) {
    /* istanbul ignore else */
    if (!vnode.data.show) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch$1 = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

var modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_-]*)?$/;

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var model = {
  inserted: function inserted (el, binding, vnode) {
    if (process.env.NODE_ENV !== 'production') {
      if (!modelableTagRE.test(vnode.tag)) {
        warn(
          "v-model is not supported on element type: <" + (vnode.tag) + ">. " +
          'If you are working with contenteditable, it\'s recommended to ' +
          'wrap a library dedicated for that purpose inside a custom component.',
          vnode.context
        );
      }
    }
    if (vnode.tag === 'select') {
      var cb = function () {
        setSelected(el, binding, vnode.context);
      };
      cb();
      /* istanbul ignore if */
      if (isIE || isEdge) {
        setTimeout(cb, 0);
      }
    } else if (vnode.tag === 'textarea' || el.type === 'text') {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        if (!isAndroid) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
        }
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },
  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var needReset = el.multiple
        ? binding.value.some(function (v) { return hasNoMatchingOption(v, el.options); })
        : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, el.options);
      if (needReset) {
        trigger(el, 'change');
      }
    }
  }
};

function setSelected (el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
    process.env.NODE_ENV !== 'production' && warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    );
    return
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption (value, options) {
  for (var i = 0, l = options.length; i < l; i++) {
    if (looseEqual(getValue(options[i]), value)) {
      return false
    }
  }
  return true
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode)
    : vnode
}

var show = {
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;
    var originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition && !isIE9) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (value === oldValue) { return }
    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;
    if (transition && !isIE9) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind: function unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

var platformDirectives = {
  model: model,
  show: show
};

/*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1].fn;
  }
  return data
}

function placeholder (h, rawChild) {
  return /\d-keep-alive$/.test(rawChild.tag)
    ? h('keep-alive')
    : null
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render: function render (h) {
    var this$1 = this;

    var children = this.$slots.default;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) { return c.tag; });
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if (process.env.NODE_ENV !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if (process.env.NODE_ENV !== 'production' &&
        mode && mode !== 'in-out' && mode !== 'out-in') {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    var id = "__transition-" + (this._uid) + "-";
    var key = child.key = child.key == null
      ? id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;
    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
    }

    if (oldChild && oldChild.data && !isSameChild(child, oldChild)) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild && (oldChild.data.transition = extend({}, data));
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        }, key);
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        var delayedLeave;
        var performLeave = function () { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave, key);
        mergeVNodeHook(data, 'enterCancelled', performLeave, key);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) {
          delayedLeave = leave;
        }, key);
      }
    }

    return rawChild
  }
};

/*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final disired state. This way in the second pass removed
// nodes will remain where they should be.

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else if (process.env.NODE_ENV !== 'production') {
          var opts = c.componentOptions;
          var name = opts
            ? (opts.Ctor.options.name || opts.tag)
            : c.tag;
          warn(("<transition-group> children must be keyed: <" + name + ">"));
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  beforeUpdate: function beforeUpdate () {
    // force removing pass
    this.__patch__(
      this._vnode,
      this.kept,
      false, // hydrating
      true // removeOnly (!important, avoids unnecessary moves)
    );
    this._vnode = this.kept;
  },

  updated: function updated () {
    var children = this.prevChildren;
    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    var f = document.body.offsetHeight; // eslint-disable-line

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      if (this._hasMove != null) {
        return this._hasMove
      }
      addTransitionClass(el, moveClass);
      var info = getTransitionInfo(el);
      removeTransitionClass(el, moveClass);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

/*  */

// install platform specific utils
Vue$2.config.isUnknownElement = isUnknownElement;
Vue$2.config.isReservedTag = isReservedTag;
Vue$2.config.getTagNamespace = getTagNamespace;
Vue$2.config.mustUseProp = mustUseProp;

// install platform runtime directives & components
extend(Vue$2.options.directives, platformDirectives);
extend(Vue$2.options.components, platformComponents);

// install platform patch function
Vue$2.prototype.__patch__ = inBrowser ? patch$1 : noop;

// wrap mount
Vue$2.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return this._mount(el, hydrating)
};

if (process.env.NODE_ENV !== 'production' &&
    inBrowser && typeof console !== 'undefined') {
  console[console.info ? 'info' : 'log'](
    "You are running Vue in development mode.\n" +
    "Make sure to turn on production mode when deploying for production.\n" +
    "See more tips at https://vuejs.org/guide/deployment.html"
  );
}

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue$2);
    } else if (
      process.env.NODE_ENV !== 'production' &&
      inBrowser && !isEdge && /Chrome\/\d+/.test(window.navigator.userAgent)
    ) {
      console[console.info ? 'info' : 'log'](
        'Download the Vue Devtools extension for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      );
    }
  }
}, 0);

module.exports = Vue$2;

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":1}],6:[function(require,module,exports){
var inserted = exports.cache = {}

function noop () {}

exports.insert = function (css) {
  if (inserted[css]) return noop
  inserted[css] = true

  var elem = document.createElement('style')
  elem.setAttribute('type', 'text/css')

  if ('textContent' in elem) {
    elem.textContent = css
  } else {
    elem.styleSheet.cssText = css
  }

  document.getElementsByTagName('head')[0].appendChild(elem)
  return function () {
    document.getElementsByTagName('head')[0].removeChild(elem)
    inserted[css] = false
  }
}

},{}],7:[function(require,module,exports){
/**
 * vuex v2.1.1
 * (c) 2016 Evan You
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Vuex = factory());
}(this, (function () { 'use strict';

var devtoolHook =
  typeof window !== 'undefined' &&
  window.__VUE_DEVTOOLS_GLOBAL_HOOK__

function devtoolPlugin (store) {
  if (!devtoolHook) { return }

  store._devtoolHook = devtoolHook

  devtoolHook.emit('vuex:init', store)

  devtoolHook.on('vuex:travel-to-state', function (targetState) {
    store.replaceState(targetState)
  })

  store.subscribe(function (mutation, state) {
    devtoolHook.emit('vuex:mutation', mutation, state)
  })
}

function applyMixin (Vue) {
  var version = Number(Vue.version.split('.')[0])

  if (version >= 2) {
    var usesInit = Vue.config._lifecycleHooks.indexOf('init') > -1
    Vue.mixin(usesInit ? { init: vuexInit } : { beforeCreate: vuexInit })
  } else {
    // override init and inject vuex init procedure
    // for 1.x backwards compatibility.
    var _init = Vue.prototype._init
    Vue.prototype._init = function (options) {
      if ( options === void 0 ) options = {};

      options.init = options.init
        ? [vuexInit].concat(options.init)
        : vuexInit
      _init.call(this, options)
    }
  }

  /**
   * Vuex init hook, injected into each instances init hooks list.
   */

  function vuexInit () {
    var options = this.$options
    // store injection
    if (options.store) {
      this.$store = options.store
    } else if (options.parent && options.parent.$store) {
      this.$store = options.parent.$store
    }
  }
}

var mapState = normalizeNamespace(function (namespace, states) {
  var res = {}
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState () {
      var state = this.$store.state
      var getters = this.$store.getters
      if (namespace) {
        var module = this.$store._modulesNamespaceMap[namespace]
        if (!module) {
          warnNamespace('mapState', namespace)
          return
        }
        state = module.state
        getters = module.context.getters
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    }
  })
  return res
})

var mapMutations = normalizeNamespace(function (namespace, mutations) {
  var res = {}
  normalizeMap(mutations).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val
    res[key] = function mappedMutation () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this.$store.commit.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

var mapGetters = normalizeNamespace(function (namespace, getters) {
  var res = {}
  normalizeMap(getters).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val
    res[key] = function mappedGetter () {
      if (!(val in this.$store.getters)) {
        console.error(("[vuex] unknown getter: " + val))
      }
      return this.$store.getters[val]
    }
  })
  return res
})

var mapActions = normalizeNamespace(function (namespace, actions) {
  var res = {}
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    val = namespace + val
    res[key] = function mappedAction () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      return this.$store.dispatch.apply(this.$store, [val].concat(args))
    }
  })
  return res
})

function normalizeMap (map) {
  return Array.isArray(map)
    ? map.map(function (key) { return ({ key: key, val: key }); })
    : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
}

function normalizeNamespace (fn) {
  return function (namespace, map) {
    if (typeof namespace !== 'string') {
      map = namespace
      namespace = ''
    } else if (namespace.charAt(namespace.length - 1) !== '/') {
      namespace += '/'
    }
    return fn(namespace, map)
  }
}

function warnNamespace (helper, namespace) {
  console.error(("[vuex] module namespace not found in " + helper + "(): " + namespace))
}

/**
 * forEach for object
 */
function forEachValue (obj, fn) {
  Object.keys(obj).forEach(function (key) { return fn(obj[key], key); })
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function isPromise (val) {
  return val && typeof val.then === 'function'
}

function assert (condition, msg) {
  if (!condition) { throw new Error(("[vuex] " + msg)) }
}

var Module = function Module (rawModule, runtime) {
  this.runtime = runtime
  this._children = Object.create(null)
  this._rawModule = rawModule
};

var prototypeAccessors$1 = { state: {},namespaced: {} };

prototypeAccessors$1.state.get = function () {
  return this._rawModule.state || {}
};

prototypeAccessors$1.namespaced.get = function () {
  return !!this._rawModule.namespaced
};

Module.prototype.addChild = function addChild (key, module) {
  this._children[key] = module
};

Module.prototype.removeChild = function removeChild (key) {
  delete this._children[key]
};

Module.prototype.getChild = function getChild (key) {
  return this._children[key]
};

Module.prototype.update = function update (rawModule) {
  this._rawModule.namespaced = rawModule.namespaced
  if (rawModule.actions) {
    this._rawModule.actions = rawModule.actions
  }
  if (rawModule.mutations) {
    this._rawModule.mutations = rawModule.mutations
  }
  if (rawModule.getters) {
    this._rawModule.getters = rawModule.getters
  }
};

Module.prototype.forEachChild = function forEachChild (fn) {
  forEachValue(this._children, fn)
};

Module.prototype.forEachGetter = function forEachGetter (fn) {
  if (this._rawModule.getters) {
    forEachValue(this._rawModule.getters, fn)
  }
};

Module.prototype.forEachAction = function forEachAction (fn) {
  if (this._rawModule.actions) {
    forEachValue(this._rawModule.actions, fn)
  }
};

Module.prototype.forEachMutation = function forEachMutation (fn) {
  if (this._rawModule.mutations) {
    forEachValue(this._rawModule.mutations, fn)
  }
};

Object.defineProperties( Module.prototype, prototypeAccessors$1 );

var ModuleCollection = function ModuleCollection (rawRootModule) {
  var this$1 = this;

  // register root module (Vuex.Store options)
  this.root = new Module(rawRootModule, false)

  // register all nested modules
  if (rawRootModule.modules) {
    forEachValue(rawRootModule.modules, function (rawModule, key) {
      this$1.register([key], rawModule, false)
    })
  }
};

ModuleCollection.prototype.get = function get (path) {
  return path.reduce(function (module, key) {
    return module.getChild(key)
  }, this.root)
};

ModuleCollection.prototype.getNamespace = function getNamespace (path) {
  var module = this.root
  return path.reduce(function (namespace, key) {
    module = module.getChild(key)
    return namespace + (module.namespaced ? key + '/' : '')
  }, '')
};

ModuleCollection.prototype.update = function update$1 (rawRootModule) {
  update(this.root, rawRootModule)
};

ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
    var this$1 = this;
    if ( runtime === void 0 ) runtime = true;

  var parent = this.get(path.slice(0, -1))
  var newModule = new Module(rawModule, runtime)
  parent.addChild(path[path.length - 1], newModule)

  // register nested modules
  if (rawModule.modules) {
    forEachValue(rawModule.modules, function (rawChildModule, key) {
      this$1.register(path.concat(key), rawChildModule, runtime)
    })
  }
};

ModuleCollection.prototype.unregister = function unregister (path) {
  var parent = this.get(path.slice(0, -1))
  var key = path[path.length - 1]
  if (!parent.getChild(key).runtime) { return }

  parent.removeChild(key)
};

function update (targetModule, newModule) {
  // update target module
  targetModule.update(newModule)

  // update nested modules
  if (newModule.modules) {
    for (var key in newModule.modules) {
      if (!targetModule.getChild(key)) {
        console.warn(
          "[vuex] trying to add a new module '" + key + "' on hot reloading, " +
          'manual reload is needed'
        )
        return
      }
      update(targetModule.getChild(key), newModule.modules[key])
    }
  }
}

var Vue // bind on install

var Store = function Store (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  assert(Vue, "must call Vue.use(Vuex) before creating a store instance.")
  assert(typeof Promise !== 'undefined', "vuex requires a Promise polyfill in this browser.")

  var state = options.state; if ( state === void 0 ) state = {};
  var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
  var strict = options.strict; if ( strict === void 0 ) strict = false;

  // store internal state
  this._committing = false
  this._actions = Object.create(null)
  this._mutations = Object.create(null)
  this._wrappedGetters = Object.create(null)
  this._modules = new ModuleCollection(options)
  this._modulesNamespaceMap = Object.create(null)
  this._subscribers = []
  this._watcherVM = new Vue()

  // bind commit and dispatch to self
  var store = this
  var ref = this;
  var dispatch = ref.dispatch;
  var commit = ref.commit;
    this.dispatch = function boundDispatch (type, payload) {
    return dispatch.call(store, type, payload)
  }
  this.commit = function boundCommit (type, payload, options) {
    return commit.call(store, type, payload, options)
    }

    // strict mode
  this.strict = strict

  // init root module.
  // this also recursively registers all sub-modules
  // and collects all module getters inside this._wrappedGetters
  installModule(this, state, [], this._modules.root)

  // initialize the store vm, which is responsible for the reactivity
  // (also registers _wrappedGetters as computed properties)
  resetStoreVM(this, state)

  // apply plugins
  plugins.concat(devtoolPlugin).forEach(function (plugin) { return plugin(this$1); })
};

var prototypeAccessors = { state: {} };

prototypeAccessors.state.get = function () {
  return this._vm.$data.state
};

prototypeAccessors.state.set = function (v) {
  assert(false, "Use store.replaceState() to explicit replace store state.")
};

Store.prototype.commit = function commit (_type, _payload, _options) {
    var this$1 = this;

  // check object-style commit
  var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;

  var mutation = { type: type, payload: payload }
  var entry = this._mutations[type]
  if (!entry) {
    console.error(("[vuex] unknown mutation type: " + type))
    return
  }
  this._withCommit(function () {
    entry.forEach(function commitIterator (handler) {
      handler(payload)
    })
  })
  this._subscribers.forEach(function (sub) { return sub(mutation, this$1.state); })

  if (options && options.silent) {
    console.warn(
      "[vuex] mutation type: " + type + ". Silent option has been removed. " +
      'Use the filter functionality in the vue-devtools'
    )
  }
};

Store.prototype.dispatch = function dispatch (_type, _payload) {
  // check object-style dispatch
  var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;

  var entry = this._actions[type]
  if (!entry) {
    console.error(("[vuex] unknown action type: " + type))
    return
  }
  return entry.length > 1
    ? Promise.all(entry.map(function (handler) { return handler(payload); }))
    : entry[0](payload)
};

Store.prototype.subscribe = function subscribe (fn) {
  var subs = this._subscribers
  if (subs.indexOf(fn) < 0) {
    subs.push(fn)
  }
  return function () {
    var i = subs.indexOf(fn)
    if (i > -1) {
      subs.splice(i, 1)
    }
  }
};

Store.prototype.watch = function watch (getter, cb, options) {
    var this$1 = this;

  assert(typeof getter === 'function', "store.watch only accepts a function.")
  return this._watcherVM.$watch(function () { return getter(this$1.state, this$1.getters); }, cb, options)
};

Store.prototype.replaceState = function replaceState (state) {
    var this$1 = this;

  this._withCommit(function () {
    this$1._vm.state = state
  })
};

Store.prototype.registerModule = function registerModule (path, rawModule) {
  if (typeof path === 'string') { path = [path] }
  assert(Array.isArray(path), "module path must be a string or an Array.")
  this._modules.register(path, rawModule)
  installModule(this, this.state, path, this._modules.get(path))
  // reset store to update getters...
  resetStoreVM(this, this.state)
};

Store.prototype.unregisterModule = function unregisterModule (path) {
    var this$1 = this;

  if (typeof path === 'string') { path = [path] }
  assert(Array.isArray(path), "module path must be a string or an Array.")
    this._modules.unregister(path)
  this._withCommit(function () {
    var parentState = getNestedState(this$1.state, path.slice(0, -1))
    Vue.delete(parentState, path[path.length - 1])
  })
  resetStore(this)
};

Store.prototype.hotUpdate = function hotUpdate (newOptions) {
  this._modules.update(newOptions)
  resetStore(this)
};

Store.prototype._withCommit = function _withCommit (fn) {
  var committing = this._committing
  this._committing = true
  fn()
  this._committing = committing
};

Object.defineProperties( Store.prototype, prototypeAccessors );

function resetStore (store) {
  store._actions = Object.create(null)
  store._mutations = Object.create(null)
  store._wrappedGetters = Object.create(null)
  store._modulesNamespaceMap = Object.create(null)
  var state = store.state
  // init all modules
  installModule(store, state, [], store._modules.root, true)
  // reset vm
  resetStoreVM(store, state)
}

function resetStoreVM (store, state) {
  var oldVm = store._vm

  // bind store public getters
  store.getters = {}
  var wrappedGetters = store._wrappedGetters
  var computed = {}
  forEachValue(wrappedGetters, function (fn, key) {
    // use computed to leverage its lazy-caching mechanism
    computed[key] = function () { return fn(store); }
    Object.defineProperty(store.getters, key, {
      get: function () { return store._vm[key]; },
      enumerable: true // for local getters
    })
  })

  // use a Vue instance to store the state tree
  // suppress warnings just in case the user has added
  // some funky global mixins
  var silent = Vue.config.silent
  Vue.config.silent = true
  store._vm = new Vue({
    data: { state: state },
    computed: computed
  })
  Vue.config.silent = silent

  // enable strict mode for new vm
  if (store.strict) {
    enableStrictMode(store)
  }

  if (oldVm) {
    // dispatch changes in all subscribed watchers
    // to force getter re-evaluation.
    store._withCommit(function () {
      oldVm.state = null
    })
    Vue.nextTick(function () { return oldVm.$destroy(); })
  }
}

function installModule (store, rootState, path, module, hot) {
  var isRoot = !path.length
  var namespace = store._modules.getNamespace(path)

  // register in namespace map
  if (namespace) {
    store._modulesNamespaceMap[namespace] = module
  }

  // set state
  if (!isRoot && !hot) {
    var parentState = getNestedState(rootState, path.slice(0, -1))
    var moduleName = path[path.length - 1]
    store._withCommit(function () {
      Vue.set(parentState, moduleName, module.state)
    })
  }

  var local = module.context = makeLocalContext(store, namespace)

  module.forEachMutation(function (mutation, key) {
    var namespacedType = namespace + key
    registerMutation(store, namespacedType, mutation, path)
  })

  module.forEachAction(function (action, key) {
    var namespacedType = namespace + key
    registerAction(store, namespacedType, action, local, path)
  })

  module.forEachGetter(function (getter, key) {
    var namespacedType = namespace + key
    registerGetter(store, namespacedType, getter, local, path)
  })

  module.forEachChild(function (child, key) {
    installModule(store, rootState, path.concat(key), child, hot)
  })
}

/**
 * make localized dispatch, commit and getters
 * if there is no namespace, just use root ones
 */
function makeLocalContext (store, namespace) {
  var noNamespace = namespace === ''

  var local = {
    dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options)
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type
        if (!store._actions[type]) {
          console.error(("[vuex] unknown local action type: " + (args.type) + ", global type: " + type))
          return
        }
      }

      return store.dispatch(type, payload)
    },

    commit: noNamespace ? store.commit : function (_type, _payload, _options) {
      var args = unifyObjectStyle(_type, _payload, _options)
      var payload = args.payload;
      var options = args.options;
      var type = args.type;

      if (!options || !options.root) {
        type = namespace + type
        if (!store._mutations[type]) {
          console.error(("[vuex] unknown local mutation type: " + (args.type) + ", global type: " + type))
          return
        }
      }

      store.commit(type, payload, options)
    }
  }

  // getters object must be gotten lazily
  // because store.getters will be changed by vm update
  Object.defineProperty(local, 'getters', {
    get: noNamespace ? function () { return store.getters; } : function () { return makeLocalGetters(store, namespace); }
  })

  return local
}

function makeLocalGetters (store, namespace) {
  var gettersProxy = {}

  var splitPos = namespace.length
  Object.keys(store.getters).forEach(function (type) {
    // skip if the target getter is not match this namespace
    if (type.slice(0, splitPos) !== namespace) { return }

    // extract local getter type
    var localType = type.slice(splitPos)

    // Add a port to the getters proxy.
    // Define as getter property because
    // we do not want to evaluate the getters in this time.
    Object.defineProperty(gettersProxy, localType, {
      get: function () { return store.getters[type]; },
      enumerable: true
    })
  })

  return gettersProxy
}

function registerMutation (store, type, handler, path) {
  var entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler(getNestedState(store.state, path), payload)
  })
}

function registerAction (store, type, handler, local, path) {
  var entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload, cb) {
    var res = handler({
      dispatch: local.dispatch,
      commit: local.commit,
      getters: local.getters,
      state: getNestedState(store.state, path),
      rootGetters: store.getters,
      rootState: store.state
    }, payload, cb)
    if (!isPromise(res)) {
      res = Promise.resolve(res)
    }
    if (store._devtoolHook) {
      return res.catch(function (err) {
        store._devtoolHook.emit('vuex:error', err)
        throw err
      })
    } else {
      return res
    }
  })
}

function registerGetter (store, type, rawGetter, local, path) {
  if (store._wrappedGetters[type]) {
    console.error(("[vuex] duplicate getter key: " + type))
    return
  }
  store._wrappedGetters[type] = function wrappedGetter (store) {
    return rawGetter(
      getNestedState(store.state, path), // local state
      local.getters, // local getters
      store.state, // root state
      store.getters // root getters
    )
  }
}

function enableStrictMode (store) {
  store._vm.$watch('state', function () {
    assert(store._committing, "Do not mutate vuex store state outside mutation handlers.")
  }, { deep: true, sync: true })
}

function getNestedState (state, path) {
  return path.length
    ? path.reduce(function (state, key) { return state[key]; }, state)
    : state
}

function unifyObjectStyle (type, payload, options) {
  if (isObject(type) && type.type) {
    options = payload
    payload = type
    type = type.type
  }
  return { type: type, payload: payload, options: options }
}

function install (_Vue) {
  if (Vue) {
    console.error(
      '[vuex] already installed. Vue.use(Vuex) should be called only once.'
    )
    return
  }
  Vue = _Vue
  applyMixin(Vue)
}

// auto install in dist mode
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

var index = {
  Store: Store,
  install: install,
  version: '2.1.1',
  mapState: mapState,
  mapMutations: mapMutations,
  mapGetters: mapGetters,
  mapActions: mapActions
}

return index;

})));
},{}],8:[function(require,module,exports){
'use strict';

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = require('vue-router');

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _vueResource = require('vue-resource');

var _vueResource2 = _interopRequireDefault(_vueResource);

var _App = require('./vues/App.vue');

var _App2 = _interopRequireDefault(_App);

var _routes = require('./routes');

var _store = require('./store/store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vueRouter2.default);
_vue2.default.use(_vueResource2.default);

_vue2.default.http.options.root = 'https://cmst385-accessibility.firebaseio.com/';

var router = new _vueRouter2.default({
  mode: 'history',
  routes: _routes.routes
});

new _vue2.default({
  el: '#app',
  router: router,
  store: _store2.default,
  render: function render(h) {
    return h(_App2.default);
  }
});

},{"./routes":9,"./store/store":11,"./vues/App.vue":13,"vue":5,"vue-resource":3,"vue-router":4}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routes = undefined;

var _Home = require('./vues/Home.vue');

var _Home2 = _interopRequireDefault(_Home);

var _Class = require('./vues/Classes/Class.vue');

var _Class2 = _interopRequireDefault(_Class);

var _Classes = require('./vues/Classes/Classes.vue');

var _Classes2 = _interopRequireDefault(_Classes);

var _About = require('./vues/About.vue');

var _About2 = _interopRequireDefault(_About);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routes = exports.routes = [{ path: '/', component: _Home2.default }, { path: '/class', component: _Class2.default }, { path: '/classes', component: _Classes2.default }, { path: '/about', component: _About2.default }];

},{"./vues/About.vue":12,"./vues/Classes/Class.vue":14,"./vues/Classes/Classes.vue":15,"./vues/Home.vue":17}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var state = {
  classes: {}
};

var getters = {
  getClasses: function getClasses(state) {
    return state.classes;
  },
  getClass: function getClass(state, key) {
    return state.classes[key];
  }
};

var mutations = {
  setClasses: function setClasses(state, classes) {
    return state.classes = classes;
  }
};

var actions = {
  initClasses: function initClasses(_ref) {
    var commit = _ref.commit;

    commit('loadData', 'Classes');
  }
};

exports.default = { state: state, getters: getters, mutations: mutations, actions: actions };

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _vuex = require('vuex');

var _vuex2 = _interopRequireDefault(_vuex);

var _classes = require('./modules/classes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vuex2.default);

exports.default = new _vuex2.default.Store({
  actions: {
    loadData: function loadData(_ref, dataSource) {
      var commit = _ref.commit;

      _vue2.default.http.get(dataSource + '.json').then(function (response) {
        return response.json();
      }).then(function (data) {
        if (data) {
          console.log('[store] loadData - data returned', dataSource, data);
          switch (dataSource) {
            case 'Classes':
              commit('setClasses', data);
              break;
          }
        }
      });
    }
  },
  modules: { classes: _classes.classes }
});

},{"./modules/classes":10,"vue":5,"vuex":7}],12:[function(require,module,exports){
;(function(){
"use strict";
})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c("div")}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6495e040", __vue__options__)
  } else {
    hotAPI.reload("data-v-6495e040", __vue__options__)
  }
})()}

},{"vue":5,"vue-hot-reload-api":2}],13:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert("body {\n    padding: 5vmin;\n}\n\n.slide-enter-active { animation: slide-in 200ms ease-out forwards }\n.slide-leave-active { animation: slide-out 200ms ease-out forwards }\n@keyframes slide-in {\n    from { transform: translateY(-30vmin); opacity: 0 }\n    to { transform: translateY(0px); opacity: 1}\n}\n@keyframes slide-out {\n    from { transform: translateY(0px); opacity: 1 }\n    to { transform: translateY(-30vmin); opacity: 0}\n}")
;(function(){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Header = require('./Header.vue');

var _Header2 = _interopRequireDefault(_Header);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    components: {
        appHeader: _Header2.default
    },
    created: function created() {
        this.$store.dispatch('initClasses');
    }
};
})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"container"},[_c('app-header'),_vm._v(" "),_c('div',{staticClass:"row"},[_c('div',{staticClass:"col-xs-12"},[_c('transition',{attrs:{"name":"slide","mode":"out-in"}},[_c('router-view')],1)],1)])],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0b126198", __vue__options__)
  } else {
    hotAPI.reload("data-v-0b126198", __vue__options__)
  }
})()}

},{"./Header.vue":16,"vue":5,"vue-hot-reload-api":2,"vueify/lib/insert-css":6}],14:[function(require,module,exports){
var __vueify_style_dispose__ = require("vueify/lib/insert-css").insert(".info-box {\r\n  margin: 1em;\r\n  padding: 1em;\r\n}")
;(function(){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  props: ['_class'],
  computed: {
    name: function name() {
      _class.department + ' ' + _class.number;
    },
    hasRightPane: function hasRightPane() {
      return _class.requirements || _class.recommended || _class.equivalencies;
    }
  },
  methods: {
    getName: function getName(_class) {
      return _class.department + ' ' + _class.number;
    },
    expand: function (_expand) {
      function expand(_x) {
        return _expand.apply(this, arguments);
      }

      expand.toString = function () {
        return _expand.toString();
      };

      return expand;
    }(function (_entry) {
      return _entry.map(function (v) {
        return v.constructor === Array ? expand(v) : getName(v);
      }).join(' or ');
    })
  }
};
})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"inner container col-sm-6 col-md-4"},[_c('div',{staticClass:"panel panel-primary"},[_c('div',{staticClass:"panel-heading"},[_c('h3',{staticClass:"panel-title"},[_vm._v(_vm._s(_vm._class.title)+" "),_c('small',[_vm._v("("+_vm._s(_vm.name)+")")])])]),_vm._v(" "),_c('div',{staticClass:"panel-body"},[_c('div',{class:_vm.hasRightPane? 'pull-left' : ''},[_c('p',{staticClass:"description"},[_vm._v(_vm._s(_vm._class.description))])]),_vm._v(" "),_c('div',{staticClass:"pull-right"},[_c('ul',[_vm._l((_vm._class.requirements),function(requirement,index){return _c('li',{class:index===0?'list-group-item-danger':''},[_c('big',{directives:[{name:"show",rawName:"v-show",value:(index === 0),expression:"index === 0"}]},[_vm._v("Requirements:")]),_vm._v(" \n            "+_vm._s(_vm.expand(requirement)))],1)}),_vm._v(" "),_vm._l((_vm._class.recommended),function(recommended,index){return _c('li',{class:index===0?'list-group-item-info':''},[_c('big',{directives:[{name:"show",rawName:"v-show",value:(index === 0),expression:"index === 0"}]},[_vm._v("Recommended:")]),_vm._v(" \n            "+_vm._s(_vm.expand(recommended)))],1)}),_vm._v(" "),_vm._l((_vm._class.equivalencies),function(equivalency,index){return _c('li',{class:index===0?'list-group-item-warning':''},[_c('big',{directives:[{name:"show",rawName:"v-show",value:(index === 0),expression:"index === 0"}]},[_vm._v("Equivalencies:")]),_vm._v(" \n            "+_vm._s(_vm.getName(equivalency)))],1)})],2)])]),_vm._v(" "),_c('div',{directives:[{name:"show",rawName:"v-show",value:(_vm._class.url),expression:"_class.url"}],staticClass:"info-box list-group-item-success"},[_c('a',{attrs:{"href":_vm._class.url,"target":"_blank"}},[_vm._v("View Online")])])])])}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  module.hot.dispose(__vueify_style_dispose__)
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3e067616", __vue__options__)
  } else {
    hotAPI.reload("data-v-3e067616", __vue__options__)
  }
})()}

},{"vue":5,"vue-hot-reload-api":2,"vueify/lib/insert-css":6}],15:[function(require,module,exports){
;(function(){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Class = require('./Class.vue');

var _Class2 = _interopRequireDefault(_Class);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  components: {
    appClass: _Class2.default
  },
  computed: {
    class: function _class() {
      return this.$store.getters.getClasses;
    }
  }
};
})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"outer container",attrs:{"id":"container"}},[_c('h1',[_vm._v("Classes")]),_vm._v(" "),_vm._l((_vm.classes),function(_class){return _c('app-class',{attrs:{"_class":_class}})})],2)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1b20b13a", __vue__options__)
  } else {
    hotAPI.reload("data-v-1b20b13a", __vue__options__)
  }
})()}

},{"./Class.vue":14,"vue":5,"vue-hot-reload-api":2}],16:[function(require,module,exports){
;(function(){
"use strict";
})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"outer container",attrs:{"id":"container"}},[_c('nav',{staticClass:"navbar navbar-default"},[_c('div',{staticClass:"container-fluid"},[_c('div',{staticClass:"navbar-header"},[_c('router-link',{staticClass:"navbar-brand",attrs:{"to":"/"}},[_vm._v("CMST 385 - Accessibility")])],1),_vm._v(" "),_c('div',{staticClass:"collapse navbar-collapse"},[_c('ul',{staticClass:"nav navbar-nav"},[_c('router-link',{attrs:{"to":"/classes","active-class":"active","tag":"li"}},[_c('a',[_vm._v("Classes")])]),_vm._v(" "),_c('router-link',{attrs:{"to":"/about","active-class":"active","tag":"li"}},[_c('a',[_vm._v("About")])])],1)])])])])}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-0c26c5ca", __vue__options__)
  } else {
    hotAPI.reload("data-v-0c26c5ca", __vue__options__)
  }
})()}

},{"vue":5,"vue-hot-reload-api":2}],17:[function(require,module,exports){
;(function(){
"use strict";
})()
if (module.exports.__esModule) module.exports = module.exports.default
var __vue__options__ = (typeof module.exports === "function"? module.exports.options: module.exports)
if (__vue__options__.functional) {console.error("[vueify] functional components are not supported and should be defined in plain js files using render functions.")}
__vue__options__.render = function render () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"outer container",attrs:{"id":"container"}},[_c('h1',[_vm._v("CMST 385 - Accessibility")]),_vm._v(" "),_c('h6',[_vm._v("for EXCL 301 - supporting evidence for Demonstration of Learning: CMST 385")]),_vm._v(" "),_c('h6',[_vm._v("Supporting Evidence of Accessibility")]),_vm._v(" "),_c('hr'),_vm._v(" "),_c('router-link',{attrs:{"to":"/about"}},[_vm._v("See what goes into accessibility at this site")])],1)}
__vue__options__.staticRenderFns = []
if (module.hot) {(function () {  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-17263748", __vue__options__)
  } else {
    hotAPI.reload("data-v-17263748", __vue__options__)
  }
})()}

},{"vue":5,"vue-hot-reload-api":2}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS1ob3QtcmVsb2FkLWFwaS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy92dWUtcmVzb3VyY2UvZGlzdC92dWUtcmVzb3VyY2UuY29tbW9uLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS1yb3V0ZXIvZGlzdC92dWUtcm91dGVyLmNvbW1vbi5qcyIsIm5vZGVfbW9kdWxlcy92dWUvZGlzdC92dWUucnVudGltZS5jb21tb24uanMiLCJub2RlX21vZHVsZXMvdnVlaWZ5L2xpYi9pbnNlcnQtY3NzLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZXgvZGlzdC92dWV4LmpzIiwicHVibGljXFxzY3JpcHRzXFxkZW1vLmpzIiwicHVibGljXFxzY3JpcHRzXFxyb3V0ZXMuanMiLCJwdWJsaWNcXHNjcmlwdHNcXHN0b3JlXFxtb2R1bGVzXFxjbGFzc2VzLmpzIiwicHVibGljXFxzY3JpcHRzXFxzdG9yZVxcc3RvcmUuanMiLCJwdWJsaWNcXHNjcmlwdHNcXHZ1ZXNcXEFib3V0LnZ1ZT83NGE5ZmU2MyIsInB1YmxpY1xcc2NyaXB0c1xcdnVlc1xcQXBwLnZ1ZT8wMTM4ZjQ4YiIsInB1YmxpY1xcc2NyaXB0c1xcdnVlc1xcQ2xhc3Nlc1xcQ2xhc3MudnVlP2NjNzc5NmYwIiwicHVibGljXFxzY3JpcHRzXFx2dWVzXFxDbGFzc2VzXFxDbGFzc2VzLnZ1ZT80NWRhMzJjNiIsInB1YmxpY1xcc2NyaXB0c1xcdnVlc1xcSGVhZGVyLnZ1ZT80NjYwZmY0YyIsInB1YmxpY1xcc2NyaXB0c1xcdnVlc1xcSG9tZS52dWU/NmVlMzBkNWEiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzc4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3Z1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hrTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeHZCQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOztBQUNBOzs7Ozs7QUFFQSxjQUFJLEdBQUo7QUFDQSxjQUFJLEdBQUo7O0FBRUEsY0FBSSxJQUFKLENBQVMsT0FBVCxDQUFpQixJQUFqQixHQUF3QiwrQ0FBeEI7O0FBRUEsSUFBTSxTQUFTLHdCQUFjO0FBQzNCLFFBQU0sU0FEcUI7QUFFM0I7QUFGMkIsQ0FBZCxDQUFmOztBQUtBLGtCQUFRO0FBQ04sTUFBSSxNQURFO0FBRU4sZ0JBRk07QUFHTix3QkFITTtBQUlOLFVBQVE7QUFBQSxXQUFLLGdCQUFMO0FBQUE7QUFKRixDQUFSOzs7Ozs7Ozs7O0FDbEJBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFTyxJQUFNLDBCQUFTLENBQ3BCLEVBQUUsTUFBTSxHQUFSLEVBQWEseUJBQWIsRUFEb0IsRUFFcEIsRUFBRSxNQUFNLFFBQVIsRUFBa0IsMEJBQWxCLEVBRm9CLEVBR3BCLEVBQUUsTUFBTSxVQUFSLEVBQW9CLDRCQUFwQixFQUhvQixFQUlwQixFQUFFLE1BQU0sUUFBUixFQUFrQiwwQkFBbEIsRUFKb0IsQ0FBZjs7Ozs7Ozs7QUNMUCxJQUFNLFFBQVE7QUFDWixXQUFTO0FBREcsQ0FBZDs7QUFJQSxJQUFNLFVBQVU7QUFDZCxjQUFZO0FBQUEsV0FBUyxNQUFNLE9BQWY7QUFBQSxHQURFO0FBRWQsWUFBVSxrQkFBQyxLQUFELEVBQVEsR0FBUjtBQUFBLFdBQWdCLE1BQU0sT0FBTixDQUFjLEdBQWQsQ0FBaEI7QUFBQTtBQUZJLENBQWhCOztBQUtBLElBQU0sWUFBWTtBQUNoQixjQUFZLG9CQUFDLEtBQUQsRUFBUSxPQUFSO0FBQUEsV0FBb0IsTUFBTSxPQUFOLEdBQWdCLE9BQXBDO0FBQUE7QUFESSxDQUFsQjs7QUFJQSxJQUFNLFVBQVU7QUFDZCxlQUFhLDJCQUFjO0FBQUEsUUFBWixNQUFZLFFBQVosTUFBWTs7QUFDekIsV0FBTyxVQUFQLEVBQW1CLFNBQW5CO0FBQ0Q7QUFIYSxDQUFoQjs7a0JBTWUsRUFBQyxZQUFELEVBQVEsZ0JBQVIsRUFBaUIsb0JBQWpCLEVBQTRCLGdCQUE1QixFOzs7Ozs7Ozs7QUNuQmY7Ozs7QUFDQTs7OztBQUVBOzs7O0FBRUEsY0FBSSxHQUFKOztrQkFFZSxJQUFJLGVBQUssS0FBVCxDQUFlO0FBQzVCLFdBQVM7QUFDUCxjQUFVLHdCQUFXLFVBQVgsRUFBMEI7QUFBQSxVQUF4QixNQUF3QixRQUF4QixNQUF3Qjs7QUFDbEMsb0JBQUksSUFBSixDQUFTLEdBQVQsQ0FBYSxhQUFhLE9BQTFCLEVBQ0csSUFESCxDQUNRO0FBQUEsZUFBWSxTQUFTLElBQVQsRUFBWjtBQUFBLE9BRFIsRUFFRyxJQUZILENBRVEsZ0JBQVE7QUFDWixZQUFHLElBQUgsRUFBUztBQUNQLGtCQUFRLEdBQVIsQ0FBWSxrQ0FBWixFQUFnRCxVQUFoRCxFQUE0RCxJQUE1RDtBQUNBLGtCQUFPLFVBQVA7QUFDRSxpQkFBSyxTQUFMO0FBQ0UscUJBQU8sWUFBUCxFQUFxQixJQUFyQjtBQUNBO0FBSEo7QUFLRDtBQUNGLE9BWEg7QUFZRDtBQWRNLEdBRG1CO0FBaUI1QixXQUFTLEVBQUMseUJBQUQ7QUFqQm1CLENBQWYsQzs7Ozs7Ozs7O0FDUGY7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1lBOzs7Ozs7O0FBR0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBTkE7Ozs7QUFkQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2lDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTkE7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBSkE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBS0E7QUFBQTtBQUFBO0FBR0E7QUFSQTtBQVZBOzs7O0FBaENBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1FBOzs7Ozs7O0FBR0E7QUFDQTtBQURBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFIQTtBQUpBOzs7OztBQVZBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwidmFyIFZ1ZSAvLyBsYXRlIGJpbmRcbnZhciBtYXAgPSB3aW5kb3cuX19WVUVfSE9UX01BUF9fID0gT2JqZWN0LmNyZWF0ZShudWxsKVxudmFyIGluc3RhbGxlZCA9IGZhbHNlXG52YXIgaXNCcm93c2VyaWZ5ID0gZmFsc2VcbnZhciBpbml0SG9va05hbWUgPSAnYmVmb3JlQ3JlYXRlJ1xuXG5leHBvcnRzLmluc3RhbGwgPSBmdW5jdGlvbiAodnVlLCBicm93c2VyaWZ5KSB7XG4gIGlmIChpbnN0YWxsZWQpIHJldHVyblxuICBpbnN0YWxsZWQgPSB0cnVlXG5cbiAgVnVlID0gdnVlXG4gIGlzQnJvd3NlcmlmeSA9IGJyb3dzZXJpZnlcblxuICAvLyBjb21wYXQgd2l0aCA8IDIuMC4wLWFscGhhLjdcbiAgaWYgKFZ1ZS5jb25maWcuX2xpZmVjeWNsZUhvb2tzLmluZGV4T2YoJ2luaXQnKSA+IC0xKSB7XG4gICAgaW5pdEhvb2tOYW1lID0gJ2luaXQnXG4gIH1cblxuICBleHBvcnRzLmNvbXBhdGlibGUgPSBOdW1iZXIoVnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXSkgPj0gMlxuICBpZiAoIWV4cG9ydHMuY29tcGF0aWJsZSkge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgICdbSE1SXSBZb3UgYXJlIHVzaW5nIGEgdmVyc2lvbiBvZiB2dWUtaG90LXJlbG9hZC1hcGkgdGhhdCBpcyAnICtcbiAgICAgICdvbmx5IGNvbXBhdGlibGUgd2l0aCBWdWUuanMgY29yZSBeMi4wLjAuJ1xuICAgIClcbiAgICByZXR1cm5cbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhIHJlY29yZCBmb3IgYSBob3QgbW9kdWxlLCB3aGljaCBrZWVwcyB0cmFjayBvZiBpdHMgY29uc3RydWN0b3JcbiAqIGFuZCBpbnN0YW5jZXNcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZXhwb3J0cy5jcmVhdGVSZWNvcmQgPSBmdW5jdGlvbiAoaWQsIG9wdGlvbnMpIHtcbiAgdmFyIEN0b3IgPSBudWxsXG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIEN0b3IgPSBvcHRpb25zXG4gICAgb3B0aW9ucyA9IEN0b3Iub3B0aW9uc1xuICB9XG4gIG1ha2VPcHRpb25zSG90KGlkLCBvcHRpb25zKVxuICBtYXBbaWRdID0ge1xuICAgIEN0b3I6IFZ1ZS5leHRlbmQob3B0aW9ucyksXG4gICAgaW5zdGFuY2VzOiBbXVxuICB9XG59XG5cbi8qKlxuICogTWFrZSBhIENvbXBvbmVudCBvcHRpb25zIG9iamVjdCBob3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIG1ha2VPcHRpb25zSG90IChpZCwgb3B0aW9ucykge1xuICBpbmplY3RIb29rKG9wdGlvbnMsIGluaXRIb29rTmFtZSwgZnVuY3Rpb24gKCkge1xuICAgIG1hcFtpZF0uaW5zdGFuY2VzLnB1c2godGhpcylcbiAgfSlcbiAgaW5qZWN0SG9vayhvcHRpb25zLCAnYmVmb3JlRGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW5zdGFuY2VzID0gbWFwW2lkXS5pbnN0YW5jZXNcbiAgICBpbnN0YW5jZXMuc3BsaWNlKGluc3RhbmNlcy5pbmRleE9mKHRoaXMpLCAxKVxuICB9KVxufVxuXG4vKipcbiAqIEluamVjdCBhIGhvb2sgdG8gYSBob3QgcmVsb2FkYWJsZSBjb21wb25lbnQgc28gdGhhdFxuICogd2UgY2FuIGtlZXAgdHJhY2sgb2YgaXQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBob29rXG4gKi9cblxuZnVuY3Rpb24gaW5qZWN0SG9vayAob3B0aW9ucywgbmFtZSwgaG9vaykge1xuICB2YXIgZXhpc3RpbmcgPSBvcHRpb25zW25hbWVdXG4gIG9wdGlvbnNbbmFtZV0gPSBleGlzdGluZ1xuICAgID8gQXJyYXkuaXNBcnJheShleGlzdGluZylcbiAgICAgID8gZXhpc3RpbmcuY29uY2F0KGhvb2spXG4gICAgICA6IFtleGlzdGluZywgaG9va11cbiAgICA6IFtob29rXVxufVxuXG5mdW5jdGlvbiB0cnlXcmFwIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKGlkLCBhcmcpIHtcbiAgICB0cnkgeyBmbihpZCwgYXJnKSB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpXG4gICAgICBjb25zb2xlLndhcm4oJ1NvbWV0aGluZyB3ZW50IHdyb25nIGR1cmluZyBWdWUgY29tcG9uZW50IGhvdC1yZWxvYWQuIEZ1bGwgcmVsb2FkIHJlcXVpcmVkLicpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydHMucmVyZW5kZXIgPSB0cnlXcmFwKGZ1bmN0aW9uIChpZCwgb3B0aW9ucykge1xuICB2YXIgcmVjb3JkID0gbWFwW2lkXVxuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucy5vcHRpb25zXG4gIH1cbiAgcmVjb3JkLkN0b3Iub3B0aW9ucy5yZW5kZXIgPSBvcHRpb25zLnJlbmRlclxuICByZWNvcmQuQ3Rvci5vcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zXG4gIHJlY29yZC5pbnN0YW5jZXMuc2xpY2UoKS5mb3JFYWNoKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgIGluc3RhbmNlLiRvcHRpb25zLnJlbmRlciA9IG9wdGlvbnMucmVuZGVyXG4gICAgaW5zdGFuY2UuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnNcbiAgICBpbnN0YW5jZS5fc3RhdGljVHJlZXMgPSBbXSAvLyByZXNldCBzdGF0aWMgdHJlZXNcbiAgICBpbnN0YW5jZS4kZm9yY2VVcGRhdGUoKVxuICB9KVxufSlcblxuZXhwb3J0cy5yZWxvYWQgPSB0cnlXcmFwKGZ1bmN0aW9uIChpZCwgb3B0aW9ucykge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucy5vcHRpb25zXG4gIH1cbiAgbWFrZU9wdGlvbnNIb3QoaWQsIG9wdGlvbnMpXG4gIHZhciByZWNvcmQgPSBtYXBbaWRdXG4gIHJlY29yZC5DdG9yLmV4dGVuZE9wdGlvbnMgPSBvcHRpb25zXG4gIHZhciBuZXdDdG9yID0gVnVlLmV4dGVuZChvcHRpb25zKVxuICByZWNvcmQuQ3Rvci5vcHRpb25zID0gbmV3Q3Rvci5vcHRpb25zXG4gIHJlY29yZC5DdG9yLmNpZCA9IG5ld0N0b3IuY2lkXG4gIGlmIChuZXdDdG9yLnJlbGVhc2UpIHtcbiAgICAvLyB0ZW1wb3JhcnkgZ2xvYmFsIG1peGluIHN0cmF0ZWd5IHVzZWQgaW4gPCAyLjAuMC1hbHBoYS42XG4gICAgbmV3Q3Rvci5yZWxlYXNlKClcbiAgfVxuICByZWNvcmQuaW5zdGFuY2VzLnNsaWNlKCkuZm9yRWFjaChmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICBpZiAoaW5zdGFuY2UuJHZub2RlICYmIGluc3RhbmNlLiR2bm9kZS5jb250ZXh0KSB7XG4gICAgICBpbnN0YW5jZS4kdm5vZGUuY29udGV4dC4kZm9yY2VVcGRhdGUoKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1Jvb3Qgb3IgbWFudWFsbHkgbW91bnRlZCBpbnN0YW5jZSBtb2RpZmllZC4gRnVsbCByZWxvYWQgcmVxdWlyZWQuJylcbiAgICB9XG4gIH0pXG59KVxuIiwiLyohXG4gKiB2dWUtcmVzb3VyY2UgdjEuMS4yXG4gKiBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlLXJlc291cmNlXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFByb21pc2VzL0ErIHBvbHlmaWxsIHYxLjEuNCAoaHR0cHM6Ly9naXRodWIuY29tL2JyYW1zdGVpbi9wcm9taXMpXG4gKi9cblxudmFyIFJFU09MVkVEID0gMDtcbnZhciBSRUpFQ1RFRCA9IDE7XG52YXIgUEVORElORyAgPSAyO1xuXG5mdW5jdGlvbiBQcm9taXNlJDEoZXhlY3V0b3IpIHtcblxuICAgIHRoaXMuc3RhdGUgPSBQRU5ESU5HO1xuICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5kZWZlcnJlZCA9IFtdO1xuXG4gICAgdmFyIHByb21pc2UgPSB0aGlzO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgZXhlY3V0b3IoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZSh4KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgIHByb21pc2UucmVqZWN0KHIpO1xuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbn1cblxuUHJvbWlzZSQxLnJlamVjdCA9IGZ1bmN0aW9uIChyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICByZWplY3Qocik7XG4gICAgfSk7XG59O1xuXG5Qcm9taXNlJDEucmVzb2x2ZSA9IGZ1bmN0aW9uICh4KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICByZXNvbHZlKHgpO1xuICAgIH0pO1xufTtcblxuUHJvbWlzZSQxLmFsbCA9IGZ1bmN0aW9uIGFsbChpdGVyYWJsZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gMCwgcmVzdWx0ID0gW107XG5cbiAgICAgICAgaWYgKGl0ZXJhYmxlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZXIoaSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2ldID0geDtcbiAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvdW50ID09PSBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZXJhYmxlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBQcm9taXNlJDEucmVzb2x2ZShpdGVyYWJsZVtpXSkudGhlbihyZXNvbHZlcihpKSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuUHJvbWlzZSQxLnJhY2UgPSBmdW5jdGlvbiByYWNlKGl0ZXJhYmxlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlJDEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZXJhYmxlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBQcm9taXNlJDEucmVzb2x2ZShpdGVyYWJsZVtpXSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG52YXIgcCQxID0gUHJvbWlzZSQxLnByb3RvdHlwZTtcblxucCQxLnJlc29sdmUgPSBmdW5jdGlvbiByZXNvbHZlKHgpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHRoaXM7XG5cbiAgICBpZiAocHJvbWlzZS5zdGF0ZSA9PT0gUEVORElORykge1xuICAgICAgICBpZiAoeCA9PT0gcHJvbWlzZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvbWlzZSBzZXR0bGVkIHdpdGggaXRzZWxmLicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgdGhlbiA9IHggJiYgeFsndGhlbiddO1xuXG4gICAgICAgICAgICBpZiAoeCAhPT0gbnVsbCAmJiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGVuLmNhbGwoeCwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UucmVzb2x2ZSh4KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2UucmVqZWN0KHIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgICAgICAgICAgIHByb21pc2UucmVqZWN0KGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvbWlzZS5zdGF0ZSA9IFJFU09MVkVEO1xuICAgICAgICBwcm9taXNlLnZhbHVlID0geDtcbiAgICAgICAgcHJvbWlzZS5ub3RpZnkoKTtcbiAgICB9XG59O1xuXG5wJDEucmVqZWN0ID0gZnVuY3Rpb24gcmVqZWN0KHJlYXNvbikge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIGlmIChwcm9taXNlLnN0YXRlID09PSBQRU5ESU5HKSB7XG4gICAgICAgIGlmIChyZWFzb24gPT09IHByb21pc2UpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2Ugc2V0dGxlZCB3aXRoIGl0c2VsZi4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb21pc2Uuc3RhdGUgPSBSRUpFQ1RFRDtcbiAgICAgICAgcHJvbWlzZS52YWx1ZSA9IHJlYXNvbjtcbiAgICAgICAgcHJvbWlzZS5ub3RpZnkoKTtcbiAgICB9XG59O1xuXG5wJDEubm90aWZ5ID0gZnVuY3Rpb24gbm90aWZ5KCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIG5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHByb21pc2Uuc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICAgICAgICAgIHdoaWxlIChwcm9taXNlLmRlZmVycmVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBkZWZlcnJlZCA9IHByb21pc2UuZGVmZXJyZWQuc2hpZnQoKSxcbiAgICAgICAgICAgICAgICAgICAgb25SZXNvbHZlZCA9IGRlZmVycmVkWzBdLFxuICAgICAgICAgICAgICAgICAgICBvblJlamVjdGVkID0gZGVmZXJyZWRbMV0sXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUgPSBkZWZlcnJlZFsyXSxcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0ID0gZGVmZXJyZWRbM107XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJvbWlzZS5zdGF0ZSA9PT0gUkVTT0xWRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb25SZXNvbHZlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUob25SZXNvbHZlZC5jYWxsKHVuZGVmaW5lZCwgcHJvbWlzZS52YWx1ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHByb21pc2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHByb21pc2Uuc3RhdGUgPT09IFJFSkVDVEVEKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKG9uUmVqZWN0ZWQuY2FsbCh1bmRlZmluZWQsIHByb21pc2UudmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHByb21pc2UudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5wJDEudGhlbiA9IGZ1bmN0aW9uIHRoZW4ob25SZXNvbHZlZCwgb25SZWplY3RlZCkge1xuICAgIHZhciBwcm9taXNlID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSQxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcHJvbWlzZS5kZWZlcnJlZC5wdXNoKFtvblJlc29sdmVkLCBvblJlamVjdGVkLCByZXNvbHZlLCByZWplY3RdKTtcbiAgICAgICAgcHJvbWlzZS5ub3RpZnkoKTtcbiAgICB9KTtcbn07XG5cbnAkMS5jYXRjaCA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xufTtcblxuLyoqXG4gKiBQcm9taXNlIGFkYXB0ZXIuXG4gKi9cblxuaWYgKHR5cGVvZiBQcm9taXNlID09PSAndW5kZWZpbmVkJykge1xuICAgIHdpbmRvdy5Qcm9taXNlID0gUHJvbWlzZSQxO1xufVxuXG5mdW5jdGlvbiBQcm9taXNlT2JqKGV4ZWN1dG9yLCBjb250ZXh0KSB7XG5cbiAgICBpZiAoZXhlY3V0b3IgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IGV4ZWN1dG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGV4ZWN1dG9yLmJpbmQoY29udGV4dCkpO1xuICAgIH1cblxuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG59XG5cblByb21pc2VPYmouYWxsID0gZnVuY3Rpb24gKGl0ZXJhYmxlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlT2JqKFByb21pc2UuYWxsKGl0ZXJhYmxlKSwgY29udGV4dCk7XG59O1xuXG5Qcm9taXNlT2JqLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2VPYmooUHJvbWlzZS5yZXNvbHZlKHZhbHVlKSwgY29udGV4dCk7XG59O1xuXG5Qcm9taXNlT2JqLnJlamVjdCA9IGZ1bmN0aW9uIChyZWFzb24sIGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2VPYmooUHJvbWlzZS5yZWplY3QocmVhc29uKSwgY29udGV4dCk7XG59O1xuXG5Qcm9taXNlT2JqLnJhY2UgPSBmdW5jdGlvbiAoaXRlcmFibGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2VPYmooUHJvbWlzZS5yYWNlKGl0ZXJhYmxlKSwgY29udGV4dCk7XG59O1xuXG52YXIgcCA9IFByb21pc2VPYmoucHJvdG90eXBlO1xuXG5wLmJpbmQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5wLnRoZW4gPSBmdW5jdGlvbiAoZnVsZmlsbGVkLCByZWplY3RlZCkge1xuXG4gICAgaWYgKGZ1bGZpbGxlZCAmJiBmdWxmaWxsZWQuYmluZCAmJiB0aGlzLmNvbnRleHQpIHtcbiAgICAgICAgZnVsZmlsbGVkID0gZnVsZmlsbGVkLmJpbmQodGhpcy5jb250ZXh0KTtcbiAgICB9XG5cbiAgICBpZiAocmVqZWN0ZWQgJiYgcmVqZWN0ZWQuYmluZCAmJiB0aGlzLmNvbnRleHQpIHtcbiAgICAgICAgcmVqZWN0ZWQgPSByZWplY3RlZC5iaW5kKHRoaXMuY29udGV4dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlT2JqKHRoaXMucHJvbWlzZS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpLCB0aGlzLmNvbnRleHQpO1xufTtcblxucC5jYXRjaCA9IGZ1bmN0aW9uIChyZWplY3RlZCkge1xuXG4gICAgaWYgKHJlamVjdGVkICYmIHJlamVjdGVkLmJpbmQgJiYgdGhpcy5jb250ZXh0KSB7XG4gICAgICAgIHJlamVjdGVkID0gcmVqZWN0ZWQuYmluZCh0aGlzLmNvbnRleHQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZU9iaih0aGlzLnByb21pc2UuY2F0Y2gocmVqZWN0ZWQpLCB0aGlzLmNvbnRleHQpO1xufTtcblxucC5maW5hbGx5ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cbiAgICByZXR1cm4gdGhpcy50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cbi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbnMuXG4gKi9cblxudmFyIGRlYnVnID0gZmFsc2U7XG52YXIgdXRpbCA9IHt9O1xudmFyIHJlZiA9IHt9O1xudmFyIGhhc093blByb3BlcnR5ID0gcmVmLmhhc093blByb3BlcnR5O1xuXG52YXIgcmVmJDEgPSBbXTtcbnZhciBzbGljZSA9IHJlZiQxLnNsaWNlO1xuXG52YXIgaW5Ccm93c2VyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XG5cbnZhciBVdGlsID0gZnVuY3Rpb24gKFZ1ZSkge1xuICAgIHV0aWwgPSBWdWUudXRpbDtcbiAgICBkZWJ1ZyA9IFZ1ZS5jb25maWcuZGVidWcgfHwgIVZ1ZS5jb25maWcuc2lsZW50O1xufTtcblxuZnVuY3Rpb24gd2Fybihtc2cpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGRlYnVnKSB7XG4gICAgICAgIGNvbnNvbGUud2FybignW1Z1ZVJlc291cmNlIHdhcm5dOiAnICsgbXNnKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGVycm9yKG1zZykge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbmV4dFRpY2soY2IsIGN0eCkge1xuICAgIHJldHVybiB1dGlsLm5leHRUaWNrKGNiLCBjdHgpO1xufVxuXG5mdW5jdGlvbiB0cmltKHN0cikge1xuICAgIHJldHVybiBzdHIgPyBzdHIucmVwbGFjZSgvXlxccyp8XFxzKiQvZywgJycpIDogJyc7XG59XG5cbmZ1bmN0aW9uIHRvTG93ZXIoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA/IHN0ci50b0xvd2VyQ2FzZSgpIDogJyc7XG59XG5cbmZ1bmN0aW9uIHRvVXBwZXIoc3RyKSB7XG4gICAgcmV0dXJuIHN0ciA/IHN0ci50b1VwcGVyQ2FzZSgpIDogJyc7XG59XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnO1xufVxuXG5cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0Jztcbn1cblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvYmopIHtcbiAgICByZXR1cm4gaXNPYmplY3Qob2JqKSAmJiBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKSA9PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG5mdW5jdGlvbiBpc0Jsb2Iob2JqKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJyAmJiBvYmogaW5zdGFuY2VvZiBCbG9iO1xufVxuXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKG9iaikge1xuICAgIHJldHVybiB0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnICYmIG9iaiBpbnN0YW5jZW9mIEZvcm1EYXRhO1xufVxuXG5mdW5jdGlvbiB3aGVuKHZhbHVlLCBmdWxmaWxsZWQsIHJlamVjdGVkKSB7XG5cbiAgICB2YXIgcHJvbWlzZSA9IFByb21pc2VPYmoucmVzb2x2ZSh2YWx1ZSk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb21pc2UudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTtcbn1cblxuZnVuY3Rpb24gb3B0aW9ucyhmbiwgb2JqLCBvcHRzKSB7XG5cbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKG9wdHMpKSB7XG4gICAgICAgIG9wdHMgPSBvcHRzLmNhbGwob2JqKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2UoZm4uYmluZCh7JHZtOiBvYmosICRvcHRpb25zOiBvcHRzfSksIGZuLCB7JG9wdGlvbnM6IG9wdHN9KTtcbn1cblxuZnVuY3Rpb24gZWFjaChvYmosIGl0ZXJhdG9yKSB7XG5cbiAgICB2YXIgaSwga2V5O1xuXG4gICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKG9ialtpXSwgb2JqW2ldLCBpKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNPYmplY3Qob2JqKSkge1xuICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yLmNhbGwob2JqW2tleV0sIG9ialtrZXldLCBrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn1cblxudmFyIGFzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgX2Fzc2lnbjtcblxuZnVuY3Rpb24gbWVyZ2UodGFyZ2V0KSB7XG5cbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICAgIF9tZXJnZSh0YXJnZXQsIHNvdXJjZSwgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0cyh0YXJnZXQpIHtcblxuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2UpIHtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAodGFyZ2V0W2tleV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbn1cblxuZnVuY3Rpb24gX2Fzc2lnbih0YXJnZXQpIHtcblxuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgYXJncy5mb3JFYWNoKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgX21lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIF9tZXJnZSh0YXJnZXQsIHNvdXJjZSwgZGVlcCkge1xuICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgaWYgKGRlZXAgJiYgKGlzUGxhaW5PYmplY3Qoc291cmNlW2tleV0pIHx8IGlzQXJyYXkoc291cmNlW2tleV0pKSkge1xuICAgICAgICAgICAgaWYgKGlzUGxhaW5PYmplY3Qoc291cmNlW2tleV0pICYmICFpc1BsYWluT2JqZWN0KHRhcmdldFtrZXldKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNBcnJheShzb3VyY2Vba2V5XSkgJiYgIWlzQXJyYXkodGFyZ2V0W2tleV0pKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9tZXJnZSh0YXJnZXRba2V5XSwgc291cmNlW2tleV0sIGRlZXApO1xuICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZVtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogUm9vdCBQcmVmaXggVHJhbnNmb3JtLlxuICovXG5cbnZhciByb290ID0gZnVuY3Rpb24gKG9wdGlvbnMkJDEsIG5leHQpIHtcblxuICAgIHZhciB1cmwgPSBuZXh0KG9wdGlvbnMkJDEpO1xuXG4gICAgaWYgKGlzU3RyaW5nKG9wdGlvbnMkJDEucm9vdCkgJiYgIXVybC5tYXRjaCgvXihodHRwcz86KT9cXC8vKSkge1xuICAgICAgICB1cmwgPSBvcHRpb25zJCQxLnJvb3QgKyAnLycgKyB1cmw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybDtcbn07XG5cbi8qKlxuICogUXVlcnkgUGFyYW1ldGVyIFRyYW5zZm9ybS5cbiAqL1xuXG52YXIgcXVlcnkgPSBmdW5jdGlvbiAob3B0aW9ucyQkMSwgbmV4dCkge1xuXG4gICAgdmFyIHVybFBhcmFtcyA9IE9iamVjdC5rZXlzKFVybC5vcHRpb25zLnBhcmFtcyksIHF1ZXJ5ID0ge30sIHVybCA9IG5leHQob3B0aW9ucyQkMSk7XG5cbiAgICBlYWNoKG9wdGlvbnMkJDEucGFyYW1zLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICBpZiAodXJsUGFyYW1zLmluZGV4T2Yoa2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHF1ZXJ5W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcXVlcnkgPSBVcmwucGFyYW1zKHF1ZXJ5KTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPT0gLTEgPyAnPycgOiAnJicpICsgcXVlcnk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybDtcbn07XG5cbi8qKlxuICogVVJMIFRlbXBsYXRlIHYyLjAuNiAoaHR0cHM6Ly9naXRodWIuY29tL2JyYW1zdGVpbi91cmwtdGVtcGxhdGUpXG4gKi9cblxuZnVuY3Rpb24gZXhwYW5kKHVybCwgcGFyYW1zLCB2YXJpYWJsZXMpIHtcblxuICAgIHZhciB0bXBsID0gcGFyc2UodXJsKSwgZXhwYW5kZWQgPSB0bXBsLmV4cGFuZChwYXJhbXMpO1xuXG4gICAgaWYgKHZhcmlhYmxlcykge1xuICAgICAgICB2YXJpYWJsZXMucHVzaC5hcHBseSh2YXJpYWJsZXMsIHRtcGwudmFycyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cGFuZGVkO1xufVxuXG5mdW5jdGlvbiBwYXJzZSh0ZW1wbGF0ZSkge1xuXG4gICAgdmFyIG9wZXJhdG9ycyA9IFsnKycsICcjJywgJy4nLCAnLycsICc7JywgJz8nLCAnJiddLCB2YXJpYWJsZXMgPSBbXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHZhcnM6IHZhcmlhYmxlcyxcbiAgICAgICAgZXhwYW5kOiBmdW5jdGlvbiBleHBhbmQoY29udGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlLnJlcGxhY2UoL1xceyhbXlxce1xcfV0rKVxcfXwoW15cXHtcXH1dKykvZywgZnVuY3Rpb24gKF8sIGV4cHJlc3Npb24sIGxpdGVyYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXhwcmVzc2lvbikge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcGVyYXRvciA9IG51bGwsIHZhbHVlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcGVyYXRvcnMuaW5kZXhPZihleHByZXNzaW9uLmNoYXJBdCgwKSkgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRvciA9IGV4cHJlc3Npb24uY2hhckF0KDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24uc3Vic3RyKDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZXhwcmVzc2lvbi5zcGxpdCgvLC9nKS5mb3JFYWNoKGZ1bmN0aW9uICh2YXJpYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRtcCA9IC8oW146XFwqXSopKD86OihcXGQrKXwoXFwqKSk/Ly5leGVjKHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoLmFwcGx5KHZhbHVlcywgZ2V0VmFsdWVzKGNvbnRleHQsIG9wZXJhdG9yLCB0bXBbMV0sIHRtcFsyXSB8fCB0bXBbM10pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhYmxlcy5wdXNoKHRtcFsxXSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcGVyYXRvciAmJiBvcGVyYXRvciAhPT0gJysnKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZXBhcmF0b3IgPSAnLCc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcGVyYXRvciA9PT0gJz8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VwYXJhdG9yID0gJyYnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvcGVyYXRvciAhPT0gJyMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VwYXJhdG9yID0gb3BlcmF0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAodmFsdWVzLmxlbmd0aCAhPT0gMCA/IG9wZXJhdG9yIDogJycpICsgdmFsdWVzLmpvaW4oc2VwYXJhdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXMuam9pbignLCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlUmVzZXJ2ZWQobGl0ZXJhbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBnZXRWYWx1ZXMoY29udGV4dCwgb3BlcmF0b3IsIGtleSwgbW9kaWZpZXIpIHtcblxuICAgIHZhciB2YWx1ZSA9IGNvbnRleHRba2V5XSwgcmVzdWx0ID0gW107XG5cbiAgICBpZiAoaXNEZWZpbmVkKHZhbHVlKSAmJiB2YWx1ZSAhPT0gJycpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpO1xuXG4gICAgICAgICAgICBpZiAobW9kaWZpZXIgJiYgbW9kaWZpZXIgIT09ICcqJykge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKDAsIHBhcnNlSW50KG1vZGlmaWVyLCAxMCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHQucHVzaChlbmNvZGVWYWx1ZShvcGVyYXRvciwgdmFsdWUsIGlzS2V5T3BlcmF0b3Iob3BlcmF0b3IpID8ga2V5IDogbnVsbCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vZGlmaWVyID09PSAnKicpIHtcbiAgICAgICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUuZmlsdGVyKGlzRGVmaW5lZCkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZSwgaXNLZXlPcGVyYXRvcihvcGVyYXRvcikgPyBrZXkgOiBudWxsKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZpbmVkKHZhbHVlW2tdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVZhbHVlKG9wZXJhdG9yLCB2YWx1ZVtrXSwgaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB0bXAgPSBbXTtcblxuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5maWx0ZXIoaXNEZWZpbmVkKS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG1wLnB1c2goZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWZpbmVkKHZhbHVlW2tdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG1wLnB1c2goZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlW2tdLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzS2V5T3BlcmF0b3Iob3BlcmF0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgdG1wLmpvaW4oJywnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0bXAubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRtcC5qb2luKCcsJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChvcGVyYXRvciA9PT0gJzsnKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICcnICYmIChvcGVyYXRvciA9PT0gJyYnIHx8IG9wZXJhdG9yID09PSAnPycpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaCgnJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc0RlZmluZWQodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNLZXlPcGVyYXRvcihvcGVyYXRvcikge1xuICAgIHJldHVybiBvcGVyYXRvciA9PT0gJzsnIHx8IG9wZXJhdG9yID09PSAnJicgfHwgb3BlcmF0b3IgPT09ICc/Jztcbn1cblxuZnVuY3Rpb24gZW5jb2RlVmFsdWUob3BlcmF0b3IsIHZhbHVlLCBrZXkpIHtcblxuICAgIHZhbHVlID0gKG9wZXJhdG9yID09PSAnKycgfHwgb3BlcmF0b3IgPT09ICcjJykgPyBlbmNvZGVSZXNlcnZlZCh2YWx1ZSkgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBlbmNvZGVSZXNlcnZlZChzdHIpIHtcbiAgICByZXR1cm4gc3RyLnNwbGl0KC8oJVswLTlBLUZhLWZdezJ9KS9nKS5tYXAoZnVuY3Rpb24gKHBhcnQpIHtcbiAgICAgICAgaWYgKCEvJVswLTlBLUZhLWZdLy50ZXN0KHBhcnQpKSB7XG4gICAgICAgICAgICBwYXJ0ID0gZW5jb2RlVVJJKHBhcnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJ0O1xuICAgIH0pLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIFVSTCBUZW1wbGF0ZSAoUkZDIDY1NzApIFRyYW5zZm9ybS5cbiAqL1xuXG52YXIgdGVtcGxhdGUgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuXG4gICAgdmFyIHZhcmlhYmxlcyA9IFtdLCB1cmwgPSBleHBhbmQob3B0aW9ucy51cmwsIG9wdGlvbnMucGFyYW1zLCB2YXJpYWJsZXMpO1xuXG4gICAgdmFyaWFibGVzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBkZWxldGUgb3B0aW9ucy5wYXJhbXNba2V5XTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1cmw7XG59O1xuXG4vKipcbiAqIFNlcnZpY2UgZm9yIFVSTCB0ZW1wbGF0aW5nLlxuICovXG5cbmZ1bmN0aW9uIFVybCh1cmwsIHBhcmFtcykge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzIHx8IHt9LCBvcHRpb25zJCQxID0gdXJsLCB0cmFuc2Zvcm07XG5cbiAgICBpZiAoaXNTdHJpbmcodXJsKSkge1xuICAgICAgICBvcHRpb25zJCQxID0ge3VybDogdXJsLCBwYXJhbXM6IHBhcmFtc307XG4gICAgfVxuXG4gICAgb3B0aW9ucyQkMSA9IG1lcmdlKHt9LCBVcmwub3B0aW9ucywgc2VsZi4kb3B0aW9ucywgb3B0aW9ucyQkMSk7XG5cbiAgICBVcmwudHJhbnNmb3Jtcy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIHRyYW5zZm9ybSA9IGZhY3RvcnkoaGFuZGxlciwgdHJhbnNmb3JtLCBzZWxmLiR2bSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJhbnNmb3JtKG9wdGlvbnMkJDEpO1xufVxuXG4vKipcbiAqIFVybCBvcHRpb25zLlxuICovXG5cblVybC5vcHRpb25zID0ge1xuICAgIHVybDogJycsXG4gICAgcm9vdDogbnVsbCxcbiAgICBwYXJhbXM6IHt9XG59O1xuXG4vKipcbiAqIFVybCB0cmFuc2Zvcm1zLlxuICovXG5cblVybC50cmFuc2Zvcm1zID0gW3RlbXBsYXRlLCBxdWVyeSwgcm9vdF07XG5cbi8qKlxuICogRW5jb2RlcyBhIFVybCBwYXJhbWV0ZXIgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqL1xuXG5VcmwucGFyYW1zID0gZnVuY3Rpb24gKG9iaikge1xuXG4gICAgdmFyIHBhcmFtcyA9IFtdLCBlc2NhcGUgPSBlbmNvZGVVUklDb21wb25lbnQ7XG5cbiAgICBwYXJhbXMuYWRkID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblxuICAgICAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdmFsdWUgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHVzaChlc2NhcGUoa2V5KSArICc9JyArIGVzY2FwZSh2YWx1ZSkpO1xuICAgIH07XG5cbiAgICBzZXJpYWxpemUocGFyYW1zLCBvYmopO1xuXG4gICAgcmV0dXJuIHBhcmFtcy5qb2luKCcmJykucmVwbGFjZSgvJTIwL2csICcrJyk7XG59O1xuXG4vKipcbiAqIFBhcnNlIGEgVVJMIGFuZCByZXR1cm4gaXRzIGNvbXBvbmVudHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICovXG5cblVybC5wYXJzZSA9IGZ1bmN0aW9uICh1cmwpIHtcblxuICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcblxuICAgIGlmIChkb2N1bWVudC5kb2N1bWVudE1vZGUpIHtcbiAgICAgICAgZWwuaHJlZiA9IHVybDtcbiAgICAgICAgdXJsID0gZWwuaHJlZjtcbiAgICB9XG5cbiAgICBlbC5ocmVmID0gdXJsO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaHJlZjogZWwuaHJlZixcbiAgICAgICAgcHJvdG9jb2w6IGVsLnByb3RvY29sID8gZWwucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgcG9ydDogZWwucG9ydCxcbiAgICAgICAgaG9zdDogZWwuaG9zdCxcbiAgICAgICAgaG9zdG5hbWU6IGVsLmhvc3RuYW1lLFxuICAgICAgICBwYXRobmFtZTogZWwucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycgPyBlbC5wYXRobmFtZSA6ICcvJyArIGVsLnBhdGhuYW1lLFxuICAgICAgICBzZWFyY2g6IGVsLnNlYXJjaCA/IGVsLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgIGhhc2g6IGVsLmhhc2ggPyBlbC5oYXNoLnJlcGxhY2UoL14jLywgJycpIDogJydcbiAgICB9O1xufTtcblxuZnVuY3Rpb24gZmFjdG9yeShoYW5kbGVyLCBuZXh0LCB2bSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAob3B0aW9ucyQkMSkge1xuICAgICAgICByZXR1cm4gaGFuZGxlci5jYWxsKHZtLCBvcHRpb25zJCQxLCBuZXh0KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemUocGFyYW1zLCBvYmosIHNjb3BlKSB7XG5cbiAgICB2YXIgYXJyYXkgPSBpc0FycmF5KG9iaiksIHBsYWluID0gaXNQbGFpbk9iamVjdChvYmopLCBoYXNoO1xuXG4gICAgZWFjaChvYmosIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG5cbiAgICAgICAgaGFzaCA9IGlzT2JqZWN0KHZhbHVlKSB8fCBpc0FycmF5KHZhbHVlKTtcblxuICAgICAgICBpZiAoc2NvcGUpIHtcbiAgICAgICAgICAgIGtleSA9IHNjb3BlICsgJ1snICsgKHBsYWluIHx8IGhhc2ggPyBrZXkgOiAnJykgKyAnXSc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNjb3BlICYmIGFycmF5KSB7XG4gICAgICAgICAgICBwYXJhbXMuYWRkKHZhbHVlLm5hbWUsIHZhbHVlLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNoKSB7XG4gICAgICAgICAgICBzZXJpYWxpemUocGFyYW1zLCB2YWx1ZSwga2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmFtcy5hZGQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBYRG9tYWluIGNsaWVudCAoSW50ZXJuZXQgRXhwbG9yZXIpLlxuICovXG5cbnZhciB4ZHJDbGllbnQgPSBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZU9iaihmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgIHZhciB4ZHIgPSBuZXcgWERvbWFpblJlcXVlc3QoKSwgaGFuZGxlciA9IGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgICAgIHZhciB0eXBlID0gcmVmLnR5cGU7XG5cblxuICAgICAgICAgICAgdmFyIHN0YXR1cyA9IDA7XG5cbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnbG9hZCcpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSAyMDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSA1MDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25kV2l0aCh4ZHIucmVzcG9uc2VUZXh0LCB7c3RhdHVzOiBzdGF0dXN9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHhkci5hYm9ydCgpOyB9O1xuXG4gICAgICAgIHhkci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LmdldFVybCgpKTtcblxuICAgICAgICBpZiAocmVxdWVzdC50aW1lb3V0KSB7XG4gICAgICAgICAgICB4ZHIudGltZW91dCA9IHJlcXVlc3QudGltZW91dDtcbiAgICAgICAgfVxuXG4gICAgICAgIHhkci5vbmxvYWQgPSBoYW5kbGVyO1xuICAgICAgICB4ZHIub25hYm9ydCA9IGhhbmRsZXI7XG4gICAgICAgIHhkci5vbmVycm9yID0gaGFuZGxlcjtcbiAgICAgICAgeGRyLm9udGltZW91dCA9IGhhbmRsZXI7XG4gICAgICAgIHhkci5vbnByb2dyZXNzID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIHhkci5zZW5kKHJlcXVlc3QuZ2V0Qm9keSgpKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ09SUyBJbnRlcmNlcHRvci5cbiAqL1xuXG52YXIgU1VQUE9SVFNfQ09SUyA9IGluQnJvd3NlciAmJiAnd2l0aENyZWRlbnRpYWxzJyBpbiBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxudmFyIGNvcnMgPSBmdW5jdGlvbiAocmVxdWVzdCwgbmV4dCkge1xuXG4gICAgaWYgKGluQnJvd3Nlcikge1xuXG4gICAgICAgIHZhciBvcmdVcmwgPSBVcmwucGFyc2UobG9jYXRpb24uaHJlZik7XG4gICAgICAgIHZhciByZXFVcmwgPSBVcmwucGFyc2UocmVxdWVzdC5nZXRVcmwoKSk7XG5cbiAgICAgICAgaWYgKHJlcVVybC5wcm90b2NvbCAhPT0gb3JnVXJsLnByb3RvY29sIHx8IHJlcVVybC5ob3N0ICE9PSBvcmdVcmwuaG9zdCkge1xuXG4gICAgICAgICAgICByZXF1ZXN0LmNyb3NzT3JpZ2luID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlcXVlc3QuZW11bGF0ZUhUVFAgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKCFTVVBQT1JUU19DT1JTKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdC5jbGllbnQgPSB4ZHJDbGllbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZXh0KCk7XG59O1xuXG4vKipcbiAqIEJvZHkgSW50ZXJjZXB0b3IuXG4gKi9cblxudmFyIGJvZHkgPSBmdW5jdGlvbiAocmVxdWVzdCwgbmV4dCkge1xuXG4gICAgaWYgKGlzRm9ybURhdGEocmVxdWVzdC5ib2R5KSkge1xuXG4gICAgICAgIHJlcXVlc3QuaGVhZGVycy5kZWxldGUoJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgfSBlbHNlIGlmIChpc09iamVjdChyZXF1ZXN0LmJvZHkpIHx8IGlzQXJyYXkocmVxdWVzdC5ib2R5KSkge1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LmVtdWxhdGVKU09OKSB7XG4gICAgICAgICAgICByZXF1ZXN0LmJvZHkgPSBVcmwucGFyYW1zKHJlcXVlc3QuYm9keSk7XG4gICAgICAgICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXF1ZXN0LmJvZHkgPSBKU09OLnN0cmluZ2lmeShyZXF1ZXN0LmJvZHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmV4dChmdW5jdGlvbiAocmVzcG9uc2UpIHtcblxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVzcG9uc2UsICdkYXRhJywge1xuXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ib2R5O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoYm9keSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9keSA9IGJvZHk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmJvZHlUZXh0ID8gd2hlbihyZXNwb25zZS50ZXh0KCksIGZ1bmN0aW9uICh0ZXh0KSB7XG5cbiAgICAgICAgICAgIHZhciB0eXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtVHlwZScpIHx8ICcnO1xuXG4gICAgICAgICAgICBpZiAodHlwZS5pbmRleE9mKCdhcHBsaWNhdGlvbi9qc29uJykgPT09IDAgfHwgaXNKc29uKHRleHQpKSB7XG5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5ib2R5ID0gSlNPTi5wYXJzZSh0ZXh0KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmJvZHkgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5ib2R5ID0gdGV4dDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuXG4gICAgICAgIH0pIDogcmVzcG9uc2U7XG5cbiAgICB9KTtcbn07XG5cbmZ1bmN0aW9uIGlzSnNvbihzdHIpIHtcblxuICAgIHZhciBzdGFydCA9IHN0ci5tYXRjaCgvXlxcW3xeXFx7KD8hXFx7KS8pLCBlbmQgPSB7J1snOiAvXSQvLCAneyc6IC99JC99O1xuXG4gICAgcmV0dXJuIHN0YXJ0ICYmIGVuZFtzdGFydFswXV0udGVzdChzdHIpO1xufVxuXG4vKipcbiAqIEpTT05QIGNsaWVudC5cbiAqL1xuXG52YXIganNvbnBDbGllbnQgPSBmdW5jdGlvbiAocmVxdWVzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZU9iaihmdW5jdGlvbiAocmVzb2x2ZSkge1xuXG4gICAgICAgIHZhciBuYW1lID0gcmVxdWVzdC5qc29ucCB8fCAnY2FsbGJhY2snLCBjYWxsYmFjayA9IHJlcXVlc3QuanNvbnBDYWxsYmFjayB8fCAnX2pzb25wJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyKSwgYm9keSA9IG51bGwsIGhhbmRsZXIsIHNjcmlwdDtcblxuICAgICAgICBoYW5kbGVyID0gZnVuY3Rpb24gKHJlZikge1xuICAgICAgICAgICAgdmFyIHR5cGUgPSByZWYudHlwZTtcblxuXG4gICAgICAgICAgICB2YXIgc3RhdHVzID0gMDtcblxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdsb2FkJyAmJiBib2R5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzID0gMjAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzID0gNTAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RhdHVzICYmIHdpbmRvd1tjYWxsYmFja10pIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgd2luZG93W2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25kV2l0aChib2R5LCB7c3RhdHVzOiBzdGF0dXN9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgd2luZG93W2NhbGxiYWNrXSA9IGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIGJvZHkgPSBKU09OLnN0cmluZ2lmeShyZXN1bHQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJlcXVlc3QuYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBoYW5kbGVyKHt0eXBlOiAnYWJvcnQnfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVxdWVzdC5wYXJhbXNbbmFtZV0gPSBjYWxsYmFjaztcblxuICAgICAgICBpZiAocmVxdWVzdC50aW1lb3V0KSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHJlcXVlc3QuYWJvcnQsIHJlcXVlc3QudGltZW91dCk7XG4gICAgICAgIH1cblxuICAgICAgICBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgc2NyaXB0LnNyYyA9IHJlcXVlc3QuZ2V0VXJsKCk7XG4gICAgICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICAgIHNjcmlwdC5hc3luYyA9IHRydWU7XG4gICAgICAgIHNjcmlwdC5vbmxvYWQgPSBoYW5kbGVyO1xuICAgICAgICBzY3JpcHQub25lcnJvciA9IGhhbmRsZXI7XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBKU09OUCBJbnRlcmNlcHRvci5cbiAqL1xuXG52YXIganNvbnAgPSBmdW5jdGlvbiAocmVxdWVzdCwgbmV4dCkge1xuXG4gICAgaWYgKHJlcXVlc3QubWV0aG9kID09ICdKU09OUCcpIHtcbiAgICAgICAgcmVxdWVzdC5jbGllbnQgPSBqc29ucENsaWVudDtcbiAgICB9XG5cbiAgICBuZXh0KCk7XG59O1xuXG4vKipcbiAqIEJlZm9yZSBJbnRlcmNlcHRvci5cbiAqL1xuXG52YXIgYmVmb3JlID0gZnVuY3Rpb24gKHJlcXVlc3QsIG5leHQpIHtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHJlcXVlc3QuYmVmb3JlKSkge1xuICAgICAgICByZXF1ZXN0LmJlZm9yZS5jYWxsKHRoaXMsIHJlcXVlc3QpO1xuICAgIH1cblxuICAgIG5leHQoKTtcbn07XG5cbi8qKlxuICogSFRUUCBtZXRob2Qgb3ZlcnJpZGUgSW50ZXJjZXB0b3IuXG4gKi9cblxudmFyIG1ldGhvZCA9IGZ1bmN0aW9uIChyZXF1ZXN0LCBuZXh0KSB7XG5cbiAgICBpZiAocmVxdWVzdC5lbXVsYXRlSFRUUCAmJiAvXihQVVR8UEFUQ0h8REVMRVRFKSQvaS50ZXN0KHJlcXVlc3QubWV0aG9kKSkge1xuICAgICAgICByZXF1ZXN0LmhlYWRlcnMuc2V0KCdYLUhUVFAtTWV0aG9kLU92ZXJyaWRlJywgcmVxdWVzdC5tZXRob2QpO1xuICAgICAgICByZXF1ZXN0Lm1ldGhvZCA9ICdQT1NUJztcbiAgICB9XG5cbiAgICBuZXh0KCk7XG59O1xuXG4vKipcbiAqIEhlYWRlciBJbnRlcmNlcHRvci5cbiAqL1xuXG52YXIgaGVhZGVyID0gZnVuY3Rpb24gKHJlcXVlc3QsIG5leHQpIHtcblxuICAgIHZhciBoZWFkZXJzID0gYXNzaWduKHt9LCBIdHRwLmhlYWRlcnMuY29tbW9uLFxuICAgICAgICAhcmVxdWVzdC5jcm9zc09yaWdpbiA/IEh0dHAuaGVhZGVycy5jdXN0b20gOiB7fSxcbiAgICAgICAgSHR0cC5oZWFkZXJzW3RvTG93ZXIocmVxdWVzdC5tZXRob2QpXVxuICAgICk7XG5cbiAgICBlYWNoKGhlYWRlcnMsIGZ1bmN0aW9uICh2YWx1ZSwgbmFtZSkge1xuICAgICAgICBpZiAoIXJlcXVlc3QuaGVhZGVycy5oYXMobmFtZSkpIHtcbiAgICAgICAgICAgIHJlcXVlc3QuaGVhZGVycy5zZXQobmFtZSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBuZXh0KCk7XG59O1xuXG4vKipcbiAqIFhNTEh0dHAgY2xpZW50LlxuICovXG5cbnZhciBTVVBQT1JUU19CTE9CID0gdHlwZW9mIEJsb2IgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBGaWxlUmVhZGVyICE9PSAndW5kZWZpbmVkJztcblxudmFyIHhockNsaWVudCA9IGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlT2JqKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cbiAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLCBoYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IHJlcXVlc3QucmVzcG9uZFdpdGgoXG4gICAgICAgICAgICAgICAgJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0LCB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyA9PT0gMTIyMyA/IDIwNCA6IHhoci5zdGF0dXMsIC8vIElFOSBzdGF0dXMgYnVnXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXMgPT09IDEyMjMgPyAnTm8gQ29udGVudCcgOiB0cmltKHhoci5zdGF0dXNUZXh0KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGVhY2godHJpbSh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMuYXBwZW5kKHJvdy5zbGljZSgwLCByb3cuaW5kZXhPZignOicpKSwgcm93LnNsaWNlKHJvdy5pbmRleE9mKCc6JykgKyAxKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHhoci5hYm9ydCgpOyB9O1xuXG4gICAgICAgIGlmIChyZXF1ZXN0LnByb2dyZXNzKSB7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5tZXRob2QgPT09ICdHRVQnKSB7XG4gICAgICAgICAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgcmVxdWVzdC5wcm9ncmVzcyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKC9eKFBPU1R8UFVUKSQvaS50ZXN0KHJlcXVlc3QubWV0aG9kKSkge1xuICAgICAgICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCByZXF1ZXN0LnByb2dyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LmdldFVybCgpLCB0cnVlKTtcblxuICAgICAgICBpZiAocmVxdWVzdC50aW1lb3V0KSB7XG4gICAgICAgICAgICB4aHIudGltZW91dCA9IHJlcXVlc3QudGltZW91dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSB0cnVlKSB7XG4gICAgICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgU1VQUE9SVFNfQkxPQikge1xuICAgICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgbmFtZSkge1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB4aHIub25sb2FkID0gaGFuZGxlcjtcbiAgICAgICAgeGhyLm9uYWJvcnQgPSBoYW5kbGVyO1xuICAgICAgICB4aHIub25lcnJvciA9IGhhbmRsZXI7XG4gICAgICAgIHhoci5vbnRpbWVvdXQgPSBoYW5kbGVyO1xuICAgICAgICB4aHIuc2VuZChyZXF1ZXN0LmdldEJvZHkoKSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEJhc2UgY2xpZW50LlxuICovXG5cbnZhciBDbGllbnQgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuXG4gICAgdmFyIHJlcUhhbmRsZXJzID0gW3NlbmRSZXF1ZXN0XSwgcmVzSGFuZGxlcnMgPSBbXSwgaGFuZGxlcjtcblxuICAgIGlmICghaXNPYmplY3QoY29udGV4dCkpIHtcbiAgICAgICAgY29udGV4dCA9IG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gQ2xpZW50KHJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlT2JqKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGV4ZWMoKSB7XG5cbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gcmVxSGFuZGxlcnMucG9wKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVyLmNhbGwoY29udGV4dCwgcmVxdWVzdCwgbmV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd2FybigoXCJJbnZhbGlkIGludGVyY2VwdG9yIG9mIHR5cGUgXCIgKyAodHlwZW9mIGhhbmRsZXIpICsgXCIsIG11c3QgYmUgYSBmdW5jdGlvblwiKSk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG5leHQocmVzcG9uc2UpIHtcblxuICAgICAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKHJlc3BvbnNlKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc0hhbmRsZXJzLnVuc2hpZnQocmVzcG9uc2UpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc09iamVjdChyZXNwb25zZSkpIHtcblxuICAgICAgICAgICAgICAgICAgICByZXNIYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IHdoZW4ocmVzcG9uc2UsIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyLmNhbGwoY29udGV4dCwgcmVzcG9uc2UpIHx8IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHdoZW4ocmVzcG9uc2UsIHJlc29sdmUpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBleGVjKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGV4ZWMoKTtcblxuICAgICAgICB9LCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICBDbGllbnQudXNlID0gZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICAgICAgcmVxSGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIENsaWVudDtcbn07XG5cbmZ1bmN0aW9uIHNlbmRSZXF1ZXN0KHJlcXVlc3QsIHJlc29sdmUpIHtcblxuICAgIHZhciBjbGllbnQgPSByZXF1ZXN0LmNsaWVudCB8fCB4aHJDbGllbnQ7XG5cbiAgICByZXNvbHZlKGNsaWVudChyZXF1ZXN0KSk7XG59XG5cbi8qKlxuICogSFRUUCBIZWFkZXJzLlxuICovXG5cbnZhciBIZWFkZXJzID0gZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cblxuICAgIHRoaXMubWFwID0ge307XG5cbiAgICBlYWNoKGhlYWRlcnMsIGZ1bmN0aW9uICh2YWx1ZSwgbmFtZSkgeyByZXR1cm4gdGhpcyQxLmFwcGVuZChuYW1lLCB2YWx1ZSk7IH0pO1xufTtcblxuSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gaGFzIChuYW1lKSB7XG4gICAgcmV0dXJuIGdldE5hbWUodGhpcy5tYXAsIG5hbWUpICE9PSBudWxsO1xufTtcblxuSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0IChuYW1lKSB7XG5cbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW2dldE5hbWUodGhpcy5tYXAsIG5hbWUpXTtcblxuICAgIHJldHVybiBsaXN0ID8gbGlzdFswXSA6IG51bGw7XG59O1xuXG5IZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbiBnZXRBbGwgKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBbZ2V0TmFtZSh0aGlzLm1hcCwgbmFtZSldIHx8IFtdO1xufTtcblxuSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0IChuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUoZ2V0TmFtZSh0aGlzLm1hcCwgbmFtZSkgfHwgbmFtZSldID0gW3RyaW0odmFsdWUpXTtcbn07XG5cbkhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uIGFwcGVuZCAobmFtZSwgdmFsdWUpe1xuXG4gICAgdmFyIGxpc3QgPSB0aGlzLmdldEFsbChuYW1lKTtcblxuICAgIGlmIChsaXN0Lmxlbmd0aCkge1xuICAgICAgICBsaXN0LnB1c2godHJpbSh2YWx1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICB9XG59O1xuXG5IZWFkZXJzLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiBkZWxldGUkMSAobmFtZSl7XG4gICAgZGVsZXRlIHRoaXMubWFwW2dldE5hbWUodGhpcy5tYXAsIG5hbWUpXTtcbn07XG5cbkhlYWRlcnMucHJvdG90eXBlLmRlbGV0ZUFsbCA9IGZ1bmN0aW9uIGRlbGV0ZUFsbCAoKXtcbiAgICB0aGlzLm1hcCA9IHt9O1xufTtcblxuSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2ggKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgZWFjaCh0aGlzLm1hcCwgZnVuY3Rpb24gKGxpc3QsIG5hbWUpIHtcbiAgICAgICAgZWFjaChsaXN0LCBmdW5jdGlvbiAodmFsdWUpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIG5hbWUsIHRoaXMkMSk7IH0pO1xuICAgIH0pO1xufTtcblxuZnVuY3Rpb24gZ2V0TmFtZShtYXAsIG5hbWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMobWFwKS5yZWR1Y2UoZnVuY3Rpb24gKHByZXYsIGN1cnIpIHtcbiAgICAgICAgcmV0dXJuIHRvTG93ZXIobmFtZSkgPT09IHRvTG93ZXIoY3VycikgPyBjdXJyIDogcHJldjtcbiAgICB9LCBudWxsKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG5cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJpbShuYW1lKTtcbn1cblxuLyoqXG4gKiBIVFRQIFJlc3BvbnNlLlxuICovXG5cbnZhciBSZXNwb25zZSA9IGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHksIHJlZikge1xuICAgIHZhciB1cmwgPSByZWYudXJsO1xuICAgIHZhciBoZWFkZXJzID0gcmVmLmhlYWRlcnM7XG4gICAgdmFyIHN0YXR1cyA9IHJlZi5zdGF0dXM7XG4gICAgdmFyIHN0YXR1c1RleHQgPSByZWYuc3RhdHVzVGV4dDtcblxuXG4gICAgdGhpcy51cmwgPSB1cmw7XG4gICAgdGhpcy5vayA9IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwO1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzIHx8IDA7XG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gc3RhdHVzVGV4dCB8fCAnJztcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhoZWFkZXJzKTtcbiAgICB0aGlzLmJvZHkgPSBib2R5O1xuXG4gICAgaWYgKGlzU3RyaW5nKGJvZHkpKSB7XG5cbiAgICAgICAgdGhpcy5ib2R5VGV4dCA9IGJvZHk7XG5cbiAgICB9IGVsc2UgaWYgKGlzQmxvYihib2R5KSkge1xuXG4gICAgICAgIHRoaXMuYm9keUJsb2IgPSBib2R5O1xuXG4gICAgICAgIGlmIChpc0Jsb2JUZXh0KGJvZHkpKSB7XG4gICAgICAgICAgICB0aGlzLmJvZHlUZXh0ID0gYmxvYlRleHQoYm9keSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5SZXNwb25zZS5wcm90b3R5cGUuYmxvYiA9IGZ1bmN0aW9uIGJsb2IgKCkge1xuICAgIHJldHVybiB3aGVuKHRoaXMuYm9keUJsb2IpO1xufTtcblxuUmVzcG9uc2UucHJvdG90eXBlLnRleHQgPSBmdW5jdGlvbiB0ZXh0ICgpIHtcbiAgICByZXR1cm4gd2hlbih0aGlzLmJvZHlUZXh0KTtcbn07XG5cblJlc3BvbnNlLnByb3RvdHlwZS5qc29uID0gZnVuY3Rpb24ganNvbiAoKSB7XG4gICAgcmV0dXJuIHdoZW4odGhpcy50ZXh0KCksIGZ1bmN0aW9uICh0ZXh0KSB7IHJldHVybiBKU09OLnBhcnNlKHRleHQpOyB9KTtcbn07XG5cbmZ1bmN0aW9uIGJsb2JUZXh0KGJvZHkpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2VPYmooZnVuY3Rpb24gKHJlc29sdmUpIHtcblxuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgICByZWFkZXIucmVhZEFzVGV4dChib2R5KTtcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdCk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaXNCbG9iVGV4dChib2R5KSB7XG4gICAgcmV0dXJuIGJvZHkudHlwZS5pbmRleE9mKCd0ZXh0JykgPT09IDAgfHwgYm9keS50eXBlLmluZGV4T2YoJ2pzb24nKSAhPT0gLTE7XG59XG5cbi8qKlxuICogSFRUUCBSZXF1ZXN0LlxuICovXG5cbnZhciBSZXF1ZXN0ID0gZnVuY3Rpb24gUmVxdWVzdChvcHRpb25zJCQxKSB7XG5cbiAgICB0aGlzLmJvZHkgPSBudWxsO1xuICAgIHRoaXMucGFyYW1zID0ge307XG5cbiAgICBhc3NpZ24odGhpcywgb3B0aW9ucyQkMSwge1xuICAgICAgICBtZXRob2Q6IHRvVXBwZXIob3B0aW9ucyQkMS5tZXRob2QgfHwgJ0dFVCcpXG4gICAgfSk7XG5cbiAgICBpZiAoISh0aGlzLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSkge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpO1xuICAgIH1cbn07XG5cblJlcXVlc3QucHJvdG90eXBlLmdldFVybCA9IGZ1bmN0aW9uIGdldFVybCAoKXtcbiAgICByZXR1cm4gVXJsKHRoaXMpO1xufTtcblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0Qm9keSA9IGZ1bmN0aW9uIGdldEJvZHkgKCl7XG4gICAgcmV0dXJuIHRoaXMuYm9keTtcbn07XG5cblJlcXVlc3QucHJvdG90eXBlLnJlc3BvbmRXaXRoID0gZnVuY3Rpb24gcmVzcG9uZFdpdGggKGJvZHksIG9wdGlvbnMkJDEpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGJvZHksIGFzc2lnbihvcHRpb25zJCQxIHx8IHt9LCB7dXJsOiB0aGlzLmdldFVybCgpfSkpO1xufTtcblxuLyoqXG4gKiBTZXJ2aWNlIGZvciBzZW5kaW5nIG5ldHdvcmsgcmVxdWVzdHMuXG4gKi9cblxudmFyIENVU1RPTV9IRUFERVJTID0geydYLVJlcXVlc3RlZC1XaXRoJzogJ1hNTEh0dHBSZXF1ZXN0J307XG52YXIgQ09NTU9OX0hFQURFUlMgPSB7J0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonfTtcbnZhciBKU09OX0NPTlRFTlRfVFlQRSA9IHsnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOCd9O1xuXG5mdW5jdGlvbiBIdHRwKG9wdGlvbnMkJDEpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcyB8fCB7fSwgY2xpZW50ID0gQ2xpZW50KHNlbGYuJHZtKTtcblxuICAgIGRlZmF1bHRzKG9wdGlvbnMkJDEgfHwge30sIHNlbGYuJG9wdGlvbnMsIEh0dHAub3B0aW9ucyk7XG5cbiAgICBIdHRwLmludGVyY2VwdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gICAgICAgIGNsaWVudC51c2UoaGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2xpZW50KG5ldyBSZXF1ZXN0KG9wdGlvbnMkJDEpKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgIHJldHVybiByZXNwb25zZS5vayA/IHJlc3BvbnNlIDogUHJvbWlzZU9iai5yZWplY3QocmVzcG9uc2UpO1xuXG4gICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIGVycm9yKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlT2JqLnJlamVjdChyZXNwb25zZSk7XG4gICAgfSk7XG59XG5cbkh0dHAub3B0aW9ucyA9IHt9O1xuXG5IdHRwLmhlYWRlcnMgPSB7XG4gICAgcHV0OiBKU09OX0NPTlRFTlRfVFlQRSxcbiAgICBwb3N0OiBKU09OX0NPTlRFTlRfVFlQRSxcbiAgICBwYXRjaDogSlNPTl9DT05URU5UX1RZUEUsXG4gICAgZGVsZXRlOiBKU09OX0NPTlRFTlRfVFlQRSxcbiAgICBjdXN0b206IENVU1RPTV9IRUFERVJTLFxuICAgIGNvbW1vbjogQ09NTU9OX0hFQURFUlNcbn07XG5cbkh0dHAuaW50ZXJjZXB0b3JzID0gW2JlZm9yZSwgbWV0aG9kLCBib2R5LCBqc29ucCwgaGVhZGVyLCBjb3JzXTtcblxuWydnZXQnLCAnZGVsZXRlJywgJ2hlYWQnLCAnanNvbnAnXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QkJDEpIHtcblxuICAgIEh0dHBbbWV0aG9kJCQxXSA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMkJDEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMoYXNzaWduKG9wdGlvbnMkJDEgfHwge30sIHt1cmw6IHVybCwgbWV0aG9kOiBtZXRob2QkJDF9KSk7XG4gICAgfTtcblxufSk7XG5cblsncG9zdCcsICdwdXQnLCAncGF0Y2gnXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QkJDEpIHtcblxuICAgIEh0dHBbbWV0aG9kJCQxXSA9IGZ1bmN0aW9uICh1cmwsIGJvZHkkJDEsIG9wdGlvbnMkJDEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMoYXNzaWduKG9wdGlvbnMkJDEgfHwge30sIHt1cmw6IHVybCwgbWV0aG9kOiBtZXRob2QkJDEsIGJvZHk6IGJvZHkkJDF9KSk7XG4gICAgfTtcblxufSk7XG5cbi8qKlxuICogU2VydmljZSBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBSRVNUZnVsIHNlcnZpY2VzLlxuICovXG5cbmZ1bmN0aW9uIFJlc291cmNlKHVybCwgcGFyYW1zLCBhY3Rpb25zLCBvcHRpb25zJCQxKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXMgfHwge30sIHJlc291cmNlID0ge307XG5cbiAgICBhY3Rpb25zID0gYXNzaWduKHt9LFxuICAgICAgICBSZXNvdXJjZS5hY3Rpb25zLFxuICAgICAgICBhY3Rpb25zXG4gICAgKTtcblxuICAgIGVhY2goYWN0aW9ucywgZnVuY3Rpb24gKGFjdGlvbiwgbmFtZSkge1xuXG4gICAgICAgIGFjdGlvbiA9IG1lcmdlKHt1cmw6IHVybCwgcGFyYW1zOiBhc3NpZ24oe30sIHBhcmFtcyl9LCBvcHRpb25zJCQxLCBhY3Rpb24pO1xuXG4gICAgICAgIHJlc291cmNlW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChzZWxmLiRodHRwIHx8IEh0dHApKG9wdHMoYWN0aW9uLCBhcmd1bWVudHMpKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXNvdXJjZTtcbn1cblxuZnVuY3Rpb24gb3B0cyhhY3Rpb24sIGFyZ3MpIHtcblxuICAgIHZhciBvcHRpb25zJCQxID0gYXNzaWduKHt9LCBhY3Rpb24pLCBwYXJhbXMgPSB7fSwgYm9keTtcblxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcblxuICAgICAgICBjYXNlIDI6XG5cbiAgICAgICAgICAgIHBhcmFtcyA9IGFyZ3NbMF07XG4gICAgICAgICAgICBib2R5ID0gYXJnc1sxXTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAxOlxuXG4gICAgICAgICAgICBpZiAoL14oUE9TVHxQVVR8UEFUQ0gpJC9pLnRlc3Qob3B0aW9ucyQkMS5tZXRob2QpKSB7XG4gICAgICAgICAgICAgICAgYm9keSA9IGFyZ3NbMF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcmFtcyA9IGFyZ3NbMF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgMDpcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcblxuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIHVwIHRvIDIgYXJndW1lbnRzIFtwYXJhbXMsIGJvZHldLCBnb3QgJyArIGFyZ3MubGVuZ3RoICsgJyBhcmd1bWVudHMnO1xuICAgIH1cblxuICAgIG9wdGlvbnMkJDEuYm9keSA9IGJvZHk7XG4gICAgb3B0aW9ucyQkMS5wYXJhbXMgPSBhc3NpZ24oe30sIG9wdGlvbnMkJDEucGFyYW1zLCBwYXJhbXMpO1xuXG4gICAgcmV0dXJuIG9wdGlvbnMkJDE7XG59XG5cblJlc291cmNlLmFjdGlvbnMgPSB7XG5cbiAgICBnZXQ6IHttZXRob2Q6ICdHRVQnfSxcbiAgICBzYXZlOiB7bWV0aG9kOiAnUE9TVCd9LFxuICAgIHF1ZXJ5OiB7bWV0aG9kOiAnR0VUJ30sXG4gICAgdXBkYXRlOiB7bWV0aG9kOiAnUFVUJ30sXG4gICAgcmVtb3ZlOiB7bWV0aG9kOiAnREVMRVRFJ30sXG4gICAgZGVsZXRlOiB7bWV0aG9kOiAnREVMRVRFJ31cblxufTtcblxuLyoqXG4gKiBJbnN0YWxsIHBsdWdpbi5cbiAqL1xuXG5mdW5jdGlvbiBwbHVnaW4oVnVlKSB7XG5cbiAgICBpZiAocGx1Z2luLmluc3RhbGxlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgVXRpbChWdWUpO1xuXG4gICAgVnVlLnVybCA9IFVybDtcbiAgICBWdWUuaHR0cCA9IEh0dHA7XG4gICAgVnVlLnJlc291cmNlID0gUmVzb3VyY2U7XG4gICAgVnVlLlByb21pc2UgPSBQcm9taXNlT2JqO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoVnVlLnByb3RvdHlwZSwge1xuXG4gICAgICAgICR1cmw6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zKFZ1ZS51cmwsIHRoaXMsIHRoaXMuJG9wdGlvbnMudXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAkaHR0cDoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMoVnVlLmh0dHAsIHRoaXMsIHRoaXMuJG9wdGlvbnMuaHR0cCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgJHJlc291cmNlOiB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVnVlLnJlc291cmNlLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgJHByb21pc2U6IHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChleGVjdXRvcikgeyByZXR1cm4gbmV3IFZ1ZS5Qcm9taXNlKGV4ZWN1dG9yLCB0aGlzJDEpOyB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9KTtcbn1cblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WdWUpIHtcbiAgICB3aW5kb3cuVnVlLnVzZShwbHVnaW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBsdWdpbjtcbiIsIi8qKlxuICAqIHZ1ZS1yb3V0ZXIgdjIuMi4wXG4gICogKGMpIDIwMTcgRXZhbiBZb3VcbiAgKiBAbGljZW5zZSBNSVRcbiAgKi9cbid1c2Ugc3RyaWN0JztcblxuLyogICovXG5cbmZ1bmN0aW9uIGFzc2VydCAoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gIGlmICghY29uZGl0aW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKChcIlt2dWUtcm91dGVyXSBcIiArIG1lc3NhZ2UpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHdhcm4gKGNvbmRpdGlvbiwgbWVzc2FnZSkge1xuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlLndhcm4oKFwiW3Z1ZS1yb3V0ZXJdIFwiICsgbWVzc2FnZSkpO1xuICB9XG59XG5cbnZhciBWaWV3ID0ge1xuICBuYW1lOiAncm91dGVyLXZpZXcnLFxuICBmdW5jdGlvbmFsOiB0cnVlLFxuICBwcm9wczoge1xuICAgIG5hbWU6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdkZWZhdWx0J1xuICAgIH1cbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIgKGgsIHJlZikge1xuICAgIHZhciBwcm9wcyA9IHJlZi5wcm9wcztcbiAgICB2YXIgY2hpbGRyZW4gPSByZWYuY2hpbGRyZW47XG4gICAgdmFyIHBhcmVudCA9IHJlZi5wYXJlbnQ7XG4gICAgdmFyIGRhdGEgPSByZWYuZGF0YTtcblxuICAgIGRhdGEucm91dGVyVmlldyA9IHRydWU7XG5cbiAgICB2YXIgbmFtZSA9IHByb3BzLm5hbWU7XG4gICAgdmFyIHJvdXRlID0gcGFyZW50LiRyb3V0ZTtcbiAgICB2YXIgY2FjaGUgPSBwYXJlbnQuX3JvdXRlclZpZXdDYWNoZSB8fCAocGFyZW50Ll9yb3V0ZXJWaWV3Q2FjaGUgPSB7fSk7XG5cbiAgICAvLyBkZXRlcm1pbmUgY3VycmVudCB2aWV3IGRlcHRoLCBhbHNvIGNoZWNrIHRvIHNlZSBpZiB0aGUgdHJlZVxuICAgIC8vIGhhcyBiZWVuIHRvZ2dsZWQgaW5hY3RpdmUgYnV0IGtlcHQtYWxpdmUuXG4gICAgdmFyIGRlcHRoID0gMDtcbiAgICB2YXIgaW5hY3RpdmUgPSBmYWxzZTtcbiAgICB3aGlsZSAocGFyZW50KSB7XG4gICAgICBpZiAocGFyZW50LiR2bm9kZSAmJiBwYXJlbnQuJHZub2RlLmRhdGEucm91dGVyVmlldykge1xuICAgICAgICBkZXB0aCsrO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmVudC5faW5hY3RpdmUpIHtcbiAgICAgICAgaW5hY3RpdmUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcGFyZW50ID0gcGFyZW50LiRwYXJlbnQ7XG4gICAgfVxuICAgIGRhdGEucm91dGVyVmlld0RlcHRoID0gZGVwdGg7XG5cbiAgICAvLyByZW5kZXIgcHJldmlvdXMgdmlldyBpZiB0aGUgdHJlZSBpcyBpbmFjdGl2ZSBhbmQga2VwdC1hbGl2ZVxuICAgIGlmIChpbmFjdGl2ZSkge1xuICAgICAgcmV0dXJuIGgoY2FjaGVbbmFtZV0sIGRhdGEsIGNoaWxkcmVuKVxuICAgIH1cblxuICAgIHZhciBtYXRjaGVkID0gcm91dGUubWF0Y2hlZFtkZXB0aF07XG4gICAgLy8gcmVuZGVyIGVtcHR5IG5vZGUgaWYgbm8gbWF0Y2hlZCByb3V0ZVxuICAgIGlmICghbWF0Y2hlZCkge1xuICAgICAgY2FjaGVbbmFtZV0gPSBudWxsO1xuICAgICAgcmV0dXJuIGgoKVxuICAgIH1cblxuICAgIHZhciBjb21wb25lbnQgPSBjYWNoZVtuYW1lXSA9IG1hdGNoZWQuY29tcG9uZW50c1tuYW1lXTtcblxuICAgIC8vIGluamVjdCBpbnN0YW5jZSByZWdpc3RyYXRpb24gaG9va3NcbiAgICB2YXIgaG9va3MgPSBkYXRhLmhvb2sgfHwgKGRhdGEuaG9vayA9IHt9KTtcbiAgICBob29rcy5pbml0ID0gZnVuY3Rpb24gKHZub2RlKSB7XG4gICAgICBtYXRjaGVkLmluc3RhbmNlc1tuYW1lXSA9IHZub2RlLmNoaWxkO1xuICAgIH07XG4gICAgaG9va3MucHJlcGF0Y2ggPSBmdW5jdGlvbiAob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgICBtYXRjaGVkLmluc3RhbmNlc1tuYW1lXSA9IHZub2RlLmNoaWxkO1xuICAgIH07XG4gICAgaG9va3MuZGVzdHJveSA9IGZ1bmN0aW9uICh2bm9kZSkge1xuICAgICAgaWYgKG1hdGNoZWQuaW5zdGFuY2VzW25hbWVdID09PSB2bm9kZS5jaGlsZCkge1xuICAgICAgICBtYXRjaGVkLmluc3RhbmNlc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gcmVzb2x2ZSBwcm9wc1xuICAgIGRhdGEucHJvcHMgPSByZXNvbHZlUHJvcHMocm91dGUsIG1hdGNoZWQucHJvcHMgJiYgbWF0Y2hlZC5wcm9wc1tuYW1lXSk7XG5cbiAgICByZXR1cm4gaChjb21wb25lbnQsIGRhdGEsIGNoaWxkcmVuKVxuICB9XG59O1xuXG5mdW5jdGlvbiByZXNvbHZlUHJvcHMgKHJvdXRlLCBjb25maWcpIHtcbiAgc3dpdGNoICh0eXBlb2YgY29uZmlnKSB7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgIHJldHVyblxuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICByZXR1cm4gY29uZmlnXG4gICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgcmV0dXJuIGNvbmZpZyhyb3V0ZSlcbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIHJldHVybiBjb25maWcgPyByb3V0ZS5wYXJhbXMgOiB1bmRlZmluZWRcbiAgICBkZWZhdWx0OlxuICAgICAgd2FybihmYWxzZSwgKFwicHJvcHMgaW4gXFxcIlwiICsgKHJvdXRlLnBhdGgpICsgXCJcXFwiIGlzIGEgXCIgKyAodHlwZW9mIGNvbmZpZykgKyBcIiwgZXhwZWN0aW5nIGFuIG9iamVjdCwgZnVuY3Rpb24gb3IgYm9vbGVhbi5cIikpO1xuICB9XG59XG5cbi8qICAqL1xuXG52YXIgZW5jb2RlUmVzZXJ2ZVJFID0gL1shJygpKl0vZztcbnZhciBlbmNvZGVSZXNlcnZlUmVwbGFjZXIgPSBmdW5jdGlvbiAoYykgeyByZXR1cm4gJyUnICsgYy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KTsgfTtcbnZhciBjb21tYVJFID0gLyUyQy9nO1xuXG4vLyBmaXhlZCBlbmNvZGVVUklDb21wb25lbnQgd2hpY2ggaXMgbW9yZSBjb21mb3JtYW50IHRvIFJGQzM5ODY6XG4vLyAtIGVzY2FwZXMgWyEnKCkqXVxuLy8gLSBwcmVzZXJ2ZSBjb21tYXNcbnZhciBlbmNvZGUgPSBmdW5jdGlvbiAoc3RyKSB7IHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyKVxuICAucmVwbGFjZShlbmNvZGVSZXNlcnZlUkUsIGVuY29kZVJlc2VydmVSZXBsYWNlcilcbiAgLnJlcGxhY2UoY29tbWFSRSwgJywnKTsgfTtcblxudmFyIGRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcblxuZnVuY3Rpb24gcmVzb2x2ZVF1ZXJ5IChcbiAgcXVlcnksXG4gIGV4dHJhUXVlcnlcbikge1xuICBpZiAoIGV4dHJhUXVlcnkgPT09IHZvaWQgMCApIGV4dHJhUXVlcnkgPSB7fTtcblxuICBpZiAocXVlcnkpIHtcbiAgICB2YXIgcGFyc2VkUXVlcnk7XG4gICAgdHJ5IHtcbiAgICAgIHBhcnNlZFF1ZXJ5ID0gcGFyc2VRdWVyeShxdWVyeSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKGZhbHNlLCBlLm1lc3NhZ2UpO1xuICAgICAgcGFyc2VkUXVlcnkgPSB7fTtcbiAgICB9XG4gICAgZm9yICh2YXIga2V5IGluIGV4dHJhUXVlcnkpIHtcbiAgICAgIHBhcnNlZFF1ZXJ5W2tleV0gPSBleHRyYVF1ZXJ5W2tleV07XG4gICAgfVxuICAgIHJldHVybiBwYXJzZWRRdWVyeVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBleHRyYVF1ZXJ5XG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VRdWVyeSAocXVlcnkpIHtcbiAgdmFyIHJlcyA9IHt9O1xuXG4gIHF1ZXJ5ID0gcXVlcnkudHJpbSgpLnJlcGxhY2UoL14oXFw/fCN8JikvLCAnJyk7XG5cbiAgaWYgKCFxdWVyeSkge1xuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIHF1ZXJ5LnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbiAocGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBkZWNvZGUocGFydHMuc2hpZnQoKSk7XG4gICAgdmFyIHZhbCA9IHBhcnRzLmxlbmd0aCA+IDBcbiAgICAgID8gZGVjb2RlKHBhcnRzLmpvaW4oJz0nKSlcbiAgICAgIDogbnVsbDtcblxuICAgIGlmIChyZXNba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXNba2V5XSA9IHZhbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVzW2tleV0pKSB7XG4gICAgICByZXNba2V5XS5wdXNoKHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc1trZXldID0gW3Jlc1trZXldLCB2YWxdO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlRdWVyeSAob2JqKSB7XG4gIHZhciByZXMgPSBvYmogPyBPYmplY3Qua2V5cyhvYmopLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHZhbCA9IG9ialtrZXldO1xuXG4gICAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJydcbiAgICB9XG5cbiAgICBpZiAodmFsID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZW5jb2RlKGtleSlcbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICB2YWwuc2xpY2UoKS5mb3JFYWNoKGZ1bmN0aW9uICh2YWwyKSB7XG4gICAgICAgIGlmICh2YWwyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsMiA9PT0gbnVsbCkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGVuY29kZShrZXkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQucHVzaChlbmNvZGUoa2V5KSArICc9JyArIGVuY29kZSh2YWwyKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCcmJylcbiAgICB9XG5cbiAgICByZXR1cm4gZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodmFsKVxuICB9KS5maWx0ZXIoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHgubGVuZ3RoID4gMDsgfSkuam9pbignJicpIDogbnVsbDtcbiAgcmV0dXJuIHJlcyA/IChcIj9cIiArIHJlcykgOiAnJ1xufVxuXG4vKiAgKi9cblxudmFyIHRyYWlsaW5nU2xhc2hSRSA9IC9cXC8/JC87XG5cbmZ1bmN0aW9uIGNyZWF0ZVJvdXRlIChcbiAgcmVjb3JkLFxuICBsb2NhdGlvbixcbiAgcmVkaXJlY3RlZEZyb21cbikge1xuICB2YXIgcm91dGUgPSB7XG4gICAgbmFtZTogbG9jYXRpb24ubmFtZSB8fCAocmVjb3JkICYmIHJlY29yZC5uYW1lKSxcbiAgICBtZXRhOiAocmVjb3JkICYmIHJlY29yZC5tZXRhKSB8fCB7fSxcbiAgICBwYXRoOiBsb2NhdGlvbi5wYXRoIHx8ICcvJyxcbiAgICBoYXNoOiBsb2NhdGlvbi5oYXNoIHx8ICcnLFxuICAgIHF1ZXJ5OiBsb2NhdGlvbi5xdWVyeSB8fCB7fSxcbiAgICBwYXJhbXM6IGxvY2F0aW9uLnBhcmFtcyB8fCB7fSxcbiAgICBmdWxsUGF0aDogZ2V0RnVsbFBhdGgobG9jYXRpb24pLFxuICAgIG1hdGNoZWQ6IHJlY29yZCA/IGZvcm1hdE1hdGNoKHJlY29yZCkgOiBbXVxuICB9O1xuICBpZiAocmVkaXJlY3RlZEZyb20pIHtcbiAgICByb3V0ZS5yZWRpcmVjdGVkRnJvbSA9IGdldEZ1bGxQYXRoKHJlZGlyZWN0ZWRGcm9tKTtcbiAgfVxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShyb3V0ZSlcbn1cblxuLy8gdGhlIHN0YXJ0aW5nIHJvdXRlIHRoYXQgcmVwcmVzZW50cyB0aGUgaW5pdGlhbCBzdGF0ZVxudmFyIFNUQVJUID0gY3JlYXRlUm91dGUobnVsbCwge1xuICBwYXRoOiAnLydcbn0pO1xuXG5mdW5jdGlvbiBmb3JtYXRNYXRjaCAocmVjb3JkKSB7XG4gIHZhciByZXMgPSBbXTtcbiAgd2hpbGUgKHJlY29yZCkge1xuICAgIHJlcy51bnNoaWZ0KHJlY29yZCk7XG4gICAgcmVjb3JkID0gcmVjb3JkLnBhcmVudDtcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGdldEZ1bGxQYXRoIChyZWYpIHtcbiAgdmFyIHBhdGggPSByZWYucGF0aDtcbiAgdmFyIHF1ZXJ5ID0gcmVmLnF1ZXJ5OyBpZiAoIHF1ZXJ5ID09PSB2b2lkIDAgKSBxdWVyeSA9IHt9O1xuICB2YXIgaGFzaCA9IHJlZi5oYXNoOyBpZiAoIGhhc2ggPT09IHZvaWQgMCApIGhhc2ggPSAnJztcblxuICByZXR1cm4gKHBhdGggfHwgJy8nKSArIHN0cmluZ2lmeVF1ZXJ5KHF1ZXJ5KSArIGhhc2hcbn1cblxuZnVuY3Rpb24gaXNTYW1lUm91dGUgKGEsIGIpIHtcbiAgaWYgKGIgPT09IFNUQVJUKSB7XG4gICAgcmV0dXJuIGEgPT09IGJcbiAgfSBlbHNlIGlmICghYikge1xuICAgIHJldHVybiBmYWxzZVxuICB9IGVsc2UgaWYgKGEucGF0aCAmJiBiLnBhdGgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgYS5wYXRoLnJlcGxhY2UodHJhaWxpbmdTbGFzaFJFLCAnJykgPT09IGIucGF0aC5yZXBsYWNlKHRyYWlsaW5nU2xhc2hSRSwgJycpICYmXG4gICAgICBhLmhhc2ggPT09IGIuaGFzaCAmJlxuICAgICAgaXNPYmplY3RFcXVhbChhLnF1ZXJ5LCBiLnF1ZXJ5KVxuICAgIClcbiAgfSBlbHNlIGlmIChhLm5hbWUgJiYgYi5uYW1lKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGEubmFtZSA9PT0gYi5uYW1lICYmXG4gICAgICBhLmhhc2ggPT09IGIuaGFzaCAmJlxuICAgICAgaXNPYmplY3RFcXVhbChhLnF1ZXJ5LCBiLnF1ZXJ5KSAmJlxuICAgICAgaXNPYmplY3RFcXVhbChhLnBhcmFtcywgYi5wYXJhbXMpXG4gICAgKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0RXF1YWwgKGEsIGIpIHtcbiAgaWYgKCBhID09PSB2b2lkIDAgKSBhID0ge307XG4gIGlmICggYiA9PT0gdm9pZCAwICkgYiA9IHt9O1xuXG4gIHZhciBhS2V5cyA9IE9iamVjdC5rZXlzKGEpO1xuICB2YXIgYktleXMgPSBPYmplY3Qua2V5cyhiKTtcbiAgaWYgKGFLZXlzLmxlbmd0aCAhPT0gYktleXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIGFLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIFN0cmluZyhhW2tleV0pID09PSBTdHJpbmcoYltrZXldKTsgfSlcbn1cblxuZnVuY3Rpb24gaXNJbmNsdWRlZFJvdXRlIChjdXJyZW50LCB0YXJnZXQpIHtcbiAgcmV0dXJuIChcbiAgICBjdXJyZW50LnBhdGgucmVwbGFjZSh0cmFpbGluZ1NsYXNoUkUsICcvJykuaW5kZXhPZihcbiAgICAgIHRhcmdldC5wYXRoLnJlcGxhY2UodHJhaWxpbmdTbGFzaFJFLCAnLycpXG4gICAgKSA9PT0gMCAmJlxuICAgICghdGFyZ2V0Lmhhc2ggfHwgY3VycmVudC5oYXNoID09PSB0YXJnZXQuaGFzaCkgJiZcbiAgICBxdWVyeUluY2x1ZGVzKGN1cnJlbnQucXVlcnksIHRhcmdldC5xdWVyeSlcbiAgKVxufVxuXG5mdW5jdGlvbiBxdWVyeUluY2x1ZGVzIChjdXJyZW50LCB0YXJnZXQpIHtcbiAgZm9yICh2YXIga2V5IGluIHRhcmdldCkge1xuICAgIGlmICghKGtleSBpbiBjdXJyZW50KSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbi8qICAqL1xuXG4vLyB3b3JrIGFyb3VuZCB3ZWlyZCBmbG93IGJ1Z1xudmFyIHRvVHlwZXMgPSBbU3RyaW5nLCBPYmplY3RdO1xudmFyIGV2ZW50VHlwZXMgPSBbU3RyaW5nLCBBcnJheV07XG5cbnZhciBMaW5rID0ge1xuICBuYW1lOiAncm91dGVyLWxpbmsnLFxuICBwcm9wczoge1xuICAgIHRvOiB7XG4gICAgICB0eXBlOiB0b1R5cGVzLFxuICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICB9LFxuICAgIHRhZzoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2EnXG4gICAgfSxcbiAgICBleGFjdDogQm9vbGVhbixcbiAgICBhcHBlbmQ6IEJvb2xlYW4sXG4gICAgcmVwbGFjZTogQm9vbGVhbixcbiAgICBhY3RpdmVDbGFzczogU3RyaW5nLFxuICAgIGV2ZW50OiB7XG4gICAgICB0eXBlOiBldmVudFR5cGVzLFxuICAgICAgZGVmYXVsdDogJ2NsaWNrJ1xuICAgIH1cbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIgKGgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIHZhciByb3V0ZXIgPSB0aGlzLiRyb3V0ZXI7XG4gICAgdmFyIGN1cnJlbnQgPSB0aGlzLiRyb3V0ZTtcbiAgICB2YXIgcmVmID0gcm91dGVyLnJlc29sdmUodGhpcy50bywgY3VycmVudCwgdGhpcy5hcHBlbmQpO1xuICAgIHZhciBsb2NhdGlvbiA9IHJlZi5sb2NhdGlvbjtcbiAgICB2YXIgcm91dGUgPSByZWYucm91dGU7XG4gICAgdmFyIGhyZWYgPSByZWYuaHJlZjtcbiAgICB2YXIgY2xhc3NlcyA9IHt9O1xuICAgIHZhciBhY3RpdmVDbGFzcyA9IHRoaXMuYWN0aXZlQ2xhc3MgfHwgcm91dGVyLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzIHx8ICdyb3V0ZXItbGluay1hY3RpdmUnO1xuICAgIHZhciBjb21wYXJlVGFyZ2V0ID0gbG9jYXRpb24ucGF0aCA/IGNyZWF0ZVJvdXRlKG51bGwsIGxvY2F0aW9uKSA6IHJvdXRlO1xuICAgIGNsYXNzZXNbYWN0aXZlQ2xhc3NdID0gdGhpcy5leGFjdFxuICAgICAgPyBpc1NhbWVSb3V0ZShjdXJyZW50LCBjb21wYXJlVGFyZ2V0KVxuICAgICAgOiBpc0luY2x1ZGVkUm91dGUoY3VycmVudCwgY29tcGFyZVRhcmdldCk7XG5cbiAgICB2YXIgaGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBpZiAoZ3VhcmRFdmVudChlKSkge1xuICAgICAgICBpZiAodGhpcyQxLnJlcGxhY2UpIHtcbiAgICAgICAgICByb3V0ZXIucmVwbGFjZShsb2NhdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcm91dGVyLnB1c2gobG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBvbiA9IHsgY2xpY2s6IGd1YXJkRXZlbnQgfTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLmV2ZW50KSkge1xuICAgICAgdGhpcy5ldmVudC5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IG9uW2VdID0gaGFuZGxlcjsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uW3RoaXMuZXZlbnRdID0gaGFuZGxlcjtcbiAgICB9XG5cbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIGNsYXNzOiBjbGFzc2VzXG4gICAgfTtcblxuICAgIGlmICh0aGlzLnRhZyA9PT0gJ2EnKSB7XG4gICAgICBkYXRhLm9uID0gb247XG4gICAgICBkYXRhLmF0dHJzID0geyBocmVmOiBocmVmIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IDxhPiBjaGlsZCBhbmQgYXBwbHkgbGlzdGVuZXIgYW5kIGhyZWZcbiAgICAgIHZhciBhID0gZmluZEFuY2hvcih0aGlzLiRzbG90cy5kZWZhdWx0KTtcbiAgICAgIGlmIChhKSB7XG4gICAgICAgIC8vIGluIGNhc2UgdGhlIDxhPiBpcyBhIHN0YXRpYyBub2RlXG4gICAgICAgIGEuaXNTdGF0aWMgPSBmYWxzZTtcbiAgICAgICAgdmFyIGV4dGVuZCA9IF9WdWUudXRpbC5leHRlbmQ7XG4gICAgICAgIHZhciBhRGF0YSA9IGEuZGF0YSA9IGV4dGVuZCh7fSwgYS5kYXRhKTtcbiAgICAgICAgYURhdGEub24gPSBvbjtcbiAgICAgICAgdmFyIGFBdHRycyA9IGEuZGF0YS5hdHRycyA9IGV4dGVuZCh7fSwgYS5kYXRhLmF0dHJzKTtcbiAgICAgICAgYUF0dHJzLmhyZWYgPSBocmVmO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG9lc24ndCBoYXZlIDxhPiBjaGlsZCwgYXBwbHkgbGlzdGVuZXIgdG8gc2VsZlxuICAgICAgICBkYXRhLm9uID0gb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGgodGhpcy50YWcsIGRhdGEsIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gIH1cbn07XG5cbmZ1bmN0aW9uIGd1YXJkRXZlbnQgKGUpIHtcbiAgLy8gZG9uJ3QgcmVkaXJlY3Qgd2l0aCBjb250cm9sIGtleXNcbiAgaWYgKGUubWV0YUtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgeyByZXR1cm4gfVxuICAvLyBkb24ndCByZWRpcmVjdCB3aGVuIHByZXZlbnREZWZhdWx0IGNhbGxlZFxuICBpZiAoZS5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybiB9XG4gIC8vIGRvbid0IHJlZGlyZWN0IG9uIHJpZ2h0IGNsaWNrXG4gIGlmIChlLmJ1dHRvbiAhPT0gdW5kZWZpbmVkICYmIGUuYnV0dG9uICE9PSAwKSB7IHJldHVybiB9XG4gIC8vIGRvbid0IHJlZGlyZWN0IGlmIGB0YXJnZXQ9XCJfYmxhbmtcImBcbiAgaWYgKGUudGFyZ2V0ICYmIGUudGFyZ2V0LmdldEF0dHJpYnV0ZSkge1xuICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpO1xuICAgIGlmICgvXFxiX2JsYW5rXFxiL2kudGVzdCh0YXJnZXQpKSB7IHJldHVybiB9XG4gIH1cbiAgLy8gdGhpcyBtYXkgYmUgYSBXZWV4IGV2ZW50IHdoaWNoIGRvZXNuJ3QgaGF2ZSB0aGlzIG1ldGhvZFxuICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBmaW5kQW5jaG9yIChjaGlsZHJlbikge1xuICBpZiAoY2hpbGRyZW4pIHtcbiAgICB2YXIgY2hpbGQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIGlmIChjaGlsZC50YWcgPT09ICdhJykge1xuICAgICAgICByZXR1cm4gY2hpbGRcbiAgICAgIH1cbiAgICAgIGlmIChjaGlsZC5jaGlsZHJlbiAmJiAoY2hpbGQgPSBmaW5kQW5jaG9yKGNoaWxkLmNoaWxkcmVuKSkpIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnZhciBfVnVlO1xuXG5mdW5jdGlvbiBpbnN0YWxsIChWdWUpIHtcbiAgaWYgKGluc3RhbGwuaW5zdGFsbGVkKSB7IHJldHVybiB9XG4gIGluc3RhbGwuaW5zdGFsbGVkID0gdHJ1ZTtcblxuICBfVnVlID0gVnVlO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShWdWUucHJvdG90eXBlLCAnJHJvdXRlcicsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCAoKSB7IHJldHVybiB0aGlzLiRyb290Ll9yb3V0ZXIgfVxuICB9KTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVnVlLnByb3RvdHlwZSwgJyRyb3V0ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCAoKSB7IHJldHVybiB0aGlzLiRyb290Ll9yb3V0ZSB9XG4gIH0pO1xuXG4gIFZ1ZS5taXhpbih7XG4gICAgYmVmb3JlQ3JlYXRlOiBmdW5jdGlvbiBiZWZvcmVDcmVhdGUgKCkge1xuICAgICAgaWYgKHRoaXMuJG9wdGlvbnMucm91dGVyKSB7XG4gICAgICAgIHRoaXMuX3JvdXRlciA9IHRoaXMuJG9wdGlvbnMucm91dGVyO1xuICAgICAgICB0aGlzLl9yb3V0ZXIuaW5pdCh0aGlzKTtcbiAgICAgICAgVnVlLnV0aWwuZGVmaW5lUmVhY3RpdmUodGhpcywgJ19yb3V0ZScsIHRoaXMuX3JvdXRlci5oaXN0b3J5LmN1cnJlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgVnVlLmNvbXBvbmVudCgncm91dGVyLXZpZXcnLCBWaWV3KTtcbiAgVnVlLmNvbXBvbmVudCgncm91dGVyLWxpbmsnLCBMaW5rKTtcblxuICB2YXIgc3RyYXRzID0gVnVlLmNvbmZpZy5vcHRpb25NZXJnZVN0cmF0ZWdpZXM7XG4gIC8vIHVzZSB0aGUgc2FtZSBob29rIG1lcmdpbmcgc3RyYXRlZ3kgZm9yIHJvdXRlIGhvb2tzXG4gIHN0cmF0cy5iZWZvcmVSb3V0ZUVudGVyID0gc3RyYXRzLmJlZm9yZVJvdXRlTGVhdmUgPSBzdHJhdHMuY3JlYXRlZDtcbn1cblxuLyogICovXG5cbnZhciBpbkJyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcblxuLyogICovXG5cbmZ1bmN0aW9uIHJlc29sdmVQYXRoIChcbiAgcmVsYXRpdmUsXG4gIGJhc2UsXG4gIGFwcGVuZFxuKSB7XG4gIGlmIChyZWxhdGl2ZS5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIHJldHVybiByZWxhdGl2ZVxuICB9XG5cbiAgaWYgKHJlbGF0aXZlLmNoYXJBdCgwKSA9PT0gJz8nIHx8IHJlbGF0aXZlLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgcmV0dXJuIGJhc2UgKyByZWxhdGl2ZVxuICB9XG5cbiAgdmFyIHN0YWNrID0gYmFzZS5zcGxpdCgnLycpO1xuXG4gIC8vIHJlbW92ZSB0cmFpbGluZyBzZWdtZW50IGlmOlxuICAvLyAtIG5vdCBhcHBlbmRpbmdcbiAgLy8gLSBhcHBlbmRpbmcgdG8gdHJhaWxpbmcgc2xhc2ggKGxhc3Qgc2VnbWVudCBpcyBlbXB0eSlcbiAgaWYgKCFhcHBlbmQgfHwgIXN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdKSB7XG4gICAgc3RhY2sucG9wKCk7XG4gIH1cblxuICAvLyByZXNvbHZlIHJlbGF0aXZlIHBhdGhcbiAgdmFyIHNlZ21lbnRzID0gcmVsYXRpdmUucmVwbGFjZSgvXlxcLy8sICcnKS5zcGxpdCgnLycpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNlZ21lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNlZ21lbnQgPSBzZWdtZW50c1tpXTtcbiAgICBpZiAoc2VnbWVudCA9PT0gJy4nKSB7XG4gICAgICBjb250aW51ZVxuICAgIH0gZWxzZSBpZiAoc2VnbWVudCA9PT0gJy4uJykge1xuICAgICAgc3RhY2sucG9wKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YWNrLnB1c2goc2VnbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLy8gZW5zdXJlIGxlYWRpbmcgc2xhc2hcbiAgaWYgKHN0YWNrWzBdICE9PSAnJykge1xuICAgIHN0YWNrLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgcmV0dXJuIHN0YWNrLmpvaW4oJy8nKVxufVxuXG5mdW5jdGlvbiBwYXJzZVBhdGggKHBhdGgpIHtcbiAgdmFyIGhhc2ggPSAnJztcbiAgdmFyIHF1ZXJ5ID0gJyc7XG5cbiAgdmFyIGhhc2hJbmRleCA9IHBhdGguaW5kZXhPZignIycpO1xuICBpZiAoaGFzaEluZGV4ID49IDApIHtcbiAgICBoYXNoID0gcGF0aC5zbGljZShoYXNoSW5kZXgpO1xuICAgIHBhdGggPSBwYXRoLnNsaWNlKDAsIGhhc2hJbmRleCk7XG4gIH1cblxuICB2YXIgcXVlcnlJbmRleCA9IHBhdGguaW5kZXhPZignPycpO1xuICBpZiAocXVlcnlJbmRleCA+PSAwKSB7XG4gICAgcXVlcnkgPSBwYXRoLnNsaWNlKHF1ZXJ5SW5kZXggKyAxKTtcbiAgICBwYXRoID0gcGF0aC5zbGljZSgwLCBxdWVyeUluZGV4KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGF0aDogcGF0aCxcbiAgICBxdWVyeTogcXVlcnksXG4gICAgaGFzaDogaGFzaFxuICB9XG59XG5cbmZ1bmN0aW9uIGNsZWFuUGF0aCAocGF0aCkge1xuICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXC9cXC8vZywgJy8nKVxufVxuXG4vKiAgKi9cblxuZnVuY3Rpb24gY3JlYXRlUm91dGVNYXAgKFxuICByb3V0ZXMsXG4gIG9sZFBhdGhNYXAsXG4gIG9sZE5hbWVNYXBcbikge1xuICB2YXIgcGF0aE1hcCA9IG9sZFBhdGhNYXAgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIG5hbWVNYXAgPSBvbGROYW1lTWFwIHx8IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgcm91dGVzLmZvckVhY2goZnVuY3Rpb24gKHJvdXRlKSB7XG4gICAgYWRkUm91dGVSZWNvcmQocGF0aE1hcCwgbmFtZU1hcCwgcm91dGUpO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHBhdGhNYXA6IHBhdGhNYXAsXG4gICAgbmFtZU1hcDogbmFtZU1hcFxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFJvdXRlUmVjb3JkIChcbiAgcGF0aE1hcCxcbiAgbmFtZU1hcCxcbiAgcm91dGUsXG4gIHBhcmVudCxcbiAgbWF0Y2hBc1xuKSB7XG4gIHZhciBwYXRoID0gcm91dGUucGF0aDtcbiAgdmFyIG5hbWUgPSByb3V0ZS5uYW1lO1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGFzc2VydChwYXRoICE9IG51bGwsIFwiXFxcInBhdGhcXFwiIGlzIHJlcXVpcmVkIGluIGEgcm91dGUgY29uZmlndXJhdGlvbi5cIik7XG4gICAgYXNzZXJ0KFxuICAgICAgdHlwZW9mIHJvdXRlLmNvbXBvbmVudCAhPT0gJ3N0cmluZycsXG4gICAgICBcInJvdXRlIGNvbmZpZyBcXFwiY29tcG9uZW50XFxcIiBmb3IgcGF0aDogXCIgKyAoU3RyaW5nKHBhdGggfHwgbmFtZSkpICsgXCIgY2Fubm90IGJlIGEgXCIgK1xuICAgICAgXCJzdHJpbmcgaWQuIFVzZSBhbiBhY3R1YWwgY29tcG9uZW50IGluc3RlYWQuXCJcbiAgICApO1xuICB9XG5cbiAgdmFyIHJlY29yZCA9IHtcbiAgICBwYXRoOiBub3JtYWxpemVQYXRoKHBhdGgsIHBhcmVudCksXG4gICAgY29tcG9uZW50czogcm91dGUuY29tcG9uZW50cyB8fCB7IGRlZmF1bHQ6IHJvdXRlLmNvbXBvbmVudCB9LFxuICAgIGluc3RhbmNlczoge30sXG4gICAgbmFtZTogbmFtZSxcbiAgICBwYXJlbnQ6IHBhcmVudCxcbiAgICBtYXRjaEFzOiBtYXRjaEFzLFxuICAgIHJlZGlyZWN0OiByb3V0ZS5yZWRpcmVjdCxcbiAgICBiZWZvcmVFbnRlcjogcm91dGUuYmVmb3JlRW50ZXIsXG4gICAgbWV0YTogcm91dGUubWV0YSB8fCB7fSxcbiAgICBwcm9wczogcm91dGUucHJvcHMgPT0gbnVsbFxuICAgICAgPyB7fVxuICAgICAgOiByb3V0ZS5jb21wb25lbnRzXG4gICAgICAgID8gcm91dGUucHJvcHNcbiAgICAgICAgOiB7IGRlZmF1bHQ6IHJvdXRlLnByb3BzIH1cbiAgfTtcblxuICBpZiAocm91dGUuY2hpbGRyZW4pIHtcbiAgICAvLyBXYXJuIGlmIHJvdXRlIGlzIG5hbWVkIGFuZCBoYXMgYSBkZWZhdWx0IGNoaWxkIHJvdXRlLlxuICAgIC8vIElmIHVzZXJzIG5hdmlnYXRlIHRvIHRoaXMgcm91dGUgYnkgbmFtZSwgdGhlIGRlZmF1bHQgY2hpbGQgd2lsbFxuICAgIC8vIG5vdCBiZSByZW5kZXJlZCAoR0ggSXNzdWUgIzYyOSlcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgaWYgKHJvdXRlLm5hbWUgJiYgcm91dGUuY2hpbGRyZW4uc29tZShmdW5jdGlvbiAoY2hpbGQpIHsgcmV0dXJuIC9eXFwvPyQvLnRlc3QoY2hpbGQucGF0aCk7IH0pKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgXCJOYW1lZCBSb3V0ZSAnXCIgKyAocm91dGUubmFtZSkgKyBcIicgaGFzIGEgZGVmYXVsdCBjaGlsZCByb3V0ZS4gXCIgK1xuICAgICAgICAgIFwiV2hlbiBuYXZpZ2F0aW5nIHRvIHRoaXMgbmFtZWQgcm91dGUgKDp0bz1cXFwie25hbWU6ICdcIiArIChyb3V0ZS5uYW1lKSArIFwiJ1xcXCIpLCBcIiArXG4gICAgICAgICAgXCJ0aGUgZGVmYXVsdCBjaGlsZCByb3V0ZSB3aWxsIG5vdCBiZSByZW5kZXJlZC4gUmVtb3ZlIHRoZSBuYW1lIGZyb20gXCIgK1xuICAgICAgICAgIFwidGhpcyByb3V0ZSBhbmQgdXNlIHRoZSBuYW1lIG9mIHRoZSBkZWZhdWx0IGNoaWxkIHJvdXRlIGZvciBuYW1lZCBcIiArXG4gICAgICAgICAgXCJsaW5rcyBpbnN0ZWFkLlwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJvdXRlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICB2YXIgY2hpbGRNYXRjaEFzID0gbWF0Y2hBc1xuICAgICAgICA/IGNsZWFuUGF0aCgobWF0Y2hBcyArIFwiL1wiICsgKGNoaWxkLnBhdGgpKSlcbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICBhZGRSb3V0ZVJlY29yZChwYXRoTWFwLCBuYW1lTWFwLCBjaGlsZCwgcmVjb3JkLCBjaGlsZE1hdGNoQXMpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHJvdXRlLmFsaWFzICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyb3V0ZS5hbGlhcykpIHtcbiAgICAgIHJvdXRlLmFsaWFzLmZvckVhY2goZnVuY3Rpb24gKGFsaWFzKSB7XG4gICAgICAgIHZhciBhbGlhc1JvdXRlID0ge1xuICAgICAgICAgIHBhdGg6IGFsaWFzLFxuICAgICAgICAgIGNoaWxkcmVuOiByb3V0ZS5jaGlsZHJlblxuICAgICAgICB9O1xuICAgICAgICBhZGRSb3V0ZVJlY29yZChwYXRoTWFwLCBuYW1lTWFwLCBhbGlhc1JvdXRlLCBwYXJlbnQsIHJlY29yZC5wYXRoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYWxpYXNSb3V0ZSA9IHtcbiAgICAgICAgcGF0aDogcm91dGUuYWxpYXMsXG4gICAgICAgIGNoaWxkcmVuOiByb3V0ZS5jaGlsZHJlblxuICAgICAgfTtcbiAgICAgIGFkZFJvdXRlUmVjb3JkKHBhdGhNYXAsIG5hbWVNYXAsIGFsaWFzUm91dGUsIHBhcmVudCwgcmVjb3JkLnBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghcGF0aE1hcFtyZWNvcmQucGF0aF0pIHtcbiAgICBwYXRoTWFwW3JlY29yZC5wYXRoXSA9IHJlY29yZDtcbiAgfVxuXG4gIGlmIChuYW1lKSB7XG4gICAgaWYgKCFuYW1lTWFwW25hbWVdKSB7XG4gICAgICBuYW1lTWFwW25hbWVdID0gcmVjb3JkO1xuICAgIH0gZWxzZSBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiAhbWF0Y2hBcykge1xuICAgICAgd2FybihcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIFwiRHVwbGljYXRlIG5hbWVkIHJvdXRlcyBkZWZpbml0aW9uOiBcIiArXG4gICAgICAgIFwieyBuYW1lOiBcXFwiXCIgKyBuYW1lICsgXCJcXFwiLCBwYXRoOiBcXFwiXCIgKyAocmVjb3JkLnBhdGgpICsgXCJcXFwiIH1cIlxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplUGF0aCAocGF0aCwgcGFyZW50KSB7XG4gIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcLyQvLCAnJyk7XG4gIGlmIChwYXRoWzBdID09PSAnLycpIHsgcmV0dXJuIHBhdGggfVxuICBpZiAocGFyZW50ID09IG51bGwpIHsgcmV0dXJuIHBhdGggfVxuICByZXR1cm4gY2xlYW5QYXRoKCgocGFyZW50LnBhdGgpICsgXCIvXCIgKyBwYXRoKSlcbn1cblxudmFyIGluZGV4JDEgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNhcnJheSA9IGluZGV4JDE7XG5cbi8qKlxuICogRXhwb3NlIGBwYXRoVG9SZWdleHBgLlxuICovXG52YXIgaW5kZXggPSBwYXRoVG9SZWdleHA7XG52YXIgcGFyc2VfMSA9IHBhcnNlO1xudmFyIGNvbXBpbGVfMSA9IGNvbXBpbGU7XG52YXIgdG9rZW5zVG9GdW5jdGlvbl8xID0gdG9rZW5zVG9GdW5jdGlvbjtcbnZhciB0b2tlbnNUb1JlZ0V4cF8xID0gdG9rZW5zVG9SZWdFeHA7XG5cbi8qKlxuICogVGhlIG1haW4gcGF0aCBtYXRjaGluZyByZWdleHAgdXRpbGl0eS5cbiAqXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG52YXIgUEFUSF9SRUdFWFAgPSBuZXcgUmVnRXhwKFtcbiAgLy8gTWF0Y2ggZXNjYXBlZCBjaGFyYWN0ZXJzIHRoYXQgd291bGQgb3RoZXJ3aXNlIGFwcGVhciBpbiBmdXR1cmUgbWF0Y2hlcy5cbiAgLy8gVGhpcyBhbGxvd3MgdGhlIHVzZXIgdG8gZXNjYXBlIHNwZWNpYWwgY2hhcmFjdGVycyB0aGF0IHdvbid0IHRyYW5zZm9ybS5cbiAgJyhcXFxcXFxcXC4pJyxcbiAgLy8gTWF0Y2ggRXhwcmVzcy1zdHlsZSBwYXJhbWV0ZXJzIGFuZCB1bi1uYW1lZCBwYXJhbWV0ZXJzIHdpdGggYSBwcmVmaXhcbiAgLy8gYW5kIG9wdGlvbmFsIHN1ZmZpeGVzLiBNYXRjaGVzIGFwcGVhciBhczpcbiAgLy9cbiAgLy8gXCIvOnRlc3QoXFxcXGQrKT9cIiA9PiBbXCIvXCIsIFwidGVzdFwiLCBcIlxcZCtcIiwgdW5kZWZpbmVkLCBcIj9cIiwgdW5kZWZpbmVkXVxuICAvLyBcIi9yb3V0ZShcXFxcZCspXCIgID0+IFt1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBcIlxcZCtcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gIC8vIFwiLypcIiAgICAgICAgICAgID0+IFtcIi9cIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBcIipcIl1cbiAgJyhbXFxcXC8uXSk/KD86KD86XFxcXDooXFxcXHcrKSg/OlxcXFwoKCg/OlxcXFxcXFxcLnxbXlxcXFxcXFxcKCldKSspXFxcXCkpP3xcXFxcKCgoPzpcXFxcXFxcXC58W15cXFxcXFxcXCgpXSkrKVxcXFwpKShbKyo/XSk/fChcXFxcKikpJ1xuXS5qb2luKCd8JyksICdnJyk7XG5cbi8qKlxuICogUGFyc2UgYSBzdHJpbmcgZm9yIHRoZSByYXcgdG9rZW5zLlxuICpcbiAqIEBwYXJhbSAge3N0cmluZ30gIHN0clxuICogQHBhcmFtICB7T2JqZWN0PX0gb3B0aW9uc1xuICogQHJldHVybiB7IUFycmF5fVxuICovXG5mdW5jdGlvbiBwYXJzZSAoc3RyLCBvcHRpb25zKSB7XG4gIHZhciB0b2tlbnMgPSBbXTtcbiAgdmFyIGtleSA9IDA7XG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBwYXRoID0gJyc7XG4gIHZhciBkZWZhdWx0RGVsaW1pdGVyID0gb3B0aW9ucyAmJiBvcHRpb25zLmRlbGltaXRlciB8fCAnLyc7XG4gIHZhciByZXM7XG5cbiAgd2hpbGUgKChyZXMgPSBQQVRIX1JFR0VYUC5leGVjKHN0cikpICE9IG51bGwpIHtcbiAgICB2YXIgbSA9IHJlc1swXTtcbiAgICB2YXIgZXNjYXBlZCA9IHJlc1sxXTtcbiAgICB2YXIgb2Zmc2V0ID0gcmVzLmluZGV4O1xuICAgIHBhdGggKz0gc3RyLnNsaWNlKGluZGV4LCBvZmZzZXQpO1xuICAgIGluZGV4ID0gb2Zmc2V0ICsgbS5sZW5ndGg7XG5cbiAgICAvLyBJZ25vcmUgYWxyZWFkeSBlc2NhcGVkIHNlcXVlbmNlcy5cbiAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgcGF0aCArPSBlc2NhcGVkWzFdO1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICB2YXIgbmV4dCA9IHN0cltpbmRleF07XG4gICAgdmFyIHByZWZpeCA9IHJlc1syXTtcbiAgICB2YXIgbmFtZSA9IHJlc1szXTtcbiAgICB2YXIgY2FwdHVyZSA9IHJlc1s0XTtcbiAgICB2YXIgZ3JvdXAgPSByZXNbNV07XG4gICAgdmFyIG1vZGlmaWVyID0gcmVzWzZdO1xuICAgIHZhciBhc3RlcmlzayA9IHJlc1s3XTtcblxuICAgIC8vIFB1c2ggdGhlIGN1cnJlbnQgcGF0aCBvbnRvIHRoZSB0b2tlbnMuXG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHRva2Vucy5wdXNoKHBhdGgpO1xuICAgICAgcGF0aCA9ICcnO1xuICAgIH1cblxuICAgIHZhciBwYXJ0aWFsID0gcHJlZml4ICE9IG51bGwgJiYgbmV4dCAhPSBudWxsICYmIG5leHQgIT09IHByZWZpeDtcbiAgICB2YXIgcmVwZWF0ID0gbW9kaWZpZXIgPT09ICcrJyB8fCBtb2RpZmllciA9PT0gJyonO1xuICAgIHZhciBvcHRpb25hbCA9IG1vZGlmaWVyID09PSAnPycgfHwgbW9kaWZpZXIgPT09ICcqJztcbiAgICB2YXIgZGVsaW1pdGVyID0gcmVzWzJdIHx8IGRlZmF1bHREZWxpbWl0ZXI7XG4gICAgdmFyIHBhdHRlcm4gPSBjYXB0dXJlIHx8IGdyb3VwO1xuXG4gICAgdG9rZW5zLnB1c2goe1xuICAgICAgbmFtZTogbmFtZSB8fCBrZXkrKyxcbiAgICAgIHByZWZpeDogcHJlZml4IHx8ICcnLFxuICAgICAgZGVsaW1pdGVyOiBkZWxpbWl0ZXIsXG4gICAgICBvcHRpb25hbDogb3B0aW9uYWwsXG4gICAgICByZXBlYXQ6IHJlcGVhdCxcbiAgICAgIHBhcnRpYWw6IHBhcnRpYWwsXG4gICAgICBhc3RlcmlzazogISFhc3RlcmlzayxcbiAgICAgIHBhdHRlcm46IHBhdHRlcm4gPyBlc2NhcGVHcm91cChwYXR0ZXJuKSA6IChhc3RlcmlzayA/ICcuKicgOiAnW14nICsgZXNjYXBlU3RyaW5nKGRlbGltaXRlcikgKyAnXSs/JylcbiAgICB9KTtcbiAgfVxuXG4gIC8vIE1hdGNoIGFueSBjaGFyYWN0ZXJzIHN0aWxsIHJlbWFpbmluZy5cbiAgaWYgKGluZGV4IDwgc3RyLmxlbmd0aCkge1xuICAgIHBhdGggKz0gc3RyLnN1YnN0cihpbmRleCk7XG4gIH1cblxuICAvLyBJZiB0aGUgcGF0aCBleGlzdHMsIHB1c2ggaXQgb250byB0aGUgZW5kLlxuICBpZiAocGF0aCkge1xuICAgIHRva2Vucy5wdXNoKHBhdGgpO1xuICB9XG5cbiAgcmV0dXJuIHRva2Vuc1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSBzdHJpbmcgdG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbiBmb3IgdGhlIHBhdGguXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSAgICAgICAgICAgICBzdHJcbiAqIEBwYXJhbSAge09iamVjdD19ICAgICAgICAgICAgb3B0aW9uc1xuICogQHJldHVybiB7IWZ1bmN0aW9uKE9iamVjdD0sIE9iamVjdD0pfVxuICovXG5mdW5jdGlvbiBjb21waWxlIChzdHIsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRva2Vuc1RvRnVuY3Rpb24ocGFyc2Uoc3RyLCBvcHRpb25zKSlcbn1cblxuLyoqXG4gKiBQcmV0dGllciBlbmNvZGluZyBvZiBVUkkgcGF0aCBzZWdtZW50cy5cbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9XG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVuY29kZVVSSUNvbXBvbmVudFByZXR0eSAoc3RyKSB7XG4gIHJldHVybiBlbmNvZGVVUkkoc3RyKS5yZXBsYWNlKC9bXFwvPyNdL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgcmV0dXJuICclJyArIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKVxuICB9KVxufVxuXG4vKipcbiAqIEVuY29kZSB0aGUgYXN0ZXJpc2sgcGFyYW1ldGVyLiBTaW1pbGFyIHRvIGBwcmV0dHlgLCBidXQgYWxsb3dzIHNsYXNoZXMuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBlbmNvZGVBc3RlcmlzayAoc3RyKSB7XG4gIHJldHVybiBlbmNvZGVVUkkoc3RyKS5yZXBsYWNlKC9bPyNdL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgcmV0dXJuICclJyArIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKVxuICB9KVxufVxuXG4vKipcbiAqIEV4cG9zZSBhIG1ldGhvZCBmb3IgdHJhbnNmb3JtaW5nIHRva2VucyBpbnRvIHRoZSBwYXRoIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiB0b2tlbnNUb0Z1bmN0aW9uICh0b2tlbnMpIHtcbiAgLy8gQ29tcGlsZSBhbGwgdGhlIHRva2VucyBpbnRvIHJlZ2V4cHMuXG4gIHZhciBtYXRjaGVzID0gbmV3IEFycmF5KHRva2Vucy5sZW5ndGgpO1xuXG4gIC8vIENvbXBpbGUgYWxsIHRoZSBwYXR0ZXJucyBiZWZvcmUgY29tcGlsYXRpb24uXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHR5cGVvZiB0b2tlbnNbaV0gPT09ICdvYmplY3QnKSB7XG4gICAgICBtYXRjaGVzW2ldID0gbmV3IFJlZ0V4cCgnXig/OicgKyB0b2tlbnNbaV0ucGF0dGVybiArICcpJCcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAob2JqLCBvcHRzKSB7XG4gICAgdmFyIHBhdGggPSAnJztcbiAgICB2YXIgZGF0YSA9IG9iaiB8fCB7fTtcbiAgICB2YXIgb3B0aW9ucyA9IG9wdHMgfHwge307XG4gICAgdmFyIGVuY29kZSA9IG9wdGlvbnMucHJldHR5ID8gZW5jb2RlVVJJQ29tcG9uZW50UHJldHR5IDogZW5jb2RlVVJJQ29tcG9uZW50O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGF0aCArPSB0b2tlbjtcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUgPSBkYXRhW3Rva2VuLm5hbWVdO1xuICAgICAgdmFyIHNlZ21lbnQ7XG5cbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICAgIC8vIFByZXBlbmQgcGFydGlhbCBzZWdtZW50IHByZWZpeGVzLlxuICAgICAgICAgIGlmICh0b2tlbi5wYXJ0aWFsKSB7XG4gICAgICAgICAgICBwYXRoICs9IHRva2VuLnByZWZpeDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gYmUgZGVmaW5lZCcpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzYXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGlmICghdG9rZW4ucmVwZWF0KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBub3QgcmVwZWF0LCBidXQgcmVjZWl2ZWQgYCcgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkgKyAnYCcpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgaWYgKHRva2VuLm9wdGlvbmFsKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG5vdCBiZSBlbXB0eScpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHNlZ21lbnQgPSBlbmNvZGUodmFsdWVbal0pO1xuXG4gICAgICAgICAgaWYgKCFtYXRjaGVzW2ldLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG1hdGNoIFwiJyArIHRva2VuLnBhdHRlcm4gKyAnXCIsIGJ1dCByZWNlaXZlZCBgJyArIEpTT04uc3RyaW5naWZ5KHNlZ21lbnQpICsgJ2AnKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhdGggKz0gKGogPT09IDAgPyB0b2tlbi5wcmVmaXggOiB0b2tlbi5kZWxpbWl0ZXIpICsgc2VnbWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHNlZ21lbnQgPSB0b2tlbi5hc3RlcmlzayA/IGVuY29kZUFzdGVyaXNrKHZhbHVlKSA6IGVuY29kZSh2YWx1ZSk7XG5cbiAgICAgIGlmICghbWF0Y2hlc1tpXS50ZXN0KHNlZ21lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbWF0Y2ggXCInICsgdG9rZW4ucGF0dGVybiArICdcIiwgYnV0IHJlY2VpdmVkIFwiJyArIHNlZ21lbnQgKyAnXCInKVxuICAgICAgfVxuXG4gICAgICBwYXRoICs9IHRva2VuLnByZWZpeCArIHNlZ21lbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdGhcbiAgfVxufVxuXG4vKipcbiAqIEVzY2FwZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmcuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZXNjYXBlU3RyaW5nIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oWy4rKj89XiE6JHt9KClbXFxdfFxcL1xcXFxdKS9nLCAnXFxcXCQxJylcbn1cblxuLyoqXG4gKiBFc2NhcGUgdGhlIGNhcHR1cmluZyBncm91cCBieSBlc2NhcGluZyBzcGVjaWFsIGNoYXJhY3RlcnMgYW5kIG1lYW5pbmcuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSBncm91cFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVHcm91cCAoZ3JvdXApIHtcbiAgcmV0dXJuIGdyb3VwLnJlcGxhY2UoLyhbPSE6JFxcLygpXSkvZywgJ1xcXFwkMScpXG59XG5cbi8qKlxuICogQXR0YWNoIHRoZSBrZXlzIGFzIGEgcHJvcGVydHkgb2YgdGhlIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHshUmVnRXhwfSByZVxuICogQHBhcmFtICB7QXJyYXl9ICAga2V5c1xuICogQHJldHVybiB7IVJlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXR0YWNoS2V5cyAocmUsIGtleXMpIHtcbiAgcmUua2V5cyA9IGtleXM7XG4gIHJldHVybiByZVxufVxuXG4vKipcbiAqIEdldCB0aGUgZmxhZ3MgZm9yIGEgcmVnZXhwIGZyb20gdGhlIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZsYWdzIChvcHRpb25zKSB7XG4gIHJldHVybiBvcHRpb25zLnNlbnNpdGl2ZSA/ICcnIDogJ2knXG59XG5cbi8qKlxuICogUHVsbCBvdXQga2V5cyBmcm9tIGEgcmVnZXhwLlxuICpcbiAqIEBwYXJhbSAgeyFSZWdFeHB9IHBhdGhcbiAqIEBwYXJhbSAgeyFBcnJheX0gIGtleXNcbiAqIEByZXR1cm4geyFSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHJlZ2V4cFRvUmVnZXhwIChwYXRoLCBrZXlzKSB7XG4gIC8vIFVzZSBhIG5lZ2F0aXZlIGxvb2thaGVhZCB0byBtYXRjaCBvbmx5IGNhcHR1cmluZyBncm91cHMuXG4gIHZhciBncm91cHMgPSBwYXRoLnNvdXJjZS5tYXRjaCgvXFwoKD8hXFw/KS9nKTtcblxuICBpZiAoZ3JvdXBzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncm91cHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleXMucHVzaCh7XG4gICAgICAgIG5hbWU6IGksXG4gICAgICAgIHByZWZpeDogbnVsbCxcbiAgICAgICAgZGVsaW1pdGVyOiBudWxsLFxuICAgICAgICBvcHRpb25hbDogZmFsc2UsXG4gICAgICAgIHJlcGVhdDogZmFsc2UsXG4gICAgICAgIHBhcnRpYWw6IGZhbHNlLFxuICAgICAgICBhc3RlcmlzazogZmFsc2UsXG4gICAgICAgIHBhdHRlcm46IG51bGxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHBhdGgsIGtleXMpXG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIGFycmF5IGludG8gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7IUFycmF5fSAgcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICAga2V5c1xuICogQHBhcmFtICB7IU9iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7IVJlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXJyYXlUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICB2YXIgcGFydHMgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICBwYXJ0cy5wdXNoKHBhdGhUb1JlZ2V4cChwYXRoW2ldLCBrZXlzLCBvcHRpb25zKS5zb3VyY2UpO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJyg/OicgKyBwYXJ0cy5qb2luKCd8JykgKyAnKScsIGZsYWdzKG9wdGlvbnMpKTtcblxuICByZXR1cm4gYXR0YWNoS2V5cyhyZWdleHAsIGtleXMpXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcGF0aCByZWdleHAgZnJvbSBzdHJpbmcgaW5wdXQuXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSAgcGF0aFxuICogQHBhcmFtICB7IUFycmF5fSAga2V5c1xuICogQHBhcmFtICB7IU9iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7IVJlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gc3RyaW5nVG9SZWdleHAgKHBhdGgsIGtleXMsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHRva2Vuc1RvUmVnRXhwKHBhcnNlKHBhdGgsIG9wdGlvbnMpLCBrZXlzLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIEV4cG9zZSBhIGZ1bmN0aW9uIGZvciB0YWtpbmcgdG9rZW5zIGFuZCByZXR1cm5pbmcgYSBSZWdFeHAuXG4gKlxuICogQHBhcmFtICB7IUFycmF5fSAgICAgICAgICB0b2tlbnNcbiAqIEBwYXJhbSAgeyhBcnJheXxPYmplY3QpPX0ga2V5c1xuICogQHBhcmFtICB7T2JqZWN0PX0gICAgICAgICBvcHRpb25zXG4gKiBAcmV0dXJuIHshUmVnRXhwfVxuICovXG5mdW5jdGlvbiB0b2tlbnNUb1JlZ0V4cCAodG9rZW5zLCBrZXlzLCBvcHRpb25zKSB7XG4gIGlmICghaXNhcnJheShrZXlzKSkge1xuICAgIG9wdGlvbnMgPSAvKiogQHR5cGUgeyFPYmplY3R9ICovIChrZXlzIHx8IG9wdGlvbnMpO1xuICAgIGtleXMgPSBbXTtcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBzdHJpY3QgPSBvcHRpb25zLnN0cmljdDtcbiAgdmFyIGVuZCA9IG9wdGlvbnMuZW5kICE9PSBmYWxzZTtcbiAgdmFyIHJvdXRlID0gJyc7XG5cbiAgLy8gSXRlcmF0ZSBvdmVyIHRoZSB0b2tlbnMgYW5kIGNyZWF0ZSBvdXIgcmVnZXhwIHN0cmluZy5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgICAgcm91dGUgKz0gZXNjYXBlU3RyaW5nKHRva2VuKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHByZWZpeCA9IGVzY2FwZVN0cmluZyh0b2tlbi5wcmVmaXgpO1xuICAgICAgdmFyIGNhcHR1cmUgPSAnKD86JyArIHRva2VuLnBhdHRlcm4gKyAnKSc7XG5cbiAgICAgIGtleXMucHVzaCh0b2tlbik7XG5cbiAgICAgIGlmICh0b2tlbi5yZXBlYXQpIHtcbiAgICAgICAgY2FwdHVyZSArPSAnKD86JyArIHByZWZpeCArIGNhcHR1cmUgKyAnKSonO1xuICAgICAgfVxuXG4gICAgICBpZiAodG9rZW4ub3B0aW9uYWwpIHtcbiAgICAgICAgaWYgKCF0b2tlbi5wYXJ0aWFsKSB7XG4gICAgICAgICAgY2FwdHVyZSA9ICcoPzonICsgcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpKT8nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhcHR1cmUgPSBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJyk/JztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FwdHVyZSA9IHByZWZpeCArICcoJyArIGNhcHR1cmUgKyAnKSc7XG4gICAgICB9XG5cbiAgICAgIHJvdXRlICs9IGNhcHR1cmU7XG4gICAgfVxuICB9XG5cbiAgdmFyIGRlbGltaXRlciA9IGVzY2FwZVN0cmluZyhvcHRpb25zLmRlbGltaXRlciB8fCAnLycpO1xuICB2YXIgZW5kc1dpdGhEZWxpbWl0ZXIgPSByb3V0ZS5zbGljZSgtZGVsaW1pdGVyLmxlbmd0aCkgPT09IGRlbGltaXRlcjtcblxuICAvLyBJbiBub24tc3RyaWN0IG1vZGUgd2UgYWxsb3cgYSBzbGFzaCBhdCB0aGUgZW5kIG9mIG1hdGNoLiBJZiB0aGUgcGF0aCB0b1xuICAvLyBtYXRjaCBhbHJlYWR5IGVuZHMgd2l0aCBhIHNsYXNoLCB3ZSByZW1vdmUgaXQgZm9yIGNvbnNpc3RlbmN5LiBUaGUgc2xhc2hcbiAgLy8gaXMgdmFsaWQgYXQgdGhlIGVuZCBvZiBhIHBhdGggbWF0Y2gsIG5vdCBpbiB0aGUgbWlkZGxlLiBUaGlzIGlzIGltcG9ydGFudFxuICAvLyBpbiBub24tZW5kaW5nIG1vZGUsIHdoZXJlIFwiL3Rlc3QvXCIgc2hvdWxkbid0IG1hdGNoIFwiL3Rlc3QvL3JvdXRlXCIuXG4gIGlmICghc3RyaWN0KSB7XG4gICAgcm91dGUgPSAoZW5kc1dpdGhEZWxpbWl0ZXIgPyByb3V0ZS5zbGljZSgwLCAtZGVsaW1pdGVyLmxlbmd0aCkgOiByb3V0ZSkgKyAnKD86JyArIGRlbGltaXRlciArICcoPz0kKSk/JztcbiAgfVxuXG4gIGlmIChlbmQpIHtcbiAgICByb3V0ZSArPSAnJCc7XG4gIH0gZWxzZSB7XG4gICAgLy8gSW4gbm9uLWVuZGluZyBtb2RlLCB3ZSBuZWVkIHRoZSBjYXB0dXJpbmcgZ3JvdXBzIHRvIG1hdGNoIGFzIG11Y2ggYXNcbiAgICAvLyBwb3NzaWJsZSBieSB1c2luZyBhIHBvc2l0aXZlIGxvb2thaGVhZCB0byB0aGUgZW5kIG9yIG5leHQgcGF0aCBzZWdtZW50LlxuICAgIHJvdXRlICs9IHN0cmljdCAmJiBlbmRzV2l0aERlbGltaXRlciA/ICcnIDogJyg/PScgKyBkZWxpbWl0ZXIgKyAnfCQpJztcbiAgfVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKG5ldyBSZWdFeHAoJ14nICsgcm91dGUsIGZsYWdzKG9wdGlvbnMpKSwga2V5cylcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgdGhlIGdpdmVuIHBhdGggc3RyaW5nLCByZXR1cm5pbmcgYSByZWd1bGFyIGV4cHJlc3Npb24uXG4gKlxuICogQW4gZW1wdHkgYXJyYXkgY2FuIGJlIHBhc3NlZCBpbiBmb3IgdGhlIGtleXMsIHdoaWNoIHdpbGwgaG9sZCB0aGVcbiAqIHBsYWNlaG9sZGVyIGtleSBkZXNjcmlwdGlvbnMuIEZvciBleGFtcGxlLCB1c2luZyBgL3VzZXIvOmlkYCwgYGtleXNgIHdpbGxcbiAqIGNvbnRhaW4gYFt7IG5hbWU6ICdpZCcsIGRlbGltaXRlcjogJy8nLCBvcHRpb25hbDogZmFsc2UsIHJlcGVhdDogZmFsc2UgfV1gLlxuICpcbiAqIEBwYXJhbSAgeyhzdHJpbmd8UmVnRXhwfEFycmF5KX0gcGF0aFxuICogQHBhcmFtICB7KEFycmF5fE9iamVjdCk9fSAgICAgICBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3Q9fSAgICAgICAgICAgICAgIG9wdGlvbnNcbiAqIEByZXR1cm4geyFSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHBhdGhUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICBpZiAoIWlzYXJyYXkoa2V5cykpIHtcbiAgICBvcHRpb25zID0gLyoqIEB0eXBlIHshT2JqZWN0fSAqLyAoa2V5cyB8fCBvcHRpb25zKTtcbiAgICBrZXlzID0gW107XG4gIH1cblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBpZiAocGF0aCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIHJldHVybiByZWdleHBUb1JlZ2V4cChwYXRoLCAvKiogQHR5cGUgeyFBcnJheX0gKi8gKGtleXMpKVxuICB9XG5cbiAgaWYgKGlzYXJyYXkocGF0aCkpIHtcbiAgICByZXR1cm4gYXJyYXlUb1JlZ2V4cCgvKiogQHR5cGUgeyFBcnJheX0gKi8gKHBhdGgpLCAvKiogQHR5cGUgeyFBcnJheX0gKi8gKGtleXMpLCBvcHRpb25zKVxuICB9XG5cbiAgcmV0dXJuIHN0cmluZ1RvUmVnZXhwKC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAocGF0aCksIC8qKiBAdHlwZSB7IUFycmF5fSAqLyAoa2V5cyksIG9wdGlvbnMpXG59XG5cbmluZGV4LnBhcnNlID0gcGFyc2VfMTtcbmluZGV4LmNvbXBpbGUgPSBjb21waWxlXzE7XG5pbmRleC50b2tlbnNUb0Z1bmN0aW9uID0gdG9rZW5zVG9GdW5jdGlvbl8xO1xuaW5kZXgudG9rZW5zVG9SZWdFeHAgPSB0b2tlbnNUb1JlZ0V4cF8xO1xuXG4vKiAgKi9cblxudmFyIHJlZ2V4cENhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuZnVuY3Rpb24gZ2V0Um91dGVSZWdleCAocGF0aCkge1xuICB2YXIgaGl0ID0gcmVnZXhwQ2FjaGVbcGF0aF07XG4gIHZhciBrZXlzLCByZWdleHA7XG5cbiAgaWYgKGhpdCkge1xuICAgIGtleXMgPSBoaXQua2V5cztcbiAgICByZWdleHAgPSBoaXQucmVnZXhwO1xuICB9IGVsc2Uge1xuICAgIGtleXMgPSBbXTtcbiAgICByZWdleHAgPSBpbmRleChwYXRoLCBrZXlzKTtcbiAgICByZWdleHBDYWNoZVtwYXRoXSA9IHsga2V5czoga2V5cywgcmVnZXhwOiByZWdleHAgfTtcbiAgfVxuXG4gIHJldHVybiB7IGtleXM6IGtleXMsIHJlZ2V4cDogcmVnZXhwIH1cbn1cblxudmFyIHJlZ2V4cENvbXBpbGVDYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbmZ1bmN0aW9uIGZpbGxQYXJhbXMgKFxuICBwYXRoLFxuICBwYXJhbXMsXG4gIHJvdXRlTXNnXG4pIHtcbiAgdHJ5IHtcbiAgICB2YXIgZmlsbGVyID1cbiAgICAgIHJlZ2V4cENvbXBpbGVDYWNoZVtwYXRoXSB8fFxuICAgICAgKHJlZ2V4cENvbXBpbGVDYWNoZVtwYXRoXSA9IGluZGV4LmNvbXBpbGUocGF0aCkpO1xuICAgIHJldHVybiBmaWxsZXIocGFyYW1zIHx8IHt9LCB7IHByZXR0eTogdHJ1ZSB9KVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHdhcm4oZmFsc2UsIChcIm1pc3NpbmcgcGFyYW0gZm9yIFwiICsgcm91dGVNc2cgKyBcIjogXCIgKyAoZS5tZXNzYWdlKSkpO1xuICAgIH1cbiAgICByZXR1cm4gJydcbiAgfVxufVxuXG4vKiAgKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplTG9jYXRpb24gKFxuICByYXcsXG4gIGN1cnJlbnQsXG4gIGFwcGVuZFxuKSB7XG4gIHZhciBuZXh0ID0gdHlwZW9mIHJhdyA9PT0gJ3N0cmluZycgPyB7IHBhdGg6IHJhdyB9IDogcmF3O1xuICAvLyBuYW1lZCB0YXJnZXRcbiAgaWYgKG5leHQubmFtZSB8fCBuZXh0Ll9ub3JtYWxpemVkKSB7XG4gICAgcmV0dXJuIG5leHRcbiAgfVxuXG4gIC8vIHJlbGF0aXZlIHBhcmFtc1xuICBpZiAoIW5leHQucGF0aCAmJiBuZXh0LnBhcmFtcyAmJiBjdXJyZW50KSB7XG4gICAgbmV4dCA9IGFzc2lnbih7fSwgbmV4dCk7XG4gICAgbmV4dC5fbm9ybWFsaXplZCA9IHRydWU7XG4gICAgdmFyIHBhcmFtcyA9IGFzc2lnbihhc3NpZ24oe30sIGN1cnJlbnQucGFyYW1zKSwgbmV4dC5wYXJhbXMpO1xuICAgIGlmIChjdXJyZW50Lm5hbWUpIHtcbiAgICAgIG5leHQubmFtZSA9IGN1cnJlbnQubmFtZTtcbiAgICAgIG5leHQucGFyYW1zID0gcGFyYW1zO1xuICAgIH0gZWxzZSBpZiAoY3VycmVudC5tYXRjaGVkKSB7XG4gICAgICB2YXIgcmF3UGF0aCA9IGN1cnJlbnQubWF0Y2hlZFtjdXJyZW50Lm1hdGNoZWQubGVuZ3RoIC0gMV0ucGF0aDtcbiAgICAgIG5leHQucGF0aCA9IGZpbGxQYXJhbXMocmF3UGF0aCwgcGFyYW1zLCAoXCJwYXRoIFwiICsgKGN1cnJlbnQucGF0aCkpKTtcbiAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHdhcm4oZmFsc2UsIFwicmVsYXRpdmUgcGFyYW1zIG5hdmlnYXRpb24gcmVxdWlyZXMgYSBjdXJyZW50IHJvdXRlLlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIG5leHRcbiAgfVxuXG4gIHZhciBwYXJzZWRQYXRoID0gcGFyc2VQYXRoKG5leHQucGF0aCB8fCAnJyk7XG4gIHZhciBiYXNlUGF0aCA9IChjdXJyZW50ICYmIGN1cnJlbnQucGF0aCkgfHwgJy8nO1xuICB2YXIgcGF0aCA9IHBhcnNlZFBhdGgucGF0aFxuICAgID8gcmVzb2x2ZVBhdGgocGFyc2VkUGF0aC5wYXRoLCBiYXNlUGF0aCwgYXBwZW5kIHx8IG5leHQuYXBwZW5kKVxuICAgIDogKGN1cnJlbnQgJiYgY3VycmVudC5wYXRoKSB8fCAnLyc7XG4gIHZhciBxdWVyeSA9IHJlc29sdmVRdWVyeShwYXJzZWRQYXRoLnF1ZXJ5LCBuZXh0LnF1ZXJ5KTtcbiAgdmFyIGhhc2ggPSBuZXh0Lmhhc2ggfHwgcGFyc2VkUGF0aC5oYXNoO1xuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSB7XG4gICAgaGFzaCA9IFwiI1wiICsgaGFzaDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgX25vcm1hbGl6ZWQ6IHRydWUsXG4gICAgcGF0aDogcGF0aCxcbiAgICBxdWVyeTogcXVlcnksXG4gICAgaGFzaDogaGFzaFxuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2lnbiAoYSwgYikge1xuICBmb3IgKHZhciBrZXkgaW4gYikge1xuICAgIGFba2V5XSA9IGJba2V5XTtcbiAgfVxuICByZXR1cm4gYVxufVxuXG4vKiAgKi9cblxuZnVuY3Rpb24gY3JlYXRlTWF0Y2hlciAocm91dGVzKSB7XG4gIHZhciByZWYgPSBjcmVhdGVSb3V0ZU1hcChyb3V0ZXMpO1xuICB2YXIgcGF0aE1hcCA9IHJlZi5wYXRoTWFwO1xuICB2YXIgbmFtZU1hcCA9IHJlZi5uYW1lTWFwO1xuXG4gIGZ1bmN0aW9uIGFkZFJvdXRlcyAocm91dGVzKSB7XG4gICAgY3JlYXRlUm91dGVNYXAocm91dGVzLCBwYXRoTWFwLCBuYW1lTWFwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoIChcbiAgICByYXcsXG4gICAgY3VycmVudFJvdXRlLFxuICAgIHJlZGlyZWN0ZWRGcm9tXG4gICkge1xuICAgIHZhciBsb2NhdGlvbiA9IG5vcm1hbGl6ZUxvY2F0aW9uKHJhdywgY3VycmVudFJvdXRlKTtcbiAgICB2YXIgbmFtZSA9IGxvY2F0aW9uLm5hbWU7XG5cbiAgICBpZiAobmFtZSkge1xuICAgICAgdmFyIHJlY29yZCA9IG5hbWVNYXBbbmFtZV07XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICB3YXJuKHJlY29yZCwgKFwiUm91dGUgd2l0aCBuYW1lICdcIiArIG5hbWUgKyBcIicgZG9lcyBub3QgZXhpc3RcIikpO1xuICAgICAgfVxuICAgICAgdmFyIHBhcmFtTmFtZXMgPSBnZXRSb3V0ZVJlZ2V4KHJlY29yZC5wYXRoKS5rZXlzXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gIWtleS5vcHRpb25hbDsgfSlcbiAgICAgICAgLm1hcChmdW5jdGlvbiAoa2V5KSB7IHJldHVybiBrZXkubmFtZTsgfSk7XG5cbiAgICAgIGlmICh0eXBlb2YgbG9jYXRpb24ucGFyYW1zICE9PSAnb2JqZWN0Jykge1xuICAgICAgICBsb2NhdGlvbi5wYXJhbXMgPSB7fTtcbiAgICAgIH1cblxuICAgICAgaWYgKGN1cnJlbnRSb3V0ZSAmJiB0eXBlb2YgY3VycmVudFJvdXRlLnBhcmFtcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGN1cnJlbnRSb3V0ZS5wYXJhbXMpIHtcbiAgICAgICAgICBpZiAoIShrZXkgaW4gbG9jYXRpb24ucGFyYW1zKSAmJiBwYXJhbU5hbWVzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgICAgICAgICBsb2NhdGlvbi5wYXJhbXNba2V5XSA9IGN1cnJlbnRSb3V0ZS5wYXJhbXNba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZCkge1xuICAgICAgICBsb2NhdGlvbi5wYXRoID0gZmlsbFBhcmFtcyhyZWNvcmQucGF0aCwgbG9jYXRpb24ucGFyYW1zLCAoXCJuYW1lZCByb3V0ZSBcXFwiXCIgKyBuYW1lICsgXCJcXFwiXCIpKTtcbiAgICAgICAgcmV0dXJuIF9jcmVhdGVSb3V0ZShyZWNvcmQsIGxvY2F0aW9uLCByZWRpcmVjdGVkRnJvbSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGxvY2F0aW9uLnBhdGgpIHtcbiAgICAgIGxvY2F0aW9uLnBhcmFtcyA9IHt9O1xuICAgICAgZm9yICh2YXIgcGF0aCBpbiBwYXRoTWFwKSB7XG4gICAgICAgIGlmIChtYXRjaFJvdXRlKHBhdGgsIGxvY2F0aW9uLnBhcmFtcywgbG9jYXRpb24ucGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gX2NyZWF0ZVJvdXRlKHBhdGhNYXBbcGF0aF0sIGxvY2F0aW9uLCByZWRpcmVjdGVkRnJvbSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBubyBtYXRjaFxuICAgIHJldHVybiBfY3JlYXRlUm91dGUobnVsbCwgbG9jYXRpb24pXG4gIH1cblxuICBmdW5jdGlvbiByZWRpcmVjdCAoXG4gICAgcmVjb3JkLFxuICAgIGxvY2F0aW9uXG4gICkge1xuICAgIHZhciBvcmlnaW5hbFJlZGlyZWN0ID0gcmVjb3JkLnJlZGlyZWN0O1xuICAgIHZhciByZWRpcmVjdCA9IHR5cGVvZiBvcmlnaW5hbFJlZGlyZWN0ID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gb3JpZ2luYWxSZWRpcmVjdChjcmVhdGVSb3V0ZShyZWNvcmQsIGxvY2F0aW9uKSlcbiAgICAgICAgOiBvcmlnaW5hbFJlZGlyZWN0O1xuXG4gICAgaWYgKHR5cGVvZiByZWRpcmVjdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJlZGlyZWN0ID0geyBwYXRoOiByZWRpcmVjdCB9O1xuICAgIH1cblxuICAgIGlmICghcmVkaXJlY3QgfHwgdHlwZW9mIHJlZGlyZWN0ICE9PSAnb2JqZWN0Jykge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgICBmYWxzZSwgKFwiaW52YWxpZCByZWRpcmVjdCBvcHRpb246IFwiICsgKEpTT04uc3RyaW5naWZ5KHJlZGlyZWN0KSkpXG4gICAgICApO1xuICAgICAgcmV0dXJuIF9jcmVhdGVSb3V0ZShudWxsLCBsb2NhdGlvbilcbiAgICB9XG5cbiAgICB2YXIgcmUgPSByZWRpcmVjdDtcbiAgICB2YXIgbmFtZSA9IHJlLm5hbWU7XG4gICAgdmFyIHBhdGggPSByZS5wYXRoO1xuICAgIHZhciBxdWVyeSA9IGxvY2F0aW9uLnF1ZXJ5O1xuICAgIHZhciBoYXNoID0gbG9jYXRpb24uaGFzaDtcbiAgICB2YXIgcGFyYW1zID0gbG9jYXRpb24ucGFyYW1zO1xuICAgIHF1ZXJ5ID0gcmUuaGFzT3duUHJvcGVydHkoJ3F1ZXJ5JykgPyByZS5xdWVyeSA6IHF1ZXJ5O1xuICAgIGhhc2ggPSByZS5oYXNPd25Qcm9wZXJ0eSgnaGFzaCcpID8gcmUuaGFzaCA6IGhhc2g7XG4gICAgcGFyYW1zID0gcmUuaGFzT3duUHJvcGVydHkoJ3BhcmFtcycpID8gcmUucGFyYW1zIDogcGFyYW1zO1xuXG4gICAgaWYgKG5hbWUpIHtcbiAgICAgIC8vIHJlc29sdmVkIG5hbWVkIGRpcmVjdFxuICAgICAgdmFyIHRhcmdldFJlY29yZCA9IG5hbWVNYXBbbmFtZV07XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBhc3NlcnQodGFyZ2V0UmVjb3JkLCAoXCJyZWRpcmVjdCBmYWlsZWQ6IG5hbWVkIHJvdXRlIFxcXCJcIiArIG5hbWUgKyBcIlxcXCIgbm90IGZvdW5kLlwiKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2goe1xuICAgICAgICBfbm9ybWFsaXplZDogdHJ1ZSxcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgICBoYXNoOiBoYXNoLFxuICAgICAgICBwYXJhbXM6IHBhcmFtc1xuICAgICAgfSwgdW5kZWZpbmVkLCBsb2NhdGlvbilcbiAgICB9IGVsc2UgaWYgKHBhdGgpIHtcbiAgICAgIC8vIDEuIHJlc29sdmUgcmVsYXRpdmUgcmVkaXJlY3RcbiAgICAgIHZhciByYXdQYXRoID0gcmVzb2x2ZVJlY29yZFBhdGgocGF0aCwgcmVjb3JkKTtcbiAgICAgIC8vIDIuIHJlc29sdmUgcGFyYW1zXG4gICAgICB2YXIgcmVzb2x2ZWRQYXRoID0gZmlsbFBhcmFtcyhyYXdQYXRoLCBwYXJhbXMsIChcInJlZGlyZWN0IHJvdXRlIHdpdGggcGF0aCBcXFwiXCIgKyByYXdQYXRoICsgXCJcXFwiXCIpKTtcbiAgICAgIC8vIDMuIHJlbWF0Y2ggd2l0aCBleGlzdGluZyBxdWVyeSBhbmQgaGFzaFxuICAgICAgcmV0dXJuIG1hdGNoKHtcbiAgICAgICAgX25vcm1hbGl6ZWQ6IHRydWUsXG4gICAgICAgIHBhdGg6IHJlc29sdmVkUGF0aCxcbiAgICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgICBoYXNoOiBoYXNoXG4gICAgICB9LCB1bmRlZmluZWQsIGxvY2F0aW9uKVxuICAgIH0gZWxzZSB7XG4gICAgICB3YXJuKGZhbHNlLCAoXCJpbnZhbGlkIHJlZGlyZWN0IG9wdGlvbjogXCIgKyAoSlNPTi5zdHJpbmdpZnkocmVkaXJlY3QpKSkpO1xuICAgICAgcmV0dXJuIF9jcmVhdGVSb3V0ZShudWxsLCBsb2NhdGlvbilcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhbGlhcyAoXG4gICAgcmVjb3JkLFxuICAgIGxvY2F0aW9uLFxuICAgIG1hdGNoQXNcbiAgKSB7XG4gICAgdmFyIGFsaWFzZWRQYXRoID0gZmlsbFBhcmFtcyhtYXRjaEFzLCBsb2NhdGlvbi5wYXJhbXMsIChcImFsaWFzZWQgcm91dGUgd2l0aCBwYXRoIFxcXCJcIiArIG1hdGNoQXMgKyBcIlxcXCJcIikpO1xuICAgIHZhciBhbGlhc2VkTWF0Y2ggPSBtYXRjaCh7XG4gICAgICBfbm9ybWFsaXplZDogdHJ1ZSxcbiAgICAgIHBhdGg6IGFsaWFzZWRQYXRoXG4gICAgfSk7XG4gICAgaWYgKGFsaWFzZWRNYXRjaCkge1xuICAgICAgdmFyIG1hdGNoZWQgPSBhbGlhc2VkTWF0Y2gubWF0Y2hlZDtcbiAgICAgIHZhciBhbGlhc2VkUmVjb3JkID0gbWF0Y2hlZFttYXRjaGVkLmxlbmd0aCAtIDFdO1xuICAgICAgbG9jYXRpb24ucGFyYW1zID0gYWxpYXNlZE1hdGNoLnBhcmFtcztcbiAgICAgIHJldHVybiBfY3JlYXRlUm91dGUoYWxpYXNlZFJlY29yZCwgbG9jYXRpb24pXG4gICAgfVxuICAgIHJldHVybiBfY3JlYXRlUm91dGUobnVsbCwgbG9jYXRpb24pXG4gIH1cblxuICBmdW5jdGlvbiBfY3JlYXRlUm91dGUgKFxuICAgIHJlY29yZCxcbiAgICBsb2NhdGlvbixcbiAgICByZWRpcmVjdGVkRnJvbVxuICApIHtcbiAgICBpZiAocmVjb3JkICYmIHJlY29yZC5yZWRpcmVjdCkge1xuICAgICAgcmV0dXJuIHJlZGlyZWN0KHJlY29yZCwgcmVkaXJlY3RlZEZyb20gfHwgbG9jYXRpb24pXG4gICAgfVxuICAgIGlmIChyZWNvcmQgJiYgcmVjb3JkLm1hdGNoQXMpIHtcbiAgICAgIHJldHVybiBhbGlhcyhyZWNvcmQsIGxvY2F0aW9uLCByZWNvcmQubWF0Y2hBcylcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVJvdXRlKHJlY29yZCwgbG9jYXRpb24sIHJlZGlyZWN0ZWRGcm9tKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBtYXRjaDogbWF0Y2gsXG4gICAgYWRkUm91dGVzOiBhZGRSb3V0ZXNcbiAgfVxufVxuXG5mdW5jdGlvbiBtYXRjaFJvdXRlIChcbiAgcGF0aCxcbiAgcGFyYW1zLFxuICBwYXRobmFtZVxuKSB7XG4gIHZhciByZWYgPSBnZXRSb3V0ZVJlZ2V4KHBhdGgpO1xuICB2YXIgcmVnZXhwID0gcmVmLnJlZ2V4cDtcbiAgdmFyIGtleXMgPSByZWYua2V5cztcbiAgdmFyIG0gPSBwYXRobmFtZS5tYXRjaChyZWdleHApO1xuXG4gIGlmICghbSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9IGVsc2UgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDEsIGxlbiA9IG0ubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpIC0gMV07XG4gICAgdmFyIHZhbCA9IHR5cGVvZiBtW2ldID09PSAnc3RyaW5nJyA/IGRlY29kZVVSSUNvbXBvbmVudChtW2ldKSA6IG1baV07XG4gICAgaWYgKGtleSkgeyBwYXJhbXNba2V5Lm5hbWVdID0gdmFsOyB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUmVjb3JkUGF0aCAocGF0aCwgcmVjb3JkKSB7XG4gIHJldHVybiByZXNvbHZlUGF0aChwYXRoLCByZWNvcmQucGFyZW50ID8gcmVjb3JkLnBhcmVudC5wYXRoIDogJy8nLCB0cnVlKVxufVxuXG4vKiAgKi9cblxuXG52YXIgcG9zaXRpb25TdG9yZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbmZ1bmN0aW9uIHNldHVwU2Nyb2xsICgpIHtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS5zdGF0ZSAmJiBlLnN0YXRlLmtleSkge1xuICAgICAgc2V0U3RhdGVLZXkoZS5zdGF0ZS5rZXkpO1xuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNhdmVTY3JvbGxQb3NpdGlvbik7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVNjcm9sbCAoXG4gIHJvdXRlcixcbiAgdG8sXG4gIGZyb20sXG4gIGlzUG9wXG4pIHtcbiAgaWYgKCFyb3V0ZXIuYXBwKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgYmVoYXZpb3IgPSByb3V0ZXIub3B0aW9ucy5zY3JvbGxCZWhhdmlvcjtcbiAgaWYgKCFiZWhhdmlvcikge1xuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBhc3NlcnQodHlwZW9mIGJlaGF2aW9yID09PSAnZnVuY3Rpb24nLCBcInNjcm9sbEJlaGF2aW9yIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgfVxuXG4gIC8vIHdhaXQgdW50aWwgcmUtcmVuZGVyIGZpbmlzaGVzIGJlZm9yZSBzY3JvbGxpbmdcbiAgcm91dGVyLmFwcC4kbmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgIHZhciBwb3NpdGlvbiA9IGdldFNjcm9sbFBvc2l0aW9uKCk7XG4gICAgdmFyIHNob3VsZFNjcm9sbCA9IGJlaGF2aW9yKHRvLCBmcm9tLCBpc1BvcCA/IHBvc2l0aW9uIDogbnVsbCk7XG4gICAgaWYgKCFzaG91bGRTY3JvbGwpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgaXNPYmplY3QgPSB0eXBlb2Ygc2hvdWxkU2Nyb2xsID09PSAnb2JqZWN0JztcbiAgICBpZiAoaXNPYmplY3QgJiYgdHlwZW9mIHNob3VsZFNjcm9sbC5zZWxlY3RvciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2hvdWxkU2Nyb2xsLnNlbGVjdG9yKTtcbiAgICAgIGlmIChlbCkge1xuICAgICAgICBwb3NpdGlvbiA9IGdldEVsZW1lbnRQb3NpdGlvbihlbCk7XG4gICAgICB9IGVsc2UgaWYgKGlzVmFsaWRQb3NpdGlvbihzaG91bGRTY3JvbGwpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gbm9ybWFsaXplUG9zaXRpb24oc2hvdWxkU2Nyb2xsKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0ICYmIGlzVmFsaWRQb3NpdGlvbihzaG91bGRTY3JvbGwpKSB7XG4gICAgICBwb3NpdGlvbiA9IG5vcm1hbGl6ZVBvc2l0aW9uKHNob3VsZFNjcm9sbCk7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uKSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8ocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2F2ZVNjcm9sbFBvc2l0aW9uICgpIHtcbiAgdmFyIGtleSA9IGdldFN0YXRlS2V5KCk7XG4gIGlmIChrZXkpIHtcbiAgICBwb3NpdGlvblN0b3JlW2tleV0gPSB7XG4gICAgICB4OiB3aW5kb3cucGFnZVhPZmZzZXQsXG4gICAgICB5OiB3aW5kb3cucGFnZVlPZmZzZXRcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFNjcm9sbFBvc2l0aW9uICgpIHtcbiAgdmFyIGtleSA9IGdldFN0YXRlS2V5KCk7XG4gIGlmIChrZXkpIHtcbiAgICByZXR1cm4gcG9zaXRpb25TdG9yZVtrZXldXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RWxlbWVudFBvc2l0aW9uIChlbCkge1xuICB2YXIgZG9jUmVjdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIGVsUmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICByZXR1cm4ge1xuICAgIHg6IGVsUmVjdC5sZWZ0IC0gZG9jUmVjdC5sZWZ0LFxuICAgIHk6IGVsUmVjdC50b3AgLSBkb2NSZWN0LnRvcFxuICB9XG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRQb3NpdGlvbiAob2JqKSB7XG4gIHJldHVybiBpc051bWJlcihvYmoueCkgfHwgaXNOdW1iZXIob2JqLnkpXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVBvc2l0aW9uIChvYmopIHtcbiAgcmV0dXJuIHtcbiAgICB4OiBpc051bWJlcihvYmoueCkgPyBvYmoueCA6IHdpbmRvdy5wYWdlWE9mZnNldCxcbiAgICB5OiBpc051bWJlcihvYmoueSkgPyBvYmoueSA6IHdpbmRvdy5wYWdlWU9mZnNldFxuICB9XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyICh2KSB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gJ251bWJlcidcbn1cblxuLyogICovXG5cbnZhciBzdXBwb3J0c1B1c2hTdGF0ZSA9IGluQnJvd3NlciAmJiAoZnVuY3Rpb24gKCkge1xuICB2YXIgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcblxuICBpZiAoXG4gICAgKHVhLmluZGV4T2YoJ0FuZHJvaWQgMi4nKSAhPT0gLTEgfHwgdWEuaW5kZXhPZignQW5kcm9pZCA0LjAnKSAhPT0gLTEpICYmXG4gICAgdWEuaW5kZXhPZignTW9iaWxlIFNhZmFyaScpICE9PSAtMSAmJlxuICAgIHVhLmluZGV4T2YoJ0Nocm9tZScpID09PSAtMSAmJlxuICAgIHVhLmluZGV4T2YoJ1dpbmRvd3MgUGhvbmUnKSA9PT0gLTFcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gd2luZG93Lmhpc3RvcnkgJiYgJ3B1c2hTdGF0ZScgaW4gd2luZG93Lmhpc3Rvcnlcbn0pKCk7XG5cbi8vIHVzZSBVc2VyIFRpbWluZyBhcGkgKGlmIHByZXNlbnQpIGZvciBtb3JlIGFjY3VyYXRlIGtleSBwcmVjaXNpb25cbnZhciBUaW1lID0gaW5Ccm93c2VyICYmIHdpbmRvdy5wZXJmb3JtYW5jZSAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93XG4gID8gd2luZG93LnBlcmZvcm1hbmNlXG4gIDogRGF0ZTtcblxudmFyIF9rZXkgPSBnZW5LZXkoKTtcblxuZnVuY3Rpb24gZ2VuS2V5ICgpIHtcbiAgcmV0dXJuIFRpbWUubm93KCkudG9GaXhlZCgzKVxufVxuXG5mdW5jdGlvbiBnZXRTdGF0ZUtleSAoKSB7XG4gIHJldHVybiBfa2V5XG59XG5cbmZ1bmN0aW9uIHNldFN0YXRlS2V5IChrZXkpIHtcbiAgX2tleSA9IGtleTtcbn1cblxuZnVuY3Rpb24gcHVzaFN0YXRlICh1cmwsIHJlcGxhY2UpIHtcbiAgLy8gdHJ5Li4uY2F0Y2ggdGhlIHB1c2hTdGF0ZSBjYWxsIHRvIGdldCBhcm91bmQgU2FmYXJpXG4gIC8vIERPTSBFeGNlcHRpb24gMTggd2hlcmUgaXQgbGltaXRzIHRvIDEwMCBwdXNoU3RhdGUgY2FsbHNcbiAgdmFyIGhpc3RvcnkgPSB3aW5kb3cuaGlzdG9yeTtcbiAgdHJ5IHtcbiAgICBpZiAocmVwbGFjZSkge1xuICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoeyBrZXk6IF9rZXkgfSwgJycsIHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIF9rZXkgPSBnZW5LZXkoKTtcbiAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHsga2V5OiBfa2V5IH0sICcnLCB1cmwpO1xuICAgIH1cbiAgICBzYXZlU2Nyb2xsUG9zaXRpb24oKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHdpbmRvdy5sb2NhdGlvbltyZXBsYWNlID8gJ3JlcGxhY2UnIDogJ2Fzc2lnbiddKHVybCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVwbGFjZVN0YXRlICh1cmwpIHtcbiAgcHVzaFN0YXRlKHVybCwgdHJ1ZSk7XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBydW5RdWV1ZSAocXVldWUsIGZuLCBjYikge1xuICB2YXIgc3RlcCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICAgIGlmIChpbmRleCA+PSBxdWV1ZS5sZW5ndGgpIHtcbiAgICAgIGNiKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChxdWV1ZVtpbmRleF0pIHtcbiAgICAgICAgZm4ocXVldWVbaW5kZXhdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc3RlcChpbmRleCArIDEpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ZXAoaW5kZXggKyAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHN0ZXAoMCk7XG59XG5cbi8qICAqL1xuXG5cbnZhciBIaXN0b3J5ID0gZnVuY3Rpb24gSGlzdG9yeSAocm91dGVyLCBiYXNlKSB7XG4gIHRoaXMucm91dGVyID0gcm91dGVyO1xuICB0aGlzLmJhc2UgPSBub3JtYWxpemVCYXNlKGJhc2UpO1xuICAvLyBzdGFydCB3aXRoIGEgcm91dGUgb2JqZWN0IHRoYXQgc3RhbmRzIGZvciBcIm5vd2hlcmVcIlxuICB0aGlzLmN1cnJlbnQgPSBTVEFSVDtcbiAgdGhpcy5wZW5kaW5nID0gbnVsbDtcbiAgdGhpcy5yZWFkeSA9IGZhbHNlO1xuICB0aGlzLnJlYWR5Q2JzID0gW107XG59O1xuXG5IaXN0b3J5LnByb3RvdHlwZS5saXN0ZW4gPSBmdW5jdGlvbiBsaXN0ZW4gKGNiKSB7XG4gIHRoaXMuY2IgPSBjYjtcbn07XG5cbkhpc3RvcnkucHJvdG90eXBlLm9uUmVhZHkgPSBmdW5jdGlvbiBvblJlYWR5IChjYikge1xuICBpZiAodGhpcy5yZWFkeSkge1xuICAgIGNiKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5yZWFkeUNicy5wdXNoKGNiKTtcbiAgfVxufTtcblxuSGlzdG9yeS5wcm90b3R5cGUudHJhbnNpdGlvblRvID0gZnVuY3Rpb24gdHJhbnNpdGlvblRvIChsb2NhdGlvbiwgb25Db21wbGV0ZSwgb25BYm9ydCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHZhciByb3V0ZSA9IHRoaXMucm91dGVyLm1hdGNoKGxvY2F0aW9uLCB0aGlzLmN1cnJlbnQpO1xuICB0aGlzLmNvbmZpcm1UcmFuc2l0aW9uKHJvdXRlLCBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcyQxLnVwZGF0ZVJvdXRlKHJvdXRlKTtcbiAgICBvbkNvbXBsZXRlICYmIG9uQ29tcGxldGUocm91dGUpO1xuICAgIHRoaXMkMS5lbnN1cmVVUkwoKTtcblxuICAgIC8vIGZpcmUgcmVhZHkgY2JzIG9uY2VcbiAgICBpZiAoIXRoaXMkMS5yZWFkeSkge1xuICAgICAgdGhpcyQxLnJlYWR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMkMS5yZWFkeUNicy5mb3JFYWNoKGZ1bmN0aW9uIChjYikge1xuICAgICAgICBjYihyb3V0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIG9uQWJvcnQpO1xufTtcblxuSGlzdG9yeS5wcm90b3R5cGUuY29uZmlybVRyYW5zaXRpb24gPSBmdW5jdGlvbiBjb25maXJtVHJhbnNpdGlvbiAocm91dGUsIG9uQ29tcGxldGUsIG9uQWJvcnQpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB2YXIgY3VycmVudCA9IHRoaXMuY3VycmVudDtcbiAgdmFyIGFib3J0ID0gZnVuY3Rpb24gKCkgeyBvbkFib3J0ICYmIG9uQWJvcnQoKTsgfTtcbiAgaWYgKFxuICAgIGlzU2FtZVJvdXRlKHJvdXRlLCBjdXJyZW50KSAmJlxuICAgIC8vIGluIHRoZSBjYXNlIHRoZSByb3V0ZSBtYXAgaGFzIGJlZW4gZHluYW1pY2FsbHkgYXBwZW5kZWQgdG9cbiAgICByb3V0ZS5tYXRjaGVkLmxlbmd0aCA9PT0gY3VycmVudC5tYXRjaGVkLmxlbmd0aFxuICApIHtcbiAgICB0aGlzLmVuc3VyZVVSTCgpO1xuICAgIHJldHVybiBhYm9ydCgpXG4gIH1cblxuICB2YXIgcmVmID0gcmVzb2x2ZVF1ZXVlKHRoaXMuY3VycmVudC5tYXRjaGVkLCByb3V0ZS5tYXRjaGVkKTtcbiAgICB2YXIgdXBkYXRlZCA9IHJlZi51cGRhdGVkO1xuICAgIHZhciBkZWFjdGl2YXRlZCA9IHJlZi5kZWFjdGl2YXRlZDtcbiAgICB2YXIgYWN0aXZhdGVkID0gcmVmLmFjdGl2YXRlZDtcblxuICB2YXIgcXVldWUgPSBbXS5jb25jYXQoXG4gICAgLy8gaW4tY29tcG9uZW50IGxlYXZlIGd1YXJkc1xuICAgIGV4dHJhY3RMZWF2ZUd1YXJkcyhkZWFjdGl2YXRlZCksXG4gICAgLy8gZ2xvYmFsIGJlZm9yZSBob29rc1xuICAgIHRoaXMucm91dGVyLmJlZm9yZUhvb2tzLFxuICAgIC8vIGluLWNvbXBvbmVudCB1cGRhdGUgaG9va3NcbiAgICBleHRyYWN0VXBkYXRlSG9va3ModXBkYXRlZCksXG4gICAgLy8gaW4tY29uZmlnIGVudGVyIGd1YXJkc1xuICAgIGFjdGl2YXRlZC5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuIG0uYmVmb3JlRW50ZXI7IH0pLFxuICAgIC8vIGFzeW5jIGNvbXBvbmVudHNcbiAgICByZXNvbHZlQXN5bmNDb21wb25lbnRzKGFjdGl2YXRlZClcbiAgKTtcblxuICB0aGlzLnBlbmRpbmcgPSByb3V0ZTtcbiAgdmFyIGl0ZXJhdG9yID0gZnVuY3Rpb24gKGhvb2ssIG5leHQpIHtcbiAgICBpZiAodGhpcyQxLnBlbmRpbmcgIT09IHJvdXRlKSB7XG4gICAgICByZXR1cm4gYWJvcnQoKVxuICAgIH1cbiAgICBob29rKHJvdXRlLCBjdXJyZW50LCBmdW5jdGlvbiAodG8pIHtcbiAgICAgIGlmICh0byA9PT0gZmFsc2UpIHtcbiAgICAgICAgLy8gbmV4dChmYWxzZSkgLT4gYWJvcnQgbmF2aWdhdGlvbiwgZW5zdXJlIGN1cnJlbnQgVVJMXG4gICAgICAgIHRoaXMkMS5lbnN1cmVVUkwodHJ1ZSk7XG4gICAgICAgIGFib3J0KCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0byA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHRvID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBuZXh0KCcvJykgb3IgbmV4dCh7IHBhdGg6ICcvJyB9KSAtPiByZWRpcmVjdFxuICAgICAgICAodHlwZW9mIHRvID09PSAnb2JqZWN0JyAmJiB0by5yZXBsYWNlKSA/IHRoaXMkMS5yZXBsYWNlKHRvKSA6IHRoaXMkMS5wdXNoKHRvKTtcbiAgICAgICAgYWJvcnQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNvbmZpcm0gdHJhbnNpdGlvbiBhbmQgcGFzcyBvbiB0aGUgdmFsdWVcbiAgICAgICAgbmV4dCh0byk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcnVuUXVldWUocXVldWUsIGl0ZXJhdG9yLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBvc3RFbnRlckNicyA9IFtdO1xuICAgIHZhciBpc1ZhbGlkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpcyQxLmN1cnJlbnQgPT09IHJvdXRlOyB9O1xuICAgIHZhciBlbnRlckd1YXJkcyA9IGV4dHJhY3RFbnRlckd1YXJkcyhhY3RpdmF0ZWQsIHBvc3RFbnRlckNicywgaXNWYWxpZCk7XG4gICAgLy8gd2FpdCB1bnRpbCBhc3luYyBjb21wb25lbnRzIGFyZSByZXNvbHZlZCBiZWZvcmVcbiAgICAvLyBleHRyYWN0aW5nIGluLWNvbXBvbmVudCBlbnRlciBndWFyZHNcbiAgICBydW5RdWV1ZShlbnRlckd1YXJkcywgaXRlcmF0b3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzJDEucGVuZGluZyAhPT0gcm91dGUpIHtcbiAgICAgICAgcmV0dXJuIGFib3J0KClcbiAgICAgIH1cbiAgICAgIHRoaXMkMS5wZW5kaW5nID0gbnVsbDtcbiAgICAgIG9uQ29tcGxldGUocm91dGUpO1xuICAgICAgaWYgKHRoaXMkMS5yb3V0ZXIuYXBwKSB7XG4gICAgICAgIHRoaXMkMS5yb3V0ZXIuYXBwLiRuZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcG9zdEVudGVyQ2JzLmZvckVhY2goZnVuY3Rpb24gKGNiKSB7IHJldHVybiBjYigpOyB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTtcblxuSGlzdG9yeS5wcm90b3R5cGUudXBkYXRlUm91dGUgPSBmdW5jdGlvbiB1cGRhdGVSb3V0ZSAocm91dGUpIHtcbiAgdmFyIHByZXYgPSB0aGlzLmN1cnJlbnQ7XG4gIHRoaXMuY3VycmVudCA9IHJvdXRlO1xuICB0aGlzLmNiICYmIHRoaXMuY2Iocm91dGUpO1xuICB0aGlzLnJvdXRlci5hZnRlckhvb2tzLmZvckVhY2goZnVuY3Rpb24gKGhvb2spIHtcbiAgICBob29rICYmIGhvb2socm91dGUsIHByZXYpO1xuICB9KTtcbn07XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUJhc2UgKGJhc2UpIHtcbiAgaWYgKCFiYXNlKSB7XG4gICAgaWYgKGluQnJvd3Nlcikge1xuICAgICAgLy8gcmVzcGVjdCA8YmFzZT4gdGFnXG4gICAgICB2YXIgYmFzZUVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYmFzZScpO1xuICAgICAgYmFzZSA9IGJhc2VFbCA/IGJhc2VFbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSA6ICcvJztcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZSA9ICcvJztcbiAgICB9XG4gIH1cbiAgLy8gbWFrZSBzdXJlIHRoZXJlJ3MgdGhlIHN0YXJ0aW5nIHNsYXNoXG4gIGlmIChiYXNlLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgYmFzZSA9ICcvJyArIGJhc2U7XG4gIH1cbiAgLy8gcmVtb3ZlIHRyYWlsaW5nIHNsYXNoXG4gIHJldHVybiBiYXNlLnJlcGxhY2UoL1xcLyQvLCAnJylcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVF1ZXVlIChcbiAgY3VycmVudCxcbiAgbmV4dFxuKSB7XG4gIHZhciBpO1xuICB2YXIgbWF4ID0gTWF0aC5tYXgoY3VycmVudC5sZW5ndGgsIG5leHQubGVuZ3RoKTtcbiAgZm9yIChpID0gMDsgaSA8IG1heDsgaSsrKSB7XG4gICAgaWYgKGN1cnJlbnRbaV0gIT09IG5leHRbaV0pIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgdXBkYXRlZDogbmV4dC5zbGljZSgwLCBpKSxcbiAgICBhY3RpdmF0ZWQ6IG5leHQuc2xpY2UoaSksXG4gICAgZGVhY3RpdmF0ZWQ6IGN1cnJlbnQuc2xpY2UoaSlcbiAgfVxufVxuXG5mdW5jdGlvbiBleHRyYWN0R3VhcmRzIChcbiAgcmVjb3JkcyxcbiAgbmFtZSxcbiAgYmluZCxcbiAgcmV2ZXJzZVxuKSB7XG4gIHZhciBndWFyZHMgPSBmbGF0TWFwQ29tcG9uZW50cyhyZWNvcmRzLCBmdW5jdGlvbiAoZGVmLCBpbnN0YW5jZSwgbWF0Y2gsIGtleSkge1xuICAgIHZhciBndWFyZCA9IGV4dHJhY3RHdWFyZChkZWYsIG5hbWUpO1xuICAgIGlmIChndWFyZCkge1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoZ3VhcmQpXG4gICAgICAgID8gZ3VhcmQubWFwKGZ1bmN0aW9uIChndWFyZCkgeyByZXR1cm4gYmluZChndWFyZCwgaW5zdGFuY2UsIG1hdGNoLCBrZXkpOyB9KVxuICAgICAgICA6IGJpbmQoZ3VhcmQsIGluc3RhbmNlLCBtYXRjaCwga2V5KVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBmbGF0dGVuKHJldmVyc2UgPyBndWFyZHMucmV2ZXJzZSgpIDogZ3VhcmRzKVxufVxuXG5mdW5jdGlvbiBleHRyYWN0R3VhcmQgKFxuICBkZWYsXG4gIGtleVxuKSB7XG4gIGlmICh0eXBlb2YgZGVmICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gZXh0ZW5kIG5vdyBzbyB0aGF0IGdsb2JhbCBtaXhpbnMgYXJlIGFwcGxpZWQuXG4gICAgZGVmID0gX1Z1ZS5leHRlbmQoZGVmKTtcbiAgfVxuICByZXR1cm4gZGVmLm9wdGlvbnNba2V5XVxufVxuXG5mdW5jdGlvbiBleHRyYWN0TGVhdmVHdWFyZHMgKGRlYWN0aXZhdGVkKSB7XG4gIHJldHVybiBleHRyYWN0R3VhcmRzKGRlYWN0aXZhdGVkLCAnYmVmb3JlUm91dGVMZWF2ZScsIGJpbmRHdWFyZCwgdHJ1ZSlcbn1cblxuZnVuY3Rpb24gZXh0cmFjdFVwZGF0ZUhvb2tzICh1cGRhdGVkKSB7XG4gIHJldHVybiBleHRyYWN0R3VhcmRzKHVwZGF0ZWQsICdiZWZvcmVSb3V0ZVVwZGF0ZScsIGJpbmRHdWFyZClcbn1cblxuZnVuY3Rpb24gYmluZEd1YXJkIChndWFyZCwgaW5zdGFuY2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGJvdW5kUm91dGVHdWFyZCAoKSB7XG4gICAgcmV0dXJuIGd1YXJkLmFwcGx5KGluc3RhbmNlLCBhcmd1bWVudHMpXG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdEVudGVyR3VhcmRzIChcbiAgYWN0aXZhdGVkLFxuICBjYnMsXG4gIGlzVmFsaWRcbikge1xuICByZXR1cm4gZXh0cmFjdEd1YXJkcyhhY3RpdmF0ZWQsICdiZWZvcmVSb3V0ZUVudGVyJywgZnVuY3Rpb24gKGd1YXJkLCBfLCBtYXRjaCwga2V5KSB7XG4gICAgcmV0dXJuIGJpbmRFbnRlckd1YXJkKGd1YXJkLCBtYXRjaCwga2V5LCBjYnMsIGlzVmFsaWQpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGJpbmRFbnRlckd1YXJkIChcbiAgZ3VhcmQsXG4gIG1hdGNoLFxuICBrZXksXG4gIGNicyxcbiAgaXNWYWxpZFxuKSB7XG4gIHJldHVybiBmdW5jdGlvbiByb3V0ZUVudGVyR3VhcmQgKHRvLCBmcm9tLCBuZXh0KSB7XG4gICAgcmV0dXJuIGd1YXJkKHRvLCBmcm9tLCBmdW5jdGlvbiAoY2IpIHtcbiAgICAgIG5leHQoY2IpO1xuICAgICAgaWYgKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYnMucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gIzc1MFxuICAgICAgICAgIC8vIGlmIGEgcm91dGVyLXZpZXcgaXMgd3JhcHBlZCB3aXRoIGFuIG91dC1pbiB0cmFuc2l0aW9uLFxuICAgICAgICAgIC8vIHRoZSBpbnN0YW5jZSBtYXkgbm90IGhhdmUgYmVlbiByZWdpc3RlcmVkIGF0IHRoaXMgdGltZS5cbiAgICAgICAgICAvLyB3ZSB3aWxsIG5lZWQgdG8gcG9sbCBmb3IgcmVnaXN0cmF0aW9uIHVudGlsIGN1cnJlbnQgcm91dGVcbiAgICAgICAgICAvLyBpcyBubyBsb25nZXIgdmFsaWQuXG4gICAgICAgICAgcG9sbChjYiwgbWF0Y2guaW5zdGFuY2VzLCBrZXksIGlzVmFsaWQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIHBvbGwgKFxuICBjYiwgLy8gc29tZWhvdyBmbG93IGNhbm5vdCBpbmZlciB0aGlzIGlzIGEgZnVuY3Rpb25cbiAgaW5zdGFuY2VzLFxuICBrZXksXG4gIGlzVmFsaWRcbikge1xuICBpZiAoaW5zdGFuY2VzW2tleV0pIHtcbiAgICBjYihpbnN0YW5jZXNba2V5XSk7XG4gIH0gZWxzZSBpZiAoaXNWYWxpZCgpKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBwb2xsKGNiLCBpbnN0YW5jZXMsIGtleSwgaXNWYWxpZCk7XG4gICAgfSwgMTYpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVBc3luY0NvbXBvbmVudHMgKG1hdGNoZWQpIHtcbiAgcmV0dXJuIGZsYXRNYXBDb21wb25lbnRzKG1hdGNoZWQsIGZ1bmN0aW9uIChkZWYsIF8sIG1hdGNoLCBrZXkpIHtcbiAgICAvLyBpZiBpdCdzIGEgZnVuY3Rpb24gYW5kIGRvZXNuJ3QgaGF2ZSBWdWUgb3B0aW9ucyBhdHRhY2hlZCxcbiAgICAvLyBhc3N1bWUgaXQncyBhbiBhc3luYyBjb21wb25lbnQgcmVzb2x2ZSBmdW5jdGlvbi5cbiAgICAvLyB3ZSBhcmUgbm90IHVzaW5nIFZ1ZSdzIGRlZmF1bHQgYXN5bmMgcmVzb2x2aW5nIG1lY2hhbmlzbSBiZWNhdXNlXG4gICAgLy8gd2Ugd2FudCB0byBoYWx0IHRoZSBuYXZpZ2F0aW9uIHVudGlsIHRoZSBpbmNvbWluZyBjb21wb25lbnQgaGFzIGJlZW5cbiAgICAvLyByZXNvbHZlZC5cbiAgICBpZiAodHlwZW9mIGRlZiA9PT0gJ2Z1bmN0aW9uJyAmJiAhZGVmLm9wdGlvbnMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAodG8sIGZyb20sIG5leHQpIHtcbiAgICAgICAgdmFyIHJlc29sdmUgPSBvbmNlKGZ1bmN0aW9uIChyZXNvbHZlZERlZikge1xuICAgICAgICAgIG1hdGNoLmNvbXBvbmVudHNba2V5XSA9IHJlc29sdmVkRGVmO1xuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHJlamVjdCA9IG9uY2UoZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgIHdhcm4oZmFsc2UsIChcIkZhaWxlZCB0byByZXNvbHZlIGFzeW5jIGNvbXBvbmVudCBcIiArIGtleSArIFwiOiBcIiArIHJlYXNvbikpO1xuICAgICAgICAgIG5leHQoZmFsc2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgcmVzID0gZGVmKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIGlmIChyZXMgJiYgdHlwZW9mIHJlcy50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgcmVzLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gZmxhdE1hcENvbXBvbmVudHMgKFxuICBtYXRjaGVkLFxuICBmblxuKSB7XG4gIHJldHVybiBmbGF0dGVuKG1hdGNoZWQubWFwKGZ1bmN0aW9uIChtKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG0uY29tcG9uZW50cykubWFwKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIGZuKFxuICAgICAgbS5jb21wb25lbnRzW2tleV0sXG4gICAgICBtLmluc3RhbmNlc1trZXldLFxuICAgICAgbSwga2V5XG4gICAgKTsgfSlcbiAgfSkpXG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4gKGFycikge1xuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgYXJyKVxufVxuXG4vLyBpbiBXZWJwYWNrIDIsIHJlcXVpcmUuZW5zdXJlIG5vdyBhbHNvIHJldHVybnMgYSBQcm9taXNlXG4vLyBzbyB0aGUgcmVzb2x2ZS9yZWplY3QgZnVuY3Rpb25zIG1heSBnZXQgY2FsbGVkIGFuIGV4dHJhIHRpbWVcbi8vIGlmIHRoZSB1c2VyIHVzZXMgYW4gYXJyb3cgZnVuY3Rpb24gc2hvcnRoYW5kIHRoYXQgaGFwcGVucyB0b1xuLy8gcmV0dXJuIHRoYXQgUHJvbWlzZS5cbmZ1bmN0aW9uIG9uY2UgKGZuKSB7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoY2FsbGVkKSB7IHJldHVybiB9XG4gICAgY2FsbGVkID0gdHJ1ZTtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG59XG5cbi8qICAqL1xuXG5cbnZhciBIVE1MNUhpc3RvcnkgPSAoZnVuY3Rpb24gKEhpc3RvcnkkJDEpIHtcbiAgZnVuY3Rpb24gSFRNTDVIaXN0b3J5IChyb3V0ZXIsIGJhc2UpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIEhpc3RvcnkkJDEuY2FsbCh0aGlzLCByb3V0ZXIsIGJhc2UpO1xuXG4gICAgdmFyIGV4cGVjdFNjcm9sbCA9IHJvdXRlci5vcHRpb25zLnNjcm9sbEJlaGF2aW9yO1xuXG4gICAgaWYgKGV4cGVjdFNjcm9sbCkge1xuICAgICAgc2V0dXBTY3JvbGwoKTtcbiAgICB9XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgdGhpcyQxLnRyYW5zaXRpb25UbyhnZXRMb2NhdGlvbih0aGlzJDEuYmFzZSksIGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgICBpZiAoZXhwZWN0U2Nyb2xsKSB7XG4gICAgICAgICAgaGFuZGxlU2Nyb2xsKHJvdXRlciwgcm91dGUsIHRoaXMkMS5jdXJyZW50LCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoIEhpc3RvcnkkJDEgKSBIVE1MNUhpc3RvcnkuX19wcm90b19fID0gSGlzdG9yeSQkMTtcbiAgSFRNTDVIaXN0b3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEhpc3RvcnkkJDEgJiYgSGlzdG9yeSQkMS5wcm90b3R5cGUgKTtcbiAgSFRNTDVIaXN0b3J5LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEhUTUw1SGlzdG9yeTtcblxuICBIVE1MNUhpc3RvcnkucHJvdG90eXBlLmdvID0gZnVuY3Rpb24gZ28gKG4pIHtcbiAgICB3aW5kb3cuaGlzdG9yeS5nbyhuKTtcbiAgfTtcblxuICBIVE1MNUhpc3RvcnkucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiBwdXNoIChsb2NhdGlvbiwgb25Db21wbGV0ZSwgb25BYm9ydCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgdGhpcy50cmFuc2l0aW9uVG8obG9jYXRpb24sIGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgICAgcHVzaFN0YXRlKGNsZWFuUGF0aCh0aGlzJDEuYmFzZSArIHJvdXRlLmZ1bGxQYXRoKSk7XG4gICAgICBoYW5kbGVTY3JvbGwodGhpcyQxLnJvdXRlciwgcm91dGUsIHRoaXMkMS5jdXJyZW50LCBmYWxzZSk7XG4gICAgICBvbkNvbXBsZXRlICYmIG9uQ29tcGxldGUocm91dGUpO1xuICAgIH0sIG9uQWJvcnQpO1xuICB9O1xuXG4gIEhUTUw1SGlzdG9yeS5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uIHJlcGxhY2UgKGxvY2F0aW9uLCBvbkNvbXBsZXRlLCBvbkFib3J0KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB0aGlzLnRyYW5zaXRpb25Ubyhsb2NhdGlvbiwgZnVuY3Rpb24gKHJvdXRlKSB7XG4gICAgICByZXBsYWNlU3RhdGUoY2xlYW5QYXRoKHRoaXMkMS5iYXNlICsgcm91dGUuZnVsbFBhdGgpKTtcbiAgICAgIGhhbmRsZVNjcm9sbCh0aGlzJDEucm91dGVyLCByb3V0ZSwgdGhpcyQxLmN1cnJlbnQsIGZhbHNlKTtcbiAgICAgIG9uQ29tcGxldGUgJiYgb25Db21wbGV0ZShyb3V0ZSk7XG4gICAgfSwgb25BYm9ydCk7XG4gIH07XG5cbiAgSFRNTDVIaXN0b3J5LnByb3RvdHlwZS5lbnN1cmVVUkwgPSBmdW5jdGlvbiBlbnN1cmVVUkwgKHB1c2gpIHtcbiAgICBpZiAoZ2V0TG9jYXRpb24odGhpcy5iYXNlKSAhPT0gdGhpcy5jdXJyZW50LmZ1bGxQYXRoKSB7XG4gICAgICB2YXIgY3VycmVudCA9IGNsZWFuUGF0aCh0aGlzLmJhc2UgKyB0aGlzLmN1cnJlbnQuZnVsbFBhdGgpO1xuICAgICAgcHVzaCA/IHB1c2hTdGF0ZShjdXJyZW50KSA6IHJlcGxhY2VTdGF0ZShjdXJyZW50KTtcbiAgICB9XG4gIH07XG5cbiAgSFRNTDVIaXN0b3J5LnByb3RvdHlwZS5nZXRDdXJyZW50TG9jYXRpb24gPSBmdW5jdGlvbiBnZXRDdXJyZW50TG9jYXRpb24gKCkge1xuICAgIHJldHVybiBnZXRMb2NhdGlvbih0aGlzLmJhc2UpXG4gIH07XG5cbiAgcmV0dXJuIEhUTUw1SGlzdG9yeTtcbn0oSGlzdG9yeSkpO1xuXG5mdW5jdGlvbiBnZXRMb2NhdGlvbiAoYmFzZSkge1xuICB2YXIgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgaWYgKGJhc2UgJiYgcGF0aC5pbmRleE9mKGJhc2UpID09PSAwKSB7XG4gICAgcGF0aCA9IHBhdGguc2xpY2UoYmFzZS5sZW5ndGgpO1xuICB9XG4gIHJldHVybiAocGF0aCB8fCAnLycpICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaCArIHdpbmRvdy5sb2NhdGlvbi5oYXNoXG59XG5cbi8qICAqL1xuXG5cbnZhciBIYXNoSGlzdG9yeSA9IChmdW5jdGlvbiAoSGlzdG9yeSQkMSkge1xuICBmdW5jdGlvbiBIYXNoSGlzdG9yeSAocm91dGVyLCBiYXNlLCBmYWxsYmFjaykge1xuICAgIEhpc3RvcnkkJDEuY2FsbCh0aGlzLCByb3V0ZXIsIGJhc2UpO1xuICAgIC8vIGNoZWNrIGhpc3RvcnkgZmFsbGJhY2sgZGVlcGxpbmtpbmdcbiAgICBpZiAoZmFsbGJhY2sgJiYgY2hlY2tGYWxsYmFjayh0aGlzLmJhc2UpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZW5zdXJlU2xhc2goKTtcbiAgfVxuXG4gIGlmICggSGlzdG9yeSQkMSApIEhhc2hIaXN0b3J5Ll9fcHJvdG9fXyA9IEhpc3RvcnkkJDE7XG4gIEhhc2hIaXN0b3J5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEhpc3RvcnkkJDEgJiYgSGlzdG9yeSQkMS5wcm90b3R5cGUgKTtcbiAgSGFzaEhpc3RvcnkucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSGFzaEhpc3Rvcnk7XG5cbiAgLy8gdGhpcyBpcyBkZWxheWVkIHVudGlsIHRoZSBhcHAgbW91bnRzXG4gIC8vIHRvIGF2b2lkIHRoZSBoYXNoY2hhbmdlIGxpc3RlbmVyIGJlaW5nIGZpcmVkIHRvbyBlYXJseVxuICBIYXNoSGlzdG9yeS5wcm90b3R5cGUuc2V0dXBMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXR1cExpc3RlbmVycyAoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghZW5zdXJlU2xhc2goKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMkMS50cmFuc2l0aW9uVG8oZ2V0SGFzaCgpLCBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgICAgcmVwbGFjZUhhc2gocm91dGUuZnVsbFBhdGgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgSGFzaEhpc3RvcnkucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiBwdXNoIChsb2NhdGlvbiwgb25Db21wbGV0ZSwgb25BYm9ydCkge1xuICAgIHRoaXMudHJhbnNpdGlvblRvKGxvY2F0aW9uLCBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgIHB1c2hIYXNoKHJvdXRlLmZ1bGxQYXRoKTtcbiAgICAgIG9uQ29tcGxldGUgJiYgb25Db21wbGV0ZShyb3V0ZSk7XG4gICAgfSwgb25BYm9ydCk7XG4gIH07XG5cbiAgSGFzaEhpc3RvcnkucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbiByZXBsYWNlIChsb2NhdGlvbiwgb25Db21wbGV0ZSwgb25BYm9ydCkge1xuICAgIHRoaXMudHJhbnNpdGlvblRvKGxvY2F0aW9uLCBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgIHJlcGxhY2VIYXNoKHJvdXRlLmZ1bGxQYXRoKTtcbiAgICAgIG9uQ29tcGxldGUgJiYgb25Db21wbGV0ZShyb3V0ZSk7XG4gICAgfSwgb25BYm9ydCk7XG4gIH07XG5cbiAgSGFzaEhpc3RvcnkucHJvdG90eXBlLmdvID0gZnVuY3Rpb24gZ28gKG4pIHtcbiAgICB3aW5kb3cuaGlzdG9yeS5nbyhuKTtcbiAgfTtcblxuICBIYXNoSGlzdG9yeS5wcm90b3R5cGUuZW5zdXJlVVJMID0gZnVuY3Rpb24gZW5zdXJlVVJMIChwdXNoKSB7XG4gICAgdmFyIGN1cnJlbnQgPSB0aGlzLmN1cnJlbnQuZnVsbFBhdGg7XG4gICAgaWYgKGdldEhhc2goKSAhPT0gY3VycmVudCkge1xuICAgICAgcHVzaCA/IHB1c2hIYXNoKGN1cnJlbnQpIDogcmVwbGFjZUhhc2goY3VycmVudCk7XG4gICAgfVxuICB9O1xuXG4gIEhhc2hIaXN0b3J5LnByb3RvdHlwZS5nZXRDdXJyZW50TG9jYXRpb24gPSBmdW5jdGlvbiBnZXRDdXJyZW50TG9jYXRpb24gKCkge1xuICAgIHJldHVybiBnZXRIYXNoKClcbiAgfTtcblxuICByZXR1cm4gSGFzaEhpc3Rvcnk7XG59KEhpc3RvcnkpKTtcblxuZnVuY3Rpb24gY2hlY2tGYWxsYmFjayAoYmFzZSkge1xuICB2YXIgbG9jYXRpb24gPSBnZXRMb2NhdGlvbihiYXNlKTtcbiAgaWYgKCEvXlxcLyMvLnRlc3QobG9jYXRpb24pKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoXG4gICAgICBjbGVhblBhdGgoYmFzZSArICcvIycgKyBsb2NhdGlvbilcbiAgICApO1xuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuZnVuY3Rpb24gZW5zdXJlU2xhc2ggKCkge1xuICB2YXIgcGF0aCA9IGdldEhhc2goKTtcbiAgaWYgKHBhdGguY2hhckF0KDApID09PSAnLycpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIHJlcGxhY2VIYXNoKCcvJyArIHBhdGgpO1xuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gZ2V0SGFzaCAoKSB7XG4gIC8vIFdlIGNhbid0IHVzZSB3aW5kb3cubG9jYXRpb24uaGFzaCBoZXJlIGJlY2F1c2UgaXQncyBub3RcbiAgLy8gY29uc2lzdGVudCBhY3Jvc3MgYnJvd3NlcnMgLSBGaXJlZm94IHdpbGwgcHJlLWRlY29kZSBpdCFcbiAgdmFyIGhyZWYgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgdmFyIGluZGV4ID0gaHJlZi5pbmRleE9mKCcjJyk7XG4gIHJldHVybiBpbmRleCA9PT0gLTEgPyAnJyA6IGhyZWYuc2xpY2UoaW5kZXggKyAxKVxufVxuXG5mdW5jdGlvbiBwdXNoSGFzaCAocGF0aCkge1xuICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IHBhdGg7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VIYXNoIChwYXRoKSB7XG4gIHZhciBpID0gd2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignIycpO1xuICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZi5zbGljZSgwLCBpID49IDAgPyBpIDogMCkgKyAnIycgKyBwYXRoXG4gICk7XG59XG5cbi8qICAqL1xuXG5cbnZhciBBYnN0cmFjdEhpc3RvcnkgPSAoZnVuY3Rpb24gKEhpc3RvcnkkJDEpIHtcbiAgZnVuY3Rpb24gQWJzdHJhY3RIaXN0b3J5IChyb3V0ZXIsIGJhc2UpIHtcbiAgICBIaXN0b3J5JCQxLmNhbGwodGhpcywgcm91dGVyLCBiYXNlKTtcbiAgICB0aGlzLnN0YWNrID0gW107XG4gICAgdGhpcy5pbmRleCA9IC0xO1xuICB9XG5cbiAgaWYgKCBIaXN0b3J5JCQxICkgQWJzdHJhY3RIaXN0b3J5Ll9fcHJvdG9fXyA9IEhpc3RvcnkkJDE7XG4gIEFic3RyYWN0SGlzdG9yeS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBIaXN0b3J5JCQxICYmIEhpc3RvcnkkJDEucHJvdG90eXBlICk7XG4gIEFic3RyYWN0SGlzdG9yeS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBYnN0cmFjdEhpc3Rvcnk7XG5cbiAgQWJzdHJhY3RIaXN0b3J5LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gcHVzaCAobG9jYXRpb24sIG9uQ29tcGxldGUsIG9uQWJvcnQpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIHRoaXMudHJhbnNpdGlvblRvKGxvY2F0aW9uLCBmdW5jdGlvbiAocm91dGUpIHtcbiAgICAgIHRoaXMkMS5zdGFjayA9IHRoaXMkMS5zdGFjay5zbGljZSgwLCB0aGlzJDEuaW5kZXggKyAxKS5jb25jYXQocm91dGUpO1xuICAgICAgdGhpcyQxLmluZGV4Kys7XG4gICAgICBvbkNvbXBsZXRlICYmIG9uQ29tcGxldGUocm91dGUpO1xuICAgIH0sIG9uQWJvcnQpO1xuICB9O1xuXG4gIEFic3RyYWN0SGlzdG9yeS5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uIHJlcGxhY2UgKGxvY2F0aW9uLCBvbkNvbXBsZXRlLCBvbkFib3J0KSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgICB0aGlzLnRyYW5zaXRpb25Ubyhsb2NhdGlvbiwgZnVuY3Rpb24gKHJvdXRlKSB7XG4gICAgICB0aGlzJDEuc3RhY2sgPSB0aGlzJDEuc3RhY2suc2xpY2UoMCwgdGhpcyQxLmluZGV4KS5jb25jYXQocm91dGUpO1xuICAgICAgb25Db21wbGV0ZSAmJiBvbkNvbXBsZXRlKHJvdXRlKTtcbiAgICB9LCBvbkFib3J0KTtcbiAgfTtcblxuICBBYnN0cmFjdEhpc3RvcnkucHJvdG90eXBlLmdvID0gZnVuY3Rpb24gZ28gKG4pIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIHZhciB0YXJnZXRJbmRleCA9IHRoaXMuaW5kZXggKyBuO1xuICAgIGlmICh0YXJnZXRJbmRleCA8IDAgfHwgdGFyZ2V0SW5kZXggPj0gdGhpcy5zdGFjay5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB2YXIgcm91dGUgPSB0aGlzLnN0YWNrW3RhcmdldEluZGV4XTtcbiAgICB0aGlzLmNvbmZpcm1UcmFuc2l0aW9uKHJvdXRlLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzJDEuaW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICAgIHRoaXMkMS51cGRhdGVSb3V0ZShyb3V0ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgQWJzdHJhY3RIaXN0b3J5LnByb3RvdHlwZS5nZXRDdXJyZW50TG9jYXRpb24gPSBmdW5jdGlvbiBnZXRDdXJyZW50TG9jYXRpb24gKCkge1xuICAgIHZhciBjdXJyZW50ID0gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBjdXJyZW50ID8gY3VycmVudC5mdWxsUGF0aCA6ICcvJ1xuICB9O1xuXG4gIEFic3RyYWN0SGlzdG9yeS5wcm90b3R5cGUuZW5zdXJlVVJMID0gZnVuY3Rpb24gZW5zdXJlVVJMICgpIHtcbiAgICAvLyBub29wXG4gIH07XG5cbiAgcmV0dXJuIEFic3RyYWN0SGlzdG9yeTtcbn0oSGlzdG9yeSkpO1xuXG4vKiAgKi9cblxudmFyIFZ1ZVJvdXRlciA9IGZ1bmN0aW9uIFZ1ZVJvdXRlciAob3B0aW9ucykge1xuICBpZiAoIG9wdGlvbnMgPT09IHZvaWQgMCApIG9wdGlvbnMgPSB7fTtcblxuICB0aGlzLmFwcCA9IG51bGw7XG4gIHRoaXMuYXBwcyA9IFtdO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLmJlZm9yZUhvb2tzID0gW107XG4gIHRoaXMuYWZ0ZXJIb29rcyA9IFtdO1xuICB0aGlzLm1hdGNoZXIgPSBjcmVhdGVNYXRjaGVyKG9wdGlvbnMucm91dGVzIHx8IFtdKTtcblxuICB2YXIgbW9kZSA9IG9wdGlvbnMubW9kZSB8fCAnaGFzaCc7XG4gIHRoaXMuZmFsbGJhY2sgPSBtb2RlID09PSAnaGlzdG9yeScgJiYgIXN1cHBvcnRzUHVzaFN0YXRlO1xuICBpZiAodGhpcy5mYWxsYmFjaykge1xuICAgIG1vZGUgPSAnaGFzaCc7XG4gIH1cbiAgaWYgKCFpbkJyb3dzZXIpIHtcbiAgICBtb2RlID0gJ2Fic3RyYWN0JztcbiAgfVxuICB0aGlzLm1vZGUgPSBtb2RlO1xuXG4gIHN3aXRjaCAobW9kZSkge1xuICAgIGNhc2UgJ2hpc3RvcnknOlxuICAgICAgdGhpcy5oaXN0b3J5ID0gbmV3IEhUTUw1SGlzdG9yeSh0aGlzLCBvcHRpb25zLmJhc2UpO1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdoYXNoJzpcbiAgICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBIYXNoSGlzdG9yeSh0aGlzLCBvcHRpb25zLmJhc2UsIHRoaXMuZmFsbGJhY2spO1xuICAgICAgYnJlYWtcbiAgICBjYXNlICdhYnN0cmFjdCc6XG4gICAgICB0aGlzLmhpc3RvcnkgPSBuZXcgQWJzdHJhY3RIaXN0b3J5KHRoaXMsIG9wdGlvbnMuYmFzZSk7XG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBhc3NlcnQoZmFsc2UsIChcImludmFsaWQgbW9kZTogXCIgKyBtb2RlKSk7XG4gICAgICB9XG4gIH1cbn07XG5cbnZhciBwcm90b3R5cGVBY2Nlc3NvcnMgPSB7IGN1cnJlbnRSb3V0ZToge30gfTtcblxuVnVlUm91dGVyLnByb3RvdHlwZS5tYXRjaCA9IGZ1bmN0aW9uIG1hdGNoIChcbiAgcmF3LFxuICBjdXJyZW50LFxuICByZWRpcmVjdGVkRnJvbVxuKSB7XG4gIHJldHVybiB0aGlzLm1hdGNoZXIubWF0Y2gocmF3LCBjdXJyZW50LCByZWRpcmVjdGVkRnJvbSlcbn07XG5cbnByb3RvdHlwZUFjY2Vzc29ycy5jdXJyZW50Um91dGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5oaXN0b3J5ICYmIHRoaXMuaGlzdG9yeS5jdXJyZW50XG59O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiBpbml0IChhcHAgLyogVnVlIGNvbXBvbmVudCBpbnN0YW5jZSAqLykge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgYXNzZXJ0KFxuICAgIGluc3RhbGwuaW5zdGFsbGVkLFxuICAgIFwibm90IGluc3RhbGxlZC4gTWFrZSBzdXJlIHRvIGNhbGwgYFZ1ZS51c2UoVnVlUm91dGVyKWAgXCIgK1xuICAgIFwiYmVmb3JlIGNyZWF0aW5nIHJvb3QgaW5zdGFuY2UuXCJcbiAgKTtcblxuICB0aGlzLmFwcHMucHVzaChhcHApO1xuXG4gIC8vIG1haW4gYXBwIGFscmVhZHkgaW5pdGlhbGl6ZWQuXG4gIGlmICh0aGlzLmFwcCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdGhpcy5hcHAgPSBhcHA7XG5cbiAgdmFyIGhpc3RvcnkgPSB0aGlzLmhpc3Rvcnk7XG5cbiAgaWYgKGhpc3RvcnkgaW5zdGFuY2VvZiBIVE1MNUhpc3RvcnkpIHtcbiAgICBoaXN0b3J5LnRyYW5zaXRpb25UbyhoaXN0b3J5LmdldEN1cnJlbnRMb2NhdGlvbigpKTtcbiAgfSBlbHNlIGlmIChoaXN0b3J5IGluc3RhbmNlb2YgSGFzaEhpc3RvcnkpIHtcbiAgICB2YXIgc2V0dXBIYXNoTGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBoaXN0b3J5LnNldHVwTGlzdGVuZXJzKCk7XG4gICAgfTtcbiAgICBoaXN0b3J5LnRyYW5zaXRpb25UbyhcbiAgICAgIGhpc3RvcnkuZ2V0Q3VycmVudExvY2F0aW9uKCksXG4gICAgICBzZXR1cEhhc2hMaXN0ZW5lcixcbiAgICAgIHNldHVwSGFzaExpc3RlbmVyXG4gICAgKTtcbiAgfVxuXG4gIGhpc3RvcnkubGlzdGVuKGZ1bmN0aW9uIChyb3V0ZSkge1xuICAgIHRoaXMkMS5hcHBzLmZvckVhY2goZnVuY3Rpb24gKGFwcCkge1xuICAgICAgYXBwLl9yb3V0ZSA9IHJvdXRlO1xuICAgIH0pO1xuICB9KTtcbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuYmVmb3JlRWFjaCA9IGZ1bmN0aW9uIGJlZm9yZUVhY2ggKGZuKSB7XG4gIHRoaXMuYmVmb3JlSG9va3MucHVzaChmbik7XG59O1xuXG5WdWVSb3V0ZXIucHJvdG90eXBlLmFmdGVyRWFjaCA9IGZ1bmN0aW9uIGFmdGVyRWFjaCAoZm4pIHtcbiAgdGhpcy5hZnRlckhvb2tzLnB1c2goZm4pO1xufTtcblxuVnVlUm91dGVyLnByb3RvdHlwZS5vblJlYWR5ID0gZnVuY3Rpb24gb25SZWFkeSAoY2IpIHtcbiAgdGhpcy5oaXN0b3J5Lm9uUmVhZHkoY2IpO1xufTtcblxuVnVlUm91dGVyLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gcHVzaCAobG9jYXRpb24sIG9uQ29tcGxldGUsIG9uQWJvcnQpIHtcbiAgdGhpcy5oaXN0b3J5LnB1c2gobG9jYXRpb24sIG9uQ29tcGxldGUsIG9uQWJvcnQpO1xufTtcblxuVnVlUm91dGVyLnByb3RvdHlwZS5yZXBsYWNlID0gZnVuY3Rpb24gcmVwbGFjZSAobG9jYXRpb24sIG9uQ29tcGxldGUsIG9uQWJvcnQpIHtcbiAgdGhpcy5oaXN0b3J5LnJlcGxhY2UobG9jYXRpb24sIG9uQ29tcGxldGUsIG9uQWJvcnQpO1xufTtcblxuVnVlUm91dGVyLnByb3RvdHlwZS5nbyA9IGZ1bmN0aW9uIGdvIChuKSB7XG4gIHRoaXMuaGlzdG9yeS5nbyhuKTtcbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuYmFjayA9IGZ1bmN0aW9uIGJhY2sgKCkge1xuICB0aGlzLmdvKC0xKTtcbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuZm9yd2FyZCA9IGZ1bmN0aW9uIGZvcndhcmQgKCkge1xuICB0aGlzLmdvKDEpO1xufTtcblxuVnVlUm91dGVyLnByb3RvdHlwZS5nZXRNYXRjaGVkQ29tcG9uZW50cyA9IGZ1bmN0aW9uIGdldE1hdGNoZWRDb21wb25lbnRzICh0bykge1xuICB2YXIgcm91dGUgPSB0b1xuICAgID8gdGhpcy5yZXNvbHZlKHRvKS5yb3V0ZVxuICAgIDogdGhpcy5jdXJyZW50Um91dGU7XG4gIGlmICghcm91dGUpIHtcbiAgICByZXR1cm4gW11cbiAgfVxuICByZXR1cm4gW10uY29uY2F0LmFwcGx5KFtdLCByb3V0ZS5tYXRjaGVkLm1hcChmdW5jdGlvbiAobSkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhtLmNvbXBvbmVudHMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gbS5jb21wb25lbnRzW2tleV1cbiAgICB9KVxuICB9KSlcbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUucmVzb2x2ZSA9IGZ1bmN0aW9uIHJlc29sdmUgKFxuICB0byxcbiAgY3VycmVudCxcbiAgYXBwZW5kXG4pIHtcbiAgdmFyIGxvY2F0aW9uID0gbm9ybWFsaXplTG9jYXRpb24odG8sIGN1cnJlbnQgfHwgdGhpcy5oaXN0b3J5LmN1cnJlbnQsIGFwcGVuZCk7XG4gIHZhciByb3V0ZSA9IHRoaXMubWF0Y2gobG9jYXRpb24sIGN1cnJlbnQpO1xuICB2YXIgZnVsbFBhdGggPSByb3V0ZS5yZWRpcmVjdGVkRnJvbSB8fCByb3V0ZS5mdWxsUGF0aDtcbiAgdmFyIGJhc2UgPSB0aGlzLmhpc3RvcnkuYmFzZTtcbiAgdmFyIGhyZWYgPSBjcmVhdGVIcmVmKGJhc2UsIGZ1bGxQYXRoLCB0aGlzLm1vZGUpO1xuICByZXR1cm4ge1xuICAgIGxvY2F0aW9uOiBsb2NhdGlvbixcbiAgICByb3V0ZTogcm91dGUsXG4gICAgaHJlZjogaHJlZixcbiAgICAvLyBmb3IgYmFja3dhcmRzIGNvbXBhdFxuICAgIG5vcm1hbGl6ZWRUbzogbG9jYXRpb24sXG4gICAgcmVzb2x2ZWQ6IHJvdXRlXG4gIH1cbn07XG5cblZ1ZVJvdXRlci5wcm90b3R5cGUuYWRkUm91dGVzID0gZnVuY3Rpb24gYWRkUm91dGVzIChyb3V0ZXMpIHtcbiAgdGhpcy5tYXRjaGVyLmFkZFJvdXRlcyhyb3V0ZXMpO1xuICBpZiAodGhpcy5oaXN0b3J5LmN1cnJlbnQgIT09IFNUQVJUKSB7XG4gICAgdGhpcy5oaXN0b3J5LnRyYW5zaXRpb25Ubyh0aGlzLmhpc3RvcnkuZ2V0Q3VycmVudExvY2F0aW9uKCkpO1xuICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggVnVlUm91dGVyLnByb3RvdHlwZSwgcHJvdG90eXBlQWNjZXNzb3JzICk7XG5cbmZ1bmN0aW9uIGNyZWF0ZUhyZWYgKGJhc2UsIGZ1bGxQYXRoLCBtb2RlKSB7XG4gIHZhciBwYXRoID0gbW9kZSA9PT0gJ2hhc2gnID8gJyMnICsgZnVsbFBhdGggOiBmdWxsUGF0aDtcbiAgcmV0dXJuIGJhc2UgPyBjbGVhblBhdGgoYmFzZSArICcvJyArIHBhdGgpIDogcGF0aFxufVxuXG5WdWVSb3V0ZXIuaW5zdGFsbCA9IGluc3RhbGw7XG5WdWVSb3V0ZXIudmVyc2lvbiA9ICcyLjIuMCc7XG5cbmlmIChpbkJyb3dzZXIgJiYgd2luZG93LlZ1ZSkge1xuICB3aW5kb3cuVnVlLnVzZShWdWVSb3V0ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFZ1ZVJvdXRlcjtcbiIsIi8qIVxuICogVnVlLmpzIHYyLjEuMTBcbiAqIChjKSAyMDE0LTIwMTcgRXZhbiBZb3VcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKiAgKi9cblxuLyoqXG4gKiBDb252ZXJ0IGEgdmFsdWUgdG8gYSBzdHJpbmcgdGhhdCBpcyBhY3R1YWxseSByZW5kZXJlZC5cbiAqL1xuZnVuY3Rpb24gX3RvU3RyaW5nICh2YWwpIHtcbiAgcmV0dXJuIHZhbCA9PSBudWxsXG4gICAgPyAnJ1xuICAgIDogdHlwZW9mIHZhbCA9PT0gJ29iamVjdCdcbiAgICAgID8gSlNPTi5zdHJpbmdpZnkodmFsLCBudWxsLCAyKVxuICAgICAgOiBTdHJpbmcodmFsKVxufVxuXG4vKipcbiAqIENvbnZlcnQgYSBpbnB1dCB2YWx1ZSB0byBhIG51bWJlciBmb3IgcGVyc2lzdGVuY2UuXG4gKiBJZiB0aGUgY29udmVyc2lvbiBmYWlscywgcmV0dXJuIG9yaWdpbmFsIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIgKHZhbCkge1xuICB2YXIgbiA9IHBhcnNlRmxvYXQodmFsKTtcbiAgcmV0dXJuIGlzTmFOKG4pID8gdmFsIDogblxufVxuXG4vKipcbiAqIE1ha2UgYSBtYXAgYW5kIHJldHVybiBhIGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhIGtleVxuICogaXMgaW4gdGhhdCBtYXAuXG4gKi9cbmZ1bmN0aW9uIG1ha2VNYXAgKFxuICBzdHIsXG4gIGV4cGVjdHNMb3dlckNhc2Vcbikge1xuICB2YXIgbWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIGxpc3QgPSBzdHIuc3BsaXQoJywnKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgbWFwW2xpc3RbaV1dID0gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZXhwZWN0c0xvd2VyQ2FzZVxuICAgID8gZnVuY3Rpb24gKHZhbCkgeyByZXR1cm4gbWFwW3ZhbC50b0xvd2VyQ2FzZSgpXTsgfVxuICAgIDogZnVuY3Rpb24gKHZhbCkgeyByZXR1cm4gbWFwW3ZhbF07IH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiBhIHRhZyBpcyBhIGJ1aWx0LWluIHRhZy5cbiAqL1xudmFyIGlzQnVpbHRJblRhZyA9IG1ha2VNYXAoJ3Nsb3QsY29tcG9uZW50JywgdHJ1ZSk7XG5cbi8qKlxuICogUmVtb3ZlIGFuIGl0ZW0gZnJvbSBhbiBhcnJheVxuICovXG5mdW5jdGlvbiByZW1vdmUkMSAoYXJyLCBpdGVtKSB7XG4gIGlmIChhcnIubGVuZ3RoKSB7XG4gICAgdmFyIGluZGV4ID0gYXJyLmluZGV4T2YoaXRlbSk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgIHJldHVybiBhcnIuc3BsaWNlKGluZGV4LCAxKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIG9iamVjdCBoYXMgdGhlIHByb3BlcnR5LlxuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuZnVuY3Rpb24gaGFzT3duIChvYmosIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSlcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB2YWx1ZSBpcyBwcmltaXRpdmVcbiAqL1xuZnVuY3Rpb24gaXNQcmltaXRpdmUgKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcidcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBjYWNoZWQgdmVyc2lvbiBvZiBhIHB1cmUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGNhY2hlZCAoZm4pIHtcbiAgdmFyIGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgcmV0dXJuIChmdW5jdGlvbiBjYWNoZWRGbiAoc3RyKSB7XG4gICAgdmFyIGhpdCA9IGNhY2hlW3N0cl07XG4gICAgcmV0dXJuIGhpdCB8fCAoY2FjaGVbc3RyXSA9IGZuKHN0cikpXG4gIH0pXG59XG5cbi8qKlxuICogQ2FtZWxpemUgYSBoeXBoZW4tZGVsaW1pdGVkIHN0cmluZy5cbiAqL1xudmFyIGNhbWVsaXplUkUgPSAvLShcXHcpL2c7XG52YXIgY2FtZWxpemUgPSBjYWNoZWQoZnVuY3Rpb24gKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgZnVuY3Rpb24gKF8sIGMpIHsgcmV0dXJuIGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJzsgfSlcbn0pO1xuXG4vKipcbiAqIENhcGl0YWxpemUgYSBzdHJpbmcuXG4gKi9cbnZhciBjYXBpdGFsaXplID0gY2FjaGVkKGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKVxufSk7XG5cbi8qKlxuICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAqL1xudmFyIGh5cGhlbmF0ZVJFID0gLyhbXi1dKShbQS1aXSkvZztcbnZhciBoeXBoZW5hdGUgPSBjYWNoZWQoZnVuY3Rpb24gKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoaHlwaGVuYXRlUkUsICckMS0kMicpXG4gICAgLnJlcGxhY2UoaHlwaGVuYXRlUkUsICckMS0kMicpXG4gICAgLnRvTG93ZXJDYXNlKClcbn0pO1xuXG4vKipcbiAqIFNpbXBsZSBiaW5kLCBmYXN0ZXIgdGhhbiBuYXRpdmVcbiAqL1xuZnVuY3Rpb24gYmluZCQxIChmbiwgY3R4KSB7XG4gIGZ1bmN0aW9uIGJvdW5kRm4gKGEpIHtcbiAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgcmV0dXJuIGxcbiAgICAgID8gbCA+IDFcbiAgICAgICAgPyBmbi5hcHBseShjdHgsIGFyZ3VtZW50cylcbiAgICAgICAgOiBmbi5jYWxsKGN0eCwgYSlcbiAgICAgIDogZm4uY2FsbChjdHgpXG4gIH1cbiAgLy8gcmVjb3JkIG9yaWdpbmFsIGZuIGxlbmd0aFxuICBib3VuZEZuLl9sZW5ndGggPSBmbi5sZW5ndGg7XG4gIHJldHVybiBib3VuZEZuXG59XG5cbi8qKlxuICogQ29udmVydCBhbiBBcnJheS1saWtlIG9iamVjdCB0byBhIHJlYWwgQXJyYXkuXG4gKi9cbmZ1bmN0aW9uIHRvQXJyYXkgKGxpc3QsIHN0YXJ0KSB7XG4gIHN0YXJ0ID0gc3RhcnQgfHwgMDtcbiAgdmFyIGkgPSBsaXN0Lmxlbmd0aCAtIHN0YXJ0O1xuICB2YXIgcmV0ID0gbmV3IEFycmF5KGkpO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgcmV0W2ldID0gbGlzdFtpICsgc3RhcnRdO1xuICB9XG4gIHJldHVybiByZXRcbn1cblxuLyoqXG4gKiBNaXggcHJvcGVydGllcyBpbnRvIHRhcmdldCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZCAodG8sIF9mcm9tKSB7XG4gIGZvciAodmFyIGtleSBpbiBfZnJvbSkge1xuICAgIHRvW2tleV0gPSBfZnJvbVtrZXldO1xuICB9XG4gIHJldHVybiB0b1xufVxuXG4vKipcbiAqIFF1aWNrIG9iamVjdCBjaGVjayAtIHRoaXMgaXMgcHJpbWFyaWx5IHVzZWQgdG8gdGVsbFxuICogT2JqZWN0cyBmcm9tIHByaW1pdGl2ZSB2YWx1ZXMgd2hlbiB3ZSBrbm93IHRoZSB2YWx1ZVxuICogaXMgYSBKU09OLWNvbXBsaWFudCB0eXBlLlxuICovXG5mdW5jdGlvbiBpc09iamVjdCAob2JqKSB7XG4gIHJldHVybiBvYmogIT09IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCdcbn1cblxuLyoqXG4gKiBTdHJpY3Qgb2JqZWN0IHR5cGUgY2hlY2suIE9ubHkgcmV0dXJucyB0cnVlXG4gKiBmb3IgcGxhaW4gSmF2YVNjcmlwdCBvYmplY3RzLlxuICovXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIE9CSkVDVF9TVFJJTkcgPSAnW29iamVjdCBPYmplY3RdJztcbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QgKG9iaikge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSBPQkpFQ1RfU1RSSU5HXG59XG5cbi8qKlxuICogTWVyZ2UgYW4gQXJyYXkgb2YgT2JqZWN0cyBpbnRvIGEgc2luZ2xlIE9iamVjdC5cbiAqL1xuZnVuY3Rpb24gdG9PYmplY3QgKGFycikge1xuICB2YXIgcmVzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFycltpXSkge1xuICAgICAgZXh0ZW5kKHJlcywgYXJyW2ldKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG4vKipcbiAqIFBlcmZvcm0gbm8gb3BlcmF0aW9uLlxuICovXG5mdW5jdGlvbiBub29wICgpIHt9XG5cbi8qKlxuICogQWx3YXlzIHJldHVybiBmYWxzZS5cbiAqL1xudmFyIG5vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH07XG5cbi8qKlxuICogUmV0dXJuIHNhbWUgdmFsdWVcbiAqL1xudmFyIGlkZW50aXR5ID0gZnVuY3Rpb24gKF8pIHsgcmV0dXJuIF87IH07XG5cbi8qKlxuICogR2VuZXJhdGUgYSBzdGF0aWMga2V5cyBzdHJpbmcgZnJvbSBjb21waWxlciBtb2R1bGVzLlxuICovXG5mdW5jdGlvbiBnZW5TdGF0aWNLZXlzIChtb2R1bGVzKSB7XG4gIHJldHVybiBtb2R1bGVzLnJlZHVjZShmdW5jdGlvbiAoa2V5cywgbSkge1xuICAgIHJldHVybiBrZXlzLmNvbmNhdChtLnN0YXRpY0tleXMgfHwgW10pXG4gIH0sIFtdKS5qb2luKCcsJylcbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0d28gdmFsdWVzIGFyZSBsb29zZWx5IGVxdWFsIC0gdGhhdCBpcyxcbiAqIGlmIHRoZXkgYXJlIHBsYWluIG9iamVjdHMsIGRvIHRoZXkgaGF2ZSB0aGUgc2FtZSBzaGFwZT9cbiAqL1xuZnVuY3Rpb24gbG9vc2VFcXVhbCAoYSwgYikge1xuICB2YXIgaXNPYmplY3RBID0gaXNPYmplY3QoYSk7XG4gIHZhciBpc09iamVjdEIgPSBpc09iamVjdChiKTtcbiAgaWYgKGlzT2JqZWN0QSAmJiBpc09iamVjdEIpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYSkgPT09IEpTT04uc3RyaW5naWZ5KGIpXG4gIH0gZWxzZSBpZiAoIWlzT2JqZWN0QSAmJiAhaXNPYmplY3RCKSB7XG4gICAgcmV0dXJuIFN0cmluZyhhKSA9PT0gU3RyaW5nKGIpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gbG9vc2VJbmRleE9mIChhcnIsIHZhbCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmIChsb29zZUVxdWFsKGFycltpXSwgdmFsKSkgeyByZXR1cm4gaSB9XG4gIH1cbiAgcmV0dXJuIC0xXG59XG5cbi8qICAqL1xuXG52YXIgY29uZmlnID0ge1xuICAvKipcbiAgICogT3B0aW9uIG1lcmdlIHN0cmF0ZWdpZXMgKHVzZWQgaW4gY29yZS91dGlsL29wdGlvbnMpXG4gICAqL1xuICBvcHRpb25NZXJnZVN0cmF0ZWdpZXM6IE9iamVjdC5jcmVhdGUobnVsbCksXG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gc3VwcHJlc3Mgd2FybmluZ3MuXG4gICAqL1xuICBzaWxlbnQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIGVuYWJsZSBkZXZ0b29sc1xuICAgKi9cbiAgZGV2dG9vbHM6IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsXG5cbiAgLyoqXG4gICAqIEVycm9yIGhhbmRsZXIgZm9yIHdhdGNoZXIgZXJyb3JzXG4gICAqL1xuICBlcnJvckhhbmRsZXI6IG51bGwsXG5cbiAgLyoqXG4gICAqIElnbm9yZSBjZXJ0YWluIGN1c3RvbSBlbGVtZW50c1xuICAgKi9cbiAgaWdub3JlZEVsZW1lbnRzOiBbXSxcblxuICAvKipcbiAgICogQ3VzdG9tIHVzZXIga2V5IGFsaWFzZXMgZm9yIHYtb25cbiAgICovXG4gIGtleUNvZGVzOiBPYmplY3QuY3JlYXRlKG51bGwpLFxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIHRhZyBpcyByZXNlcnZlZCBzbyB0aGF0IGl0IGNhbm5vdCBiZSByZWdpc3RlcmVkIGFzIGFcbiAgICogY29tcG9uZW50LiBUaGlzIGlzIHBsYXRmb3JtLWRlcGVuZGVudCBhbmQgbWF5IGJlIG92ZXJ3cml0dGVuLlxuICAgKi9cbiAgaXNSZXNlcnZlZFRhZzogbm8sXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGEgdGFnIGlzIGFuIHVua25vd24gZWxlbWVudC5cbiAgICogUGxhdGZvcm0tZGVwZW5kZW50LlxuICAgKi9cbiAgaXNVbmtub3duRWxlbWVudDogbm8sXG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbmFtZXNwYWNlIG9mIGFuIGVsZW1lbnRcbiAgICovXG4gIGdldFRhZ05hbWVzcGFjZTogbm9vcCxcblxuICAvKipcbiAgICogUGFyc2UgdGhlIHJlYWwgdGFnIG5hbWUgZm9yIHRoZSBzcGVjaWZpYyBwbGF0Zm9ybS5cbiAgICovXG4gIHBhcnNlUGxhdGZvcm1UYWdOYW1lOiBpZGVudGl0eSxcblxuICAvKipcbiAgICogQ2hlY2sgaWYgYW4gYXR0cmlidXRlIG11c3QgYmUgYm91bmQgdXNpbmcgcHJvcGVydHksIGUuZy4gdmFsdWVcbiAgICogUGxhdGZvcm0tZGVwZW5kZW50LlxuICAgKi9cbiAgbXVzdFVzZVByb3A6IG5vLFxuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGFzc2V0IHR5cGVzIHRoYXQgYSBjb21wb25lbnQgY2FuIG93bi5cbiAgICovXG4gIF9hc3NldFR5cGVzOiBbXG4gICAgJ2NvbXBvbmVudCcsXG4gICAgJ2RpcmVjdGl2ZScsXG4gICAgJ2ZpbHRlcidcbiAgXSxcblxuICAvKipcbiAgICogTGlzdCBvZiBsaWZlY3ljbGUgaG9va3MuXG4gICAqL1xuICBfbGlmZWN5Y2xlSG9va3M6IFtcbiAgICAnYmVmb3JlQ3JlYXRlJyxcbiAgICAnY3JlYXRlZCcsXG4gICAgJ2JlZm9yZU1vdW50JyxcbiAgICAnbW91bnRlZCcsXG4gICAgJ2JlZm9yZVVwZGF0ZScsXG4gICAgJ3VwZGF0ZWQnLFxuICAgICdiZWZvcmVEZXN0cm95JyxcbiAgICAnZGVzdHJveWVkJyxcbiAgICAnYWN0aXZhdGVkJyxcbiAgICAnZGVhY3RpdmF0ZWQnXG4gIF0sXG5cbiAgLyoqXG4gICAqIE1heCBjaXJjdWxhciB1cGRhdGVzIGFsbG93ZWQgaW4gYSBzY2hlZHVsZXIgZmx1c2ggY3ljbGUuXG4gICAqL1xuICBfbWF4VXBkYXRlQ291bnQ6IDEwMFxufTtcblxuLyogICovXG5cbi8qKlxuICogQ2hlY2sgaWYgYSBzdHJpbmcgc3RhcnRzIHdpdGggJCBvciBfXG4gKi9cbmZ1bmN0aW9uIGlzUmVzZXJ2ZWQgKHN0cikge1xuICB2YXIgYyA9IChzdHIgKyAnJykuY2hhckNvZGVBdCgwKTtcbiAgcmV0dXJuIGMgPT09IDB4MjQgfHwgYyA9PT0gMHg1RlxufVxuXG4vKipcbiAqIERlZmluZSBhIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBkZWYgKG9iaiwga2V5LCB2YWwsIGVudW1lcmFibGUpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgdmFsdWU6IHZhbCxcbiAgICBlbnVtZXJhYmxlOiAhIWVudW1lcmFibGUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xufVxuXG4vKipcbiAqIFBhcnNlIHNpbXBsZSBwYXRoLlxuICovXG52YXIgYmFpbFJFID0gL1teXFx3LiRdLztcbmZ1bmN0aW9uIHBhcnNlUGF0aCAocGF0aCkge1xuICBpZiAoYmFpbFJFLnRlc3QocGF0aCkpIHtcbiAgICByZXR1cm5cbiAgfSBlbHNlIHtcbiAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcuJyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VnbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCFvYmopIHsgcmV0dXJuIH1cbiAgICAgICAgb2JqID0gb2JqW3NlZ21lbnRzW2ldXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmpcbiAgICB9XG4gIH1cbn1cblxuLyogICovXG4vKiBnbG9iYWxzIE11dGF0aW9uT2JzZXJ2ZXIgKi9cblxuLy8gY2FuIHdlIHVzZSBfX3Byb3RvX18/XG52YXIgaGFzUHJvdG8gPSAnX19wcm90b19fJyBpbiB7fTtcblxuLy8gQnJvd3NlciBlbnZpcm9ubWVudCBzbmlmZmluZ1xudmFyIGluQnJvd3NlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xudmFyIFVBID0gaW5Ccm93c2VyICYmIHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7XG52YXIgaXNJRSA9IFVBICYmIC9tc2llfHRyaWRlbnQvLnRlc3QoVUEpO1xudmFyIGlzSUU5ID0gVUEgJiYgVUEuaW5kZXhPZignbXNpZSA5LjAnKSA+IDA7XG52YXIgaXNFZGdlID0gVUEgJiYgVUEuaW5kZXhPZignZWRnZS8nKSA+IDA7XG52YXIgaXNBbmRyb2lkID0gVUEgJiYgVUEuaW5kZXhPZignYW5kcm9pZCcpID4gMDtcbnZhciBpc0lPUyA9IFVBICYmIC9pcGhvbmV8aXBhZHxpcG9kfGlvcy8udGVzdChVQSk7XG5cbi8vIHRoaXMgbmVlZHMgdG8gYmUgbGF6eS1ldmFsZWQgYmVjYXVzZSB2dWUgbWF5IGJlIHJlcXVpcmVkIGJlZm9yZVxuLy8gdnVlLXNlcnZlci1yZW5kZXJlciBjYW4gc2V0IFZVRV9FTlZcbnZhciBfaXNTZXJ2ZXI7XG52YXIgaXNTZXJ2ZXJSZW5kZXJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChfaXNTZXJ2ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghaW5Ccm93c2VyICYmIHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBkZXRlY3QgcHJlc2VuY2Ugb2YgdnVlLXNlcnZlci1yZW5kZXJlciBhbmQgYXZvaWRcbiAgICAgIC8vIFdlYnBhY2sgc2hpbW1pbmcgdGhlIHByb2Nlc3NcbiAgICAgIF9pc1NlcnZlciA9IGdsb2JhbFsncHJvY2VzcyddLmVudi5WVUVfRU5WID09PSAnc2VydmVyJztcbiAgICB9IGVsc2Uge1xuICAgICAgX2lzU2VydmVyID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiBfaXNTZXJ2ZXJcbn07XG5cbi8vIGRldGVjdCBkZXZ0b29sc1xudmFyIGRldnRvb2xzID0gaW5Ccm93c2VyICYmIHdpbmRvdy5fX1ZVRV9ERVZUT09MU19HTE9CQUxfSE9PS19fO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuZnVuY3Rpb24gaXNOYXRpdmUgKEN0b3IpIHtcbiAgcmV0dXJuIC9uYXRpdmUgY29kZS8udGVzdChDdG9yLnRvU3RyaW5nKCkpXG59XG5cbi8qKlxuICogRGVmZXIgYSB0YXNrIHRvIGV4ZWN1dGUgaXQgYXN5bmNocm9ub3VzbHkuXG4gKi9cbnZhciBuZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBjYWxsYmFja3MgPSBbXTtcbiAgdmFyIHBlbmRpbmcgPSBmYWxzZTtcbiAgdmFyIHRpbWVyRnVuYztcblxuICBmdW5jdGlvbiBuZXh0VGlja0hhbmRsZXIgKCkge1xuICAgIHBlbmRpbmcgPSBmYWxzZTtcbiAgICB2YXIgY29waWVzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29waWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb3BpZXNbaV0oKTtcbiAgICB9XG4gIH1cblxuICAvLyB0aGUgbmV4dFRpY2sgYmVoYXZpb3IgbGV2ZXJhZ2VzIHRoZSBtaWNyb3Rhc2sgcXVldWUsIHdoaWNoIGNhbiBiZSBhY2Nlc3NlZFxuICAvLyB2aWEgZWl0aGVyIG5hdGl2ZSBQcm9taXNlLnRoZW4gb3IgTXV0YXRpb25PYnNlcnZlci5cbiAgLy8gTXV0YXRpb25PYnNlcnZlciBoYXMgd2lkZXIgc3VwcG9ydCwgaG93ZXZlciBpdCBpcyBzZXJpb3VzbHkgYnVnZ2VkIGluXG4gIC8vIFVJV2ViVmlldyBpbiBpT1MgPj0gOS4zLjMgd2hlbiB0cmlnZ2VyZWQgaW4gdG91Y2ggZXZlbnQgaGFuZGxlcnMuIEl0XG4gIC8vIGNvbXBsZXRlbHkgc3RvcHMgd29ya2luZyBhZnRlciB0cmlnZ2VyaW5nIGEgZmV3IHRpbWVzLi4uIHNvLCBpZiBuYXRpdmVcbiAgLy8gUHJvbWlzZSBpcyBhdmFpbGFibGUsIHdlIHdpbGwgdXNlIGl0OlxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKHR5cGVvZiBQcm9taXNlICE9PSAndW5kZWZpbmVkJyAmJiBpc05hdGl2ZShQcm9taXNlKSkge1xuICAgIHZhciBwID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgdmFyIGxvZ0Vycm9yID0gZnVuY3Rpb24gKGVycikgeyBjb25zb2xlLmVycm9yKGVycik7IH07XG4gICAgdGltZXJGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgcC50aGVuKG5leHRUaWNrSGFuZGxlcikuY2F0Y2gobG9nRXJyb3IpO1xuICAgICAgLy8gaW4gcHJvYmxlbWF0aWMgVUlXZWJWaWV3cywgUHJvbWlzZS50aGVuIGRvZXNuJ3QgY29tcGxldGVseSBicmVhaywgYnV0XG4gICAgICAvLyBpdCBjYW4gZ2V0IHN0dWNrIGluIGEgd2VpcmQgc3RhdGUgd2hlcmUgY2FsbGJhY2tzIGFyZSBwdXNoZWQgaW50byB0aGVcbiAgICAgIC8vIG1pY3JvdGFzayBxdWV1ZSBidXQgdGhlIHF1ZXVlIGlzbid0IGJlaW5nIGZsdXNoZWQsIHVudGlsIHRoZSBicm93c2VyXG4gICAgICAvLyBuZWVkcyB0byBkbyBzb21lIG90aGVyIHdvcmssIGUuZy4gaGFuZGxlIGEgdGltZXIuIFRoZXJlZm9yZSB3ZSBjYW5cbiAgICAgIC8vIFwiZm9yY2VcIiB0aGUgbWljcm90YXNrIHF1ZXVlIHRvIGJlIGZsdXNoZWQgYnkgYWRkaW5nIGFuIGVtcHR5IHRpbWVyLlxuICAgICAgaWYgKGlzSU9TKSB7IHNldFRpbWVvdXQobm9vcCk7IH1cbiAgICB9O1xuICB9IGVsc2UgaWYgKHR5cGVvZiBNdXRhdGlvbk9ic2VydmVyICE9PSAndW5kZWZpbmVkJyAmJiAoXG4gICAgaXNOYXRpdmUoTXV0YXRpb25PYnNlcnZlcikgfHxcbiAgICAvLyBQaGFudG9tSlMgYW5kIGlPUyA3LnhcbiAgICBNdXRhdGlvbk9ic2VydmVyLnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IE11dGF0aW9uT2JzZXJ2ZXJDb25zdHJ1Y3Rvcl0nXG4gICkpIHtcbiAgICAvLyB1c2UgTXV0YXRpb25PYnNlcnZlciB3aGVyZSBuYXRpdmUgUHJvbWlzZSBpcyBub3QgYXZhaWxhYmxlLFxuICAgIC8vIGUuZy4gUGhhbnRvbUpTIElFMTEsIGlPUzcsIEFuZHJvaWQgNC40XG4gICAgdmFyIGNvdW50ZXIgPSAxO1xuICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKG5leHRUaWNrSGFuZGxlcik7XG4gICAgdmFyIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoU3RyaW5nKGNvdW50ZXIpKTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKHRleHROb2RlLCB7XG4gICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG4gICAgfSk7XG4gICAgdGltZXJGdW5jID0gZnVuY3Rpb24gKCkge1xuICAgICAgY291bnRlciA9IChjb3VudGVyICsgMSkgJSAyO1xuICAgICAgdGV4dE5vZGUuZGF0YSA9IFN0cmluZyhjb3VudGVyKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8vIGZhbGxiYWNrIHRvIHNldFRpbWVvdXRcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHRpbWVyRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldFRpbWVvdXQobmV4dFRpY2tIYW5kbGVyLCAwKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIHF1ZXVlTmV4dFRpY2sgKGNiLCBjdHgpIHtcbiAgICB2YXIgX3Jlc29sdmU7XG4gICAgY2FsbGJhY2tzLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGNiKSB7IGNiLmNhbGwoY3R4KTsgfVxuICAgICAgaWYgKF9yZXNvbHZlKSB7IF9yZXNvbHZlKGN0eCk7IH1cbiAgICB9KTtcbiAgICBpZiAoIXBlbmRpbmcpIHtcbiAgICAgIHBlbmRpbmcgPSB0cnVlO1xuICAgICAgdGltZXJGdW5jKCk7XG4gICAgfVxuICAgIGlmICghY2IgJiYgdHlwZW9mIFByb21pc2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgX3Jlc29sdmUgPSByZXNvbHZlO1xuICAgICAgfSlcbiAgICB9XG4gIH1cbn0pKCk7XG5cbnZhciBfU2V0O1xuLyogaXN0YW5idWwgaWdub3JlIGlmICovXG5pZiAodHlwZW9mIFNldCAhPT0gJ3VuZGVmaW5lZCcgJiYgaXNOYXRpdmUoU2V0KSkge1xuICAvLyB1c2UgbmF0aXZlIFNldCB3aGVuIGF2YWlsYWJsZS5cbiAgX1NldCA9IFNldDtcbn0gZWxzZSB7XG4gIC8vIGEgbm9uLXN0YW5kYXJkIFNldCBwb2x5ZmlsbCB0aGF0IG9ubHkgd29ya3Mgd2l0aCBwcmltaXRpdmUga2V5cy5cbiAgX1NldCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2V0ICgpIHtcbiAgICAgIHRoaXMuc2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9XG4gICAgU2V0LnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiBoYXMgKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2V0W2tleV0gPT09IHRydWVcbiAgICB9O1xuICAgIFNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkIChrZXkpIHtcbiAgICAgIHRoaXMuc2V0W2tleV0gPSB0cnVlO1xuICAgIH07XG4gICAgU2V0LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIGNsZWFyICgpIHtcbiAgICAgIHRoaXMuc2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFNldDtcbiAgfSgpKTtcbn1cblxudmFyIHdhcm4gPSBub29wO1xudmFyIGZvcm1hdENvbXBvbmVudE5hbWU7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHZhciBoYXNDb25zb2xlID0gdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnO1xuXG4gIHdhcm4gPSBmdW5jdGlvbiAobXNnLCB2bSkge1xuICAgIGlmIChoYXNDb25zb2xlICYmICghY29uZmlnLnNpbGVudCkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJbVnVlIHdhcm5dOiBcIiArIG1zZyArIFwiIFwiICsgKFxuICAgICAgICB2bSA/IGZvcm1hdExvY2F0aW9uKGZvcm1hdENvbXBvbmVudE5hbWUodm0pKSA6ICcnXG4gICAgICApKTtcbiAgICB9XG4gIH07XG5cbiAgZm9ybWF0Q29tcG9uZW50TmFtZSA9IGZ1bmN0aW9uICh2bSkge1xuICAgIGlmICh2bS4kcm9vdCA9PT0gdm0pIHtcbiAgICAgIHJldHVybiAncm9vdCBpbnN0YW5jZSdcbiAgICB9XG4gICAgdmFyIG5hbWUgPSB2bS5faXNWdWVcbiAgICAgID8gdm0uJG9wdGlvbnMubmFtZSB8fCB2bS4kb3B0aW9ucy5fY29tcG9uZW50VGFnXG4gICAgICA6IHZtLm5hbWU7XG4gICAgcmV0dXJuIChcbiAgICAgIChuYW1lID8gKFwiY29tcG9uZW50IDxcIiArIG5hbWUgKyBcIj5cIikgOiBcImFub255bW91cyBjb21wb25lbnRcIikgK1xuICAgICAgKHZtLl9pc1Z1ZSAmJiB2bS4kb3B0aW9ucy5fX2ZpbGUgPyAoXCIgYXQgXCIgKyAodm0uJG9wdGlvbnMuX19maWxlKSkgOiAnJylcbiAgICApXG4gIH07XG5cbiAgdmFyIGZvcm1hdExvY2F0aW9uID0gZnVuY3Rpb24gKHN0cikge1xuICAgIGlmIChzdHIgPT09ICdhbm9ueW1vdXMgY29tcG9uZW50Jykge1xuICAgICAgc3RyICs9IFwiIC0gdXNlIHRoZSBcXFwibmFtZVxcXCIgb3B0aW9uIGZvciBiZXR0ZXIgZGVidWdnaW5nIG1lc3NhZ2VzLlwiO1xuICAgIH1cbiAgICByZXR1cm4gKFwiXFxuKGZvdW5kIGluIFwiICsgc3RyICsgXCIpXCIpXG4gIH07XG59XG5cbi8qICAqL1xuXG5cbnZhciB1aWQkMSA9IDA7XG5cbi8qKlxuICogQSBkZXAgaXMgYW4gb2JzZXJ2YWJsZSB0aGF0IGNhbiBoYXZlIG11bHRpcGxlXG4gKiBkaXJlY3RpdmVzIHN1YnNjcmliaW5nIHRvIGl0LlxuICovXG52YXIgRGVwID0gZnVuY3Rpb24gRGVwICgpIHtcbiAgdGhpcy5pZCA9IHVpZCQxKys7XG4gIHRoaXMuc3VicyA9IFtdO1xufTtcblxuRGVwLnByb3RvdHlwZS5hZGRTdWIgPSBmdW5jdGlvbiBhZGRTdWIgKHN1Yikge1xuICB0aGlzLnN1YnMucHVzaChzdWIpO1xufTtcblxuRGVwLnByb3RvdHlwZS5yZW1vdmVTdWIgPSBmdW5jdGlvbiByZW1vdmVTdWIgKHN1Yikge1xuICByZW1vdmUkMSh0aGlzLnN1YnMsIHN1Yik7XG59O1xuXG5EZXAucHJvdG90eXBlLmRlcGVuZCA9IGZ1bmN0aW9uIGRlcGVuZCAoKSB7XG4gIGlmIChEZXAudGFyZ2V0KSB7XG4gICAgRGVwLnRhcmdldC5hZGREZXAodGhpcyk7XG4gIH1cbn07XG5cbkRlcC5wcm90b3R5cGUubm90aWZ5ID0gZnVuY3Rpb24gbm90aWZ5ICgpIHtcbiAgLy8gc3RhYmxpemUgdGhlIHN1YnNjcmliZXIgbGlzdCBmaXJzdFxuICB2YXIgc3VicyA9IHRoaXMuc3Vicy5zbGljZSgpO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHN1YnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgc3Vic1tpXS51cGRhdGUoKTtcbiAgfVxufTtcblxuLy8gdGhlIGN1cnJlbnQgdGFyZ2V0IHdhdGNoZXIgYmVpbmcgZXZhbHVhdGVkLlxuLy8gdGhpcyBpcyBnbG9iYWxseSB1bmlxdWUgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvbmx5IG9uZVxuLy8gd2F0Y2hlciBiZWluZyBldmFsdWF0ZWQgYXQgYW55IHRpbWUuXG5EZXAudGFyZ2V0ID0gbnVsbDtcbnZhciB0YXJnZXRTdGFjayA9IFtdO1xuXG5mdW5jdGlvbiBwdXNoVGFyZ2V0IChfdGFyZ2V0KSB7XG4gIGlmIChEZXAudGFyZ2V0KSB7IHRhcmdldFN0YWNrLnB1c2goRGVwLnRhcmdldCk7IH1cbiAgRGVwLnRhcmdldCA9IF90YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIHBvcFRhcmdldCAoKSB7XG4gIERlcC50YXJnZXQgPSB0YXJnZXRTdGFjay5wb3AoKTtcbn1cblxuLypcbiAqIG5vdCB0eXBlIGNoZWNraW5nIHRoaXMgZmlsZSBiZWNhdXNlIGZsb3cgZG9lc24ndCBwbGF5IHdlbGwgd2l0aFxuICogZHluYW1pY2FsbHkgYWNjZXNzaW5nIG1ldGhvZHMgb24gQXJyYXkgcHJvdG90eXBlXG4gKi9cblxudmFyIGFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG52YXIgYXJyYXlNZXRob2RzID0gT2JqZWN0LmNyZWF0ZShhcnJheVByb3RvKTtbXG4gICdwdXNoJyxcbiAgJ3BvcCcsXG4gICdzaGlmdCcsXG4gICd1bnNoaWZ0JyxcbiAgJ3NwbGljZScsXG4gICdzb3J0JyxcbiAgJ3JldmVyc2UnXG5dXG4uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7XG4gIC8vIGNhY2hlIG9yaWdpbmFsIG1ldGhvZFxuICB2YXIgb3JpZ2luYWwgPSBhcnJheVByb3RvW21ldGhvZF07XG4gIGRlZihhcnJheU1ldGhvZHMsIG1ldGhvZCwgZnVuY3Rpb24gbXV0YXRvciAoKSB7XG4gICAgdmFyIGFyZ3VtZW50cyQxID0gYXJndW1lbnRzO1xuXG4gICAgLy8gYXZvaWQgbGVha2luZyBhcmd1bWVudHM6XG4gICAgLy8gaHR0cDovL2pzcGVyZi5jb20vY2xvc3VyZS13aXRoLWFyZ3VtZW50c1xuICAgIHZhciBpID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShpKTtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzJDFbaV07XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB2YXIgb2IgPSB0aGlzLl9fb2JfXztcbiAgICB2YXIgaW5zZXJ0ZWQ7XG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2UgJ3B1c2gnOlxuICAgICAgICBpbnNlcnRlZCA9IGFyZ3M7XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICd1bnNoaWZ0JzpcbiAgICAgICAgaW5zZXJ0ZWQgPSBhcmdzO1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnc3BsaWNlJzpcbiAgICAgICAgaW5zZXJ0ZWQgPSBhcmdzLnNsaWNlKDIpO1xuICAgICAgICBicmVha1xuICAgIH1cbiAgICBpZiAoaW5zZXJ0ZWQpIHsgb2Iub2JzZXJ2ZUFycmF5KGluc2VydGVkKTsgfVxuICAgIC8vIG5vdGlmeSBjaGFuZ2VcbiAgICBvYi5kZXAubm90aWZ5KCk7XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9KTtcbn0pO1xuXG4vKiAgKi9cblxudmFyIGFycmF5S2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFycmF5TWV0aG9kcyk7XG5cbi8qKlxuICogQnkgZGVmYXVsdCwgd2hlbiBhIHJlYWN0aXZlIHByb3BlcnR5IGlzIHNldCwgdGhlIG5ldyB2YWx1ZSBpc1xuICogYWxzbyBjb252ZXJ0ZWQgdG8gYmVjb21lIHJlYWN0aXZlLiBIb3dldmVyIHdoZW4gcGFzc2luZyBkb3duIHByb3BzLFxuICogd2UgZG9uJ3Qgd2FudCB0byBmb3JjZSBjb252ZXJzaW9uIGJlY2F1c2UgdGhlIHZhbHVlIG1heSBiZSBhIG5lc3RlZCB2YWx1ZVxuICogdW5kZXIgYSBmcm96ZW4gZGF0YSBzdHJ1Y3R1cmUuIENvbnZlcnRpbmcgaXQgd291bGQgZGVmZWF0IHRoZSBvcHRpbWl6YXRpb24uXG4gKi9cbnZhciBvYnNlcnZlclN0YXRlID0ge1xuICBzaG91bGRDb252ZXJ0OiB0cnVlLFxuICBpc1NldHRpbmdQcm9wczogZmFsc2Vcbn07XG5cbi8qKlxuICogT2JzZXJ2ZXIgY2xhc3MgdGhhdCBhcmUgYXR0YWNoZWQgdG8gZWFjaCBvYnNlcnZlZFxuICogb2JqZWN0LiBPbmNlIGF0dGFjaGVkLCB0aGUgb2JzZXJ2ZXIgY29udmVydHMgdGFyZ2V0XG4gKiBvYmplY3QncyBwcm9wZXJ0eSBrZXlzIGludG8gZ2V0dGVyL3NldHRlcnMgdGhhdFxuICogY29sbGVjdCBkZXBlbmRlbmNpZXMgYW5kIGRpc3BhdGNoZXMgdXBkYXRlcy5cbiAqL1xudmFyIE9ic2VydmVyID0gZnVuY3Rpb24gT2JzZXJ2ZXIgKHZhbHVlKSB7XG4gIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgdGhpcy5kZXAgPSBuZXcgRGVwKCk7XG4gIHRoaXMudm1Db3VudCA9IDA7XG4gIGRlZih2YWx1ZSwgJ19fb2JfXycsIHRoaXMpO1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB2YXIgYXVnbWVudCA9IGhhc1Byb3RvXG4gICAgICA/IHByb3RvQXVnbWVudFxuICAgICAgOiBjb3B5QXVnbWVudDtcbiAgICBhdWdtZW50KHZhbHVlLCBhcnJheU1ldGhvZHMsIGFycmF5S2V5cyk7XG4gICAgdGhpcy5vYnNlcnZlQXJyYXkodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMud2Fsayh2YWx1ZSk7XG4gIH1cbn07XG5cbi8qKlxuICogV2FsayB0aHJvdWdoIGVhY2ggcHJvcGVydHkgYW5kIGNvbnZlcnQgdGhlbSBpbnRvXG4gKiBnZXR0ZXIvc2V0dGVycy4gVGhpcyBtZXRob2Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdoZW5cbiAqIHZhbHVlIHR5cGUgaXMgT2JqZWN0LlxuICovXG5PYnNlcnZlci5wcm90b3R5cGUud2FsayA9IGZ1bmN0aW9uIHdhbGsgKG9iaikge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iaik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGRlZmluZVJlYWN0aXZlJCQxKG9iaiwga2V5c1tpXSwgb2JqW2tleXNbaV1dKTtcbiAgfVxufTtcblxuLyoqXG4gKiBPYnNlcnZlIGEgbGlzdCBvZiBBcnJheSBpdGVtcy5cbiAqL1xuT2JzZXJ2ZXIucHJvdG90eXBlLm9ic2VydmVBcnJheSA9IGZ1bmN0aW9uIG9ic2VydmVBcnJheSAoaXRlbXMpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBpdGVtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBvYnNlcnZlKGl0ZW1zW2ldKTtcbiAgfVxufTtcblxuLy8gaGVscGVyc1xuXG4vKipcbiAqIEF1Z21lbnQgYW4gdGFyZ2V0IE9iamVjdCBvciBBcnJheSBieSBpbnRlcmNlcHRpbmdcbiAqIHRoZSBwcm90b3R5cGUgY2hhaW4gdXNpbmcgX19wcm90b19fXG4gKi9cbmZ1bmN0aW9uIHByb3RvQXVnbWVudCAodGFyZ2V0LCBzcmMpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbiAgdGFyZ2V0Ll9fcHJvdG9fXyA9IHNyYztcbiAgLyogZXNsaW50LWVuYWJsZSBuby1wcm90byAqL1xufVxuXG4vKipcbiAqIEF1Z21lbnQgYW4gdGFyZ2V0IE9iamVjdCBvciBBcnJheSBieSBkZWZpbmluZ1xuICogaGlkZGVuIHByb3BlcnRpZXMuXG4gKi9cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5mdW5jdGlvbiBjb3B5QXVnbWVudCAodGFyZ2V0LCBzcmMsIGtleXMpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIGRlZih0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICB9XG59XG5cbi8qKlxuICogQXR0ZW1wdCB0byBjcmVhdGUgYW4gb2JzZXJ2ZXIgaW5zdGFuY2UgZm9yIGEgdmFsdWUsXG4gKiByZXR1cm5zIHRoZSBuZXcgb2JzZXJ2ZXIgaWYgc3VjY2Vzc2Z1bGx5IG9ic2VydmVkLFxuICogb3IgdGhlIGV4aXN0aW5nIG9ic2VydmVyIGlmIHRoZSB2YWx1ZSBhbHJlYWR5IGhhcyBvbmUuXG4gKi9cbmZ1bmN0aW9uIG9ic2VydmUgKHZhbHVlLCBhc1Jvb3REYXRhKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIG9iO1xuICBpZiAoaGFzT3duKHZhbHVlLCAnX19vYl9fJykgJiYgdmFsdWUuX19vYl9fIGluc3RhbmNlb2YgT2JzZXJ2ZXIpIHtcbiAgICBvYiA9IHZhbHVlLl9fb2JfXztcbiAgfSBlbHNlIGlmIChcbiAgICBvYnNlcnZlclN0YXRlLnNob3VsZENvbnZlcnQgJiZcbiAgICAhaXNTZXJ2ZXJSZW5kZXJpbmcoKSAmJlxuICAgIChBcnJheS5pc0FycmF5KHZhbHVlKSB8fCBpc1BsYWluT2JqZWN0KHZhbHVlKSkgJiZcbiAgICBPYmplY3QuaXNFeHRlbnNpYmxlKHZhbHVlKSAmJlxuICAgICF2YWx1ZS5faXNWdWVcbiAgKSB7XG4gICAgb2IgPSBuZXcgT2JzZXJ2ZXIodmFsdWUpO1xuICB9XG4gIGlmIChhc1Jvb3REYXRhICYmIG9iKSB7XG4gICAgb2Iudm1Db3VudCsrO1xuICB9XG4gIHJldHVybiBvYlxufVxuXG4vKipcbiAqIERlZmluZSBhIHJlYWN0aXZlIHByb3BlcnR5IG9uIGFuIE9iamVjdC5cbiAqL1xuZnVuY3Rpb24gZGVmaW5lUmVhY3RpdmUkJDEgKFxuICBvYmosXG4gIGtleSxcbiAgdmFsLFxuICBjdXN0b21TZXR0ZXJcbikge1xuICB2YXIgZGVwID0gbmV3IERlcCgpO1xuXG4gIHZhciBwcm9wZXJ0eSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpO1xuICBpZiAocHJvcGVydHkgJiYgcHJvcGVydHkuY29uZmlndXJhYmxlID09PSBmYWxzZSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgLy8gY2F0ZXIgZm9yIHByZS1kZWZpbmVkIGdldHRlci9zZXR0ZXJzXG4gIHZhciBnZXR0ZXIgPSBwcm9wZXJ0eSAmJiBwcm9wZXJ0eS5nZXQ7XG4gIHZhciBzZXR0ZXIgPSBwcm9wZXJ0eSAmJiBwcm9wZXJ0eS5zZXQ7XG5cbiAgdmFyIGNoaWxkT2IgPSBvYnNlcnZlKHZhbCk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gcmVhY3RpdmVHZXR0ZXIgKCkge1xuICAgICAgdmFyIHZhbHVlID0gZ2V0dGVyID8gZ2V0dGVyLmNhbGwob2JqKSA6IHZhbDtcbiAgICAgIGlmIChEZXAudGFyZ2V0KSB7XG4gICAgICAgIGRlcC5kZXBlbmQoKTtcbiAgICAgICAgaWYgKGNoaWxkT2IpIHtcbiAgICAgICAgICBjaGlsZE9iLmRlcC5kZXBlbmQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICBkZXBlbmRBcnJheSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiByZWFjdGl2ZVNldHRlciAobmV3VmFsKSB7XG4gICAgICB2YXIgdmFsdWUgPSBnZXR0ZXIgPyBnZXR0ZXIuY2FsbChvYmopIDogdmFsO1xuICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tc2VsZi1jb21wYXJlICovXG4gICAgICBpZiAobmV3VmFsID09PSB2YWx1ZSB8fCAobmV3VmFsICE9PSBuZXdWYWwgJiYgdmFsdWUgIT09IHZhbHVlKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tc2VsZi1jb21wYXJlICovXG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBjdXN0b21TZXR0ZXIpIHtcbiAgICAgICAgY3VzdG9tU2V0dGVyKCk7XG4gICAgICB9XG4gICAgICBpZiAoc2V0dGVyKSB7XG4gICAgICAgIHNldHRlci5jYWxsKG9iaiwgbmV3VmFsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IG5ld1ZhbDtcbiAgICAgIH1cbiAgICAgIGNoaWxkT2IgPSBvYnNlcnZlKG5ld1ZhbCk7XG4gICAgICBkZXAubm90aWZ5KCk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBTZXQgYSBwcm9wZXJ0eSBvbiBhbiBvYmplY3QuIEFkZHMgdGhlIG5ldyBwcm9wZXJ0eSBhbmRcbiAqIHRyaWdnZXJzIGNoYW5nZSBub3RpZmljYXRpb24gaWYgdGhlIHByb3BlcnR5IGRvZXNuJ3RcbiAqIGFscmVhZHkgZXhpc3QuXG4gKi9cbmZ1bmN0aW9uIHNldCQxIChvYmosIGtleSwgdmFsKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcbiAgICBvYmoubGVuZ3RoID0gTWF0aC5tYXgob2JqLmxlbmd0aCwga2V5KTtcbiAgICBvYmouc3BsaWNlKGtleSwgMSwgdmFsKTtcbiAgICByZXR1cm4gdmFsXG4gIH1cbiAgaWYgKGhhc093bihvYmosIGtleSkpIHtcbiAgICBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIgb2IgPSBvYmouX19vYl9fO1xuICBpZiAob2JqLl9pc1Z1ZSB8fCAob2IgJiYgb2Iudm1Db3VudCkpIHtcbiAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oXG4gICAgICAnQXZvaWQgYWRkaW5nIHJlYWN0aXZlIHByb3BlcnRpZXMgdG8gYSBWdWUgaW5zdGFuY2Ugb3IgaXRzIHJvb3QgJGRhdGEgJyArXG4gICAgICAnYXQgcnVudGltZSAtIGRlY2xhcmUgaXQgdXBmcm9udCBpbiB0aGUgZGF0YSBvcHRpb24uJ1xuICAgICk7XG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKCFvYikge1xuICAgIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVyblxuICB9XG4gIGRlZmluZVJlYWN0aXZlJCQxKG9iLnZhbHVlLCBrZXksIHZhbCk7XG4gIG9iLmRlcC5ub3RpZnkoKTtcbiAgcmV0dXJuIHZhbFxufVxuXG4vKipcbiAqIERlbGV0ZSBhIHByb3BlcnR5IGFuZCB0cmlnZ2VyIGNoYW5nZSBpZiBuZWNlc3NhcnkuXG4gKi9cbmZ1bmN0aW9uIGRlbCAob2JqLCBrZXkpIHtcbiAgdmFyIG9iID0gb2JqLl9fb2JfXztcbiAgaWYgKG9iai5faXNWdWUgfHwgKG9iICYmIG9iLnZtQ291bnQpKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgJ0F2b2lkIGRlbGV0aW5nIHByb3BlcnRpZXMgb24gYSBWdWUgaW5zdGFuY2Ugb3IgaXRzIHJvb3QgJGRhdGEgJyArXG4gICAgICAnLSBqdXN0IHNldCBpdCB0byBudWxsLidcbiAgICApO1xuICAgIHJldHVyblxuICB9XG4gIGlmICghaGFzT3duKG9iaiwga2V5KSkge1xuICAgIHJldHVyblxuICB9XG4gIGRlbGV0ZSBvYmpba2V5XTtcbiAgaWYgKCFvYikge1xuICAgIHJldHVyblxuICB9XG4gIG9iLmRlcC5ub3RpZnkoKTtcbn1cblxuLyoqXG4gKiBDb2xsZWN0IGRlcGVuZGVuY2llcyBvbiBhcnJheSBlbGVtZW50cyB3aGVuIHRoZSBhcnJheSBpcyB0b3VjaGVkLCBzaW5jZVxuICogd2UgY2Fubm90IGludGVyY2VwdCBhcnJheSBlbGVtZW50IGFjY2VzcyBsaWtlIHByb3BlcnR5IGdldHRlcnMuXG4gKi9cbmZ1bmN0aW9uIGRlcGVuZEFycmF5ICh2YWx1ZSkge1xuICBmb3IgKHZhciBlID0gKHZvaWQgMCksIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZSA9IHZhbHVlW2ldO1xuICAgIGUgJiYgZS5fX29iX18gJiYgZS5fX29iX18uZGVwLmRlcGVuZCgpO1xuICAgIGlmIChBcnJheS5pc0FycmF5KGUpKSB7XG4gICAgICBkZXBlbmRBcnJheShlKTtcbiAgICB9XG4gIH1cbn1cblxuLyogICovXG5cbi8qKlxuICogT3B0aW9uIG92ZXJ3cml0aW5nIHN0cmF0ZWdpZXMgYXJlIGZ1bmN0aW9ucyB0aGF0IGhhbmRsZVxuICogaG93IHRvIG1lcmdlIGEgcGFyZW50IG9wdGlvbiB2YWx1ZSBhbmQgYSBjaGlsZCBvcHRpb25cbiAqIHZhbHVlIGludG8gdGhlIGZpbmFsIHZhbHVlLlxuICovXG52YXIgc3RyYXRzID0gY29uZmlnLm9wdGlvbk1lcmdlU3RyYXRlZ2llcztcblxuLyoqXG4gKiBPcHRpb25zIHdpdGggcmVzdHJpY3Rpb25zXG4gKi9cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHN0cmF0cy5lbCA9IHN0cmF0cy5wcm9wc0RhdGEgPSBmdW5jdGlvbiAocGFyZW50LCBjaGlsZCwgdm0sIGtleSkge1xuICAgIGlmICghdm0pIHtcbiAgICAgIHdhcm4oXG4gICAgICAgIFwib3B0aW9uIFxcXCJcIiArIGtleSArIFwiXFxcIiBjYW4gb25seSBiZSB1c2VkIGR1cmluZyBpbnN0YW5jZSBcIiArXG4gICAgICAgICdjcmVhdGlvbiB3aXRoIHRoZSBgbmV3YCBrZXl3b3JkLidcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBkZWZhdWx0U3RyYXQocGFyZW50LCBjaGlsZClcbiAgfTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgdGhhdCByZWN1cnNpdmVseSBtZXJnZXMgdHdvIGRhdGEgb2JqZWN0cyB0b2dldGhlci5cbiAqL1xuZnVuY3Rpb24gbWVyZ2VEYXRhICh0bywgZnJvbSkge1xuICBpZiAoIWZyb20pIHsgcmV0dXJuIHRvIH1cbiAgdmFyIGtleSwgdG9WYWwsIGZyb21WYWw7XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZnJvbSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGtleSA9IGtleXNbaV07XG4gICAgdG9WYWwgPSB0b1trZXldO1xuICAgIGZyb21WYWwgPSBmcm9tW2tleV07XG4gICAgaWYgKCFoYXNPd24odG8sIGtleSkpIHtcbiAgICAgIHNldCQxKHRvLCBrZXksIGZyb21WYWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh0b1ZhbCkgJiYgaXNQbGFpbk9iamVjdChmcm9tVmFsKSkge1xuICAgICAgbWVyZ2VEYXRhKHRvVmFsLCBmcm9tVmFsKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRvXG59XG5cbi8qKlxuICogRGF0YVxuICovXG5zdHJhdHMuZGF0YSA9IGZ1bmN0aW9uIChcbiAgcGFyZW50VmFsLFxuICBjaGlsZFZhbCxcbiAgdm1cbikge1xuICBpZiAoIXZtKSB7XG4gICAgLy8gaW4gYSBWdWUuZXh0ZW5kIG1lcmdlLCBib3RoIHNob3VsZCBiZSBmdW5jdGlvbnNcbiAgICBpZiAoIWNoaWxkVmFsKSB7XG4gICAgICByZXR1cm4gcGFyZW50VmFsXG4gICAgfVxuICAgIGlmICh0eXBlb2YgY2hpbGRWYWwgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybihcbiAgICAgICAgJ1RoZSBcImRhdGFcIiBvcHRpb24gc2hvdWxkIGJlIGEgZnVuY3Rpb24gJyArXG4gICAgICAgICd0aGF0IHJldHVybnMgYSBwZXItaW5zdGFuY2UgdmFsdWUgaW4gY29tcG9uZW50ICcgK1xuICAgICAgICAnZGVmaW5pdGlvbnMuJyxcbiAgICAgICAgdm1cbiAgICAgICk7XG4gICAgICByZXR1cm4gcGFyZW50VmFsXG4gICAgfVxuICAgIGlmICghcGFyZW50VmFsKSB7XG4gICAgICByZXR1cm4gY2hpbGRWYWxcbiAgICB9XG4gICAgLy8gd2hlbiBwYXJlbnRWYWwgJiBjaGlsZFZhbCBhcmUgYm90aCBwcmVzZW50LFxuICAgIC8vIHdlIG5lZWQgdG8gcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAgIC8vIG1lcmdlZCByZXN1bHQgb2YgYm90aCBmdW5jdGlvbnMuLi4gbm8gbmVlZCB0b1xuICAgIC8vIGNoZWNrIGlmIHBhcmVudFZhbCBpcyBhIGZ1bmN0aW9uIGhlcmUgYmVjYXVzZVxuICAgIC8vIGl0IGhhcyB0byBiZSBhIGZ1bmN0aW9uIHRvIHBhc3MgcHJldmlvdXMgbWVyZ2VzLlxuICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZWREYXRhRm4gKCkge1xuICAgICAgcmV0dXJuIG1lcmdlRGF0YShcbiAgICAgICAgY2hpbGRWYWwuY2FsbCh0aGlzKSxcbiAgICAgICAgcGFyZW50VmFsLmNhbGwodGhpcylcbiAgICAgIClcbiAgICB9XG4gIH0gZWxzZSBpZiAocGFyZW50VmFsIHx8IGNoaWxkVmFsKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG1lcmdlZEluc3RhbmNlRGF0YUZuICgpIHtcbiAgICAgIC8vIGluc3RhbmNlIG1lcmdlXG4gICAgICB2YXIgaW5zdGFuY2VEYXRhID0gdHlwZW9mIGNoaWxkVmFsID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gY2hpbGRWYWwuY2FsbCh2bSlcbiAgICAgICAgOiBjaGlsZFZhbDtcbiAgICAgIHZhciBkZWZhdWx0RGF0YSA9IHR5cGVvZiBwYXJlbnRWYWwgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyBwYXJlbnRWYWwuY2FsbCh2bSlcbiAgICAgICAgOiB1bmRlZmluZWQ7XG4gICAgICBpZiAoaW5zdGFuY2VEYXRhKSB7XG4gICAgICAgIHJldHVybiBtZXJnZURhdGEoaW5zdGFuY2VEYXRhLCBkZWZhdWx0RGF0YSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0RGF0YVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBIb29rcyBhbmQgcGFyYW0gYXR0cmlidXRlcyBhcmUgbWVyZ2VkIGFzIGFycmF5cy5cbiAqL1xuZnVuY3Rpb24gbWVyZ2VIb29rIChcbiAgcGFyZW50VmFsLFxuICBjaGlsZFZhbFxuKSB7XG4gIHJldHVybiBjaGlsZFZhbFxuICAgID8gcGFyZW50VmFsXG4gICAgICA/IHBhcmVudFZhbC5jb25jYXQoY2hpbGRWYWwpXG4gICAgICA6IEFycmF5LmlzQXJyYXkoY2hpbGRWYWwpXG4gICAgICAgID8gY2hpbGRWYWxcbiAgICAgICAgOiBbY2hpbGRWYWxdXG4gICAgOiBwYXJlbnRWYWxcbn1cblxuY29uZmlnLl9saWZlY3ljbGVIb29rcy5mb3JFYWNoKGZ1bmN0aW9uIChob29rKSB7XG4gIHN0cmF0c1tob29rXSA9IG1lcmdlSG9vaztcbn0pO1xuXG4vKipcbiAqIEFzc2V0c1xuICpcbiAqIFdoZW4gYSB2bSBpcyBwcmVzZW50IChpbnN0YW5jZSBjcmVhdGlvbiksIHdlIG5lZWQgdG8gZG9cbiAqIGEgdGhyZWUtd2F5IG1lcmdlIGJldHdlZW4gY29uc3RydWN0b3Igb3B0aW9ucywgaW5zdGFuY2VcbiAqIG9wdGlvbnMgYW5kIHBhcmVudCBvcHRpb25zLlxuICovXG5mdW5jdGlvbiBtZXJnZUFzc2V0cyAocGFyZW50VmFsLCBjaGlsZFZhbCkge1xuICB2YXIgcmVzID0gT2JqZWN0LmNyZWF0ZShwYXJlbnRWYWwgfHwgbnVsbCk7XG4gIHJldHVybiBjaGlsZFZhbFxuICAgID8gZXh0ZW5kKHJlcywgY2hpbGRWYWwpXG4gICAgOiByZXNcbn1cblxuY29uZmlnLl9hc3NldFR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgc3RyYXRzW3R5cGUgKyAncyddID0gbWVyZ2VBc3NldHM7XG59KTtcblxuLyoqXG4gKiBXYXRjaGVycy5cbiAqXG4gKiBXYXRjaGVycyBoYXNoZXMgc2hvdWxkIG5vdCBvdmVyd3JpdGUgb25lXG4gKiBhbm90aGVyLCBzbyB3ZSBtZXJnZSB0aGVtIGFzIGFycmF5cy5cbiAqL1xuc3RyYXRzLndhdGNoID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICghY2hpbGRWYWwpIHsgcmV0dXJuIHBhcmVudFZhbCB9XG4gIGlmICghcGFyZW50VmFsKSB7IHJldHVybiBjaGlsZFZhbCB9XG4gIHZhciByZXQgPSB7fTtcbiAgZXh0ZW5kKHJldCwgcGFyZW50VmFsKTtcbiAgZm9yICh2YXIga2V5IGluIGNoaWxkVmFsKSB7XG4gICAgdmFyIHBhcmVudCA9IHJldFtrZXldO1xuICAgIHZhciBjaGlsZCA9IGNoaWxkVmFsW2tleV07XG4gICAgaWYgKHBhcmVudCAmJiAhQXJyYXkuaXNBcnJheShwYXJlbnQpKSB7XG4gICAgICBwYXJlbnQgPSBbcGFyZW50XTtcbiAgICB9XG4gICAgcmV0W2tleV0gPSBwYXJlbnRcbiAgICAgID8gcGFyZW50LmNvbmNhdChjaGlsZClcbiAgICAgIDogW2NoaWxkXTtcbiAgfVxuICByZXR1cm4gcmV0XG59O1xuXG4vKipcbiAqIE90aGVyIG9iamVjdCBoYXNoZXMuXG4gKi9cbnN0cmF0cy5wcm9wcyA9XG5zdHJhdHMubWV0aG9kcyA9XG5zdHJhdHMuY29tcHV0ZWQgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCkge1xuICBpZiAoIWNoaWxkVmFsKSB7IHJldHVybiBwYXJlbnRWYWwgfVxuICBpZiAoIXBhcmVudFZhbCkgeyByZXR1cm4gY2hpbGRWYWwgfVxuICB2YXIgcmV0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgZXh0ZW5kKHJldCwgcGFyZW50VmFsKTtcbiAgZXh0ZW5kKHJldCwgY2hpbGRWYWwpO1xuICByZXR1cm4gcmV0XG59O1xuXG4vKipcbiAqIERlZmF1bHQgc3RyYXRlZ3kuXG4gKi9cbnZhciBkZWZhdWx0U3RyYXQgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCkge1xuICByZXR1cm4gY2hpbGRWYWwgPT09IHVuZGVmaW5lZFxuICAgID8gcGFyZW50VmFsXG4gICAgOiBjaGlsZFZhbFxufTtcblxuLyoqXG4gKiBWYWxpZGF0ZSBjb21wb25lbnQgbmFtZXNcbiAqL1xuZnVuY3Rpb24gY2hlY2tDb21wb25lbnRzIChvcHRpb25zKSB7XG4gIGZvciAodmFyIGtleSBpbiBvcHRpb25zLmNvbXBvbmVudHMpIHtcbiAgICB2YXIgbG93ZXIgPSBrZXkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAoaXNCdWlsdEluVGFnKGxvd2VyKSB8fCBjb25maWcuaXNSZXNlcnZlZFRhZyhsb3dlcikpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICdEbyBub3QgdXNlIGJ1aWx0LWluIG9yIHJlc2VydmVkIEhUTUwgZWxlbWVudHMgYXMgY29tcG9uZW50ICcgK1xuICAgICAgICAnaWQ6ICcgKyBrZXlcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRW5zdXJlIGFsbCBwcm9wcyBvcHRpb24gc3ludGF4IGFyZSBub3JtYWxpemVkIGludG8gdGhlXG4gKiBPYmplY3QtYmFzZWQgZm9ybWF0LlxuICovXG5mdW5jdGlvbiBub3JtYWxpemVQcm9wcyAob3B0aW9ucykge1xuICB2YXIgcHJvcHMgPSBvcHRpb25zLnByb3BzO1xuICBpZiAoIXByb3BzKSB7IHJldHVybiB9XG4gIHZhciByZXMgPSB7fTtcbiAgdmFyIGksIHZhbCwgbmFtZTtcbiAgaWYgKEFycmF5LmlzQXJyYXkocHJvcHMpKSB7XG4gICAgaSA9IHByb3BzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB2YWwgPSBwcm9wc1tpXTtcbiAgICAgIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgICAgICBuYW1lID0gY2FtZWxpemUodmFsKTtcbiAgICAgICAgcmVzW25hbWVdID0geyB0eXBlOiBudWxsIH07XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgd2FybigncHJvcHMgbXVzdCBiZSBzdHJpbmdzIHdoZW4gdXNpbmcgYXJyYXkgc3ludGF4LicpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHByb3BzKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBwcm9wcykge1xuICAgICAgdmFsID0gcHJvcHNba2V5XTtcbiAgICAgIG5hbWUgPSBjYW1lbGl6ZShrZXkpO1xuICAgICAgcmVzW25hbWVdID0gaXNQbGFpbk9iamVjdCh2YWwpXG4gICAgICAgID8gdmFsXG4gICAgICAgIDogeyB0eXBlOiB2YWwgfTtcbiAgICB9XG4gIH1cbiAgb3B0aW9ucy5wcm9wcyA9IHJlcztcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgcmF3IGZ1bmN0aW9uIGRpcmVjdGl2ZXMgaW50byBvYmplY3QgZm9ybWF0LlxuICovXG5mdW5jdGlvbiBub3JtYWxpemVEaXJlY3RpdmVzIChvcHRpb25zKSB7XG4gIHZhciBkaXJzID0gb3B0aW9ucy5kaXJlY3RpdmVzO1xuICBpZiAoZGlycykge1xuICAgIGZvciAodmFyIGtleSBpbiBkaXJzKSB7XG4gICAgICB2YXIgZGVmID0gZGlyc1trZXldO1xuICAgICAgaWYgKHR5cGVvZiBkZWYgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZGlyc1trZXldID0geyBiaW5kOiBkZWYsIHVwZGF0ZTogZGVmIH07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTWVyZ2UgdHdvIG9wdGlvbiBvYmplY3RzIGludG8gYSBuZXcgb25lLlxuICogQ29yZSB1dGlsaXR5IHVzZWQgaW4gYm90aCBpbnN0YW50aWF0aW9uIGFuZCBpbmhlcml0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbWVyZ2VPcHRpb25zIChcbiAgcGFyZW50LFxuICBjaGlsZCxcbiAgdm1cbikge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGNoZWNrQ29tcG9uZW50cyhjaGlsZCk7XG4gIH1cbiAgbm9ybWFsaXplUHJvcHMoY2hpbGQpO1xuICBub3JtYWxpemVEaXJlY3RpdmVzKGNoaWxkKTtcbiAgdmFyIGV4dGVuZHNGcm9tID0gY2hpbGQuZXh0ZW5kcztcbiAgaWYgKGV4dGVuZHNGcm9tKSB7XG4gICAgcGFyZW50ID0gdHlwZW9mIGV4dGVuZHNGcm9tID09PSAnZnVuY3Rpb24nXG4gICAgICA/IG1lcmdlT3B0aW9ucyhwYXJlbnQsIGV4dGVuZHNGcm9tLm9wdGlvbnMsIHZtKVxuICAgICAgOiBtZXJnZU9wdGlvbnMocGFyZW50LCBleHRlbmRzRnJvbSwgdm0pO1xuICB9XG4gIGlmIChjaGlsZC5taXhpbnMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkLm1peGlucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBtaXhpbiA9IGNoaWxkLm1peGluc1tpXTtcbiAgICAgIGlmIChtaXhpbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBWdWUkMikge1xuICAgICAgICBtaXhpbiA9IG1peGluLm9wdGlvbnM7XG4gICAgICB9XG4gICAgICBwYXJlbnQgPSBtZXJnZU9wdGlvbnMocGFyZW50LCBtaXhpbiwgdm0pO1xuICAgIH1cbiAgfVxuICB2YXIgb3B0aW9ucyA9IHt9O1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBwYXJlbnQpIHtcbiAgICBtZXJnZUZpZWxkKGtleSk7XG4gIH1cbiAgZm9yIChrZXkgaW4gY2hpbGQpIHtcbiAgICBpZiAoIWhhc093bihwYXJlbnQsIGtleSkpIHtcbiAgICAgIG1lcmdlRmllbGQoa2V5KTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWVyZ2VGaWVsZCAoa2V5KSB7XG4gICAgdmFyIHN0cmF0ID0gc3RyYXRzW2tleV0gfHwgZGVmYXVsdFN0cmF0O1xuICAgIG9wdGlvbnNba2V5XSA9IHN0cmF0KHBhcmVudFtrZXldLCBjaGlsZFtrZXldLCB2bSwga2V5KTtcbiAgfVxuICByZXR1cm4gb3B0aW9uc1xufVxuXG4vKipcbiAqIFJlc29sdmUgYW4gYXNzZXQuXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgYmVjYXVzZSBjaGlsZCBpbnN0YW5jZXMgbmVlZCBhY2Nlc3NcbiAqIHRvIGFzc2V0cyBkZWZpbmVkIGluIGl0cyBhbmNlc3RvciBjaGFpbi5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZUFzc2V0IChcbiAgb3B0aW9ucyxcbiAgdHlwZSxcbiAgaWQsXG4gIHdhcm5NaXNzaW5nXG4pIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICh0eXBlb2YgaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIGFzc2V0cyA9IG9wdGlvbnNbdHlwZV07XG4gIC8vIGNoZWNrIGxvY2FsIHJlZ2lzdHJhdGlvbiB2YXJpYXRpb25zIGZpcnN0XG4gIGlmIChoYXNPd24oYXNzZXRzLCBpZCkpIHsgcmV0dXJuIGFzc2V0c1tpZF0gfVxuICB2YXIgY2FtZWxpemVkSWQgPSBjYW1lbGl6ZShpZCk7XG4gIGlmIChoYXNPd24oYXNzZXRzLCBjYW1lbGl6ZWRJZCkpIHsgcmV0dXJuIGFzc2V0c1tjYW1lbGl6ZWRJZF0gfVxuICB2YXIgUGFzY2FsQ2FzZUlkID0gY2FwaXRhbGl6ZShjYW1lbGl6ZWRJZCk7XG4gIGlmIChoYXNPd24oYXNzZXRzLCBQYXNjYWxDYXNlSWQpKSB7IHJldHVybiBhc3NldHNbUGFzY2FsQ2FzZUlkXSB9XG4gIC8vIGZhbGxiYWNrIHRvIHByb3RvdHlwZSBjaGFpblxuICB2YXIgcmVzID0gYXNzZXRzW2lkXSB8fCBhc3NldHNbY2FtZWxpemVkSWRdIHx8IGFzc2V0c1tQYXNjYWxDYXNlSWRdO1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuTWlzc2luZyAmJiAhcmVzKSB7XG4gICAgd2FybihcbiAgICAgICdGYWlsZWQgdG8gcmVzb2x2ZSAnICsgdHlwZS5zbGljZSgwLCAtMSkgKyAnOiAnICsgaWQsXG4gICAgICBvcHRpb25zXG4gICAgKTtcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiB2YWxpZGF0ZVByb3AgKFxuICBrZXksXG4gIHByb3BPcHRpb25zLFxuICBwcm9wc0RhdGEsXG4gIHZtXG4pIHtcbiAgdmFyIHByb3AgPSBwcm9wT3B0aW9uc1trZXldO1xuICB2YXIgYWJzZW50ID0gIWhhc093bihwcm9wc0RhdGEsIGtleSk7XG4gIHZhciB2YWx1ZSA9IHByb3BzRGF0YVtrZXldO1xuICAvLyBoYW5kbGUgYm9vbGVhbiBwcm9wc1xuICBpZiAoaXNUeXBlKEJvb2xlYW4sIHByb3AudHlwZSkpIHtcbiAgICBpZiAoYWJzZW50ICYmICFoYXNPd24ocHJvcCwgJ2RlZmF1bHQnKSkge1xuICAgICAgdmFsdWUgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKCFpc1R5cGUoU3RyaW5nLCBwcm9wLnR5cGUpICYmICh2YWx1ZSA9PT0gJycgfHwgdmFsdWUgPT09IGh5cGhlbmF0ZShrZXkpKSkge1xuICAgICAgdmFsdWUgPSB0cnVlO1xuICAgIH1cbiAgfVxuICAvLyBjaGVjayBkZWZhdWx0IHZhbHVlXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFsdWUgPSBnZXRQcm9wRGVmYXVsdFZhbHVlKHZtLCBwcm9wLCBrZXkpO1xuICAgIC8vIHNpbmNlIHRoZSBkZWZhdWx0IHZhbHVlIGlzIGEgZnJlc2ggY29weSxcbiAgICAvLyBtYWtlIHN1cmUgdG8gb2JzZXJ2ZSBpdC5cbiAgICB2YXIgcHJldlNob3VsZENvbnZlcnQgPSBvYnNlcnZlclN0YXRlLnNob3VsZENvbnZlcnQ7XG4gICAgb2JzZXJ2ZXJTdGF0ZS5zaG91bGRDb252ZXJ0ID0gdHJ1ZTtcbiAgICBvYnNlcnZlKHZhbHVlKTtcbiAgICBvYnNlcnZlclN0YXRlLnNob3VsZENvbnZlcnQgPSBwcmV2U2hvdWxkQ29udmVydDtcbiAgfVxuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGFzc2VydFByb3AocHJvcCwga2V5LCB2YWx1ZSwgdm0sIGFic2VudCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlXG59XG5cbi8qKlxuICogR2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIGEgcHJvcC5cbiAqL1xuZnVuY3Rpb24gZ2V0UHJvcERlZmF1bHRWYWx1ZSAodm0sIHByb3AsIGtleSkge1xuICAvLyBubyBkZWZhdWx0LCByZXR1cm4gdW5kZWZpbmVkXG4gIGlmICghaGFzT3duKHByb3AsICdkZWZhdWx0JykpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbiAgdmFyIGRlZiA9IHByb3AuZGVmYXVsdDtcbiAgLy8gd2FybiBhZ2FpbnN0IG5vbi1mYWN0b3J5IGRlZmF1bHRzIGZvciBPYmplY3QgJiBBcnJheVxuICBpZiAoaXNPYmplY3QoZGVmKSkge1xuICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybihcbiAgICAgICdJbnZhbGlkIGRlZmF1bHQgdmFsdWUgZm9yIHByb3AgXCInICsga2V5ICsgJ1wiOiAnICtcbiAgICAgICdQcm9wcyB3aXRoIHR5cGUgT2JqZWN0L0FycmF5IG11c3QgdXNlIGEgZmFjdG9yeSBmdW5jdGlvbiAnICtcbiAgICAgICd0byByZXR1cm4gdGhlIGRlZmF1bHQgdmFsdWUuJyxcbiAgICAgIHZtXG4gICAgKTtcbiAgfVxuICAvLyB0aGUgcmF3IHByb3AgdmFsdWUgd2FzIGFsc28gdW5kZWZpbmVkIGZyb20gcHJldmlvdXMgcmVuZGVyLFxuICAvLyByZXR1cm4gcHJldmlvdXMgZGVmYXVsdCB2YWx1ZSB0byBhdm9pZCB1bm5lY2Vzc2FyeSB3YXRjaGVyIHRyaWdnZXJcbiAgaWYgKHZtICYmIHZtLiRvcHRpb25zLnByb3BzRGF0YSAmJlxuICAgIHZtLiRvcHRpb25zLnByb3BzRGF0YVtrZXldID09PSB1bmRlZmluZWQgJiZcbiAgICB2bVtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdm1ba2V5XVxuICB9XG4gIC8vIGNhbGwgZmFjdG9yeSBmdW5jdGlvbiBmb3Igbm9uLUZ1bmN0aW9uIHR5cGVzXG4gIHJldHVybiB0eXBlb2YgZGVmID09PSAnZnVuY3Rpb24nICYmIHByb3AudHlwZSAhPT0gRnVuY3Rpb25cbiAgICA/IGRlZi5jYWxsKHZtKVxuICAgIDogZGVmXG59XG5cbi8qKlxuICogQXNzZXJ0IHdoZXRoZXIgYSBwcm9wIGlzIHZhbGlkLlxuICovXG5mdW5jdGlvbiBhc3NlcnRQcm9wIChcbiAgcHJvcCxcbiAgbmFtZSxcbiAgdmFsdWUsXG4gIHZtLFxuICBhYnNlbnRcbikge1xuICBpZiAocHJvcC5yZXF1aXJlZCAmJiBhYnNlbnQpIHtcbiAgICB3YXJuKFxuICAgICAgJ01pc3NpbmcgcmVxdWlyZWQgcHJvcDogXCInICsgbmFtZSArICdcIicsXG4gICAgICB2bVxuICAgICk7XG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKHZhbHVlID09IG51bGwgJiYgIXByb3AucmVxdWlyZWQpIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIgdHlwZSA9IHByb3AudHlwZTtcbiAgdmFyIHZhbGlkID0gIXR5cGUgfHwgdHlwZSA9PT0gdHJ1ZTtcbiAgdmFyIGV4cGVjdGVkVHlwZXMgPSBbXTtcbiAgaWYgKHR5cGUpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodHlwZSkpIHtcbiAgICAgIHR5cGUgPSBbdHlwZV07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHlwZS5sZW5ndGggJiYgIXZhbGlkOyBpKyspIHtcbiAgICAgIHZhciBhc3NlcnRlZFR5cGUgPSBhc3NlcnRUeXBlKHZhbHVlLCB0eXBlW2ldKTtcbiAgICAgIGV4cGVjdGVkVHlwZXMucHVzaChhc3NlcnRlZFR5cGUuZXhwZWN0ZWRUeXBlIHx8ICcnKTtcbiAgICAgIHZhbGlkID0gYXNzZXJ0ZWRUeXBlLnZhbGlkO1xuICAgIH1cbiAgfVxuICBpZiAoIXZhbGlkKSB7XG4gICAgd2FybihcbiAgICAgICdJbnZhbGlkIHByb3A6IHR5cGUgY2hlY2sgZmFpbGVkIGZvciBwcm9wIFwiJyArIG5hbWUgKyAnXCIuJyArXG4gICAgICAnIEV4cGVjdGVkICcgKyBleHBlY3RlZFR5cGVzLm1hcChjYXBpdGFsaXplKS5qb2luKCcsICcpICtcbiAgICAgICcsIGdvdCAnICsgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKS5zbGljZSg4LCAtMSkgKyAnLicsXG4gICAgICB2bVxuICAgICk7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIHZhbGlkYXRvciA9IHByb3AudmFsaWRhdG9yO1xuICBpZiAodmFsaWRhdG9yKSB7XG4gICAgaWYgKCF2YWxpZGF0b3IodmFsdWUpKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnSW52YWxpZCBwcm9wOiBjdXN0b20gdmFsaWRhdG9yIGNoZWNrIGZhaWxlZCBmb3IgcHJvcCBcIicgKyBuYW1lICsgJ1wiLicsXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgdHlwZSBvZiBhIHZhbHVlXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFR5cGUgKHZhbHVlLCB0eXBlKSB7XG4gIHZhciB2YWxpZDtcbiAgdmFyIGV4cGVjdGVkVHlwZSA9IGdldFR5cGUodHlwZSk7XG4gIGlmIChleHBlY3RlZFR5cGUgPT09ICdTdHJpbmcnKSB7XG4gICAgdmFsaWQgPSB0eXBlb2YgdmFsdWUgPT09IChleHBlY3RlZFR5cGUgPSAnc3RyaW5nJyk7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSAnTnVtYmVyJykge1xuICAgIHZhbGlkID0gdHlwZW9mIHZhbHVlID09PSAoZXhwZWN0ZWRUeXBlID0gJ251bWJlcicpO1xuICB9IGVsc2UgaWYgKGV4cGVjdGVkVHlwZSA9PT0gJ0Jvb2xlYW4nKSB7XG4gICAgdmFsaWQgPSB0eXBlb2YgdmFsdWUgPT09IChleHBlY3RlZFR5cGUgPSAnYm9vbGVhbicpO1xuICB9IGVsc2UgaWYgKGV4cGVjdGVkVHlwZSA9PT0gJ0Z1bmN0aW9uJykge1xuICAgIHZhbGlkID0gdHlwZW9mIHZhbHVlID09PSAoZXhwZWN0ZWRUeXBlID0gJ2Z1bmN0aW9uJyk7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSAnT2JqZWN0Jykge1xuICAgIHZhbGlkID0gaXNQbGFpbk9iamVjdCh2YWx1ZSk7XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSAnQXJyYXknKSB7XG4gICAgdmFsaWQgPSBBcnJheS5pc0FycmF5KHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICB2YWxpZCA9IHZhbHVlIGluc3RhbmNlb2YgdHlwZTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHZhbGlkOiB2YWxpZCxcbiAgICBleHBlY3RlZFR5cGU6IGV4cGVjdGVkVHlwZVxuICB9XG59XG5cbi8qKlxuICogVXNlIGZ1bmN0aW9uIHN0cmluZyBuYW1lIHRvIGNoZWNrIGJ1aWx0LWluIHR5cGVzLFxuICogYmVjYXVzZSBhIHNpbXBsZSBlcXVhbGl0eSBjaGVjayB3aWxsIGZhaWwgd2hlbiBydW5uaW5nXG4gKiBhY3Jvc3MgZGlmZmVyZW50IHZtcyAvIGlmcmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGdldFR5cGUgKGZuKSB7XG4gIHZhciBtYXRjaCA9IGZuICYmIGZuLnRvU3RyaW5nKCkubWF0Y2goL15cXHMqZnVuY3Rpb24gKFxcdyspLyk7XG4gIHJldHVybiBtYXRjaCAmJiBtYXRjaFsxXVxufVxuXG5mdW5jdGlvbiBpc1R5cGUgKHR5cGUsIGZuKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShmbikpIHtcbiAgICByZXR1cm4gZ2V0VHlwZShmbikgPT09IGdldFR5cGUodHlwZSlcbiAgfVxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZm4ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZ2V0VHlwZShmbltpXSkgPT09IGdldFR5cGUodHlwZSkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHJldHVybiBmYWxzZVxufVxuXG5cblxudmFyIHV0aWwgPSBPYmplY3QuZnJlZXplKHtcblx0ZGVmaW5lUmVhY3RpdmU6IGRlZmluZVJlYWN0aXZlJCQxLFxuXHRfdG9TdHJpbmc6IF90b1N0cmluZyxcblx0dG9OdW1iZXI6IHRvTnVtYmVyLFxuXHRtYWtlTWFwOiBtYWtlTWFwLFxuXHRpc0J1aWx0SW5UYWc6IGlzQnVpbHRJblRhZyxcblx0cmVtb3ZlOiByZW1vdmUkMSxcblx0aGFzT3duOiBoYXNPd24sXG5cdGlzUHJpbWl0aXZlOiBpc1ByaW1pdGl2ZSxcblx0Y2FjaGVkOiBjYWNoZWQsXG5cdGNhbWVsaXplOiBjYW1lbGl6ZSxcblx0Y2FwaXRhbGl6ZTogY2FwaXRhbGl6ZSxcblx0aHlwaGVuYXRlOiBoeXBoZW5hdGUsXG5cdGJpbmQ6IGJpbmQkMSxcblx0dG9BcnJheTogdG9BcnJheSxcblx0ZXh0ZW5kOiBleHRlbmQsXG5cdGlzT2JqZWN0OiBpc09iamVjdCxcblx0aXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcblx0dG9PYmplY3Q6IHRvT2JqZWN0LFxuXHRub29wOiBub29wLFxuXHRubzogbm8sXG5cdGlkZW50aXR5OiBpZGVudGl0eSxcblx0Z2VuU3RhdGljS2V5czogZ2VuU3RhdGljS2V5cyxcblx0bG9vc2VFcXVhbDogbG9vc2VFcXVhbCxcblx0bG9vc2VJbmRleE9mOiBsb29zZUluZGV4T2YsXG5cdGlzUmVzZXJ2ZWQ6IGlzUmVzZXJ2ZWQsXG5cdGRlZjogZGVmLFxuXHRwYXJzZVBhdGg6IHBhcnNlUGF0aCxcblx0aGFzUHJvdG86IGhhc1Byb3RvLFxuXHRpbkJyb3dzZXI6IGluQnJvd3Nlcixcblx0VUE6IFVBLFxuXHRpc0lFOiBpc0lFLFxuXHRpc0lFOTogaXNJRTksXG5cdGlzRWRnZTogaXNFZGdlLFxuXHRpc0FuZHJvaWQ6IGlzQW5kcm9pZCxcblx0aXNJT1M6IGlzSU9TLFxuXHRpc1NlcnZlclJlbmRlcmluZzogaXNTZXJ2ZXJSZW5kZXJpbmcsXG5cdGRldnRvb2xzOiBkZXZ0b29scyxcblx0bmV4dFRpY2s6IG5leHRUaWNrLFxuXHRnZXQgX1NldCAoKSB7IHJldHVybiBfU2V0OyB9LFxuXHRtZXJnZU9wdGlvbnM6IG1lcmdlT3B0aW9ucyxcblx0cmVzb2x2ZUFzc2V0OiByZXNvbHZlQXNzZXQsXG5cdGdldCB3YXJuICgpIHsgcmV0dXJuIHdhcm47IH0sXG5cdGdldCBmb3JtYXRDb21wb25lbnROYW1lICgpIHsgcmV0dXJuIGZvcm1hdENvbXBvbmVudE5hbWU7IH0sXG5cdHZhbGlkYXRlUHJvcDogdmFsaWRhdGVQcm9wXG59KTtcblxuLyogbm90IHR5cGUgY2hlY2tpbmcgdGhpcyBmaWxlIGJlY2F1c2UgZmxvdyBkb2Vzbid0IHBsYXkgd2VsbCB3aXRoIFByb3h5ICovXG5cbnZhciBpbml0UHJveHk7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHZhciBhbGxvd2VkR2xvYmFscyA9IG1ha2VNYXAoXG4gICAgJ0luZmluaXR5LHVuZGVmaW5lZCxOYU4saXNGaW5pdGUsaXNOYU4sJyArXG4gICAgJ3BhcnNlRmxvYXQscGFyc2VJbnQsZGVjb2RlVVJJLGRlY29kZVVSSUNvbXBvbmVudCxlbmNvZGVVUkksZW5jb2RlVVJJQ29tcG9uZW50LCcgK1xuICAgICdNYXRoLE51bWJlcixEYXRlLEFycmF5LE9iamVjdCxCb29sZWFuLFN0cmluZyxSZWdFeHAsTWFwLFNldCxKU09OLEludGwsJyArXG4gICAgJ3JlcXVpcmUnIC8vIGZvciBXZWJwYWNrL0Jyb3dzZXJpZnlcbiAgKTtcblxuICB2YXIgd2Fybk5vblByZXNlbnQgPSBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHtcbiAgICB3YXJuKFxuICAgICAgXCJQcm9wZXJ0eSBvciBtZXRob2QgXFxcIlwiICsga2V5ICsgXCJcXFwiIGlzIG5vdCBkZWZpbmVkIG9uIHRoZSBpbnN0YW5jZSBidXQgXCIgK1xuICAgICAgXCJyZWZlcmVuY2VkIGR1cmluZyByZW5kZXIuIE1ha2Ugc3VyZSB0byBkZWNsYXJlIHJlYWN0aXZlIGRhdGEgXCIgK1xuICAgICAgXCJwcm9wZXJ0aWVzIGluIHRoZSBkYXRhIG9wdGlvbi5cIixcbiAgICAgIHRhcmdldFxuICAgICk7XG4gIH07XG5cbiAgdmFyIGhhc1Byb3h5ID1cbiAgICB0eXBlb2YgUHJveHkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgUHJveHkudG9TdHJpbmcoKS5tYXRjaCgvbmF0aXZlIGNvZGUvKTtcblxuICBpZiAoaGFzUHJveHkpIHtcbiAgICB2YXIgaXNCdWlsdEluTW9kaWZpZXIgPSBtYWtlTWFwKCdzdG9wLHByZXZlbnQsc2VsZixjdHJsLHNoaWZ0LGFsdCxtZXRhJyk7XG4gICAgY29uZmlnLmtleUNvZGVzID0gbmV3IFByb3h5KGNvbmZpZy5rZXlDb2Rlcywge1xuICAgICAgc2V0OiBmdW5jdGlvbiBzZXQgKHRhcmdldCwga2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoaXNCdWlsdEluTW9kaWZpZXIoa2V5KSkge1xuICAgICAgICAgIHdhcm4oKFwiQXZvaWQgb3ZlcndyaXRpbmcgYnVpbHQtaW4gbW9kaWZpZXIgaW4gY29uZmlnLmtleUNvZGVzOiAuXCIgKyBrZXkpKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHZhciBoYXNIYW5kbGVyID0ge1xuICAgIGhhczogZnVuY3Rpb24gaGFzICh0YXJnZXQsIGtleSkge1xuICAgICAgdmFyIGhhcyA9IGtleSBpbiB0YXJnZXQ7XG4gICAgICB2YXIgaXNBbGxvd2VkID0gYWxsb3dlZEdsb2JhbHMoa2V5KSB8fCBrZXkuY2hhckF0KDApID09PSAnXyc7XG4gICAgICBpZiAoIWhhcyAmJiAhaXNBbGxvd2VkKSB7XG4gICAgICAgIHdhcm5Ob25QcmVzZW50KHRhcmdldCwga2V5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoYXMgfHwgIWlzQWxsb3dlZFxuICAgIH1cbiAgfTtcblxuICB2YXIgZ2V0SGFuZGxlciA9IHtcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCAodGFyZ2V0LCBrZXkpIHtcbiAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyAmJiAhKGtleSBpbiB0YXJnZXQpKSB7XG4gICAgICAgIHdhcm5Ob25QcmVzZW50KHRhcmdldCwga2V5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0YXJnZXRba2V5XVxuICAgIH1cbiAgfTtcblxuICBpbml0UHJveHkgPSBmdW5jdGlvbiBpbml0UHJveHkgKHZtKSB7XG4gICAgaWYgKGhhc1Byb3h5KSB7XG4gICAgICAvLyBkZXRlcm1pbmUgd2hpY2ggcHJveHkgaGFuZGxlciB0byB1c2VcbiAgICAgIHZhciBvcHRpb25zID0gdm0uJG9wdGlvbnM7XG4gICAgICB2YXIgaGFuZGxlcnMgPSBvcHRpb25zLnJlbmRlciAmJiBvcHRpb25zLnJlbmRlci5fd2l0aFN0cmlwcGVkXG4gICAgICAgID8gZ2V0SGFuZGxlclxuICAgICAgICA6IGhhc0hhbmRsZXI7XG4gICAgICB2bS5fcmVuZGVyUHJveHkgPSBuZXcgUHJveHkodm0sIGhhbmRsZXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdm0uX3JlbmRlclByb3h5ID0gdm07XG4gICAgfVxuICB9O1xufVxuXG4vKiAgKi9cblxudmFyIFZOb2RlID0gZnVuY3Rpb24gVk5vZGUgKFxuICB0YWcsXG4gIGRhdGEsXG4gIGNoaWxkcmVuLFxuICB0ZXh0LFxuICBlbG0sXG4gIGNvbnRleHQsXG4gIGNvbXBvbmVudE9wdGlvbnNcbikge1xuICB0aGlzLnRhZyA9IHRhZztcbiAgdGhpcy5kYXRhID0gZGF0YTtcbiAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICB0aGlzLnRleHQgPSB0ZXh0O1xuICB0aGlzLmVsbSA9IGVsbTtcbiAgdGhpcy5ucyA9IHVuZGVmaW5lZDtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5mdW5jdGlvbmFsQ29udGV4dCA9IHVuZGVmaW5lZDtcbiAgdGhpcy5rZXkgPSBkYXRhICYmIGRhdGEua2V5O1xuICB0aGlzLmNvbXBvbmVudE9wdGlvbnMgPSBjb21wb25lbnRPcHRpb25zO1xuICB0aGlzLmNvbXBvbmVudEluc3RhbmNlID0gdW5kZWZpbmVkO1xuICB0aGlzLnBhcmVudCA9IHVuZGVmaW5lZDtcbiAgdGhpcy5yYXcgPSBmYWxzZTtcbiAgdGhpcy5pc1N0YXRpYyA9IGZhbHNlO1xuICB0aGlzLmlzUm9vdEluc2VydCA9IHRydWU7XG4gIHRoaXMuaXNDb21tZW50ID0gZmFsc2U7XG4gIHRoaXMuaXNDbG9uZWQgPSBmYWxzZTtcbiAgdGhpcy5pc09uY2UgPSBmYWxzZTtcbn07XG5cbnZhciBwcm90b3R5cGVBY2Nlc3NvcnMgPSB7IGNoaWxkOiB7fSB9O1xuXG4vLyBERVBSRUNBVEVEOiBhbGlhcyBmb3IgY29tcG9uZW50SW5zdGFuY2UgZm9yIGJhY2t3YXJkcyBjb21wYXQuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xucHJvdG90eXBlQWNjZXNzb3JzLmNoaWxkLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuY29tcG9uZW50SW5zdGFuY2Vcbn07XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBWTm9kZS5wcm90b3R5cGUsIHByb3RvdHlwZUFjY2Vzc29ycyApO1xuXG52YXIgY3JlYXRlRW1wdHlWTm9kZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5vZGUgPSBuZXcgVk5vZGUoKTtcbiAgbm9kZS50ZXh0ID0gJyc7XG4gIG5vZGUuaXNDb21tZW50ID0gdHJ1ZTtcbiAgcmV0dXJuIG5vZGVcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHRWTm9kZSAodmFsKSB7XG4gIHJldHVybiBuZXcgVk5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgU3RyaW5nKHZhbCkpXG59XG5cbi8vIG9wdGltaXplZCBzaGFsbG93IGNsb25lXG4vLyB1c2VkIGZvciBzdGF0aWMgbm9kZXMgYW5kIHNsb3Qgbm9kZXMgYmVjYXVzZSB0aGV5IG1heSBiZSByZXVzZWQgYWNyb3NzXG4vLyBtdWx0aXBsZSByZW5kZXJzLCBjbG9uaW5nIHRoZW0gYXZvaWRzIGVycm9ycyB3aGVuIERPTSBtYW5pcHVsYXRpb25zIHJlbHlcbi8vIG9uIHRoZWlyIGVsbSByZWZlcmVuY2UuXG5mdW5jdGlvbiBjbG9uZVZOb2RlICh2bm9kZSkge1xuICB2YXIgY2xvbmVkID0gbmV3IFZOb2RlKFxuICAgIHZub2RlLnRhZyxcbiAgICB2bm9kZS5kYXRhLFxuICAgIHZub2RlLmNoaWxkcmVuLFxuICAgIHZub2RlLnRleHQsXG4gICAgdm5vZGUuZWxtLFxuICAgIHZub2RlLmNvbnRleHQsXG4gICAgdm5vZGUuY29tcG9uZW50T3B0aW9uc1xuICApO1xuICBjbG9uZWQubnMgPSB2bm9kZS5ucztcbiAgY2xvbmVkLmlzU3RhdGljID0gdm5vZGUuaXNTdGF0aWM7XG4gIGNsb25lZC5rZXkgPSB2bm9kZS5rZXk7XG4gIGNsb25lZC5pc0Nsb25lZCA9IHRydWU7XG4gIHJldHVybiBjbG9uZWRcbn1cblxuZnVuY3Rpb24gY2xvbmVWTm9kZXMgKHZub2Rlcykge1xuICB2YXIgcmVzID0gbmV3IEFycmF5KHZub2Rlcy5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIHJlc1tpXSA9IGNsb25lVk5vZGUodm5vZGVzW2ldKTtcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbi8qICAqL1xuXG52YXIgaG9va3MgPSB7IGluaXQ6IGluaXQsIHByZXBhdGNoOiBwcmVwYXRjaCwgaW5zZXJ0OiBpbnNlcnQsIGRlc3Ryb3k6IGRlc3Ryb3kkMSB9O1xudmFyIGhvb2tzVG9NZXJnZSA9IE9iamVjdC5rZXlzKGhvb2tzKTtcblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50IChcbiAgQ3RvcixcbiAgZGF0YSxcbiAgY29udGV4dCxcbiAgY2hpbGRyZW4sXG4gIHRhZ1xuKSB7XG4gIGlmICghQ3Rvcikge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIGJhc2VDdG9yID0gY29udGV4dC4kb3B0aW9ucy5fYmFzZTtcbiAgaWYgKGlzT2JqZWN0KEN0b3IpKSB7XG4gICAgQ3RvciA9IGJhc2VDdG9yLmV4dGVuZChDdG9yKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgQ3RvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB3YXJuKChcIkludmFsaWQgQ29tcG9uZW50IGRlZmluaXRpb246IFwiICsgKFN0cmluZyhDdG9yKSkpLCBjb250ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBhc3luYyBjb21wb25lbnRcbiAgaWYgKCFDdG9yLmNpZCkge1xuICAgIGlmIChDdG9yLnJlc29sdmVkKSB7XG4gICAgICBDdG9yID0gQ3Rvci5yZXNvbHZlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgQ3RvciA9IHJlc29sdmVBc3luY0NvbXBvbmVudChDdG9yLCBiYXNlQ3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBpdCdzIG9rIHRvIHF1ZXVlIHRoaXMgb24gZXZlcnkgcmVuZGVyIGJlY2F1c2VcbiAgICAgICAgLy8gJGZvcmNlVXBkYXRlIGlzIGJ1ZmZlcmVkIGJ5IHRoZSBzY2hlZHVsZXIuXG4gICAgICAgIGNvbnRleHQuJGZvcmNlVXBkYXRlKCk7XG4gICAgICB9KTtcbiAgICAgIGlmICghQ3Rvcikge1xuICAgICAgICAvLyByZXR1cm4gbm90aGluZyBpZiB0aGlzIGlzIGluZGVlZCBhbiBhc3luYyBjb21wb25lbnRcbiAgICAgICAgLy8gd2FpdCBmb3IgdGhlIGNhbGxiYWNrIHRvIHRyaWdnZXIgcGFyZW50IHVwZGF0ZS5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gcmVzb2x2ZSBjb25zdHJ1Y3RvciBvcHRpb25zIGluIGNhc2UgZ2xvYmFsIG1peGlucyBhcmUgYXBwbGllZCBhZnRlclxuICAvLyBjb21wb25lbnQgY29uc3RydWN0b3IgY3JlYXRpb25cbiAgcmVzb2x2ZUNvbnN0cnVjdG9yT3B0aW9ucyhDdG9yKTtcblxuICBkYXRhID0gZGF0YSB8fCB7fTtcblxuICAvLyBleHRyYWN0IHByb3BzXG4gIHZhciBwcm9wc0RhdGEgPSBleHRyYWN0UHJvcHMoZGF0YSwgQ3Rvcik7XG5cbiAgLy8gZnVuY3Rpb25hbCBjb21wb25lbnRcbiAgaWYgKEN0b3Iub3B0aW9ucy5mdW5jdGlvbmFsKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQoQ3RvciwgcHJvcHNEYXRhLCBkYXRhLCBjb250ZXh0LCBjaGlsZHJlbilcbiAgfVxuXG4gIC8vIGV4dHJhY3QgbGlzdGVuZXJzLCBzaW5jZSB0aGVzZSBuZWVkcyB0byBiZSB0cmVhdGVkIGFzXG4gIC8vIGNoaWxkIGNvbXBvbmVudCBsaXN0ZW5lcnMgaW5zdGVhZCBvZiBET00gbGlzdGVuZXJzXG4gIHZhciBsaXN0ZW5lcnMgPSBkYXRhLm9uO1xuICAvLyByZXBsYWNlIHdpdGggbGlzdGVuZXJzIHdpdGggLm5hdGl2ZSBtb2RpZmllclxuICBkYXRhLm9uID0gZGF0YS5uYXRpdmVPbjtcblxuICBpZiAoQ3Rvci5vcHRpb25zLmFic3RyYWN0KSB7XG4gICAgLy8gYWJzdHJhY3QgY29tcG9uZW50cyBkbyBub3Qga2VlcCBhbnl0aGluZ1xuICAgIC8vIG90aGVyIHRoYW4gcHJvcHMgJiBsaXN0ZW5lcnNcbiAgICBkYXRhID0ge307XG4gIH1cblxuICAvLyBtZXJnZSBjb21wb25lbnQgbWFuYWdlbWVudCBob29rcyBvbnRvIHRoZSBwbGFjZWhvbGRlciBub2RlXG4gIG1lcmdlSG9va3MoZGF0YSk7XG5cbiAgLy8gcmV0dXJuIGEgcGxhY2Vob2xkZXIgdm5vZGVcbiAgdmFyIG5hbWUgPSBDdG9yLm9wdGlvbnMubmFtZSB8fCB0YWc7XG4gIHZhciB2bm9kZSA9IG5ldyBWTm9kZShcbiAgICAoXCJ2dWUtY29tcG9uZW50LVwiICsgKEN0b3IuY2lkKSArIChuYW1lID8gKFwiLVwiICsgbmFtZSkgOiAnJykpLFxuICAgIGRhdGEsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNvbnRleHQsXG4gICAgeyBDdG9yOiBDdG9yLCBwcm9wc0RhdGE6IHByb3BzRGF0YSwgbGlzdGVuZXJzOiBsaXN0ZW5lcnMsIHRhZzogdGFnLCBjaGlsZHJlbjogY2hpbGRyZW4gfVxuICApO1xuICByZXR1cm4gdm5vZGVcbn1cblxuZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudCAoXG4gIEN0b3IsXG4gIHByb3BzRGF0YSxcbiAgZGF0YSxcbiAgY29udGV4dCxcbiAgY2hpbGRyZW5cbikge1xuICB2YXIgcHJvcHMgPSB7fTtcbiAgdmFyIHByb3BPcHRpb25zID0gQ3Rvci5vcHRpb25zLnByb3BzO1xuICBpZiAocHJvcE9wdGlvbnMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvcE9wdGlvbnMpIHtcbiAgICAgIHByb3BzW2tleV0gPSB2YWxpZGF0ZVByb3Aoa2V5LCBwcm9wT3B0aW9ucywgcHJvcHNEYXRhKTtcbiAgICB9XG4gIH1cbiAgLy8gZW5zdXJlIHRoZSBjcmVhdGVFbGVtZW50IGZ1bmN0aW9uIGluIGZ1bmN0aW9uYWwgY29tcG9uZW50c1xuICAvLyBnZXRzIGEgdW5pcXVlIGNvbnRleHQgLSB0aGlzIGlzIG5lY2Vzc2FyeSBmb3IgY29ycmVjdCBuYW1lZCBzbG90IGNoZWNrXG4gIHZhciBfY29udGV4dCA9IE9iamVjdC5jcmVhdGUoY29udGV4dCk7XG4gIHZhciBoID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQpIHsgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoX2NvbnRleHQsIGEsIGIsIGMsIGQsIHRydWUpOyB9O1xuICB2YXIgdm5vZGUgPSBDdG9yLm9wdGlvbnMucmVuZGVyLmNhbGwobnVsbCwgaCwge1xuICAgIHByb3BzOiBwcm9wcyxcbiAgICBkYXRhOiBkYXRhLFxuICAgIHBhcmVudDogY29udGV4dCxcbiAgICBjaGlsZHJlbjogY2hpbGRyZW4sXG4gICAgc2xvdHM6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlc29sdmVTbG90cyhjaGlsZHJlbiwgY29udGV4dCk7IH1cbiAgfSk7XG4gIGlmICh2bm9kZSBpbnN0YW5jZW9mIFZOb2RlKSB7XG4gICAgdm5vZGUuZnVuY3Rpb25hbENvbnRleHQgPSBjb250ZXh0O1xuICAgIGlmIChkYXRhLnNsb3QpIHtcbiAgICAgICh2bm9kZS5kYXRhIHx8ICh2bm9kZS5kYXRhID0ge30pKS5zbG90ID0gZGF0YS5zbG90O1xuICAgIH1cbiAgfVxuICByZXR1cm4gdm5vZGVcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50SW5zdGFuY2VGb3JWbm9kZSAoXG4gIHZub2RlLCAvLyB3ZSBrbm93IGl0J3MgTW91bnRlZENvbXBvbmVudFZOb2RlIGJ1dCBmbG93IGRvZXNuJ3RcbiAgcGFyZW50LCAvLyBhY3RpdmVJbnN0YW5jZSBpbiBsaWZlY3ljbGUgc3RhdGVcbiAgcGFyZW50RWxtLFxuICByZWZFbG1cbikge1xuICB2YXIgdm5vZGVDb21wb25lbnRPcHRpb25zID0gdm5vZGUuY29tcG9uZW50T3B0aW9ucztcbiAgdmFyIG9wdGlvbnMgPSB7XG4gICAgX2lzQ29tcG9uZW50OiB0cnVlLFxuICAgIHBhcmVudDogcGFyZW50LFxuICAgIHByb3BzRGF0YTogdm5vZGVDb21wb25lbnRPcHRpb25zLnByb3BzRGF0YSxcbiAgICBfY29tcG9uZW50VGFnOiB2bm9kZUNvbXBvbmVudE9wdGlvbnMudGFnLFxuICAgIF9wYXJlbnRWbm9kZTogdm5vZGUsXG4gICAgX3BhcmVudExpc3RlbmVyczogdm5vZGVDb21wb25lbnRPcHRpb25zLmxpc3RlbmVycyxcbiAgICBfcmVuZGVyQ2hpbGRyZW46IHZub2RlQ29tcG9uZW50T3B0aW9ucy5jaGlsZHJlbixcbiAgICBfcGFyZW50RWxtOiBwYXJlbnRFbG0gfHwgbnVsbCxcbiAgICBfcmVmRWxtOiByZWZFbG0gfHwgbnVsbFxuICB9O1xuICAvLyBjaGVjayBpbmxpbmUtdGVtcGxhdGUgcmVuZGVyIGZ1bmN0aW9uc1xuICB2YXIgaW5saW5lVGVtcGxhdGUgPSB2bm9kZS5kYXRhLmlubGluZVRlbXBsYXRlO1xuICBpZiAoaW5saW5lVGVtcGxhdGUpIHtcbiAgICBvcHRpb25zLnJlbmRlciA9IGlubGluZVRlbXBsYXRlLnJlbmRlcjtcbiAgICBvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IGlubGluZVRlbXBsYXRlLnN0YXRpY1JlbmRlckZucztcbiAgfVxuICByZXR1cm4gbmV3IHZub2RlQ29tcG9uZW50T3B0aW9ucy5DdG9yKG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGluaXQgKFxuICB2bm9kZSxcbiAgaHlkcmF0aW5nLFxuICBwYXJlbnRFbG0sXG4gIHJlZkVsbVxuKSB7XG4gIGlmICghdm5vZGUuY29tcG9uZW50SW5zdGFuY2UgfHwgdm5vZGUuY29tcG9uZW50SW5zdGFuY2UuX2lzRGVzdHJveWVkKSB7XG4gICAgdmFyIGNoaWxkID0gdm5vZGUuY29tcG9uZW50SW5zdGFuY2UgPSBjcmVhdGVDb21wb25lbnRJbnN0YW5jZUZvclZub2RlKFxuICAgICAgdm5vZGUsXG4gICAgICBhY3RpdmVJbnN0YW5jZSxcbiAgICAgIHBhcmVudEVsbSxcbiAgICAgIHJlZkVsbVxuICAgICk7XG4gICAgY2hpbGQuJG1vdW50KGh5ZHJhdGluZyA/IHZub2RlLmVsbSA6IHVuZGVmaW5lZCwgaHlkcmF0aW5nKTtcbiAgfSBlbHNlIGlmICh2bm9kZS5kYXRhLmtlZXBBbGl2ZSkge1xuICAgIC8vIGtlcHQtYWxpdmUgY29tcG9uZW50cywgdHJlYXQgYXMgYSBwYXRjaFxuICAgIHZhciBtb3VudGVkTm9kZSA9IHZub2RlOyAvLyB3b3JrIGFyb3VuZCBmbG93XG4gICAgcHJlcGF0Y2gobW91bnRlZE5vZGUsIG1vdW50ZWROb2RlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmVwYXRjaCAoXG4gIG9sZFZub2RlLFxuICB2bm9kZVxuKSB7XG4gIHZhciBvcHRpb25zID0gdm5vZGUuY29tcG9uZW50T3B0aW9ucztcbiAgdmFyIGNoaWxkID0gdm5vZGUuY29tcG9uZW50SW5zdGFuY2UgPSBvbGRWbm9kZS5jb21wb25lbnRJbnN0YW5jZTtcbiAgY2hpbGQuX3VwZGF0ZUZyb21QYXJlbnQoXG4gICAgb3B0aW9ucy5wcm9wc0RhdGEsIC8vIHVwZGF0ZWQgcHJvcHNcbiAgICBvcHRpb25zLmxpc3RlbmVycywgLy8gdXBkYXRlZCBsaXN0ZW5lcnNcbiAgICB2bm9kZSwgLy8gbmV3IHBhcmVudCB2bm9kZVxuICAgIG9wdGlvbnMuY2hpbGRyZW4gLy8gbmV3IGNoaWxkcmVuXG4gICk7XG59XG5cbmZ1bmN0aW9uIGluc2VydCAodm5vZGUpIHtcbiAgaWYgKCF2bm9kZS5jb21wb25lbnRJbnN0YW5jZS5faXNNb3VudGVkKSB7XG4gICAgdm5vZGUuY29tcG9uZW50SW5zdGFuY2UuX2lzTW91bnRlZCA9IHRydWU7XG4gICAgY2FsbEhvb2sodm5vZGUuY29tcG9uZW50SW5zdGFuY2UsICdtb3VudGVkJyk7XG4gIH1cbiAgaWYgKHZub2RlLmRhdGEua2VlcEFsaXZlKSB7XG4gICAgdm5vZGUuY29tcG9uZW50SW5zdGFuY2UuX2luYWN0aXZlID0gZmFsc2U7XG4gICAgY2FsbEhvb2sodm5vZGUuY29tcG9uZW50SW5zdGFuY2UsICdhY3RpdmF0ZWQnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZXN0cm95JDEgKHZub2RlKSB7XG4gIGlmICghdm5vZGUuY29tcG9uZW50SW5zdGFuY2UuX2lzRGVzdHJveWVkKSB7XG4gICAgaWYgKCF2bm9kZS5kYXRhLmtlZXBBbGl2ZSkge1xuICAgICAgdm5vZGUuY29tcG9uZW50SW5zdGFuY2UuJGRlc3Ryb3koKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdm5vZGUuY29tcG9uZW50SW5zdGFuY2UuX2luYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGNhbGxIb29rKHZub2RlLmNvbXBvbmVudEluc3RhbmNlLCAnZGVhY3RpdmF0ZWQnKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUFzeW5jQ29tcG9uZW50IChcbiAgZmFjdG9yeSxcbiAgYmFzZUN0b3IsXG4gIGNiXG4pIHtcbiAgaWYgKGZhY3RvcnkucmVxdWVzdGVkKSB7XG4gICAgLy8gcG9vbCBjYWxsYmFja3NcbiAgICBmYWN0b3J5LnBlbmRpbmdDYWxsYmFja3MucHVzaChjYik7XG4gIH0gZWxzZSB7XG4gICAgZmFjdG9yeS5yZXF1ZXN0ZWQgPSB0cnVlO1xuICAgIHZhciBjYnMgPSBmYWN0b3J5LnBlbmRpbmdDYWxsYmFja3MgPSBbY2JdO1xuICAgIHZhciBzeW5jID0gdHJ1ZTtcblxuICAgIHZhciByZXNvbHZlID0gZnVuY3Rpb24gKHJlcykge1xuICAgICAgaWYgKGlzT2JqZWN0KHJlcykpIHtcbiAgICAgICAgcmVzID0gYmFzZUN0b3IuZXh0ZW5kKHJlcyk7XG4gICAgICB9XG4gICAgICAvLyBjYWNoZSByZXNvbHZlZFxuICAgICAgZmFjdG9yeS5yZXNvbHZlZCA9IHJlcztcbiAgICAgIC8vIGludm9rZSBjYWxsYmFja3Mgb25seSBpZiB0aGlzIGlzIG5vdCBhIHN5bmNocm9ub3VzIHJlc29sdmVcbiAgICAgIC8vIChhc3luYyByZXNvbHZlcyBhcmUgc2hpbW1lZCBhcyBzeW5jaHJvbm91cyBkdXJpbmcgU1NSKVxuICAgICAgaWYgKCFzeW5jKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2JzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGNic1tpXShyZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciByZWplY3QgPSBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oXG4gICAgICAgIFwiRmFpbGVkIHRvIHJlc29sdmUgYXN5bmMgY29tcG9uZW50OiBcIiArIChTdHJpbmcoZmFjdG9yeSkpICtcbiAgICAgICAgKHJlYXNvbiA/IChcIlxcblJlYXNvbjogXCIgKyByZWFzb24pIDogJycpXG4gICAgICApO1xuICAgIH07XG5cbiAgICB2YXIgcmVzID0gZmFjdG9yeShyZXNvbHZlLCByZWplY3QpO1xuXG4gICAgLy8gaGFuZGxlIHByb21pc2VcbiAgICBpZiAocmVzICYmIHR5cGVvZiByZXMudGhlbiA9PT0gJ2Z1bmN0aW9uJyAmJiAhZmFjdG9yeS5yZXNvbHZlZCkge1xuICAgICAgcmVzLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9XG5cbiAgICBzeW5jID0gZmFsc2U7XG4gICAgLy8gcmV0dXJuIGluIGNhc2UgcmVzb2x2ZWQgc3luY2hyb25vdXNseVxuICAgIHJldHVybiBmYWN0b3J5LnJlc29sdmVkXG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdFByb3BzIChkYXRhLCBDdG9yKSB7XG4gIC8vIHdlIGFyZSBvbmx5IGV4dHJhY3RpbmcgcmF3IHZhbHVlcyBoZXJlLlxuICAvLyB2YWxpZGF0aW9uIGFuZCBkZWZhdWx0IHZhbHVlcyBhcmUgaGFuZGxlZCBpbiB0aGUgY2hpbGRcbiAgLy8gY29tcG9uZW50IGl0c2VsZi5cbiAgdmFyIHByb3BPcHRpb25zID0gQ3Rvci5vcHRpb25zLnByb3BzO1xuICBpZiAoIXByb3BPcHRpb25zKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIHJlcyA9IHt9O1xuICB2YXIgYXR0cnMgPSBkYXRhLmF0dHJzO1xuICB2YXIgcHJvcHMgPSBkYXRhLnByb3BzO1xuICB2YXIgZG9tUHJvcHMgPSBkYXRhLmRvbVByb3BzO1xuICBpZiAoYXR0cnMgfHwgcHJvcHMgfHwgZG9tUHJvcHMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gcHJvcE9wdGlvbnMpIHtcbiAgICAgIHZhciBhbHRLZXkgPSBoeXBoZW5hdGUoa2V5KTtcbiAgICAgIGNoZWNrUHJvcChyZXMsIHByb3BzLCBrZXksIGFsdEtleSwgdHJ1ZSkgfHxcbiAgICAgIGNoZWNrUHJvcChyZXMsIGF0dHJzLCBrZXksIGFsdEtleSkgfHxcbiAgICAgIGNoZWNrUHJvcChyZXMsIGRvbVByb3BzLCBrZXksIGFsdEtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gY2hlY2tQcm9wIChcbiAgcmVzLFxuICBoYXNoLFxuICBrZXksXG4gIGFsdEtleSxcbiAgcHJlc2VydmVcbikge1xuICBpZiAoaGFzaCkge1xuICAgIGlmIChoYXNPd24oaGFzaCwga2V5KSkge1xuICAgICAgcmVzW2tleV0gPSBoYXNoW2tleV07XG4gICAgICBpZiAoIXByZXNlcnZlKSB7XG4gICAgICAgIGRlbGV0ZSBoYXNoW2tleV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSBpZiAoaGFzT3duKGhhc2gsIGFsdEtleSkpIHtcbiAgICAgIHJlc1trZXldID0gaGFzaFthbHRLZXldO1xuICAgICAgaWYgKCFwcmVzZXJ2ZSkge1xuICAgICAgICBkZWxldGUgaGFzaFthbHRLZXldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIG1lcmdlSG9va3MgKGRhdGEpIHtcbiAgaWYgKCFkYXRhLmhvb2spIHtcbiAgICBkYXRhLmhvb2sgPSB7fTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGhvb2tzVG9NZXJnZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBob29rc1RvTWVyZ2VbaV07XG4gICAgdmFyIGZyb21QYXJlbnQgPSBkYXRhLmhvb2tba2V5XTtcbiAgICB2YXIgb3VycyA9IGhvb2tzW2tleV07XG4gICAgZGF0YS5ob29rW2tleV0gPSBmcm9tUGFyZW50ID8gbWVyZ2VIb29rJDEob3VycywgZnJvbVBhcmVudCkgOiBvdXJzO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1lcmdlSG9vayQxIChvbmUsIHR3bykge1xuICByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMsIGQpIHtcbiAgICBvbmUoYSwgYiwgYywgZCk7XG4gICAgdHdvKGEsIGIsIGMsIGQpO1xuICB9XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBtZXJnZVZOb2RlSG9vayAoZGVmLCBob29rS2V5LCBob29rLCBrZXkpIHtcbiAga2V5ID0ga2V5ICsgaG9va0tleTtcbiAgdmFyIGluamVjdGVkSGFzaCA9IGRlZi5fX2luamVjdGVkIHx8IChkZWYuX19pbmplY3RlZCA9IHt9KTtcbiAgaWYgKCFpbmplY3RlZEhhc2hba2V5XSkge1xuICAgIGluamVjdGVkSGFzaFtrZXldID0gdHJ1ZTtcbiAgICB2YXIgb2xkSG9vayA9IGRlZltob29rS2V5XTtcbiAgICBpZiAob2xkSG9vaykge1xuICAgICAgZGVmW2hvb2tLZXldID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBvbGRIb29rLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGhvb2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZltob29rS2V5XSA9IGhvb2s7XG4gICAgfVxuICB9XG59XG5cbi8qICAqL1xuXG52YXIgbm9ybWFsaXplRXZlbnQgPSBjYWNoZWQoZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyIG9uY2UgPSBuYW1lLmNoYXJBdCgwKSA9PT0gJ34nOyAvLyBQcmVmaXhlZCBsYXN0LCBjaGVja2VkIGZpcnN0XG4gIG5hbWUgPSBvbmNlID8gbmFtZS5zbGljZSgxKSA6IG5hbWU7XG4gIHZhciBjYXB0dXJlID0gbmFtZS5jaGFyQXQoMCkgPT09ICchJztcbiAgbmFtZSA9IGNhcHR1cmUgPyBuYW1lLnNsaWNlKDEpIDogbmFtZTtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIG9uY2U6IG9uY2UsXG4gICAgY2FwdHVyZTogY2FwdHVyZVxuICB9XG59KTtcblxuZnVuY3Rpb24gY3JlYXRlRXZlbnRIYW5kbGUgKGZuKSB7XG4gIHZhciBoYW5kbGUgPSB7XG4gICAgZm46IGZuLFxuICAgIGludm9rZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmd1bWVudHMkMSA9IGFyZ3VtZW50cztcblxuICAgICAgdmFyIGZuID0gaGFuZGxlLmZuO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZm4pKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBmbltpXS5hcHBseShudWxsLCBhcmd1bWVudHMkMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICByZXR1cm4gaGFuZGxlXG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUxpc3RlbmVycyAoXG4gIG9uLFxuICBvbGRPbixcbiAgYWRkLFxuICByZW1vdmUkJDEsXG4gIHZtXG4pIHtcbiAgdmFyIG5hbWUsIGN1ciwgb2xkLCBldmVudDtcbiAgZm9yIChuYW1lIGluIG9uKSB7XG4gICAgY3VyID0gb25bbmFtZV07XG4gICAgb2xkID0gb2xkT25bbmFtZV07XG4gICAgZXZlbnQgPSBub3JtYWxpemVFdmVudChuYW1lKTtcbiAgICBpZiAoIWN1cikge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgICBcIkludmFsaWQgaGFuZGxlciBmb3IgZXZlbnQgXFxcIlwiICsgKGV2ZW50Lm5hbWUpICsgXCJcXFwiOiBnb3QgXCIgKyBTdHJpbmcoY3VyKSxcbiAgICAgICAgdm1cbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICghb2xkKSB7XG4gICAgICBpZiAoIWN1ci5pbnZva2VyKSB7XG4gICAgICAgIGN1ciA9IG9uW25hbWVdID0gY3JlYXRlRXZlbnRIYW5kbGUoY3VyKTtcbiAgICAgIH1cbiAgICAgIGFkZChldmVudC5uYW1lLCBjdXIuaW52b2tlciwgZXZlbnQub25jZSwgZXZlbnQuY2FwdHVyZSk7XG4gICAgfSBlbHNlIGlmIChjdXIgIT09IG9sZCkge1xuICAgICAgb2xkLmZuID0gY3VyO1xuICAgICAgb25bbmFtZV0gPSBvbGQ7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgIGlmICghb25bbmFtZV0pIHtcbiAgICAgIGV2ZW50ID0gbm9ybWFsaXplRXZlbnQobmFtZSk7XG4gICAgICByZW1vdmUkJDEoZXZlbnQubmFtZSwgb2xkT25bbmFtZV0uaW52b2tlciwgZXZlbnQuY2FwdHVyZSk7XG4gICAgfVxuICB9XG59XG5cbi8qICAqL1xuXG4vLyBUaGUgdGVtcGxhdGUgY29tcGlsZXIgYXR0ZW1wdHMgdG8gbWluaW1pemUgdGhlIG5lZWQgZm9yIG5vcm1hbGl6YXRpb24gYnlcbi8vIHN0YXRpY2FsbHkgYW5hbHl6aW5nIHRoZSB0ZW1wbGF0ZSBhdCBjb21waWxlIHRpbWUuXG4vL1xuLy8gRm9yIHBsYWluIEhUTUwgbWFya3VwLCBub3JtYWxpemF0aW9uIGNhbiBiZSBjb21wbGV0ZWx5IHNraXBwZWQgYmVjYXVzZSB0aGVcbi8vIGdlbmVyYXRlZCByZW5kZXIgZnVuY3Rpb24gaXMgZ3VhcmFudGVlZCB0byByZXR1cm4gQXJyYXk8Vk5vZGU+LiBUaGVyZSBhcmVcbi8vIHR3byBjYXNlcyB3aGVyZSBleHRyYSBub3JtYWxpemF0aW9uIGlzIG5lZWRlZDpcblxuLy8gMS4gV2hlbiB0aGUgY2hpbGRyZW4gY29udGFpbnMgY29tcG9uZW50cyAtIGJlY2F1c2UgYSBmdW5jdGlvbmFsIGNvbXBvbmVudFxuLy8gbWF5IHJldHVybiBhbiBBcnJheSBpbnN0ZWFkIG9mIGEgc2luZ2xlIHJvb3QuIEluIHRoaXMgY2FzZSwganVzdCBhIHNpbXBsZVxuLy8gbm9tcmFsaXphdGlvbiBpcyBuZWVkZWQgLSBpZiBhbnkgY2hpbGQgaXMgYW4gQXJyYXksIHdlIGZsYXR0ZW4gdGhlIHdob2xlXG4vLyB0aGluZyB3aXRoIEFycmF5LnByb3RvdHlwZS5jb25jYXQuIEl0IGlzIGd1YXJhbnRlZWQgdG8gYmUgb25seSAxLWxldmVsIGRlZXBcbi8vIGJlY2F1c2UgZnVuY3Rpb25hbCBjb21wb25lbnRzIGFscmVhZHkgbm9ybWFsaXplIHRoZWlyIG93biBjaGlsZHJlbi5cbmZ1bmN0aW9uIHNpbXBsZU5vcm1hbGl6ZUNoaWxkcmVuIChjaGlsZHJlbikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW5baV0pKSB7XG4gICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgY2hpbGRyZW4pXG4gICAgfVxuICB9XG4gIHJldHVybiBjaGlsZHJlblxufVxuXG4vLyAyLiBXaGVuIHRoZSBjaGlsZHJlbiBjb250YWlucyBjb25zdHJjdXRzIHRoYXQgYWx3YXlzIGdlbmVyYXRlZCBuZXN0ZWQgQXJyYXlzLFxuLy8gZS5nLiA8dGVtcGxhdGU+LCA8c2xvdD4sIHYtZm9yLCBvciB3aGVuIHRoZSBjaGlsZHJlbiBpcyBwcm92aWRlZCBieSB1c2VyXG4vLyB3aXRoIGhhbmQtd3JpdHRlbiByZW5kZXIgZnVuY3Rpb25zIC8gSlNYLiBJbiBzdWNoIGNhc2VzIGEgZnVsbCBub3JtYWxpemF0aW9uXG4vLyBpcyBuZWVkZWQgdG8gY2F0ZXIgdG8gYWxsIHBvc3NpYmxlIHR5cGVzIG9mIGNoaWxkcmVuIHZhbHVlcy5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNoaWxkcmVuIChjaGlsZHJlbikge1xuICByZXR1cm4gaXNQcmltaXRpdmUoY2hpbGRyZW4pXG4gICAgPyBbY3JlYXRlVGV4dFZOb2RlKGNoaWxkcmVuKV1cbiAgICA6IEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pXG4gICAgICA/IG5vcm1hbGl6ZUFycmF5Q2hpbGRyZW4oY2hpbGRyZW4pXG4gICAgICA6IHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheUNoaWxkcmVuIChjaGlsZHJlbiwgbmVzdGVkSW5kZXgpIHtcbiAgdmFyIHJlcyA9IFtdO1xuICB2YXIgaSwgYywgbGFzdDtcbiAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IGNoaWxkcmVuW2ldO1xuICAgIGlmIChjID09IG51bGwgfHwgdHlwZW9mIGMgPT09ICdib29sZWFuJykgeyBjb250aW51ZSB9XG4gICAgbGFzdCA9IHJlc1tyZXMubGVuZ3RoIC0gMV07XG4gICAgLy8gIG5lc3RlZFxuICAgIGlmIChBcnJheS5pc0FycmF5KGMpKSB7XG4gICAgICByZXMucHVzaC5hcHBseShyZXMsIG5vcm1hbGl6ZUFycmF5Q2hpbGRyZW4oYywgKChuZXN0ZWRJbmRleCB8fCAnJykgKyBcIl9cIiArIGkpKSk7XG4gICAgfSBlbHNlIGlmIChpc1ByaW1pdGl2ZShjKSkge1xuICAgICAgaWYgKGxhc3QgJiYgbGFzdC50ZXh0KSB7XG4gICAgICAgIGxhc3QudGV4dCArPSBTdHJpbmcoYyk7XG4gICAgICB9IGVsc2UgaWYgKGMgIT09ICcnKSB7XG4gICAgICAgIC8vIGNvbnZlcnQgcHJpbWl0aXZlIHRvIHZub2RlXG4gICAgICAgIHJlcy5wdXNoKGNyZWF0ZVRleHRWTm9kZShjKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjLnRleHQgJiYgbGFzdCAmJiBsYXN0LnRleHQpIHtcbiAgICAgICAgcmVzW3Jlcy5sZW5ndGggLSAxXSA9IGNyZWF0ZVRleHRWTm9kZShsYXN0LnRleHQgKyBjLnRleHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGVmYXVsdCBrZXkgZm9yIG5lc3RlZCBhcnJheSBjaGlsZHJlbiAobGlrZWx5IGdlbmVyYXRlZCBieSB2LWZvcilcbiAgICAgICAgaWYgKGMudGFnICYmIGMua2V5ID09IG51bGwgJiYgbmVzdGVkSW5kZXggIT0gbnVsbCkge1xuICAgICAgICAgIGMua2V5ID0gXCJfX3ZsaXN0XCIgKyBuZXN0ZWRJbmRleCArIFwiX1wiICsgaSArIFwiX19cIjtcbiAgICAgICAgfVxuICAgICAgICByZXMucHVzaChjKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG4vKiAgKi9cblxuZnVuY3Rpb24gZ2V0Rmlyc3RDb21wb25lbnRDaGlsZCAoY2hpbGRyZW4pIHtcbiAgcmV0dXJuIGNoaWxkcmVuICYmIGNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYyAmJiBjLmNvbXBvbmVudE9wdGlvbnM7IH0pWzBdXG59XG5cbi8qICAqL1xuXG52YXIgU0lNUExFX05PUk1BTElaRSA9IDE7XG52YXIgQUxXQVlTX05PUk1BTElaRSA9IDI7XG5cbi8vIHdyYXBwZXIgZnVuY3Rpb24gZm9yIHByb3ZpZGluZyBhIG1vcmUgZmxleGlibGUgaW50ZXJmYWNlXG4vLyB3aXRob3V0IGdldHRpbmcgeWVsbGVkIGF0IGJ5IGZsb3dcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQgKFxuICBjb250ZXh0LFxuICB0YWcsXG4gIGRhdGEsXG4gIGNoaWxkcmVuLFxuICBub3JtYWxpemF0aW9uVHlwZSxcbiAgYWx3YXlzTm9ybWFsaXplXG4pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkgfHwgaXNQcmltaXRpdmUoZGF0YSkpIHtcbiAgICBub3JtYWxpemF0aW9uVHlwZSA9IGNoaWxkcmVuO1xuICAgIGNoaWxkcmVuID0gZGF0YTtcbiAgICBkYXRhID0gdW5kZWZpbmVkO1xuICB9XG4gIGlmIChhbHdheXNOb3JtYWxpemUpIHsgbm9ybWFsaXphdGlvblR5cGUgPSBBTFdBWVNfTk9STUFMSVpFOyB9XG4gIHJldHVybiBfY3JlYXRlRWxlbWVudChjb250ZXh0LCB0YWcsIGRhdGEsIGNoaWxkcmVuLCBub3JtYWxpemF0aW9uVHlwZSlcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUVsZW1lbnQgKFxuICBjb250ZXh0LFxuICB0YWcsXG4gIGRhdGEsXG4gIGNoaWxkcmVuLFxuICBub3JtYWxpemF0aW9uVHlwZVxuKSB7XG4gIGlmIChkYXRhICYmIGRhdGEuX19vYl9fKSB7XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgXCJBdm9pZCB1c2luZyBvYnNlcnZlZCBkYXRhIG9iamVjdCBhcyB2bm9kZSBkYXRhOiBcIiArIChKU09OLnN0cmluZ2lmeShkYXRhKSkgKyBcIlxcblwiICtcbiAgICAgICdBbHdheXMgY3JlYXRlIGZyZXNoIHZub2RlIGRhdGEgb2JqZWN0cyBpbiBlYWNoIHJlbmRlciEnLFxuICAgICAgY29udGV4dFxuICAgICk7XG4gICAgcmV0dXJuIGNyZWF0ZUVtcHR5Vk5vZGUoKVxuICB9XG4gIGlmICghdGFnKSB7XG4gICAgLy8gaW4gY2FzZSBvZiBjb21wb25lbnQgOmlzIHNldCB0byBmYWxzeSB2YWx1ZVxuICAgIHJldHVybiBjcmVhdGVFbXB0eVZOb2RlKClcbiAgfVxuICAvLyBzdXBwb3J0IHNpbmdsZSBmdW5jdGlvbiBjaGlsZHJlbiBhcyBkZWZhdWx0IHNjb3BlZCBzbG90XG4gIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSAmJlxuICAgICAgdHlwZW9mIGNoaWxkcmVuWzBdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZGF0YSA9IGRhdGEgfHwge307XG4gICAgZGF0YS5zY29wZWRTbG90cyA9IHsgZGVmYXVsdDogY2hpbGRyZW5bMF0gfTtcbiAgICBjaGlsZHJlbi5sZW5ndGggPSAwO1xuICB9XG4gIGlmIChub3JtYWxpemF0aW9uVHlwZSA9PT0gQUxXQVlTX05PUk1BTElaRSkge1xuICAgIGNoaWxkcmVuID0gbm9ybWFsaXplQ2hpbGRyZW4oY2hpbGRyZW4pO1xuICB9IGVsc2UgaWYgKG5vcm1hbGl6YXRpb25UeXBlID09PSBTSU1QTEVfTk9STUFMSVpFKSB7XG4gICAgY2hpbGRyZW4gPSBzaW1wbGVOb3JtYWxpemVDaGlsZHJlbihjaGlsZHJlbik7XG4gIH1cbiAgdmFyIHZub2RlLCBucztcbiAgaWYgKHR5cGVvZiB0YWcgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIEN0b3I7XG4gICAgbnMgPSBjb25maWcuZ2V0VGFnTmFtZXNwYWNlKHRhZyk7XG4gICAgaWYgKGNvbmZpZy5pc1Jlc2VydmVkVGFnKHRhZykpIHtcbiAgICAgIC8vIHBsYXRmb3JtIGJ1aWx0LWluIGVsZW1lbnRzXG4gICAgICB2bm9kZSA9IG5ldyBWTm9kZShcbiAgICAgICAgY29uZmlnLnBhcnNlUGxhdGZvcm1UYWdOYW1lKHRhZyksIGRhdGEsIGNoaWxkcmVuLFxuICAgICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY29udGV4dFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKChDdG9yID0gcmVzb2x2ZUFzc2V0KGNvbnRleHQuJG9wdGlvbnMsICdjb21wb25lbnRzJywgdGFnKSkpIHtcbiAgICAgIC8vIGNvbXBvbmVudFxuICAgICAgdm5vZGUgPSBjcmVhdGVDb21wb25lbnQoQ3RvciwgZGF0YSwgY29udGV4dCwgY2hpbGRyZW4sIHRhZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHVua25vd24gb3IgdW5saXN0ZWQgbmFtZXNwYWNlZCBlbGVtZW50c1xuICAgICAgLy8gY2hlY2sgYXQgcnVudGltZSBiZWNhdXNlIGl0IG1heSBnZXQgYXNzaWduZWQgYSBuYW1lc3BhY2Ugd2hlbiBpdHNcbiAgICAgIC8vIHBhcmVudCBub3JtYWxpemVzIGNoaWxkcmVuXG4gICAgICB2bm9kZSA9IG5ldyBWTm9kZShcbiAgICAgICAgdGFnLCBkYXRhLCBjaGlsZHJlbixcbiAgICAgICAgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNvbnRleHRcbiAgICAgICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIGRpcmVjdCBjb21wb25lbnQgb3B0aW9ucyAvIGNvbnN0cnVjdG9yXG4gICAgdm5vZGUgPSBjcmVhdGVDb21wb25lbnQodGFnLCBkYXRhLCBjb250ZXh0LCBjaGlsZHJlbik7XG4gIH1cbiAgaWYgKHZub2RlKSB7XG4gICAgaWYgKG5zKSB7IGFwcGx5TlModm5vZGUsIG5zKTsgfVxuICAgIHJldHVybiB2bm9kZVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBjcmVhdGVFbXB0eVZOb2RlKClcbiAgfVxufVxuXG5mdW5jdGlvbiBhcHBseU5TICh2bm9kZSwgbnMpIHtcbiAgdm5vZGUubnMgPSBucztcbiAgaWYgKHZub2RlLnRhZyA9PT0gJ2ZvcmVpZ25PYmplY3QnKSB7XG4gICAgLy8gdXNlIGRlZmF1bHQgbmFtZXNwYWNlIGluc2lkZSBmb3JlaWduT2JqZWN0XG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKHZub2RlLmNoaWxkcmVuKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSB2bm9kZS5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBjaGlsZCA9IHZub2RlLmNoaWxkcmVuW2ldO1xuICAgICAgaWYgKGNoaWxkLnRhZyAmJiAhY2hpbGQubnMpIHtcbiAgICAgICAgYXBwbHlOUyhjaGlsZCwgbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKiAgKi9cblxuZnVuY3Rpb24gaW5pdFJlbmRlciAodm0pIHtcbiAgdm0uJHZub2RlID0gbnVsbDsgLy8gdGhlIHBsYWNlaG9sZGVyIG5vZGUgaW4gcGFyZW50IHRyZWVcbiAgdm0uX3Zub2RlID0gbnVsbDsgLy8gdGhlIHJvb3Qgb2YgdGhlIGNoaWxkIHRyZWVcbiAgdm0uX3N0YXRpY1RyZWVzID0gbnVsbDtcbiAgdmFyIHBhcmVudFZub2RlID0gdm0uJG9wdGlvbnMuX3BhcmVudFZub2RlO1xuICB2YXIgcmVuZGVyQ29udGV4dCA9IHBhcmVudFZub2RlICYmIHBhcmVudFZub2RlLmNvbnRleHQ7XG4gIHZtLiRzbG90cyA9IHJlc29sdmVTbG90cyh2bS4kb3B0aW9ucy5fcmVuZGVyQ2hpbGRyZW4sIHJlbmRlckNvbnRleHQpO1xuICB2bS4kc2NvcGVkU2xvdHMgPSB7fTtcbiAgLy8gYmluZCB0aGUgY3JlYXRlRWxlbWVudCBmbiB0byB0aGlzIGluc3RhbmNlXG4gIC8vIHNvIHRoYXQgd2UgZ2V0IHByb3BlciByZW5kZXIgY29udGV4dCBpbnNpZGUgaXQuXG4gIC8vIGFyZ3Mgb3JkZXI6IHRhZywgZGF0YSwgY2hpbGRyZW4sIG5vcm1hbGl6YXRpb25UeXBlLCBhbHdheXNOb3JtYWxpemVcbiAgLy8gaW50ZXJuYWwgdmVyc2lvbiBpcyB1c2VkIGJ5IHJlbmRlciBmdW5jdGlvbnMgY29tcGlsZWQgZnJvbSB0ZW1wbGF0ZXNcbiAgdm0uX2MgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCkgeyByZXR1cm4gY3JlYXRlRWxlbWVudCh2bSwgYSwgYiwgYywgZCwgZmFsc2UpOyB9O1xuICAvLyBub3JtYWxpemF0aW9uIGlzIGFsd2F5cyBhcHBsaWVkIGZvciB0aGUgcHVibGljIHZlcnNpb24sIHVzZWQgaW5cbiAgLy8gdXNlci13cml0dGVuIHJlbmRlciBmdW5jdGlvbnMuXG4gIHZtLiRjcmVhdGVFbGVtZW50ID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQpIHsgcmV0dXJuIGNyZWF0ZUVsZW1lbnQodm0sIGEsIGIsIGMsIGQsIHRydWUpOyB9O1xufVxuXG5mdW5jdGlvbiByZW5kZXJNaXhpbiAoVnVlKSB7XG4gIFZ1ZS5wcm90b3R5cGUuJG5leHRUaWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgcmV0dXJuIG5leHRUaWNrKGZuLCB0aGlzKVxuICB9O1xuXG4gIFZ1ZS5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIHZhciByZWYgPSB2bS4kb3B0aW9ucztcbiAgICB2YXIgcmVuZGVyID0gcmVmLnJlbmRlcjtcbiAgICB2YXIgc3RhdGljUmVuZGVyRm5zID0gcmVmLnN0YXRpY1JlbmRlckZucztcbiAgICB2YXIgX3BhcmVudFZub2RlID0gcmVmLl9wYXJlbnRWbm9kZTtcblxuICAgIGlmICh2bS5faXNNb3VudGVkKSB7XG4gICAgICAvLyBjbG9uZSBzbG90IG5vZGVzIG9uIHJlLXJlbmRlcnNcbiAgICAgIGZvciAodmFyIGtleSBpbiB2bS4kc2xvdHMpIHtcbiAgICAgICAgdm0uJHNsb3RzW2tleV0gPSBjbG9uZVZOb2Rlcyh2bS4kc2xvdHNba2V5XSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF9wYXJlbnRWbm9kZSAmJiBfcGFyZW50Vm5vZGUuZGF0YS5zY29wZWRTbG90cykge1xuICAgICAgdm0uJHNjb3BlZFNsb3RzID0gX3BhcmVudFZub2RlLmRhdGEuc2NvcGVkU2xvdHM7XG4gICAgfVxuXG4gICAgaWYgKHN0YXRpY1JlbmRlckZucyAmJiAhdm0uX3N0YXRpY1RyZWVzKSB7XG4gICAgICB2bS5fc3RhdGljVHJlZXMgPSBbXTtcbiAgICB9XG4gICAgLy8gc2V0IHBhcmVudCB2bm9kZS4gdGhpcyBhbGxvd3MgcmVuZGVyIGZ1bmN0aW9ucyB0byBoYXZlIGFjY2Vzc1xuICAgIC8vIHRvIHRoZSBkYXRhIG9uIHRoZSBwbGFjZWhvbGRlciBub2RlLlxuICAgIHZtLiR2bm9kZSA9IF9wYXJlbnRWbm9kZTtcbiAgICAvLyByZW5kZXIgc2VsZlxuICAgIHZhciB2bm9kZTtcbiAgICB0cnkge1xuICAgICAgdm5vZGUgPSByZW5kZXIuY2FsbCh2bS5fcmVuZGVyUHJveHksIHZtLiRjcmVhdGVFbGVtZW50KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgaWYgKGNvbmZpZy5lcnJvckhhbmRsZXIpIHtcbiAgICAgICAgY29uZmlnLmVycm9ySGFuZGxlci5jYWxsKG51bGwsIGUsIHZtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgd2FybigoXCJFcnJvciB3aGVuIHJlbmRlcmluZyBcIiArIChmb3JtYXRDb21wb25lbnROYW1lKHZtKSkgKyBcIjpcIikpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGVcbiAgICAgIH1cbiAgICAgIC8vIHJldHVybiBwcmV2aW91cyB2bm9kZSB0byBwcmV2ZW50IHJlbmRlciBlcnJvciBjYXVzaW5nIGJsYW5rIGNvbXBvbmVudFxuICAgICAgdm5vZGUgPSB2bS5fdm5vZGU7XG4gICAgfVxuICAgIC8vIHJldHVybiBlbXB0eSB2bm9kZSBpbiBjYXNlIHRoZSByZW5kZXIgZnVuY3Rpb24gZXJyb3JlZCBvdXRcbiAgICBpZiAoISh2bm9kZSBpbnN0YW5jZW9mIFZOb2RlKSkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgQXJyYXkuaXNBcnJheSh2bm9kZSkpIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICAnTXVsdGlwbGUgcm9vdCBub2RlcyByZXR1cm5lZCBmcm9tIHJlbmRlciBmdW5jdGlvbi4gUmVuZGVyIGZ1bmN0aW9uICcgK1xuICAgICAgICAgICdzaG91bGQgcmV0dXJuIGEgc2luZ2xlIHJvb3Qgbm9kZS4nLFxuICAgICAgICAgIHZtXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB2bm9kZSA9IGNyZWF0ZUVtcHR5Vk5vZGUoKTtcbiAgICB9XG4gICAgLy8gc2V0IHBhcmVudFxuICAgIHZub2RlLnBhcmVudCA9IF9wYXJlbnRWbm9kZTtcbiAgICByZXR1cm4gdm5vZGVcbiAgfTtcblxuICAvLyB0b1N0cmluZyBmb3IgbXVzdGFjaGVzXG4gIFZ1ZS5wcm90b3R5cGUuX3MgPSBfdG9TdHJpbmc7XG4gIC8vIGNvbnZlcnQgdGV4dCB0byB2bm9kZVxuICBWdWUucHJvdG90eXBlLl92ID0gY3JlYXRlVGV4dFZOb2RlO1xuICAvLyBudW1iZXIgY29udmVyc2lvblxuICBWdWUucHJvdG90eXBlLl9uID0gdG9OdW1iZXI7XG4gIC8vIGVtcHR5IHZub2RlXG4gIFZ1ZS5wcm90b3R5cGUuX2UgPSBjcmVhdGVFbXB0eVZOb2RlO1xuICAvLyBsb29zZSBlcXVhbFxuICBWdWUucHJvdG90eXBlLl9xID0gbG9vc2VFcXVhbDtcbiAgLy8gbG9vc2UgaW5kZXhPZlxuICBWdWUucHJvdG90eXBlLl9pID0gbG9vc2VJbmRleE9mO1xuXG4gIC8vIHJlbmRlciBzdGF0aWMgdHJlZSBieSBpbmRleFxuICBWdWUucHJvdG90eXBlLl9tID0gZnVuY3Rpb24gcmVuZGVyU3RhdGljIChcbiAgICBpbmRleCxcbiAgICBpc0luRm9yXG4gICkge1xuICAgIHZhciB0cmVlID0gdGhpcy5fc3RhdGljVHJlZXNbaW5kZXhdO1xuICAgIC8vIGlmIGhhcyBhbHJlYWR5LXJlbmRlcmVkIHN0YXRpYyB0cmVlIGFuZCBub3QgaW5zaWRlIHYtZm9yLFxuICAgIC8vIHdlIGNhbiByZXVzZSB0aGUgc2FtZSB0cmVlIGJ5IGRvaW5nIGEgc2hhbGxvdyBjbG9uZS5cbiAgICBpZiAodHJlZSAmJiAhaXNJbkZvcikge1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodHJlZSlcbiAgICAgICAgPyBjbG9uZVZOb2Rlcyh0cmVlKVxuICAgICAgICA6IGNsb25lVk5vZGUodHJlZSlcbiAgICB9XG4gICAgLy8gb3RoZXJ3aXNlLCByZW5kZXIgYSBmcmVzaCB0cmVlLlxuICAgIHRyZWUgPSB0aGlzLl9zdGF0aWNUcmVlc1tpbmRleF0gPSB0aGlzLiRvcHRpb25zLnN0YXRpY1JlbmRlckZuc1tpbmRleF0uY2FsbCh0aGlzLl9yZW5kZXJQcm94eSk7XG4gICAgbWFya1N0YXRpYyh0cmVlLCAoXCJfX3N0YXRpY19fXCIgKyBpbmRleCksIGZhbHNlKTtcbiAgICByZXR1cm4gdHJlZVxuICB9O1xuXG4gIC8vIG1hcmsgbm9kZSBhcyBzdGF0aWMgKHYtb25jZSlcbiAgVnVlLnByb3RvdHlwZS5fbyA9IGZ1bmN0aW9uIG1hcmtPbmNlIChcbiAgICB0cmVlLFxuICAgIGluZGV4LFxuICAgIGtleVxuICApIHtcbiAgICBtYXJrU3RhdGljKHRyZWUsIChcIl9fb25jZV9fXCIgKyBpbmRleCArIChrZXkgPyAoXCJfXCIgKyBrZXkpIDogXCJcIikpLCB0cnVlKTtcbiAgICByZXR1cm4gdHJlZVxuICB9O1xuXG4gIGZ1bmN0aW9uIG1hcmtTdGF0aWMgKHRyZWUsIGtleSwgaXNPbmNlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodHJlZSkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHJlZVtpXSAmJiB0eXBlb2YgdHJlZVtpXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBtYXJrU3RhdGljTm9kZSh0cmVlW2ldLCAoa2V5ICsgXCJfXCIgKyBpKSwgaXNPbmNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrU3RhdGljTm9kZSh0cmVlLCBrZXksIGlzT25jZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWFya1N0YXRpY05vZGUgKG5vZGUsIGtleSwgaXNPbmNlKSB7XG4gICAgbm9kZS5pc1N0YXRpYyA9IHRydWU7XG4gICAgbm9kZS5rZXkgPSBrZXk7XG4gICAgbm9kZS5pc09uY2UgPSBpc09uY2U7XG4gIH1cblxuICAvLyBmaWx0ZXIgcmVzb2x1dGlvbiBoZWxwZXJcbiAgVnVlLnByb3RvdHlwZS5fZiA9IGZ1bmN0aW9uIHJlc29sdmVGaWx0ZXIgKGlkKSB7XG4gICAgcmV0dXJuIHJlc29sdmVBc3NldCh0aGlzLiRvcHRpb25zLCAnZmlsdGVycycsIGlkLCB0cnVlKSB8fCBpZGVudGl0eVxuICB9O1xuXG4gIC8vIHJlbmRlciB2LWZvclxuICBWdWUucHJvdG90eXBlLl9sID0gZnVuY3Rpb24gcmVuZGVyTGlzdCAoXG4gICAgdmFsLFxuICAgIHJlbmRlclxuICApIHtcbiAgICB2YXIgcmV0LCBpLCBsLCBrZXlzLCBrZXk7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSB8fCB0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0ID0gbmV3IEFycmF5KHZhbC5sZW5ndGgpO1xuICAgICAgZm9yIChpID0gMCwgbCA9IHZhbC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgcmV0W2ldID0gcmVuZGVyKHZhbFtpXSwgaSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgICAgcmV0ID0gbmV3IEFycmF5KHZhbCk7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdmFsOyBpKyspIHtcbiAgICAgICAgcmV0W2ldID0gcmVuZGVyKGkgKyAxLCBpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHZhbCkpIHtcbiAgICAgIGtleXMgPSBPYmplY3Qua2V5cyh2YWwpO1xuICAgICAgcmV0ID0gbmV3IEFycmF5KGtleXMubGVuZ3RoKTtcbiAgICAgIGZvciAoaSA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgICByZXRbaV0gPSByZW5kZXIodmFsW2tleV0sIGtleSwgaSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfTtcblxuICAvLyByZW5kZXJTbG90XG4gIFZ1ZS5wcm90b3R5cGUuX3QgPSBmdW5jdGlvbiAoXG4gICAgbmFtZSxcbiAgICBmYWxsYmFjayxcbiAgICBwcm9wcyxcbiAgICBiaW5kT2JqZWN0XG4gICkge1xuICAgIHZhciBzY29wZWRTbG90Rm4gPSB0aGlzLiRzY29wZWRTbG90c1tuYW1lXTtcbiAgICBpZiAoc2NvcGVkU2xvdEZuKSB7IC8vIHNjb3BlZCBzbG90XG4gICAgICBwcm9wcyA9IHByb3BzIHx8IHt9O1xuICAgICAgaWYgKGJpbmRPYmplY3QpIHtcbiAgICAgICAgZXh0ZW5kKHByb3BzLCBiaW5kT2JqZWN0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzY29wZWRTbG90Rm4ocHJvcHMpIHx8IGZhbGxiYWNrXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzbG90Tm9kZXMgPSB0aGlzLiRzbG90c1tuYW1lXTtcbiAgICAgIC8vIHdhcm4gZHVwbGljYXRlIHNsb3QgdXNhZ2VcbiAgICAgIGlmIChzbG90Tm9kZXMgJiYgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBzbG90Tm9kZXMuX3JlbmRlcmVkICYmIHdhcm4oXG4gICAgICAgICAgXCJEdXBsaWNhdGUgcHJlc2VuY2Ugb2Ygc2xvdCBcXFwiXCIgKyBuYW1lICsgXCJcXFwiIGZvdW5kIGluIHRoZSBzYW1lIHJlbmRlciB0cmVlIFwiICtcbiAgICAgICAgICBcIi0gdGhpcyB3aWxsIGxpa2VseSBjYXVzZSByZW5kZXIgZXJyb3JzLlwiLFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKTtcbiAgICAgICAgc2xvdE5vZGVzLl9yZW5kZXJlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xvdE5vZGVzIHx8IGZhbGxiYWNrXG4gICAgfVxuICB9O1xuXG4gIC8vIGFwcGx5IHYtYmluZCBvYmplY3RcbiAgVnVlLnByb3RvdHlwZS5fYiA9IGZ1bmN0aW9uIGJpbmRQcm9wcyAoXG4gICAgZGF0YSxcbiAgICB0YWcsXG4gICAgdmFsdWUsXG4gICAgYXNQcm9wXG4gICkge1xuICAgIGlmICh2YWx1ZSkge1xuICAgICAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgICAgICd2LWJpbmQgd2l0aG91dCBhcmd1bWVudCBleHBlY3RzIGFuIE9iamVjdCBvciBBcnJheSB2YWx1ZScsXG4gICAgICAgICAgdGhpc1xuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgdmFsdWUgPSB0b09iamVjdCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ2NsYXNzJyB8fCBrZXkgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgIGRhdGFba2V5XSA9IHZhbHVlW2tleV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0eXBlID0gZGF0YS5hdHRycyAmJiBkYXRhLmF0dHJzLnR5cGU7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGFzUHJvcCB8fCBjb25maWcubXVzdFVzZVByb3AodGFnLCB0eXBlLCBrZXkpXG4gICAgICAgICAgICAgID8gZGF0YS5kb21Qcm9wcyB8fCAoZGF0YS5kb21Qcm9wcyA9IHt9KVxuICAgICAgICAgICAgICA6IGRhdGEuYXR0cnMgfHwgKGRhdGEuYXR0cnMgPSB7fSk7XG4gICAgICAgICAgICBoYXNoW2tleV0gPSB2YWx1ZVtrZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YVxuICB9O1xuXG4gIC8vIGNoZWNrIHYtb24ga2V5Q29kZXNcbiAgVnVlLnByb3RvdHlwZS5fayA9IGZ1bmN0aW9uIGNoZWNrS2V5Q29kZXMgKFxuICAgIGV2ZW50S2V5Q29kZSxcbiAgICBrZXksXG4gICAgYnVpbHRJbkFsaWFzXG4gICkge1xuICAgIHZhciBrZXlDb2RlcyA9IGNvbmZpZy5rZXlDb2Rlc1trZXldIHx8IGJ1aWx0SW5BbGlhcztcbiAgICBpZiAoQXJyYXkuaXNBcnJheShrZXlDb2RlcykpIHtcbiAgICAgIHJldHVybiBrZXlDb2Rlcy5pbmRleE9mKGV2ZW50S2V5Q29kZSkgPT09IC0xXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBrZXlDb2RlcyAhPT0gZXZlbnRLZXlDb2RlXG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiByZXNvbHZlU2xvdHMgKFxuICBjaGlsZHJlbixcbiAgY29udGV4dFxuKSB7XG4gIHZhciBzbG90cyA9IHt9O1xuICBpZiAoIWNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIHNsb3RzXG4gIH1cbiAgdmFyIGRlZmF1bHRTbG90ID0gW107XG4gIHZhciBuYW1lLCBjaGlsZDtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgIC8vIG5hbWVkIHNsb3RzIHNob3VsZCBvbmx5IGJlIHJlc3BlY3RlZCBpZiB0aGUgdm5vZGUgd2FzIHJlbmRlcmVkIGluIHRoZVxuICAgIC8vIHNhbWUgY29udGV4dC5cbiAgICBpZiAoKGNoaWxkLmNvbnRleHQgPT09IGNvbnRleHQgfHwgY2hpbGQuZnVuY3Rpb25hbENvbnRleHQgPT09IGNvbnRleHQpICYmXG4gICAgICAgIGNoaWxkLmRhdGEgJiYgKG5hbWUgPSBjaGlsZC5kYXRhLnNsb3QpKSB7XG4gICAgICB2YXIgc2xvdCA9IChzbG90c1tuYW1lXSB8fCAoc2xvdHNbbmFtZV0gPSBbXSkpO1xuICAgICAgaWYgKGNoaWxkLnRhZyA9PT0gJ3RlbXBsYXRlJykge1xuICAgICAgICBzbG90LnB1c2guYXBwbHkoc2xvdCwgY2hpbGQuY2hpbGRyZW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2xvdC5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGVmYXVsdFNsb3QucHVzaChjaGlsZCk7XG4gICAgfVxuICB9XG4gIC8vIGlnbm9yZSBzaW5nbGUgd2hpdGVzcGFjZVxuICBpZiAoZGVmYXVsdFNsb3QubGVuZ3RoICYmICEoXG4gICAgZGVmYXVsdFNsb3QubGVuZ3RoID09PSAxICYmXG4gICAgKGRlZmF1bHRTbG90WzBdLnRleHQgPT09ICcgJyB8fCBkZWZhdWx0U2xvdFswXS5pc0NvbW1lbnQpXG4gICkpIHtcbiAgICBzbG90cy5kZWZhdWx0ID0gZGVmYXVsdFNsb3Q7XG4gIH1cbiAgcmV0dXJuIHNsb3RzXG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0RXZlbnRzICh2bSkge1xuICB2bS5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdm0uX2hhc0hvb2tFdmVudCA9IGZhbHNlO1xuICAvLyBpbml0IHBhcmVudCBhdHRhY2hlZCBldmVudHNcbiAgdmFyIGxpc3RlbmVycyA9IHZtLiRvcHRpb25zLl9wYXJlbnRMaXN0ZW5lcnM7XG4gIGlmIChsaXN0ZW5lcnMpIHtcbiAgICB1cGRhdGVDb21wb25lbnRMaXN0ZW5lcnModm0sIGxpc3RlbmVycyk7XG4gIH1cbn1cblxudmFyIHRhcmdldDtcblxuZnVuY3Rpb24gYWRkJDEgKGV2ZW50LCBmbiwgb25jZSkge1xuICBpZiAob25jZSkge1xuICAgIHRhcmdldC4kb25jZShldmVudCwgZm4pO1xuICB9IGVsc2Uge1xuICAgIHRhcmdldC4kb24oZXZlbnQsIGZuKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmUkMiAoZXZlbnQsIGZuKSB7XG4gIHRhcmdldC4kb2ZmKGV2ZW50LCBmbik7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUNvbXBvbmVudExpc3RlbmVycyAoXG4gIHZtLFxuICBsaXN0ZW5lcnMsXG4gIG9sZExpc3RlbmVyc1xuKSB7XG4gIHRhcmdldCA9IHZtO1xuICB1cGRhdGVMaXN0ZW5lcnMobGlzdGVuZXJzLCBvbGRMaXN0ZW5lcnMgfHwge30sIGFkZCQxLCByZW1vdmUkMiwgdm0pO1xufVxuXG5mdW5jdGlvbiBldmVudHNNaXhpbiAoVnVlKSB7XG4gIHZhciBob29rUkUgPSAvXmhvb2s6LztcbiAgVnVlLnByb3RvdHlwZS4kb24gPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG4gICAgdmFyIHZtID0gdGhpczsodm0uX2V2ZW50c1tldmVudF0gfHwgKHZtLl9ldmVudHNbZXZlbnRdID0gW10pKS5wdXNoKGZuKTtcbiAgICAvLyBvcHRpbWl6ZSBob29rOmV2ZW50IGNvc3QgYnkgdXNpbmcgYSBib29sZWFuIGZsYWcgbWFya2VkIGF0IHJlZ2lzdHJhdGlvblxuICAgIC8vIGluc3RlYWQgb2YgYSBoYXNoIGxvb2t1cFxuICAgIGlmIChob29rUkUudGVzdChldmVudCkpIHtcbiAgICAgIHZtLl9oYXNIb29rRXZlbnQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdm1cbiAgfTtcblxuICBWdWUucHJvdG90eXBlLiRvbmNlID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgZnVuY3Rpb24gb24gKCkge1xuICAgICAgdm0uJG9mZihldmVudCwgb24pO1xuICAgICAgZm4uYXBwbHkodm0sIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIG9uLmZuID0gZm47XG4gICAgdm0uJG9uKGV2ZW50LCBvbik7XG4gICAgcmV0dXJuIHZtXG4gIH07XG5cbiAgVnVlLnByb3RvdHlwZS4kb2ZmID0gZnVuY3Rpb24gKGV2ZW50LCBmbikge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgLy8gYWxsXG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICB2bS5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIHJldHVybiB2bVxuICAgIH1cbiAgICAvLyBzcGVjaWZpYyBldmVudFxuICAgIHZhciBjYnMgPSB2bS5fZXZlbnRzW2V2ZW50XTtcbiAgICBpZiAoIWNicykge1xuICAgICAgcmV0dXJuIHZtXG4gICAgfVxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICB2bS5fZXZlbnRzW2V2ZW50XSA9IG51bGw7XG4gICAgICByZXR1cm4gdm1cbiAgICB9XG4gICAgLy8gc3BlY2lmaWMgaGFuZGxlclxuICAgIHZhciBjYjtcbiAgICB2YXIgaSA9IGNicy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgY2IgPSBjYnNbaV07XG4gICAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgICBjYnMuc3BsaWNlKGksIDEpO1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdm1cbiAgfTtcblxuICBWdWUucHJvdG90eXBlLiRlbWl0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICB2YXIgY2JzID0gdm0uX2V2ZW50c1tldmVudF07XG4gICAgaWYgKGNicykge1xuICAgICAgY2JzID0gY2JzLmxlbmd0aCA+IDEgPyB0b0FycmF5KGNicykgOiBjYnM7XG4gICAgICB2YXIgYXJncyA9IHRvQXJyYXkoYXJndW1lbnRzLCAxKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2JzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBjYnNbaV0uYXBwbHkodm0sIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdm1cbiAgfTtcbn1cblxuLyogICovXG5cbnZhciBhY3RpdmVJbnN0YW5jZSA9IG51bGw7XG5cbmZ1bmN0aW9uIGluaXRMaWZlY3ljbGUgKHZtKSB7XG4gIHZhciBvcHRpb25zID0gdm0uJG9wdGlvbnM7XG5cbiAgLy8gbG9jYXRlIGZpcnN0IG5vbi1hYnN0cmFjdCBwYXJlbnRcbiAgdmFyIHBhcmVudCA9IG9wdGlvbnMucGFyZW50O1xuICBpZiAocGFyZW50ICYmICFvcHRpb25zLmFic3RyYWN0KSB7XG4gICAgd2hpbGUgKHBhcmVudC4kb3B0aW9ucy5hYnN0cmFjdCAmJiBwYXJlbnQuJHBhcmVudCkge1xuICAgICAgcGFyZW50ID0gcGFyZW50LiRwYXJlbnQ7XG4gICAgfVxuICAgIHBhcmVudC4kY2hpbGRyZW4ucHVzaCh2bSk7XG4gIH1cblxuICB2bS4kcGFyZW50ID0gcGFyZW50O1xuICB2bS4kcm9vdCA9IHBhcmVudCA/IHBhcmVudC4kcm9vdCA6IHZtO1xuXG4gIHZtLiRjaGlsZHJlbiA9IFtdO1xuICB2bS4kcmVmcyA9IHt9O1xuXG4gIHZtLl93YXRjaGVyID0gbnVsbDtcbiAgdm0uX2luYWN0aXZlID0gZmFsc2U7XG4gIHZtLl9pc01vdW50ZWQgPSBmYWxzZTtcbiAgdm0uX2lzRGVzdHJveWVkID0gZmFsc2U7XG4gIHZtLl9pc0JlaW5nRGVzdHJveWVkID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGxpZmVjeWNsZU1peGluIChWdWUpIHtcbiAgVnVlLnByb3RvdHlwZS5fbW91bnQgPSBmdW5jdGlvbiAoXG4gICAgZWwsXG4gICAgaHlkcmF0aW5nXG4gICkge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgdm0uJGVsID0gZWw7XG4gICAgaWYgKCF2bS4kb3B0aW9ucy5yZW5kZXIpIHtcbiAgICAgIHZtLiRvcHRpb25zLnJlbmRlciA9IGNyZWF0ZUVtcHR5Vk5vZGU7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgaWYgKHZtLiRvcHRpb25zLnRlbXBsYXRlICYmIHZtLiRvcHRpb25zLnRlbXBsYXRlLmNoYXJBdCgwKSAhPT0gJyMnKSB7XG4gICAgICAgICAgd2FybihcbiAgICAgICAgICAgICdZb3UgYXJlIHVzaW5nIHRoZSBydW50aW1lLW9ubHkgYnVpbGQgb2YgVnVlIHdoZXJlIHRoZSB0ZW1wbGF0ZSAnICtcbiAgICAgICAgICAgICdvcHRpb24gaXMgbm90IGF2YWlsYWJsZS4gRWl0aGVyIHByZS1jb21waWxlIHRoZSB0ZW1wbGF0ZXMgaW50byAnICtcbiAgICAgICAgICAgICdyZW5kZXIgZnVuY3Rpb25zLCBvciB1c2UgdGhlIGNvbXBpbGVyLWluY2x1ZGVkIGJ1aWxkLicsXG4gICAgICAgICAgICB2bVxuICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2FybihcbiAgICAgICAgICAgICdGYWlsZWQgdG8gbW91bnQgY29tcG9uZW50OiB0ZW1wbGF0ZSBvciByZW5kZXIgZnVuY3Rpb24gbm90IGRlZmluZWQuJyxcbiAgICAgICAgICAgIHZtXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjYWxsSG9vayh2bSwgJ2JlZm9yZU1vdW50Jyk7XG4gICAgdm0uX3dhdGNoZXIgPSBuZXcgV2F0Y2hlcih2bSwgZnVuY3Rpb24gdXBkYXRlQ29tcG9uZW50ICgpIHtcbiAgICAgIHZtLl91cGRhdGUodm0uX3JlbmRlcigpLCBoeWRyYXRpbmcpO1xuICAgIH0sIG5vb3ApO1xuICAgIGh5ZHJhdGluZyA9IGZhbHNlO1xuICAgIC8vIG1hbnVhbGx5IG1vdW50ZWQgaW5zdGFuY2UsIGNhbGwgbW91bnRlZCBvbiBzZWxmXG4gICAgLy8gbW91bnRlZCBpcyBjYWxsZWQgZm9yIHJlbmRlci1jcmVhdGVkIGNoaWxkIGNvbXBvbmVudHMgaW4gaXRzIGluc2VydGVkIGhvb2tcbiAgICBpZiAodm0uJHZub2RlID09IG51bGwpIHtcbiAgICAgIHZtLl9pc01vdW50ZWQgPSB0cnVlO1xuICAgICAgY2FsbEhvb2sodm0sICdtb3VudGVkJyk7XG4gICAgfVxuICAgIHJldHVybiB2bVxuICB9O1xuXG4gIFZ1ZS5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uICh2bm9kZSwgaHlkcmF0aW5nKSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICBpZiAodm0uX2lzTW91bnRlZCkge1xuICAgICAgY2FsbEhvb2sodm0sICdiZWZvcmVVcGRhdGUnKTtcbiAgICB9XG4gICAgdmFyIHByZXZFbCA9IHZtLiRlbDtcbiAgICB2YXIgcHJldlZub2RlID0gdm0uX3Zub2RlO1xuICAgIHZhciBwcmV2QWN0aXZlSW5zdGFuY2UgPSBhY3RpdmVJbnN0YW5jZTtcbiAgICBhY3RpdmVJbnN0YW5jZSA9IHZtO1xuICAgIHZtLl92bm9kZSA9IHZub2RlO1xuICAgIC8vIFZ1ZS5wcm90b3R5cGUuX19wYXRjaF9fIGlzIGluamVjdGVkIGluIGVudHJ5IHBvaW50c1xuICAgIC8vIGJhc2VkIG9uIHRoZSByZW5kZXJpbmcgYmFja2VuZCB1c2VkLlxuICAgIGlmICghcHJldlZub2RlKSB7XG4gICAgICAvLyBpbml0aWFsIHJlbmRlclxuICAgICAgdm0uJGVsID0gdm0uX19wYXRjaF9fKFxuICAgICAgICB2bS4kZWwsIHZub2RlLCBoeWRyYXRpbmcsIGZhbHNlIC8qIHJlbW92ZU9ubHkgKi8sXG4gICAgICAgIHZtLiRvcHRpb25zLl9wYXJlbnRFbG0sXG4gICAgICAgIHZtLiRvcHRpb25zLl9yZWZFbG1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHVwZGF0ZXNcbiAgICAgIHZtLiRlbCA9IHZtLl9fcGF0Y2hfXyhwcmV2Vm5vZGUsIHZub2RlKTtcbiAgICB9XG4gICAgYWN0aXZlSW5zdGFuY2UgPSBwcmV2QWN0aXZlSW5zdGFuY2U7XG4gICAgLy8gdXBkYXRlIF9fdnVlX18gcmVmZXJlbmNlXG4gICAgaWYgKHByZXZFbCkge1xuICAgICAgcHJldkVsLl9fdnVlX18gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodm0uJGVsKSB7XG4gICAgICB2bS4kZWwuX192dWVfXyA9IHZtO1xuICAgIH1cbiAgICAvLyBpZiBwYXJlbnQgaXMgYW4gSE9DLCB1cGRhdGUgaXRzICRlbCBhcyB3ZWxsXG4gICAgaWYgKHZtLiR2bm9kZSAmJiB2bS4kcGFyZW50ICYmIHZtLiR2bm9kZSA9PT0gdm0uJHBhcmVudC5fdm5vZGUpIHtcbiAgICAgIHZtLiRwYXJlbnQuJGVsID0gdm0uJGVsO1xuICAgIH1cbiAgICAvLyB1cGRhdGVkIGhvb2sgaXMgY2FsbGVkIGJ5IHRoZSBzY2hlZHVsZXIgdG8gZW5zdXJlIHRoYXQgY2hpbGRyZW4gYXJlXG4gICAgLy8gdXBkYXRlZCBpbiBhIHBhcmVudCdzIHVwZGF0ZWQgaG9vay5cbiAgfTtcblxuICBWdWUucHJvdG90eXBlLl91cGRhdGVGcm9tUGFyZW50ID0gZnVuY3Rpb24gKFxuICAgIHByb3BzRGF0YSxcbiAgICBsaXN0ZW5lcnMsXG4gICAgcGFyZW50Vm5vZGUsXG4gICAgcmVuZGVyQ2hpbGRyZW5cbiAgKSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICB2YXIgaGFzQ2hpbGRyZW4gPSAhISh2bS4kb3B0aW9ucy5fcmVuZGVyQ2hpbGRyZW4gfHwgcmVuZGVyQ2hpbGRyZW4pO1xuICAgIHZtLiRvcHRpb25zLl9wYXJlbnRWbm9kZSA9IHBhcmVudFZub2RlO1xuICAgIHZtLiR2bm9kZSA9IHBhcmVudFZub2RlOyAvLyB1cGRhdGUgdm0ncyBwbGFjZWhvbGRlciBub2RlIHdpdGhvdXQgcmUtcmVuZGVyXG4gICAgaWYgKHZtLl92bm9kZSkgeyAvLyB1cGRhdGUgY2hpbGQgdHJlZSdzIHBhcmVudFxuICAgICAgdm0uX3Zub2RlLnBhcmVudCA9IHBhcmVudFZub2RlO1xuICAgIH1cbiAgICB2bS4kb3B0aW9ucy5fcmVuZGVyQ2hpbGRyZW4gPSByZW5kZXJDaGlsZHJlbjtcbiAgICAvLyB1cGRhdGUgcHJvcHNcbiAgICBpZiAocHJvcHNEYXRhICYmIHZtLiRvcHRpb25zLnByb3BzKSB7XG4gICAgICBvYnNlcnZlclN0YXRlLnNob3VsZENvbnZlcnQgPSBmYWxzZTtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIG9ic2VydmVyU3RhdGUuaXNTZXR0aW5nUHJvcHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgdmFyIHByb3BLZXlzID0gdm0uJG9wdGlvbnMuX3Byb3BLZXlzIHx8IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gcHJvcEtleXNbaV07XG4gICAgICAgIHZtW2tleV0gPSB2YWxpZGF0ZVByb3Aoa2V5LCB2bS4kb3B0aW9ucy5wcm9wcywgcHJvcHNEYXRhLCB2bSk7XG4gICAgICB9XG4gICAgICBvYnNlcnZlclN0YXRlLnNob3VsZENvbnZlcnQgPSB0cnVlO1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgb2JzZXJ2ZXJTdGF0ZS5pc1NldHRpbmdQcm9wcyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgdm0uJG9wdGlvbnMucHJvcHNEYXRhID0gcHJvcHNEYXRhO1xuICAgIH1cbiAgICAvLyB1cGRhdGUgbGlzdGVuZXJzXG4gICAgaWYgKGxpc3RlbmVycykge1xuICAgICAgdmFyIG9sZExpc3RlbmVycyA9IHZtLiRvcHRpb25zLl9wYXJlbnRMaXN0ZW5lcnM7XG4gICAgICB2bS4kb3B0aW9ucy5fcGFyZW50TGlzdGVuZXJzID0gbGlzdGVuZXJzO1xuICAgICAgdXBkYXRlQ29tcG9uZW50TGlzdGVuZXJzKHZtLCBsaXN0ZW5lcnMsIG9sZExpc3RlbmVycyk7XG4gICAgfVxuICAgIC8vIHJlc29sdmUgc2xvdHMgKyBmb3JjZSB1cGRhdGUgaWYgaGFzIGNoaWxkcmVuXG4gICAgaWYgKGhhc0NoaWxkcmVuKSB7XG4gICAgICB2bS4kc2xvdHMgPSByZXNvbHZlU2xvdHMocmVuZGVyQ2hpbGRyZW4sIHBhcmVudFZub2RlLmNvbnRleHQpO1xuICAgICAgdm0uJGZvcmNlVXBkYXRlKCk7XG4gICAgfVxuICB9O1xuXG4gIFZ1ZS5wcm90b3R5cGUuJGZvcmNlVXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgaWYgKHZtLl93YXRjaGVyKSB7XG4gICAgICB2bS5fd2F0Y2hlci51cGRhdGUoKTtcbiAgICB9XG4gIH07XG5cbiAgVnVlLnByb3RvdHlwZS4kZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdm0gPSB0aGlzO1xuICAgIGlmICh2bS5faXNCZWluZ0Rlc3Ryb3llZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNhbGxIb29rKHZtLCAnYmVmb3JlRGVzdHJveScpO1xuICAgIHZtLl9pc0JlaW5nRGVzdHJveWVkID0gdHJ1ZTtcbiAgICAvLyByZW1vdmUgc2VsZiBmcm9tIHBhcmVudFxuICAgIHZhciBwYXJlbnQgPSB2bS4kcGFyZW50O1xuICAgIGlmIChwYXJlbnQgJiYgIXBhcmVudC5faXNCZWluZ0Rlc3Ryb3llZCAmJiAhdm0uJG9wdGlvbnMuYWJzdHJhY3QpIHtcbiAgICAgIHJlbW92ZSQxKHBhcmVudC4kY2hpbGRyZW4sIHZtKTtcbiAgICB9XG4gICAgLy8gdGVhcmRvd24gd2F0Y2hlcnNcbiAgICBpZiAodm0uX3dhdGNoZXIpIHtcbiAgICAgIHZtLl93YXRjaGVyLnRlYXJkb3duKCk7XG4gICAgfVxuICAgIHZhciBpID0gdm0uX3dhdGNoZXJzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB2bS5fd2F0Y2hlcnNbaV0udGVhcmRvd24oKTtcbiAgICB9XG4gICAgLy8gcmVtb3ZlIHJlZmVyZW5jZSBmcm9tIGRhdGEgb2JcbiAgICAvLyBmcm96ZW4gb2JqZWN0IG1heSBub3QgaGF2ZSBvYnNlcnZlci5cbiAgICBpZiAodm0uX2RhdGEuX19vYl9fKSB7XG4gICAgICB2bS5fZGF0YS5fX29iX18udm1Db3VudC0tO1xuICAgIH1cbiAgICAvLyBjYWxsIHRoZSBsYXN0IGhvb2suLi5cbiAgICB2bS5faXNEZXN0cm95ZWQgPSB0cnVlO1xuICAgIGNhbGxIb29rKHZtLCAnZGVzdHJveWVkJyk7XG4gICAgLy8gdHVybiBvZmYgYWxsIGluc3RhbmNlIGxpc3RlbmVycy5cbiAgICB2bS4kb2ZmKCk7XG4gICAgLy8gcmVtb3ZlIF9fdnVlX18gcmVmZXJlbmNlXG4gICAgaWYgKHZtLiRlbCkge1xuICAgICAgdm0uJGVsLl9fdnVlX18gPSBudWxsO1xuICAgIH1cbiAgICAvLyBpbnZva2UgZGVzdHJveSBob29rcyBvbiBjdXJyZW50IHJlbmRlcmVkIHRyZWVcbiAgICB2bS5fX3BhdGNoX18odm0uX3Zub2RlLCBudWxsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2FsbEhvb2sgKHZtLCBob29rKSB7XG4gIHZhciBoYW5kbGVycyA9IHZtLiRvcHRpb25zW2hvb2tdO1xuICBpZiAoaGFuZGxlcnMpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IGhhbmRsZXJzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgICAgaGFuZGxlcnNbaV0uY2FsbCh2bSk7XG4gICAgfVxuICB9XG4gIGlmICh2bS5faGFzSG9va0V2ZW50KSB7XG4gICAgdm0uJGVtaXQoJ2hvb2s6JyArIGhvb2spO1xuICB9XG59XG5cbi8qICAqL1xuXG5cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGhhcyQxID0ge307XG52YXIgY2lyY3VsYXIgPSB7fTtcbnZhciB3YWl0aW5nID0gZmFsc2U7XG52YXIgZmx1c2hpbmcgPSBmYWxzZTtcbnZhciBpbmRleCA9IDA7XG5cbi8qKlxuICogUmVzZXQgdGhlIHNjaGVkdWxlcidzIHN0YXRlLlxuICovXG5mdW5jdGlvbiByZXNldFNjaGVkdWxlclN0YXRlICgpIHtcbiAgcXVldWUubGVuZ3RoID0gMDtcbiAgaGFzJDEgPSB7fTtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBjaXJjdWxhciA9IHt9O1xuICB9XG4gIHdhaXRpbmcgPSBmbHVzaGluZyA9IGZhbHNlO1xufVxuXG4vKipcbiAqIEZsdXNoIGJvdGggcXVldWVzIGFuZCBydW4gdGhlIHdhdGNoZXJzLlxuICovXG5mdW5jdGlvbiBmbHVzaFNjaGVkdWxlclF1ZXVlICgpIHtcbiAgZmx1c2hpbmcgPSB0cnVlO1xuICB2YXIgd2F0Y2hlciwgaWQsIHZtO1xuXG4gIC8vIFNvcnQgcXVldWUgYmVmb3JlIGZsdXNoLlxuICAvLyBUaGlzIGVuc3VyZXMgdGhhdDpcbiAgLy8gMS4gQ29tcG9uZW50cyBhcmUgdXBkYXRlZCBmcm9tIHBhcmVudCB0byBjaGlsZC4gKGJlY2F1c2UgcGFyZW50IGlzIGFsd2F5c1xuICAvLyAgICBjcmVhdGVkIGJlZm9yZSB0aGUgY2hpbGQpXG4gIC8vIDIuIEEgY29tcG9uZW50J3MgdXNlciB3YXRjaGVycyBhcmUgcnVuIGJlZm9yZSBpdHMgcmVuZGVyIHdhdGNoZXIgKGJlY2F1c2VcbiAgLy8gICAgdXNlciB3YXRjaGVycyBhcmUgY3JlYXRlZCBiZWZvcmUgdGhlIHJlbmRlciB3YXRjaGVyKVxuICAvLyAzLiBJZiBhIGNvbXBvbmVudCBpcyBkZXN0cm95ZWQgZHVyaW5nIGEgcGFyZW50IGNvbXBvbmVudCdzIHdhdGNoZXIgcnVuLFxuICAvLyAgICBpdHMgd2F0Y2hlcnMgY2FuIGJlIHNraXBwZWQuXG4gIHF1ZXVlLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGEuaWQgLSBiLmlkOyB9KTtcblxuICAvLyBkbyBub3QgY2FjaGUgbGVuZ3RoIGJlY2F1c2UgbW9yZSB3YXRjaGVycyBtaWdodCBiZSBwdXNoZWRcbiAgLy8gYXMgd2UgcnVuIGV4aXN0aW5nIHdhdGNoZXJzXG4gIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHF1ZXVlLmxlbmd0aDsgaW5kZXgrKykge1xuICAgIHdhdGNoZXIgPSBxdWV1ZVtpbmRleF07XG4gICAgaWQgPSB3YXRjaGVyLmlkO1xuICAgIGhhcyQxW2lkXSA9IG51bGw7XG4gICAgd2F0Y2hlci5ydW4oKTtcbiAgICAvLyBpbiBkZXYgYnVpbGQsIGNoZWNrIGFuZCBzdG9wIGNpcmN1bGFyIHVwZGF0ZXMuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgaGFzJDFbaWRdICE9IG51bGwpIHtcbiAgICAgIGNpcmN1bGFyW2lkXSA9IChjaXJjdWxhcltpZF0gfHwgMCkgKyAxO1xuICAgICAgaWYgKGNpcmN1bGFyW2lkXSA+IGNvbmZpZy5fbWF4VXBkYXRlQ291bnQpIHtcbiAgICAgICAgd2FybihcbiAgICAgICAgICAnWW91IG1heSBoYXZlIGFuIGluZmluaXRlIHVwZGF0ZSBsb29wICcgKyAoXG4gICAgICAgICAgICB3YXRjaGVyLnVzZXJcbiAgICAgICAgICAgICAgPyAoXCJpbiB3YXRjaGVyIHdpdGggZXhwcmVzc2lvbiBcXFwiXCIgKyAod2F0Y2hlci5leHByZXNzaW9uKSArIFwiXFxcIlwiKVxuICAgICAgICAgICAgICA6IFwiaW4gYSBjb21wb25lbnQgcmVuZGVyIGZ1bmN0aW9uLlwiXG4gICAgICAgICAgKSxcbiAgICAgICAgICB3YXRjaGVyLnZtXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gY2FsbCB1cGRhdGVkIGhvb2tzXG4gIGluZGV4ID0gcXVldWUubGVuZ3RoO1xuICB3aGlsZSAoaW5kZXgtLSkge1xuICAgIHdhdGNoZXIgPSBxdWV1ZVtpbmRleF07XG4gICAgdm0gPSB3YXRjaGVyLnZtO1xuICAgIGlmICh2bS5fd2F0Y2hlciA9PT0gd2F0Y2hlciAmJiB2bS5faXNNb3VudGVkKSB7XG4gICAgICBjYWxsSG9vayh2bSwgJ3VwZGF0ZWQnKTtcbiAgICB9XG4gIH1cblxuICAvLyBkZXZ0b29sIGhvb2tcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmIChkZXZ0b29scyAmJiBjb25maWcuZGV2dG9vbHMpIHtcbiAgICBkZXZ0b29scy5lbWl0KCdmbHVzaCcpO1xuICB9XG5cbiAgcmVzZXRTY2hlZHVsZXJTdGF0ZSgpO1xufVxuXG4vKipcbiAqIFB1c2ggYSB3YXRjaGVyIGludG8gdGhlIHdhdGNoZXIgcXVldWUuXG4gKiBKb2JzIHdpdGggZHVwbGljYXRlIElEcyB3aWxsIGJlIHNraXBwZWQgdW5sZXNzIGl0J3NcbiAqIHB1c2hlZCB3aGVuIHRoZSBxdWV1ZSBpcyBiZWluZyBmbHVzaGVkLlxuICovXG5mdW5jdGlvbiBxdWV1ZVdhdGNoZXIgKHdhdGNoZXIpIHtcbiAgdmFyIGlkID0gd2F0Y2hlci5pZDtcbiAgaWYgKGhhcyQxW2lkXSA9PSBudWxsKSB7XG4gICAgaGFzJDFbaWRdID0gdHJ1ZTtcbiAgICBpZiAoIWZsdXNoaW5nKSB7XG4gICAgICBxdWV1ZS5wdXNoKHdhdGNoZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpZiBhbHJlYWR5IGZsdXNoaW5nLCBzcGxpY2UgdGhlIHdhdGNoZXIgYmFzZWQgb24gaXRzIGlkXG4gICAgICAvLyBpZiBhbHJlYWR5IHBhc3QgaXRzIGlkLCBpdCB3aWxsIGJlIHJ1biBuZXh0IGltbWVkaWF0ZWx5LlxuICAgICAgdmFyIGkgPSBxdWV1ZS5sZW5ndGggLSAxO1xuICAgICAgd2hpbGUgKGkgPj0gMCAmJiBxdWV1ZVtpXS5pZCA+IHdhdGNoZXIuaWQpIHtcbiAgICAgICAgaS0tO1xuICAgICAgfVxuICAgICAgcXVldWUuc3BsaWNlKE1hdGgubWF4KGksIGluZGV4KSArIDEsIDAsIHdhdGNoZXIpO1xuICAgIH1cbiAgICAvLyBxdWV1ZSB0aGUgZmx1c2hcbiAgICBpZiAoIXdhaXRpbmcpIHtcbiAgICAgIHdhaXRpbmcgPSB0cnVlO1xuICAgICAgbmV4dFRpY2soZmx1c2hTY2hlZHVsZXJRdWV1ZSk7XG4gICAgfVxuICB9XG59XG5cbi8qICAqL1xuXG52YXIgdWlkJDIgPSAwO1xuXG4vKipcbiAqIEEgd2F0Y2hlciBwYXJzZXMgYW4gZXhwcmVzc2lvbiwgY29sbGVjdHMgZGVwZW5kZW5jaWVzLFxuICogYW5kIGZpcmVzIGNhbGxiYWNrIHdoZW4gdGhlIGV4cHJlc3Npb24gdmFsdWUgY2hhbmdlcy5cbiAqIFRoaXMgaXMgdXNlZCBmb3IgYm90aCB0aGUgJHdhdGNoKCkgYXBpIGFuZCBkaXJlY3RpdmVzLlxuICovXG52YXIgV2F0Y2hlciA9IGZ1bmN0aW9uIFdhdGNoZXIgKFxuICB2bSxcbiAgZXhwT3JGbixcbiAgY2IsXG4gIG9wdGlvbnNcbikge1xuICB0aGlzLnZtID0gdm07XG4gIHZtLl93YXRjaGVycy5wdXNoKHRoaXMpO1xuICAvLyBvcHRpb25zXG4gIGlmIChvcHRpb25zKSB7XG4gICAgdGhpcy5kZWVwID0gISFvcHRpb25zLmRlZXA7XG4gICAgdGhpcy51c2VyID0gISFvcHRpb25zLnVzZXI7XG4gICAgdGhpcy5sYXp5ID0gISFvcHRpb25zLmxhenk7XG4gICAgdGhpcy5zeW5jID0gISFvcHRpb25zLnN5bmM7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kZWVwID0gdGhpcy51c2VyID0gdGhpcy5sYXp5ID0gdGhpcy5zeW5jID0gZmFsc2U7XG4gIH1cbiAgdGhpcy5jYiA9IGNiO1xuICB0aGlzLmlkID0gKyt1aWQkMjsgLy8gdWlkIGZvciBiYXRjaGluZ1xuICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gIHRoaXMuZGlydHkgPSB0aGlzLmxhenk7IC8vIGZvciBsYXp5IHdhdGNoZXJzXG4gIHRoaXMuZGVwcyA9IFtdO1xuICB0aGlzLm5ld0RlcHMgPSBbXTtcbiAgdGhpcy5kZXBJZHMgPSBuZXcgX1NldCgpO1xuICB0aGlzLm5ld0RlcElkcyA9IG5ldyBfU2V0KCk7XG4gIHRoaXMuZXhwcmVzc2lvbiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbidcbiAgICA/IGV4cE9yRm4udG9TdHJpbmcoKVxuICAgIDogJyc7XG4gIC8vIHBhcnNlIGV4cHJlc3Npb24gZm9yIGdldHRlclxuICBpZiAodHlwZW9mIGV4cE9yRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aGlzLmdldHRlciA9IGV4cE9yRm47XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5nZXR0ZXIgPSBwYXJzZVBhdGgoZXhwT3JGbik7XG4gICAgaWYgKCF0aGlzLmdldHRlcikge1xuICAgICAgdGhpcy5nZXR0ZXIgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgd2FybihcbiAgICAgICAgXCJGYWlsZWQgd2F0Y2hpbmcgcGF0aDogXFxcIlwiICsgZXhwT3JGbiArIFwiXFxcIiBcIiArXG4gICAgICAgICdXYXRjaGVyIG9ubHkgYWNjZXB0cyBzaW1wbGUgZG90LWRlbGltaXRlZCBwYXRocy4gJyArXG4gICAgICAgICdGb3IgZnVsbCBjb250cm9sLCB1c2UgYSBmdW5jdGlvbiBpbnN0ZWFkLicsXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgIH1cbiAgfVxuICB0aGlzLnZhbHVlID0gdGhpcy5sYXp5XG4gICAgPyB1bmRlZmluZWRcbiAgICA6IHRoaXMuZ2V0KCk7XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlIHRoZSBnZXR0ZXIsIGFuZCByZS1jb2xsZWN0IGRlcGVuZGVuY2llcy5cbiAqL1xuV2F0Y2hlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0ICgpIHtcbiAgcHVzaFRhcmdldCh0aGlzKTtcbiAgdmFyIHZhbHVlID0gdGhpcy5nZXR0ZXIuY2FsbCh0aGlzLnZtLCB0aGlzLnZtKTtcbiAgLy8gXCJ0b3VjaFwiIGV2ZXJ5IHByb3BlcnR5IHNvIHRoZXkgYXJlIGFsbCB0cmFja2VkIGFzXG4gIC8vIGRlcGVuZGVuY2llcyBmb3IgZGVlcCB3YXRjaGluZ1xuICBpZiAodGhpcy5kZWVwKSB7XG4gICAgdHJhdmVyc2UodmFsdWUpO1xuICB9XG4gIHBvcFRhcmdldCgpO1xuICB0aGlzLmNsZWFudXBEZXBzKCk7XG4gIHJldHVybiB2YWx1ZVxufTtcblxuLyoqXG4gKiBBZGQgYSBkZXBlbmRlbmN5IHRvIHRoaXMgZGlyZWN0aXZlLlxuICovXG5XYXRjaGVyLnByb3RvdHlwZS5hZGREZXAgPSBmdW5jdGlvbiBhZGREZXAgKGRlcCkge1xuICB2YXIgaWQgPSBkZXAuaWQ7XG4gIGlmICghdGhpcy5uZXdEZXBJZHMuaGFzKGlkKSkge1xuICAgIHRoaXMubmV3RGVwSWRzLmFkZChpZCk7XG4gICAgdGhpcy5uZXdEZXBzLnB1c2goZGVwKTtcbiAgICBpZiAoIXRoaXMuZGVwSWRzLmhhcyhpZCkpIHtcbiAgICAgIGRlcC5hZGRTdWIodGhpcyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIENsZWFuIHVwIGZvciBkZXBlbmRlbmN5IGNvbGxlY3Rpb24uXG4gKi9cbldhdGNoZXIucHJvdG90eXBlLmNsZWFudXBEZXBzID0gZnVuY3Rpb24gY2xlYW51cERlcHMgKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHZhciBpID0gdGhpcy5kZXBzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIHZhciBkZXAgPSB0aGlzJDEuZGVwc1tpXTtcbiAgICBpZiAoIXRoaXMkMS5uZXdEZXBJZHMuaGFzKGRlcC5pZCkpIHtcbiAgICAgIGRlcC5yZW1vdmVTdWIodGhpcyQxKTtcbiAgICB9XG4gIH1cbiAgdmFyIHRtcCA9IHRoaXMuZGVwSWRzO1xuICB0aGlzLmRlcElkcyA9IHRoaXMubmV3RGVwSWRzO1xuICB0aGlzLm5ld0RlcElkcyA9IHRtcDtcbiAgdGhpcy5uZXdEZXBJZHMuY2xlYXIoKTtcbiAgdG1wID0gdGhpcy5kZXBzO1xuICB0aGlzLmRlcHMgPSB0aGlzLm5ld0RlcHM7XG4gIHRoaXMubmV3RGVwcyA9IHRtcDtcbiAgdGhpcy5uZXdEZXBzLmxlbmd0aCA9IDA7XG59O1xuXG4vKipcbiAqIFN1YnNjcmliZXIgaW50ZXJmYWNlLlxuICogV2lsbCBiZSBjYWxsZWQgd2hlbiBhIGRlcGVuZGVuY3kgY2hhbmdlcy5cbiAqL1xuV2F0Y2hlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlICgpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKHRoaXMubGF6eSkge1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICB9IGVsc2UgaWYgKHRoaXMuc3luYykge1xuICAgIHRoaXMucnVuKCk7XG4gIH0gZWxzZSB7XG4gICAgcXVldWVXYXRjaGVyKHRoaXMpO1xuICB9XG59O1xuXG4vKipcbiAqIFNjaGVkdWxlciBqb2IgaW50ZXJmYWNlLlxuICogV2lsbCBiZSBjYWxsZWQgYnkgdGhlIHNjaGVkdWxlci5cbiAqL1xuV2F0Y2hlci5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gcnVuICgpIHtcbiAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXQoKTtcbiAgICBpZiAoXG4gICAgICB2YWx1ZSAhPT0gdGhpcy52YWx1ZSB8fFxuICAgICAgLy8gRGVlcCB3YXRjaGVycyBhbmQgd2F0Y2hlcnMgb24gT2JqZWN0L0FycmF5cyBzaG91bGQgZmlyZSBldmVuXG4gICAgICAvLyB3aGVuIHRoZSB2YWx1ZSBpcyB0aGUgc2FtZSwgYmVjYXVzZSB0aGUgdmFsdWUgbWF5XG4gICAgICAvLyBoYXZlIG11dGF0ZWQuXG4gICAgICBpc09iamVjdCh2YWx1ZSkgfHxcbiAgICAgIHRoaXMuZGVlcFxuICAgICkge1xuICAgICAgLy8gc2V0IG5ldyB2YWx1ZVxuICAgICAgdmFyIG9sZFZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgIGlmICh0aGlzLnVzZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNiLmNhbGwodGhpcy52bSwgdmFsdWUsIG9sZFZhbHVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgICAgaWYgKGNvbmZpZy5lcnJvckhhbmRsZXIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5lcnJvckhhbmRsZXIuY2FsbChudWxsLCBlLCB0aGlzLnZtKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgICAgICAgICAoXCJFcnJvciBpbiB3YXRjaGVyIFxcXCJcIiArICh0aGlzLmV4cHJlc3Npb24pICsgXCJcXFwiXCIpLFxuICAgICAgICAgICAgICB0aGlzLnZtXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhyb3cgZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jYi5jYWxsKHRoaXMudm0sIHZhbHVlLCBvbGRWYWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlIHRoZSB2YWx1ZSBvZiB0aGUgd2F0Y2hlci5cbiAqIFRoaXMgb25seSBnZXRzIGNhbGxlZCBmb3IgbGF6eSB3YXRjaGVycy5cbiAqL1xuV2F0Y2hlci5wcm90b3R5cGUuZXZhbHVhdGUgPSBmdW5jdGlvbiBldmFsdWF0ZSAoKSB7XG4gIHRoaXMudmFsdWUgPSB0aGlzLmdldCgpO1xuICB0aGlzLmRpcnR5ID0gZmFsc2U7XG59O1xuXG4vKipcbiAqIERlcGVuZCBvbiBhbGwgZGVwcyBjb2xsZWN0ZWQgYnkgdGhpcyB3YXRjaGVyLlxuICovXG5XYXRjaGVyLnByb3RvdHlwZS5kZXBlbmQgPSBmdW5jdGlvbiBkZXBlbmQgKCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHZhciBpID0gdGhpcy5kZXBzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIHRoaXMkMS5kZXBzW2ldLmRlcGVuZCgpO1xuICB9XG59O1xuXG4vKipcbiAqIFJlbW92ZSBzZWxmIGZyb20gYWxsIGRlcGVuZGVuY2llcycgc3Vic2NyaWJlciBsaXN0LlxuICovXG5XYXRjaGVyLnByb3RvdHlwZS50ZWFyZG93biA9IGZ1bmN0aW9uIHRlYXJkb3duICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAvLyByZW1vdmUgc2VsZiBmcm9tIHZtJ3Mgd2F0Y2hlciBsaXN0XG4gICAgLy8gdGhpcyBpcyBhIHNvbWV3aGF0IGV4cGVuc2l2ZSBvcGVyYXRpb24gc28gd2Ugc2tpcCBpdFxuICAgIC8vIGlmIHRoZSB2bSBpcyBiZWluZyBkZXN0cm95ZWQuXG4gICAgaWYgKCF0aGlzLnZtLl9pc0JlaW5nRGVzdHJveWVkKSB7XG4gICAgICByZW1vdmUkMSh0aGlzLnZtLl93YXRjaGVycywgdGhpcyk7XG4gICAgfVxuICAgIHZhciBpID0gdGhpcy5kZXBzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB0aGlzJDEuZGVwc1tpXS5yZW1vdmVTdWIodGhpcyQxKTtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgfVxufTtcblxuLyoqXG4gKiBSZWN1cnNpdmVseSB0cmF2ZXJzZSBhbiBvYmplY3QgdG8gZXZva2UgYWxsIGNvbnZlcnRlZFxuICogZ2V0dGVycywgc28gdGhhdCBldmVyeSBuZXN0ZWQgcHJvcGVydHkgaW5zaWRlIHRoZSBvYmplY3RcbiAqIGlzIGNvbGxlY3RlZCBhcyBhIFwiZGVlcFwiIGRlcGVuZGVuY3kuXG4gKi9cbnZhciBzZWVuT2JqZWN0cyA9IG5ldyBfU2V0KCk7XG5mdW5jdGlvbiB0cmF2ZXJzZSAodmFsKSB7XG4gIHNlZW5PYmplY3RzLmNsZWFyKCk7XG4gIF90cmF2ZXJzZSh2YWwsIHNlZW5PYmplY3RzKTtcbn1cblxuZnVuY3Rpb24gX3RyYXZlcnNlICh2YWwsIHNlZW4pIHtcbiAgdmFyIGksIGtleXM7XG4gIHZhciBpc0EgPSBBcnJheS5pc0FycmF5KHZhbCk7XG4gIGlmICgoIWlzQSAmJiAhaXNPYmplY3QodmFsKSkgfHwgIU9iamVjdC5pc0V4dGVuc2libGUodmFsKSkge1xuICAgIHJldHVyblxuICB9XG4gIGlmICh2YWwuX19vYl9fKSB7XG4gICAgdmFyIGRlcElkID0gdmFsLl9fb2JfXy5kZXAuaWQ7XG4gICAgaWYgKHNlZW4uaGFzKGRlcElkKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNlZW4uYWRkKGRlcElkKTtcbiAgfVxuICBpZiAoaXNBKSB7XG4gICAgaSA9IHZhbC5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkgeyBfdHJhdmVyc2UodmFsW2ldLCBzZWVuKTsgfVxuICB9IGVsc2Uge1xuICAgIGtleXMgPSBPYmplY3Qua2V5cyh2YWwpO1xuICAgIGkgPSBrZXlzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7IF90cmF2ZXJzZSh2YWxba2V5c1tpXV0sIHNlZW4pOyB9XG4gIH1cbn1cblxuLyogICovXG5cbmZ1bmN0aW9uIGluaXRTdGF0ZSAodm0pIHtcbiAgdm0uX3dhdGNoZXJzID0gW107XG4gIHZhciBvcHRzID0gdm0uJG9wdGlvbnM7XG4gIGlmIChvcHRzLnByb3BzKSB7IGluaXRQcm9wcyh2bSwgb3B0cy5wcm9wcyk7IH1cbiAgaWYgKG9wdHMubWV0aG9kcykgeyBpbml0TWV0aG9kcyh2bSwgb3B0cy5tZXRob2RzKTsgfVxuICBpZiAob3B0cy5kYXRhKSB7XG4gICAgaW5pdERhdGEodm0pO1xuICB9IGVsc2Uge1xuICAgIG9ic2VydmUodm0uX2RhdGEgPSB7fSwgdHJ1ZSAvKiBhc1Jvb3REYXRhICovKTtcbiAgfVxuICBpZiAob3B0cy5jb21wdXRlZCkgeyBpbml0Q29tcHV0ZWQodm0sIG9wdHMuY29tcHV0ZWQpOyB9XG4gIGlmIChvcHRzLndhdGNoKSB7IGluaXRXYXRjaCh2bSwgb3B0cy53YXRjaCk7IH1cbn1cblxudmFyIGlzUmVzZXJ2ZWRQcm9wID0geyBrZXk6IDEsIHJlZjogMSwgc2xvdDogMSB9O1xuXG5mdW5jdGlvbiBpbml0UHJvcHMgKHZtLCBwcm9wcykge1xuICB2YXIgcHJvcHNEYXRhID0gdm0uJG9wdGlvbnMucHJvcHNEYXRhIHx8IHt9O1xuICB2YXIga2V5cyA9IHZtLiRvcHRpb25zLl9wcm9wS2V5cyA9IE9iamVjdC5rZXlzKHByb3BzKTtcbiAgdmFyIGlzUm9vdCA9ICF2bS4kcGFyZW50O1xuICAvLyByb290IGluc3RhbmNlIHByb3BzIHNob3VsZCBiZSBjb252ZXJ0ZWRcbiAgb2JzZXJ2ZXJTdGF0ZS5zaG91bGRDb252ZXJ0ID0gaXNSb290O1xuICB2YXIgbG9vcCA9IGZ1bmN0aW9uICggaSApIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpZiAoaXNSZXNlcnZlZFByb3Bba2V5XSkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgIChcIlxcXCJcIiArIGtleSArIFwiXFxcIiBpcyBhIHJlc2VydmVkIGF0dHJpYnV0ZSBhbmQgY2Fubm90IGJlIHVzZWQgYXMgY29tcG9uZW50IHByb3AuXCIpLFxuICAgICAgICAgIHZtXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBkZWZpbmVSZWFjdGl2ZSQkMSh2bSwga2V5LCB2YWxpZGF0ZVByb3Aoa2V5LCBwcm9wcywgcHJvcHNEYXRhLCB2bSksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHZtLiRwYXJlbnQgJiYgIW9ic2VydmVyU3RhdGUuaXNTZXR0aW5nUHJvcHMpIHtcbiAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgXCJBdm9pZCBtdXRhdGluZyBhIHByb3AgZGlyZWN0bHkgc2luY2UgdGhlIHZhbHVlIHdpbGwgYmUgXCIgK1xuICAgICAgICAgICAgXCJvdmVyd3JpdHRlbiB3aGVuZXZlciB0aGUgcGFyZW50IGNvbXBvbmVudCByZS1yZW5kZXJzLiBcIiArXG4gICAgICAgICAgICBcIkluc3RlYWQsIHVzZSBhIGRhdGEgb3IgY29tcHV0ZWQgcHJvcGVydHkgYmFzZWQgb24gdGhlIHByb3AncyBcIiArXG4gICAgICAgICAgICBcInZhbHVlLiBQcm9wIGJlaW5nIG11dGF0ZWQ6IFxcXCJcIiArIGtleSArIFwiXFxcIlwiLFxuICAgICAgICAgICAgdm1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmaW5lUmVhY3RpdmUkJDEodm0sIGtleSwgdmFsaWRhdGVQcm9wKGtleSwgcHJvcHMsIHByb3BzRGF0YSwgdm0pKTtcbiAgICB9XG4gIH07XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSBsb29wKCBpICk7XG4gIG9ic2VydmVyU3RhdGUuc2hvdWxkQ29udmVydCA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGluaXREYXRhICh2bSkge1xuICB2YXIgZGF0YSA9IHZtLiRvcHRpb25zLmRhdGE7XG4gIGRhdGEgPSB2bS5fZGF0YSA9IHR5cGVvZiBkYXRhID09PSAnZnVuY3Rpb24nXG4gICAgPyBkYXRhLmNhbGwodm0pXG4gICAgOiBkYXRhIHx8IHt9O1xuICBpZiAoIWlzUGxhaW5PYmplY3QoZGF0YSkpIHtcbiAgICBkYXRhID0ge307XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB3YXJuKFxuICAgICAgJ2RhdGEgZnVuY3Rpb25zIHNob3VsZCByZXR1cm4gYW4gb2JqZWN0OlxcbicgK1xuICAgICAgJ2h0dHBzOi8vdnVlanMub3JnL3YyL2d1aWRlL2NvbXBvbmVudHMuaHRtbCNkYXRhLU11c3QtQmUtYS1GdW5jdGlvbicsXG4gICAgICB2bVxuICAgICk7XG4gIH1cbiAgLy8gcHJveHkgZGF0YSBvbiBpbnN0YW5jZVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpO1xuICB2YXIgcHJvcHMgPSB2bS4kb3B0aW9ucy5wcm9wcztcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIGlmIChwcm9wcyAmJiBoYXNPd24ocHJvcHMsIGtleXNbaV0pKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oXG4gICAgICAgIFwiVGhlIGRhdGEgcHJvcGVydHkgXFxcIlwiICsgKGtleXNbaV0pICsgXCJcXFwiIGlzIGFscmVhZHkgZGVjbGFyZWQgYXMgYSBwcm9wLiBcIiArXG4gICAgICAgIFwiVXNlIHByb3AgZGVmYXVsdCB2YWx1ZSBpbnN0ZWFkLlwiLFxuICAgICAgICB2bVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJveHkodm0sIGtleXNbaV0pO1xuICAgIH1cbiAgfVxuICAvLyBvYnNlcnZlIGRhdGFcbiAgb2JzZXJ2ZShkYXRhLCB0cnVlIC8qIGFzUm9vdERhdGEgKi8pO1xufVxuXG52YXIgY29tcHV0ZWRTaGFyZWREZWZpbml0aW9uID0ge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBjb25maWd1cmFibGU6IHRydWUsXG4gIGdldDogbm9vcCxcbiAgc2V0OiBub29wXG59O1xuXG5mdW5jdGlvbiBpbml0Q29tcHV0ZWQgKHZtLCBjb21wdXRlZCkge1xuICBmb3IgKHZhciBrZXkgaW4gY29tcHV0ZWQpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBrZXkgaW4gdm0pIHtcbiAgICAgIHdhcm4oXG4gICAgICAgIFwiZXhpc3RpbmcgaW5zdGFuY2UgcHJvcGVydHkgXFxcIlwiICsga2V5ICsgXCJcXFwiIHdpbGwgYmUgXCIgK1xuICAgICAgICBcIm92ZXJ3cml0dGVuIGJ5IGEgY29tcHV0ZWQgcHJvcGVydHkgd2l0aCB0aGUgc2FtZSBuYW1lLlwiLFxuICAgICAgICB2bVxuICAgICAgKTtcbiAgICB9XG4gICAgdmFyIHVzZXJEZWYgPSBjb21wdXRlZFtrZXldO1xuICAgIGlmICh0eXBlb2YgdXNlckRlZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcHV0ZWRTaGFyZWREZWZpbml0aW9uLmdldCA9IG1ha2VDb21wdXRlZEdldHRlcih1c2VyRGVmLCB2bSk7XG4gICAgICBjb21wdXRlZFNoYXJlZERlZmluaXRpb24uc2V0ID0gbm9vcDtcbiAgICB9IGVsc2Uge1xuICAgICAgY29tcHV0ZWRTaGFyZWREZWZpbml0aW9uLmdldCA9IHVzZXJEZWYuZ2V0XG4gICAgICAgID8gdXNlckRlZi5jYWNoZSAhPT0gZmFsc2VcbiAgICAgICAgICA/IG1ha2VDb21wdXRlZEdldHRlcih1c2VyRGVmLmdldCwgdm0pXG4gICAgICAgICAgOiBiaW5kJDEodXNlckRlZi5nZXQsIHZtKVxuICAgICAgICA6IG5vb3A7XG4gICAgICBjb21wdXRlZFNoYXJlZERlZmluaXRpb24uc2V0ID0gdXNlckRlZi5zZXRcbiAgICAgICAgPyBiaW5kJDEodXNlckRlZi5zZXQsIHZtKVxuICAgICAgICA6IG5vb3A7XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh2bSwga2V5LCBjb21wdXRlZFNoYXJlZERlZmluaXRpb24pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VDb21wdXRlZEdldHRlciAoZ2V0dGVyLCBvd25lcikge1xuICB2YXIgd2F0Y2hlciA9IG5ldyBXYXRjaGVyKG93bmVyLCBnZXR0ZXIsIG5vb3AsIHtcbiAgICBsYXp5OiB0cnVlXG4gIH0pO1xuICByZXR1cm4gZnVuY3Rpb24gY29tcHV0ZWRHZXR0ZXIgKCkge1xuICAgIGlmICh3YXRjaGVyLmRpcnR5KSB7XG4gICAgICB3YXRjaGVyLmV2YWx1YXRlKCk7XG4gICAgfVxuICAgIGlmIChEZXAudGFyZ2V0KSB7XG4gICAgICB3YXRjaGVyLmRlcGVuZCgpO1xuICAgIH1cbiAgICByZXR1cm4gd2F0Y2hlci52YWx1ZVxuICB9XG59XG5cbmZ1bmN0aW9uIGluaXRNZXRob2RzICh2bSwgbWV0aG9kcykge1xuICBmb3IgKHZhciBrZXkgaW4gbWV0aG9kcykge1xuICAgIHZtW2tleV0gPSBtZXRob2RzW2tleV0gPT0gbnVsbCA/IG5vb3AgOiBiaW5kJDEobWV0aG9kc1trZXldLCB2bSk7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgbWV0aG9kc1trZXldID09IG51bGwpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgIFwibWV0aG9kIFxcXCJcIiArIGtleSArIFwiXFxcIiBoYXMgYW4gdW5kZWZpbmVkIHZhbHVlIGluIHRoZSBjb21wb25lbnQgZGVmaW5pdGlvbi4gXCIgK1xuICAgICAgICBcIkRpZCB5b3UgcmVmZXJlbmNlIHRoZSBmdW5jdGlvbiBjb3JyZWN0bHk/XCIsXG4gICAgICAgIHZtXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpbml0V2F0Y2ggKHZtLCB3YXRjaCkge1xuICBmb3IgKHZhciBrZXkgaW4gd2F0Y2gpIHtcbiAgICB2YXIgaGFuZGxlciA9IHdhdGNoW2tleV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoaGFuZGxlcikpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjcmVhdGVXYXRjaGVyKHZtLCBrZXksIGhhbmRsZXJbaV0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjcmVhdGVXYXRjaGVyKHZtLCBrZXksIGhhbmRsZXIpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVXYXRjaGVyICh2bSwga2V5LCBoYW5kbGVyKSB7XG4gIHZhciBvcHRpb25zO1xuICBpZiAoaXNQbGFpbk9iamVjdChoYW5kbGVyKSkge1xuICAgIG9wdGlvbnMgPSBoYW5kbGVyO1xuICAgIGhhbmRsZXIgPSBoYW5kbGVyLmhhbmRsZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnc3RyaW5nJykge1xuICAgIGhhbmRsZXIgPSB2bVtoYW5kbGVyXTtcbiAgfVxuICB2bS4kd2F0Y2goa2V5LCBoYW5kbGVyLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gc3RhdGVNaXhpbiAoVnVlKSB7XG4gIC8vIGZsb3cgc29tZWhvdyBoYXMgcHJvYmxlbXMgd2l0aCBkaXJlY3RseSBkZWNsYXJlZCBkZWZpbml0aW9uIG9iamVjdFxuICAvLyB3aGVuIHVzaW5nIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSwgc28gd2UgaGF2ZSB0byBwcm9jZWR1cmFsbHkgYnVpbGQgdXBcbiAgLy8gdGhlIG9iamVjdCBoZXJlLlxuICB2YXIgZGF0YURlZiA9IHt9O1xuICBkYXRhRGVmLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YVxuICB9O1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgIGRhdGFEZWYuc2V0ID0gZnVuY3Rpb24gKG5ld0RhdGEpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICdBdm9pZCByZXBsYWNpbmcgaW5zdGFuY2Ugcm9vdCAkZGF0YS4gJyArXG4gICAgICAgICdVc2UgbmVzdGVkIGRhdGEgcHJvcGVydGllcyBpbnN0ZWFkLicsXG4gICAgICAgIHRoaXNcbiAgICAgICk7XG4gICAgfTtcbiAgfVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoVnVlLnByb3RvdHlwZSwgJyRkYXRhJywgZGF0YURlZik7XG5cbiAgVnVlLnByb3RvdHlwZS4kc2V0ID0gc2V0JDE7XG4gIFZ1ZS5wcm90b3R5cGUuJGRlbGV0ZSA9IGRlbDtcblxuICBWdWUucHJvdG90eXBlLiR3YXRjaCA9IGZ1bmN0aW9uIChcbiAgICBleHBPckZuLFxuICAgIGNiLFxuICAgIG9wdGlvbnNcbiAgKSB7XG4gICAgdmFyIHZtID0gdGhpcztcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLnVzZXIgPSB0cnVlO1xuICAgIHZhciB3YXRjaGVyID0gbmV3IFdhdGNoZXIodm0sIGV4cE9yRm4sIGNiLCBvcHRpb25zKTtcbiAgICBpZiAob3B0aW9ucy5pbW1lZGlhdGUpIHtcbiAgICAgIGNiLmNhbGwodm0sIHdhdGNoZXIudmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gdW53YXRjaEZuICgpIHtcbiAgICAgIHdhdGNoZXIudGVhcmRvd24oKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3h5ICh2bSwga2V5KSB7XG4gIGlmICghaXNSZXNlcnZlZChrZXkpKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHZtLCBrZXksIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIHByb3h5R2V0dGVyICgpIHtcbiAgICAgICAgcmV0dXJuIHZtLl9kYXRhW2tleV1cbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHByb3h5U2V0dGVyICh2YWwpIHtcbiAgICAgICAgdm0uX2RhdGFba2V5XSA9IHZhbDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG4vKiAgKi9cblxudmFyIHVpZCA9IDA7XG5cbmZ1bmN0aW9uIGluaXRNaXhpbiAoVnVlKSB7XG4gIFZ1ZS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIHZhciB2bSA9IHRoaXM7XG4gICAgLy8gYSB1aWRcbiAgICB2bS5fdWlkID0gdWlkKys7XG4gICAgLy8gYSBmbGFnIHRvIGF2b2lkIHRoaXMgYmVpbmcgb2JzZXJ2ZWRcbiAgICB2bS5faXNWdWUgPSB0cnVlO1xuICAgIC8vIG1lcmdlIG9wdGlvbnNcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLl9pc0NvbXBvbmVudCkge1xuICAgICAgLy8gb3B0aW1pemUgaW50ZXJuYWwgY29tcG9uZW50IGluc3RhbnRpYXRpb25cbiAgICAgIC8vIHNpbmNlIGR5bmFtaWMgb3B0aW9ucyBtZXJnaW5nIGlzIHByZXR0eSBzbG93LCBhbmQgbm9uZSBvZiB0aGVcbiAgICAgIC8vIGludGVybmFsIGNvbXBvbmVudCBvcHRpb25zIG5lZWRzIHNwZWNpYWwgdHJlYXRtZW50LlxuICAgICAgaW5pdEludGVybmFsQ29tcG9uZW50KHZtLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdm0uJG9wdGlvbnMgPSBtZXJnZU9wdGlvbnMoXG4gICAgICAgIHJlc29sdmVDb25zdHJ1Y3Rvck9wdGlvbnModm0uY29uc3RydWN0b3IpLFxuICAgICAgICBvcHRpb25zIHx8IHt9LFxuICAgICAgICB2bVxuICAgICAgKTtcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgaW5pdFByb3h5KHZtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdm0uX3JlbmRlclByb3h5ID0gdm07XG4gICAgfVxuICAgIC8vIGV4cG9zZSByZWFsIHNlbGZcbiAgICB2bS5fc2VsZiA9IHZtO1xuICAgIGluaXRMaWZlY3ljbGUodm0pO1xuICAgIGluaXRFdmVudHModm0pO1xuICAgIGluaXRSZW5kZXIodm0pO1xuICAgIGNhbGxIb29rKHZtLCAnYmVmb3JlQ3JlYXRlJyk7XG4gICAgaW5pdFN0YXRlKHZtKTtcbiAgICBjYWxsSG9vayh2bSwgJ2NyZWF0ZWQnKTtcbiAgICBpZiAodm0uJG9wdGlvbnMuZWwpIHtcbiAgICAgIHZtLiRtb3VudCh2bS4kb3B0aW9ucy5lbCk7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBpbml0SW50ZXJuYWxDb21wb25lbnQgKHZtLCBvcHRpb25zKSB7XG4gIHZhciBvcHRzID0gdm0uJG9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKHZtLmNvbnN0cnVjdG9yLm9wdGlvbnMpO1xuICAvLyBkb2luZyB0aGlzIGJlY2F1c2UgaXQncyBmYXN0ZXIgdGhhbiBkeW5hbWljIGVudW1lcmF0aW9uLlxuICBvcHRzLnBhcmVudCA9IG9wdGlvbnMucGFyZW50O1xuICBvcHRzLnByb3BzRGF0YSA9IG9wdGlvbnMucHJvcHNEYXRhO1xuICBvcHRzLl9wYXJlbnRWbm9kZSA9IG9wdGlvbnMuX3BhcmVudFZub2RlO1xuICBvcHRzLl9wYXJlbnRMaXN0ZW5lcnMgPSBvcHRpb25zLl9wYXJlbnRMaXN0ZW5lcnM7XG4gIG9wdHMuX3JlbmRlckNoaWxkcmVuID0gb3B0aW9ucy5fcmVuZGVyQ2hpbGRyZW47XG4gIG9wdHMuX2NvbXBvbmVudFRhZyA9IG9wdGlvbnMuX2NvbXBvbmVudFRhZztcbiAgb3B0cy5fcGFyZW50RWxtID0gb3B0aW9ucy5fcGFyZW50RWxtO1xuICBvcHRzLl9yZWZFbG0gPSBvcHRpb25zLl9yZWZFbG07XG4gIGlmIChvcHRpb25zLnJlbmRlcikge1xuICAgIG9wdHMucmVuZGVyID0gb3B0aW9ucy5yZW5kZXI7XG4gICAgb3B0cy5zdGF0aWNSZW5kZXJGbnMgPSBvcHRpb25zLnN0YXRpY1JlbmRlckZucztcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29uc3RydWN0b3JPcHRpb25zIChDdG9yKSB7XG4gIHZhciBvcHRpb25zID0gQ3Rvci5vcHRpb25zO1xuICBpZiAoQ3Rvci5zdXBlcikge1xuICAgIHZhciBzdXBlck9wdGlvbnMgPSBDdG9yLnN1cGVyLm9wdGlvbnM7XG4gICAgdmFyIGNhY2hlZFN1cGVyT3B0aW9ucyA9IEN0b3Iuc3VwZXJPcHRpb25zO1xuICAgIHZhciBleHRlbmRPcHRpb25zID0gQ3Rvci5leHRlbmRPcHRpb25zO1xuICAgIGlmIChzdXBlck9wdGlvbnMgIT09IGNhY2hlZFN1cGVyT3B0aW9ucykge1xuICAgICAgLy8gc3VwZXIgb3B0aW9uIGNoYW5nZWRcbiAgICAgIEN0b3Iuc3VwZXJPcHRpb25zID0gc3VwZXJPcHRpb25zO1xuICAgICAgZXh0ZW5kT3B0aW9ucy5yZW5kZXIgPSBvcHRpb25zLnJlbmRlcjtcbiAgICAgIGV4dGVuZE9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnM7XG4gICAgICBleHRlbmRPcHRpb25zLl9zY29wZUlkID0gb3B0aW9ucy5fc2NvcGVJZDtcbiAgICAgIG9wdGlvbnMgPSBDdG9yLm9wdGlvbnMgPSBtZXJnZU9wdGlvbnMoc3VwZXJPcHRpb25zLCBleHRlbmRPcHRpb25zKTtcbiAgICAgIGlmIChvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgb3B0aW9ucy5jb21wb25lbnRzW29wdGlvbnMubmFtZV0gPSBDdG9yO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb3B0aW9uc1xufVxuXG5mdW5jdGlvbiBWdWUkMiAob3B0aW9ucykge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJlxuICAgICEodGhpcyBpbnN0YW5jZW9mIFZ1ZSQyKSkge1xuICAgIHdhcm4oJ1Z1ZSBpcyBhIGNvbnN0cnVjdG9yIGFuZCBzaG91bGQgYmUgY2FsbGVkIHdpdGggdGhlIGBuZXdgIGtleXdvcmQnKTtcbiAgfVxuICB0aGlzLl9pbml0KG9wdGlvbnMpO1xufVxuXG5pbml0TWl4aW4oVnVlJDIpO1xuc3RhdGVNaXhpbihWdWUkMik7XG5ldmVudHNNaXhpbihWdWUkMik7XG5saWZlY3ljbGVNaXhpbihWdWUkMik7XG5yZW5kZXJNaXhpbihWdWUkMik7XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0VXNlIChWdWUpIHtcbiAgVnVlLnVzZSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAocGx1Z2luLmluc3RhbGxlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIGFkZGl0aW9uYWwgcGFyYW1ldGVyc1xuICAgIHZhciBhcmdzID0gdG9BcnJheShhcmd1bWVudHMsIDEpO1xuICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICBpZiAodHlwZW9mIHBsdWdpbi5pbnN0YWxsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwbHVnaW4uaW5zdGFsbC5hcHBseShwbHVnaW4sIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwbHVnaW4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxuICAgIHBsdWdpbi5pbnN0YWxsZWQgPSB0cnVlO1xuICAgIHJldHVybiB0aGlzXG4gIH07XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0TWl4aW4kMSAoVnVlKSB7XG4gIFZ1ZS5taXhpbiA9IGZ1bmN0aW9uIChtaXhpbikge1xuICAgIHRoaXMub3B0aW9ucyA9IG1lcmdlT3B0aW9ucyh0aGlzLm9wdGlvbnMsIG1peGluKTtcbiAgfTtcbn1cblxuLyogICovXG5cbmZ1bmN0aW9uIGluaXRFeHRlbmQgKFZ1ZSkge1xuICAvKipcbiAgICogRWFjaCBpbnN0YW5jZSBjb25zdHJ1Y3RvciwgaW5jbHVkaW5nIFZ1ZSwgaGFzIGEgdW5pcXVlXG4gICAqIGNpZC4gVGhpcyBlbmFibGVzIHVzIHRvIGNyZWF0ZSB3cmFwcGVkIFwiY2hpbGRcbiAgICogY29uc3RydWN0b3JzXCIgZm9yIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UgYW5kIGNhY2hlIHRoZW0uXG4gICAqL1xuICBWdWUuY2lkID0gMDtcbiAgdmFyIGNpZCA9IDE7XG5cbiAgLyoqXG4gICAqIENsYXNzIGluaGVyaXRhbmNlXG4gICAqL1xuICBWdWUuZXh0ZW5kID0gZnVuY3Rpb24gKGV4dGVuZE9wdGlvbnMpIHtcbiAgICBleHRlbmRPcHRpb25zID0gZXh0ZW5kT3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgU3VwZXIgPSB0aGlzO1xuICAgIHZhciBTdXBlcklkID0gU3VwZXIuY2lkO1xuICAgIHZhciBjYWNoZWRDdG9ycyA9IGV4dGVuZE9wdGlvbnMuX0N0b3IgfHwgKGV4dGVuZE9wdGlvbnMuX0N0b3IgPSB7fSk7XG4gICAgaWYgKGNhY2hlZEN0b3JzW1N1cGVySWRdKSB7XG4gICAgICByZXR1cm4gY2FjaGVkQ3RvcnNbU3VwZXJJZF1cbiAgICB9XG4gICAgdmFyIG5hbWUgPSBleHRlbmRPcHRpb25zLm5hbWUgfHwgU3VwZXIub3B0aW9ucy5uYW1lO1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBpZiAoIS9eW2EtekEtWl1bXFx3LV0qJC8udGVzdChuYW1lKSkge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgICdJbnZhbGlkIGNvbXBvbmVudCBuYW1lOiBcIicgKyBuYW1lICsgJ1wiLiBDb21wb25lbnQgbmFtZXMgJyArXG4gICAgICAgICAgJ2NhbiBvbmx5IGNvbnRhaW4gYWxwaGFudW1lcmljIGNoYXJhY3RlcnMgYW5kIHRoZSBoeXBoZW4sICcgK1xuICAgICAgICAgICdhbmQgbXVzdCBzdGFydCB3aXRoIGEgbGV0dGVyLidcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIFN1YiA9IGZ1bmN0aW9uIFZ1ZUNvbXBvbmVudCAob3B0aW9ucykge1xuICAgICAgdGhpcy5faW5pdChvcHRpb25zKTtcbiAgICB9O1xuICAgIFN1Yi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFN1cGVyLnByb3RvdHlwZSk7XG4gICAgU3ViLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN1YjtcbiAgICBTdWIuY2lkID0gY2lkKys7XG4gICAgU3ViLm9wdGlvbnMgPSBtZXJnZU9wdGlvbnMoXG4gICAgICBTdXBlci5vcHRpb25zLFxuICAgICAgZXh0ZW5kT3B0aW9uc1xuICAgICk7XG4gICAgU3ViWydzdXBlciddID0gU3VwZXI7XG4gICAgLy8gYWxsb3cgZnVydGhlciBleHRlbnNpb24vbWl4aW4vcGx1Z2luIHVzYWdlXG4gICAgU3ViLmV4dGVuZCA9IFN1cGVyLmV4dGVuZDtcbiAgICBTdWIubWl4aW4gPSBTdXBlci5taXhpbjtcbiAgICBTdWIudXNlID0gU3VwZXIudXNlO1xuICAgIC8vIGNyZWF0ZSBhc3NldCByZWdpc3RlcnMsIHNvIGV4dGVuZGVkIGNsYXNzZXNcbiAgICAvLyBjYW4gaGF2ZSB0aGVpciBwcml2YXRlIGFzc2V0cyB0b28uXG4gICAgY29uZmlnLl9hc3NldFR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgIFN1Ylt0eXBlXSA9IFN1cGVyW3R5cGVdO1xuICAgIH0pO1xuICAgIC8vIGVuYWJsZSByZWN1cnNpdmUgc2VsZi1sb29rdXBcbiAgICBpZiAobmFtZSkge1xuICAgICAgU3ViLm9wdGlvbnMuY29tcG9uZW50c1tuYW1lXSA9IFN1YjtcbiAgICB9XG4gICAgLy8ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgc3VwZXIgb3B0aW9ucyBhdCBleHRlbnNpb24gdGltZS5cbiAgICAvLyBsYXRlciBhdCBpbnN0YW50aWF0aW9uIHdlIGNhbiBjaGVjayBpZiBTdXBlcidzIG9wdGlvbnMgaGF2ZVxuICAgIC8vIGJlZW4gdXBkYXRlZC5cbiAgICBTdWIuc3VwZXJPcHRpb25zID0gU3VwZXIub3B0aW9ucztcbiAgICBTdWIuZXh0ZW5kT3B0aW9ucyA9IGV4dGVuZE9wdGlvbnM7XG4gICAgLy8gY2FjaGUgY29uc3RydWN0b3JcbiAgICBjYWNoZWRDdG9yc1tTdXBlcklkXSA9IFN1YjtcbiAgICByZXR1cm4gU3ViXG4gIH07XG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0QXNzZXRSZWdpc3RlcnMgKFZ1ZSkge1xuICAvKipcbiAgICogQ3JlYXRlIGFzc2V0IHJlZ2lzdHJhdGlvbiBtZXRob2RzLlxuICAgKi9cbiAgY29uZmlnLl9hc3NldFR5cGVzLmZvckVhY2goZnVuY3Rpb24gKHR5cGUpIHtcbiAgICBWdWVbdHlwZV0gPSBmdW5jdGlvbiAoXG4gICAgICBpZCxcbiAgICAgIGRlZmluaXRpb25cbiAgICApIHtcbiAgICAgIGlmICghZGVmaW5pdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3R5cGUgKyAncyddW2lkXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgaWYgKHR5cGUgPT09ICdjb21wb25lbnQnICYmIGNvbmZpZy5pc1Jlc2VydmVkVGFnKGlkKSkge1xuICAgICAgICAgICAgd2FybihcbiAgICAgICAgICAgICAgJ0RvIG5vdCB1c2UgYnVpbHQtaW4gb3IgcmVzZXJ2ZWQgSFRNTCBlbGVtZW50cyBhcyBjb21wb25lbnQgJyArXG4gICAgICAgICAgICAgICdpZDogJyArIGlkXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gJ2NvbXBvbmVudCcgJiYgaXNQbGFpbk9iamVjdChkZWZpbml0aW9uKSkge1xuICAgICAgICAgIGRlZmluaXRpb24ubmFtZSA9IGRlZmluaXRpb24ubmFtZSB8fCBpZDtcbiAgICAgICAgICBkZWZpbml0aW9uID0gdGhpcy5vcHRpb25zLl9iYXNlLmV4dGVuZChkZWZpbml0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSA9PT0gJ2RpcmVjdGl2ZScgJiYgdHlwZW9mIGRlZmluaXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBkZWZpbml0aW9uID0geyBiaW5kOiBkZWZpbml0aW9uLCB1cGRhdGU6IGRlZmluaXRpb24gfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9wdGlvbnNbdHlwZSArICdzJ11baWRdID0gZGVmaW5pdGlvbjtcbiAgICAgICAgcmV0dXJuIGRlZmluaXRpb25cbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbn1cblxuLyogICovXG5cbnZhciBwYXR0ZXJuVHlwZXMgPSBbU3RyaW5nLCBSZWdFeHBdO1xuXG5mdW5jdGlvbiBnZXRDb21wb25lbnROYW1lIChvcHRzKSB7XG4gIHJldHVybiBvcHRzICYmIChvcHRzLkN0b3Iub3B0aW9ucy5uYW1lIHx8IG9wdHMudGFnKVxufVxuXG5mdW5jdGlvbiBtYXRjaGVzIChwYXR0ZXJuLCBuYW1lKSB7XG4gIGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gcGF0dGVybi5zcGxpdCgnLCcpLmluZGV4T2YobmFtZSkgPiAtMVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBwYXR0ZXJuLnRlc3QobmFtZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBwcnVuZUNhY2hlIChjYWNoZSwgZmlsdGVyKSB7XG4gIGZvciAodmFyIGtleSBpbiBjYWNoZSkge1xuICAgIHZhciBjYWNoZWROb2RlID0gY2FjaGVba2V5XTtcbiAgICBpZiAoY2FjaGVkTm9kZSkge1xuICAgICAgdmFyIG5hbWUgPSBnZXRDb21wb25lbnROYW1lKGNhY2hlZE5vZGUuY29tcG9uZW50T3B0aW9ucyk7XG4gICAgICBpZiAobmFtZSAmJiAhZmlsdGVyKG5hbWUpKSB7XG4gICAgICAgIHBydW5lQ2FjaGVFbnRyeShjYWNoZWROb2RlKTtcbiAgICAgICAgY2FjaGVba2V5XSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBydW5lQ2FjaGVFbnRyeSAodm5vZGUpIHtcbiAgaWYgKHZub2RlKSB7XG4gICAgaWYgKCF2bm9kZS5jb21wb25lbnRJbnN0YW5jZS5faW5hY3RpdmUpIHtcbiAgICAgIGNhbGxIb29rKHZub2RlLmNvbXBvbmVudEluc3RhbmNlLCAnZGVhY3RpdmF0ZWQnKTtcbiAgICB9XG4gICAgdm5vZGUuY29tcG9uZW50SW5zdGFuY2UuJGRlc3Ryb3koKTtcbiAgfVxufVxuXG52YXIgS2VlcEFsaXZlID0ge1xuICBuYW1lOiAna2VlcC1hbGl2ZScsXG4gIGFic3RyYWN0OiB0cnVlLFxuXG4gIHByb3BzOiB7XG4gICAgaW5jbHVkZTogcGF0dGVyblR5cGVzLFxuICAgIGV4Y2x1ZGU6IHBhdHRlcm5UeXBlc1xuICB9LFxuXG4gIGNyZWF0ZWQ6IGZ1bmN0aW9uIGNyZWF0ZWQgKCkge1xuICAgIHRoaXMuY2FjaGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB9LFxuXG4gIGRlc3Ryb3llZDogZnVuY3Rpb24gZGVzdHJveWVkICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmNhY2hlKSB7XG4gICAgICBwcnVuZUNhY2hlRW50cnkodGhpcyQxLmNhY2hlW2tleV0pO1xuICAgIH1cbiAgfSxcblxuICB3YXRjaDoge1xuICAgIGluY2x1ZGU6IGZ1bmN0aW9uIGluY2x1ZGUgKHZhbCkge1xuICAgICAgcHJ1bmVDYWNoZSh0aGlzLmNhY2hlLCBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gbWF0Y2hlcyh2YWwsIG5hbWUpOyB9KTtcbiAgICB9LFxuICAgIGV4Y2x1ZGU6IGZ1bmN0aW9uIGV4Y2x1ZGUgKHZhbCkge1xuICAgICAgcHJ1bmVDYWNoZSh0aGlzLmNhY2hlLCBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gIW1hdGNoZXModmFsLCBuYW1lKTsgfSk7XG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyICgpIHtcbiAgICB2YXIgdm5vZGUgPSBnZXRGaXJzdENvbXBvbmVudENoaWxkKHRoaXMuJHNsb3RzLmRlZmF1bHQpO1xuICAgIHZhciBjb21wb25lbnRPcHRpb25zID0gdm5vZGUgJiYgdm5vZGUuY29tcG9uZW50T3B0aW9ucztcbiAgICBpZiAoY29tcG9uZW50T3B0aW9ucykge1xuICAgICAgLy8gY2hlY2sgcGF0dGVyblxuICAgICAgdmFyIG5hbWUgPSBnZXRDb21wb25lbnROYW1lKGNvbXBvbmVudE9wdGlvbnMpO1xuICAgICAgaWYgKG5hbWUgJiYgKFxuICAgICAgICAodGhpcy5pbmNsdWRlICYmICFtYXRjaGVzKHRoaXMuaW5jbHVkZSwgbmFtZSkpIHx8XG4gICAgICAgICh0aGlzLmV4Y2x1ZGUgJiYgbWF0Y2hlcyh0aGlzLmV4Y2x1ZGUsIG5hbWUpKVxuICAgICAgKSkge1xuICAgICAgICByZXR1cm4gdm5vZGVcbiAgICAgIH1cbiAgICAgIHZhciBrZXkgPSB2bm9kZS5rZXkgPT0gbnVsbFxuICAgICAgICAvLyBzYW1lIGNvbnN0cnVjdG9yIG1heSBnZXQgcmVnaXN0ZXJlZCBhcyBkaWZmZXJlbnQgbG9jYWwgY29tcG9uZW50c1xuICAgICAgICAvLyBzbyBjaWQgYWxvbmUgaXMgbm90IGVub3VnaCAoIzMyNjkpXG4gICAgICAgID8gY29tcG9uZW50T3B0aW9ucy5DdG9yLmNpZCArIChjb21wb25lbnRPcHRpb25zLnRhZyA/IChcIjo6XCIgKyAoY29tcG9uZW50T3B0aW9ucy50YWcpKSA6ICcnKVxuICAgICAgICA6IHZub2RlLmtleTtcbiAgICAgIGlmICh0aGlzLmNhY2hlW2tleV0pIHtcbiAgICAgICAgdm5vZGUuY29tcG9uZW50SW5zdGFuY2UgPSB0aGlzLmNhY2hlW2tleV0uY29tcG9uZW50SW5zdGFuY2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNhY2hlW2tleV0gPSB2bm9kZTtcbiAgICAgIH1cbiAgICAgIHZub2RlLmRhdGEua2VlcEFsaXZlID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlXG4gIH1cbn07XG5cbnZhciBidWlsdEluQ29tcG9uZW50cyA9IHtcbiAgS2VlcEFsaXZlOiBLZWVwQWxpdmVcbn07XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBpbml0R2xvYmFsQVBJIChWdWUpIHtcbiAgLy8gY29uZmlnXG4gIHZhciBjb25maWdEZWYgPSB7fTtcbiAgY29uZmlnRGVmLmdldCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbmZpZzsgfTtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBjb25maWdEZWYuc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgd2FybihcbiAgICAgICAgJ0RvIG5vdCByZXBsYWNlIHRoZSBWdWUuY29uZmlnIG9iamVjdCwgc2V0IGluZGl2aWR1YWwgZmllbGRzIGluc3RlYWQuJ1xuICAgICAgKTtcbiAgICB9O1xuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShWdWUsICdjb25maWcnLCBjb25maWdEZWYpO1xuICBWdWUudXRpbCA9IHV0aWw7XG4gIFZ1ZS5zZXQgPSBzZXQkMTtcbiAgVnVlLmRlbGV0ZSA9IGRlbDtcbiAgVnVlLm5leHRUaWNrID0gbmV4dFRpY2s7XG5cbiAgVnVlLm9wdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBjb25maWcuX2Fzc2V0VHlwZXMuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgIFZ1ZS5vcHRpb25zW3R5cGUgKyAncyddID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgfSk7XG5cbiAgLy8gdGhpcyBpcyB1c2VkIHRvIGlkZW50aWZ5IHRoZSBcImJhc2VcIiBjb25zdHJ1Y3RvciB0byBleHRlbmQgYWxsIHBsYWluLW9iamVjdFxuICAvLyBjb21wb25lbnRzIHdpdGggaW4gV2VleCdzIG11bHRpLWluc3RhbmNlIHNjZW5hcmlvcy5cbiAgVnVlLm9wdGlvbnMuX2Jhc2UgPSBWdWU7XG5cbiAgZXh0ZW5kKFZ1ZS5vcHRpb25zLmNvbXBvbmVudHMsIGJ1aWx0SW5Db21wb25lbnRzKTtcblxuICBpbml0VXNlKFZ1ZSk7XG4gIGluaXRNaXhpbiQxKFZ1ZSk7XG4gIGluaXRFeHRlbmQoVnVlKTtcbiAgaW5pdEFzc2V0UmVnaXN0ZXJzKFZ1ZSk7XG59XG5cbmluaXRHbG9iYWxBUEkoVnVlJDIpO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoVnVlJDIucHJvdG90eXBlLCAnJGlzU2VydmVyJywge1xuICBnZXQ6IGlzU2VydmVyUmVuZGVyaW5nXG59KTtcblxuVnVlJDIudmVyc2lvbiA9ICcyLjEuMTAnO1xuXG4vKiAgKi9cblxuLy8gYXR0cmlidXRlcyB0aGF0IHNob3VsZCBiZSB1c2luZyBwcm9wcyBmb3IgYmluZGluZ1xudmFyIGFjY2VwdFZhbHVlID0gbWFrZU1hcCgnaW5wdXQsdGV4dGFyZWEsb3B0aW9uLHNlbGVjdCcpO1xudmFyIG11c3RVc2VQcm9wID0gZnVuY3Rpb24gKHRhZywgdHlwZSwgYXR0cikge1xuICByZXR1cm4gKFxuICAgIChhdHRyID09PSAndmFsdWUnICYmIGFjY2VwdFZhbHVlKHRhZykpICYmIHR5cGUgIT09ICdidXR0b24nIHx8XG4gICAgKGF0dHIgPT09ICdzZWxlY3RlZCcgJiYgdGFnID09PSAnb3B0aW9uJykgfHxcbiAgICAoYXR0ciA9PT0gJ2NoZWNrZWQnICYmIHRhZyA9PT0gJ2lucHV0JykgfHxcbiAgICAoYXR0ciA9PT0gJ211dGVkJyAmJiB0YWcgPT09ICd2aWRlbycpXG4gIClcbn07XG5cbnZhciBpc0VudW1lcmF0ZWRBdHRyID0gbWFrZU1hcCgnY29udGVudGVkaXRhYmxlLGRyYWdnYWJsZSxzcGVsbGNoZWNrJyk7XG5cbnZhciBpc0Jvb2xlYW5BdHRyID0gbWFrZU1hcChcbiAgJ2FsbG93ZnVsbHNjcmVlbixhc3luYyxhdXRvZm9jdXMsYXV0b3BsYXksY2hlY2tlZCxjb21wYWN0LGNvbnRyb2xzLGRlY2xhcmUsJyArXG4gICdkZWZhdWx0LGRlZmF1bHRjaGVja2VkLGRlZmF1bHRtdXRlZCxkZWZhdWx0c2VsZWN0ZWQsZGVmZXIsZGlzYWJsZWQsJyArXG4gICdlbmFibGVkLGZvcm1ub3ZhbGlkYXRlLGhpZGRlbixpbmRldGVybWluYXRlLGluZXJ0LGlzbWFwLGl0ZW1zY29wZSxsb29wLG11bHRpcGxlLCcgK1xuICAnbXV0ZWQsbm9ocmVmLG5vcmVzaXplLG5vc2hhZGUsbm92YWxpZGF0ZSxub3dyYXAsb3BlbixwYXVzZW9uZXhpdCxyZWFkb25seSwnICtcbiAgJ3JlcXVpcmVkLHJldmVyc2VkLHNjb3BlZCxzZWFtbGVzcyxzZWxlY3RlZCxzb3J0YWJsZSx0cmFuc2xhdGUsJyArXG4gICd0cnVlc3BlZWQsdHlwZW11c3RtYXRjaCx2aXNpYmxlJ1xuKTtcblxudmFyIHhsaW5rTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayc7XG5cbnZhciBpc1hsaW5rID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUuY2hhckF0KDUpID09PSAnOicgJiYgbmFtZS5zbGljZSgwLCA1KSA9PT0gJ3hsaW5rJ1xufTtcblxudmFyIGdldFhsaW5rUHJvcCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBpc1hsaW5rKG5hbWUpID8gbmFtZS5zbGljZSg2LCBuYW1lLmxlbmd0aCkgOiAnJ1xufTtcblxudmFyIGlzRmFsc3lBdHRyVmFsdWUgPSBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiB2YWwgPT0gbnVsbCB8fCB2YWwgPT09IGZhbHNlXG59O1xuXG4vKiAgKi9cblxuZnVuY3Rpb24gZ2VuQ2xhc3NGb3JWbm9kZSAodm5vZGUpIHtcbiAgdmFyIGRhdGEgPSB2bm9kZS5kYXRhO1xuICB2YXIgcGFyZW50Tm9kZSA9IHZub2RlO1xuICB2YXIgY2hpbGROb2RlID0gdm5vZGU7XG4gIHdoaWxlIChjaGlsZE5vZGUuY29tcG9uZW50SW5zdGFuY2UpIHtcbiAgICBjaGlsZE5vZGUgPSBjaGlsZE5vZGUuY29tcG9uZW50SW5zdGFuY2UuX3Zub2RlO1xuICAgIGlmIChjaGlsZE5vZGUuZGF0YSkge1xuICAgICAgZGF0YSA9IG1lcmdlQ2xhc3NEYXRhKGNoaWxkTm9kZS5kYXRhLCBkYXRhKTtcbiAgICB9XG4gIH1cbiAgd2hpbGUgKChwYXJlbnROb2RlID0gcGFyZW50Tm9kZS5wYXJlbnQpKSB7XG4gICAgaWYgKHBhcmVudE5vZGUuZGF0YSkge1xuICAgICAgZGF0YSA9IG1lcmdlQ2xhc3NEYXRhKGRhdGEsIHBhcmVudE5vZGUuZGF0YSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBnZW5DbGFzc0Zyb21EYXRhKGRhdGEpXG59XG5cbmZ1bmN0aW9uIG1lcmdlQ2xhc3NEYXRhIChjaGlsZCwgcGFyZW50KSB7XG4gIHJldHVybiB7XG4gICAgc3RhdGljQ2xhc3M6IGNvbmNhdChjaGlsZC5zdGF0aWNDbGFzcywgcGFyZW50LnN0YXRpY0NsYXNzKSxcbiAgICBjbGFzczogY2hpbGQuY2xhc3NcbiAgICAgID8gW2NoaWxkLmNsYXNzLCBwYXJlbnQuY2xhc3NdXG4gICAgICA6IHBhcmVudC5jbGFzc1xuICB9XG59XG5cbmZ1bmN0aW9uIGdlbkNsYXNzRnJvbURhdGEgKGRhdGEpIHtcbiAgdmFyIGR5bmFtaWNDbGFzcyA9IGRhdGEuY2xhc3M7XG4gIHZhciBzdGF0aWNDbGFzcyA9IGRhdGEuc3RhdGljQ2xhc3M7XG4gIGlmIChzdGF0aWNDbGFzcyB8fCBkeW5hbWljQ2xhc3MpIHtcbiAgICByZXR1cm4gY29uY2F0KHN0YXRpY0NsYXNzLCBzdHJpbmdpZnlDbGFzcyhkeW5hbWljQ2xhc3MpKVxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHJldHVybiAnJ1xufVxuXG5mdW5jdGlvbiBjb25jYXQgKGEsIGIpIHtcbiAgcmV0dXJuIGEgPyBiID8gKGEgKyAnICcgKyBiKSA6IGEgOiAoYiB8fCAnJylcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5Q2xhc3MgKHZhbHVlKSB7XG4gIHZhciByZXMgPSAnJztcbiAgaWYgKCF2YWx1ZSkge1xuICAgIHJldHVybiByZXNcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgIHZhciBzdHJpbmdpZmllZDtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKHZhbHVlW2ldKSB7XG4gICAgICAgIGlmICgoc3RyaW5naWZpZWQgPSBzdHJpbmdpZnlDbGFzcyh2YWx1ZVtpXSkpKSB7XG4gICAgICAgICAgcmVzICs9IHN0cmluZ2lmaWVkICsgJyAnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXMuc2xpY2UoMCwgLTEpXG4gIH1cbiAgaWYgKGlzT2JqZWN0KHZhbHVlKSkge1xuICAgIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgICAgaWYgKHZhbHVlW2tleV0pIHsgcmVzICs9IGtleSArICcgJzsgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzLnNsaWNlKDAsIC0xKVxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHJldHVybiByZXNcbn1cblxuLyogICovXG5cbnZhciBuYW1lc3BhY2VNYXAgPSB7XG4gIHN2ZzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyxcbiAgbWF0aDogJ2h0dHA6Ly93d3cudzMub3JnLzE5OTgvTWF0aC9NYXRoTUwnXG59O1xuXG52YXIgaXNIVE1MVGFnID0gbWFrZU1hcChcbiAgJ2h0bWwsYm9keSxiYXNlLGhlYWQsbGluayxtZXRhLHN0eWxlLHRpdGxlLCcgK1xuICAnYWRkcmVzcyxhcnRpY2xlLGFzaWRlLGZvb3RlcixoZWFkZXIsaDEsaDIsaDMsaDQsaDUsaDYsaGdyb3VwLG5hdixzZWN0aW9uLCcgK1xuICAnZGl2LGRkLGRsLGR0LGZpZ2NhcHRpb24sZmlndXJlLGhyLGltZyxsaSxtYWluLG9sLHAscHJlLHVsLCcgK1xuICAnYSxiLGFiYnIsYmRpLGJkbyxicixjaXRlLGNvZGUsZGF0YSxkZm4sZW0saSxrYmQsbWFyayxxLHJwLHJ0LHJ0YyxydWJ5LCcgK1xuICAncyxzYW1wLHNtYWxsLHNwYW4sc3Ryb25nLHN1YixzdXAsdGltZSx1LHZhcix3YnIsYXJlYSxhdWRpbyxtYXAsdHJhY2ssdmlkZW8sJyArXG4gICdlbWJlZCxvYmplY3QscGFyYW0sc291cmNlLGNhbnZhcyxzY3JpcHQsbm9zY3JpcHQsZGVsLGlucywnICtcbiAgJ2NhcHRpb24sY29sLGNvbGdyb3VwLHRhYmxlLHRoZWFkLHRib2R5LHRkLHRoLHRyLCcgK1xuICAnYnV0dG9uLGRhdGFsaXN0LGZpZWxkc2V0LGZvcm0saW5wdXQsbGFiZWwsbGVnZW5kLG1ldGVyLG9wdGdyb3VwLG9wdGlvbiwnICtcbiAgJ291dHB1dCxwcm9ncmVzcyxzZWxlY3QsdGV4dGFyZWEsJyArXG4gICdkZXRhaWxzLGRpYWxvZyxtZW51LG1lbnVpdGVtLHN1bW1hcnksJyArXG4gICdjb250ZW50LGVsZW1lbnQsc2hhZG93LHRlbXBsYXRlJ1xuKTtcblxuLy8gdGhpcyBtYXAgaXMgaW50ZW50aW9uYWxseSBzZWxlY3RpdmUsIG9ubHkgY292ZXJpbmcgU1ZHIGVsZW1lbnRzIHRoYXQgbWF5XG4vLyBjb250YWluIGNoaWxkIGVsZW1lbnRzLlxudmFyIGlzU1ZHID0gbWFrZU1hcChcbiAgJ3N2ZyxhbmltYXRlLGNpcmNsZSxjbGlwcGF0aCxjdXJzb3IsZGVmcyxkZXNjLGVsbGlwc2UsZmlsdGVyLCcgK1xuICAnZm9udC1mYWNlLGcsZ2x5cGgsaW1hZ2UsbGluZSxtYXJrZXIsbWFzayxtaXNzaW5nLWdseXBoLHBhdGgscGF0dGVybiwnICtcbiAgJ3BvbHlnb24scG9seWxpbmUscmVjdCxzd2l0Y2gsc3ltYm9sLHRleHQsdGV4dHBhdGgsdHNwYW4sdXNlLHZpZXcnLFxuICB0cnVlXG4pO1xuXG5cblxudmFyIGlzUmVzZXJ2ZWRUYWcgPSBmdW5jdGlvbiAodGFnKSB7XG4gIHJldHVybiBpc0hUTUxUYWcodGFnKSB8fCBpc1NWRyh0YWcpXG59O1xuXG5mdW5jdGlvbiBnZXRUYWdOYW1lc3BhY2UgKHRhZykge1xuICBpZiAoaXNTVkcodGFnKSkge1xuICAgIHJldHVybiAnc3ZnJ1xuICB9XG4gIC8vIGJhc2ljIHN1cHBvcnQgZm9yIE1hdGhNTFxuICAvLyBub3RlIGl0IGRvZXNuJ3Qgc3VwcG9ydCBvdGhlciBNYXRoTUwgZWxlbWVudHMgYmVpbmcgY29tcG9uZW50IHJvb3RzXG4gIGlmICh0YWcgPT09ICdtYXRoJykge1xuICAgIHJldHVybiAnbWF0aCdcbiAgfVxufVxuXG52YXIgdW5rbm93bkVsZW1lbnRDYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5mdW5jdGlvbiBpc1Vua25vd25FbGVtZW50ICh0YWcpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICghaW5Ccm93c2VyKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBpZiAoaXNSZXNlcnZlZFRhZyh0YWcpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgdGFnID0gdGFnLnRvTG93ZXJDYXNlKCk7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAodW5rbm93bkVsZW1lbnRDYWNoZVt0YWddICE9IG51bGwpIHtcbiAgICByZXR1cm4gdW5rbm93bkVsZW1lbnRDYWNoZVt0YWddXG4gIH1cbiAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpO1xuICBpZiAodGFnLmluZGV4T2YoJy0nKSA+IC0xKSB7XG4gICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjgyMTAzNjQvMTA3MDI0NFxuICAgIHJldHVybiAodW5rbm93bkVsZW1lbnRDYWNoZVt0YWddID0gKFxuICAgICAgZWwuY29uc3RydWN0b3IgPT09IHdpbmRvdy5IVE1MVW5rbm93bkVsZW1lbnQgfHxcbiAgICAgIGVsLmNvbnN0cnVjdG9yID09PSB3aW5kb3cuSFRNTEVsZW1lbnRcbiAgICApKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiAodW5rbm93bkVsZW1lbnRDYWNoZVt0YWddID0gL0hUTUxVbmtub3duRWxlbWVudC8udGVzdChlbC50b1N0cmluZygpKSlcbiAgfVxufVxuXG4vKiAgKi9cblxuLyoqXG4gKiBRdWVyeSBhbiBlbGVtZW50IHNlbGVjdG9yIGlmIGl0J3Mgbm90IGFuIGVsZW1lbnQgYWxyZWFkeS5cbiAqL1xuZnVuY3Rpb24gcXVlcnkgKGVsKSB7XG4gIGlmICh0eXBlb2YgZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIHNlbGVjdG9yID0gZWw7XG4gICAgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsKTtcbiAgICBpZiAoIWVsKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oXG4gICAgICAgICdDYW5ub3QgZmluZCBlbGVtZW50OiAnICsgc2VsZWN0b3JcbiAgICAgICk7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGVsXG59XG5cbi8qICAqL1xuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50JDEgKHRhZ05hbWUsIHZub2RlKSB7XG4gIHZhciBlbG0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICBpZiAodGFnTmFtZSAhPT0gJ3NlbGVjdCcpIHtcbiAgICByZXR1cm4gZWxtXG4gIH1cbiAgaWYgKHZub2RlLmRhdGEgJiYgdm5vZGUuZGF0YS5hdHRycyAmJiAnbXVsdGlwbGUnIGluIHZub2RlLmRhdGEuYXR0cnMpIHtcbiAgICBlbG0uc2V0QXR0cmlidXRlKCdtdWx0aXBsZScsICdtdWx0aXBsZScpO1xuICB9XG4gIHJldHVybiBlbG1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TIChuYW1lc3BhY2UsIHRhZ05hbWUpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VNYXBbbmFtZXNwYWNlXSwgdGFnTmFtZSlcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGV4dE5vZGUgKHRleHQpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbW1lbnQgKHRleHQpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQodGV4dClcbn1cblxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlIChwYXJlbnROb2RlLCBuZXdOb2RlLCByZWZlcmVuY2VOb2RlKSB7XG4gIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVDaGlsZCAobm9kZSwgY2hpbGQpIHtcbiAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkIChub2RlLCBjaGlsZCkge1xuICBub2RlLmFwcGVuZENoaWxkKGNoaWxkKTtcbn1cblxuZnVuY3Rpb24gcGFyZW50Tm9kZSAobm9kZSkge1xuICByZXR1cm4gbm9kZS5wYXJlbnROb2RlXG59XG5cbmZ1bmN0aW9uIG5leHRTaWJsaW5nIChub2RlKSB7XG4gIHJldHVybiBub2RlLm5leHRTaWJsaW5nXG59XG5cbmZ1bmN0aW9uIHRhZ05hbWUgKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUudGFnTmFtZVxufVxuXG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudCAobm9kZSwgdGV4dCkge1xuICBub2RlLnRleHRDb250ZW50ID0gdGV4dDtcbn1cblxuZnVuY3Rpb24gc2V0QXR0cmlidXRlIChub2RlLCBrZXksIHZhbCkge1xuICBub2RlLnNldEF0dHJpYnV0ZShrZXksIHZhbCk7XG59XG5cblxudmFyIG5vZGVPcHMgPSBPYmplY3QuZnJlZXplKHtcblx0Y3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCQxLFxuXHRjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcblx0Y3JlYXRlVGV4dE5vZGU6IGNyZWF0ZVRleHROb2RlLFxuXHRjcmVhdGVDb21tZW50OiBjcmVhdGVDb21tZW50LFxuXHRpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcblx0cmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuXHRhcHBlbmRDaGlsZDogYXBwZW5kQ2hpbGQsXG5cdHBhcmVudE5vZGU6IHBhcmVudE5vZGUsXG5cdG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcblx0dGFnTmFtZTogdGFnTmFtZSxcblx0c2V0VGV4dENvbnRlbnQ6IHNldFRleHRDb250ZW50LFxuXHRzZXRBdHRyaWJ1dGU6IHNldEF0dHJpYnV0ZVxufSk7XG5cbi8qICAqL1xuXG52YXIgcmVmID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSAoXywgdm5vZGUpIHtcbiAgICByZWdpc3RlclJlZih2bm9kZSk7XG4gIH0sXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlIChvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICBpZiAob2xkVm5vZGUuZGF0YS5yZWYgIT09IHZub2RlLmRhdGEucmVmKSB7XG4gICAgICByZWdpc3RlclJlZihvbGRWbm9kZSwgdHJ1ZSk7XG4gICAgICByZWdpc3RlclJlZih2bm9kZSk7XG4gICAgfVxuICB9LFxuICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95ICh2bm9kZSkge1xuICAgIHJlZ2lzdGVyUmVmKHZub2RlLCB0cnVlKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gcmVnaXN0ZXJSZWYgKHZub2RlLCBpc1JlbW92YWwpIHtcbiAgdmFyIGtleSA9IHZub2RlLmRhdGEucmVmO1xuICBpZiAoIWtleSkgeyByZXR1cm4gfVxuXG4gIHZhciB2bSA9IHZub2RlLmNvbnRleHQ7XG4gIHZhciByZWYgPSB2bm9kZS5jb21wb25lbnRJbnN0YW5jZSB8fCB2bm9kZS5lbG07XG4gIHZhciByZWZzID0gdm0uJHJlZnM7XG4gIGlmIChpc1JlbW92YWwpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZWZzW2tleV0pKSB7XG4gICAgICByZW1vdmUkMShyZWZzW2tleV0sIHJlZik7XG4gICAgfSBlbHNlIGlmIChyZWZzW2tleV0gPT09IHJlZikge1xuICAgICAgcmVmc1trZXldID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAodm5vZGUuZGF0YS5yZWZJbkZvcikge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVmc1trZXldKSAmJiByZWZzW2tleV0uaW5kZXhPZihyZWYpIDwgMCkge1xuICAgICAgICByZWZzW2tleV0ucHVzaChyZWYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVmc1trZXldID0gW3JlZl07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZnNba2V5XSA9IHJlZjtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBWaXJ0dWFsIERPTSBwYXRjaGluZyBhbGdvcml0aG0gYmFzZWQgb24gU25hYmJkb20gYnlcbiAqIFNpbW9uIEZyaWlzIFZpbmR1bSAoQHBhbGRlcGluZClcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuICogaHR0cHM6Ly9naXRodWIuY29tL3BhbGRlcGluZC9zbmFiYmRvbS9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKlxuICogbW9kaWZpZWQgYnkgRXZhbiBZb3UgKEB5eXg5OTA4MDMpXG4gKlxuXG4vKlxuICogTm90IHR5cGUtY2hlY2tpbmcgdGhpcyBiZWNhdXNlIHRoaXMgZmlsZSBpcyBwZXJmLWNyaXRpY2FsIGFuZCB0aGUgY29zdFxuICogb2YgbWFraW5nIGZsb3cgdW5kZXJzdGFuZCBpdCBpcyBub3Qgd29ydGggaXQuXG4gKi9cblxudmFyIGVtcHR5Tm9kZSA9IG5ldyBWTm9kZSgnJywge30sIFtdKTtcblxudmFyIGhvb2tzJDEgPSBbJ2NyZWF0ZScsICdhY3RpdmF0ZScsICd1cGRhdGUnLCAncmVtb3ZlJywgJ2Rlc3Ryb3knXTtcblxuZnVuY3Rpb24gaXNVbmRlZiAocykge1xuICByZXR1cm4gcyA9PSBudWxsXG59XG5cbmZ1bmN0aW9uIGlzRGVmIChzKSB7XG4gIHJldHVybiBzICE9IG51bGxcbn1cblxuZnVuY3Rpb24gc2FtZVZub2RlICh2bm9kZTEsIHZub2RlMikge1xuICByZXR1cm4gKFxuICAgIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiZcbiAgICB2bm9kZTEudGFnID09PSB2bm9kZTIudGFnICYmXG4gICAgdm5vZGUxLmlzQ29tbWVudCA9PT0gdm5vZGUyLmlzQ29tbWVudCAmJlxuICAgICF2bm9kZTEuZGF0YSA9PT0gIXZub2RlMi5kYXRhXG4gIClcbn1cblxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHggKGNoaWxkcmVuLCBiZWdpbklkeCwgZW5kSWR4KSB7XG4gIHZhciBpLCBrZXk7XG4gIHZhciBtYXAgPSB7fTtcbiAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICBrZXkgPSBjaGlsZHJlbltpXS5rZXk7XG4gICAgaWYgKGlzRGVmKGtleSkpIHsgbWFwW2tleV0gPSBpOyB9XG4gIH1cbiAgcmV0dXJuIG1hcFxufVxuXG5mdW5jdGlvbiBjcmVhdGVQYXRjaEZ1bmN0aW9uIChiYWNrZW5kKSB7XG4gIHZhciBpLCBqO1xuICB2YXIgY2JzID0ge307XG5cbiAgdmFyIG1vZHVsZXMgPSBiYWNrZW5kLm1vZHVsZXM7XG4gIHZhciBub2RlT3BzID0gYmFja2VuZC5ub2RlT3BzO1xuXG4gIGZvciAoaSA9IDA7IGkgPCBob29rcyQxLmxlbmd0aDsgKytpKSB7XG4gICAgY2JzW2hvb2tzJDFbaV1dID0gW107XG4gICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgIGlmIChtb2R1bGVzW2pdW2hvb2tzJDFbaV1dICE9PSB1bmRlZmluZWQpIHsgY2JzW2hvb2tzJDFbaV1dLnB1c2gobW9kdWxlc1tqXVtob29rcyQxW2ldXSk7IH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbXB0eU5vZGVBdCAoZWxtKSB7XG4gICAgcmV0dXJuIG5ldyBWTm9kZShub2RlT3BzLnRhZ05hbWUoZWxtKS50b0xvd2VyQ2FzZSgpLCB7fSwgW10sIHVuZGVmaW5lZCwgZWxtKVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlUm1DYiAoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgIGZ1bmN0aW9uIHJlbW92ZSQkMSAoKSB7XG4gICAgICBpZiAoLS1yZW1vdmUkJDEubGlzdGVuZXJzID09PSAwKSB7XG4gICAgICAgIHJlbW92ZU5vZGUoY2hpbGRFbG0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZW1vdmUkJDEubGlzdGVuZXJzID0gbGlzdGVuZXJzO1xuICAgIHJldHVybiByZW1vdmUkJDFcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZU5vZGUgKGVsKSB7XG4gICAgdmFyIHBhcmVudCA9IG5vZGVPcHMucGFyZW50Tm9kZShlbCk7XG4gICAgLy8gZWxlbWVudCBtYXkgaGF2ZSBhbHJlYWR5IGJlZW4gcmVtb3ZlZCBkdWUgdG8gdi1odG1sIC8gdi10ZXh0XG4gICAgaWYgKHBhcmVudCkge1xuICAgICAgbm9kZU9wcy5yZW1vdmVDaGlsZChwYXJlbnQsIGVsKTtcbiAgICB9XG4gIH1cblxuICB2YXIgaW5QcmUgPSAwO1xuICBmdW5jdGlvbiBjcmVhdGVFbG0gKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHBhcmVudEVsbSwgcmVmRWxtLCBuZXN0ZWQpIHtcbiAgICB2bm9kZS5pc1Jvb3RJbnNlcnQgPSAhbmVzdGVkOyAvLyBmb3IgdHJhbnNpdGlvbiBlbnRlciBjaGVja1xuICAgIGlmIChjcmVhdGVDb21wb25lbnQodm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgcGFyZW50RWxtLCByZWZFbG0pKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdmFyIHRhZyA9IHZub2RlLnRhZztcbiAgICBpZiAoaXNEZWYodGFnKSkge1xuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5wcmUpIHtcbiAgICAgICAgICBpblByZSsrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhaW5QcmUgJiZcbiAgICAgICAgICAhdm5vZGUubnMgJiZcbiAgICAgICAgICAhKGNvbmZpZy5pZ25vcmVkRWxlbWVudHMubGVuZ3RoICYmIGNvbmZpZy5pZ25vcmVkRWxlbWVudHMuaW5kZXhPZih0YWcpID4gLTEpICYmXG4gICAgICAgICAgY29uZmlnLmlzVW5rbm93bkVsZW1lbnQodGFnKVxuICAgICAgICApIHtcbiAgICAgICAgICB3YXJuKFxuICAgICAgICAgICAgJ1Vua25vd24gY3VzdG9tIGVsZW1lbnQ6IDwnICsgdGFnICsgJz4gLSBkaWQgeW91ICcgK1xuICAgICAgICAgICAgJ3JlZ2lzdGVyIHRoZSBjb21wb25lbnQgY29ycmVjdGx5PyBGb3IgcmVjdXJzaXZlIGNvbXBvbmVudHMsICcgK1xuICAgICAgICAgICAgJ21ha2Ugc3VyZSB0byBwcm92aWRlIHRoZSBcIm5hbWVcIiBvcHRpb24uJyxcbiAgICAgICAgICAgIHZub2RlLmNvbnRleHRcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2bm9kZS5lbG0gPSB2bm9kZS5uc1xuICAgICAgICA/IG5vZGVPcHMuY3JlYXRlRWxlbWVudE5TKHZub2RlLm5zLCB0YWcpXG4gICAgICAgIDogbm9kZU9wcy5jcmVhdGVFbGVtZW50KHRhZywgdm5vZGUpO1xuICAgICAgc2V0U2NvcGUodm5vZGUpO1xuXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIHtcbiAgICAgICAgY3JlYXRlQ2hpbGRyZW4odm5vZGUsIGNoaWxkcmVuLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgICAgICBpbnZva2VDcmVhdGVIb29rcyh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgfVxuICAgICAgICBpbnNlcnQocGFyZW50RWxtLCB2bm9kZS5lbG0sIHJlZkVsbSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIGRhdGEgJiYgZGF0YS5wcmUpIHtcbiAgICAgICAgaW5QcmUtLTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHZub2RlLmlzQ29tbWVudCkge1xuICAgICAgdm5vZGUuZWxtID0gbm9kZU9wcy5jcmVhdGVDb21tZW50KHZub2RlLnRleHQpO1xuICAgICAgaW5zZXJ0KHBhcmVudEVsbSwgdm5vZGUuZWxtLCByZWZFbG0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2bm9kZS5lbG0gPSBub2RlT3BzLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpO1xuICAgICAgaW5zZXJ0KHBhcmVudEVsbSwgdm5vZGUuZWxtLCByZWZFbG0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudCAodm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgcGFyZW50RWxtLCByZWZFbG0pIHtcbiAgICB2YXIgaSA9IHZub2RlLmRhdGE7XG4gICAgaWYgKGlzRGVmKGkpKSB7XG4gICAgICB2YXIgaXNSZWFjdGl2YXRlZCA9IGlzRGVmKHZub2RlLmNvbXBvbmVudEluc3RhbmNlKSAmJiBpLmtlZXBBbGl2ZTtcbiAgICAgIGlmIChpc0RlZihpID0gaS5ob29rKSAmJiBpc0RlZihpID0gaS5pbml0KSkge1xuICAgICAgICBpKHZub2RlLCBmYWxzZSAvKiBoeWRyYXRpbmcgKi8sIHBhcmVudEVsbSwgcmVmRWxtKTtcbiAgICAgIH1cbiAgICAgIC8vIGFmdGVyIGNhbGxpbmcgdGhlIGluaXQgaG9vaywgaWYgdGhlIHZub2RlIGlzIGEgY2hpbGQgY29tcG9uZW50XG4gICAgICAvLyBpdCBzaG91bGQndmUgY3JlYXRlZCBhIGNoaWxkIGluc3RhbmNlIGFuZCBtb3VudGVkIGl0LiB0aGUgY2hpbGRcbiAgICAgIC8vIGNvbXBvbmVudCBhbHNvIGhhcyBzZXQgdGhlIHBsYWNlaG9sZGVyIHZub2RlJ3MgZWxtLlxuICAgICAgLy8gaW4gdGhhdCBjYXNlIHdlIGNhbiBqdXN0IHJldHVybiB0aGUgZWxlbWVudCBhbmQgYmUgZG9uZS5cbiAgICAgIGlmIChpc0RlZih2bm9kZS5jb21wb25lbnRJbnN0YW5jZSkpIHtcbiAgICAgICAgaW5pdENvbXBvbmVudCh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgaWYgKGlzUmVhY3RpdmF0ZWQpIHtcbiAgICAgICAgICByZWFjdGl2YXRlQ29tcG9uZW50KHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHBhcmVudEVsbSwgcmVmRWxtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb21wb25lbnQgKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICBpZiAodm5vZGUuZGF0YS5wZW5kaW5nSW5zZXJ0KSB7XG4gICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaC5hcHBseShpbnNlcnRlZFZub2RlUXVldWUsIHZub2RlLmRhdGEucGVuZGluZ0luc2VydCk7XG4gICAgfVxuICAgIHZub2RlLmVsbSA9IHZub2RlLmNvbXBvbmVudEluc3RhbmNlLiRlbDtcbiAgICBpZiAoaXNQYXRjaGFibGUodm5vZGUpKSB7XG4gICAgICBpbnZva2VDcmVhdGVIb29rcyh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIHNldFNjb3BlKHZub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZW1wdHkgY29tcG9uZW50IHJvb3QuXG4gICAgICAvLyBza2lwIGFsbCBlbGVtZW50LXJlbGF0ZWQgbW9kdWxlcyBleGNlcHQgZm9yIHJlZiAoIzM0NTUpXG4gICAgICByZWdpc3RlclJlZih2bm9kZSk7XG4gICAgICAvLyBtYWtlIHN1cmUgdG8gaW52b2tlIHRoZSBpbnNlcnQgaG9va1xuICAgICAgaW5zZXJ0ZWRWbm9kZVF1ZXVlLnB1c2godm5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWN0aXZhdGVDb21wb25lbnQgKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUsIHBhcmVudEVsbSwgcmVmRWxtKSB7XG4gICAgdmFyIGk7XG4gICAgLy8gaGFjayBmb3IgIzQzMzk6IGEgcmVhY3RpdmF0ZWQgY29tcG9uZW50IHdpdGggaW5uZXIgdHJhbnNpdGlvblxuICAgIC8vIGRvZXMgbm90IHRyaWdnZXIgYmVjYXVzZSB0aGUgaW5uZXIgbm9kZSdzIGNyZWF0ZWQgaG9va3MgYXJlIG5vdCBjYWxsZWRcbiAgICAvLyBhZ2Fpbi4gSXQncyBub3QgaWRlYWwgdG8gaW52b2x2ZSBtb2R1bGUtc3BlY2lmaWMgbG9naWMgaW4gaGVyZSBidXRcbiAgICAvLyB0aGVyZSBkb2Vzbid0IHNlZW0gdG8gYmUgYSBiZXR0ZXIgd2F5IHRvIGRvIGl0LlxuICAgIHZhciBpbm5lck5vZGUgPSB2bm9kZTtcbiAgICB3aGlsZSAoaW5uZXJOb2RlLmNvbXBvbmVudEluc3RhbmNlKSB7XG4gICAgICBpbm5lck5vZGUgPSBpbm5lck5vZGUuY29tcG9uZW50SW5zdGFuY2UuX3Zub2RlO1xuICAgICAgaWYgKGlzRGVmKGkgPSBpbm5lck5vZGUuZGF0YSkgJiYgaXNEZWYoaSA9IGkudHJhbnNpdGlvbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5hY3RpdmF0ZS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGNicy5hY3RpdmF0ZVtpXShlbXB0eU5vZGUsIGlubmVyTm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaW5zZXJ0ZWRWbm9kZVF1ZXVlLnB1c2goaW5uZXJOb2RlKTtcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gdW5saWtlIGEgbmV3bHkgY3JlYXRlZCBjb21wb25lbnQsXG4gICAgLy8gYSByZWFjdGl2YXRlZCBrZWVwLWFsaXZlIGNvbXBvbmVudCBkb2Vzbid0IGluc2VydCBpdHNlbGZcbiAgICBpbnNlcnQocGFyZW50RWxtLCB2bm9kZS5lbG0sIHJlZkVsbSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnNlcnQgKHBhcmVudCwgZWxtLCByZWYpIHtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBpZiAocmVmKSB7XG4gICAgICAgIG5vZGVPcHMuaW5zZXJ0QmVmb3JlKHBhcmVudCwgZWxtLCByZWYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZU9wcy5hcHBlbmRDaGlsZChwYXJlbnQsIGVsbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlQ2hpbGRyZW4gKHZub2RlLCBjaGlsZHJlbiwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNyZWF0ZUVsbShjaGlsZHJlbltpXSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCB2bm9kZS5lbG0sIG51bGwsIHRydWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNQcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgIG5vZGVPcHMuYXBwZW5kQ2hpbGQodm5vZGUuZWxtLCBub2RlT3BzLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc1BhdGNoYWJsZSAodm5vZGUpIHtcbiAgICB3aGlsZSAodm5vZGUuY29tcG9uZW50SW5zdGFuY2UpIHtcbiAgICAgIHZub2RlID0gdm5vZGUuY29tcG9uZW50SW5zdGFuY2UuX3Zub2RlO1xuICAgIH1cbiAgICByZXR1cm4gaXNEZWYodm5vZGUudGFnKVxuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlQ3JlYXRlSG9va3MgKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpJDEpIHtcbiAgICAgIGNicy5jcmVhdGVbaSQxXShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICB9XG4gICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICBpZiAoaXNEZWYoaSkpIHtcbiAgICAgIGlmIChpLmNyZWF0ZSkgeyBpLmNyZWF0ZShlbXB0eU5vZGUsIHZub2RlKTsgfVxuICAgICAgaWYgKGkuaW5zZXJ0KSB7IGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTsgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHNldCBzY29wZSBpZCBhdHRyaWJ1dGUgZm9yIHNjb3BlZCBDU1MuXG4gIC8vIHRoaXMgaXMgaW1wbGVtZW50ZWQgYXMgYSBzcGVjaWFsIGNhc2UgdG8gYXZvaWQgdGhlIG92ZXJoZWFkXG4gIC8vIG9mIGdvaW5nIHRocm91Z2ggdGhlIG5vcm1hbCBhdHRyaWJ1dGUgcGF0Y2hpbmcgcHJvY2Vzcy5cbiAgZnVuY3Rpb24gc2V0U2NvcGUgKHZub2RlKSB7XG4gICAgdmFyIGk7XG4gICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5jb250ZXh0KSAmJiBpc0RlZihpID0gaS4kb3B0aW9ucy5fc2NvcGVJZCkpIHtcbiAgICAgIG5vZGVPcHMuc2V0QXR0cmlidXRlKHZub2RlLmVsbSwgaSwgJycpO1xuICAgIH1cbiAgICBpZiAoaXNEZWYoaSA9IGFjdGl2ZUluc3RhbmNlKSAmJlxuICAgICAgICBpICE9PSB2bm9kZS5jb250ZXh0ICYmXG4gICAgICAgIGlzRGVmKGkgPSBpLiRvcHRpb25zLl9zY29wZUlkKSkge1xuICAgICAgbm9kZU9wcy5zZXRBdHRyaWJ1dGUodm5vZGUuZWxtLCBpLCAnJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYWRkVm5vZGVzIChwYXJlbnRFbG0sIHJlZkVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICBjcmVhdGVFbG0odm5vZGVzW3N0YXJ0SWR4XSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBwYXJlbnRFbG0sIHJlZkVsbSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRGVzdHJveUhvb2sgKHZub2RlKSB7XG4gICAgdmFyIGksIGo7XG4gICAgdmFyIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIGlmIChpc0RlZihkYXRhKSkge1xuICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKSB7IGkodm5vZGUpOyB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpIHsgY2JzLmRlc3Ryb3lbaV0odm5vZGUpOyB9XG4gICAgfVxuICAgIGlmIChpc0RlZihpID0gdm5vZGUuY2hpbGRyZW4pKSB7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgaW52b2tlRGVzdHJveUhvb2sodm5vZGUuY2hpbGRyZW5bal0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVZub2RlcyAocGFyZW50RWxtLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgpIHtcbiAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAoaXNEZWYoY2gudGFnKSkge1xuICAgICAgICAgIHJlbW92ZUFuZEludm9rZVJlbW92ZUhvb2soY2gpO1xuICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKGNoKTtcbiAgICAgICAgfSBlbHNlIHsgLy8gVGV4dCBub2RlXG4gICAgICAgICAgcmVtb3ZlTm9kZShjaC5lbG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQW5kSW52b2tlUmVtb3ZlSG9vayAodm5vZGUsIHJtKSB7XG4gICAgaWYgKHJtIHx8IGlzRGVmKHZub2RlLmRhdGEpKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gY2JzLnJlbW92ZS5sZW5ndGggKyAxO1xuICAgICAgaWYgKCFybSkge1xuICAgICAgICAvLyBkaXJlY3RseSByZW1vdmluZ1xuICAgICAgICBybSA9IGNyZWF0ZVJtQ2Iodm5vZGUuZWxtLCBsaXN0ZW5lcnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gd2UgaGF2ZSBhIHJlY3Vyc2l2ZWx5IHBhc3NlZCBkb3duIHJtIGNhbGxiYWNrXG4gICAgICAgIC8vIGluY3JlYXNlIHRoZSBsaXN0ZW5lcnMgY291bnRcbiAgICAgICAgcm0ubGlzdGVuZXJzICs9IGxpc3RlbmVycztcbiAgICAgIH1cbiAgICAgIC8vIHJlY3Vyc2l2ZWx5IGludm9rZSBob29rcyBvbiBjaGlsZCBjb21wb25lbnQgcm9vdCBub2RlXG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmNvbXBvbmVudEluc3RhbmNlKSAmJiBpc0RlZihpID0gaS5fdm5vZGUpICYmIGlzRGVmKGkuZGF0YSkpIHtcbiAgICAgICAgcmVtb3ZlQW5kSW52b2tlUmVtb3ZlSG9vayhpLCBybSk7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnMucmVtb3ZlW2ldKHZub2RlLCBybSk7XG4gICAgICB9XG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkucmVtb3ZlKSkge1xuICAgICAgICBpKHZub2RlLCBybSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBybSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZW1vdmVOb2RlKHZub2RlLmVsbSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4gKHBhcmVudEVsbSwgb2xkQ2gsIG5ld0NoLCBpbnNlcnRlZFZub2RlUXVldWUsIHJlbW92ZU9ubHkpIHtcbiAgICB2YXIgb2xkU3RhcnRJZHggPSAwO1xuICAgIHZhciBuZXdTdGFydElkeCA9IDA7XG4gICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFswXTtcbiAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgIHZhciBuZXdTdGFydFZub2RlID0gbmV3Q2hbMF07XG4gICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICB2YXIgb2xkS2V5VG9JZHgsIGlkeEluT2xkLCBlbG1Ub01vdmUsIHJlZkVsbTtcblxuICAgIC8vIHJlbW92ZU9ubHkgaXMgYSBzcGVjaWFsIGZsYWcgdXNlZCBvbmx5IGJ5IDx0cmFuc2l0aW9uLWdyb3VwPlxuICAgIC8vIHRvIGVuc3VyZSByZW1vdmVkIGVsZW1lbnRzIHN0YXkgaW4gY29ycmVjdCByZWxhdGl2ZSBwb3NpdGlvbnNcbiAgICAvLyBkdXJpbmcgbGVhdmluZyB0cmFuc2l0aW9uc1xuICAgIHZhciBjYW5Nb3ZlID0gIXJlbW92ZU9ubHk7XG5cbiAgICB3aGlsZSAob2xkU3RhcnRJZHggPD0gb2xkRW5kSWR4ICYmIG5ld1N0YXJ0SWR4IDw9IG5ld0VuZElkeCkge1xuICAgICAgaWYgKGlzVW5kZWYob2xkU3RhcnRWbm9kZSkpIHtcbiAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBoYXMgYmVlbiBtb3ZlZCBsZWZ0XG4gICAgICB9IGVsc2UgaWYgKGlzVW5kZWYob2xkRW5kVm5vZGUpKSB7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHtcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdFbmRWbm9kZSkpIHtcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICBuZXdFbmRWbm9kZSA9IG5ld0NoWy0tbmV3RW5kSWR4XTtcbiAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkgeyAvLyBWbm9kZSBtb3ZlZCByaWdodFxuICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBjYW5Nb3ZlICYmIG5vZGVPcHMuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkU3RhcnRWbm9kZS5lbG0sIG5vZGVPcHMubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgbGVmdFxuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBjYW5Nb3ZlICYmIG5vZGVPcHMuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNVbmRlZihvbGRLZXlUb0lkeCkpIHsgb2xkS2V5VG9JZHggPSBjcmVhdGVLZXlUb09sZElkeChvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7IH1cbiAgICAgICAgaWR4SW5PbGQgPSBpc0RlZihuZXdTdGFydFZub2RlLmtleSkgPyBvbGRLZXlUb0lkeFtuZXdTdGFydFZub2RlLmtleV0gOiBudWxsO1xuICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHsgLy8gTmV3IGVsZW1lbnRcbiAgICAgICAgICBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxtVG9Nb3ZlID0gb2xkQ2hbaWR4SW5PbGRdO1xuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmICFlbG1Ub01vdmUpIHtcbiAgICAgICAgICAgIHdhcm4oXG4gICAgICAgICAgICAgICdJdCBzZWVtcyB0aGVyZSBhcmUgZHVwbGljYXRlIGtleXMgdGhhdCBpcyBjYXVzaW5nIGFuIHVwZGF0ZSBlcnJvci4gJyArXG4gICAgICAgICAgICAgICdNYWtlIHN1cmUgZWFjaCB2LWZvciBpdGVtIGhhcyBhIHVuaXF1ZSBrZXkuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNhbWVWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICBwYXRjaFZub2RlKGVsbVRvTW92ZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIG9sZENoW2lkeEluT2xkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNhbk1vdmUgJiYgbm9kZU9wcy5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBuZXdTdGFydFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBzYW1lIGtleSBidXQgZGlmZmVyZW50IGVsZW1lbnQuIHRyZWF0IGFzIG5ldyBlbGVtZW50XG4gICAgICAgICAgICBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICByZWZFbG0gPSBpc1VuZGVmKG5ld0NoW25ld0VuZElkeCArIDFdKSA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCByZWZFbG0sIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgIH0gZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaFZub2RlIChvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSwgcmVtb3ZlT25seSkge1xuICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyByZXVzZSBlbGVtZW50IGZvciBzdGF0aWMgdHJlZXMuXG4gICAgLy8gbm90ZSB3ZSBvbmx5IGRvIHRoaXMgaWYgdGhlIHZub2RlIGlzIGNsb25lZCAtXG4gICAgLy8gaWYgdGhlIG5ldyBub2RlIGlzIG5vdCBjbG9uZWQgaXQgbWVhbnMgdGhlIHJlbmRlciBmdW5jdGlvbnMgaGF2ZSBiZWVuXG4gICAgLy8gcmVzZXQgYnkgdGhlIGhvdC1yZWxvYWQtYXBpIGFuZCB3ZSBuZWVkIHRvIGRvIGEgcHJvcGVyIHJlLXJlbmRlci5cbiAgICBpZiAodm5vZGUuaXNTdGF0aWMgJiZcbiAgICAgICAgb2xkVm5vZGUuaXNTdGF0aWMgJiZcbiAgICAgICAgdm5vZGUua2V5ID09PSBvbGRWbm9kZS5rZXkgJiZcbiAgICAgICAgKHZub2RlLmlzQ2xvbmVkIHx8IHZub2RlLmlzT25jZSkpIHtcbiAgICAgIHZub2RlLmVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgIHZub2RlLmNvbXBvbmVudEluc3RhbmNlID0gb2xkVm5vZGUuY29tcG9uZW50SW5zdGFuY2U7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdmFyIGk7XG4gICAgdmFyIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHZhciBoYXNEYXRhID0gaXNEZWYoZGF0YSk7XG4gICAgaWYgKGhhc0RhdGEgJiYgaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkucHJlcGF0Y2gpKSB7XG4gICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgdmFyIG9sZENoID0gb2xkVm5vZGUuY2hpbGRyZW47XG4gICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgaWYgKGhhc0RhdGEgJiYgaXNQYXRjaGFibGUodm5vZGUpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnVwZGF0ZS5sZW5ndGg7ICsraSkgeyBjYnMudXBkYXRlW2ldKG9sZFZub2RlLCB2bm9kZSk7IH1cbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKSB7IGkob2xkVm5vZGUsIHZub2RlKTsgfVxuICAgIH1cbiAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgaWYgKGlzRGVmKG9sZENoKSAmJiBpc0RlZihjaCkpIHtcbiAgICAgICAgaWYgKG9sZENoICE9PSBjaCkgeyB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCByZW1vdmVPbmx5KTsgfVxuICAgICAgfSBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7IG5vZGVPcHMuc2V0VGV4dENvbnRlbnQoZWxtLCAnJyk7IH1cbiAgICAgICAgYWRkVm5vZGVzKGVsbSwgbnVsbCwgY2gsIDAsIGNoLmxlbmd0aCAtIDEsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICByZW1vdmVWbm9kZXMoZWxtLCBvbGRDaCwgMCwgb2xkQ2gubGVuZ3RoIC0gMSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgIG5vZGVPcHMuc2V0VGV4dENvbnRlbnQoZWxtLCAnJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvbGRWbm9kZS50ZXh0ICE9PSB2bm9kZS50ZXh0KSB7XG4gICAgICBub2RlT3BzLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgfVxuICAgIGlmIChoYXNEYXRhKSB7XG4gICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkucG9zdHBhdGNoKSkgeyBpKG9sZFZub2RlLCB2bm9kZSk7IH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VJbnNlcnRIb29rICh2bm9kZSwgcXVldWUsIGluaXRpYWwpIHtcbiAgICAvLyBkZWxheSBpbnNlcnQgaG9va3MgZm9yIGNvbXBvbmVudCByb290IG5vZGVzLCBpbnZva2UgdGhlbSBhZnRlciB0aGVcbiAgICAvLyBlbGVtZW50IGlzIHJlYWxseSBpbnNlcnRlZFxuICAgIGlmIChpbml0aWFsICYmIHZub2RlLnBhcmVudCkge1xuICAgICAgdm5vZGUucGFyZW50LmRhdGEucGVuZGluZ0luc2VydCA9IHF1ZXVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHF1ZXVlW2ldLmRhdGEuaG9vay5pbnNlcnQocXVldWVbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBiYWlsZWQgPSBmYWxzZTtcbiAgLy8gbGlzdCBvZiBtb2R1bGVzIHRoYXQgY2FuIHNraXAgY3JlYXRlIGhvb2sgZHVyaW5nIGh5ZHJhdGlvbiBiZWNhdXNlIHRoZXlcbiAgLy8gYXJlIGFscmVhZHkgcmVuZGVyZWQgb24gdGhlIGNsaWVudCBvciBoYXMgbm8gbmVlZCBmb3IgaW5pdGlhbGl6YXRpb25cbiAgdmFyIGlzUmVuZGVyZWRNb2R1bGUgPSBtYWtlTWFwKCdhdHRycyxzdHlsZSxjbGFzcyxzdGF0aWNDbGFzcyxzdGF0aWNTdHlsZSxrZXknKTtcblxuICAvLyBOb3RlOiB0aGlzIGlzIGEgYnJvd3Nlci1vbmx5IGZ1bmN0aW9uIHNvIHdlIGNhbiBhc3N1bWUgZWxtcyBhcmUgRE9NIG5vZGVzLlxuICBmdW5jdGlvbiBoeWRyYXRlIChlbG0sIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgaWYgKCFhc3NlcnROb2RlTWF0Y2goZWxtLCB2bm9kZSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIHZub2RlLmVsbSA9IGVsbTtcbiAgICB2YXIgdGFnID0gdm5vZGUudGFnO1xuICAgIHZhciBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICB2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbjtcbiAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5pbml0KSkgeyBpKHZub2RlLCB0cnVlIC8qIGh5ZHJhdGluZyAqLyk7IH1cbiAgICAgIGlmIChpc0RlZihpID0gdm5vZGUuY29tcG9uZW50SW5zdGFuY2UpKSB7XG4gICAgICAgIC8vIGNoaWxkIGNvbXBvbmVudC4gaXQgc2hvdWxkIGhhdmUgaHlkcmF0ZWQgaXRzIG93biB0cmVlLlxuICAgICAgICBpbml0Q29tcG9uZW50KHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNEZWYodGFnKSkge1xuICAgICAgaWYgKGlzRGVmKGNoaWxkcmVuKSkge1xuICAgICAgICAvLyBlbXB0eSBlbGVtZW50LCBhbGxvdyBjbGllbnQgdG8gcGljayB1cCBhbmQgcG9wdWxhdGUgY2hpbGRyZW5cbiAgICAgICAgaWYgKCFlbG0uaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgICAgICAgY3JlYXRlQ2hpbGRyZW4odm5vZGUsIGNoaWxkcmVuLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBjaGlsZHJlbk1hdGNoID0gdHJ1ZTtcbiAgICAgICAgICB2YXIgY2hpbGROb2RlID0gZWxtLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgZm9yICh2YXIgaSQxID0gMDsgaSQxIDwgY2hpbGRyZW4ubGVuZ3RoOyBpJDErKykge1xuICAgICAgICAgICAgaWYgKCFjaGlsZE5vZGUgfHwgIWh5ZHJhdGUoY2hpbGROb2RlLCBjaGlsZHJlbltpJDFdLCBpbnNlcnRlZFZub2RlUXVldWUpKSB7XG4gICAgICAgICAgICAgIGNoaWxkcmVuTWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoaWxkTm9kZSA9IGNoaWxkTm9kZS5uZXh0U2libGluZztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gaWYgY2hpbGROb2RlIGlzIG5vdCBudWxsLCBpdCBtZWFucyB0aGUgYWN0dWFsIGNoaWxkTm9kZXMgbGlzdCBpc1xuICAgICAgICAgIC8vIGxvbmdlciB0aGFuIHRoZSB2aXJ0dWFsIGNoaWxkcmVuIGxpc3QuXG4gICAgICAgICAgaWYgKCFjaGlsZHJlbk1hdGNoIHx8IGNoaWxkTm9kZSkge1xuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgICAgICAgICAgICAhYmFpbGVkKSB7XG4gICAgICAgICAgICAgIGJhaWxlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybignUGFyZW50OiAnLCBlbG0pO1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ01pc21hdGNoaW5nIGNoaWxkTm9kZXMgdnMuIFZOb2RlczogJywgZWxtLmNoaWxkTm9kZXMsIGNoaWxkcmVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICAgICAgaWYgKCFpc1JlbmRlcmVkTW9kdWxlKGtleSkpIHtcbiAgICAgICAgICAgIGludm9rZUNyZWF0ZUhvb2tzKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGVsbS5kYXRhICE9PSB2bm9kZS50ZXh0KSB7XG4gICAgICBlbG0uZGF0YSA9IHZub2RlLnRleHQ7XG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBhc3NlcnROb2RlTWF0Y2ggKG5vZGUsIHZub2RlKSB7XG4gICAgaWYgKHZub2RlLnRhZykge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdm5vZGUudGFnLmluZGV4T2YoJ3Z1ZS1jb21wb25lbnQnKSA9PT0gMCB8fFxuICAgICAgICB2bm9kZS50YWcudG9Mb3dlckNhc2UoKSA9PT0gKG5vZGUudGFnTmFtZSAmJiBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSlcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09ICh2bm9kZS5pc0NvbW1lbnQgPyA4IDogMylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gcGF0Y2ggKG9sZFZub2RlLCB2bm9kZSwgaHlkcmF0aW5nLCByZW1vdmVPbmx5LCBwYXJlbnRFbG0sIHJlZkVsbSkge1xuICAgIGlmICghdm5vZGUpIHtcbiAgICAgIGlmIChvbGRWbm9kZSkgeyBpbnZva2VEZXN0cm95SG9vayhvbGRWbm9kZSk7IH1cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBpc0luaXRpYWxQYXRjaCA9IGZhbHNlO1xuICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcblxuICAgIGlmICghb2xkVm5vZGUpIHtcbiAgICAgIC8vIGVtcHR5IG1vdW50IChsaWtlbHkgYXMgY29tcG9uZW50KSwgY3JlYXRlIG5ldyByb290IGVsZW1lbnRcbiAgICAgIGlzSW5pdGlhbFBhdGNoID0gdHJ1ZTtcbiAgICAgIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBwYXJlbnRFbG0sIHJlZkVsbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpc1JlYWxFbGVtZW50ID0gaXNEZWYob2xkVm5vZGUubm9kZVR5cGUpO1xuICAgICAgaWYgKCFpc1JlYWxFbGVtZW50ICYmIHNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICAgIC8vIHBhdGNoIGV4aXN0aW5nIHJvb3Qgbm9kZVxuICAgICAgICBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCByZW1vdmVPbmx5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChpc1JlYWxFbGVtZW50KSB7XG4gICAgICAgICAgLy8gbW91bnRpbmcgdG8gYSByZWFsIGVsZW1lbnRcbiAgICAgICAgICAvLyBjaGVjayBpZiB0aGlzIGlzIHNlcnZlci1yZW5kZXJlZCBjb250ZW50IGFuZCBpZiB3ZSBjYW4gcGVyZm9ybVxuICAgICAgICAgIC8vIGEgc3VjY2Vzc2Z1bCBoeWRyYXRpb24uXG4gICAgICAgICAgaWYgKG9sZFZub2RlLm5vZGVUeXBlID09PSAxICYmIG9sZFZub2RlLmhhc0F0dHJpYnV0ZSgnc2VydmVyLXJlbmRlcmVkJykpIHtcbiAgICAgICAgICAgIG9sZFZub2RlLnJlbW92ZUF0dHJpYnV0ZSgnc2VydmVyLXJlbmRlcmVkJyk7XG4gICAgICAgICAgICBoeWRyYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaHlkcmF0aW5nKSB7XG4gICAgICAgICAgICBpZiAoaHlkcmF0ZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkpIHtcbiAgICAgICAgICAgICAgaW52b2tlSW5zZXJ0SG9vayh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCB0cnVlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIG9sZFZub2RlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICAgICAgd2FybihcbiAgICAgICAgICAgICAgICAnVGhlIGNsaWVudC1zaWRlIHJlbmRlcmVkIHZpcnR1YWwgRE9NIHRyZWUgaXMgbm90IG1hdGNoaW5nICcgK1xuICAgICAgICAgICAgICAgICdzZXJ2ZXItcmVuZGVyZWQgY29udGVudC4gVGhpcyBpcyBsaWtlbHkgY2F1c2VkIGJ5IGluY29ycmVjdCAnICtcbiAgICAgICAgICAgICAgICAnSFRNTCBtYXJrdXAsIGZvciBleGFtcGxlIG5lc3RpbmcgYmxvY2stbGV2ZWwgZWxlbWVudHMgaW5zaWRlICcgK1xuICAgICAgICAgICAgICAgICc8cD4sIG9yIG1pc3NpbmcgPHRib2R5Pi4gQmFpbGluZyBoeWRyYXRpb24gYW5kIHBlcmZvcm1pbmcgJyArXG4gICAgICAgICAgICAgICAgJ2Z1bGwgY2xpZW50LXNpZGUgcmVuZGVyLidcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gZWl0aGVyIG5vdCBzZXJ2ZXItcmVuZGVyZWQsIG9yIGh5ZHJhdGlvbiBmYWlsZWQuXG4gICAgICAgICAgLy8gY3JlYXRlIGFuIGVtcHR5IG5vZGUgYW5kIHJlcGxhY2UgaXRcbiAgICAgICAgICBvbGRWbm9kZSA9IGVtcHR5Tm9kZUF0KG9sZFZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXBsYWNpbmcgZXhpc3RpbmcgZWxlbWVudFxuICAgICAgICB2YXIgb2xkRWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgcGFyZW50RWxtJDEgPSBub2RlT3BzLnBhcmVudE5vZGUob2xkRWxtKTtcbiAgICAgICAgY3JlYXRlRWxtKFxuICAgICAgICAgIHZub2RlLFxuICAgICAgICAgIGluc2VydGVkVm5vZGVRdWV1ZSxcbiAgICAgICAgICAvLyBleHRyZW1lbHkgcmFyZSBlZGdlIGNhc2U6IGRvIG5vdCBpbnNlcnQgaWYgb2xkIGVsZW1lbnQgaXMgaW4gYVxuICAgICAgICAgIC8vIGxlYXZpbmcgdHJhbnNpdGlvbi4gT25seSBoYXBwZW5zIHdoZW4gY29tYmluaW5nIHRyYW5zaXRpb24gK1xuICAgICAgICAgIC8vIGtlZXAtYWxpdmUgKyBIT0NzLiAoIzQ1OTApXG4gICAgICAgICAgb2xkRWxtLl9sZWF2ZUNiID8gbnVsbCA6IHBhcmVudEVsbSQxLFxuICAgICAgICAgIG5vZGVPcHMubmV4dFNpYmxpbmcob2xkRWxtKVxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh2bm9kZS5wYXJlbnQpIHtcbiAgICAgICAgICAvLyBjb21wb25lbnQgcm9vdCBlbGVtZW50IHJlcGxhY2VkLlxuICAgICAgICAgIC8vIHVwZGF0ZSBwYXJlbnQgcGxhY2Vob2xkZXIgbm9kZSBlbGVtZW50LCByZWN1cnNpdmVseVxuICAgICAgICAgIHZhciBhbmNlc3RvciA9IHZub2RlLnBhcmVudDtcbiAgICAgICAgICB3aGlsZSAoYW5jZXN0b3IpIHtcbiAgICAgICAgICAgIGFuY2VzdG9yLmVsbSA9IHZub2RlLmVsbTtcbiAgICAgICAgICAgIGFuY2VzdG9yID0gYW5jZXN0b3IucGFyZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaXNQYXRjaGFibGUodm5vZGUpKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNicy5jcmVhdGUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgY2JzLmNyZWF0ZVtpXShlbXB0eU5vZGUsIHZub2RlLnBhcmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhcmVudEVsbSQxICE9PSBudWxsKSB7XG4gICAgICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSQxLCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0RlZihvbGRWbm9kZS50YWcpKSB7XG4gICAgICAgICAgaW52b2tlRGVzdHJveUhvb2sob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW52b2tlSW5zZXJ0SG9vayh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLCBpc0luaXRpYWxQYXRjaCk7XG4gICAgcmV0dXJuIHZub2RlLmVsbVxuICB9XG59XG5cbi8qICAqL1xuXG52YXIgZGlyZWN0aXZlcyA9IHtcbiAgY3JlYXRlOiB1cGRhdGVEaXJlY3RpdmVzLFxuICB1cGRhdGU6IHVwZGF0ZURpcmVjdGl2ZXMsXG4gIGRlc3Ryb3k6IGZ1bmN0aW9uIHVuYmluZERpcmVjdGl2ZXMgKHZub2RlKSB7XG4gICAgdXBkYXRlRGlyZWN0aXZlcyh2bm9kZSwgZW1wdHlOb2RlKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gdXBkYXRlRGlyZWN0aXZlcyAob2xkVm5vZGUsIHZub2RlKSB7XG4gIGlmIChvbGRWbm9kZS5kYXRhLmRpcmVjdGl2ZXMgfHwgdm5vZGUuZGF0YS5kaXJlY3RpdmVzKSB7XG4gICAgX3VwZGF0ZShvbGRWbm9kZSwgdm5vZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF91cGRhdGUgKG9sZFZub2RlLCB2bm9kZSkge1xuICB2YXIgaXNDcmVhdGUgPSBvbGRWbm9kZSA9PT0gZW1wdHlOb2RlO1xuICB2YXIgaXNEZXN0cm95ID0gdm5vZGUgPT09IGVtcHR5Tm9kZTtcbiAgdmFyIG9sZERpcnMgPSBub3JtYWxpemVEaXJlY3RpdmVzJDEob2xkVm5vZGUuZGF0YS5kaXJlY3RpdmVzLCBvbGRWbm9kZS5jb250ZXh0KTtcbiAgdmFyIG5ld0RpcnMgPSBub3JtYWxpemVEaXJlY3RpdmVzJDEodm5vZGUuZGF0YS5kaXJlY3RpdmVzLCB2bm9kZS5jb250ZXh0KTtcblxuICB2YXIgZGlyc1dpdGhJbnNlcnQgPSBbXTtcbiAgdmFyIGRpcnNXaXRoUG9zdHBhdGNoID0gW107XG5cbiAgdmFyIGtleSwgb2xkRGlyLCBkaXI7XG4gIGZvciAoa2V5IGluIG5ld0RpcnMpIHtcbiAgICBvbGREaXIgPSBvbGREaXJzW2tleV07XG4gICAgZGlyID0gbmV3RGlyc1trZXldO1xuICAgIGlmICghb2xkRGlyKSB7XG4gICAgICAvLyBuZXcgZGlyZWN0aXZlLCBiaW5kXG4gICAgICBjYWxsSG9vayQxKGRpciwgJ2JpbmQnLCB2bm9kZSwgb2xkVm5vZGUpO1xuICAgICAgaWYgKGRpci5kZWYgJiYgZGlyLmRlZi5pbnNlcnRlZCkge1xuICAgICAgICBkaXJzV2l0aEluc2VydC5wdXNoKGRpcik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGV4aXN0aW5nIGRpcmVjdGl2ZSwgdXBkYXRlXG4gICAgICBkaXIub2xkVmFsdWUgPSBvbGREaXIudmFsdWU7XG4gICAgICBjYWxsSG9vayQxKGRpciwgJ3VwZGF0ZScsIHZub2RlLCBvbGRWbm9kZSk7XG4gICAgICBpZiAoZGlyLmRlZiAmJiBkaXIuZGVmLmNvbXBvbmVudFVwZGF0ZWQpIHtcbiAgICAgICAgZGlyc1dpdGhQb3N0cGF0Y2gucHVzaChkaXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChkaXJzV2l0aEluc2VydC5sZW5ndGgpIHtcbiAgICB2YXIgY2FsbEluc2VydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlyc1dpdGhJbnNlcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2FsbEhvb2skMShkaXJzV2l0aEluc2VydFtpXSwgJ2luc2VydGVkJywgdm5vZGUsIG9sZFZub2RlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGlmIChpc0NyZWF0ZSkge1xuICAgICAgbWVyZ2VWTm9kZUhvb2sodm5vZGUuZGF0YS5ob29rIHx8ICh2bm9kZS5kYXRhLmhvb2sgPSB7fSksICdpbnNlcnQnLCBjYWxsSW5zZXJ0LCAnZGlyLWluc2VydCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsSW5zZXJ0KCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGRpcnNXaXRoUG9zdHBhdGNoLmxlbmd0aCkge1xuICAgIG1lcmdlVk5vZGVIb29rKHZub2RlLmRhdGEuaG9vayB8fCAodm5vZGUuZGF0YS5ob29rID0ge30pLCAncG9zdHBhdGNoJywgZnVuY3Rpb24gKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXJzV2l0aFBvc3RwYXRjaC5sZW5ndGg7IGkrKykge1xuICAgICAgICBjYWxsSG9vayQxKGRpcnNXaXRoUG9zdHBhdGNoW2ldLCAnY29tcG9uZW50VXBkYXRlZCcsIHZub2RlLCBvbGRWbm9kZSk7XG4gICAgICB9XG4gICAgfSwgJ2Rpci1wb3N0cGF0Y2gnKTtcbiAgfVxuXG4gIGlmICghaXNDcmVhdGUpIHtcbiAgICBmb3IgKGtleSBpbiBvbGREaXJzKSB7XG4gICAgICBpZiAoIW5ld0RpcnNba2V5XSkge1xuICAgICAgICAvLyBubyBsb25nZXIgcHJlc2VudCwgdW5iaW5kXG4gICAgICAgIGNhbGxIb29rJDEob2xkRGlyc1trZXldLCAndW5iaW5kJywgb2xkVm5vZGUsIG9sZFZub2RlLCBpc0Rlc3Ryb3kpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG52YXIgZW1wdHlNb2RpZmllcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG5mdW5jdGlvbiBub3JtYWxpemVEaXJlY3RpdmVzJDEgKFxuICBkaXJzLFxuICB2bVxuKSB7XG4gIHZhciByZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBpZiAoIWRpcnMpIHtcbiAgICByZXR1cm4gcmVzXG4gIH1cbiAgdmFyIGksIGRpcjtcbiAgZm9yIChpID0gMDsgaSA8IGRpcnMubGVuZ3RoOyBpKyspIHtcbiAgICBkaXIgPSBkaXJzW2ldO1xuICAgIGlmICghZGlyLm1vZGlmaWVycykge1xuICAgICAgZGlyLm1vZGlmaWVycyA9IGVtcHR5TW9kaWZpZXJzO1xuICAgIH1cbiAgICByZXNbZ2V0UmF3RGlyTmFtZShkaXIpXSA9IGRpcjtcbiAgICBkaXIuZGVmID0gcmVzb2x2ZUFzc2V0KHZtLiRvcHRpb25zLCAnZGlyZWN0aXZlcycsIGRpci5uYW1lLCB0cnVlKTtcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGdldFJhd0Rpck5hbWUgKGRpcikge1xuICByZXR1cm4gZGlyLnJhd05hbWUgfHwgKChkaXIubmFtZSkgKyBcIi5cIiArIChPYmplY3Qua2V5cyhkaXIubW9kaWZpZXJzIHx8IHt9KS5qb2luKCcuJykpKVxufVxuXG5mdW5jdGlvbiBjYWxsSG9vayQxIChkaXIsIGhvb2ssIHZub2RlLCBvbGRWbm9kZSwgaXNEZXN0cm95KSB7XG4gIHZhciBmbiA9IGRpci5kZWYgJiYgZGlyLmRlZltob29rXTtcbiAgaWYgKGZuKSB7XG4gICAgZm4odm5vZGUuZWxtLCBkaXIsIHZub2RlLCBvbGRWbm9kZSwgaXNEZXN0cm95KTtcbiAgfVxufVxuXG52YXIgYmFzZU1vZHVsZXMgPSBbXG4gIHJlZixcbiAgZGlyZWN0aXZlc1xuXTtcblxuLyogICovXG5cbmZ1bmN0aW9uIHVwZGF0ZUF0dHJzIChvbGRWbm9kZSwgdm5vZGUpIHtcbiAgaWYgKCFvbGRWbm9kZS5kYXRhLmF0dHJzICYmICF2bm9kZS5kYXRhLmF0dHJzKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIGtleSwgY3VyLCBvbGQ7XG4gIHZhciBlbG0gPSB2bm9kZS5lbG07XG4gIHZhciBvbGRBdHRycyA9IG9sZFZub2RlLmRhdGEuYXR0cnMgfHwge307XG4gIHZhciBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnMgfHwge307XG4gIC8vIGNsb25lIG9ic2VydmVkIG9iamVjdHMsIGFzIHRoZSB1c2VyIHByb2JhYmx5IHdhbnRzIHRvIG11dGF0ZSBpdFxuICBpZiAoYXR0cnMuX19vYl9fKSB7XG4gICAgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzID0gZXh0ZW5kKHt9LCBhdHRycyk7XG4gIH1cblxuICBmb3IgKGtleSBpbiBhdHRycykge1xuICAgIGN1ciA9IGF0dHJzW2tleV07XG4gICAgb2xkID0gb2xkQXR0cnNba2V5XTtcbiAgICBpZiAob2xkICE9PSBjdXIpIHtcbiAgICAgIHNldEF0dHIoZWxtLCBrZXksIGN1cik7XG4gICAgfVxuICB9XG4gIC8vICM0MzkxOiBpbiBJRTksIHNldHRpbmcgdHlwZSBjYW4gcmVzZXQgdmFsdWUgZm9yIGlucHV0W3R5cGU9cmFkaW9dXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoaXNJRTkgJiYgYXR0cnMudmFsdWUgIT09IG9sZEF0dHJzLnZhbHVlKSB7XG4gICAgc2V0QXR0cihlbG0sICd2YWx1ZScsIGF0dHJzLnZhbHVlKTtcbiAgfVxuICBmb3IgKGtleSBpbiBvbGRBdHRycykge1xuICAgIGlmIChhdHRyc1trZXldID09IG51bGwpIHtcbiAgICAgIGlmIChpc1hsaW5rKGtleSkpIHtcbiAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZU5TKHhsaW5rTlMsIGdldFhsaW5rUHJvcChrZXkpKTtcbiAgICAgIH0gZWxzZSBpZiAoIWlzRW51bWVyYXRlZEF0dHIoa2V5KSkge1xuICAgICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldEF0dHIgKGVsLCBrZXksIHZhbHVlKSB7XG4gIGlmIChpc0Jvb2xlYW5BdHRyKGtleSkpIHtcbiAgICAvLyBzZXQgYXR0cmlidXRlIGZvciBibGFuayB2YWx1ZVxuICAgIC8vIGUuZy4gPG9wdGlvbiBkaXNhYmxlZD5TZWxlY3Qgb25lPC9vcHRpb24+XG4gICAgaWYgKGlzRmFsc3lBdHRyVmFsdWUodmFsdWUpKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwga2V5KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNFbnVtZXJhdGVkQXR0cihrZXkpKSB7XG4gICAgZWwuc2V0QXR0cmlidXRlKGtleSwgaXNGYWxzeUF0dHJWYWx1ZSh2YWx1ZSkgfHwgdmFsdWUgPT09ICdmYWxzZScgPyAnZmFsc2UnIDogJ3RydWUnKTtcbiAgfSBlbHNlIGlmIChpc1hsaW5rKGtleSkpIHtcbiAgICBpZiAoaXNGYWxzeUF0dHJWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIGVsLnJlbW92ZUF0dHJpYnV0ZU5TKHhsaW5rTlMsIGdldFhsaW5rUHJvcChrZXkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuc2V0QXR0cmlidXRlTlMoeGxpbmtOUywga2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChpc0ZhbHN5QXR0clZhbHVlKHZhbHVlKSkge1xuICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cbn1cblxudmFyIGF0dHJzID0ge1xuICBjcmVhdGU6IHVwZGF0ZUF0dHJzLFxuICB1cGRhdGU6IHVwZGF0ZUF0dHJzXG59O1xuXG4vKiAgKi9cblxuZnVuY3Rpb24gdXBkYXRlQ2xhc3MgKG9sZFZub2RlLCB2bm9kZSkge1xuICB2YXIgZWwgPSB2bm9kZS5lbG07XG4gIHZhciBkYXRhID0gdm5vZGUuZGF0YTtcbiAgdmFyIG9sZERhdGEgPSBvbGRWbm9kZS5kYXRhO1xuICBpZiAoIWRhdGEuc3RhdGljQ2xhc3MgJiYgIWRhdGEuY2xhc3MgJiZcbiAgICAgICghb2xkRGF0YSB8fCAoIW9sZERhdGEuc3RhdGljQ2xhc3MgJiYgIW9sZERhdGEuY2xhc3MpKSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIGNscyA9IGdlbkNsYXNzRm9yVm5vZGUodm5vZGUpO1xuXG4gIC8vIGhhbmRsZSB0cmFuc2l0aW9uIGNsYXNzZXNcbiAgdmFyIHRyYW5zaXRpb25DbGFzcyA9IGVsLl90cmFuc2l0aW9uQ2xhc3NlcztcbiAgaWYgKHRyYW5zaXRpb25DbGFzcykge1xuICAgIGNscyA9IGNvbmNhdChjbHMsIHN0cmluZ2lmeUNsYXNzKHRyYW5zaXRpb25DbGFzcykpO1xuICB9XG5cbiAgLy8gc2V0IHRoZSBjbGFzc1xuICBpZiAoY2xzICE9PSBlbC5fcHJldkNsYXNzKSB7XG4gICAgZWwuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNscyk7XG4gICAgZWwuX3ByZXZDbGFzcyA9IGNscztcbiAgfVxufVxuXG52YXIga2xhc3MgPSB7XG4gIGNyZWF0ZTogdXBkYXRlQ2xhc3MsXG4gIHVwZGF0ZTogdXBkYXRlQ2xhc3Ncbn07XG5cbi8qICAqL1xuXG52YXIgdGFyZ2V0JDE7XG5cbmZ1bmN0aW9uIGFkZCQyIChcbiAgZXZlbnQsXG4gIGhhbmRsZXIsXG4gIG9uY2UsXG4gIGNhcHR1cmVcbikge1xuICBpZiAob25jZSkge1xuICAgIHZhciBvbGRIYW5kbGVyID0gaGFuZGxlcjtcbiAgICB2YXIgX3RhcmdldCA9IHRhcmdldCQxOyAvLyBzYXZlIGN1cnJlbnQgdGFyZ2V0IGVsZW1lbnQgaW4gY2xvc3VyZVxuICAgIGhhbmRsZXIgPSBmdW5jdGlvbiAoZXYpIHtcbiAgICAgIHJlbW92ZSQzKGV2ZW50LCBoYW5kbGVyLCBjYXB0dXJlLCBfdGFyZ2V0KTtcbiAgICAgIGFyZ3VtZW50cy5sZW5ndGggPT09IDFcbiAgICAgICAgPyBvbGRIYW5kbGVyKGV2KVxuICAgICAgICA6IG9sZEhhbmRsZXIuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG4gIHRhcmdldCQxLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIGNhcHR1cmUpO1xufVxuXG5mdW5jdGlvbiByZW1vdmUkMyAoXG4gIGV2ZW50LFxuICBoYW5kbGVyLFxuICBjYXB0dXJlLFxuICBfdGFyZ2V0XG4pIHtcbiAgKF90YXJnZXQgfHwgdGFyZ2V0JDEpLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIGNhcHR1cmUpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVET01MaXN0ZW5lcnMgKG9sZFZub2RlLCB2bm9kZSkge1xuICBpZiAoIW9sZFZub2RlLmRhdGEub24gJiYgIXZub2RlLmRhdGEub24pIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIgb24gPSB2bm9kZS5kYXRhLm9uIHx8IHt9O1xuICB2YXIgb2xkT24gPSBvbGRWbm9kZS5kYXRhLm9uIHx8IHt9O1xuICB0YXJnZXQkMSA9IHZub2RlLmVsbTtcbiAgdXBkYXRlTGlzdGVuZXJzKG9uLCBvbGRPbiwgYWRkJDIsIHJlbW92ZSQzLCB2bm9kZS5jb250ZXh0KTtcbn1cblxudmFyIGV2ZW50cyA9IHtcbiAgY3JlYXRlOiB1cGRhdGVET01MaXN0ZW5lcnMsXG4gIHVwZGF0ZTogdXBkYXRlRE9NTGlzdGVuZXJzXG59O1xuXG4vKiAgKi9cblxuZnVuY3Rpb24gdXBkYXRlRE9NUHJvcHMgKG9sZFZub2RlLCB2bm9kZSkge1xuICBpZiAoIW9sZFZub2RlLmRhdGEuZG9tUHJvcHMgJiYgIXZub2RlLmRhdGEuZG9tUHJvcHMpIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIga2V5LCBjdXI7XG4gIHZhciBlbG0gPSB2bm9kZS5lbG07XG4gIHZhciBvbGRQcm9wcyA9IG9sZFZub2RlLmRhdGEuZG9tUHJvcHMgfHwge307XG4gIHZhciBwcm9wcyA9IHZub2RlLmRhdGEuZG9tUHJvcHMgfHwge307XG4gIC8vIGNsb25lIG9ic2VydmVkIG9iamVjdHMsIGFzIHRoZSB1c2VyIHByb2JhYmx5IHdhbnRzIHRvIG11dGF0ZSBpdFxuICBpZiAocHJvcHMuX19vYl9fKSB7XG4gICAgcHJvcHMgPSB2bm9kZS5kYXRhLmRvbVByb3BzID0gZXh0ZW5kKHt9LCBwcm9wcyk7XG4gIH1cblxuICBmb3IgKGtleSBpbiBvbGRQcm9wcykge1xuICAgIGlmIChwcm9wc1trZXldID09IG51bGwpIHtcbiAgICAgIGVsbVtrZXldID0gJyc7XG4gICAgfVxuICB9XG4gIGZvciAoa2V5IGluIHByb3BzKSB7XG4gICAgY3VyID0gcHJvcHNba2V5XTtcbiAgICAvLyBpZ25vcmUgY2hpbGRyZW4gaWYgdGhlIG5vZGUgaGFzIHRleHRDb250ZW50IG9yIGlubmVySFRNTCxcbiAgICAvLyBhcyB0aGVzZSB3aWxsIHRocm93IGF3YXkgZXhpc3RpbmcgRE9NIG5vZGVzIGFuZCBjYXVzZSByZW1vdmFsIGVycm9yc1xuICAgIC8vIG9uIHN1YnNlcXVlbnQgcGF0Y2hlcyAoIzMzNjApXG4gICAgaWYgKGtleSA9PT0gJ3RleHRDb250ZW50JyB8fCBrZXkgPT09ICdpbm5lckhUTUwnKSB7XG4gICAgICBpZiAodm5vZGUuY2hpbGRyZW4pIHsgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoID0gMDsgfVxuICAgICAgaWYgKGN1ciA9PT0gb2xkUHJvcHNba2V5XSkgeyBjb250aW51ZSB9XG4gICAgfVxuXG4gICAgaWYgKGtleSA9PT0gJ3ZhbHVlJykge1xuICAgICAgLy8gc3RvcmUgdmFsdWUgYXMgX3ZhbHVlIGFzIHdlbGwgc2luY2VcbiAgICAgIC8vIG5vbi1zdHJpbmcgdmFsdWVzIHdpbGwgYmUgc3RyaW5naWZpZWRcbiAgICAgIGVsbS5fdmFsdWUgPSBjdXI7XG4gICAgICAvLyBhdm9pZCByZXNldHRpbmcgY3Vyc29yIHBvc2l0aW9uIHdoZW4gdmFsdWUgaXMgdGhlIHNhbWVcbiAgICAgIHZhciBzdHJDdXIgPSBjdXIgPT0gbnVsbCA/ICcnIDogU3RyaW5nKGN1cik7XG4gICAgICBpZiAoc2hvdWxkVXBkYXRlVmFsdWUoZWxtLCB2bm9kZSwgc3RyQ3VyKSkge1xuICAgICAgICBlbG0udmFsdWUgPSBzdHJDdXI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsbVtrZXldID0gY3VyO1xuICAgIH1cbiAgfVxufVxuXG4vLyBjaGVjayBwbGF0Zm9ybXMvd2ViL3V0aWwvYXR0cnMuanMgYWNjZXB0VmFsdWVcblxuXG5mdW5jdGlvbiBzaG91bGRVcGRhdGVWYWx1ZSAoXG4gIGVsbSxcbiAgdm5vZGUsXG4gIGNoZWNrVmFsXG4pIHtcbiAgcmV0dXJuICghZWxtLmNvbXBvc2luZyAmJiAoXG4gICAgdm5vZGUudGFnID09PSAnb3B0aW9uJyB8fFxuICAgIGlzRGlydHkoZWxtLCBjaGVja1ZhbCkgfHxcbiAgICBpc0lucHV0Q2hhbmdlZCh2bm9kZSwgY2hlY2tWYWwpXG4gICkpXG59XG5cbmZ1bmN0aW9uIGlzRGlydHkgKGVsbSwgY2hlY2tWYWwpIHtcbiAgLy8gcmV0dXJuIHRydWUgd2hlbiB0ZXh0Ym94ICgubnVtYmVyIGFuZCAudHJpbSkgbG9zZXMgZm9jdXMgYW5kIGl0cyB2YWx1ZSBpcyBub3QgZXF1YWwgdG8gdGhlIHVwZGF0ZWQgdmFsdWVcbiAgcmV0dXJuIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGVsbSAmJiBlbG0udmFsdWUgIT09IGNoZWNrVmFsXG59XG5cbmZ1bmN0aW9uIGlzSW5wdXRDaGFuZ2VkICh2bm9kZSwgbmV3VmFsKSB7XG4gIHZhciB2YWx1ZSA9IHZub2RlLmVsbS52YWx1ZTtcbiAgdmFyIG1vZGlmaWVycyA9IHZub2RlLmVsbS5fdk1vZGlmaWVyczsgLy8gaW5qZWN0ZWQgYnkgdi1tb2RlbCBydW50aW1lXG4gIGlmICgobW9kaWZpZXJzICYmIG1vZGlmaWVycy5udW1iZXIpIHx8IHZub2RlLmVsbS50eXBlID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB0b051bWJlcih2YWx1ZSkgIT09IHRvTnVtYmVyKG5ld1ZhbClcbiAgfVxuICBpZiAobW9kaWZpZXJzICYmIG1vZGlmaWVycy50cmltKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRyaW0oKSAhPT0gbmV3VmFsLnRyaW0oKVxuICB9XG4gIHJldHVybiB2YWx1ZSAhPT0gbmV3VmFsXG59XG5cbnZhciBkb21Qcm9wcyA9IHtcbiAgY3JlYXRlOiB1cGRhdGVET01Qcm9wcyxcbiAgdXBkYXRlOiB1cGRhdGVET01Qcm9wc1xufTtcblxuLyogICovXG5cbnZhciBwYXJzZVN0eWxlVGV4dCA9IGNhY2hlZChmdW5jdGlvbiAoY3NzVGV4dCkge1xuICB2YXIgcmVzID0ge307XG4gIHZhciBsaXN0RGVsaW1pdGVyID0gLzsoPyFbXihdKlxcKSkvZztcbiAgdmFyIHByb3BlcnR5RGVsaW1pdGVyID0gLzooLispLztcbiAgY3NzVGV4dC5zcGxpdChsaXN0RGVsaW1pdGVyKS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIHZhciB0bXAgPSBpdGVtLnNwbGl0KHByb3BlcnR5RGVsaW1pdGVyKTtcbiAgICAgIHRtcC5sZW5ndGggPiAxICYmIChyZXNbdG1wWzBdLnRyaW0oKV0gPSB0bXBbMV0udHJpbSgpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzXG59KTtcblxuLy8gbWVyZ2Ugc3RhdGljIGFuZCBkeW5hbWljIHN0eWxlIGRhdGEgb24gdGhlIHNhbWUgdm5vZGVcbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0eWxlRGF0YSAoZGF0YSkge1xuICB2YXIgc3R5bGUgPSBub3JtYWxpemVTdHlsZUJpbmRpbmcoZGF0YS5zdHlsZSk7XG4gIC8vIHN0YXRpYyBzdHlsZSBpcyBwcmUtcHJvY2Vzc2VkIGludG8gYW4gb2JqZWN0IGR1cmluZyBjb21waWxhdGlvblxuICAvLyBhbmQgaXMgYWx3YXlzIGEgZnJlc2ggb2JqZWN0LCBzbyBpdCdzIHNhZmUgdG8gbWVyZ2UgaW50byBpdFxuICByZXR1cm4gZGF0YS5zdGF0aWNTdHlsZVxuICAgID8gZXh0ZW5kKGRhdGEuc3RhdGljU3R5bGUsIHN0eWxlKVxuICAgIDogc3R5bGVcbn1cblxuLy8gbm9ybWFsaXplIHBvc3NpYmxlIGFycmF5IC8gc3RyaW5nIHZhbHVlcyBpbnRvIE9iamVjdFxuZnVuY3Rpb24gbm9ybWFsaXplU3R5bGVCaW5kaW5nIChiaW5kaW5nU3R5bGUpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYmluZGluZ1N0eWxlKSkge1xuICAgIHJldHVybiB0b09iamVjdChiaW5kaW5nU3R5bGUpXG4gIH1cbiAgaWYgKHR5cGVvZiBiaW5kaW5nU3R5bGUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHBhcnNlU3R5bGVUZXh0KGJpbmRpbmdTdHlsZSlcbiAgfVxuICByZXR1cm4gYmluZGluZ1N0eWxlXG59XG5cbi8qKlxuICogcGFyZW50IGNvbXBvbmVudCBzdHlsZSBzaG91bGQgYmUgYWZ0ZXIgY2hpbGQnc1xuICogc28gdGhhdCBwYXJlbnQgY29tcG9uZW50J3Mgc3R5bGUgY291bGQgb3ZlcnJpZGUgaXRcbiAqL1xuZnVuY3Rpb24gZ2V0U3R5bGUgKHZub2RlLCBjaGVja0NoaWxkKSB7XG4gIHZhciByZXMgPSB7fTtcbiAgdmFyIHN0eWxlRGF0YTtcblxuICBpZiAoY2hlY2tDaGlsZCkge1xuICAgIHZhciBjaGlsZE5vZGUgPSB2bm9kZTtcbiAgICB3aGlsZSAoY2hpbGROb2RlLmNvbXBvbmVudEluc3RhbmNlKSB7XG4gICAgICBjaGlsZE5vZGUgPSBjaGlsZE5vZGUuY29tcG9uZW50SW5zdGFuY2UuX3Zub2RlO1xuICAgICAgaWYgKGNoaWxkTm9kZS5kYXRhICYmIChzdHlsZURhdGEgPSBub3JtYWxpemVTdHlsZURhdGEoY2hpbGROb2RlLmRhdGEpKSkge1xuICAgICAgICBleHRlbmQocmVzLCBzdHlsZURhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICgoc3R5bGVEYXRhID0gbm9ybWFsaXplU3R5bGVEYXRhKHZub2RlLmRhdGEpKSkge1xuICAgIGV4dGVuZChyZXMsIHN0eWxlRGF0YSk7XG4gIH1cblxuICB2YXIgcGFyZW50Tm9kZSA9IHZub2RlO1xuICB3aGlsZSAoKHBhcmVudE5vZGUgPSBwYXJlbnROb2RlLnBhcmVudCkpIHtcbiAgICBpZiAocGFyZW50Tm9kZS5kYXRhICYmIChzdHlsZURhdGEgPSBub3JtYWxpemVTdHlsZURhdGEocGFyZW50Tm9kZS5kYXRhKSkpIHtcbiAgICAgIGV4dGVuZChyZXMsIHN0eWxlRGF0YSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuLyogICovXG5cbnZhciBjc3NWYXJSRSA9IC9eLS0vO1xudmFyIGltcG9ydGFudFJFID0gL1xccyohaW1wb3J0YW50JC87XG52YXIgc2V0UHJvcCA9IGZ1bmN0aW9uIChlbCwgbmFtZSwgdmFsKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoY3NzVmFyUkUudGVzdChuYW1lKSkge1xuICAgIGVsLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbCk7XG4gIH0gZWxzZSBpZiAoaW1wb3J0YW50UkUudGVzdCh2YWwpKSB7XG4gICAgZWwuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdmFsLnJlcGxhY2UoaW1wb3J0YW50UkUsICcnKSwgJ2ltcG9ydGFudCcpO1xuICB9IGVsc2Uge1xuICAgIGVsLnN0eWxlW25vcm1hbGl6ZShuYW1lKV0gPSB2YWw7XG4gIH1cbn07XG5cbnZhciBwcmVmaXhlcyA9IFsnV2Via2l0JywgJ01veicsICdtcyddO1xuXG52YXIgdGVzdEVsO1xudmFyIG5vcm1hbGl6ZSA9IGNhY2hlZChmdW5jdGlvbiAocHJvcCkge1xuICB0ZXN0RWwgPSB0ZXN0RWwgfHwgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHByb3AgPSBjYW1lbGl6ZShwcm9wKTtcbiAgaWYgKHByb3AgIT09ICdmaWx0ZXInICYmIChwcm9wIGluIHRlc3RFbC5zdHlsZSkpIHtcbiAgICByZXR1cm4gcHJvcFxuICB9XG4gIHZhciB1cHBlciA9IHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHByZWZpeGVkID0gcHJlZml4ZXNbaV0gKyB1cHBlcjtcbiAgICBpZiAocHJlZml4ZWQgaW4gdGVzdEVsLnN0eWxlKSB7XG4gICAgICByZXR1cm4gcHJlZml4ZWRcbiAgICB9XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiB1cGRhdGVTdHlsZSAob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBkYXRhID0gdm5vZGUuZGF0YTtcbiAgdmFyIG9sZERhdGEgPSBvbGRWbm9kZS5kYXRhO1xuXG4gIGlmICghZGF0YS5zdGF0aWNTdHlsZSAmJiAhZGF0YS5zdHlsZSAmJlxuICAgICAgIW9sZERhdGEuc3RhdGljU3R5bGUgJiYgIW9sZERhdGEuc3R5bGUpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBjdXIsIG5hbWU7XG4gIHZhciBlbCA9IHZub2RlLmVsbTtcbiAgdmFyIG9sZFN0YXRpY1N0eWxlID0gb2xkVm5vZGUuZGF0YS5zdGF0aWNTdHlsZTtcbiAgdmFyIG9sZFN0eWxlQmluZGluZyA9IG9sZFZub2RlLmRhdGEuc3R5bGUgfHwge307XG5cbiAgLy8gaWYgc3RhdGljIHN0eWxlIGV4aXN0cywgc3R5bGViaW5kaW5nIGFscmVhZHkgbWVyZ2VkIGludG8gaXQgd2hlbiBkb2luZyBub3JtYWxpemVTdHlsZURhdGFcbiAgdmFyIG9sZFN0eWxlID0gb2xkU3RhdGljU3R5bGUgfHwgb2xkU3R5bGVCaW5kaW5nO1xuXG4gIHZhciBzdHlsZSA9IG5vcm1hbGl6ZVN0eWxlQmluZGluZyh2bm9kZS5kYXRhLnN0eWxlKSB8fCB7fTtcblxuICB2bm9kZS5kYXRhLnN0eWxlID0gc3R5bGUuX19vYl9fID8gZXh0ZW5kKHt9LCBzdHlsZSkgOiBzdHlsZTtcblxuICB2YXIgbmV3U3R5bGUgPSBnZXRTdHlsZSh2bm9kZSwgdHJ1ZSk7XG5cbiAgZm9yIChuYW1lIGluIG9sZFN0eWxlKSB7XG4gICAgaWYgKG5ld1N0eWxlW25hbWVdID09IG51bGwpIHtcbiAgICAgIHNldFByb3AoZWwsIG5hbWUsICcnKTtcbiAgICB9XG4gIH1cbiAgZm9yIChuYW1lIGluIG5ld1N0eWxlKSB7XG4gICAgY3VyID0gbmV3U3R5bGVbbmFtZV07XG4gICAgaWYgKGN1ciAhPT0gb2xkU3R5bGVbbmFtZV0pIHtcbiAgICAgIC8vIGllOSBzZXR0aW5nIHRvIG51bGwgaGFzIG5vIGVmZmVjdCwgbXVzdCB1c2UgZW1wdHkgc3RyaW5nXG4gICAgICBzZXRQcm9wKGVsLCBuYW1lLCBjdXIgPT0gbnVsbCA/ICcnIDogY3VyKTtcbiAgICB9XG4gIH1cbn1cblxudmFyIHN0eWxlID0ge1xuICBjcmVhdGU6IHVwZGF0ZVN0eWxlLFxuICB1cGRhdGU6IHVwZGF0ZVN0eWxlXG59O1xuXG4vKiAgKi9cblxuLyoqXG4gKiBBZGQgY2xhc3Mgd2l0aCBjb21wYXRpYmlsaXR5IGZvciBTVkcgc2luY2UgY2xhc3NMaXN0IGlzIG5vdCBzdXBwb3J0ZWQgb25cbiAqIFNWRyBlbGVtZW50cyBpbiBJRVxuICovXG5mdW5jdGlvbiBhZGRDbGFzcyAoZWwsIGNscykge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKCFjbHMgfHwgIWNscy50cmltKCkpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBpZiAoY2xzLmluZGV4T2YoJyAnKSA+IC0xKSB7XG4gICAgICBjbHMuc3BsaXQoL1xccysvKS5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7IHJldHVybiBlbC5jbGFzc0xpc3QuYWRkKGMpOyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuY2xhc3NMaXN0LmFkZChjbHMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgY3VyID0gJyAnICsgZWwuZ2V0QXR0cmlidXRlKCdjbGFzcycpICsgJyAnO1xuICAgIGlmIChjdXIuaW5kZXhPZignICcgKyBjbHMgKyAnICcpIDwgMCkge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKCdjbGFzcycsIChjdXIgKyBjbHMpLnRyaW0oKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIGNsYXNzIHdpdGggY29tcGF0aWJpbGl0eSBmb3IgU1ZHIHNpbmNlIGNsYXNzTGlzdCBpcyBub3Qgc3VwcG9ydGVkIG9uXG4gKiBTVkcgZWxlbWVudHMgaW4gSUVcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlQ2xhc3MgKGVsLCBjbHMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICghY2xzIHx8ICFjbHMudHJpbSgpKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAoZWwuY2xhc3NMaXN0KSB7XG4gICAgaWYgKGNscy5pbmRleE9mKCcgJykgPiAtMSkge1xuICAgICAgY2xzLnNwbGl0KC9cXHMrLykuZm9yRWFjaChmdW5jdGlvbiAoYykgeyByZXR1cm4gZWwuY2xhc3NMaXN0LnJlbW92ZShjKTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoY2xzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGN1ciA9ICcgJyArIGVsLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSArICcgJztcbiAgICB2YXIgdGFyID0gJyAnICsgY2xzICsgJyAnO1xuICAgIHdoaWxlIChjdXIuaW5kZXhPZih0YXIpID49IDApIHtcbiAgICAgIGN1ciA9IGN1ci5yZXBsYWNlKHRhciwgJyAnKTtcbiAgICB9XG4gICAgZWwuc2V0QXR0cmlidXRlKCdjbGFzcycsIGN1ci50cmltKCkpO1xuICB9XG59XG5cbi8qICAqL1xuXG52YXIgaGFzVHJhbnNpdGlvbiA9IGluQnJvd3NlciAmJiAhaXNJRTk7XG52YXIgVFJBTlNJVElPTiA9ICd0cmFuc2l0aW9uJztcbnZhciBBTklNQVRJT04gPSAnYW5pbWF0aW9uJztcblxuLy8gVHJhbnNpdGlvbiBwcm9wZXJ0eS9ldmVudCBzbmlmZmluZ1xudmFyIHRyYW5zaXRpb25Qcm9wID0gJ3RyYW5zaXRpb24nO1xudmFyIHRyYW5zaXRpb25FbmRFdmVudCA9ICd0cmFuc2l0aW9uZW5kJztcbnZhciBhbmltYXRpb25Qcm9wID0gJ2FuaW1hdGlvbic7XG52YXIgYW5pbWF0aW9uRW5kRXZlbnQgPSAnYW5pbWF0aW9uZW5kJztcbmlmIChoYXNUcmFuc2l0aW9uKSB7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAod2luZG93Lm9udHJhbnNpdGlvbmVuZCA9PT0gdW5kZWZpbmVkICYmXG4gICAgd2luZG93Lm9ud2Via2l0dHJhbnNpdGlvbmVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdHJhbnNpdGlvblByb3AgPSAnV2Via2l0VHJhbnNpdGlvbic7XG4gICAgdHJhbnNpdGlvbkVuZEV2ZW50ID0gJ3dlYmtpdFRyYW5zaXRpb25FbmQnO1xuICB9XG4gIGlmICh3aW5kb3cub25hbmltYXRpb25lbmQgPT09IHVuZGVmaW5lZCAmJlxuICAgIHdpbmRvdy5vbndlYmtpdGFuaW1hdGlvbmVuZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYW5pbWF0aW9uUHJvcCA9ICdXZWJraXRBbmltYXRpb24nO1xuICAgIGFuaW1hdGlvbkVuZEV2ZW50ID0gJ3dlYmtpdEFuaW1hdGlvbkVuZCc7XG4gIH1cbn1cblxuLy8gYmluZGluZyB0byB3aW5kb3cgaXMgbmVjZXNzYXJ5IHRvIG1ha2UgaG90IHJlbG9hZCB3b3JrIGluIElFIGluIHN0cmljdCBtb2RlXG52YXIgcmFmID0gaW5Ccm93c2VyICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQod2luZG93KVxuICA6IHNldFRpbWVvdXQ7XG5cbmZ1bmN0aW9uIG5leHRGcmFtZSAoZm4pIHtcbiAgcmFmKGZ1bmN0aW9uICgpIHtcbiAgICByYWYoZm4pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkVHJhbnNpdGlvbkNsYXNzIChlbCwgY2xzKSB7XG4gIChlbC5fdHJhbnNpdGlvbkNsYXNzZXMgfHwgKGVsLl90cmFuc2l0aW9uQ2xhc3NlcyA9IFtdKSkucHVzaChjbHMpO1xuICBhZGRDbGFzcyhlbCwgY2xzKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlVHJhbnNpdGlvbkNsYXNzIChlbCwgY2xzKSB7XG4gIGlmIChlbC5fdHJhbnNpdGlvbkNsYXNzZXMpIHtcbiAgICByZW1vdmUkMShlbC5fdHJhbnNpdGlvbkNsYXNzZXMsIGNscyk7XG4gIH1cbiAgcmVtb3ZlQ2xhc3MoZWwsIGNscyk7XG59XG5cbmZ1bmN0aW9uIHdoZW5UcmFuc2l0aW9uRW5kcyAoXG4gIGVsLFxuICBleHBlY3RlZFR5cGUsXG4gIGNiXG4pIHtcbiAgdmFyIHJlZiA9IGdldFRyYW5zaXRpb25JbmZvKGVsLCBleHBlY3RlZFR5cGUpO1xuICB2YXIgdHlwZSA9IHJlZi50eXBlO1xuICB2YXIgdGltZW91dCA9IHJlZi50aW1lb3V0O1xuICB2YXIgcHJvcENvdW50ID0gcmVmLnByb3BDb3VudDtcbiAgaWYgKCF0eXBlKSB7IHJldHVybiBjYigpIH1cbiAgdmFyIGV2ZW50ID0gdHlwZSA9PT0gVFJBTlNJVElPTiA/IHRyYW5zaXRpb25FbmRFdmVudCA6IGFuaW1hdGlvbkVuZEV2ZW50O1xuICB2YXIgZW5kZWQgPSAwO1xuICB2YXIgZW5kID0gZnVuY3Rpb24gKCkge1xuICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uRW5kKTtcbiAgICBjYigpO1xuICB9O1xuICB2YXIgb25FbmQgPSBmdW5jdGlvbiAoZSkge1xuICAgIGlmIChlLnRhcmdldCA9PT0gZWwpIHtcbiAgICAgIGlmICgrK2VuZGVkID49IHByb3BDb3VudCkge1xuICAgICAgICBlbmQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGlmIChlbmRlZCA8IHByb3BDb3VudCkge1xuICAgICAgZW5kKCk7XG4gICAgfVxuICB9LCB0aW1lb3V0ICsgMSk7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIG9uRW5kKTtcbn1cblxudmFyIHRyYW5zZm9ybVJFID0gL1xcYih0cmFuc2Zvcm18YWxsKSgsfCQpLztcblxuZnVuY3Rpb24gZ2V0VHJhbnNpdGlvbkluZm8gKGVsLCBleHBlY3RlZFR5cGUpIHtcbiAgdmFyIHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKTtcbiAgdmFyIHRyYW5zaXRpb25lRGVsYXlzID0gc3R5bGVzW3RyYW5zaXRpb25Qcm9wICsgJ0RlbGF5J10uc3BsaXQoJywgJyk7XG4gIHZhciB0cmFuc2l0aW9uRHVyYXRpb25zID0gc3R5bGVzW3RyYW5zaXRpb25Qcm9wICsgJ0R1cmF0aW9uJ10uc3BsaXQoJywgJyk7XG4gIHZhciB0cmFuc2l0aW9uVGltZW91dCA9IGdldFRpbWVvdXQodHJhbnNpdGlvbmVEZWxheXMsIHRyYW5zaXRpb25EdXJhdGlvbnMpO1xuICB2YXIgYW5pbWF0aW9uRGVsYXlzID0gc3R5bGVzW2FuaW1hdGlvblByb3AgKyAnRGVsYXknXS5zcGxpdCgnLCAnKTtcbiAgdmFyIGFuaW1hdGlvbkR1cmF0aW9ucyA9IHN0eWxlc1thbmltYXRpb25Qcm9wICsgJ0R1cmF0aW9uJ10uc3BsaXQoJywgJyk7XG4gIHZhciBhbmltYXRpb25UaW1lb3V0ID0gZ2V0VGltZW91dChhbmltYXRpb25EZWxheXMsIGFuaW1hdGlvbkR1cmF0aW9ucyk7XG5cbiAgdmFyIHR5cGU7XG4gIHZhciB0aW1lb3V0ID0gMDtcbiAgdmFyIHByb3BDb3VudCA9IDA7XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoZXhwZWN0ZWRUeXBlID09PSBUUkFOU0lUSU9OKSB7XG4gICAgaWYgKHRyYW5zaXRpb25UaW1lb3V0ID4gMCkge1xuICAgICAgdHlwZSA9IFRSQU5TSVRJT047XG4gICAgICB0aW1lb3V0ID0gdHJhbnNpdGlvblRpbWVvdXQ7XG4gICAgICBwcm9wQ291bnQgPSB0cmFuc2l0aW9uRHVyYXRpb25zLmxlbmd0aDtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWRUeXBlID09PSBBTklNQVRJT04pIHtcbiAgICBpZiAoYW5pbWF0aW9uVGltZW91dCA+IDApIHtcbiAgICAgIHR5cGUgPSBBTklNQVRJT047XG4gICAgICB0aW1lb3V0ID0gYW5pbWF0aW9uVGltZW91dDtcbiAgICAgIHByb3BDb3VudCA9IGFuaW1hdGlvbkR1cmF0aW9ucy5sZW5ndGg7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRpbWVvdXQgPSBNYXRoLm1heCh0cmFuc2l0aW9uVGltZW91dCwgYW5pbWF0aW9uVGltZW91dCk7XG4gICAgdHlwZSA9IHRpbWVvdXQgPiAwXG4gICAgICA/IHRyYW5zaXRpb25UaW1lb3V0ID4gYW5pbWF0aW9uVGltZW91dFxuICAgICAgICA/IFRSQU5TSVRJT05cbiAgICAgICAgOiBBTklNQVRJT05cbiAgICAgIDogbnVsbDtcbiAgICBwcm9wQ291bnQgPSB0eXBlXG4gICAgICA/IHR5cGUgPT09IFRSQU5TSVRJT05cbiAgICAgICAgPyB0cmFuc2l0aW9uRHVyYXRpb25zLmxlbmd0aFxuICAgICAgICA6IGFuaW1hdGlvbkR1cmF0aW9ucy5sZW5ndGhcbiAgICAgIDogMDtcbiAgfVxuICB2YXIgaGFzVHJhbnNmb3JtID1cbiAgICB0eXBlID09PSBUUkFOU0lUSU9OICYmXG4gICAgdHJhbnNmb3JtUkUudGVzdChzdHlsZXNbdHJhbnNpdGlvblByb3AgKyAnUHJvcGVydHknXSk7XG4gIHJldHVybiB7XG4gICAgdHlwZTogdHlwZSxcbiAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgIHByb3BDb3VudDogcHJvcENvdW50LFxuICAgIGhhc1RyYW5zZm9ybTogaGFzVHJhbnNmb3JtXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VGltZW91dCAoZGVsYXlzLCBkdXJhdGlvbnMpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgd2hpbGUgKGRlbGF5cy5sZW5ndGggPCBkdXJhdGlvbnMubGVuZ3RoKSB7XG4gICAgZGVsYXlzID0gZGVsYXlzLmNvbmNhdChkZWxheXMpO1xuICB9XG5cbiAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KG51bGwsIGR1cmF0aW9ucy5tYXAoZnVuY3Rpb24gKGQsIGkpIHtcbiAgICByZXR1cm4gdG9NcyhkKSArIHRvTXMoZGVsYXlzW2ldKVxuICB9KSlcbn1cblxuZnVuY3Rpb24gdG9NcyAocykge1xuICByZXR1cm4gTnVtYmVyKHMuc2xpY2UoMCwgLTEpKSAqIDEwMDBcbn1cblxuLyogICovXG5cbmZ1bmN0aW9uIGVudGVyICh2bm9kZSwgdG9nZ2xlRGlzcGxheSkge1xuICB2YXIgZWwgPSB2bm9kZS5lbG07XG5cbiAgLy8gY2FsbCBsZWF2ZSBjYWxsYmFjayBub3dcbiAgaWYgKGVsLl9sZWF2ZUNiKSB7XG4gICAgZWwuX2xlYXZlQ2IuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICBlbC5fbGVhdmVDYigpO1xuICB9XG5cbiAgdmFyIGRhdGEgPSByZXNvbHZlVHJhbnNpdGlvbih2bm9kZS5kYXRhLnRyYW5zaXRpb24pO1xuICBpZiAoIWRhdGEpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoZWwuX2VudGVyQ2IgfHwgZWwubm9kZVR5cGUgIT09IDEpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBjc3MgPSBkYXRhLmNzcztcbiAgdmFyIHR5cGUgPSBkYXRhLnR5cGU7XG4gIHZhciBlbnRlckNsYXNzID0gZGF0YS5lbnRlckNsYXNzO1xuICB2YXIgZW50ZXJUb0NsYXNzID0gZGF0YS5lbnRlclRvQ2xhc3M7XG4gIHZhciBlbnRlckFjdGl2ZUNsYXNzID0gZGF0YS5lbnRlckFjdGl2ZUNsYXNzO1xuICB2YXIgYXBwZWFyQ2xhc3MgPSBkYXRhLmFwcGVhckNsYXNzO1xuICB2YXIgYXBwZWFyVG9DbGFzcyA9IGRhdGEuYXBwZWFyVG9DbGFzcztcbiAgdmFyIGFwcGVhckFjdGl2ZUNsYXNzID0gZGF0YS5hcHBlYXJBY3RpdmVDbGFzcztcbiAgdmFyIGJlZm9yZUVudGVyID0gZGF0YS5iZWZvcmVFbnRlcjtcbiAgdmFyIGVudGVyID0gZGF0YS5lbnRlcjtcbiAgdmFyIGFmdGVyRW50ZXIgPSBkYXRhLmFmdGVyRW50ZXI7XG4gIHZhciBlbnRlckNhbmNlbGxlZCA9IGRhdGEuZW50ZXJDYW5jZWxsZWQ7XG4gIHZhciBiZWZvcmVBcHBlYXIgPSBkYXRhLmJlZm9yZUFwcGVhcjtcbiAgdmFyIGFwcGVhciA9IGRhdGEuYXBwZWFyO1xuICB2YXIgYWZ0ZXJBcHBlYXIgPSBkYXRhLmFmdGVyQXBwZWFyO1xuICB2YXIgYXBwZWFyQ2FuY2VsbGVkID0gZGF0YS5hcHBlYXJDYW5jZWxsZWQ7XG5cbiAgLy8gYWN0aXZlSW5zdGFuY2Ugd2lsbCBhbHdheXMgYmUgdGhlIDx0cmFuc2l0aW9uPiBjb21wb25lbnQgbWFuYWdpbmcgdGhpc1xuICAvLyB0cmFuc2l0aW9uLiBPbmUgZWRnZSBjYXNlIHRvIGNoZWNrIGlzIHdoZW4gdGhlIDx0cmFuc2l0aW9uPiBpcyBwbGFjZWRcbiAgLy8gYXMgdGhlIHJvb3Qgbm9kZSBvZiBhIGNoaWxkIGNvbXBvbmVudC4gSW4gdGhhdCBjYXNlIHdlIG5lZWQgdG8gY2hlY2tcbiAgLy8gPHRyYW5zaXRpb24+J3MgcGFyZW50IGZvciBhcHBlYXIgY2hlY2suXG4gIHZhciBjb250ZXh0ID0gYWN0aXZlSW5zdGFuY2U7XG4gIHZhciB0cmFuc2l0aW9uTm9kZSA9IGFjdGl2ZUluc3RhbmNlLiR2bm9kZTtcbiAgd2hpbGUgKHRyYW5zaXRpb25Ob2RlICYmIHRyYW5zaXRpb25Ob2RlLnBhcmVudCkge1xuICAgIHRyYW5zaXRpb25Ob2RlID0gdHJhbnNpdGlvbk5vZGUucGFyZW50O1xuICAgIGNvbnRleHQgPSB0cmFuc2l0aW9uTm9kZS5jb250ZXh0O1xuICB9XG5cbiAgdmFyIGlzQXBwZWFyID0gIWNvbnRleHQuX2lzTW91bnRlZCB8fCAhdm5vZGUuaXNSb290SW5zZXJ0O1xuXG4gIGlmIChpc0FwcGVhciAmJiAhYXBwZWFyICYmIGFwcGVhciAhPT0gJycpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdGFydENsYXNzID0gaXNBcHBlYXIgPyBhcHBlYXJDbGFzcyA6IGVudGVyQ2xhc3M7XG4gIHZhciBhY3RpdmVDbGFzcyA9IGlzQXBwZWFyID8gYXBwZWFyQWN0aXZlQ2xhc3MgOiBlbnRlckFjdGl2ZUNsYXNzO1xuICB2YXIgdG9DbGFzcyA9IGlzQXBwZWFyID8gYXBwZWFyVG9DbGFzcyA6IGVudGVyVG9DbGFzcztcbiAgdmFyIGJlZm9yZUVudGVySG9vayA9IGlzQXBwZWFyID8gKGJlZm9yZUFwcGVhciB8fCBiZWZvcmVFbnRlcikgOiBiZWZvcmVFbnRlcjtcbiAgdmFyIGVudGVySG9vayA9IGlzQXBwZWFyID8gKHR5cGVvZiBhcHBlYXIgPT09ICdmdW5jdGlvbicgPyBhcHBlYXIgOiBlbnRlcikgOiBlbnRlcjtcbiAgdmFyIGFmdGVyRW50ZXJIb29rID0gaXNBcHBlYXIgPyAoYWZ0ZXJBcHBlYXIgfHwgYWZ0ZXJFbnRlcikgOiBhZnRlckVudGVyO1xuICB2YXIgZW50ZXJDYW5jZWxsZWRIb29rID0gaXNBcHBlYXIgPyAoYXBwZWFyQ2FuY2VsbGVkIHx8IGVudGVyQ2FuY2VsbGVkKSA6IGVudGVyQ2FuY2VsbGVkO1xuXG4gIHZhciBleHBlY3RzQ1NTID0gY3NzICE9PSBmYWxzZSAmJiAhaXNJRTk7XG4gIHZhciB1c2VyV2FudHNDb250cm9sID1cbiAgICBlbnRlckhvb2sgJiZcbiAgICAvLyBlbnRlckhvb2sgbWF5IGJlIGEgYm91bmQgbWV0aG9kIHdoaWNoIGV4cG9zZXNcbiAgICAvLyB0aGUgbGVuZ3RoIG9mIG9yaWdpbmFsIGZuIGFzIF9sZW5ndGhcbiAgICAoZW50ZXJIb29rLl9sZW5ndGggfHwgZW50ZXJIb29rLmxlbmd0aCkgPiAxO1xuXG4gIHZhciBjYiA9IGVsLl9lbnRlckNiID0gb25jZShmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGV4cGVjdHNDU1MpIHtcbiAgICAgIHJlbW92ZVRyYW5zaXRpb25DbGFzcyhlbCwgdG9DbGFzcyk7XG4gICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIGFjdGl2ZUNsYXNzKTtcbiAgICB9XG4gICAgaWYgKGNiLmNhbmNlbGxlZCkge1xuICAgICAgaWYgKGV4cGVjdHNDU1MpIHtcbiAgICAgICAgcmVtb3ZlVHJhbnNpdGlvbkNsYXNzKGVsLCBzdGFydENsYXNzKTtcbiAgICAgIH1cbiAgICAgIGVudGVyQ2FuY2VsbGVkSG9vayAmJiBlbnRlckNhbmNlbGxlZEhvb2soZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZnRlckVudGVySG9vayAmJiBhZnRlckVudGVySG9vayhlbCk7XG4gICAgfVxuICAgIGVsLl9lbnRlckNiID0gbnVsbDtcbiAgfSk7XG5cbiAgaWYgKCF2bm9kZS5kYXRhLnNob3cpIHtcbiAgICAvLyByZW1vdmUgcGVuZGluZyBsZWF2ZSBlbGVtZW50IG9uIGVudGVyIGJ5IGluamVjdGluZyBhbiBpbnNlcnQgaG9va1xuICAgIG1lcmdlVk5vZGVIb29rKHZub2RlLmRhdGEuaG9vayB8fCAodm5vZGUuZGF0YS5ob29rID0ge30pLCAnaW5zZXJ0JywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICB2YXIgcGVuZGluZ05vZGUgPSBwYXJlbnQgJiYgcGFyZW50Ll9wZW5kaW5nICYmIHBhcmVudC5fcGVuZGluZ1t2bm9kZS5rZXldO1xuICAgICAgaWYgKHBlbmRpbmdOb2RlICYmXG4gICAgICAgICAgcGVuZGluZ05vZGUudGFnID09PSB2bm9kZS50YWcgJiZcbiAgICAgICAgICBwZW5kaW5nTm9kZS5lbG0uX2xlYXZlQ2IpIHtcbiAgICAgICAgcGVuZGluZ05vZGUuZWxtLl9sZWF2ZUNiKCk7XG4gICAgICB9XG4gICAgICBlbnRlckhvb2sgJiYgZW50ZXJIb29rKGVsLCBjYik7XG4gICAgfSwgJ3RyYW5zaXRpb24taW5zZXJ0Jyk7XG4gIH1cblxuICAvLyBzdGFydCBlbnRlciB0cmFuc2l0aW9uXG4gIGJlZm9yZUVudGVySG9vayAmJiBiZWZvcmVFbnRlckhvb2soZWwpO1xuICBpZiAoZXhwZWN0c0NTUykge1xuICAgIGFkZFRyYW5zaXRpb25DbGFzcyhlbCwgc3RhcnRDbGFzcyk7XG4gICAgYWRkVHJhbnNpdGlvbkNsYXNzKGVsLCBhY3RpdmVDbGFzcyk7XG4gICAgbmV4dEZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgIGFkZFRyYW5zaXRpb25DbGFzcyhlbCwgdG9DbGFzcyk7XG4gICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIHN0YXJ0Q2xhc3MpO1xuICAgICAgaWYgKCFjYi5jYW5jZWxsZWQgJiYgIXVzZXJXYW50c0NvbnRyb2wpIHtcbiAgICAgICAgd2hlblRyYW5zaXRpb25FbmRzKGVsLCB0eXBlLCBjYik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBpZiAodm5vZGUuZGF0YS5zaG93KSB7XG4gICAgdG9nZ2xlRGlzcGxheSAmJiB0b2dnbGVEaXNwbGF5KCk7XG4gICAgZW50ZXJIb29rICYmIGVudGVySG9vayhlbCwgY2IpO1xuICB9XG5cbiAgaWYgKCFleHBlY3RzQ1NTICYmICF1c2VyV2FudHNDb250cm9sKSB7XG4gICAgY2IoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBsZWF2ZSAodm5vZGUsIHJtKSB7XG4gIHZhciBlbCA9IHZub2RlLmVsbTtcblxuICAvLyBjYWxsIGVudGVyIGNhbGxiYWNrIG5vd1xuICBpZiAoZWwuX2VudGVyQ2IpIHtcbiAgICBlbC5fZW50ZXJDYi5jYW5jZWxsZWQgPSB0cnVlO1xuICAgIGVsLl9lbnRlckNiKCk7XG4gIH1cblxuICB2YXIgZGF0YSA9IHJlc29sdmVUcmFuc2l0aW9uKHZub2RlLmRhdGEudHJhbnNpdGlvbik7XG4gIGlmICghZGF0YSkge1xuICAgIHJldHVybiBybSgpXG4gIH1cblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKGVsLl9sZWF2ZUNiIHx8IGVsLm5vZGVUeXBlICE9PSAxKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgY3NzID0gZGF0YS5jc3M7XG4gIHZhciB0eXBlID0gZGF0YS50eXBlO1xuICB2YXIgbGVhdmVDbGFzcyA9IGRhdGEubGVhdmVDbGFzcztcbiAgdmFyIGxlYXZlVG9DbGFzcyA9IGRhdGEubGVhdmVUb0NsYXNzO1xuICB2YXIgbGVhdmVBY3RpdmVDbGFzcyA9IGRhdGEubGVhdmVBY3RpdmVDbGFzcztcbiAgdmFyIGJlZm9yZUxlYXZlID0gZGF0YS5iZWZvcmVMZWF2ZTtcbiAgdmFyIGxlYXZlID0gZGF0YS5sZWF2ZTtcbiAgdmFyIGFmdGVyTGVhdmUgPSBkYXRhLmFmdGVyTGVhdmU7XG4gIHZhciBsZWF2ZUNhbmNlbGxlZCA9IGRhdGEubGVhdmVDYW5jZWxsZWQ7XG4gIHZhciBkZWxheUxlYXZlID0gZGF0YS5kZWxheUxlYXZlO1xuXG4gIHZhciBleHBlY3RzQ1NTID0gY3NzICE9PSBmYWxzZSAmJiAhaXNJRTk7XG4gIHZhciB1c2VyV2FudHNDb250cm9sID1cbiAgICBsZWF2ZSAmJlxuICAgIC8vIGxlYXZlIGhvb2sgbWF5IGJlIGEgYm91bmQgbWV0aG9kIHdoaWNoIGV4cG9zZXNcbiAgICAvLyB0aGUgbGVuZ3RoIG9mIG9yaWdpbmFsIGZuIGFzIF9sZW5ndGhcbiAgICAobGVhdmUuX2xlbmd0aCB8fCBsZWF2ZS5sZW5ndGgpID4gMTtcblxuICB2YXIgY2IgPSBlbC5fbGVhdmVDYiA9IG9uY2UoZnVuY3Rpb24gKCkge1xuICAgIGlmIChlbC5wYXJlbnROb2RlICYmIGVsLnBhcmVudE5vZGUuX3BlbmRpbmcpIHtcbiAgICAgIGVsLnBhcmVudE5vZGUuX3BlbmRpbmdbdm5vZGUua2V5XSA9IG51bGw7XG4gICAgfVxuICAgIGlmIChleHBlY3RzQ1NTKSB7XG4gICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlVG9DbGFzcyk7XG4gICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlQWN0aXZlQ2xhc3MpO1xuICAgIH1cbiAgICBpZiAoY2IuY2FuY2VsbGVkKSB7XG4gICAgICBpZiAoZXhwZWN0c0NTUykge1xuICAgICAgICByZW1vdmVUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlQ2xhc3MpO1xuICAgICAgfVxuICAgICAgbGVhdmVDYW5jZWxsZWQgJiYgbGVhdmVDYW5jZWxsZWQoZWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBybSgpO1xuICAgICAgYWZ0ZXJMZWF2ZSAmJiBhZnRlckxlYXZlKGVsKTtcbiAgICB9XG4gICAgZWwuX2xlYXZlQ2IgPSBudWxsO1xuICB9KTtcblxuICBpZiAoZGVsYXlMZWF2ZSkge1xuICAgIGRlbGF5TGVhdmUocGVyZm9ybUxlYXZlKTtcbiAgfSBlbHNlIHtcbiAgICBwZXJmb3JtTGVhdmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBlcmZvcm1MZWF2ZSAoKSB7XG4gICAgLy8gdGhlIGRlbGF5ZWQgbGVhdmUgbWF5IGhhdmUgYWxyZWFkeSBiZWVuIGNhbmNlbGxlZFxuICAgIGlmIChjYi5jYW5jZWxsZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyByZWNvcmQgbGVhdmluZyBlbGVtZW50XG4gICAgaWYgKCF2bm9kZS5kYXRhLnNob3cpIHtcbiAgICAgIChlbC5wYXJlbnROb2RlLl9wZW5kaW5nIHx8IChlbC5wYXJlbnROb2RlLl9wZW5kaW5nID0ge30pKVt2bm9kZS5rZXldID0gdm5vZGU7XG4gICAgfVxuICAgIGJlZm9yZUxlYXZlICYmIGJlZm9yZUxlYXZlKGVsKTtcbiAgICBpZiAoZXhwZWN0c0NTUykge1xuICAgICAgYWRkVHJhbnNpdGlvbkNsYXNzKGVsLCBsZWF2ZUNsYXNzKTtcbiAgICAgIGFkZFRyYW5zaXRpb25DbGFzcyhlbCwgbGVhdmVBY3RpdmVDbGFzcyk7XG4gICAgICBuZXh0RnJhbWUoZnVuY3Rpb24gKCkge1xuICAgICAgICBhZGRUcmFuc2l0aW9uQ2xhc3MoZWwsIGxlYXZlVG9DbGFzcyk7XG4gICAgICAgIHJlbW92ZVRyYW5zaXRpb25DbGFzcyhlbCwgbGVhdmVDbGFzcyk7XG4gICAgICAgIGlmICghY2IuY2FuY2VsbGVkICYmICF1c2VyV2FudHNDb250cm9sKSB7XG4gICAgICAgICAgd2hlblRyYW5zaXRpb25FbmRzKGVsLCB0eXBlLCBjYik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBsZWF2ZSAmJiBsZWF2ZShlbCwgY2IpO1xuICAgIGlmICghZXhwZWN0c0NTUyAmJiAhdXNlcldhbnRzQ29udHJvbCkge1xuICAgICAgY2IoKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVRyYW5zaXRpb24gKGRlZiQkMSkge1xuICBpZiAoIWRlZiQkMSkge1xuICAgIHJldHVyblxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gIGlmICh0eXBlb2YgZGVmJCQxID09PSAnb2JqZWN0Jykge1xuICAgIHZhciByZXMgPSB7fTtcbiAgICBpZiAoZGVmJCQxLmNzcyAhPT0gZmFsc2UpIHtcbiAgICAgIGV4dGVuZChyZXMsIGF1dG9Dc3NUcmFuc2l0aW9uKGRlZiQkMS5uYW1lIHx8ICd2JykpO1xuICAgIH1cbiAgICBleHRlbmQocmVzLCBkZWYkJDEpO1xuICAgIHJldHVybiByZXNcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmJCQxID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBhdXRvQ3NzVHJhbnNpdGlvbihkZWYkJDEpXG4gIH1cbn1cblxudmFyIGF1dG9Dc3NUcmFuc2l0aW9uID0gY2FjaGVkKGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiB7XG4gICAgZW50ZXJDbGFzczogKG5hbWUgKyBcIi1lbnRlclwiKSxcbiAgICBsZWF2ZUNsYXNzOiAobmFtZSArIFwiLWxlYXZlXCIpLFxuICAgIGFwcGVhckNsYXNzOiAobmFtZSArIFwiLWVudGVyXCIpLFxuICAgIGVudGVyVG9DbGFzczogKG5hbWUgKyBcIi1lbnRlci10b1wiKSxcbiAgICBsZWF2ZVRvQ2xhc3M6IChuYW1lICsgXCItbGVhdmUtdG9cIiksXG4gICAgYXBwZWFyVG9DbGFzczogKG5hbWUgKyBcIi1lbnRlci10b1wiKSxcbiAgICBlbnRlckFjdGl2ZUNsYXNzOiAobmFtZSArIFwiLWVudGVyLWFjdGl2ZVwiKSxcbiAgICBsZWF2ZUFjdGl2ZUNsYXNzOiAobmFtZSArIFwiLWxlYXZlLWFjdGl2ZVwiKSxcbiAgICBhcHBlYXJBY3RpdmVDbGFzczogKG5hbWUgKyBcIi1lbnRlci1hY3RpdmVcIilcbiAgfVxufSk7XG5cbmZ1bmN0aW9uIG9uY2UgKGZuKSB7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWNhbGxlZCkge1xuICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgIGZuKCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9lbnRlciAoXywgdm5vZGUpIHtcbiAgaWYgKCF2bm9kZS5kYXRhLnNob3cpIHtcbiAgICBlbnRlcih2bm9kZSk7XG4gIH1cbn1cblxudmFyIHRyYW5zaXRpb24gPSBpbkJyb3dzZXIgPyB7XG4gIGNyZWF0ZTogX2VudGVyLFxuICBhY3RpdmF0ZTogX2VudGVyLFxuICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSAodm5vZGUsIHJtKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAoIXZub2RlLmRhdGEuc2hvdykge1xuICAgICAgbGVhdmUodm5vZGUsIHJtKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcm0oKTtcbiAgICB9XG4gIH1cbn0gOiB7fTtcblxudmFyIHBsYXRmb3JtTW9kdWxlcyA9IFtcbiAgYXR0cnMsXG4gIGtsYXNzLFxuICBldmVudHMsXG4gIGRvbVByb3BzLFxuICBzdHlsZSxcbiAgdHJhbnNpdGlvblxuXTtcblxuLyogICovXG5cbi8vIHRoZSBkaXJlY3RpdmUgbW9kdWxlIHNob3VsZCBiZSBhcHBsaWVkIGxhc3QsIGFmdGVyIGFsbFxuLy8gYnVpbHQtaW4gbW9kdWxlcyBoYXZlIGJlZW4gYXBwbGllZC5cbnZhciBtb2R1bGVzID0gcGxhdGZvcm1Nb2R1bGVzLmNvbmNhdChiYXNlTW9kdWxlcyk7XG5cbnZhciBwYXRjaCQxID0gY3JlYXRlUGF0Y2hGdW5jdGlvbih7IG5vZGVPcHM6IG5vZGVPcHMsIG1vZHVsZXM6IG1vZHVsZXMgfSk7XG5cbi8qKlxuICogTm90IHR5cGUgY2hlY2tpbmcgdGhpcyBmaWxlIGJlY2F1c2UgZmxvdyBkb2Vzbid0IGxpa2UgYXR0YWNoaW5nXG4gKiBwcm9wZXJ0aWVzIHRvIEVsZW1lbnRzLlxuICovXG5cbnZhciBtb2RlbGFibGVUYWdSRSA9IC9eaW5wdXR8c2VsZWN0fHRleHRhcmVhfHZ1ZS1jb21wb25lbnQtWzAtOV0rKC1bMC05YS16QS1aXy1dKik/JC87XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuaWYgKGlzSUU5KSB7XG4gIC8vIGh0dHA6Ly93d3cubWF0dHM0MTEuY29tL3Bvc3QvaW50ZXJuZXQtZXhwbG9yZXItOS1vbmlucHV0L1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzZWxlY3Rpb25jaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICBpZiAoZWwgJiYgZWwudm1vZGVsKSB7XG4gICAgICB0cmlnZ2VyKGVsLCAnaW5wdXQnKTtcbiAgICB9XG4gIH0pO1xufVxuXG52YXIgbW9kZWwgPSB7XG4gIGluc2VydGVkOiBmdW5jdGlvbiBpbnNlcnRlZCAoZWwsIGJpbmRpbmcsIHZub2RlKSB7XG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIGlmICghbW9kZWxhYmxlVGFnUkUudGVzdCh2bm9kZS50YWcpKSB7XG4gICAgICAgIHdhcm4oXG4gICAgICAgICAgXCJ2LW1vZGVsIGlzIG5vdCBzdXBwb3J0ZWQgb24gZWxlbWVudCB0eXBlOiA8XCIgKyAodm5vZGUudGFnKSArIFwiPi4gXCIgK1xuICAgICAgICAgICdJZiB5b3UgYXJlIHdvcmtpbmcgd2l0aCBjb250ZW50ZWRpdGFibGUsIGl0XFwncyByZWNvbW1lbmRlZCB0byAnICtcbiAgICAgICAgICAnd3JhcCBhIGxpYnJhcnkgZGVkaWNhdGVkIGZvciB0aGF0IHB1cnBvc2UgaW5zaWRlIGEgY3VzdG9tIGNvbXBvbmVudC4nLFxuICAgICAgICAgIHZub2RlLmNvbnRleHRcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZub2RlLnRhZyA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgIHZhciBjYiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0U2VsZWN0ZWQoZWwsIGJpbmRpbmcsIHZub2RlLmNvbnRleHQpO1xuICAgICAgfTtcbiAgICAgIGNiKCk7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmIChpc0lFIHx8IGlzRWRnZSkge1xuICAgICAgICBzZXRUaW1lb3V0KGNiLCAwKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHZub2RlLnRhZyA9PT0gJ3RleHRhcmVhJyB8fCBlbC50eXBlID09PSAndGV4dCcpIHtcbiAgICAgIGVsLl92TW9kaWZpZXJzID0gYmluZGluZy5tb2RpZmllcnM7XG4gICAgICBpZiAoIWJpbmRpbmcubW9kaWZpZXJzLmxhenkpIHtcbiAgICAgICAgaWYgKCFpc0FuZHJvaWQpIHtcbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjb21wb3NpdGlvbnN0YXJ0Jywgb25Db21wb3NpdGlvblN0YXJ0KTtcbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjb21wb3NpdGlvbmVuZCcsIG9uQ29tcG9zaXRpb25FbmQpO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoaXNJRTkpIHtcbiAgICAgICAgICBlbC52bW9kZWwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBjb21wb25lbnRVcGRhdGVkOiBmdW5jdGlvbiBjb21wb25lbnRVcGRhdGVkIChlbCwgYmluZGluZywgdm5vZGUpIHtcbiAgICBpZiAodm5vZGUudGFnID09PSAnc2VsZWN0Jykge1xuICAgICAgc2V0U2VsZWN0ZWQoZWwsIGJpbmRpbmcsIHZub2RlLmNvbnRleHQpO1xuICAgICAgLy8gaW4gY2FzZSB0aGUgb3B0aW9ucyByZW5kZXJlZCBieSB2LWZvciBoYXZlIGNoYW5nZWQsXG4gICAgICAvLyBpdCdzIHBvc3NpYmxlIHRoYXQgdGhlIHZhbHVlIGlzIG91dC1vZi1zeW5jIHdpdGggdGhlIHJlbmRlcmVkIG9wdGlvbnMuXG4gICAgICAvLyBkZXRlY3Qgc3VjaCBjYXNlcyBhbmQgZmlsdGVyIG91dCB2YWx1ZXMgdGhhdCBubyBsb25nZXIgaGFzIGEgbWF0Y2hpbmdcbiAgICAgIC8vIG9wdGlvbiBpbiB0aGUgRE9NLlxuICAgICAgdmFyIG5lZWRSZXNldCA9IGVsLm11bHRpcGxlXG4gICAgICAgID8gYmluZGluZy52YWx1ZS5zb21lKGZ1bmN0aW9uICh2KSB7IHJldHVybiBoYXNOb01hdGNoaW5nT3B0aW9uKHYsIGVsLm9wdGlvbnMpOyB9KVxuICAgICAgICA6IGJpbmRpbmcudmFsdWUgIT09IGJpbmRpbmcub2xkVmFsdWUgJiYgaGFzTm9NYXRjaGluZ09wdGlvbihiaW5kaW5nLnZhbHVlLCBlbC5vcHRpb25zKTtcbiAgICAgIGlmIChuZWVkUmVzZXQpIHtcbiAgICAgICAgdHJpZ2dlcihlbCwgJ2NoYW5nZScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuZnVuY3Rpb24gc2V0U2VsZWN0ZWQgKGVsLCBiaW5kaW5nLCB2bSkge1xuICB2YXIgdmFsdWUgPSBiaW5kaW5nLnZhbHVlO1xuICB2YXIgaXNNdWx0aXBsZSA9IGVsLm11bHRpcGxlO1xuICBpZiAoaXNNdWx0aXBsZSAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHdhcm4oXG4gICAgICBcIjxzZWxlY3QgbXVsdGlwbGUgdi1tb2RlbD1cXFwiXCIgKyAoYmluZGluZy5leHByZXNzaW9uKSArIFwiXFxcIj4gXCIgK1xuICAgICAgXCJleHBlY3RzIGFuIEFycmF5IHZhbHVlIGZvciBpdHMgYmluZGluZywgYnV0IGdvdCBcIiArIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLnNsaWNlKDgsIC0xKSksXG4gICAgICB2bVxuICAgICk7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIHNlbGVjdGVkLCBvcHRpb247XG4gIGZvciAodmFyIGkgPSAwLCBsID0gZWwub3B0aW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBvcHRpb24gPSBlbC5vcHRpb25zW2ldO1xuICAgIGlmIChpc011bHRpcGxlKSB7XG4gICAgICBzZWxlY3RlZCA9IGxvb3NlSW5kZXhPZih2YWx1ZSwgZ2V0VmFsdWUob3B0aW9uKSkgPiAtMTtcbiAgICAgIGlmIChvcHRpb24uc2VsZWN0ZWQgIT09IHNlbGVjdGVkKSB7XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHNlbGVjdGVkO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobG9vc2VFcXVhbChnZXRWYWx1ZShvcHRpb24pLCB2YWx1ZSkpIHtcbiAgICAgICAgaWYgKGVsLnNlbGVjdGVkSW5kZXggIT09IGkpIHtcbiAgICAgICAgICBlbC5zZWxlY3RlZEluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKCFpc011bHRpcGxlKSB7XG4gICAgZWwuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhhc05vTWF0Y2hpbmdPcHRpb24gKHZhbHVlLCBvcHRpb25zKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gb3B0aW9ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAobG9vc2VFcXVhbChnZXRWYWx1ZShvcHRpb25zW2ldKSwgdmFsdWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWVcbn1cblxuZnVuY3Rpb24gZ2V0VmFsdWUgKG9wdGlvbikge1xuICByZXR1cm4gJ192YWx1ZScgaW4gb3B0aW9uXG4gICAgPyBvcHRpb24uX3ZhbHVlXG4gICAgOiBvcHRpb24udmFsdWVcbn1cblxuZnVuY3Rpb24gb25Db21wb3NpdGlvblN0YXJ0IChlKSB7XG4gIGUudGFyZ2V0LmNvbXBvc2luZyA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIG9uQ29tcG9zaXRpb25FbmQgKGUpIHtcbiAgZS50YXJnZXQuY29tcG9zaW5nID0gZmFsc2U7XG4gIHRyaWdnZXIoZS50YXJnZXQsICdpbnB1dCcpO1xufVxuXG5mdW5jdGlvbiB0cmlnZ2VyIChlbCwgdHlwZSkge1xuICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdIVE1MRXZlbnRzJyk7XG4gIGUuaW5pdEV2ZW50KHR5cGUsIHRydWUsIHRydWUpO1xuICBlbC5kaXNwYXRjaEV2ZW50KGUpO1xufVxuXG4vKiAgKi9cblxuLy8gcmVjdXJzaXZlbHkgc2VhcmNoIGZvciBwb3NzaWJsZSB0cmFuc2l0aW9uIGRlZmluZWQgaW5zaWRlIHRoZSBjb21wb25lbnQgcm9vdFxuZnVuY3Rpb24gbG9jYXRlTm9kZSAodm5vZGUpIHtcbiAgcmV0dXJuIHZub2RlLmNvbXBvbmVudEluc3RhbmNlICYmICghdm5vZGUuZGF0YSB8fCAhdm5vZGUuZGF0YS50cmFuc2l0aW9uKVxuICAgID8gbG9jYXRlTm9kZSh2bm9kZS5jb21wb25lbnRJbnN0YW5jZS5fdm5vZGUpXG4gICAgOiB2bm9kZVxufVxuXG52YXIgc2hvdyA9IHtcbiAgYmluZDogZnVuY3Rpb24gYmluZCAoZWwsIHJlZiwgdm5vZGUpIHtcbiAgICB2YXIgdmFsdWUgPSByZWYudmFsdWU7XG5cbiAgICB2bm9kZSA9IGxvY2F0ZU5vZGUodm5vZGUpO1xuICAgIHZhciB0cmFuc2l0aW9uID0gdm5vZGUuZGF0YSAmJiB2bm9kZS5kYXRhLnRyYW5zaXRpb247XG4gICAgdmFyIG9yaWdpbmFsRGlzcGxheSA9IGVsLl9fdk9yaWdpbmFsRGlzcGxheSA9XG4gICAgICBlbC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScgPyAnJyA6IGVsLnN0eWxlLmRpc3BsYXk7XG4gICAgaWYgKHZhbHVlICYmIHRyYW5zaXRpb24gJiYgIWlzSUU5KSB7XG4gICAgICB2bm9kZS5kYXRhLnNob3cgPSB0cnVlO1xuICAgICAgZW50ZXIodm5vZGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IG9yaWdpbmFsRGlzcGxheTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gdmFsdWUgPyBvcmlnaW5hbERpc3BsYXkgOiAnbm9uZSc7XG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlIChlbCwgcmVmLCB2bm9kZSkge1xuICAgIHZhciB2YWx1ZSA9IHJlZi52YWx1ZTtcbiAgICB2YXIgb2xkVmFsdWUgPSByZWYub2xkVmFsdWU7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAodmFsdWUgPT09IG9sZFZhbHVlKSB7IHJldHVybiB9XG4gICAgdm5vZGUgPSBsb2NhdGVOb2RlKHZub2RlKTtcbiAgICB2YXIgdHJhbnNpdGlvbiA9IHZub2RlLmRhdGEgJiYgdm5vZGUuZGF0YS50cmFuc2l0aW9uO1xuICAgIGlmICh0cmFuc2l0aW9uICYmICFpc0lFOSkge1xuICAgICAgdm5vZGUuZGF0YS5zaG93ID0gdHJ1ZTtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBlbnRlcih2bm9kZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSBlbC5fX3ZPcmlnaW5hbERpc3BsYXk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGVhdmUodm5vZGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBlbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWwuc3R5bGUuZGlzcGxheSA9IHZhbHVlID8gZWwuX192T3JpZ2luYWxEaXNwbGF5IDogJ25vbmUnO1xuICAgIH1cbiAgfSxcblxuICB1bmJpbmQ6IGZ1bmN0aW9uIHVuYmluZCAoXG4gICAgZWwsXG4gICAgYmluZGluZyxcbiAgICB2bm9kZSxcbiAgICBvbGRWbm9kZSxcbiAgICBpc0Rlc3Ryb3lcbiAgKSB7XG4gICAgaWYgKCFpc0Rlc3Ryb3kpIHtcbiAgICAgIGVsLnN0eWxlLmRpc3BsYXkgPSBlbC5fX3ZPcmlnaW5hbERpc3BsYXk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgcGxhdGZvcm1EaXJlY3RpdmVzID0ge1xuICBtb2RlbDogbW9kZWwsXG4gIHNob3c6IHNob3dcbn07XG5cbi8qICAqL1xuXG4vLyBQcm92aWRlcyB0cmFuc2l0aW9uIHN1cHBvcnQgZm9yIGEgc2luZ2xlIGVsZW1lbnQvY29tcG9uZW50LlxuLy8gc3VwcG9ydHMgdHJhbnNpdGlvbiBtb2RlIChvdXQtaW4gLyBpbi1vdXQpXG5cbnZhciB0cmFuc2l0aW9uUHJvcHMgPSB7XG4gIG5hbWU6IFN0cmluZyxcbiAgYXBwZWFyOiBCb29sZWFuLFxuICBjc3M6IEJvb2xlYW4sXG4gIG1vZGU6IFN0cmluZyxcbiAgdHlwZTogU3RyaW5nLFxuICBlbnRlckNsYXNzOiBTdHJpbmcsXG4gIGxlYXZlQ2xhc3M6IFN0cmluZyxcbiAgZW50ZXJUb0NsYXNzOiBTdHJpbmcsXG4gIGxlYXZlVG9DbGFzczogU3RyaW5nLFxuICBlbnRlckFjdGl2ZUNsYXNzOiBTdHJpbmcsXG4gIGxlYXZlQWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgYXBwZWFyQ2xhc3M6IFN0cmluZyxcbiAgYXBwZWFyQWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgYXBwZWFyVG9DbGFzczogU3RyaW5nXG59O1xuXG4vLyBpbiBjYXNlIHRoZSBjaGlsZCBpcyBhbHNvIGFuIGFic3RyYWN0IGNvbXBvbmVudCwgZS5nLiA8a2VlcC1hbGl2ZT5cbi8vIHdlIHdhbnQgdG8gcmVjdXJzaXZlbHkgcmV0cmlldmUgdGhlIHJlYWwgY29tcG9uZW50IHRvIGJlIHJlbmRlcmVkXG5mdW5jdGlvbiBnZXRSZWFsQ2hpbGQgKHZub2RlKSB7XG4gIHZhciBjb21wT3B0aW9ucyA9IHZub2RlICYmIHZub2RlLmNvbXBvbmVudE9wdGlvbnM7XG4gIGlmIChjb21wT3B0aW9ucyAmJiBjb21wT3B0aW9ucy5DdG9yLm9wdGlvbnMuYWJzdHJhY3QpIHtcbiAgICByZXR1cm4gZ2V0UmVhbENoaWxkKGdldEZpcnN0Q29tcG9uZW50Q2hpbGQoY29tcE9wdGlvbnMuY2hpbGRyZW4pKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB2bm9kZVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RUcmFuc2l0aW9uRGF0YSAoY29tcCkge1xuICB2YXIgZGF0YSA9IHt9O1xuICB2YXIgb3B0aW9ucyA9IGNvbXAuJG9wdGlvbnM7XG4gIC8vIHByb3BzXG4gIGZvciAodmFyIGtleSBpbiBvcHRpb25zLnByb3BzRGF0YSkge1xuICAgIGRhdGFba2V5XSA9IGNvbXBba2V5XTtcbiAgfVxuICAvLyBldmVudHMuXG4gIC8vIGV4dHJhY3QgbGlzdGVuZXJzIGFuZCBwYXNzIHRoZW0gZGlyZWN0bHkgdG8gdGhlIHRyYW5zaXRpb24gbWV0aG9kc1xuICB2YXIgbGlzdGVuZXJzID0gb3B0aW9ucy5fcGFyZW50TGlzdGVuZXJzO1xuICBmb3IgKHZhciBrZXkkMSBpbiBsaXN0ZW5lcnMpIHtcbiAgICBkYXRhW2NhbWVsaXplKGtleSQxKV0gPSBsaXN0ZW5lcnNba2V5JDFdLmZuO1xuICB9XG4gIHJldHVybiBkYXRhXG59XG5cbmZ1bmN0aW9uIHBsYWNlaG9sZGVyIChoLCByYXdDaGlsZCkge1xuICByZXR1cm4gL1xcZC1rZWVwLWFsaXZlJC8udGVzdChyYXdDaGlsZC50YWcpXG4gICAgPyBoKCdrZWVwLWFsaXZlJylcbiAgICA6IG51bGxcbn1cblxuZnVuY3Rpb24gaGFzUGFyZW50VHJhbnNpdGlvbiAodm5vZGUpIHtcbiAgd2hpbGUgKCh2bm9kZSA9IHZub2RlLnBhcmVudCkpIHtcbiAgICBpZiAodm5vZGUuZGF0YS50cmFuc2l0aW9uKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1NhbWVDaGlsZCAoY2hpbGQsIG9sZENoaWxkKSB7XG4gIHJldHVybiBvbGRDaGlsZC5rZXkgPT09IGNoaWxkLmtleSAmJiBvbGRDaGlsZC50YWcgPT09IGNoaWxkLnRhZ1xufVxuXG52YXIgVHJhbnNpdGlvbiA9IHtcbiAgbmFtZTogJ3RyYW5zaXRpb24nLFxuICBwcm9wczogdHJhbnNpdGlvblByb3BzLFxuICBhYnN0cmFjdDogdHJ1ZSxcblxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlciAoaCkge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gICAgdmFyIGNoaWxkcmVuID0gdGhpcy4kc2xvdHMuZGVmYXVsdDtcbiAgICBpZiAoIWNoaWxkcmVuKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBmaWx0ZXIgb3V0IHRleHQgbm9kZXMgKHBvc3NpYmxlIHdoaXRlc3BhY2VzKVxuICAgIGNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGZ1bmN0aW9uIChjKSB7IHJldHVybiBjLnRhZzsgfSk7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIHdhcm4gbXVsdGlwbGUgZWxlbWVudHNcbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiBjaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnPHRyYW5zaXRpb24+IGNhbiBvbmx5IGJlIHVzZWQgb24gYSBzaW5nbGUgZWxlbWVudC4gVXNlICcgK1xuICAgICAgICAnPHRyYW5zaXRpb24tZ3JvdXA+IGZvciBsaXN0cy4nLFxuICAgICAgICB0aGlzLiRwYXJlbnRcbiAgICAgICk7XG4gICAgfVxuXG4gICAgdmFyIG1vZGUgPSB0aGlzLm1vZGU7XG5cbiAgICAvLyB3YXJuIGludmFsaWQgbW9kZVxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmXG4gICAgICAgIG1vZGUgJiYgbW9kZSAhPT0gJ2luLW91dCcgJiYgbW9kZSAhPT0gJ291dC1pbicpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICdpbnZhbGlkIDx0cmFuc2l0aW9uPiBtb2RlOiAnICsgbW9kZSxcbiAgICAgICAgdGhpcy4kcGFyZW50XG4gICAgICApO1xuICAgIH1cblxuICAgIHZhciByYXdDaGlsZCA9IGNoaWxkcmVuWzBdO1xuXG4gICAgLy8gaWYgdGhpcyBpcyBhIGNvbXBvbmVudCByb290IG5vZGUgYW5kIHRoZSBjb21wb25lbnQnc1xuICAgIC8vIHBhcmVudCBjb250YWluZXIgbm9kZSBhbHNvIGhhcyB0cmFuc2l0aW9uLCBza2lwLlxuICAgIGlmIChoYXNQYXJlbnRUcmFuc2l0aW9uKHRoaXMuJHZub2RlKSkge1xuICAgICAgcmV0dXJuIHJhd0NoaWxkXG4gICAgfVxuXG4gICAgLy8gYXBwbHkgdHJhbnNpdGlvbiBkYXRhIHRvIGNoaWxkXG4gICAgLy8gdXNlIGdldFJlYWxDaGlsZCgpIHRvIGlnbm9yZSBhYnN0cmFjdCBjb21wb25lbnRzIGUuZy4ga2VlcC1hbGl2ZVxuICAgIHZhciBjaGlsZCA9IGdldFJlYWxDaGlsZChyYXdDaGlsZCk7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFjaGlsZCkge1xuICAgICAgcmV0dXJuIHJhd0NoaWxkXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xlYXZpbmcpIHtcbiAgICAgIHJldHVybiBwbGFjZWhvbGRlcihoLCByYXdDaGlsZClcbiAgICB9XG5cbiAgICAvLyBlbnN1cmUgYSBrZXkgdGhhdCBpcyB1bmlxdWUgdG8gdGhlIHZub2RlIHR5cGUgYW5kIHRvIHRoaXMgdHJhbnNpdGlvblxuICAgIC8vIGNvbXBvbmVudCBpbnN0YW5jZS4gVGhpcyBrZXkgd2lsbCBiZSB1c2VkIHRvIHJlbW92ZSBwZW5kaW5nIGxlYXZpbmcgbm9kZXNcbiAgICAvLyBkdXJpbmcgZW50ZXJpbmcuXG4gICAgdmFyIGlkID0gXCJfX3RyYW5zaXRpb24tXCIgKyAodGhpcy5fdWlkKSArIFwiLVwiO1xuICAgIHZhciBrZXkgPSBjaGlsZC5rZXkgPSBjaGlsZC5rZXkgPT0gbnVsbFxuICAgICAgPyBpZCArIGNoaWxkLnRhZ1xuICAgICAgOiBpc1ByaW1pdGl2ZShjaGlsZC5rZXkpXG4gICAgICAgID8gKFN0cmluZyhjaGlsZC5rZXkpLmluZGV4T2YoaWQpID09PSAwID8gY2hpbGQua2V5IDogaWQgKyBjaGlsZC5rZXkpXG4gICAgICAgIDogY2hpbGQua2V5O1xuICAgIHZhciBkYXRhID0gKGNoaWxkLmRhdGEgfHwgKGNoaWxkLmRhdGEgPSB7fSkpLnRyYW5zaXRpb24gPSBleHRyYWN0VHJhbnNpdGlvbkRhdGEodGhpcyk7XG4gICAgdmFyIG9sZFJhd0NoaWxkID0gdGhpcy5fdm5vZGU7XG4gICAgdmFyIG9sZENoaWxkID0gZ2V0UmVhbENoaWxkKG9sZFJhd0NoaWxkKTtcblxuICAgIC8vIG1hcmsgdi1zaG93XG4gICAgLy8gc28gdGhhdCB0aGUgdHJhbnNpdGlvbiBtb2R1bGUgY2FuIGhhbmQgb3ZlciB0aGUgY29udHJvbCB0byB0aGUgZGlyZWN0aXZlXG4gICAgaWYgKGNoaWxkLmRhdGEuZGlyZWN0aXZlcyAmJiBjaGlsZC5kYXRhLmRpcmVjdGl2ZXMuc29tZShmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lID09PSAnc2hvdyc7IH0pKSB7XG4gICAgICBjaGlsZC5kYXRhLnNob3cgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvbGRDaGlsZCAmJiBvbGRDaGlsZC5kYXRhICYmICFpc1NhbWVDaGlsZChjaGlsZCwgb2xkQ2hpbGQpKSB7XG4gICAgICAvLyByZXBsYWNlIG9sZCBjaGlsZCB0cmFuc2l0aW9uIGRhdGEgd2l0aCBmcmVzaCBvbmVcbiAgICAgIC8vIGltcG9ydGFudCBmb3IgZHluYW1pYyB0cmFuc2l0aW9ucyFcbiAgICAgIHZhciBvbGREYXRhID0gb2xkQ2hpbGQgJiYgKG9sZENoaWxkLmRhdGEudHJhbnNpdGlvbiA9IGV4dGVuZCh7fSwgZGF0YSkpO1xuICAgICAgLy8gaGFuZGxlIHRyYW5zaXRpb24gbW9kZVxuICAgICAgaWYgKG1vZGUgPT09ICdvdXQtaW4nKSB7XG4gICAgICAgIC8vIHJldHVybiBwbGFjZWhvbGRlciBub2RlIGFuZCBxdWV1ZSB1cGRhdGUgd2hlbiBsZWF2ZSBmaW5pc2hlc1xuICAgICAgICB0aGlzLl9sZWF2aW5nID0gdHJ1ZTtcbiAgICAgICAgbWVyZ2VWTm9kZUhvb2sob2xkRGF0YSwgJ2FmdGVyTGVhdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpcyQxLl9sZWF2aW5nID0gZmFsc2U7XG4gICAgICAgICAgdGhpcyQxLiRmb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9LCBrZXkpO1xuICAgICAgICByZXR1cm4gcGxhY2Vob2xkZXIoaCwgcmF3Q2hpbGQpXG4gICAgICB9IGVsc2UgaWYgKG1vZGUgPT09ICdpbi1vdXQnKSB7XG4gICAgICAgIHZhciBkZWxheWVkTGVhdmU7XG4gICAgICAgIHZhciBwZXJmb3JtTGVhdmUgPSBmdW5jdGlvbiAoKSB7IGRlbGF5ZWRMZWF2ZSgpOyB9O1xuICAgICAgICBtZXJnZVZOb2RlSG9vayhkYXRhLCAnYWZ0ZXJFbnRlcicsIHBlcmZvcm1MZWF2ZSwga2V5KTtcbiAgICAgICAgbWVyZ2VWTm9kZUhvb2soZGF0YSwgJ2VudGVyQ2FuY2VsbGVkJywgcGVyZm9ybUxlYXZlLCBrZXkpO1xuICAgICAgICBtZXJnZVZOb2RlSG9vayhvbGREYXRhLCAnZGVsYXlMZWF2ZScsIGZ1bmN0aW9uIChsZWF2ZSkge1xuICAgICAgICAgIGRlbGF5ZWRMZWF2ZSA9IGxlYXZlO1xuICAgICAgICB9LCBrZXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByYXdDaGlsZFxuICB9XG59O1xuXG4vKiAgKi9cblxuLy8gUHJvdmlkZXMgdHJhbnNpdGlvbiBzdXBwb3J0IGZvciBsaXN0IGl0ZW1zLlxuLy8gc3VwcG9ydHMgbW92ZSB0cmFuc2l0aW9ucyB1c2luZyB0aGUgRkxJUCB0ZWNobmlxdWUuXG5cbi8vIEJlY2F1c2UgdGhlIHZkb20ncyBjaGlsZHJlbiB1cGRhdGUgYWxnb3JpdGhtIGlzIFwidW5zdGFibGVcIiAtIGkuZS5cbi8vIGl0IGRvZXNuJ3QgZ3VhcmFudGVlIHRoZSByZWxhdGl2ZSBwb3NpdGlvbmluZyBvZiByZW1vdmVkIGVsZW1lbnRzLFxuLy8gd2UgZm9yY2UgdHJhbnNpdGlvbi1ncm91cCB0byB1cGRhdGUgaXRzIGNoaWxkcmVuIGludG8gdHdvIHBhc3Nlczpcbi8vIGluIHRoZSBmaXJzdCBwYXNzLCB3ZSByZW1vdmUgYWxsIG5vZGVzIHRoYXQgbmVlZCB0byBiZSByZW1vdmVkLFxuLy8gdHJpZ2dlcmluZyB0aGVpciBsZWF2aW5nIHRyYW5zaXRpb247IGluIHRoZSBzZWNvbmQgcGFzcywgd2UgaW5zZXJ0L21vdmVcbi8vIGludG8gdGhlIGZpbmFsIGRpc2lyZWQgc3RhdGUuIFRoaXMgd2F5IGluIHRoZSBzZWNvbmQgcGFzcyByZW1vdmVkXG4vLyBub2RlcyB3aWxsIHJlbWFpbiB3aGVyZSB0aGV5IHNob3VsZCBiZS5cblxudmFyIHByb3BzID0gZXh0ZW5kKHtcbiAgdGFnOiBTdHJpbmcsXG4gIG1vdmVDbGFzczogU3RyaW5nXG59LCB0cmFuc2l0aW9uUHJvcHMpO1xuXG5kZWxldGUgcHJvcHMubW9kZTtcblxudmFyIFRyYW5zaXRpb25Hcm91cCA9IHtcbiAgcHJvcHM6IHByb3BzLFxuXG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyIChoKSB7XG4gICAgdmFyIHRhZyA9IHRoaXMudGFnIHx8IHRoaXMuJHZub2RlLmRhdGEudGFnIHx8ICdzcGFuJztcbiAgICB2YXIgbWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB2YXIgcHJldkNoaWxkcmVuID0gdGhpcy5wcmV2Q2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuO1xuICAgIHZhciByYXdDaGlsZHJlbiA9IHRoaXMuJHNsb3RzLmRlZmF1bHQgfHwgW107XG4gICAgdmFyIGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbiA9IFtdO1xuICAgIHZhciB0cmFuc2l0aW9uRGF0YSA9IGV4dHJhY3RUcmFuc2l0aW9uRGF0YSh0aGlzKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmF3Q2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjID0gcmF3Q2hpbGRyZW5baV07XG4gICAgICBpZiAoYy50YWcpIHtcbiAgICAgICAgaWYgKGMua2V5ICE9IG51bGwgJiYgU3RyaW5nKGMua2V5KS5pbmRleE9mKCdfX3ZsaXN0JykgIT09IDApIHtcbiAgICAgICAgICBjaGlsZHJlbi5wdXNoKGMpO1xuICAgICAgICAgIG1hcFtjLmtleV0gPSBjXG4gICAgICAgICAgOyhjLmRhdGEgfHwgKGMuZGF0YSA9IHt9KSkudHJhbnNpdGlvbiA9IHRyYW5zaXRpb25EYXRhO1xuICAgICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgICB2YXIgb3B0cyA9IGMuY29tcG9uZW50T3B0aW9ucztcbiAgICAgICAgICB2YXIgbmFtZSA9IG9wdHNcbiAgICAgICAgICAgID8gKG9wdHMuQ3Rvci5vcHRpb25zLm5hbWUgfHwgb3B0cy50YWcpXG4gICAgICAgICAgICA6IGMudGFnO1xuICAgICAgICAgIHdhcm4oKFwiPHRyYW5zaXRpb24tZ3JvdXA+IGNoaWxkcmVuIG11c3QgYmUga2V5ZWQ6IDxcIiArIG5hbWUgKyBcIj5cIikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHByZXZDaGlsZHJlbikge1xuICAgICAgdmFyIGtlcHQgPSBbXTtcbiAgICAgIHZhciByZW1vdmVkID0gW107XG4gICAgICBmb3IgKHZhciBpJDEgPSAwOyBpJDEgPCBwcmV2Q2hpbGRyZW4ubGVuZ3RoOyBpJDErKykge1xuICAgICAgICB2YXIgYyQxID0gcHJldkNoaWxkcmVuW2kkMV07XG4gICAgICAgIGMkMS5kYXRhLnRyYW5zaXRpb24gPSB0cmFuc2l0aW9uRGF0YTtcbiAgICAgICAgYyQxLmRhdGEucG9zID0gYyQxLmVsbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgaWYgKG1hcFtjJDEua2V5XSkge1xuICAgICAgICAgIGtlcHQucHVzaChjJDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlbW92ZWQucHVzaChjJDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmtlcHQgPSBoKHRhZywgbnVsbCwga2VwdCk7XG4gICAgICB0aGlzLnJlbW92ZWQgPSByZW1vdmVkO1xuICAgIH1cblxuICAgIHJldHVybiBoKHRhZywgbnVsbCwgY2hpbGRyZW4pXG4gIH0sXG5cbiAgYmVmb3JlVXBkYXRlOiBmdW5jdGlvbiBiZWZvcmVVcGRhdGUgKCkge1xuICAgIC8vIGZvcmNlIHJlbW92aW5nIHBhc3NcbiAgICB0aGlzLl9fcGF0Y2hfXyhcbiAgICAgIHRoaXMuX3Zub2RlLFxuICAgICAgdGhpcy5rZXB0LFxuICAgICAgZmFsc2UsIC8vIGh5ZHJhdGluZ1xuICAgICAgdHJ1ZSAvLyByZW1vdmVPbmx5ICghaW1wb3J0YW50LCBhdm9pZHMgdW5uZWNlc3NhcnkgbW92ZXMpXG4gICAgKTtcbiAgICB0aGlzLl92bm9kZSA9IHRoaXMua2VwdDtcbiAgfSxcblxuICB1cGRhdGVkOiBmdW5jdGlvbiB1cGRhdGVkICgpIHtcbiAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLnByZXZDaGlsZHJlbjtcbiAgICB2YXIgbW92ZUNsYXNzID0gdGhpcy5tb3ZlQ2xhc3MgfHwgKCh0aGlzLm5hbWUgfHwgJ3YnKSArICctbW92ZScpO1xuICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoIHx8ICF0aGlzLmhhc01vdmUoY2hpbGRyZW5bMF0uZWxtLCBtb3ZlQ2xhc3MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyB3ZSBkaXZpZGUgdGhlIHdvcmsgaW50byB0aHJlZSBsb29wcyB0byBhdm9pZCBtaXhpbmcgRE9NIHJlYWRzIGFuZCB3cml0ZXNcbiAgICAvLyBpbiBlYWNoIGl0ZXJhdGlvbiAtIHdoaWNoIGhlbHBzIHByZXZlbnQgbGF5b3V0IHRocmFzaGluZy5cbiAgICBjaGlsZHJlbi5mb3JFYWNoKGNhbGxQZW5kaW5nQ2JzKTtcbiAgICBjaGlsZHJlbi5mb3JFYWNoKHJlY29yZFBvc2l0aW9uKTtcbiAgICBjaGlsZHJlbi5mb3JFYWNoKGFwcGx5VHJhbnNsYXRpb24pO1xuXG4gICAgLy8gZm9yY2UgcmVmbG93IHRvIHB1dCBldmVyeXRoaW5nIGluIHBvc2l0aW9uXG4gICAgdmFyIGYgPSBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodDsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gICAgY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoYykge1xuICAgICAgaWYgKGMuZGF0YS5tb3ZlZCkge1xuICAgICAgICB2YXIgZWwgPSBjLmVsbTtcbiAgICAgICAgdmFyIHMgPSBlbC5zdHlsZTtcbiAgICAgICAgYWRkVHJhbnNpdGlvbkNsYXNzKGVsLCBtb3ZlQ2xhc3MpO1xuICAgICAgICBzLnRyYW5zZm9ybSA9IHMuV2Via2l0VHJhbnNmb3JtID0gcy50cmFuc2l0aW9uRHVyYXRpb24gPSAnJztcbiAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcih0cmFuc2l0aW9uRW5kRXZlbnQsIGVsLl9tb3ZlQ2IgPSBmdW5jdGlvbiBjYiAoZSkge1xuICAgICAgICAgIGlmICghZSB8fCAvdHJhbnNmb3JtJC8udGVzdChlLnByb3BlcnR5TmFtZSkpIHtcbiAgICAgICAgICAgIGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIodHJhbnNpdGlvbkVuZEV2ZW50LCBjYik7XG4gICAgICAgICAgICBlbC5fbW92ZUNiID0gbnVsbDtcbiAgICAgICAgICAgIHJlbW92ZVRyYW5zaXRpb25DbGFzcyhlbCwgbW92ZUNsYXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIG1ldGhvZHM6IHtcbiAgICBoYXNNb3ZlOiBmdW5jdGlvbiBoYXNNb3ZlIChlbCwgbW92ZUNsYXNzKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghaGFzVHJhbnNpdGlvbikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9oYXNNb3ZlICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhc01vdmVcbiAgICAgIH1cbiAgICAgIGFkZFRyYW5zaXRpb25DbGFzcyhlbCwgbW92ZUNsYXNzKTtcbiAgICAgIHZhciBpbmZvID0gZ2V0VHJhbnNpdGlvbkluZm8oZWwpO1xuICAgICAgcmVtb3ZlVHJhbnNpdGlvbkNsYXNzKGVsLCBtb3ZlQ2xhc3MpO1xuICAgICAgcmV0dXJuICh0aGlzLl9oYXNNb3ZlID0gaW5mby5oYXNUcmFuc2Zvcm0pXG4gICAgfVxuICB9XG59O1xuXG5mdW5jdGlvbiBjYWxsUGVuZGluZ0NicyAoYykge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgaWYgKGMuZWxtLl9tb3ZlQ2IpIHtcbiAgICBjLmVsbS5fbW92ZUNiKCk7XG4gIH1cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmIChjLmVsbS5fZW50ZXJDYikge1xuICAgIGMuZWxtLl9lbnRlckNiKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVjb3JkUG9zaXRpb24gKGMpIHtcbiAgYy5kYXRhLm5ld1BvcyA9IGMuZWxtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xufVxuXG5mdW5jdGlvbiBhcHBseVRyYW5zbGF0aW9uIChjKSB7XG4gIHZhciBvbGRQb3MgPSBjLmRhdGEucG9zO1xuICB2YXIgbmV3UG9zID0gYy5kYXRhLm5ld1BvcztcbiAgdmFyIGR4ID0gb2xkUG9zLmxlZnQgLSBuZXdQb3MubGVmdDtcbiAgdmFyIGR5ID0gb2xkUG9zLnRvcCAtIG5ld1Bvcy50b3A7XG4gIGlmIChkeCB8fCBkeSkge1xuICAgIGMuZGF0YS5tb3ZlZCA9IHRydWU7XG4gICAgdmFyIHMgPSBjLmVsbS5zdHlsZTtcbiAgICBzLnRyYW5zZm9ybSA9IHMuV2Via2l0VHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUoXCIgKyBkeCArIFwicHgsXCIgKyBkeSArIFwicHgpXCI7XG4gICAgcy50cmFuc2l0aW9uRHVyYXRpb24gPSAnMHMnO1xuICB9XG59XG5cbnZhciBwbGF0Zm9ybUNvbXBvbmVudHMgPSB7XG4gIFRyYW5zaXRpb246IFRyYW5zaXRpb24sXG4gIFRyYW5zaXRpb25Hcm91cDogVHJhbnNpdGlvbkdyb3VwXG59O1xuXG4vKiAgKi9cblxuLy8gaW5zdGFsbCBwbGF0Zm9ybSBzcGVjaWZpYyB1dGlsc1xuVnVlJDIuY29uZmlnLmlzVW5rbm93bkVsZW1lbnQgPSBpc1Vua25vd25FbGVtZW50O1xuVnVlJDIuY29uZmlnLmlzUmVzZXJ2ZWRUYWcgPSBpc1Jlc2VydmVkVGFnO1xuVnVlJDIuY29uZmlnLmdldFRhZ05hbWVzcGFjZSA9IGdldFRhZ05hbWVzcGFjZTtcblZ1ZSQyLmNvbmZpZy5tdXN0VXNlUHJvcCA9IG11c3RVc2VQcm9wO1xuXG4vLyBpbnN0YWxsIHBsYXRmb3JtIHJ1bnRpbWUgZGlyZWN0aXZlcyAmIGNvbXBvbmVudHNcbmV4dGVuZChWdWUkMi5vcHRpb25zLmRpcmVjdGl2ZXMsIHBsYXRmb3JtRGlyZWN0aXZlcyk7XG5leHRlbmQoVnVlJDIub3B0aW9ucy5jb21wb25lbnRzLCBwbGF0Zm9ybUNvbXBvbmVudHMpO1xuXG4vLyBpbnN0YWxsIHBsYXRmb3JtIHBhdGNoIGZ1bmN0aW9uXG5WdWUkMi5wcm90b3R5cGUuX19wYXRjaF9fID0gaW5Ccm93c2VyID8gcGF0Y2gkMSA6IG5vb3A7XG5cbi8vIHdyYXAgbW91bnRcblZ1ZSQyLnByb3RvdHlwZS4kbW91bnQgPSBmdW5jdGlvbiAoXG4gIGVsLFxuICBoeWRyYXRpbmdcbikge1xuICBlbCA9IGVsICYmIGluQnJvd3NlciA/IHF1ZXJ5KGVsKSA6IHVuZGVmaW5lZDtcbiAgcmV0dXJuIHRoaXMuX21vdW50KGVsLCBoeWRyYXRpbmcpXG59O1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJlxuICAgIGluQnJvd3NlciAmJiB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgY29uc29sZVtjb25zb2xlLmluZm8gPyAnaW5mbycgOiAnbG9nJ10oXG4gICAgXCJZb3UgYXJlIHJ1bm5pbmcgVnVlIGluIGRldmVsb3BtZW50IG1vZGUuXFxuXCIgK1xuICAgIFwiTWFrZSBzdXJlIHRvIHR1cm4gb24gcHJvZHVjdGlvbiBtb2RlIHdoZW4gZGVwbG95aW5nIGZvciBwcm9kdWN0aW9uLlxcblwiICtcbiAgICBcIlNlZSBtb3JlIHRpcHMgYXQgaHR0cHM6Ly92dWVqcy5vcmcvZ3VpZGUvZGVwbG95bWVudC5odG1sXCJcbiAgKTtcbn1cblxuLy8gZGV2dG9vbHMgZ2xvYmFsIGhvb2tcbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgaWYgKGNvbmZpZy5kZXZ0b29scykge1xuICAgIGlmIChkZXZ0b29scykge1xuICAgICAgZGV2dG9vbHMuZW1pdCgnaW5pdCcsIFZ1ZSQyKTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJlxuICAgICAgaW5Ccm93c2VyICYmICFpc0VkZ2UgJiYgL0Nocm9tZVxcL1xcZCsvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgKSB7XG4gICAgICBjb25zb2xlW2NvbnNvbGUuaW5mbyA/ICdpbmZvJyA6ICdsb2cnXShcbiAgICAgICAgJ0Rvd25sb2FkIHRoZSBWdWUgRGV2dG9vbHMgZXh0ZW5zaW9uIGZvciBhIGJldHRlciBkZXZlbG9wbWVudCBleHBlcmllbmNlOlxcbicgK1xuICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS1kZXZ0b29scydcbiAgICAgICk7XG4gICAgfVxuICB9XG59LCAwKTtcblxubW9kdWxlLmV4cG9ydHMgPSBWdWUkMjtcbiIsInZhciBpbnNlcnRlZCA9IGV4cG9ydHMuY2FjaGUgPSB7fVxuXG5mdW5jdGlvbiBub29wICgpIHt9XG5cbmV4cG9ydHMuaW5zZXJ0ID0gZnVuY3Rpb24gKGNzcykge1xuICBpZiAoaW5zZXJ0ZWRbY3NzXSkgcmV0dXJuIG5vb3BcbiAgaW5zZXJ0ZWRbY3NzXSA9IHRydWVcblxuICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgZWxlbS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKVxuXG4gIGlmICgndGV4dENvbnRlbnQnIGluIGVsZW0pIHtcbiAgICBlbGVtLnRleHRDb250ZW50ID0gY3NzXG4gIH0gZWxzZSB7XG4gICAgZWxlbS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3NcbiAgfVxuXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoZWxlbSlcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLnJlbW92ZUNoaWxkKGVsZW0pXG4gICAgaW5zZXJ0ZWRbY3NzXSA9IGZhbHNlXG4gIH1cbn1cbiIsIi8qKlxuICogdnVleCB2Mi4xLjFcbiAqIChjKSAyMDE2IEV2YW4gWW91XG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAoZ2xvYmFsLlZ1ZXggPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbnZhciBkZXZ0b29sSG9vayA9XG4gIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gIHdpbmRvdy5fX1ZVRV9ERVZUT09MU19HTE9CQUxfSE9PS19fXG5cbmZ1bmN0aW9uIGRldnRvb2xQbHVnaW4gKHN0b3JlKSB7XG4gIGlmICghZGV2dG9vbEhvb2spIHsgcmV0dXJuIH1cblxuICBzdG9yZS5fZGV2dG9vbEhvb2sgPSBkZXZ0b29sSG9va1xuXG4gIGRldnRvb2xIb29rLmVtaXQoJ3Z1ZXg6aW5pdCcsIHN0b3JlKVxuXG4gIGRldnRvb2xIb29rLm9uKCd2dWV4OnRyYXZlbC10by1zdGF0ZScsIGZ1bmN0aW9uICh0YXJnZXRTdGF0ZSkge1xuICAgIHN0b3JlLnJlcGxhY2VTdGF0ZSh0YXJnZXRTdGF0ZSlcbiAgfSlcblxuICBzdG9yZS5zdWJzY3JpYmUoZnVuY3Rpb24gKG11dGF0aW9uLCBzdGF0ZSkge1xuICAgIGRldnRvb2xIb29rLmVtaXQoJ3Z1ZXg6bXV0YXRpb24nLCBtdXRhdGlvbiwgc3RhdGUpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGFwcGx5TWl4aW4gKFZ1ZSkge1xuICB2YXIgdmVyc2lvbiA9IE51bWJlcihWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdKVxuXG4gIGlmICh2ZXJzaW9uID49IDIpIHtcbiAgICB2YXIgdXNlc0luaXQgPSBWdWUuY29uZmlnLl9saWZlY3ljbGVIb29rcy5pbmRleE9mKCdpbml0JykgPiAtMVxuICAgIFZ1ZS5taXhpbih1c2VzSW5pdCA/IHsgaW5pdDogdnVleEluaXQgfSA6IHsgYmVmb3JlQ3JlYXRlOiB2dWV4SW5pdCB9KVxuICB9IGVsc2Uge1xuICAgIC8vIG92ZXJyaWRlIGluaXQgYW5kIGluamVjdCB2dWV4IGluaXQgcHJvY2VkdXJlXG4gICAgLy8gZm9yIDEueCBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgICB2YXIgX2luaXQgPSBWdWUucHJvdG90eXBlLl9pbml0XG4gICAgVnVlLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICBpZiAoIG9wdGlvbnMgPT09IHZvaWQgMCApIG9wdGlvbnMgPSB7fTtcblxuICAgICAgb3B0aW9ucy5pbml0ID0gb3B0aW9ucy5pbml0XG4gICAgICAgID8gW3Z1ZXhJbml0XS5jb25jYXQob3B0aW9ucy5pbml0KVxuICAgICAgICA6IHZ1ZXhJbml0XG4gICAgICBfaW5pdC5jYWxsKHRoaXMsIG9wdGlvbnMpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZ1ZXggaW5pdCBob29rLCBpbmplY3RlZCBpbnRvIGVhY2ggaW5zdGFuY2VzIGluaXQgaG9va3MgbGlzdC5cbiAgICovXG5cbiAgZnVuY3Rpb24gdnVleEluaXQgKCkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy4kb3B0aW9uc1xuICAgIC8vIHN0b3JlIGluamVjdGlvblxuICAgIGlmIChvcHRpb25zLnN0b3JlKSB7XG4gICAgICB0aGlzLiRzdG9yZSA9IG9wdGlvbnMuc3RvcmVcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMucGFyZW50ICYmIG9wdGlvbnMucGFyZW50LiRzdG9yZSkge1xuICAgICAgdGhpcy4kc3RvcmUgPSBvcHRpb25zLnBhcmVudC4kc3RvcmVcbiAgICB9XG4gIH1cbn1cblxudmFyIG1hcFN0YXRlID0gbm9ybWFsaXplTmFtZXNwYWNlKGZ1bmN0aW9uIChuYW1lc3BhY2UsIHN0YXRlcykge1xuICB2YXIgcmVzID0ge31cbiAgbm9ybWFsaXplTWFwKHN0YXRlcykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgdmFyIGtleSA9IHJlZi5rZXk7XG4gICAgdmFyIHZhbCA9IHJlZi52YWw7XG5cbiAgICByZXNba2V5XSA9IGZ1bmN0aW9uIG1hcHBlZFN0YXRlICgpIHtcbiAgICAgIHZhciBzdGF0ZSA9IHRoaXMuJHN0b3JlLnN0YXRlXG4gICAgICB2YXIgZ2V0dGVycyA9IHRoaXMuJHN0b3JlLmdldHRlcnNcbiAgICAgIGlmIChuYW1lc3BhY2UpIHtcbiAgICAgICAgdmFyIG1vZHVsZSA9IHRoaXMuJHN0b3JlLl9tb2R1bGVzTmFtZXNwYWNlTWFwW25hbWVzcGFjZV1cbiAgICAgICAgaWYgKCFtb2R1bGUpIHtcbiAgICAgICAgICB3YXJuTmFtZXNwYWNlKCdtYXBTdGF0ZScsIG5hbWVzcGFjZSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBzdGF0ZSA9IG1vZHVsZS5zdGF0ZVxuICAgICAgICBnZXR0ZXJzID0gbW9kdWxlLmNvbnRleHQuZ2V0dGVyc1xuICAgICAgfVxuICAgICAgcmV0dXJuIHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyB2YWwuY2FsbCh0aGlzLCBzdGF0ZSwgZ2V0dGVycylcbiAgICAgICAgOiBzdGF0ZVt2YWxdXG4gICAgfVxuICB9KVxuICByZXR1cm4gcmVzXG59KVxuXG52YXIgbWFwTXV0YXRpb25zID0gbm9ybWFsaXplTmFtZXNwYWNlKGZ1bmN0aW9uIChuYW1lc3BhY2UsIG11dGF0aW9ucykge1xuICB2YXIgcmVzID0ge31cbiAgbm9ybWFsaXplTWFwKG11dGF0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgdmFyIGtleSA9IHJlZi5rZXk7XG4gICAgdmFyIHZhbCA9IHJlZi52YWw7XG5cbiAgICB2YWwgPSBuYW1lc3BhY2UgKyB2YWxcbiAgICByZXNba2V5XSA9IGZ1bmN0aW9uIG1hcHBlZE11dGF0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICB3aGlsZSAoIGxlbi0tICkgYXJnc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gICAgICByZXR1cm4gdGhpcy4kc3RvcmUuY29tbWl0LmFwcGx5KHRoaXMuJHN0b3JlLCBbdmFsXS5jb25jYXQoYXJncykpXG4gICAgfVxuICB9KVxuICByZXR1cm4gcmVzXG59KVxuXG52YXIgbWFwR2V0dGVycyA9IG5vcm1hbGl6ZU5hbWVzcGFjZShmdW5jdGlvbiAobmFtZXNwYWNlLCBnZXR0ZXJzKSB7XG4gIHZhciByZXMgPSB7fVxuICBub3JtYWxpemVNYXAoZ2V0dGVycykuZm9yRWFjaChmdW5jdGlvbiAocmVmKSB7XG4gICAgdmFyIGtleSA9IHJlZi5rZXk7XG4gICAgdmFyIHZhbCA9IHJlZi52YWw7XG5cbiAgICB2YWwgPSBuYW1lc3BhY2UgKyB2YWxcbiAgICByZXNba2V5XSA9IGZ1bmN0aW9uIG1hcHBlZEdldHRlciAoKSB7XG4gICAgICBpZiAoISh2YWwgaW4gdGhpcy4kc3RvcmUuZ2V0dGVycykpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcigoXCJbdnVleF0gdW5rbm93biBnZXR0ZXI6IFwiICsgdmFsKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLiRzdG9yZS5nZXR0ZXJzW3ZhbF1cbiAgICB9XG4gIH0pXG4gIHJldHVybiByZXNcbn0pXG5cbnZhciBtYXBBY3Rpb25zID0gbm9ybWFsaXplTmFtZXNwYWNlKGZ1bmN0aW9uIChuYW1lc3BhY2UsIGFjdGlvbnMpIHtcbiAgdmFyIHJlcyA9IHt9XG4gIG5vcm1hbGl6ZU1hcChhY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChyZWYpIHtcbiAgICB2YXIga2V5ID0gcmVmLmtleTtcbiAgICB2YXIgdmFsID0gcmVmLnZhbDtcblxuICAgIHZhbCA9IG5hbWVzcGFjZSArIHZhbFxuICAgIHJlc1trZXldID0gZnVuY3Rpb24gbWFwcGVkQWN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICB3aGlsZSAoIGxlbi0tICkgYXJnc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gICAgICByZXR1cm4gdGhpcy4kc3RvcmUuZGlzcGF0Y2guYXBwbHkodGhpcy4kc3RvcmUsIFt2YWxdLmNvbmNhdChhcmdzKSlcbiAgICB9XG4gIH0pXG4gIHJldHVybiByZXNcbn0pXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU1hcCAobWFwKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KG1hcClcbiAgICA/IG1hcC5tYXAoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gKHsga2V5OiBrZXksIHZhbDoga2V5IH0pOyB9KVxuICAgIDogT2JqZWN0LmtleXMobWFwKS5tYXAoZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gKHsga2V5OiBrZXksIHZhbDogbWFwW2tleV0gfSk7IH0pXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWVzcGFjZSAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChuYW1lc3BhY2UsIG1hcCkge1xuICAgIGlmICh0eXBlb2YgbmFtZXNwYWNlICE9PSAnc3RyaW5nJykge1xuICAgICAgbWFwID0gbmFtZXNwYWNlXG4gICAgICBuYW1lc3BhY2UgPSAnJ1xuICAgIH0gZWxzZSBpZiAobmFtZXNwYWNlLmNoYXJBdChuYW1lc3BhY2UubGVuZ3RoIC0gMSkgIT09ICcvJykge1xuICAgICAgbmFtZXNwYWNlICs9ICcvJ1xuICAgIH1cbiAgICByZXR1cm4gZm4obmFtZXNwYWNlLCBtYXApXG4gIH1cbn1cblxuZnVuY3Rpb24gd2Fybk5hbWVzcGFjZSAoaGVscGVyLCBuYW1lc3BhY2UpIHtcbiAgY29uc29sZS5lcnJvcigoXCJbdnVleF0gbW9kdWxlIG5hbWVzcGFjZSBub3QgZm91bmQgaW4gXCIgKyBoZWxwZXIgKyBcIigpOiBcIiArIG5hbWVzcGFjZSkpXG59XG5cbi8qKlxuICogZm9yRWFjaCBmb3Igb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGZvckVhY2hWYWx1ZSAob2JqLCBmbikge1xuICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gZm4ob2JqW2tleV0sIGtleSk7IH0pXG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0IChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0J1xufVxuXG5mdW5jdGlvbiBpc1Byb21pc2UgKHZhbCkge1xuICByZXR1cm4gdmFsICYmIHR5cGVvZiB2YWwudGhlbiA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5mdW5jdGlvbiBhc3NlcnQgKGNvbmRpdGlvbiwgbXNnKSB7XG4gIGlmICghY29uZGl0aW9uKSB7IHRocm93IG5ldyBFcnJvcigoXCJbdnVleF0gXCIgKyBtc2cpKSB9XG59XG5cbnZhciBNb2R1bGUgPSBmdW5jdGlvbiBNb2R1bGUgKHJhd01vZHVsZSwgcnVudGltZSkge1xuICB0aGlzLnJ1bnRpbWUgPSBydW50aW1lXG4gIHRoaXMuX2NoaWxkcmVuID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICB0aGlzLl9yYXdNb2R1bGUgPSByYXdNb2R1bGVcbn07XG5cbnZhciBwcm90b3R5cGVBY2Nlc3NvcnMkMSA9IHsgc3RhdGU6IHt9LG5hbWVzcGFjZWQ6IHt9IH07XG5cbnByb3RvdHlwZUFjY2Vzc29ycyQxLnN0YXRlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuX3Jhd01vZHVsZS5zdGF0ZSB8fCB7fVxufTtcblxucHJvdG90eXBlQWNjZXNzb3JzJDEubmFtZXNwYWNlZC5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAhIXRoaXMuX3Jhd01vZHVsZS5uYW1lc3BhY2VkXG59O1xuXG5Nb2R1bGUucHJvdG90eXBlLmFkZENoaWxkID0gZnVuY3Rpb24gYWRkQ2hpbGQgKGtleSwgbW9kdWxlKSB7XG4gIHRoaXMuX2NoaWxkcmVuW2tleV0gPSBtb2R1bGVcbn07XG5cbk1vZHVsZS5wcm90b3R5cGUucmVtb3ZlQ2hpbGQgPSBmdW5jdGlvbiByZW1vdmVDaGlsZCAoa2V5KSB7XG4gIGRlbGV0ZSB0aGlzLl9jaGlsZHJlbltrZXldXG59O1xuXG5Nb2R1bGUucHJvdG90eXBlLmdldENoaWxkID0gZnVuY3Rpb24gZ2V0Q2hpbGQgKGtleSkge1xuICByZXR1cm4gdGhpcy5fY2hpbGRyZW5ba2V5XVxufTtcblxuTW9kdWxlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUgKHJhd01vZHVsZSkge1xuICB0aGlzLl9yYXdNb2R1bGUubmFtZXNwYWNlZCA9IHJhd01vZHVsZS5uYW1lc3BhY2VkXG4gIGlmIChyYXdNb2R1bGUuYWN0aW9ucykge1xuICAgIHRoaXMuX3Jhd01vZHVsZS5hY3Rpb25zID0gcmF3TW9kdWxlLmFjdGlvbnNcbiAgfVxuICBpZiAocmF3TW9kdWxlLm11dGF0aW9ucykge1xuICAgIHRoaXMuX3Jhd01vZHVsZS5tdXRhdGlvbnMgPSByYXdNb2R1bGUubXV0YXRpb25zXG4gIH1cbiAgaWYgKHJhd01vZHVsZS5nZXR0ZXJzKSB7XG4gICAgdGhpcy5fcmF3TW9kdWxlLmdldHRlcnMgPSByYXdNb2R1bGUuZ2V0dGVyc1xuICB9XG59O1xuXG5Nb2R1bGUucHJvdG90eXBlLmZvckVhY2hDaGlsZCA9IGZ1bmN0aW9uIGZvckVhY2hDaGlsZCAoZm4pIHtcbiAgZm9yRWFjaFZhbHVlKHRoaXMuX2NoaWxkcmVuLCBmbilcbn07XG5cbk1vZHVsZS5wcm90b3R5cGUuZm9yRWFjaEdldHRlciA9IGZ1bmN0aW9uIGZvckVhY2hHZXR0ZXIgKGZuKSB7XG4gIGlmICh0aGlzLl9yYXdNb2R1bGUuZ2V0dGVycykge1xuICAgIGZvckVhY2hWYWx1ZSh0aGlzLl9yYXdNb2R1bGUuZ2V0dGVycywgZm4pXG4gIH1cbn07XG5cbk1vZHVsZS5wcm90b3R5cGUuZm9yRWFjaEFjdGlvbiA9IGZ1bmN0aW9uIGZvckVhY2hBY3Rpb24gKGZuKSB7XG4gIGlmICh0aGlzLl9yYXdNb2R1bGUuYWN0aW9ucykge1xuICAgIGZvckVhY2hWYWx1ZSh0aGlzLl9yYXdNb2R1bGUuYWN0aW9ucywgZm4pXG4gIH1cbn07XG5cbk1vZHVsZS5wcm90b3R5cGUuZm9yRWFjaE11dGF0aW9uID0gZnVuY3Rpb24gZm9yRWFjaE11dGF0aW9uIChmbikge1xuICBpZiAodGhpcy5fcmF3TW9kdWxlLm11dGF0aW9ucykge1xuICAgIGZvckVhY2hWYWx1ZSh0aGlzLl9yYXdNb2R1bGUubXV0YXRpb25zLCBmbilcbiAgfVxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIE1vZHVsZS5wcm90b3R5cGUsIHByb3RvdHlwZUFjY2Vzc29ycyQxICk7XG5cbnZhciBNb2R1bGVDb2xsZWN0aW9uID0gZnVuY3Rpb24gTW9kdWxlQ29sbGVjdGlvbiAocmF3Um9vdE1vZHVsZSkge1xuICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAvLyByZWdpc3RlciByb290IG1vZHVsZSAoVnVleC5TdG9yZSBvcHRpb25zKVxuICB0aGlzLnJvb3QgPSBuZXcgTW9kdWxlKHJhd1Jvb3RNb2R1bGUsIGZhbHNlKVxuXG4gIC8vIHJlZ2lzdGVyIGFsbCBuZXN0ZWQgbW9kdWxlc1xuICBpZiAocmF3Um9vdE1vZHVsZS5tb2R1bGVzKSB7XG4gICAgZm9yRWFjaFZhbHVlKHJhd1Jvb3RNb2R1bGUubW9kdWxlcywgZnVuY3Rpb24gKHJhd01vZHVsZSwga2V5KSB7XG4gICAgICB0aGlzJDEucmVnaXN0ZXIoW2tleV0sIHJhd01vZHVsZSwgZmFsc2UpXG4gICAgfSlcbiAgfVxufTtcblxuTW9kdWxlQ29sbGVjdGlvbi5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0IChwYXRoKSB7XG4gIHJldHVybiBwYXRoLnJlZHVjZShmdW5jdGlvbiAobW9kdWxlLCBrZXkpIHtcbiAgICByZXR1cm4gbW9kdWxlLmdldENoaWxkKGtleSlcbiAgfSwgdGhpcy5yb290KVxufTtcblxuTW9kdWxlQ29sbGVjdGlvbi5wcm90b3R5cGUuZ2V0TmFtZXNwYWNlID0gZnVuY3Rpb24gZ2V0TmFtZXNwYWNlIChwYXRoKSB7XG4gIHZhciBtb2R1bGUgPSB0aGlzLnJvb3RcbiAgcmV0dXJuIHBhdGgucmVkdWNlKGZ1bmN0aW9uIChuYW1lc3BhY2UsIGtleSkge1xuICAgIG1vZHVsZSA9IG1vZHVsZS5nZXRDaGlsZChrZXkpXG4gICAgcmV0dXJuIG5hbWVzcGFjZSArIChtb2R1bGUubmFtZXNwYWNlZCA/IGtleSArICcvJyA6ICcnKVxuICB9LCAnJylcbn07XG5cbk1vZHVsZUNvbGxlY3Rpb24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZSQxIChyYXdSb290TW9kdWxlKSB7XG4gIHVwZGF0ZSh0aGlzLnJvb3QsIHJhd1Jvb3RNb2R1bGUpXG59O1xuXG5Nb2R1bGVDb2xsZWN0aW9uLnByb3RvdHlwZS5yZWdpc3RlciA9IGZ1bmN0aW9uIHJlZ2lzdGVyIChwYXRoLCByYXdNb2R1bGUsIHJ1bnRpbWUpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcbiAgICBpZiAoIHJ1bnRpbWUgPT09IHZvaWQgMCApIHJ1bnRpbWUgPSB0cnVlO1xuXG4gIHZhciBwYXJlbnQgPSB0aGlzLmdldChwYXRoLnNsaWNlKDAsIC0xKSlcbiAgdmFyIG5ld01vZHVsZSA9IG5ldyBNb2R1bGUocmF3TW9kdWxlLCBydW50aW1lKVxuICBwYXJlbnQuYWRkQ2hpbGQocGF0aFtwYXRoLmxlbmd0aCAtIDFdLCBuZXdNb2R1bGUpXG5cbiAgLy8gcmVnaXN0ZXIgbmVzdGVkIG1vZHVsZXNcbiAgaWYgKHJhd01vZHVsZS5tb2R1bGVzKSB7XG4gICAgZm9yRWFjaFZhbHVlKHJhd01vZHVsZS5tb2R1bGVzLCBmdW5jdGlvbiAocmF3Q2hpbGRNb2R1bGUsIGtleSkge1xuICAgICAgdGhpcyQxLnJlZ2lzdGVyKHBhdGguY29uY2F0KGtleSksIHJhd0NoaWxkTW9kdWxlLCBydW50aW1lKVxuICAgIH0pXG4gIH1cbn07XG5cbk1vZHVsZUNvbGxlY3Rpb24ucHJvdG90eXBlLnVucmVnaXN0ZXIgPSBmdW5jdGlvbiB1bnJlZ2lzdGVyIChwYXRoKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzLmdldChwYXRoLnNsaWNlKDAsIC0xKSlcbiAgdmFyIGtleSA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXVxuICBpZiAoIXBhcmVudC5nZXRDaGlsZChrZXkpLnJ1bnRpbWUpIHsgcmV0dXJuIH1cblxuICBwYXJlbnQucmVtb3ZlQ2hpbGQoa2V5KVxufTtcblxuZnVuY3Rpb24gdXBkYXRlICh0YXJnZXRNb2R1bGUsIG5ld01vZHVsZSkge1xuICAvLyB1cGRhdGUgdGFyZ2V0IG1vZHVsZVxuICB0YXJnZXRNb2R1bGUudXBkYXRlKG5ld01vZHVsZSlcblxuICAvLyB1cGRhdGUgbmVzdGVkIG1vZHVsZXNcbiAgaWYgKG5ld01vZHVsZS5tb2R1bGVzKSB7XG4gICAgZm9yICh2YXIga2V5IGluIG5ld01vZHVsZS5tb2R1bGVzKSB7XG4gICAgICBpZiAoIXRhcmdldE1vZHVsZS5nZXRDaGlsZChrZXkpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICBcIlt2dWV4XSB0cnlpbmcgdG8gYWRkIGEgbmV3IG1vZHVsZSAnXCIgKyBrZXkgKyBcIicgb24gaG90IHJlbG9hZGluZywgXCIgK1xuICAgICAgICAgICdtYW51YWwgcmVsb2FkIGlzIG5lZWRlZCdcbiAgICAgICAgKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHVwZGF0ZSh0YXJnZXRNb2R1bGUuZ2V0Q2hpbGQoa2V5KSwgbmV3TW9kdWxlLm1vZHVsZXNba2V5XSlcbiAgICB9XG4gIH1cbn1cblxudmFyIFZ1ZSAvLyBiaW5kIG9uIGluc3RhbGxcblxudmFyIFN0b3JlID0gZnVuY3Rpb24gU3RvcmUgKG9wdGlvbnMpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG4gIGlmICggb3B0aW9ucyA9PT0gdm9pZCAwICkgb3B0aW9ucyA9IHt9O1xuXG4gIGFzc2VydChWdWUsIFwibXVzdCBjYWxsIFZ1ZS51c2UoVnVleCkgYmVmb3JlIGNyZWF0aW5nIGEgc3RvcmUgaW5zdGFuY2UuXCIpXG4gIGFzc2VydCh0eXBlb2YgUHJvbWlzZSAhPT0gJ3VuZGVmaW5lZCcsIFwidnVleCByZXF1aXJlcyBhIFByb21pc2UgcG9seWZpbGwgaW4gdGhpcyBicm93c2VyLlwiKVxuXG4gIHZhciBzdGF0ZSA9IG9wdGlvbnMuc3RhdGU7IGlmICggc3RhdGUgPT09IHZvaWQgMCApIHN0YXRlID0ge307XG4gIHZhciBwbHVnaW5zID0gb3B0aW9ucy5wbHVnaW5zOyBpZiAoIHBsdWdpbnMgPT09IHZvaWQgMCApIHBsdWdpbnMgPSBbXTtcbiAgdmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0OyBpZiAoIHN0cmljdCA9PT0gdm9pZCAwICkgc3RyaWN0ID0gZmFsc2U7XG5cbiAgLy8gc3RvcmUgaW50ZXJuYWwgc3RhdGVcbiAgdGhpcy5fY29tbWl0dGluZyA9IGZhbHNlXG4gIHRoaXMuX2FjdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHRoaXMuX211dGF0aW9ucyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgdGhpcy5fd3JhcHBlZEdldHRlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHRoaXMuX21vZHVsZXMgPSBuZXcgTW9kdWxlQ29sbGVjdGlvbihvcHRpb25zKVxuICB0aGlzLl9tb2R1bGVzTmFtZXNwYWNlTWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdXG4gIHRoaXMuX3dhdGNoZXJWTSA9IG5ldyBWdWUoKVxuXG4gIC8vIGJpbmQgY29tbWl0IGFuZCBkaXNwYXRjaCB0byBzZWxmXG4gIHZhciBzdG9yZSA9IHRoaXNcbiAgdmFyIHJlZiA9IHRoaXM7XG4gIHZhciBkaXNwYXRjaCA9IHJlZi5kaXNwYXRjaDtcbiAgdmFyIGNvbW1pdCA9IHJlZi5jb21taXQ7XG4gICAgdGhpcy5kaXNwYXRjaCA9IGZ1bmN0aW9uIGJvdW5kRGlzcGF0Y2ggKHR5cGUsIHBheWxvYWQpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2guY2FsbChzdG9yZSwgdHlwZSwgcGF5bG9hZClcbiAgfVxuICB0aGlzLmNvbW1pdCA9IGZ1bmN0aW9uIGJvdW5kQ29tbWl0ICh0eXBlLCBwYXlsb2FkLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIGNvbW1pdC5jYWxsKHN0b3JlLCB0eXBlLCBwYXlsb2FkLCBvcHRpb25zKVxuICAgIH1cblxuICAgIC8vIHN0cmljdCBtb2RlXG4gIHRoaXMuc3RyaWN0ID0gc3RyaWN0XG5cbiAgLy8gaW5pdCByb290IG1vZHVsZS5cbiAgLy8gdGhpcyBhbHNvIHJlY3Vyc2l2ZWx5IHJlZ2lzdGVycyBhbGwgc3ViLW1vZHVsZXNcbiAgLy8gYW5kIGNvbGxlY3RzIGFsbCBtb2R1bGUgZ2V0dGVycyBpbnNpZGUgdGhpcy5fd3JhcHBlZEdldHRlcnNcbiAgaW5zdGFsbE1vZHVsZSh0aGlzLCBzdGF0ZSwgW10sIHRoaXMuX21vZHVsZXMucm9vdClcblxuICAvLyBpbml0aWFsaXplIHRoZSBzdG9yZSB2bSwgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yIHRoZSByZWFjdGl2aXR5XG4gIC8vIChhbHNvIHJlZ2lzdGVycyBfd3JhcHBlZEdldHRlcnMgYXMgY29tcHV0ZWQgcHJvcGVydGllcylcbiAgcmVzZXRTdG9yZVZNKHRoaXMsIHN0YXRlKVxuXG4gIC8vIGFwcGx5IHBsdWdpbnNcbiAgcGx1Z2lucy5jb25jYXQoZGV2dG9vbFBsdWdpbikuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7IHJldHVybiBwbHVnaW4odGhpcyQxKTsgfSlcbn07XG5cbnZhciBwcm90b3R5cGVBY2Nlc3NvcnMgPSB7IHN0YXRlOiB7fSB9O1xuXG5wcm90b3R5cGVBY2Nlc3NvcnMuc3RhdGUuZ2V0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5fdm0uJGRhdGEuc3RhdGVcbn07XG5cbnByb3RvdHlwZUFjY2Vzc29ycy5zdGF0ZS5zZXQgPSBmdW5jdGlvbiAodikge1xuICBhc3NlcnQoZmFsc2UsIFwiVXNlIHN0b3JlLnJlcGxhY2VTdGF0ZSgpIHRvIGV4cGxpY2l0IHJlcGxhY2Ugc3RvcmUgc3RhdGUuXCIpXG59O1xuXG5TdG9yZS5wcm90b3R5cGUuY29tbWl0ID0gZnVuY3Rpb24gY29tbWl0IChfdHlwZSwgX3BheWxvYWQsIF9vcHRpb25zKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgLy8gY2hlY2sgb2JqZWN0LXN0eWxlIGNvbW1pdFxuICB2YXIgcmVmID0gdW5pZnlPYmplY3RTdHlsZShfdHlwZSwgX3BheWxvYWQsIF9vcHRpb25zKTtcbiAgICB2YXIgdHlwZSA9IHJlZi50eXBlO1xuICAgIHZhciBwYXlsb2FkID0gcmVmLnBheWxvYWQ7XG4gICAgdmFyIG9wdGlvbnMgPSByZWYub3B0aW9ucztcblxuICB2YXIgbXV0YXRpb24gPSB7IHR5cGU6IHR5cGUsIHBheWxvYWQ6IHBheWxvYWQgfVxuICB2YXIgZW50cnkgPSB0aGlzLl9tdXRhdGlvbnNbdHlwZV1cbiAgaWYgKCFlbnRyeSkge1xuICAgIGNvbnNvbGUuZXJyb3IoKFwiW3Z1ZXhdIHVua25vd24gbXV0YXRpb24gdHlwZTogXCIgKyB0eXBlKSlcbiAgICByZXR1cm5cbiAgfVxuICB0aGlzLl93aXRoQ29tbWl0KGZ1bmN0aW9uICgpIHtcbiAgICBlbnRyeS5mb3JFYWNoKGZ1bmN0aW9uIGNvbW1pdEl0ZXJhdG9yIChoYW5kbGVyKSB7XG4gICAgICBoYW5kbGVyKHBheWxvYWQpXG4gICAgfSlcbiAgfSlcbiAgdGhpcy5fc3Vic2NyaWJlcnMuZm9yRWFjaChmdW5jdGlvbiAoc3ViKSB7IHJldHVybiBzdWIobXV0YXRpb24sIHRoaXMkMS5zdGF0ZSk7IH0pXG5cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5zaWxlbnQpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBcIlt2dWV4XSBtdXRhdGlvbiB0eXBlOiBcIiArIHR5cGUgKyBcIi4gU2lsZW50IG9wdGlvbiBoYXMgYmVlbiByZW1vdmVkLiBcIiArXG4gICAgICAnVXNlIHRoZSBmaWx0ZXIgZnVuY3Rpb25hbGl0eSBpbiB0aGUgdnVlLWRldnRvb2xzJ1xuICAgIClcbiAgfVxufTtcblxuU3RvcmUucHJvdG90eXBlLmRpc3BhdGNoID0gZnVuY3Rpb24gZGlzcGF0Y2ggKF90eXBlLCBfcGF5bG9hZCkge1xuICAvLyBjaGVjayBvYmplY3Qtc3R5bGUgZGlzcGF0Y2hcbiAgdmFyIHJlZiA9IHVuaWZ5T2JqZWN0U3R5bGUoX3R5cGUsIF9wYXlsb2FkKTtcbiAgICB2YXIgdHlwZSA9IHJlZi50eXBlO1xuICAgIHZhciBwYXlsb2FkID0gcmVmLnBheWxvYWQ7XG5cbiAgdmFyIGVudHJ5ID0gdGhpcy5fYWN0aW9uc1t0eXBlXVxuICBpZiAoIWVudHJ5KSB7XG4gICAgY29uc29sZS5lcnJvcigoXCJbdnVleF0gdW5rbm93biBhY3Rpb24gdHlwZTogXCIgKyB0eXBlKSlcbiAgICByZXR1cm5cbiAgfVxuICByZXR1cm4gZW50cnkubGVuZ3RoID4gMVxuICAgID8gUHJvbWlzZS5hbGwoZW50cnkubWFwKGZ1bmN0aW9uIChoYW5kbGVyKSB7IHJldHVybiBoYW5kbGVyKHBheWxvYWQpOyB9KSlcbiAgICA6IGVudHJ5WzBdKHBheWxvYWQpXG59O1xuXG5TdG9yZS5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24gc3Vic2NyaWJlIChmbikge1xuICB2YXIgc3VicyA9IHRoaXMuX3N1YnNjcmliZXJzXG4gIGlmIChzdWJzLmluZGV4T2YoZm4pIDwgMCkge1xuICAgIHN1YnMucHVzaChmbilcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpID0gc3Vicy5pbmRleE9mKGZuKVxuICAgIGlmIChpID4gLTEpIHtcbiAgICAgIHN1YnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG59O1xuXG5TdG9yZS5wcm90b3R5cGUud2F0Y2ggPSBmdW5jdGlvbiB3YXRjaCAoZ2V0dGVyLCBjYiwgb3B0aW9ucykge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGFzc2VydCh0eXBlb2YgZ2V0dGVyID09PSAnZnVuY3Rpb24nLCBcInN0b3JlLndhdGNoIG9ubHkgYWNjZXB0cyBhIGZ1bmN0aW9uLlwiKVxuICByZXR1cm4gdGhpcy5fd2F0Y2hlclZNLiR3YXRjaChmdW5jdGlvbiAoKSB7IHJldHVybiBnZXR0ZXIodGhpcyQxLnN0YXRlLCB0aGlzJDEuZ2V0dGVycyk7IH0sIGNiLCBvcHRpb25zKVxufTtcblxuU3RvcmUucHJvdG90eXBlLnJlcGxhY2VTdGF0ZSA9IGZ1bmN0aW9uIHJlcGxhY2VTdGF0ZSAoc3RhdGUpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB0aGlzLl93aXRoQ29tbWl0KGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzJDEuX3ZtLnN0YXRlID0gc3RhdGVcbiAgfSlcbn07XG5cblN0b3JlLnByb3RvdHlwZS5yZWdpc3Rlck1vZHVsZSA9IGZ1bmN0aW9uIHJlZ2lzdGVyTW9kdWxlIChwYXRoLCByYXdNb2R1bGUpIHtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykgeyBwYXRoID0gW3BhdGhdIH1cbiAgYXNzZXJ0KEFycmF5LmlzQXJyYXkocGF0aCksIFwibW9kdWxlIHBhdGggbXVzdCBiZSBhIHN0cmluZyBvciBhbiBBcnJheS5cIilcbiAgdGhpcy5fbW9kdWxlcy5yZWdpc3RlcihwYXRoLCByYXdNb2R1bGUpXG4gIGluc3RhbGxNb2R1bGUodGhpcywgdGhpcy5zdGF0ZSwgcGF0aCwgdGhpcy5fbW9kdWxlcy5nZXQocGF0aCkpXG4gIC8vIHJlc2V0IHN0b3JlIHRvIHVwZGF0ZSBnZXR0ZXJzLi4uXG4gIHJlc2V0U3RvcmVWTSh0aGlzLCB0aGlzLnN0YXRlKVxufTtcblxuU3RvcmUucHJvdG90eXBlLnVucmVnaXN0ZXJNb2R1bGUgPSBmdW5jdGlvbiB1bnJlZ2lzdGVyTW9kdWxlIChwYXRoKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykgeyBwYXRoID0gW3BhdGhdIH1cbiAgYXNzZXJ0KEFycmF5LmlzQXJyYXkocGF0aCksIFwibW9kdWxlIHBhdGggbXVzdCBiZSBhIHN0cmluZyBvciBhbiBBcnJheS5cIilcbiAgICB0aGlzLl9tb2R1bGVzLnVucmVnaXN0ZXIocGF0aClcbiAgdGhpcy5fd2l0aENvbW1pdChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudFN0YXRlID0gZ2V0TmVzdGVkU3RhdGUodGhpcyQxLnN0YXRlLCBwYXRoLnNsaWNlKDAsIC0xKSlcbiAgICBWdWUuZGVsZXRlKHBhcmVudFN0YXRlLCBwYXRoW3BhdGgubGVuZ3RoIC0gMV0pXG4gIH0pXG4gIHJlc2V0U3RvcmUodGhpcylcbn07XG5cblN0b3JlLnByb3RvdHlwZS5ob3RVcGRhdGUgPSBmdW5jdGlvbiBob3RVcGRhdGUgKG5ld09wdGlvbnMpIHtcbiAgdGhpcy5fbW9kdWxlcy51cGRhdGUobmV3T3B0aW9ucylcbiAgcmVzZXRTdG9yZSh0aGlzKVxufTtcblxuU3RvcmUucHJvdG90eXBlLl93aXRoQ29tbWl0ID0gZnVuY3Rpb24gX3dpdGhDb21taXQgKGZuKSB7XG4gIHZhciBjb21taXR0aW5nID0gdGhpcy5fY29tbWl0dGluZ1xuICB0aGlzLl9jb21taXR0aW5nID0gdHJ1ZVxuICBmbigpXG4gIHRoaXMuX2NvbW1pdHRpbmcgPSBjb21taXR0aW5nXG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyggU3RvcmUucHJvdG90eXBlLCBwcm90b3R5cGVBY2Nlc3NvcnMgKTtcblxuZnVuY3Rpb24gcmVzZXRTdG9yZSAoc3RvcmUpIHtcbiAgc3RvcmUuX2FjdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHN0b3JlLl9tdXRhdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHN0b3JlLl93cmFwcGVkR2V0dGVycyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgc3RvcmUuX21vZHVsZXNOYW1lc3BhY2VNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHZhciBzdGF0ZSA9IHN0b3JlLnN0YXRlXG4gIC8vIGluaXQgYWxsIG1vZHVsZXNcbiAgaW5zdGFsbE1vZHVsZShzdG9yZSwgc3RhdGUsIFtdLCBzdG9yZS5fbW9kdWxlcy5yb290LCB0cnVlKVxuICAvLyByZXNldCB2bVxuICByZXNldFN0b3JlVk0oc3RvcmUsIHN0YXRlKVxufVxuXG5mdW5jdGlvbiByZXNldFN0b3JlVk0gKHN0b3JlLCBzdGF0ZSkge1xuICB2YXIgb2xkVm0gPSBzdG9yZS5fdm1cblxuICAvLyBiaW5kIHN0b3JlIHB1YmxpYyBnZXR0ZXJzXG4gIHN0b3JlLmdldHRlcnMgPSB7fVxuICB2YXIgd3JhcHBlZEdldHRlcnMgPSBzdG9yZS5fd3JhcHBlZEdldHRlcnNcbiAgdmFyIGNvbXB1dGVkID0ge31cbiAgZm9yRWFjaFZhbHVlKHdyYXBwZWRHZXR0ZXJzLCBmdW5jdGlvbiAoZm4sIGtleSkge1xuICAgIC8vIHVzZSBjb21wdXRlZCB0byBsZXZlcmFnZSBpdHMgbGF6eS1jYWNoaW5nIG1lY2hhbmlzbVxuICAgIGNvbXB1dGVkW2tleV0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiBmbihzdG9yZSk7IH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc3RvcmUuZ2V0dGVycywga2V5LCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHN0b3JlLl92bVtrZXldOyB9LFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSAvLyBmb3IgbG9jYWwgZ2V0dGVyc1xuICAgIH0pXG4gIH0pXG5cbiAgLy8gdXNlIGEgVnVlIGluc3RhbmNlIHRvIHN0b3JlIHRoZSBzdGF0ZSB0cmVlXG4gIC8vIHN1cHByZXNzIHdhcm5pbmdzIGp1c3QgaW4gY2FzZSB0aGUgdXNlciBoYXMgYWRkZWRcbiAgLy8gc29tZSBmdW5reSBnbG9iYWwgbWl4aW5zXG4gIHZhciBzaWxlbnQgPSBWdWUuY29uZmlnLnNpbGVudFxuICBWdWUuY29uZmlnLnNpbGVudCA9IHRydWVcbiAgc3RvcmUuX3ZtID0gbmV3IFZ1ZSh7XG4gICAgZGF0YTogeyBzdGF0ZTogc3RhdGUgfSxcbiAgICBjb21wdXRlZDogY29tcHV0ZWRcbiAgfSlcbiAgVnVlLmNvbmZpZy5zaWxlbnQgPSBzaWxlbnRcblxuICAvLyBlbmFibGUgc3RyaWN0IG1vZGUgZm9yIG5ldyB2bVxuICBpZiAoc3RvcmUuc3RyaWN0KSB7XG4gICAgZW5hYmxlU3RyaWN0TW9kZShzdG9yZSlcbiAgfVxuXG4gIGlmIChvbGRWbSkge1xuICAgIC8vIGRpc3BhdGNoIGNoYW5nZXMgaW4gYWxsIHN1YnNjcmliZWQgd2F0Y2hlcnNcbiAgICAvLyB0byBmb3JjZSBnZXR0ZXIgcmUtZXZhbHVhdGlvbi5cbiAgICBzdG9yZS5fd2l0aENvbW1pdChmdW5jdGlvbiAoKSB7XG4gICAgICBvbGRWbS5zdGF0ZSA9IG51bGxcbiAgICB9KVxuICAgIFZ1ZS5uZXh0VGljayhmdW5jdGlvbiAoKSB7IHJldHVybiBvbGRWbS4kZGVzdHJveSgpOyB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIGluc3RhbGxNb2R1bGUgKHN0b3JlLCByb290U3RhdGUsIHBhdGgsIG1vZHVsZSwgaG90KSB7XG4gIHZhciBpc1Jvb3QgPSAhcGF0aC5sZW5ndGhcbiAgdmFyIG5hbWVzcGFjZSA9IHN0b3JlLl9tb2R1bGVzLmdldE5hbWVzcGFjZShwYXRoKVxuXG4gIC8vIHJlZ2lzdGVyIGluIG5hbWVzcGFjZSBtYXBcbiAgaWYgKG5hbWVzcGFjZSkge1xuICAgIHN0b3JlLl9tb2R1bGVzTmFtZXNwYWNlTWFwW25hbWVzcGFjZV0gPSBtb2R1bGVcbiAgfVxuXG4gIC8vIHNldCBzdGF0ZVxuICBpZiAoIWlzUm9vdCAmJiAhaG90KSB7XG4gICAgdmFyIHBhcmVudFN0YXRlID0gZ2V0TmVzdGVkU3RhdGUocm9vdFN0YXRlLCBwYXRoLnNsaWNlKDAsIC0xKSlcbiAgICB2YXIgbW9kdWxlTmFtZSA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXVxuICAgIHN0b3JlLl93aXRoQ29tbWl0KGZ1bmN0aW9uICgpIHtcbiAgICAgIFZ1ZS5zZXQocGFyZW50U3RhdGUsIG1vZHVsZU5hbWUsIG1vZHVsZS5zdGF0ZSlcbiAgICB9KVxuICB9XG5cbiAgdmFyIGxvY2FsID0gbW9kdWxlLmNvbnRleHQgPSBtYWtlTG9jYWxDb250ZXh0KHN0b3JlLCBuYW1lc3BhY2UpXG5cbiAgbW9kdWxlLmZvckVhY2hNdXRhdGlvbihmdW5jdGlvbiAobXV0YXRpb24sIGtleSkge1xuICAgIHZhciBuYW1lc3BhY2VkVHlwZSA9IG5hbWVzcGFjZSArIGtleVxuICAgIHJlZ2lzdGVyTXV0YXRpb24oc3RvcmUsIG5hbWVzcGFjZWRUeXBlLCBtdXRhdGlvbiwgcGF0aClcbiAgfSlcblxuICBtb2R1bGUuZm9yRWFjaEFjdGlvbihmdW5jdGlvbiAoYWN0aW9uLCBrZXkpIHtcbiAgICB2YXIgbmFtZXNwYWNlZFR5cGUgPSBuYW1lc3BhY2UgKyBrZXlcbiAgICByZWdpc3RlckFjdGlvbihzdG9yZSwgbmFtZXNwYWNlZFR5cGUsIGFjdGlvbiwgbG9jYWwsIHBhdGgpXG4gIH0pXG5cbiAgbW9kdWxlLmZvckVhY2hHZXR0ZXIoZnVuY3Rpb24gKGdldHRlciwga2V5KSB7XG4gICAgdmFyIG5hbWVzcGFjZWRUeXBlID0gbmFtZXNwYWNlICsga2V5XG4gICAgcmVnaXN0ZXJHZXR0ZXIoc3RvcmUsIG5hbWVzcGFjZWRUeXBlLCBnZXR0ZXIsIGxvY2FsLCBwYXRoKVxuICB9KVxuXG4gIG1vZHVsZS5mb3JFYWNoQ2hpbGQoZnVuY3Rpb24gKGNoaWxkLCBrZXkpIHtcbiAgICBpbnN0YWxsTW9kdWxlKHN0b3JlLCByb290U3RhdGUsIHBhdGguY29uY2F0KGtleSksIGNoaWxkLCBob3QpXG4gIH0pXG59XG5cbi8qKlxuICogbWFrZSBsb2NhbGl6ZWQgZGlzcGF0Y2gsIGNvbW1pdCBhbmQgZ2V0dGVyc1xuICogaWYgdGhlcmUgaXMgbm8gbmFtZXNwYWNlLCBqdXN0IHVzZSByb290IG9uZXNcbiAqL1xuZnVuY3Rpb24gbWFrZUxvY2FsQ29udGV4dCAoc3RvcmUsIG5hbWVzcGFjZSkge1xuICB2YXIgbm9OYW1lc3BhY2UgPSBuYW1lc3BhY2UgPT09ICcnXG5cbiAgdmFyIGxvY2FsID0ge1xuICAgIGRpc3BhdGNoOiBub05hbWVzcGFjZSA/IHN0b3JlLmRpc3BhdGNoIDogZnVuY3Rpb24gKF90eXBlLCBfcGF5bG9hZCwgX29wdGlvbnMpIHtcbiAgICAgIHZhciBhcmdzID0gdW5pZnlPYmplY3RTdHlsZShfdHlwZSwgX3BheWxvYWQsIF9vcHRpb25zKVxuICAgICAgdmFyIHBheWxvYWQgPSBhcmdzLnBheWxvYWQ7XG4gICAgICB2YXIgb3B0aW9ucyA9IGFyZ3Mub3B0aW9ucztcbiAgICAgIHZhciB0eXBlID0gYXJncy50eXBlO1xuXG4gICAgICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMucm9vdCkge1xuICAgICAgICB0eXBlID0gbmFtZXNwYWNlICsgdHlwZVxuICAgICAgICBpZiAoIXN0b3JlLl9hY3Rpb25zW3R5cGVdKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcigoXCJbdnVleF0gdW5rbm93biBsb2NhbCBhY3Rpb24gdHlwZTogXCIgKyAoYXJncy50eXBlKSArIFwiLCBnbG9iYWwgdHlwZTogXCIgKyB0eXBlKSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc3RvcmUuZGlzcGF0Y2godHlwZSwgcGF5bG9hZClcbiAgICB9LFxuXG4gICAgY29tbWl0OiBub05hbWVzcGFjZSA/IHN0b3JlLmNvbW1pdCA6IGZ1bmN0aW9uIChfdHlwZSwgX3BheWxvYWQsIF9vcHRpb25zKSB7XG4gICAgICB2YXIgYXJncyA9IHVuaWZ5T2JqZWN0U3R5bGUoX3R5cGUsIF9wYXlsb2FkLCBfb3B0aW9ucylcbiAgICAgIHZhciBwYXlsb2FkID0gYXJncy5wYXlsb2FkO1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmdzLm9wdGlvbnM7XG4gICAgICB2YXIgdHlwZSA9IGFyZ3MudHlwZTtcblxuICAgICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLnJvb3QpIHtcbiAgICAgICAgdHlwZSA9IG5hbWVzcGFjZSArIHR5cGVcbiAgICAgICAgaWYgKCFzdG9yZS5fbXV0YXRpb25zW3R5cGVdKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcigoXCJbdnVleF0gdW5rbm93biBsb2NhbCBtdXRhdGlvbiB0eXBlOiBcIiArIChhcmdzLnR5cGUpICsgXCIsIGdsb2JhbCB0eXBlOiBcIiArIHR5cGUpKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0b3JlLmNvbW1pdCh0eXBlLCBwYXlsb2FkLCBvcHRpb25zKVxuICAgIH1cbiAgfVxuXG4gIC8vIGdldHRlcnMgb2JqZWN0IG11c3QgYmUgZ290dGVuIGxhemlseVxuICAvLyBiZWNhdXNlIHN0b3JlLmdldHRlcnMgd2lsbCBiZSBjaGFuZ2VkIGJ5IHZtIHVwZGF0ZVxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkobG9jYWwsICdnZXR0ZXJzJywge1xuICAgIGdldDogbm9OYW1lc3BhY2UgPyBmdW5jdGlvbiAoKSB7IHJldHVybiBzdG9yZS5nZXR0ZXJzOyB9IDogZnVuY3Rpb24gKCkgeyByZXR1cm4gbWFrZUxvY2FsR2V0dGVycyhzdG9yZSwgbmFtZXNwYWNlKTsgfVxuICB9KVxuXG4gIHJldHVybiBsb2NhbFxufVxuXG5mdW5jdGlvbiBtYWtlTG9jYWxHZXR0ZXJzIChzdG9yZSwgbmFtZXNwYWNlKSB7XG4gIHZhciBnZXR0ZXJzUHJveHkgPSB7fVxuXG4gIHZhciBzcGxpdFBvcyA9IG5hbWVzcGFjZS5sZW5ndGhcbiAgT2JqZWN0LmtleXMoc3RvcmUuZ2V0dGVycykuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgIC8vIHNraXAgaWYgdGhlIHRhcmdldCBnZXR0ZXIgaXMgbm90IG1hdGNoIHRoaXMgbmFtZXNwYWNlXG4gICAgaWYgKHR5cGUuc2xpY2UoMCwgc3BsaXRQb3MpICE9PSBuYW1lc3BhY2UpIHsgcmV0dXJuIH1cblxuICAgIC8vIGV4dHJhY3QgbG9jYWwgZ2V0dGVyIHR5cGVcbiAgICB2YXIgbG9jYWxUeXBlID0gdHlwZS5zbGljZShzcGxpdFBvcylcblxuICAgIC8vIEFkZCBhIHBvcnQgdG8gdGhlIGdldHRlcnMgcHJveHkuXG4gICAgLy8gRGVmaW5lIGFzIGdldHRlciBwcm9wZXJ0eSBiZWNhdXNlXG4gICAgLy8gd2UgZG8gbm90IHdhbnQgdG8gZXZhbHVhdGUgdGhlIGdldHRlcnMgaW4gdGhpcyB0aW1lLlxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnZXR0ZXJzUHJveHksIGxvY2FsVHlwZSwge1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBzdG9yZS5nZXR0ZXJzW3R5cGVdOyB9LFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIGdldHRlcnNQcm94eVxufVxuXG5mdW5jdGlvbiByZWdpc3Rlck11dGF0aW9uIChzdG9yZSwgdHlwZSwgaGFuZGxlciwgcGF0aCkge1xuICB2YXIgZW50cnkgPSBzdG9yZS5fbXV0YXRpb25zW3R5cGVdIHx8IChzdG9yZS5fbXV0YXRpb25zW3R5cGVdID0gW10pXG4gIGVudHJ5LnB1c2goZnVuY3Rpb24gd3JhcHBlZE11dGF0aW9uSGFuZGxlciAocGF5bG9hZCkge1xuICAgIGhhbmRsZXIoZ2V0TmVzdGVkU3RhdGUoc3RvcmUuc3RhdGUsIHBhdGgpLCBwYXlsb2FkKVxuICB9KVxufVxuXG5mdW5jdGlvbiByZWdpc3RlckFjdGlvbiAoc3RvcmUsIHR5cGUsIGhhbmRsZXIsIGxvY2FsLCBwYXRoKSB7XG4gIHZhciBlbnRyeSA9IHN0b3JlLl9hY3Rpb25zW3R5cGVdIHx8IChzdG9yZS5fYWN0aW9uc1t0eXBlXSA9IFtdKVxuICBlbnRyeS5wdXNoKGZ1bmN0aW9uIHdyYXBwZWRBY3Rpb25IYW5kbGVyIChwYXlsb2FkLCBjYikge1xuICAgIHZhciByZXMgPSBoYW5kbGVyKHtcbiAgICAgIGRpc3BhdGNoOiBsb2NhbC5kaXNwYXRjaCxcbiAgICAgIGNvbW1pdDogbG9jYWwuY29tbWl0LFxuICAgICAgZ2V0dGVyczogbG9jYWwuZ2V0dGVycyxcbiAgICAgIHN0YXRlOiBnZXROZXN0ZWRTdGF0ZShzdG9yZS5zdGF0ZSwgcGF0aCksXG4gICAgICByb290R2V0dGVyczogc3RvcmUuZ2V0dGVycyxcbiAgICAgIHJvb3RTdGF0ZTogc3RvcmUuc3RhdGVcbiAgICB9LCBwYXlsb2FkLCBjYilcbiAgICBpZiAoIWlzUHJvbWlzZShyZXMpKSB7XG4gICAgICByZXMgPSBQcm9taXNlLnJlc29sdmUocmVzKVxuICAgIH1cbiAgICBpZiAoc3RvcmUuX2RldnRvb2xIb29rKSB7XG4gICAgICByZXR1cm4gcmVzLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgc3RvcmUuX2RldnRvb2xIb29rLmVtaXQoJ3Z1ZXg6ZXJyb3InLCBlcnIpXG4gICAgICAgIHRocm93IGVyclxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJHZXR0ZXIgKHN0b3JlLCB0eXBlLCByYXdHZXR0ZXIsIGxvY2FsLCBwYXRoKSB7XG4gIGlmIChzdG9yZS5fd3JhcHBlZEdldHRlcnNbdHlwZV0pIHtcbiAgICBjb25zb2xlLmVycm9yKChcIlt2dWV4XSBkdXBsaWNhdGUgZ2V0dGVyIGtleTogXCIgKyB0eXBlKSlcbiAgICByZXR1cm5cbiAgfVxuICBzdG9yZS5fd3JhcHBlZEdldHRlcnNbdHlwZV0gPSBmdW5jdGlvbiB3cmFwcGVkR2V0dGVyIChzdG9yZSkge1xuICAgIHJldHVybiByYXdHZXR0ZXIoXG4gICAgICBnZXROZXN0ZWRTdGF0ZShzdG9yZS5zdGF0ZSwgcGF0aCksIC8vIGxvY2FsIHN0YXRlXG4gICAgICBsb2NhbC5nZXR0ZXJzLCAvLyBsb2NhbCBnZXR0ZXJzXG4gICAgICBzdG9yZS5zdGF0ZSwgLy8gcm9vdCBzdGF0ZVxuICAgICAgc3RvcmUuZ2V0dGVycyAvLyByb290IGdldHRlcnNcbiAgICApXG4gIH1cbn1cblxuZnVuY3Rpb24gZW5hYmxlU3RyaWN0TW9kZSAoc3RvcmUpIHtcbiAgc3RvcmUuX3ZtLiR3YXRjaCgnc3RhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgYXNzZXJ0KHN0b3JlLl9jb21taXR0aW5nLCBcIkRvIG5vdCBtdXRhdGUgdnVleCBzdG9yZSBzdGF0ZSBvdXRzaWRlIG11dGF0aW9uIGhhbmRsZXJzLlwiKVxuICB9LCB7IGRlZXA6IHRydWUsIHN5bmM6IHRydWUgfSlcbn1cblxuZnVuY3Rpb24gZ2V0TmVzdGVkU3RhdGUgKHN0YXRlLCBwYXRoKSB7XG4gIHJldHVybiBwYXRoLmxlbmd0aFxuICAgID8gcGF0aC5yZWR1Y2UoZnVuY3Rpb24gKHN0YXRlLCBrZXkpIHsgcmV0dXJuIHN0YXRlW2tleV07IH0sIHN0YXRlKVxuICAgIDogc3RhdGVcbn1cblxuZnVuY3Rpb24gdW5pZnlPYmplY3RTdHlsZSAodHlwZSwgcGF5bG9hZCwgb3B0aW9ucykge1xuICBpZiAoaXNPYmplY3QodHlwZSkgJiYgdHlwZS50eXBlKSB7XG4gICAgb3B0aW9ucyA9IHBheWxvYWRcbiAgICBwYXlsb2FkID0gdHlwZVxuICAgIHR5cGUgPSB0eXBlLnR5cGVcbiAgfVxuICByZXR1cm4geyB0eXBlOiB0eXBlLCBwYXlsb2FkOiBwYXlsb2FkLCBvcHRpb25zOiBvcHRpb25zIH1cbn1cblxuZnVuY3Rpb24gaW5zdGFsbCAoX1Z1ZSkge1xuICBpZiAoVnVlKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICdbdnVleF0gYWxyZWFkeSBpbnN0YWxsZWQuIFZ1ZS51c2UoVnVleCkgc2hvdWxkIGJlIGNhbGxlZCBvbmx5IG9uY2UuJ1xuICAgIClcbiAgICByZXR1cm5cbiAgfVxuICBWdWUgPSBfVnVlXG4gIGFwcGx5TWl4aW4oVnVlKVxufVxuXG4vLyBhdXRvIGluc3RhbGwgaW4gZGlzdCBtb2RlXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZ1ZSkge1xuICBpbnN0YWxsKHdpbmRvdy5WdWUpXG59XG5cbnZhciBpbmRleCA9IHtcbiAgU3RvcmU6IFN0b3JlLFxuICBpbnN0YWxsOiBpbnN0YWxsLFxuICB2ZXJzaW9uOiAnMi4xLjEnLFxuICBtYXBTdGF0ZTogbWFwU3RhdGUsXG4gIG1hcE11dGF0aW9uczogbWFwTXV0YXRpb25zLFxuICBtYXBHZXR0ZXJzOiBtYXBHZXR0ZXJzLFxuICBtYXBBY3Rpb25zOiBtYXBBY3Rpb25zXG59XG5cbnJldHVybiBpbmRleDtcblxufSkpKTsiLCJpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcclxuaW1wb3J0IFZ1ZVJvdXRlciBmcm9tICd2dWUtcm91dGVyJ1xyXG5pbXBvcnQgVnVlUmVzb3VyY2UgZnJvbSAndnVlLXJlc291cmNlJztcclxuXHJcbmltcG9ydCBBcHAgZnJvbSAnLi92dWVzL0FwcC52dWUnXHJcbmltcG9ydCB7cm91dGVzfSBmcm9tICcuL3JvdXRlcydcclxuaW1wb3J0IHN0b3JlIGZyb20gJy4vc3RvcmUvc3RvcmUnXHJcblxyXG5WdWUudXNlKFZ1ZVJvdXRlcilcclxuVnVlLnVzZShWdWVSZXNvdXJjZSlcclxuXHJcblZ1ZS5odHRwLm9wdGlvbnMucm9vdCA9ICdodHRwczovL2Ntc3QzODUtYWNjZXNzaWJpbGl0eS5maXJlYmFzZWlvLmNvbS8nXHJcblxyXG5jb25zdCByb3V0ZXIgPSBuZXcgVnVlUm91dGVyKHtcclxuICBtb2RlOiAnaGlzdG9yeScsXHJcbiAgcm91dGVzXHJcbn0pXHJcblxyXG5uZXcgVnVlKHtcclxuICBlbDogJyNhcHAnLFxyXG4gIHJvdXRlcixcclxuICBzdG9yZSxcclxuICByZW5kZXI6IGggPT4gaChBcHApXHJcbn0pXHJcbiIsImltcG9ydCBIb21lIGZyb20gJy4vdnVlcy9Ib21lLnZ1ZSc7XHJcbmltcG9ydCBDbGFzcyBmcm9tICcuL3Z1ZXMvQ2xhc3Nlcy9DbGFzcy52dWUnO1xyXG5pbXBvcnQgQ2xhc3NlcyBmcm9tICcuL3Z1ZXMvQ2xhc3Nlcy9DbGFzc2VzLnZ1ZSc7XHJcbmltcG9ydCBBYm91dCBmcm9tICcuL3Z1ZXMvQWJvdXQudnVlJ1xyXG5cclxuZXhwb3J0IGNvbnN0IHJvdXRlcyA9IFtcclxuICB7IHBhdGg6ICcvJywgY29tcG9uZW50OiBIb21lIH0sXHJcbiAgeyBwYXRoOiAnL2NsYXNzJywgY29tcG9uZW50OiBDbGFzcyB9LFxyXG4gIHsgcGF0aDogJy9jbGFzc2VzJywgY29tcG9uZW50OiBDbGFzc2VzIH0sXHJcbiAgeyBwYXRoOiAnL2Fib3V0JywgY29tcG9uZW50OiBBYm91dCB9XHJcbl0iLCJjb25zdCBzdGF0ZSA9IHtcclxuICBjbGFzc2VzOiB7fVxyXG59XHJcblxyXG5jb25zdCBnZXR0ZXJzID0ge1xyXG4gIGdldENsYXNzZXM6IHN0YXRlID0+IHN0YXRlLmNsYXNzZXMsXHJcbiAgZ2V0Q2xhc3M6IChzdGF0ZSwga2V5KSA9PiBzdGF0ZS5jbGFzc2VzW2tleV1cclxufVxyXG5cclxuY29uc3QgbXV0YXRpb25zID0ge1xyXG4gIHNldENsYXNzZXM6IChzdGF0ZSwgY2xhc3NlcykgPT4gc3RhdGUuY2xhc3NlcyA9IGNsYXNzZXMsXHJcbn1cclxuXHJcbmNvbnN0IGFjdGlvbnMgPSB7XHJcbiAgaW5pdENsYXNzZXM6ICh7Y29tbWl0fSkgPT4ge1xyXG4gICAgY29tbWl0KCdsb2FkRGF0YScsICdDbGFzc2VzJylcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtzdGF0ZSwgZ2V0dGVycywgbXV0YXRpb25zLCBhY3Rpb25zfSIsImltcG9ydCBWdWUgZnJvbSAndnVlJztcclxuaW1wb3J0IFZ1ZXggZnJvbSAndnVleCc7XHJcblxyXG5pbXBvcnQge2NsYXNzZXN9IGZyb20gJy4vbW9kdWxlcy9jbGFzc2VzJ1xyXG5cclxuVnVlLnVzZShWdWV4KVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgbmV3IFZ1ZXguU3RvcmUoe1xyXG4gIGFjdGlvbnM6IHtcclxuICAgIGxvYWREYXRhOiAoe2NvbW1pdH0sIGRhdGFTb3VyY2UpID0+IHtcclxuICAgICAgVnVlLmh0dHAuZ2V0KGRhdGFTb3VyY2UgKyAnLmpzb24nKVxyXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLmpzb24oKSlcclxuICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgIGlmKGRhdGEpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tzdG9yZV0gbG9hZERhdGEgLSBkYXRhIHJldHVybmVkJywgZGF0YVNvdXJjZSwgZGF0YSlcclxuICAgICAgICAgICAgc3dpdGNoKGRhdGFTb3VyY2UpIHtcclxuICAgICAgICAgICAgICBjYXNlICdDbGFzc2VzJzpcclxuICAgICAgICAgICAgICAgIGNvbW1pdCgnc2V0Q2xhc3NlcycsIGRhdGEpXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgfSxcclxuICBtb2R1bGVzOiB7Y2xhc3Nlc31cclxufSkiLCI8dGVtcGxhdGU+PC90ZW1wbGF0ZT5cclxuPHNjcmlwdD48L3NjcmlwdD4iLCI8dGVtcGxhdGU+XHJcbiAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XHJcbiAgICAgICAgPGFwcC1oZWFkZXI+PC9hcHAtaGVhZGVyPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj48ZGl2IGNsYXNzPVwiY29sLXhzLTEyXCI+XHJcbiAgICAgICAgICAgIDx0cmFuc2l0aW9uIG5hbWU9XCJzbGlkZVwiIG1vZGU9XCJvdXQtaW5cIj5cclxuICAgICAgICAgICAgICAgIDxyb3V0ZXItdmlldz48L3JvdXRlci12aWV3PlxyXG4gICAgICAgICAgICA8L3RyYW5zaXRpb24+XHJcbiAgICAgICAgPC9kaXY+PC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiPlxyXG4gICAgaW1wb3J0IEhlYWRlciBmcm9tICcuL0hlYWRlci52dWUnXHJcblxyXG4gICAgZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgICAgIGNvbXBvbmVudHM6IHtcclxuICAgICAgICAgICAgYXBwSGVhZGVyOiBIZWFkZXJcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWF0ZWQoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJHN0b3JlLmRpc3BhdGNoKCdpbml0Q2xhc3NlcycpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG48L3NjcmlwdD5cclxuXHJcbjxzdHlsZT5cclxuICAgIGJvZHkge1xyXG4gICAgICAgIHBhZGRpbmc6IDV2bWluO1xyXG4gICAgfVxyXG5cclxuICAgIC5zbGlkZS1lbnRlci1hY3RpdmUgeyBhbmltYXRpb246IHNsaWRlLWluIDIwMG1zIGVhc2Utb3V0IGZvcndhcmRzIH1cclxuICAgIC5zbGlkZS1sZWF2ZS1hY3RpdmUgeyBhbmltYXRpb246IHNsaWRlLW91dCAyMDBtcyBlYXNlLW91dCBmb3J3YXJkcyB9XHJcbiAgICBAa2V5ZnJhbWVzIHNsaWRlLWluIHtcclxuICAgICAgICBmcm9tIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0zMHZtaW4pOyBvcGFjaXR5OiAwIH1cclxuICAgICAgICB0byB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwcHgpOyBvcGFjaXR5OiAxfVxyXG4gICAgfVxyXG4gICAgQGtleWZyYW1lcyBzbGlkZS1vdXQge1xyXG4gICAgICAgIGZyb20geyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMHB4KTsgb3BhY2l0eTogMSB9XHJcbiAgICAgICAgdG8geyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTMwdm1pbik7IG9wYWNpdHk6IDB9XHJcbiAgICB9XHJcbjwvc3R5bGU+XHJcbiIsIjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwiaW5uZXIgY29udGFpbmVyIGNvbC1zbS02IGNvbC1tZC00XCI+XHJcbiAgICA8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtcHJpbWFyeVwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwicGFuZWwtaGVhZGluZ1wiPlxyXG4gICAgICAgIDxoMyBjbGFzcz1cInBhbmVsLXRpdGxlXCI+e3tfY2xhc3MudGl0bGV9fSA8c21hbGw+KHt7bmFtZX19KTwvc21hbGw+PC9oMz5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+XHJcbiAgICAgICAgPGRpdiB2LWJpbmQ6Y2xhc3M9XCJoYXNSaWdodFBhbmU/ICdwdWxsLWxlZnQnIDogJydcIj5cclxuICAgICAgICAgIDxwIGNsYXNzPVwiZGVzY3JpcHRpb25cIj57e19jbGFzcy5kZXNjcmlwdGlvbn19PC9wPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwdWxsLXJpZ2h0XCI+XHJcbiAgICAgICAgICA8dWw+XHJcbiAgICAgICAgICAgIDxsaSB2LWZvcj1cIihyZXF1aXJlbWVudCwgaW5kZXgpIGluIF9jbGFzcy5yZXF1aXJlbWVudHNcIiB2LWJpbmQ6Y2xhc3M9XCJpbmRleD09PTA/J2xpc3QtZ3JvdXAtaXRlbS1kYW5nZXInOicnXCI+XHJcbiAgICAgICAgICAgICAgPGJpZyB2LXNob3c9XCJpbmRleCA9PT0gMFwiPlJlcXVpcmVtZW50czo8L2JpZz4gXHJcbiAgICAgICAgICAgICAge3tleHBhbmQocmVxdWlyZW1lbnQpfX08L2xpPlxyXG4gICAgICAgICAgICA8bGkgdi1mb3I9XCIocmVjb21tZW5kZWQsIGluZGV4KSBpbiBfY2xhc3MucmVjb21tZW5kZWRcIiB2LWJpbmQ6Y2xhc3M9XCJpbmRleD09PTA/J2xpc3QtZ3JvdXAtaXRlbS1pbmZvJzonJ1wiPlxyXG4gICAgICAgICAgICAgIDxiaWcgdi1zaG93PVwiaW5kZXggPT09IDBcIj5SZWNvbW1lbmRlZDo8L2JpZz4gXHJcbiAgICAgICAgICAgICAge3tleHBhbmQocmVjb21tZW5kZWQpfX08L2xpPlxyXG4gICAgICAgICAgICA8bGkgdi1mb3I9XCIoZXF1aXZhbGVuY3ksIGluZGV4KSBpbiBfY2xhc3MuZXF1aXZhbGVuY2llc1wiIHYtYmluZDpjbGFzcz1cImluZGV4PT09MD8nbGlzdC1ncm91cC1pdGVtLXdhcm5pbmcnOicnXCI+XHJcbiAgICAgICAgICAgICAgPGJpZyB2LXNob3c9XCJpbmRleCA9PT0gMFwiPkVxdWl2YWxlbmNpZXM6PC9iaWc+IFxyXG4gICAgICAgICAgICAgIHt7Z2V0TmFtZShlcXVpdmFsZW5jeSl9fTwvbGk+XHJcbiAgICAgICAgICA8L3VsPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPGRpdiBjbGFzcz1cImluZm8tYm94IGxpc3QtZ3JvdXAtaXRlbS1zdWNjZXNzXCIgdi1zaG93PVwiX2NsYXNzLnVybFwiPlxyXG4gICAgICAgIDxhIHYtYmluZDpocmVmPVwiX2NsYXNzLnVybFwiIGNsYXNzPVwiXCIgdGFyZ2V0PVwiX2JsYW5rXCI+VmlldyBPbmxpbmU8L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIj5cclxuICBleHBvcnQgZGVmYXVsdCB7XHJcbiAgICBwcm9wczogWydfY2xhc3MnXSxcclxuICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgIG5hbWUoKSB7XHJcbiAgICAgICAgX2NsYXNzLmRlcGFydG1lbnQgKyAnICcgKyBfY2xhc3MubnVtYmVyXHJcbiAgICAgIH0sXHJcbiAgICAgIGhhc1JpZ2h0UGFuZSgpIHtcclxuICAgICAgICByZXR1cm4gX2NsYXNzLnJlcXVpcmVtZW50cyB8fCBfY2xhc3MucmVjb21tZW5kZWQgfHwgX2NsYXNzLmVxdWl2YWxlbmNpZXNcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIG1ldGhvZHM6IHtcclxuICAgICAgZ2V0TmFtZShfY2xhc3MpIHtcclxuICAgICAgICByZXR1cm4gX2NsYXNzLmRlcGFydG1lbnQgKyAnICcgKyBfY2xhc3MubnVtYmVyXHJcbiAgICAgIH0sXHJcbiAgICAgIGV4cGFuZChfZW50cnkpIHtcclxuICAgICAgICByZXR1cm4gX2VudHJ5Lm1hcCh2ID0+IFxyXG4gICAgICAgICAgKHYuY29uc3RydWN0b3IgPT09IEFycmF5KT8gZXhwYW5kKHYpOiBnZXROYW1lKHYpKVxyXG4gICAgICAgIC5qb2luKCcgb3IgJylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGU+XHJcbi5pbmZvLWJveCB7XHJcbiAgbWFyZ2luOiAxZW07XHJcbiAgcGFkZGluZzogMWVtO1xyXG59XHJcbjwvc3R5bGU+IiwiPHRlbXBsYXRlPlxyXG4gIDxkaXYgaWQ9XCJjb250YWluZXJcIiBjbGFzcz1cIm91dGVyIGNvbnRhaW5lclwiPlxyXG4gICAgPGgxPkNsYXNzZXM8L2gxPlxyXG4gICAgPGFwcC1jbGFzcyB2LWZvcj1cIl9jbGFzcyBpbiBjbGFzc2VzXCIgdi1iaW5kOl9jbGFzcz1cIl9jbGFzc1wiPjwvYXBwLWNsYXNzPlxyXG4gIDwvZGl2PlxyXG48L3RlbXBsYXRlPlxyXG5cclxuPHNjcmlwdCB0eXBlPVwidGV4dC9qYXZhc2NyaXB0XCI+XHJcbiAgaW1wb3J0IENsYXNzIGZyb20gJy4vQ2xhc3MudnVlJ1xyXG5cclxuICBleHBvcnQgZGVmYXVsdCB7XHJcbiAgICBjb21wb25lbnRzOiB7XHJcbiAgICAgIGFwcENsYXNzOiBDbGFzc1xyXG4gICAgfSxcclxuICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgIGNsYXNzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLiRzdG9yZS5nZXR0ZXJzLmdldENsYXNzZXNcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuPC9zY3JpcHQ+IiwiPHRlbXBsYXRlPlxyXG4gIDxkaXYgaWQ9XCJjb250YWluZXJcIiBjbGFzcz1cIm91dGVyIGNvbnRhaW5lclwiPlxyXG4gICAgPG5hdiBjbGFzcz1cIm5hdmJhciBuYXZiYXItZGVmYXVsdFwiPlxyXG4gICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyLWZsdWlkXCI+XHJcbiAgICAgICAgPCEtLSBCcmFuZCBhbmQgdG9nZ2xlIGdldCBncm91cGVkIGZvciBiZXR0ZXIgbW9iaWxlIGRpc3BsYXkgLS0+XHJcbiAgICAgICAgPGRpdiBjbGFzcz1cIm5hdmJhci1oZWFkZXJcIj5cclxuICAgICAgICAgIDxyb3V0ZXItbGluayB0bz1cIi9cIiBjbGFzcz1cIm5hdmJhci1icmFuZFwiPkNNU1QgMzg1IC0gQWNjZXNzaWJpbGl0eTwvcm91dGVyLWxpbms+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDwhLS0gQ29sbGVjdCB0aGUgbmF2IGxpbmtzLCBmb3JtcywgYW5kIG90aGVyIGNvbnRlbnQgZm9yIHRvZ2dsaW5nIC0tPlxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2xsYXBzZSBuYXZiYXItY29sbGFwc2VcIj5cclxuICAgICAgICAgIDx1bCBjbGFzcz1cIm5hdiBuYXZiYXItbmF2XCI+XHJcbiAgICAgICAgICAgIDxyb3V0ZXItbGluayB0bz1cIi9jbGFzc2VzXCIgYWN0aXZlLWNsYXNzPVwiYWN0aXZlXCIgdGFnPVwibGlcIj48YT5DbGFzc2VzPC9hPjwvcm91dGVyLWxpbms+XHJcbiAgICAgICAgICAgIDxyb3V0ZXItbGluayB0bz1cIi9hYm91dFwiIGFjdGl2ZS1jbGFzcz1cImFjdGl2ZVwiIHRhZz1cImxpXCI+PGE+QWJvdXQ8L2E+PC9yb3V0ZXItbGluaz5cclxuICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9uYXY+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIj5cclxuPC9zY3JpcHQ+XHJcblxyXG48c3R5bGU+PC9zdHlsZT4iLCI8dGVtcGxhdGU+XHJcbiAgPGRpdiBpZD1cImNvbnRhaW5lclwiIGNsYXNzPVwib3V0ZXIgY29udGFpbmVyXCI+XHJcbiAgICA8aDE+Q01TVCAzODUgLSBBY2Nlc3NpYmlsaXR5PC9oMT5cclxuICAgIDxoNj5mb3IgRVhDTCAzMDEgLSBzdXBwb3J0aW5nIGV2aWRlbmNlIGZvciBEZW1vbnN0cmF0aW9uIG9mIExlYXJuaW5nOiBDTVNUIDM4NTwvaDY+XHJcbiAgICA8aDY+U3VwcG9ydGluZyBFdmlkZW5jZSBvZiBBY2Nlc3NpYmlsaXR5PC9oNj5cclxuICAgIDxociAvPlxyXG4gICAgPHJvdXRlci1saW5rIHRvPScvYWJvdXQnPlNlZSB3aGF0IGdvZXMgaW50byBhY2Nlc3NpYmlsaXR5IGF0IHRoaXMgc2l0ZTwvcm91dGVyLWxpbms+XHJcbiAgPC9kaXY+XHJcbjwvdGVtcGxhdGU+XHJcblxyXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIj5cclxuPC9zY3JpcHQ+Il19
