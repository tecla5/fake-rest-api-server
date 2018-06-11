const $fs = require('fs');
const $path = require('path');
import chalk from "chalk";
const {green, red} = chalk
export const {
  log
} = console

export const rootPath = $path.join(__dirname, '../..')
export const serverPath = $path.join(rootPath, 'server')

export function warn(msg : string) {
  log(red(msg))
}

export function info(msg : string) {
  log(green(msg))
}

export function writeFile(filePath : string, data : any) {
  log('Writing to:', filePath)
  $fs.writeFileSync(filePath, data, 'utf8')
}

export function readFile(filePath : string) : string {
  return $fs.readFileSync(filePath, 'utf8')
}
