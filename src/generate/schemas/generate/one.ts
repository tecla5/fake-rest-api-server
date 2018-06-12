const $path = require('path');
import {
  schemaRootPath,
  writeFile,
  toJson,
  dasherize,
  hasDeprecated,
  nameOf
} from '../util'

const arraySchema = {
  type: "array",
  uniqueItems: true,
  items: {
  }
} 


function wrapAsArray(schema: any) {
  const $schema: any = {
    ...arraySchema,
  }

  $schema.items = schema
  return $schema
}

export async function generateOne(path : any, pathKey: string, doc: any) {
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

  let schema = method.responses['200'].schema

  const docPath = doc.original.paths[pathKey]
  const schemaWithRef = docPath[methodName].responses['200'].schema
  // use Definitions reference name if present
  const schemaRef = schemaWithRef.$ref

  let schemaName
  if (schemaRef) {
    const matchExpr = /\/(\w+)$/
    const matches = matchExpr.exec(schemaRef)
    schemaName = matches ? matches[1] : schemaName
  }

  const name = schemaName || nameOf(method, tags)

  if (/List$/.test(name)) {
    return
  }

  // ignore any schema with allOf at top leve, since this means it is a list
  const schemaKeys = Object.keys(schema)
  if (schemaKeys.includes('allOf')) {
    return
  }

  if (schema.type === 'object' || !schema.type) {
    schema = wrapAsArray(schema)  
  }

  if (schema.items) {
    const keys = Object.keys(schema.items.properties || {})
    schema.uniqueItems = true
    schema.items.required = keys  
  }

  const schemaFileName = `${dasherize(name)}.json`
  const schemaFilePath = $path.join(schemaRootPath, 'yeay', schemaFileName)
  writeFile(schemaFilePath, toJson(schema))
  return schema

}
