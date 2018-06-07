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

- `/src/models/IGroup.ts`
- `/src/models/ISchema.ts`

### Schemas

Define schemas:

- `/buildScripts/groupSchema.ts`
- `/buildScripts/siteSchema.ts`