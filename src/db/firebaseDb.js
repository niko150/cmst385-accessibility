import FirebaseREST from 'firebase-rest'
import config from 'config'

/* ModelDb is a specific ModelDb Firebase object. It receives REST calls
   and converts them to firebase REST calls, executes them on a firebase 
   connection, returning the result or erroring out if there is an error. this
   could be swapped out with a similar one for MongoDB, etc */
class FirebaseDb {
  constructor() {}

  async tx(command, path, payload, queryParams) {
    const dbcmd = FirebaseDb.db[FirebaseDb.fbcrest[command]]
    const unary = (command === 'get' || commmand === 'delete')
    const operation = await (unary? dbcmd(path): dbcmd(path, payload))

    if(!operation.ok)
      throw new Error(`[FirebaseDb] ${FirebaseDb.fbcrest[command]} - error with TX. (status ${operation.status}: ${operation.statusText})`)

    return operation.body
  }

}
FirebaseDb.fbcrest = {
  get: 'get',
  put: 'set',
  patch: 'update',
  post: 'push',
  delete: 'remove'
}
FirebaseDb.db = new FirebaseREST.JSONClient(
  'https://'+config.firebase.project+'.firebaseio.com', 
  { auth: config.firebase.auth })

export default FirebaseDb