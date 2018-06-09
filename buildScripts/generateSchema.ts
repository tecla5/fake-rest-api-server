const yaml = require('js-yaml');
const $fs = require('fs');
const $path = require('path');
const deref = require('json-schema-deref');
const {promisify} = require('util');
const derefAsync = promisify(deref)

// Get document, or throw exception on error
const rootPath = $path.join(__dirname, '..')
const schemaPath = $path.join(rootPath, 'swagger')

const {log} = console

function dasherize(str : string) {
  return str
    .trim()
    .replace(/([A-Z])/g, '-$1')
    .replace(/[-_\s]+/g, '-')
    .replace(/^-/, '')
    .toLowerCase();
};

function toJson(obj : any) {
  return JSON.stringify(obj, null, 2)
}

function printObj(caption : string, obj : any) {
  log(caption, toJson(obj))
}

function translatePath(path : string) : string {
  return path.replace(/{(\w+)}/g, ':$1')
}

function writeToFile(filePath : string, obj : any) {
  log('Writing to:', filePath)
  $fs.writeFileSync(filePath, obj, 'utf8')
}

function writeRoutes(paths : string[]) {
  const translatedPaths = paths.map(translatePath)
  log('translated paths', translatedPaths)

  const routes : any = translatedPaths.reduce((acc : any, path : string) => {
    acc[path] = path
    return acc
  }, {})

  const routesJson = toJson(routes)
  log('routes', routesJson)

  const routesPath = $path.join(rootPath, 'routes.json')
  writeToFile(routesPath, routesJson)
}

async function loadDoc(schemaName : string) {
  const fileName = `${schemaName}.yaml`
  const schemaFilePath = $path.join(schemaPath, fileName)
  const src = $fs.readFileSync(schemaFilePath, 'utf8')
  const doc = yaml.safeLoad(src);
  // log(doc);
  try {
    return await derefAsync(doc)
  } catch (e) {
    return {}
  }
}

async function generate() {
  try {

    const schemaName = 'minimal' // 'api-v1'
    const $doc = await loadDoc(schemaName)
    //log($doc);

    const {paths} = $doc

    const pathKeys = Object.keys(paths)

    // writeRoutes(pathKeys)

    const singleEntityPaths = pathKeys //.filter(filterPath)

    const promises = singleEntityPaths.map(async(singleEntityPath : string) => {
      const pathObj = paths[singleEntityPath]
      return await generateOne(pathObj)
    })

    return Promise.all(promises)
  } catch (e) {
    log(e);
    return e
  }
}

function filterPath(path : string) {
  // return /\/:\w+/.test(path)
  return /\/{\w+}/.test(path)
}

const httpMethods = ['get', 'put', 'post', 'delete']

function hasDeprecated(tags : string[]) {
  return tags.find((tag : string) => tag === 'Deprecated')
}

function nameOf(method : any, tags : string[]) {
  const opId = method.operationId
  return opId
    ? opId.replace(/^get/, '')
    : tags[0]
}

async function generateOne(path : any) {
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
  const schemaFilePath = $path.join(rootPath, 'schemas', schemaFileName)
  writeToFile(schemaFilePath, toJson(schema))
  return schema

}

generate().then((schema) => {
  // printObj('DONE', schema)
  log('DONE', !!schema)
})
