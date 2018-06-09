import {generateOne} from './one'
import {log, loadDoc, schemaPath} from '../util'
import {writeRoutes} from '../../routes'

export async function generate(opts : any = {}) {
  try {

    const schemaName = 'minimal' // 'api-v1'
    const $doc = await loadDoc(schemaName, schemaPath)
    //log($doc);

    const {paths} = $doc

    const pathKeys = Object.keys(paths)

    if (opts.routes) {
      writeRoutes(pathKeys)
    }

    const singleEntityPaths = pathKeys

    const promises = singleEntityPaths.map(async(singleEntityPath : string) => {
      const pathObj = paths[singleEntityPath]
      return await generateOne(pathObj)
    })

    return Promise.all(promises)
  } catch (e) {
    log(e);
    return e
  }
}
