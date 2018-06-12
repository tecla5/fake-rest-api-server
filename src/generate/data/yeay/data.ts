import {jsf} from '../jsf'
import {schemas} from '../../../../schemas/yeay';
const _ = require('lodash');
_.mixin(require("lodash-inflection"))

const { log } = console
log({
  schemas
})

const schemaNames = Object.keys(schemas)

export const data = schemaNames.reduce((acc: any, name : any) => {
  log({
    schema: name
  })  

  const schema = schemas[name]
  const pluralModelName = _.pluralize(name)
  // pluralModelName !== name
  if (true) {
    log({
      collection: name
    })  
  
    // avoid overwrite
    if (!acc[pluralModelName]) {
      acc[pluralModelName] = jsf(schema);
    }    
  }  
  return acc
}, {});
