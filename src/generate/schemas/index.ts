import {generate} from './generate'
import {log} from '../util'

export function run() {
  generate().then((schema) => {
    // printObj('DONE', schema)
    log('DONE', !!schema)
  })
}
