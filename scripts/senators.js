#! /usr/bin/env node
const axios = require("axios"),
      fs = require("fs"),
      {parse} = require("node-html-parser");

/** */
async function run() {

  const wikiURL = "https://en.wikipedia.org/api/rest_v1/page/segments/List_of_current_United_States_senators";
  const {segmentedContent} = await axios.get(wikiURL).then(resp => resp.data);
  const table = parse(segmentedContent).querySelector("#senators");

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
  const senators = table.querySelectorAll("tr")
    .slice(1)
    // .slice(1, 5)
    .reduce((arr, row, ii) => {
      const obj = {};
      // console.log(row);
      row.childNodes
        .filter(d => d.nodeType !== 3)
        .forEach((column, i) => {
          const header = headers[i + colOffset];
          let data = column;
          while (data.querySelector(".cx-segment") || data.querySelector(".cx-link")) {
            data = data.querySelector(".cx-segment") || data.querySelector(".cx-link");
          }
          if (header === "Image") {
            obj[header] = `https:${data.querySelector("img").getAttribute("src")}`;
          }
          else if (header === "Term up") {
            obj[header] = data.innerHTML.slice(0, 4);
          }
          else if (!["Born", "Occupation(s)", "Previous office(s)", "Residence"].includes(header)) {
            obj[header] = data.innerHTML.split("<sup")[0];
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

  fs.writeFile("./static/data/senators.json", JSON.stringify(senators, null, 2), "utf8", err => {
    if (err) console.log(err);
    else console.log("created static/data/senators.json");
    process.exit(0);
  });

}

run();
