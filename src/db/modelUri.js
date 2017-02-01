/* Model - uses a generic db object that recieves REST commands and converts 
them for use in the database. It also recieves a models/ type, which describes
the model for the database (a sort of DAO). It also connects the router to its
REST calls. This provides the opportunity to */
class ModelUri {
  constructor(model, db) {
    this.db = db
    this.name = model.name
  }

  wireRouter(router) {
    const allAtName = new RegExp('^\/api\/'+this.name+'(\/|$)')
    router.get(allAtName, async (ctx, next) => {
	    ctx.body = await this.get(ctx.params[0], ctx.query)
    })
    router.put(allAtName, async (ctx, next) => {
      ctx.body = await this.put(ctx.params[0], ctx.request.body, ctx.query)
    })
    router.patch(allAtName, async (ctx, next) => {
	    ctx.body = await this.patch(ctx.params[0], ctx.request.body, ctx.query)
    })
    router.post(allAtName, async (ctx, next) => {
	    ctx.body = await this.post(ctx.params[0], ctx.request.body, ctx.query)
    })
    router.delete(allAtName, async (ctx, next) => {
	    ctx.body = await this.delete(ctx.params[0], ctx.query)
    })
  }

  async get(pathFinal, queryParams){
    return await this.db.tx('get', this.name, pathFinal, undefined, queryParams)
  }
  async put(pathFinal, payload, queryParams){
    return await this.db.tx('put', this.name, pathFinal, payload, queryParams)    
  }
  async patch(pathFinal, payload, queryParams){
    return await this.db.tx('patch', this.name, pathFinal, payload, queryParams)
  }
  async post(pathFinal, payload ,queryParams){
    return await this.db.tx('post', this.name, pathFinal, payload, queryParams)
  }
  async delete(pathFinal, queryParams){
    return await this.db.tx('delete', this.name, pathFinal, undefined, queryParams)
  }
}

export default ModelUri