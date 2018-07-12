const {CANON_API, CUBE_URL} = process.env;

module.exports = {
  "canon-logic": {
    aliases: {
      "CIP": "cip",
      "Geography": "geo",
      "measures": ["measure", "required"],
      "PUMS Industry": "naics",
      "PUMS Occupation": "soc",
      "University": "university",
      "Year": "year"
    },
    cubeFilters: [
      {
        filter: (cubes, query, caches) => {
          const {pops} = caches;
          const ids = query.dimensions.map(d => d.id);
          const bigGeos = ids.every(g => pops[g] && pops[g] >= 250000);
          return cubes.filter(cube => cube.name.match(bigGeos ? /_1$/g : /_5$/g));
        },
        key: cube => cube.name.replace(/_[0-9]$/g, "")
      },
      {
        filter: cubes => cubes.filter(c => c.name.includes("_c_")),
        key: cube => cube.name.replace("_c_", "_")
      },
      {
        filter: cubes => cubes.filter(c => c.name.includes("_c_")),
        key: cube => cube.name.replace("_c_", "_").replace(/_[0-9]$/g, "")
      }
    ],
    relations: {
      Geography: {
        children: {
          url: id => `${CUBE_URL}/geoservice-api/relations/children/${id}`,
          callback: arr => arr.map(d => d.geoid)
        },
        neighbors: {
          url: id => `${CUBE_URL}/geoservice-api/neighbors/${id}`,
          callback: arr => arr.map(d => d.geoid)
        },
        parents: {
          url: id => `${CUBE_URL}/geoservice-api/relations/parents/${id}`,
          callback: arr => arr.map(d => d.geoid)
        }
      }
    }
  },
  "canon-search": {
    aliases: {
      "CIP": "cip",
      "Geography": "geo",
      "PUMS Industry": "naics",
      "PUMS Occupation": "soc",
      "University": "university"
    }
  }
};
