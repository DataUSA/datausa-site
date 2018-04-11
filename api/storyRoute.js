const shell = require("shelljs"),
      yaml = require("node-yaml");

const storyDir = "app/toCMS/stories/";

module.exports = function(app) {

  app.get("/api/story", (req, res) => {

    const stories = [];
    shell.ls(`${storyDir}*.yml`).forEach(file => {

      const contents = yaml.readSync(`../${file}`);
      delete contents.topics;
      delete contents.footnotes;
      contents.authors = contents.authors.map(a => (delete a.about, a));
      contents.id = file.replace(storyDir, "").replace(".yml", "");
      stories.push(contents);

    });

    res.json(stories).end();

  });

  app.get("/api/story/:id", (req, res) => {
    const {id} = req.params;

    if (shell.test("-f", `${storyDir}${id}.yml`)) {
      const contents = yaml.readSync(`../${storyDir}${id}.yml`);
      contents.id = id;
      res.json(contents).end();
    }
    else {
      res.send(404);
    }

  });

};
