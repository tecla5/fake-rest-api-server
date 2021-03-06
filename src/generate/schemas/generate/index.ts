import {generateOne} from './one'
import {log, loadDoc, swaggerPath} from '../util'
import {addRoutes, writeRoutes} from '../../routes'
import {
  Graph
} from './graph'
import {
  addToGraph
} from './graph-viz'
const readdir = require('fs-readdir-promise')

const yamlExtExpr = /\.ya?ml$/

export async function generate(opts : any = {}) {
  try {
    opts.names = opts.names || [opts.name || 'api-v1']

    // auto discover names
    if (opts.auto) {
      const files : string[] = await readdir(swaggerPath)
      const yamlFileNames = files.filter((file : string) => {
        return yamlExtExpr.test(file)
      })
      opts.names = yamlFileNames
    }

    const docPromises = opts
      .names
      .map(async(name : string) => {
        return await loadDoc(name, swaggerPath)
      })
    const docs : any[] = await Promise.all(docPromises)

    let routesDoc = {}

    const graph = new Graph()

    for (let $doc of docs) {
      const {paths} = $doc.expanded

      if (opts.routes) {
        routesDoc = addRoutes($doc.original, routesDoc)
      }

      if (opts.graph) {
        const pathKeys = Object.keys(paths)
        pathKeys.map((pathKey : string) => {
          const pathObj = paths[pathKey]
          addToGraph(pathObj, pathKey, $doc, graph)
        })
      }

      if (opts.schemas) {
        const pathKeys = Object.keys(paths)
        const promises = pathKeys.map(async(pathKey : string) => {
          const pathObj = paths[pathKey]
          addToGraph(pathObj, pathKey, $doc, graph)
          return await generateOne(pathObj, pathKey, $doc)
        })

        return Promise.all(promises)
      }
    }

    if (opts.graph) {
      graph.save()
    }

    if (opts.routes) {
      writeRoutes(routesDoc)
    }

  } catch (e) {
    log('ERROR', e);
    return e
  }
}
