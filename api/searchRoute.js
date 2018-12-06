// const sequelize = require("sequelize");

module.exports = function(app) {

  const {index, rows, totals} = app.settings.cache.searchIndex;

  app.get("/api/search", async(req, res) => {

    let {limit = "10"} = req.query;
    limit = parseInt(limit, 10);

    const {id, q, dimension} = req.query;

    let results = [];

    if (id) {
      results = id.split(",").map(x => rows[x]);
    }
    else if (!q) {
      let data = Object.values(rows).sort((a, b) => b.zvalue - a.zvalue);
      if (dimension) data = data.filter(d => d.dimension === dimension);
      results = data.slice(0, limit);
    }
    else {

      const query = q.toLowerCase();
      let searchQuery = q
        .replace(/([A-z]{2,})/g, txt => `+${txt}`)
        // .replace(/([A-z]{7,})/g, txt => `${txt}~${ Math.floor((txt.length - 1) / 6) }`)
        .replace(/(.)$/g, txt => `${txt}*`);

      if (dimension) searchQuery = `+dimension:${dimension} ${searchQuery}`;

      const searchResults = index.search(searchQuery)
        .map(d => {

          const data = rows[d.ref];
          const name = data.name.toLowerCase();
          const zvalue = data.zvalue;
          const zscore = zvalue * 0.15;

          let score = d.score;
          const diffMod = query.length / name.length;
          if (name === query) score = 1000000;
          else if (name.startsWith(query)) score *= 20 * diffMod;
          else if (query.startsWith(name.slice(0, 10))) score *= 10 * diffMod;
          else if (query.startsWith(name.slice(0, 5))) score *= 5 * diffMod;
          data.score = score * 7.5 + zscore * 3.1;
          return data;

        });

      results = searchResults.sort((a, b) => b.score - a.score).slice(0, limit);
    }

    res.json({
      results,
      query: {dimension, id, limit, q},
      totals
    });

  });

};
