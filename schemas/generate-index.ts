const $fs = require('fs');
const $path = require('path');
const helpers = require('template-helpers')();
const _ = require('lodash')

const schemasPath: any = {}
schemasPath.root = __dirname
schemasPath.yeay = $path.join(schemasPath.root, 'yeay')

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
  filePath: $path.join(schemasPath.root, 'index.ts.tpl')
}

template.src = readFile(template.filePath)

// compile a template
const templateFn = _.template(template.src, imports);

const readdir = require('fs-readdir-promise')

const schemaList = readdir(schemasPath.yeay).then((files: string[]) => {
  const jsonFiles = files.filter((file: string) => {
    return /\.json$/.test(file)
  })
  const names = jsonFiles.map((file: string) => file.replace(/\.json$/, ''))
  return names
}).then((names: string[]) => {
  const schemaMap = names.reduce((acc : any, name : string) => {
    const key = _.camelCase(name)
    acc[key] = name
    return acc
  }, {})

  const data = Object
    .keys(schemaMap)
    .reduce((acc : any, key : string) => {
      const val = schemaMap[key]
      acc.push(`${key}: require('${val}.json'),\n  `)
      return acc
    }, [])
    .join('')

  const fileSrc = templateFn({data})

  // console.log({fileSrc})
  const destFilePath = $path.join(schemasPath.yeay, 'index.ts')
  writeFile(destFilePath, fileSrc)  
})

