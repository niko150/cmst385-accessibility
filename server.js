//External
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import Qs from 'koa-qs'
import jwt, { fromAuthorizationHeader, sign } from 'koa-jsonwebtoken';
import config from 'config'
import fs from 'fs'
//Internal
import handleErrors from './middlewares/handleErrors'
import db from './db'
import Contract from './db/contract'
import Classes from './db/models/Classes'
import {serverCredentials as credentialsPromise} from './auth'
 
const app = new Koa()
Qs(app)
 
app.use(handleErrors)
app.use(bodyParser())

const router = new Router()
router.get('/api/error', async () => {
  throw Error('Error handling works!')
})
router.get('/', async (ctx, next) => {
  if (/^\/api/.test(ctx.url)) 
    return next()
  ctx.type = 'html'
  ctx.body = fs.createReadStream('views/index.html')
})

credentialsPromise.then(serverCredentials => {
  const profile = {
    id: 1 // we're just making a dummy profile to connect with
  }
  console.log('loaded serverCredentials: ' + 
    sign(profile, serverCredentials.shared/*, {expiresIn: 1111}*/))    
  app.use(
    jwt({
      secret: serverCredentials.shared, 
      extractToken: fromAuthorizationHeader
    })
    .unless({ path: [/^\/(?!api)/] })
  );

  const contract = new Contract()
  contract.addCollection(Classes, db, router).then(() => {
    app.use(router.routes())

    app.listen(config.port, () => {
      console.info(`Listening to http://localhost:${config.port}`)
    })
  }).catch((err) => console.error('ERR:', err))

})