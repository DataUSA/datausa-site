#! /usr/bin/env node

// Directory containing shapefiles
const shapeFilesDirectory = 'scripts/shapes';
// Output file
const outputFile = 'scripts/topo.json';
// topojson key
const key = "pumas";

const dir = process.cwd();

const fs = require('fs').promises;
const path = require('path');
const shapefile = require('shapefile');
const topojson = require('topojson');
const {merge} = require("d3-array");

// Function to recursively get all files in a directory
async function getAllFiles(directory) {
    let files = [];
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        const filePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(await getAllFiles(filePath));
        } else {
            files.push(filePath);
        }
    }
    return files;
}

// Function to load shapefiles from all sub-directories
async function loadShapeFiles(directory) {
    const shapeFiles = (await getAllFiles(directory)).filter(file => file.endsWith('.shp'));
    const geometries = await Promise.all(shapeFiles.map(async file => {
        const json = await shapefile.read(file, file.replace(".shp", ".dbf"));
        json.features.forEach(d => {
          d.id = `79500US${d.properties.GEOID20}`;
          delete d.properties;
        });
        return json;
    }));
    return merge(geometries.map(d => d.features));
}

// Function to combine shapefiles into a single TopoJSON object
async function combineShapeFiles(directory) {
    const geometries = await loadShapeFiles(directory);
    console.log(geometries[0]);
    const combinedTopology = topojson.topology({[key]: {type: "FeatureCollection", features: geometries}});
    // console.log(combinedTopology);
    return combinedTopology;
}

// Combine shapefiles into a single TopoJSON object
combineShapeFiles(path.join(dir, shapeFilesDirectory))
    .then(combinedTopoJSON => {
        // Write the combined TopoJSON to a file
        return fs.writeFile(path.join(dir, outputFile), JSON.stringify(combinedTopoJSON))
            .then(() => console.log('Combined TopoJSON saved to', outputFile));
    })
    .catch(error => console.error('Error:', error));
