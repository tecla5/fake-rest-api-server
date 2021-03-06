import {log, readFile, rootPath} from '../util'
export {log}
export {writeFile, rootPath, serverPath}
from '../util'
const yaml = require('js-yaml');
const $path = require('path');

var derefLocal = require('json-schema-deref-local')

export function dasherize(str : string) {
  return str
    .trim()
    .replace(/([A-Z])/g, '-$1')
    .replace(/[-_\s]+/g, '-')
    .replace(/^-/, '')
    .toLowerCase();
};

export function schemaRefName(schemaRef: string): string {
  let schemaName = ''
  if (schemaRef) {
    const matchExpr = /\/(\w+)$/
    const matches = matchExpr.exec(schemaRef)
    schemaName = matches
      ? matches[1]
      : schemaName
  }
  return schemaName
}

export function schemaFromPath(path : any) : any {
  // only GET methods are valid
  const methodName: any = ['get', 'post', 'put', 'delete'].find((name : string) => !!path[name]);
  if (!methodName) {
    return
  }
  const method = path[methodName];
  const okResponse = method.responses['200'];
  if (!okResponse) {
    return {method, methodName}
  }

  const schema = okResponse.schema;
  return {schema, method, methodName}
}


async function loadFullDoc(doc : any, opts = {}) {
  // return await derefAsync(doc, opts)
  return await derefLocal(doc, opts)
}

const yamlExtExpr = /\.ya?ml$/

export async function loadDoc(schemaName : string, schemaPath : string) {
  const fileName = yamlExtExpr.test(schemaName)
    ? schemaName
    : `${schemaName}.yaml`
  const schemaFilePath = $path.join(schemaPath, fileName)
  const src = readFile(schemaFilePath)
  const original = yaml.safeLoad(src);
  // log(doc);
  try {
    const opts = {
      // failOnMissing: true
    }

    const expanded = await loadFullDoc(original, opts)
    return {original, expanded}
  } catch (e) {
    return {}
  }
}

// TODO: rename to swaggerPath
export const swaggerPath = $path.join(rootPath, 'swagger')
export const schemaRootPath = $path.join(rootPath, 'schemas')

export function toJson(obj : any) {
  return JSON.stringify(obj, null, 2)
}

export function printObj(caption : string, obj : any) {
  log(caption, toJson(obj))
}

export function hasDeprecated(tags : string[]) {
  return tags.find((tag : string) => tag === 'Deprecated')
}

export function nameOf(method : any, tags : string[] = []) {
  const opId = method.operationId
  return opId
    ? opId.replace(/^get/, '')
    : tags[0]
}
