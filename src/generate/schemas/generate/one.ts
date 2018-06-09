const $path = require('path');
import {
  schemaRootPath,
  writeFile,
  toJson,
  dasherize,
  hasDeprecated,
  nameOf
} from '../util'

export async function generateOne(path : any) {
  // only GET methods are valid
  const methodName : any = ['get'].find((name : string) => !!path[name])
  if (!methodName) {
    return
  }
  const method = path[methodName]
  const tags = method.tags || {}
  if (hasDeprecated(tags)) {
    return
  }

  const name = nameOf(method, tags)
  // log({name})

  if (/List$/.test(name)) {
    return
  }

  const schema = method.responses['200'].schema

  // ignore any schema with allOf at top leve, since this means it is a list
  const schemaKeys = Object.keys(schema)
  if (schemaKeys.includes('allOf')) {
    return
  }

  const schemaFileName = `${dasherize(name)}.json`
  const schemaFilePath = $path.join(schemaRootPath, schemaFileName)
  writeFile(schemaFilePath, toJson(schema))
  return schema

}
