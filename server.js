//External
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import Qs from 'koa-qs'
import jwt, { fromAuthorizationHeader, sign } from './koa-jsonwebtoken-with-except';
import sendfile from 'koa-sendfile'
import config from 'config'
import fs from 'fs'
//Internal
import handleErrors from './middlewares/handleErrors'
import db from './db'
import Contract from './db/contract'
import Classes from './db/models/Classes'
import {serverCredentials as credentialsPromise} from './auth'
 
const app = new Koa()
Qs(app) // let's give our app nice query strings
 
app.use(handleErrors)
app.use(bodyParser())

const router = new Router()
router.get('/api/error', async () => {
  throw Error('Error handling works!')
})

const default_route = async (ctx, next) => {
  if (/^\/api/.test(ctx.url)) 
    return next()
  ctx.type = 'html'
  ctx.body = fs.createReadStream('public/index.html')
}

router.get('/', default_route)
router.get(/^\/assets\/(.*)$/, async (ctx, next) => {
  let name = ctx.params[0]
  let ext = name.split('.').slice(-1)[0] 
  switch (ext) {
    case 'png':
      ctx.type='image/png'
      break
    case 'jpg':
    case 'jpeg':
      ctx.type='image/jpeg'
      break
  }
  ctx.body = fs.createReadStream('public/assets/'+ctx.params[0])
})
router.get(/^\/public\/?(.*)$/, async (ctx, next) => {
  let fspath = ctx.params[0] || 'index.html'
  let fh = config.public + '/' + fspath
  let stats = await sendfile(ctx, fh)
  if (!ctx.status) this.throw(404)
})

credentialsPromise.then(serverCredentials => {
  const profile = {
    id: 1 // we're just making a dummy profile to connect with
  }
  console.log('loaded serverCredentials: ' + 
    sign(profile, serverCredentials.shared/*, {expiresIn: 1111}*/))
    
  app.use(jwt({
      secret: serverCredentials.shared, 
      extractToken: fromAuthorizationHeader
    })
    .except({ method: 'GET', path: /^\/api\/Classes/ })
    .and({ path: /^\/api\/error/ })
    .and({ path: /^\/(?!api)/ })
  );

  const contract = new Contract()
  contract.addCollection(Classes, db, router).then(() => {
    app.use(router.routes())
    app.use(default_route)

    app.listen(config.port, () => {
      console.info(`Listening to http://localhost:${config.port}`)
    })
  }).catch((err) => console.error('ERR:', err))

})