var babel = require("babel-core");

module.exports = {
  debug: true,
  customCompilers: {
    // for tags with lang="es6"
    es6: function (content, cb, compiler, filePath) {
      // content:  content extracted from lang="es6" blocks
      // cb:       the callback to call when you're done compiling
      // compiler: the vueify compiler instance
      // filePath: the path for the file being compiled
      //
      // compile some ES6... and when you're done:
      console.log('processing ' + filePath)
      const babelified = babel.transform(content)
      cb(null, babelified.code)
    }
  }
}