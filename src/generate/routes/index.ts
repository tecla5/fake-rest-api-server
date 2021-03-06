import {
  log,
  writeFile,
  toJson,
  serverPath,
  nameOf,
  hasDeprecated
} from '../schemas/util'
const $path = require('path');
const _ = require('lodash');
const mergeJSON = require('merge-json');
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
    ? {
      schema: okResponse.schema,
      method
    }
    : {
      method
    }
}

export function addRoutes(doc : any, routeDoc : any) {
  const {paths} = doc
  const pathKeys = Object.keys(paths)

  function translatePath(pathKey : string, path : any) : any {
    const translatedPathKey = pathKey.replace(/{(\w+)}/g, ':$1');
    const {schema, method} = schemaFromPath(path);

    const tags = method.tags || {}

    if (hasDeprecated(tags) || !schema) {
      return false
    }

    const schemaName = schema.$ref
      ? resolveSchemaName(schema.$ref)
      : nameOf(method, schema.tags);
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

  const {basePath} = doc

  const routes : any = translatedPathObjs.reduce((acc : any, pathObj : any) => {
    if (!pathObj) 
      return acc

      // add basePath such as /v1 or /v2
    const apiPath = [basePath, pathObj.path].join('')

    acc[apiPath] = pathObj.schemaPath || pathObj.path
    return acc
  }, {})

  routeDoc = mergeJSON.merge(routeDoc, routes)
  return routeDoc
}

export function writeRoutes(doc : any) {
  const routesJson = toJson(doc)
  log('routes', routesJson)

  const routesPath = $path.join(serverPath, 'routes.json')
  writeFile(routesPath, routesJson)
}
