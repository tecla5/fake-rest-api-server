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
  items: {}
}

function wrapAsArray(schema : any) {
  const $schema : any = {
    ...arraySchema
  }

  $schema.items = schema
  return $schema
}

const fakerMap = {
  id: "random.uuid",
  imageUrl: 'image.imageUrl',
  link: "internet.url",
  name: 'commerce.productName',
  description: 'lorem.words',
  network: 'internet.domainName',
  rank: {
    "random.number": [20]
  },
  ranking: {
    "random.number": [20]
  },
  currency: "finance.currencyCode",
  email: "internet.email",
  firstname: "name.firstName",
  "lastname": "name.lastName",
  "username": "internet.userName",
  locale: "random.locale",
  "phoneNumber": "phone.phoneNumber",
  website: 'internet.domainName',
  brands: "company.companyName",
  isoCountryCode: "address.countryCode",
  postalCode: "address.zipCode",
  administrativeArea: "address.state",
  formattedAddressLines: "address.streetAddress",
  price: {
    "finance.amount": [10, 1000, 2]
  } 
}

function addFakerToProp(key : string, prop: any = {}) {
  const { description } = prop
  if (description && /^Deprecated/.test(description)) {
    return
  }

  if (/Id$/.test(key)) {
    prop.faker = "random.number"
  }

  if (/Email$/.test(key)) {
    prop.faker = "internet.email"
  }

  if (key === 'gender') {
    prop.enum = ["male", "female"]
  }

  if (key === 'adminTags') {
    prop.enum = ["feature", "winter", "summer"]
  }

  if (key === 'videoType') {
    prop.enum = ["sale", ""]
  }

  if (/Currency$/.test(key)) {
    prop.faker = "finance.currencyCode"
  }

  if (/Likes$/.test(key) || /Views$/.test(key) || /Comments$/.test(key)) {
    prop.faker = {
      "random.number": [20]
    }
  }

  if (/Code$/.test(key)) {
    prop.faker = "lorem.slug"
  }

  if (/Url$/.test(key)) {
    prop.faker = "internet.url"
  }

  if (/StoreVersion$/.test(key)) {
    prop.faker = "random.number"
  }

  if (/LogoUrl$/.test(key) || /ImageUrl$/.test(key) || /PreviewUrl$/.test(key) || /MediaUrl$/.test(key)) {
    prop.faker = "image.avatar"
  }

  if (key === 'previewUrl') {
    delete prop.faker
    prop.enum = ["https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/user-preview-1528968423559.gif"]
  }
  
  if (key === 'mediaUrl') {
    delete prop.faker
    prop.enum = ["https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/video-DvyCq4rGZu-568.m3u8"]
  }
  if (key === 'sourceMediaUrl') {
    delete prop.faker
    prop.enum = ["https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/74703ca4-6cf3-478e-9195-0bf8c74bd649.mp4"]
  }
  if (key === 'altMediaUrl') {
    delete prop.faker
    prop.enum = ["https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/video-DvyCq4rGZu-568-dash.mpd"]
  }
  if (key === 'posterImageUrl') {
    delete prop.faker
    prop.enum = ["https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/products/tFlhXqdVBd/2c54f5b7-0fe3-46fc-b9ad-02a56d154f0b.jpg"]
  }
  if (key === 'socialVideoUrl') {
    delete prop.faker
    prop.enum = ["https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/user-portrait-1528968430066.mp4"]
  }
  if (key === 'altPreviewUrl') {
    delete prop.faker
    prop.enum = ["https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/fast-1528968423708.mp4"]
  }
  if (key === 'sharingImageUrl') {
    delete prop.faker
    prop.enum = ["https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/user-shareimage-1528968495470.jpg"]
  }

  if (/Amount$/.test(key) || /Price$/.test(key)) {
    prop.faker = {
      "finance.amount": [10, 1000, 2]
    } 
  }

  if (key === 'roles') {
    prop.enum = ['admin', 'guest', 'user']
  }

  if (/Score$/.test(key)) {
    prop.faker = {
      "random.number": [1000]
    }
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
  // nested
  if (prop.type === 'object' || prop.properties) {
    let props = prop.properties || []
    const keys = Object.keys(props)
    const fakedProps = keys.reduce((acc: any, key: string) => {
      try {
        const prop = props[key]
        const fakedProp = addFakerToProp(key, prop)
        if (fakedProp) {
          acc[key] = fakedProp
        }        
        return acc  
      } catch (e) {
        console.log('ERROR', e)
        return acc
      }
    }, {})  

    prop.properties = fakedProps
  }

  return prop
}

function schemaFromPath(path : any) : any {
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

export async function generateOne(path : any, pathKey : string, doc : any) {
  let {schema, method, methodName} = schemaFromPath(path)

  const tags = method.tags || {}
  if (hasDeprecated(tags)) {
    return
  }

  const docPath = doc.original.paths[pathKey]
  const okResponse = docPath[methodName].responses['200']
  const schemaWithRef = okResponse
    ? okResponse.schema
    : {}
  // use Definitions reference name if present
  const schemaRef = (schemaWithRef || {}).$ref

  let schemaName
  if (schemaRef) {
    const matchExpr = /\/(\w+)$/
    const matches = matchExpr.exec(schemaRef)
    schemaName = matches
      ? matches[1]
      : schemaName
  }

  const name = schemaName || nameOf(method, tags)

  if (/List$/.test(name)) {
    return
  }
  if (!schema) {
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
      const fakedProp = addFakerToProp(key, properties[key])
      if (fakedProp) {
        acc[key] = fakedProp
      }      
      return acc
    }, {})
  }

  const schemaFileName = `${dasherize(name)}.json`
  const schemaFilePath = $path.join(schemaRootPath, 'yeay', schemaFileName)
  writeFile(schemaFilePath, toJson(schema))
  return schema

}
