import {run} from './'

run({
  schemas: true,
  // names: ['api-v1', 'api-v2']
  auto: true // determine apis from files in swagger folder
})
