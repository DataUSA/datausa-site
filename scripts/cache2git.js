#! /usr/bin/env node

const fs = require("fs");
const shell = require("shelljs");
const {nest} = require("d3-collection");

const folder = process.argv[2];

if (!folder) {
  console.error("Please provide a folder of results as the first argument.");
  shell.exit(1);
}

let txt = "";

fs.readdir(folder, (err, files) => {
  files.forEach(file => {
    if (!file.includes("results")) {
      const profile = file.match(/profile_([a-z]{3})/)[1];
      const results = JSON.parse(fs.readFileSync(`${folder}/${file}`));
      console.log(profile, results.length);
      if (results.length) txt += `## \`${profile}\` profile`;
      nest()
        .key(arr => arr[1][0])
        .entries(results)
        .sort((a, b) => b.values.length - a.values.length)
        .forEach(group => {
          const url = group.key;
          const slug = url.match(/profile\/[a-z]+\/([a-z\-]+)/)[1];
          const nas = group.values.length;
          console.log(slug, nas);
          txt += `\n - [ ] [${slug}](${url}) (${nas} N/A${nas > 1 ? "s" : ""})`;
        })
      if (results.length) txt += `\n\n---\n\n`;
    }
  });

  fs.writeFile("./scripts/cache-result.md", txt, "utf8", err => {
    if (err) {
      console.log(err);
      shell.exit(1);
    }
    else {
      console.log("created scripts/cache-result.md");
      shell.exit(0);
    }
  });

});
