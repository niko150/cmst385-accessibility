import firebase from 'firebase'
import config from 'config'

firebase.initializeApp(config.firebase.initializeConfig);
firebase.auth().signInWithCustomToken(config.firebase.authCustomToken)

/* FirebaseDb is a specific Model Db Firebase object. It receives REST calls
   and converts them to firebase REST calls, executes them on a firebase 
   connection, returning the result or erroring out if there is an error. this
   could be swapped out with a similar one for MongoDB, etc */
class FirebaseDb {
  constructor() {}

  async tx(command, pathRef, pathFinal, payload, queryParams) {
    let path = pathRef
    if(pathFinal)
      path += pathFinal

    let txrPromise
    switch (command) {
      case 'get':
        txrPromise = firebase.database().ref(path).once('value')
        break
      case 'put':
        txrPromise = firebase.database().ref(path).set(payload)
        break
      case 'patch':
        txrPromise = firebase.database().ref(path).update(payload)
        break
      case 'post':
        txrPromise = firebase.database().ref(path).push(payload)
        break
      case 'delete':
        txrPromise = firebase.database().ref(path).remove()
        break
    }
    return await txrPromise
      .then(snapshot => snapshot.val())
      .catch(e => { 
        throw new Error(
`[FirebaseDb] ${FirebaseDb.fbcrest[command]} - error with firebase. (reason: ${e.code}), ${command}, ${path}, ${payload}, ${JSON.stringify(queryParams)}`)
      })
  }

}
FirebaseDb.fbcrest = {
  get: 'get',
  put: 'set',
  patch: 'update',
  post: 'push',
  delete: 'remove'
}

export default FirebaseDb