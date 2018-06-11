import {generateOne} from './one'
import {log, loadDoc, schemaPath} from '../util'
import {writeRoutes} from '../../routes'

export async function generate(opts : any = {}) {
  try {

    const schemaName = opts.name || 'api-v1' // 'minimal' // 
    
    const $doc = await loadDoc(schemaName, schemaPath)
    //log($doc);

    const {paths} = $doc.expanded

    const pathKeys = Object.keys(paths)

    if (opts.routes) {
      writeRoutes(pathKeys)
    }

    const singleEntityPaths = pathKeys

    const promises = singleEntityPaths.map(async(pathKey : string) => {
      const pathObj = paths[pathKey]
      return await generateOne(pathObj, pathKey, $doc)
    })

    return Promise.all(promises)
  } catch (e) {
    log('ERROR', e);
    return e
  }
}
