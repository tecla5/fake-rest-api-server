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
schemas = {
  affiliateProduct: require('affiliate-product.json'),
}
```

DB in `db.json`

Note: schema name must be pluralized

```json
{
  "affiliateProducts": [{
    // ...
  }],
  // ...
}
```

Routes in `routes.json`

```json
{
  "/affiliate-products": "/affiliateProducts",
  "/affiliate-products/:productId": "/affiliateProducts/:productId",
  // ...
}
```

### Generate mock data

```bash
npm run prestart
```

The generator generates a JSON database in `/buildScripts/db.json`

### Start JSON server

Serve mock data from REST routes

```bash
npm run start
```

The JSON server serves the generated JSON database on a REST server on port 3000 by default

`json-server --watch buildScripts/db.json --port 3000`

#### Custom routes

```bash
npm run start:routes
```

Starts JSON server using custom routes defined in `buildScripts/routes.json`

See [add-custom-routes](https://github.com/typicode/json-server#add-custom-routes)

## Design

The source code currently lives in `/buildScripts` and `/src`

Currently the generator code in `/buildScripts/generateData.ts` is hard-coded to the specific design.
We need to re-work it to be fully generic

```js
const groups = compiledGroupSchema.groups;
let sites: ISite[] = [];

groups.forEach((group: IGroup) => {
  const compiledSiteSchema = jsf(siteSchema);

  sites = [...sites, ...compiledSiteSchema.sites];

  group.sites = compiledSiteSchema.sites.map((site: ISite) => site.id);
});

const json = JSON.stringify({
  groups,
  sites
});

fs.writeFile("./buildScripts/db.json", json, err => {
  if (err) {
    console.log(red(err.message));
  } else {
    console.log(green("Mock API data generated."));
  }
});
```

### Models

Define models:

* `/src/models/IGroup.ts`
* `/src/models/ISchema.ts`

### Schemas

Define schemas:

* `/buildScripts/groupSchema.ts`
* `/buildScripts/siteSchema.ts`
