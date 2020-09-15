#! /usr/bin/env node
const axios = require("axios"),
      fs = require("fs"),
      shell = require("shelljs"),
      {parse} = require("node-html-parser");

const level = process.argv[2];
const urls = {
  senators: "https://en.wikipedia.org/api/rest_v1/page/segments/List_of_current_United_States_senators",
  representatives: "https://en.wikipedia.org/api/rest_v1/page/segments/List_of_current_members_of_the_United_States_House_of_Representatives"
};

const tableIDs = {
  senators: "senators",
  representatives: "votingmembers"
};

if (!level || !urls[level]) {
  console.error(`Process must contain one of the following arguments: ${Object.keys(urls).join(", ")}`);
  shell.exit(1);
}

/** */
async function run() {

  const wikiURL = urls[level];
  const {segmentedContent} = await axios.get(wikiURL, {headers: {"User-Agent": "hello@datausa.io"}})
    .then(resp => resp.data)
    .catch(err => {
      console.log(err);
      shell.exit(1);
    });
  const table = parse(segmentedContent).querySelector(`#${tableIDs[level]}`);

  const headers = table.querySelector("tbody tr")
    .querySelectorAll("th")
    .reduce((arr, d) => {
      const cols = d.rawAttrs.includes("colspan") ? +d.rawAttrs.match(/colspan="([0-9])"/)[1] : 1;
      const text = d.querySelector("span").innerHTML
        .replace(/\<br[\s\=\"\'A-z0-9]{1,}\/\>/g, " ");
      for (let i = 0; i < cols; i++) arr.push(text);
      return arr;
    }, []);

  let colOffset = 0;
  const candidates = table.querySelectorAll("tr")
    .slice(1)
    // .slice(7, 12)
    .reduce((arr, row, ii) => {
      const obj = {};
      // console.log(row);
      row.childNodes
        .filter(d => d.nodeType !== 3)
        .forEach((column, i) => {
          const header = headers[i + colOffset]
            .replace(/<br[^>]*>/g, " ");
          let data = column;
          while (data.querySelector(".cx-segment") || data.querySelector(".cx-link")) {
            data = data.querySelector(".cx-segment") || data.querySelector(".cx-link");
          }
          if (header === "District") {
            const value = data.innerHTML
              .replace("<span typeof=\"mw:Entity\"> </span>", " ");
            const split = value.split(" ");
            const district = split.pop();
            obj.District = district;
            obj.State = split.join(" ");
          }
          else if (header === "Image") {
            obj[header] = `https:${data.querySelector("img").getAttribute("src")}`;
          }
          else if (header === "Term up") {
            obj[header] = data.innerHTML.slice(0, 4);
          }
          else if (!["Born", "Education", "Prior experience", "Occupation(s)", "Previous office(s)", "Residence"].includes(header)) {
            obj[header] = data.innerHTML
              .replace("<span typeof=\"mw:Entity\"> </span>", " ")
              .split("<sup")[0]
              .split(" <span")[0];
          }
          if (column.querySelector(".mw-ref")) {
            const ref = JSON.parse(column.querySelector(".mw-ref").getAttribute("data-mw"));
            if (ref.parts && ref.parts[0].template.params["1"]) {
              obj.note = ref.parts[0].template.params["1"]
                .wt.split("<ref>")[0]
                .replace(/\[\[/g, "")
                .replace(/\]\]/g, "");
            }
          }

          if (header === "Member" && column.querySelector("img")) {
            obj.Image = `https:${column.querySelector("img").getAttribute("src")}`;
          }
        });

      if (colOffset) {
        obj[headers[0]] = arr[ii - 1][headers[0]];
      }
      const firstColumn = row.childNodes
        .filter(d => d.nodeType !== 3)[0];
      colOffset = firstColumn.rawAttrs.includes("rowspan") ? +firstColumn.rawAttrs.match(/rowspan="([0-9])"/)[1] - 1 : 0;

      // console.log(obj);
      arr.push(obj);
      return arr;
    }, []);

  fs.writeFile(`./static/data/${level}.json`, JSON.stringify(candidates, null, 2), "utf8", err => {
    if (err) console.log(err);
    else console.log(`created static/data/${level}.json`);
    process.exit(0);
  });

}

run();
