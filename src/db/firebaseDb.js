import FirebaseREST from 'firebase-rest'
import config from 'config'

/* FirebaseDb is a specific Model Db Firebase object. It receives REST calls
   and converts them to firebase REST calls, executes them on a firebase 
   connection, returning the result or erroring out if there is an error. this
   could be swapped out with a similar one for MongoDB, etc */
class FirebaseDb {
  constructor() {}

  async tx(command, pathRef, pathFinal, payload, queryParams) {
    console.log(arguments)
    let path = pathRef
    if(pathFinal)
      path += pathFinal

    const dbcmd = FirebaseDb.db[FirebaseDb.fbcrest[command]].bind(FirebaseDb.db)
    const unary = (command === 'get' || command === 'delete')
    const operation = await (unary?
      dbcmd(path, queryParams): 
      dbcmd(path, payload, queryParams))
    
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