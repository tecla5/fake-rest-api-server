import {jsf} from '../jsf'
import {schemas} from '../../../../schemas/yeay';
const _ = require('lodash');
_.mixin(require("lodash-inflection"))

const schemaNames = Object.keys(schemas)

export const data = schemaNames.reduce((acc: any, name : any) => {
  const schema = schemas[name]
  const pluralModelName = _.pluralize(name)
  // pluralModelName !== name
  if (true) {  
    // avoid overwrite
    if (!acc[pluralModelName]) {
      acc[pluralModelName] = jsf(schema);
    }    
  }  
  return acc
}, {});
