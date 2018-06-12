import {log, writeFile, toJson, serverPath} from '../schemas/util'
const $path = require('path');
const _ = require('lodash');
_.mixin(require("lodash-inflection"))

function resolveSchemaName(schemaRef : string) {
  if (!schemaRef) {
    return
  }
  const matchExpr = /\/(\w+)$/
  const matches = matchExpr.exec(schemaRef)
  return matches
    ? matches[1]
    : schemaRef
}

function paramName(pathKey : string) {
  const matchExpr = /\/:(\w+)/
  const matches = matchExpr.exec(pathKey) || []
  return matches[1]
}

function schemaFromPath(path : any) : any {
  // only GET methods are valid
  const methodName: any = ['get', 'post', 'put', 'delete'].find((name : string) => !!path[name]);
  if (!methodName) {
    return {}
  }
  const method = path[methodName];
  const okResponse = method.responses['200'];
  return okResponse
    ? okResponse.schema
    : {}
}

export function writeRoutes(doc : any) {
  const {paths} = doc
  const pathKeys = Object.keys(paths)

  function translatePath(pathKey : string, path : any) : any {
    const translatedPathKey = pathKey.replace(/{(\w+)}/g, ':$1')
    const schema = schemaFromPath(path) || {};
    const schemaName = resolveSchemaName(schema.$ref);
    if (!schemaName) {
      return {path: translatedPathKey}
    }
    const schemaPluralName = _.pluralize(schemaName)
    const schemaCollection = _.camelCase(schemaPluralName)
    const hasParam = /:\w+/.test(translatedPathKey)

    const schemaPath = hasParam
      ? `/${schemaCollection}/:${paramName(translatedPathKey)}`
      : `/${schemaCollection}`;
    return {path: translatedPathKey, schemaPath}
  }

  const translatedPathObjs = pathKeys.map((pathKey) => {
    return translatePath(pathKey, paths[pathKey])
  })
  const routes : any = translatedPathObjs.reduce((acc : any, pathObj : any) => {
    acc[pathObj.path] = pathObj.schemaPath || pathObj.path
    return acc
  }, {})

  const routesJson = toJson(routes)
  log('routes', routesJson)

  const routesPath = $path.join(serverPath, 'routes.json')
  writeFile(routesPath, routesJson)
}
