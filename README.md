# Fake REST api

Create a fake REST API using [json-schema-faker](https://github.com/json-schema-faker/json-schema-faker) and [json-server](https://github.com/typicode/json-server).

See this [blog post](https://medium.com/@jonjam/creating-a-fake-rest-api-with-json-server-817320239cde) for more details.

## Install

Install dependencies

```bash
npm i
```

## Usage

Usage instructions

## Quick start

```bash
npm run prestart
npm run start
```

### Generate schemas

Generate JSON schema(s) from Swagger API yaml file in `schemas` folder

```bash
npm run generate-schemas
```

Output:

```bash
affiliate-product.json
catalog-seller.json
...
```

The schema generated must have the following form:

```js
export const groupSchema = {
  type: "object",
  properties: {
    groups: {
      type: "array",
      minItems: 0,
      maxItems: 5,
      uniqueItems: true,
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            faker: "random.uuid"
          },
          name: {
            type: "string",
            faker: "commerce.productName"
          }
        },
        required: ["id", "name"]
      }
    }
  },
  required: ["groups"]
};
```

Note in particular `required` for the array property `challenges` and for the `items`

```js
  type: "object",
  required: ["challenges"]` // <--- property challenges must be required
```  

```js
    challenges: {
      "type": "array",
      "items": {
      required: ["id"], // <--- must have one or more required properties
      // ...
    }
```  

Full schema example:

```js
{
  type: "object",
  required: ["challenges"],
  properties: {
    challenges: {
      "type": "array",
      "minItems": 5,
      "maxItems": 10,
      "items": {
        required: ["id"],
        properties: {

        }
      }
    }
  }
}
```

Alternatively you can have the schema be an array:

```js
export const listSchema = {
    type: "array",
    uniqueItems: true,
    items: {
        type: "object",
        required: ["id", "name"],
        properties: {
```

We should use the schema array approach for the generated YeaY schema and ensure they all follow this model.

### Generate schema index

To generate an index file that collects all the generated schemas into a JS object:

```bash
npm run generate-schema-index
```

Will write a `schemas/index.ts` file which can be referenced from the JS code.

### Routes

Generates a `routes.json` file from all the entries under `paths` in the Swagger API file

Routes with params such as `'/affiliate-products/{productId}'` will be written to `routes.json` as `/affiliate-products/:productId`

```json
{
  "/affiliate-products/:productId": "/affiliate-products/:productId"
}
```

### Schemas

For each path definition under `paths`, find those that get a single domain entity

* `'/affiliate-products/{productId}'` (get single product by ID)
* `'/affiliate-products` (get list)

### All together

Routes in `routes.json`

```js
export const schemas = {
  affiliateProduct: require('affiliate-product.json'),
  appSetting: require('app-setting.json'),
  appStatus: require('app-status.json'),
  autocompleteProductTag: require('autocomplete-product-tag.json'),
  autocompleteUniqueId: require('autocomplete-unique-id.json'),
  catalogChallengeListItem: require('catalog-challenge-list-item.json'),
  catalogChallenges: require('catalog-challenges.json'),
  catalogSeller: require('catalog-seller.json'),
  catalogUserSearchResult: require('catalog-user-search-result.json'),
  catalogVideoSearchResult: require('catalog-video-search-result.json'),
  catalogVideos: require('catalog-videos.json'),
  challengeTranslationPayload: require('challenge-translation-payload.json'),
  challengeTranslations: require('challenge-translations.json'),
  challenge: require('challenge.json'),
  // ...
}
```

DB in `db.json`

Note: schema name must be pluralized, either via `camelize` or `dasherize`

```json
{
  "affiliateProducts": [{
  }],
}
```

Routes in `routes.json`

```json
{
  "/affiliate-products": "/affiliateProducts",
  "/affiliate-products/:productId": "/affiliateProducts/:productId",
}
```

### Generate mock data

```bash
npm run prestart
```

The generator generates a JSON database in `/server/db.json`

### Start JSON server

Serve mock data from REST routes

```bash
npm run start
```

The JSON server serves the generated JSON database on a REST server on port 3000 by default

`json-server --watch server/db.json --port 3000`

#### Custom routes

To run server with custom routes

```bash
npm run start:routes
```

Starts JSON server using custom routes defined in `server/routes.json`

See [add-custom-routes](https://github.com/typicode/json-server#add-custom-routes)

## TODO

We could perhaps let the JSF resolve the schemas when generating the DB

```js
jsf.resolve(schema).then(() => {
  // ...
})
```

## License

MIT