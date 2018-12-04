const d3Array = require("d3-array");
const {CANON_API, CANON_LOGICLAYER_CUBE} = process.env;

module.exports = {
  logiclayer: {
    aliases: {
      "CIP": "cip",
      "Geography": "geo",
      "measures": ["measure", "required"],
      "PUMS Industry": "naics",
      "PUMS Occupation": "soc",
      "University": "university",
      "Year": "year",
      "NAPCS": "napcs"
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
      "CIP2": "CIP",
      "Commodity L0": "PUMS Industry",
      "Commodity L1": "PUMS Industry",
      "Industry L0": "PUMS Industry",
      "Industry L1": "PUMS Industry",
      "OPEID": "University",
      "SCTG2": "NAPCS",
      "Destination State": "Geography",
      "Origin State": "Geography"
    },
    relations: {
      "Geography": {
        children: {
          url: id => `${CANON_API}/api/geo/children/${id}/`
        },
        tracts: {
          url: id => `${CANON_API}/api/geo/children/${id}/?level=Tract`
        },
        places: {
          url: id => `${CANON_API}/api/geo/children/${id}/&level=Place`
        },
        childrenCounty: {
          url: id => `${CANON_API}/api/geo/childrenCounty/${id}/`
        },
        neighbors: {
          url: id => `${CANON_LOGICLAYER_CUBE}/geoservice-api/neighbors/${id}`,
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
              ? `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevels}`
              : `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}`;
          },
          callback: arr => {
            const ids = arr.map(d => d.geoid);
            if (!ids.includes("01000US")) ids.push("01000US");
            return ids;
          }
        }
      },
      "CIP": {
        parents: {
          url: id => `${CANON_API}/api/parents/cip/${id}`
        }
      },
      "PUMS Industry": {
        parents: {
          url: id => `${CANON_API}/api/parents/naics/${id}`
        }
      },
      "NAPCS": {
        parents: {
          url: id => `${CANON_API}/api/parents/napcs/${id}`
        }
      },
      "PUMS Occupation": {
        parents: {
          url: id => `${CANON_API}/api/parents/soc/${id}`
        }
      },
      "University": {
        parents: {
          url: id => `${CANON_API}/api/parents/university/${id}`
        },
        similar: {
          url: id => `${CANON_API}/api/university/similar/${id}`,
          callback: arr => arr.map(d => d.id)
        }
      }
    },
    substitutions: {
      "Geography": {
        levels: {
          State: ["Nation"],
          County: ["State", "Nation"],
          MSA: ["State", "Nation"],
          Place: ["State", "Nation"],
          PUMA: ["State", "Nation"]
        },
        url: (id, level) => {
          const targetLevel = level.replace(/^[A-Z]{1}/g, chr => chr.toLowerCase());
          return `${CANON_LOGICLAYER_CUBE}/geoservice-api/relations/intersects/${id}?targetLevels=${targetLevel}&overlapSize=true`;
        },
        callback: arr => arr.sort((a, b) => b.overlap_size - a.overlap_size)[0].geoid
      },
      "CIP": {
        levels: {
          CIP6: ["CIP4", "CIP2"],
          CIP4: ["CIP2"]
        },
        url: (id, level) => `${CANON_API}/api/cip/parent/${id}/${level}/`,
        callback: resp => resp.id
      },
      "PUMS Industry": {
        levels: {
          "Industry Group": ["Industry L1", "Commodity L1", "Industry L0", "Commodity L0"],
          "Industry Sub-Sector": ["Industry L1", "Commodity L1", "Industry L0", "Commodity L0"],
          "Industry Sector": ["Industry L1", "Commodity L1", "Industry L0", "Commodity L0"]
        },
        url: (id, level) => `${CANON_API}/api/naics/${id}/io/${level.split(" ")[1]}`,
        callback: resp => resp.id
      },
      "NAPCS": {
        levels: {
          "NAPCS Section": ["SCTG2"],
          "NAPCS Group": ["SCTG2"],
          "NAPCS Class": ["SCTG2"]
        },
        url: id => `${CANON_API}/api/napcs/${id}/sctg/`,
        callback: resp => resp.map(d => d.id)
      },
      "University": {
        levels: {
          University: ["OPEID"]
        },
        url: id => `${CANON_API}/api/university/opeid/${id}/`,
        callback: resp => resp.opeid
      }
    }
  }
};
