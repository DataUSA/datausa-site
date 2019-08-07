#! /usr/bin/env node

const fs = require("fs");

const topojson = JSON.parse(fs.readFileSync("./scripts/input.json"));

const objects = {
  birthplace: {
    type: "GeometryCollection",
    geometries: []
  }
};

for (const key in topojson.objects) {
  console.log(key);
  objects.birthplace.geometries = objects.birthplace.geometries.concat(topojson.objects[key].geometries);
}

topojson.objects = objects;

fs.writeFile("./scripts/output.json", JSON.stringify(topojson), "utf8", err => {
  if (err) console.log(err);
  else console.log("created scripts/output.json");
});
