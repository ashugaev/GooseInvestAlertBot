import {DocumentType} from '@typegoose/typegoose'

export function waitUntilModelIsInitialized<T>(model: DocumentType<any>): Promise<DocumentType<any>> {
  return new Promise<DocumentType<T>>(resolve => {
    if (model.base != null && model.base.connection.readyState === 1) {
      // The model is already initialized
      resolve(model)
    } else {
      // Wait for the model to initialize
      model.base.once('open', () => resolve(model))
    }
  })
}
