import * as jsf from "json-schema-faker";
jsf.extend('faker', function () {
  return require('faker');
});

export {jsf}
