const util = require("node:util");
const fs = require("node:fs");

const csvtojson = require("csvtojson");
const OSpoint = require("ospoint");

const readdir = util.promisify(fs.readdir);
const writeFile = util.promisify(fs.writeFile);

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
const propertyTypes = ["detached", "semi-detatched", "terraced"];
const epcRatings = {
  a: {
    min: 92,
    max: 100,
  },
  b: {
    min: 81,
    max: 91,
  },
  c: {
    min: 69,
    max: 80,
  },
  d: {
    min: 55,
    max: 68,
  },
  e: {
    min: 39,
    max: 54,
  },
  f: {
    min: 21,
    max: 38,
  },
  g: {
    min: 1,
    max: 20,
  },
};

const fuels = [["electric"], ["electric", "gas"], ["gas"]];
const meterType = ["Smart", "Legacy"];

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function getJsonFromFile(fileName) {
  const addresses = await csvtojson({ headers }).fromFile(fileName);

  return addresses
    .filter((_, index) => index % 2)
    .map(({ postcode, eastings, northings }) => {
      const { latitude, longitude } = new OSpoint(
        northings,
        eastings
      ).toWGS84();
      return {
        postalCode: postcode,
        lat: latitude,
        lon: longitude,
      };
    });
}

function transformAddress(address) {
  return {
    address: {
      postalCode: address.postalCode,
      location: {
        lat: address.lat,
        lon: address.lon,
      },
    },
  };
}

function generateProperty() {
  const type = getRandomItem(propertyTypes);
  const epcRatingKeys = Object.keys(epcRatings);
  const ratingKey = getRandomItem(epcRatingKeys);
  const { min, max } = epcRatings[ratingKey];
  const epcRatingValue = getRandomInt(min, max);
  return {
    type,
    epc: {
      current: {
        rating: ratingKey,
        value: epcRatingValue,
      },
    },
  };
}

function generateFuel() {
  return getRandomItem(fuels);
}

function generateMeterType() {
  return getRandomItem(meterType);
}

function generateCreditScore() {
  return getRandomInt(0, 999);
}
async function main() {
  const fileNames = await readdir("./CSV");
  console.log("reading file...");
  const jsonArr = fileNames.map(async (name) => {
    return await getJsonFromFile(`./CSV/${name}`);
  });
  const json2D = await Promise.all(jsonArr);
  const latLons = json2D.flat();

  console.log("generating addresses...");
  const addresses = latLons.map(transformAddress);

  const fullObjs = addresses.map((address) => ({
    address,
    property: generateProperty(),
    fuels: generateFuel(),
    meterType: generateMeterType(),
    creditScore: generateCreditScore(),
  }));

  console.log("writing to file...");
  await writeFile("./result.json", JSON.stringify(fullObjs, null, 2));
  // fullObjs.forEach(console.log)
}

main();
