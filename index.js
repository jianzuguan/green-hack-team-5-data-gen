
import { promises as fs } from "fs"

async function loadMonoCounter() {
  const data = await fs.readFile("./CSV/ab.csv", "binary");
  return Buffer.from(data);
}

const fs = require('fs')
var parse = require('csv-parse')
fs.readFile(inputPath, function (err, fileData) {
  parse(fileData, {columns: false, trim: true}, function(err, rows) {
    // Your CSV data is in an array of arrys passed to this callback as rows.
  })
})