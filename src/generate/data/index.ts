import {writeDb} from "./write-db";
import {data} from './yeay/data'

export function run() {
  const json = JSON.stringify(data, null, 2);
  writeDb('db', json)
}
