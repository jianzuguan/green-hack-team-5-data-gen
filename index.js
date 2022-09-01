// const fs = require("fs");
// const util = require("util");
const util = require("node:util");
const fs = require("node:fs");

const csvtojson = require("csvtojson");
const OSpoint = require("ospoint");

const stat = util.promisify(fs.stat);
const readdir = util.promisify(fs.readdir);

async function callStat() {
  const stats = await stat(".");
  console.log(`This directory is owned by ${stats.uid}`);
}
fs.readFileAsync = util.promisify(fs.readFile);

const headers = [
  "postcode",
  "Positional_quality_indicator",
  "eastings",
  "northings",
  "Country_code",
  "NHS_regional_HA_code",
  "NHS_HA_code",
  "Admin_county_code",
  "Admin_district_code",
  "Admin_ward_code",
];

async function main() {
  const fileNames = await readdir("./CSV");
  const jsonArr = fileNames.map(async (name) => {
    // console.log(name);
    return await getJsonFromFile(`./CSV/${name}`);
  });

  const json2D = await Promise.all(jsonArr);

  console.log(json2D.flat());
}

async function getJsonFromFile(fileName) {
  const addresses = await csvtojson({ headers }).fromFile(fileName);

  return addresses.map(({ postcode, eastings, northings }) => {
    const { latitude, longitude } = new OSpoint(northings, eastings).toWGS84();
    return {
      postalCode: postcode,
      lat: latitude,
      lon: longitude,
    };
  });
}

main();
