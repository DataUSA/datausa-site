#! /usr/bin/env node

const PromiseThrottle = require("promise-throttle"),
      axios = require("axios"),
      chalk = require("chalk"),
      path = require("path"),
      readline = require("readline"),
      sharp = require("sharp"),
      shell = require("shelljs");

const {strip} = require("d3plus-text");

const cube = process.argv[2];
const accepted = ["president", "senate", "house"];
if (!cube || !accepted.includes(cube)) {
  console.error(`Process must contain one of the following arguments: ${accepted.join(", ")}`);
  shell.exit(1);
}

const predefined = {
  "George Bush": "George H. W. Bush",
  "George Walker Bush": "George W. Bush",
  "Rafael Edward Ted Cruz": "Ted Cruz",
  "Joseph R Biden Jr.": "Joe Biden",
  "James Mac Warren": "James Warren",
  "Robert Kennedy":"Robert F. Kennedy Jr."
};

const matchWords = [
  "activist",
  "campaign",
  "congress",
  "candidate",
  "mayor",
  "politic",
  "president",
  "senat",
  "social",
  "united states",
  "u.s.",
  "party"
];

/** */
function matches(str) {
  let match = 0;
  const l = str.toLowerCase();
  matchWords.forEach(m => {
    if (l.includes(m)) match++;
  });
  return match;
}

const {CANON_CONST_TESSERACT} = process.env;
const prefix = CANON_CONST_TESSERACT;

const throttle = new PromiseThrottle({
  requestsPerSecond: 5,
  promiseImplementation: Promise
});

let total = 0;
let checked = 0;
const fixes = [];

/** */
async function printProgress() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  checked++;
  const percentage = checked / total;
  process.stdout.write(`${(percentage * 100).toFixed(0)}% (${checked} out of ${total})`);
  return true;
}

/** */
function getFileName(member) {
  const key = member.key || member["Candidate ID"];
  return path.join(process.cwd(), `static/images/candidates/${cube}/${key}.jpg`);
}

/** */
async function fetchImage(member) {

  const {fixed, key, name} = member;
  const filePath = getFileName(member);

  if (shell.test("-e", filePath)) {
    printProgress();
    return true;
  }
  else {
    const split = name.split(" ");
    const firstLast = fixed ? name : predefined[name] || `${split[0]}_${split[split.length - 1]}`;
    const wikiURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${firstLast}`;
    return axios.get(wikiURL)
      .then(resp => resp.data)
      .then(resp => {
        if (resp.thumbnail) {
          return axios.get(resp.thumbnail.source, {responseType: "arraybuffer"})
            .then(d => d.data)
            .then(res => Promise.all([
              sharp(res).toFile(filePath)
            ]))
            .then(() => {
              console.log(chalk.bold.green(`\nNew image for ${name}`));
              return true;
            });
        }
        else if (resp.extract && (resp.extract.includes("refer to") || resp.extract.includes("refers to"))) {
          const lines = resp.extract
            .replace(/^.+:/g, "");
          if (!lines.length) return true;
          let names = lines
            .split("\n")
            .filter(d => {
              const years = d.match(/\(([0-9]{4})\–([0-9]{4})\)/);
              if (years) {
                const start = +years[1];
                const end = +years[2];
                return start > 1876 && end > 1976;
              }
              return true;
            })
            .filter(matches)
            .map(d => d.replace(/\,.+$/g, "").replace(/\s\(.+\)$/g, ""));
          if (predefined[name]) names = predefined.filter(d => d === predefined[name]);
          const uniques = Array.from(new Set(names));
          const exactMatch = names.length === 1 ? names
            : names.filter(n => {
              const oMod = strip(name.toLowerCase());
              const nMod = strip(n.toLowerCase());
              if (oMod === nMod) return true;
              if (split.length > 2) {
                const oAbb = oMod.split("-").map((d, i, arr) => !i || i === arr.length - 1 ? d : d.slice(0, 1)).join(" ");
                const nAbb = nMod.split("-").map((d, i, arr) => !i || i === arr.length - 1 ? d : d.slice(0, 1)).join(" ");
                return oAbb === nAbb;
              }
              return false;
            });
          if (exactMatch.length === 1) {
            // console.log("Fixed:", name, exactMatch);
            checked--;
            fixes.push(throttle.add(fetchImage.bind(this, {key, name: exactMatch[0], fixed: true})));
          }
          else if (!names.length || names.length !== uniques.length) {
            return true;
          }
          else {
            console.log(chalk.yellow(`\nMultiples found for ${name}:`));
            names.forEach(n => console.log(chalk.grey(` - ${n}`)));
            return true;
          }
        }
        return true;
      })
      .then(printProgress)
      .catch(printProgress);

  }

}
const dictUrl = {
  "president": ["President", "Candidate+Votes"],
  "senate": ["Senate", "Candidate+Votes"],
  "house": ["House_Compact", "Winner+Votes"]
};

const url = `${prefix}tesseract/data?cube=Data_USA_${dictUrl[cube][0]}_election&drilldowns=Candidate&measures=${dictUrl[cube][1]}`

/** */
async function run() {

  const members = await axios.get(url)
    .then(resp => resp.data.data)
    .catch(err => {
      console.error(`Error fetching members: ${err}`);
      return [];
    });

  members.forEach(d => {
    d.name = d.Candidate || d["Winning Canidate"]
    d.key = d["Canidate ID"] || d["Winning Canidate ID"]
  });

  total = members.length;

  if (!total) shell.exit(1);
  console.log(`${total} total candidates in database`);

  const fetches = [];

  members
    // .slice(0, 1)
    //.filter(member => member.name === "Joseph R Biden Jr.")
    .filter(member => {
      const filePath = getFileName(member);

      if (shell.test("-e", filePath)) {
        checked++;
        return false;
      }
      return true;
    })
    .forEach(member => fetches.push(throttle.add(fetchImage.bind(this, member))));

  await Promise.all(fetches);

  await Promise.all(fixes);

  shell.exit(0);

}

run();
