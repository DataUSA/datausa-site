// const sequelize = require("sequelize");

module.exports = function(app) {

  const {index, rows} = app.settings.cache.searchIndex;

  app.get("/api/search", async(req, res) => {

    let {limit = "10"} = req.query;
    limit = parseInt(limit, 10);

    const {id, q, dimension} = req.query;

    let results = [];

    if (id) {
      results = id.split(",").map(x => rows.find(row => row.id === x));
    }
    else if (!q) {
      let data = rows.sort((a, b) => b.zvalue - a.zvalue);
      if (dimension) data = data.filter(d => d.dimension === dimension);
      results = data.slice(0, limit);
    }
    else {

      const query = q.toLowerCase();
      const searchQuery = q
        .replace(/([A-z]{6,})/g, txt => `${txt}~${ Math.floor(txt.length / 6) }`)
        .replace(/([A-z]{2,})/g, txt => `${txt}*`);

      const searchResults = index.search(searchQuery)
        .map(d => {

          const data = rows.find(row => row.id === d.ref);
          const name = data.name.toLowerCase();
          const zvalue = data.zvalue;
          const zscore = zvalue * 0.15;

          let score = d.score;
          if (name === query) score = score * 300 + 25 * Math.abs(zscore);
          else if (name.startsWith(query)) {
            if (zvalue > 0) score = score * 57.5 + 25 * zscore;
            else score = score * 57.5 + (1 - Math.abs(zscore) * 25);
          }
          else if (query.startsWith(name.slice(0, 10))) score = score * 30 + Math.abs(zscore);
          else if (query.startsWith(name.slice(0, 5))) score = score * 15 + Math.abs(zscore);
          else score = score * 7.5 + zscore * 3.1;
          data.score = score;
          return data;

        });

      let data = searchResults.sort((a, b) => b.score - a.score);
      if (dimension) data = data.filter(d => d.dimension === dimension);
      results = data.slice(0, limit);
    }

    res.json({
      results,
      query: {dimension, id, limit, q}
    });

  });

};
