import {warn, info, writeFile, serverPath} from '../util'
const $path = require('path');

export function writeDb(name : string, db : any) {
  try {
    const dbFilePath = $path.join(serverPath, `./${name}.json`)
    writeFile(dbFilePath, db)
    info('Mock API data generated.');
  } catch (err) {
    warn(err.message);
  }
}
