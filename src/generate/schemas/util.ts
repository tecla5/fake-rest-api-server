import {log, readFile, rootPath} from '../util'
export {log}
export {writeFile, rootPath, serverPath}
from '../util'
const yaml = require('js-yaml');
const $path = require('path');
// const promisify = require("util-promisify");
// const deref = require('json-schema-deref');
// const derefAsync = promisify(deref)

var derefLocal = require('json-schema-deref-local')

export function dasherize(str : string) {
  return str
    .trim()
    .replace(/([A-Z])/g, '-$1')
    .replace(/[-_\s]+/g, '-')
    .replace(/^-/, '')
    .toLowerCase();
};

async function loadFullDoc(doc: any, opts = {}) {  
  // return await derefAsync(doc, opts)
  return await derefLocal(doc, opts)  
}

export async function loadDoc(schemaName : string, schemaPath : string) {
  const fileName = `${schemaName}.yaml`
  const schemaFilePath = $path.join(schemaPath, fileName)
  const src = readFile(schemaFilePath)
  const original = yaml.safeLoad(src);
  // log(doc);
  try {
    const opts = {
      // failOnMissing: true
    }

    const expanded = await loadFullDoc(original, opts)
    return {
      original,
      expanded
    }
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
