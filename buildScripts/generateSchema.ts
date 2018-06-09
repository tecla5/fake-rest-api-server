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

    // const pathKeys = Object.keys(paths) log('paths', pathKeys);
    // writeRoutes(pathKeys)

    const ap = paths['/affiliate-products']
    const tags = (ap.get || {}).tags
    const tag = tags[0]
    log({tag})

    const schema = ap.get.responses['200'].schema
    const schemaFileName = `${dasherize(tag)}.json`
    const schemaFilePath = $path.join(rootPath, 'schemas', schemaFileName)
    writeToFile(schemaFilePath, toJson(schema))
    return schema

  } catch (e) {
    log(e);
  }
}

generate().then((schema) => {
  printObj('DONE', schema)
})
