const d3Array = require("d3-array");
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
          const ids = d3Array.merge(query.dimensions
            .filter(d => d.dimension === "Geography")
            .map(d => d.id));
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
    dimensionMap: {
      Destination: "Geography",
      Origin: "Geography"
    },
    relations: {
      Geography: {
        children: {
          url: id => {
            const prefix = id.slice(0, 3);
            const targetLevels = prefix === "010" ? "state"
              : prefix === "040" ? "county"
                : prefix === "050" ? "tract"
                  : prefix === "310" ? "county"
                    : prefix === "160" ? "tract"
                      : false;
            return targetLevels
              ? `${CUBE_URL}/geoservice-api/relations/children/${id}?targetLevels=${targetLevels}`
              : `${CUBE_URL}/geoservice-api/relations/children/${id}`;
          },
          callback: arr => arr.map(d => d.geoid)
        },
        counties: {
          url: id => `${CUBE_URL}/geoservice-api/relations/children/${id}?targetLevels=county`,
          callback: arr => arr.map(d => d.geoid)
        },
        neighbors: {
          url: id => `${CUBE_URL}/geoservice-api/neighbors/${id}`,
          callback: arr => arr.map(d => d.geoid)
        },
        parents: {
          url: id => {
            const prefix = id.slice(0, 3);
            const targetLevels = prefix === "040" ? "nation" /* state */
              : prefix === "050" ? "nation,state" /* county */
                : prefix === "310" ? "nation,state" /* msa */
                  : prefix === "160" ? "nation,state" /* place */
                    : prefix === "795" ? "nation,state" /* puma */
                      : false;
            return targetLevels
              ? `${CUBE_URL}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevels}`
              : `${CUBE_URL}/geoservice-api/relations/intersects/${id}`;
          },
          callback: arr => {
            const ids = arr.map(d => d.geoid);
            if (!ids.includes("01000US")) ids.push("01000US");
            return ids;
          }
        },
        places: {
          url: id => `${CUBE_URL}/geoservice-api/relations/children/${id}?targetLevels=place`,
          callback: arr => arr.map(d => d.geoid)
        },
        pumas: {
          url: id => `${CUBE_URL}/geoservice-api/relations/children/${id}?targetLevels=puma`,
          callback: arr => arr.map(d => d.geoid)
        },
        states: {
          url: id => `${CUBE_URL}/geoservice-api/relations/children/${id}?targetLevels=state`,
          callback: arr => arr.map(d => d.geoid)
        },
        tracts: {
          url: id => `${CUBE_URL}/geoservice-api/relations/children/${id}?targetLevels=tract`,
          callback: arr => arr.map(d => d.geoid)
        }
      },
      University: {
        similar: {
          url: id => `${CANON_API}/api/university/similar/${id}`,
          callback: arr => arr.map(d => d.id)
        }
      }
    },
    substitutions: {
      Geography: {
        levels: {
          State: ["Nation"],
          County: ["State", "Nation"],
          Msa: ["State", "Nation"],
          Place: ["State", "Nation"],
          Puma: ["State", "Nation"]
        },
        url: (id, level) => {
          const targetLevel = level.replace(/^[A-Z]{1}/g, chr => chr.toLowerCase());
          return `${CUBE_URL}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevel}&overlapSize=true`;
        },
        callback: arr => arr.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid
      }
    }
  }
};
