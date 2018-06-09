const $path = require('path');
import {log, writeFile, toJson, serverPath} from '../schemas/util'

function translatePath(path : string) : string {
  return path.replace(/{(\w+)}/g, ':$1')
}

export function writeRoutes(paths : string[]) {
  const translatedPaths = paths.map(translatePath)
  log('translated paths', translatedPaths)

  const routes : any = translatedPaths.reduce((acc : any, path : string) => {
    acc[path] = path
    return acc
  }, {})

  const routesJson = toJson(routes)
  log('routes', routesJson)

  const routesPath = $path.join(serverPath, 'routes.json')
  writeFile(routesPath, routesJson)
}
