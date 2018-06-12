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

const fakerMap = {
  id: "random.uuid",
  imageUrl: 'image.imageUrl',
  name: 'commerce.productName',
  description: 'lorem.words',
  network: 'internet.domainName',
  rank: {"random.number": [20]},
  ranking: {"random.number": [20]},  
  currency: "finance.currencyCode",
  email: "internet.email",
  firstname: "name.firstName",
  "lastname": "name.lastName",
  "username": "internet.userName",
  locale: "random.locale",
  "phoneNumber": "phone.phoneNumber",
  website: 'internet.domainName',
  brands: "company.companyName"
}

function addFakerToProp(key: string, prop: any) {  
  if (/Id$/.test(key)) {
    prop.faker = "random.number"
  }

  if (key === 'gender') {
    prop.enum = [ "male", "female"]
  }

  if (key === 'videoType') {
    prop.enum = [
      "sale",
      ""
    ]
  }
  
  if (/Currency$/.test(key)) {
    prop.faker = "finance.currencyCode"
  }
  

  if (/Likes$/.test(key) || /Views$/.test(key) || /Comments$/.test(key)) {
    prop.faker = {"random.number": [20]}
  }


  if (/Code$/.test(key)) {
    prop.faker = "lorem.slug"
  }

  if (/Url$/.test(key)) {
    prop.faker = "internet.url"
  }

  if (/LogoUrl$/.test(key) || /ImageUrl$/.test(key) || /PreviewUrl$/.test(key) || /MediaUrl$/.test(key) || /mediaUrl$/.test(key) || /previewUrl$/.test(key) || /VideoUrl$/.test(key)) {
    prop.faker = "image.avatar"
  }

  if (/Amount$/.test(key)) {
    prop.faker = {"finance.amount": [10, 1000, 2]} // "random.number"
  }

  if (key === 'roles') {
    prop.enum = [
      'admin',
      'guest',
      'user'
    ]
  }
  
  if (/Score$/.test(key)) {
    prop.faker = {"random.number": [1000]}
  }

  if (/At$/.test(key) || key === 'serverTime') {
    prop.format = 'date-time'
  }

  if (prop.format === 'date-time') {
    prop.faker = 'date.recent'
  }

  if (key === 'endDate') {
    prop.format = 'date-time'
    prop.faker = 'date.future'    
  }

  const faker = fakerMap[key]    
  if (faker) {
    prop.faker = faker
  }

  return prop
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
    let properties = schema.items.properties || {}
    const keys = Object.keys(properties)
    schema.uniqueItems = true
    schema.items.required = keys
    
    properties = keys.reduce((acc, key) => {
      acc[key] = addFakerToProp(key, properties[key])
      return acc
    }, {})
  }

  const schemaFileName = `${dasherize(name)}.json`
  const schemaFilePath = $path.join(schemaRootPath, 'yeay', schemaFileName)
  writeFile(schemaFilePath, toJson(schema))
  return schema

}
