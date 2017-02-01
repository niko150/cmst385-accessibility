import restFirebase from './restful-firebase'
import config from 'config'

/* FirebaseDb is a specific Model Db Firebase object. It receives REST calls
   and converts them to firebase REST calls, executes them on a firebase 
   connection, returning the result or erroring out if there is an error. this
   could be swapped out with a similar one for MongoDB, etc */
class FirebaseDb {
  constructor() {}

  async tx(command, path, payload, queryParams) {
    const dbcmd = FirebaseDb.ref[FirebaseDb.fbcrest[command]]
    const unary = (command === 'get' || commmand === 'delete')
    const operation = await (unary?
      dbcmd(path, queryParams):
      dbcmd(path, payload, queryParams))
    // const res = await new Promise((r,e)=>setTimeout(
    //     ()=>{
    //       console.log('inner: ' + this);
    //       r({foo:'bar'})
    //     }, 1000))
    //   const operation = {ok: true, body: res}

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
FirebaseDb.db = restFirebase.factory(config.firebase.project)
FirebaseDb.ref = FirebaseDb.db({
  paths: '/',
  auth: config.firebase.auth
})

export default FirebaseDb