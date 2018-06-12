import {jsf} from '../jsf'
import {groupSchema, siteSchema, challengeSchema, listSchema} from '../../../../schemas/sample';

// import IGroup from "../src/models/IGroup"; import ISite from
// "../src/models/ISite";
const compiled = {
  groupSchema: jsf(groupSchema),
  challengeSchema: jsf(challengeSchema),
  siteSchema: jsf(siteSchema),
  list: jsf(listSchema)
}

// const groups = compiled.groupSchema.groups;

const $sites = compiled.siteSchema.sites

let sites : any = [];
sites = [
  //...sites,
  ...compiled.siteSchema.sites
];

// groups.forEach((group : any) => {
//   group.sites = compiled.siteSchema
//     .sites
//     .map((site : any) => site.id);
// });

const $challenges = compiled.challengeSchema.challenges

console.log({
  $sites,
  $challenges,
  list: compiled.list
})

const challenges = [
  ...$challenges
]

export const data = {
  challenges,
  sites,
  //groups,
}
