import {generate} from './generate'
import {log} from '../util'

export function run(opts = {}) {
  generate(opts).then((schema) => {
    // printObj('DONE', schema)
    log('DONE', !!schema)
  })
}
