const buble = require("buble"),
      shell = require("shelljs"),
      yaml = require("node-yaml");

const storyDir = "app/stories/";
const featured = ["06-12-2017_medicare-physicians"];

const isLogic = [
  "sum",
  "dataFormat"
];

const bubleSwap = obj => {
  console.log(obj);
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (isLogic.includes(key)) {
        let code = buble.transform(obj[key]).code;
        if (code.startsWith("!")) code = code.slice(1);
        obj[key] = code;
      }
      else if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(o => bubleSwap(o));
      }
      else if (typeof obj[key] === "object" && obj[key] !== null) {
        obj[key] = bubleSwap(obj[key]);
      }
    }
  }
  return obj;
};

module.exports = function(app) {

  app.get("/api/story", (req, res) => {

    const stories = [];
    shell.ls(`${storyDir}*.yml`).forEach(file => {

      const contents = yaml.readSync(`../${file}`);
      delete contents.topics;
      delete contents.footnotes;
      contents.authors = contents.authors.map(a => (delete a.about, a));
      contents.id = file.replace(storyDir, "").replace(".yml", "");
      contents.date = new Date(contents.id.substr(0, 10));
      if (featured.includes(contents.id)) contents.featured = 1;
      else contents.featured = 0;
      stories.push(contents);

    });

    res.json(stories.sort((a, b) => b.date - a.date || b.featured - a.featured)).end();

  });

  app.get("/api/story/:id", (req, res) => {
    const {id} = req.params;

    if (shell.test("-f", `${storyDir}${id}.yml`)) {
      const contents = yaml.readSync(`../${storyDir}${id}.yml`);
      contents.id = id;
      contents.date = new Date(contents.id.substr(0, 10));
      contents.topics.forEach(topic => {
        if (!topic.subtitles) topic.subtitles = [];
        if (!topic.selectors) topic.selectors = [];
        if (!topic.stats) topic.stats = [];
        if (!topic.descriptions) topic.descriptions = [];
        if (!(topic.descriptions instanceof Array)) topic.descriptions = [topic.descriptions];
        topic.descriptions = topic.descriptions.map(description => {
          const text = description
            .replace(/\<\<foot note=([0-9]+)\>\>/g, (match, g1) =>
              `<a class="footnote" href="#footnote${g1}"><sup>${g1}</sup></a>`
            );
          return {description: text};
        });
        if (!topic.visualizations) topic.visualizations = [];
        if (!(topic.visualizations instanceof Array)) topic.visualizations = [topic.visualizations];
        topic.visualizations = topic.visualizations.map(obj => ({logic: bubleSwap(`return {${obj}};`)}));
        if (!topic.type) topic.type = "TextViz";
      });
      res.json(contents).end();
    }
    else {
      res.sendStatus(404);
    }

  });

};
