import * as jsf from "json-schema-faker";
jsf.extend('faker', function () {
  return require('faker');
});

// jsf.option({
//   maxItems: 20
// })

export {jsf}
