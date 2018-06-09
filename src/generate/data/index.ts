import {writeDb} from "./write-db";
import {data} from './sample/data'

export function run() {
  const json = JSON.stringify(data);
  writeDb('db', json)
}
