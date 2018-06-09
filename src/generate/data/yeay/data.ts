import {jsf} from '../jsf'
import {schemas} from '../../../../schemas';

const compiledSchemas = jsf(schemas);

export const data = compiledSchemas.map((schema : any) => {
  return jsf(schema);
});
