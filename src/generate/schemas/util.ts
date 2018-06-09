import {log, readFile, rootPath} from '../util'
export {log}
export {writeFile, rootPath, serverPath}
from '../util'
const yaml = require('js-yaml');
const $path = require('path');
const deref = require('json-schema-deref');
const {promisify} = require('util');
const derefAsync = promisify(deref)

export function dasherize(str : string) {
  return str
    .trim()
    .replace(/([A-Z])/g, '-$1')
    .replace(/[-_\s]+/g, '-')
    .replace(/^-/, '')
    .toLowerCase();
};

export async function loadDoc(schemaName : string, schemaPath : string) {
  const fileName = `${schemaName}.yaml`
  const schemaFilePath = $path.join(schemaPath, fileName)
  const src = readFile(schemaFilePath)
  const doc = yaml.safeLoad(src);
  // log(doc);
  try {
    return await derefAsync(doc)
  } catch (e) {
    return {}
  }
}

export const schemaPath = $path.join(rootPath, 'swagger')
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

export function nameOf(method : any, tags : string[]) {
  const opId = method.operationId
  return opId
    ? opId.replace(/^get/, '')
    : tags[0]
}
