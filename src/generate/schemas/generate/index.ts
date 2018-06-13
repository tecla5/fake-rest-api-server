import {generateOne} from './one'
import {log, loadDoc, schemaPath} from '../util'
import {writeRoutes} from '../../routes'
const mergeJSON = require("merge-json")

export async function generate(opts : any = {}) {
  try {
    // TODO: support multiple docs by merging
    opts.names = opts.names || [opts.name || 'api-v1']

    const docPromises = opts
      .names
      .map(async(name : string) => {
        return await loadDoc(name, schemaPath)
      })
    const docs = await Promise.all(docPromises)
    const $doc = mergeJSON.merge(...docs)
    const {paths} = $doc.expanded

    if (opts.routes) {
      writeRoutes($doc.original)
    }

    if (opts.schemas) {
      const pathKeys = Object.keys(paths)
      const promises = pathKeys.map(async(pathKey : string) => {
        const pathObj = paths[pathKey]
        return await generateOne(pathObj, pathKey, $doc)
      })

      return Promise.all(promises)
    }
  } catch (e) {
    log('ERROR', e);
    return e
  }
}
