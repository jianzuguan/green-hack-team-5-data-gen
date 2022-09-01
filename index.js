// import { promises as fs } from "fs"
// import fs from 'fs'
const fs = require("fs");
const csv = require("fast-csv");

async function loadMonoCounter() {
  const data = await fs.readFile("./CSV/ab.csv", "binary");
  return Buffer.from(data);
}

// const fs = require('fs')
// var parse = require('csv-parse')
// fs.readFile(inputPath, function (err, fileData) {
//   parse(fileData, {columns: false, trim: true}, function(err, rows) {
//     // Your CSV data is in an array of arrys passed to this callback as rows.
//   })
// })

const data = [];

const csvHeader = [
  "Postcode",
  "Positional_quality_indicator",
  "Eastings",
  "Northings",
  "Country_code",
  "NHS_regional_HA_code",
  "NHS_HA_code",
  "Admin_county_code",
  "Admin_district_code",
  "Admin_ward_code",
];

fs.createReadStream("./CSV/ab.csv")
  .pipe(csv.parse({ headers: csvHeader }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => data.push(row))
  .on("end", () => console.log(data));
