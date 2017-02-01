import ty from 'then-yield'
import md5 from 'md5'
import Promise from 'bluebird'
const fs = Promise.promisifyAll(require('fs'));

const serverCredentials = ty.spawn(function* () {
  let src
  try {
    src = yield fs.readFileAsync('./serverCredentials.json','utf8')
  } catch(e) {
    console.error('Error when opening serverCredentials file: ' + e.message);
    throw e
  }
  return JSON.parse(src)
})

export {serverCredentials}