import chalk from "chalk";
const { green, red } = chalk
import * as fs from "fs";
import * as jsf from "json-schema-faker";
import groupSchema from "./groupSchema";
import IGroup from "../src/models/IGroup";
import ISite from "../src/models/ISite";
import siteSchema from "./siteSchema";

const compiledGroupSchema = jsf(groupSchema);

jsf.extend('faker', function() {
  return require('faker');
});

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
