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

Simply run the `start` script

```bash
npm run start
```

- runs all prepare scripts
- starts JSON REST server using generated DB and routes

## Scripts available

### Start server

- `start:db` starts the JSON REST server using DB loaded with the JSON DB data
- `start:routes` starts the JSON REST server using the generated routes and a DB loaded with the JSON DB data

### Prepare server config

- `prepare` generates schemas, routes and DB (json) from the Swagger API to prepare everything for the JSON REST server to work from

### Generators

- `schemas:from-swagger` generate JSON schemas from Swagger API file
- `schemas:index` generate JSON schemas index file (`.ts`)
- `db:generate` generate JSON database from schemas (using faker and type definition of each schema property)
- `routes:map` generate routes map, mapping swagget API routes to JSON REST server routes

### Generate schemas

Generate JSON schema(s) from Swagger API yaml file in `schemas` folder

```bash
npm run schemas:from-swagger
```

The schemas generated should have the following form:

```js
export const listSchema = {
    type: "array",
    uniqueItems: true,
    items: {
        type: "object",
        required: ["id", "name", ...],
        properties: {
          ...
        }
    }
}
```

### Generate schema index

To generate an `index` file that collects all the generated schemas into a JS object:

```bash
npm run schemas:index
```

The script will write a `schemas/index.ts` file which can be referenced from the JS code, such as the script that generates fake data based on schema definitions and writes to DB.

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

## JSON Database

```bash
npm run db:generate
```

Generates JSON database in `db.json`

Note: schema name must be pluralized, either via `camelize` or `dasherize`

```json
{
  "affiliateProducts": [
    {
      "id": "6770b316-33b5-4e79-912e-471b8fddab91",
      "network": "micheal.com",
      "advertisingId": "80729",
      "link": "sit est laboris",
      "networkProductId": "54094",
      "name": "Handmade Soft Bacon",
      "description": "culpa ut rem",
      "isInStock": false,
      "imageUrl": "http://lorempixel.com/640/480",
      "isActive": false,
      "createdAt": "Mon Jun 11 2018 21:59:31 GMT+0200 (CEST)",
      "globalProductIds": {},
      "price": {}
    },
  ]
}
```

## Routes

Generate a `routes.json` mapping file with custom routes, based on the Swagger API entries under `paths:`

```bash
npm run routes:map
```

Routes with params such as `'/affiliate-products/{productId}'` will be translated to the form `:<name>` such as `/affiliate-products/:productId`

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

## Server

You can start the JSON REST server using different configurations

### Default routes

Serve mock data from REST routes

```bash
npm run start:db
```

The JSON server serves the generated JSON database on a REST server on port 3000 by default

`json-server --watch server/db.json --port 3000`

#### Custom routes

To run server with custom routes

```bash
npm run start
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

## Video data

The following hard-coded url data is used for the `video.json` and `videos.json` schemas

```json
{
  "mediaUrl": "https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/video-DvyCq4rGZu-568.m3u8",
  "sourceMediaUrl": "https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/74703ca4-6cf3-478e-9195-0bf8c74bd649.mp4",
  "altMediaUrl": "https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/video-DvyCq4rGZu-568-dash.mpd",
  "posterImageUrl": "https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/products/tFlhXqdVBd/2c54f5b7-0fe3-46fc-b9ad-02a56d154f0b.jpg",
  "socialVideoUrl": "https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/user-portrait-1528968430066.mp4",
  "previewUrl": "https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/user-preview-1528968423559.gif",
  "altPreviewUrl": "https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/fast-1528968423708.mp4",
  "sharingImageUrl": "https://d9w0wfiu0u1pg.cloudfront.net/bOFe2AHEOs/videos/DvyCq4rGZu/user-shareimage-1528968495470.jpg",
}
```

## Status

See [TODO](./TODO.md) for a list of properties that need better schema generation (in `src/generate/schemas/one.ts`). Please use the `TODO` file to add properties you think could have better data/schema generation.

## License

MIT