import {jsf} from '../jsf'
import {groupSchema, siteSchema} from '../../../../schemas/sample';

// import IGroup from "../src/models/IGroup"; import ISite from
// "../src/models/ISite";
const compiledGroupSchema = jsf(groupSchema);

const groups = compiledGroupSchema.groups;
let sites : any = [];

groups.forEach((group : any) => {
  const compiledSiteSchema = jsf(siteSchema);

  sites = [
    ...sites,
    ...compiledSiteSchema.sites
  ];

  group.sites = compiledSiteSchema
    .sites
    .map((site : any) => site.id);
});

export const data = {
  sites,
  groups
}
