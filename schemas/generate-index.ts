const $fs = require('fs');
const $path = require('path');
const helpers = require('template-helpers')();
const _ = require('lodash')

function writeFile(filePath : string, data : any) {
  $fs.writeFileSync(filePath, data, 'utf8')
  console.log('wrote to:', filePath)
}
function readFile(filePath : string) : string {
  return $fs.readFileSync(filePath, 'utf8')
}

// pass helpers on `imports`
const imports = {
  imports: helpers
};

const template : any = {
  filePath: $path.join(__dirname, './index.ts.tpl')
}

template.src = readFile(template.filePath)

// compile a template
const templateFn = _.template(template.src, imports);

const schemaList = ['affiliate-product', 'autocomplete-unique-id']

// const schemaMap = {   affiliateProduct: 'affiliate-product',
// autocompleteUniqueId: 'autocomplete-unique-id' }

const schemaMap = schemaList.reduce((acc : any, name : string) => {
  const key = _.camelCase(name)
  acc[key] = name
  return acc
}, {})

// console.log({schemaMap})

const data = Object
  .keys(schemaMap)
  .reduce((acc : any, key : string) => {
    const val = schemaMap[key]
    acc.push(`${key}: require('${val}.json'),\n  `)
    return acc
  }, [])
  .join('')

// console.log(data) render

const fileSrc = templateFn({data})

// console.log({fileSrc})
const destFilePath = $path.join(__dirname, './index.ts')
writeFile(destFilePath, fileSrc)
