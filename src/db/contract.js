import ModelUri from './modelUri'

class Contract {
  constructor() { this.modelUris = [] }
  async addCollection(model, db, router) {
    const modelUri = new ModelUri(model, db)
    this.modelUris.push( modelUri )
    await modelUri.wireRouter(router)
  }
}

export default Contract
