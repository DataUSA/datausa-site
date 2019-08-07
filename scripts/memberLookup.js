#! /usr/bin/env node

const axios = require("axios");
const fs = require("fs");

axios.get("https://graphite-api.datausa.io/cubes/pums_5/dimensions/Birthplace/hierarchies/Birthplace/levels/Birthplace/members?member_properties[]=Country%20Code&member_properties[]=US%20State%20Code")
  .then(resp => resp.data)
  .then(data => {

    const lookup = data.members.reduce((acc, d) => {
      acc[d.properties["Country Code"] || d.properties["US State Code"]] = d.key;
      return acc;
    }, {});

    fs.writeFile("./scripts/lookup.json", JSON.stringify(lookup), "utf8", err => {
      if (err) console.log(err);
      else console.log("created scripts/lookup.json");
    });

  });
