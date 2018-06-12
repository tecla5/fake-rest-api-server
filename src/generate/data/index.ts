import {writeDb} from "./write-db";
import {data} from './sample/data'

export function run() {
  const json = JSON.stringify(data, null, 2);
  writeDb('db', json)
}
