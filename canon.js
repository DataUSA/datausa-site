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
            .map(d => d.id instanceof Array ? d.id : [d.id]));

          const onlyNation = cubes.find(cube =>
            cube.name.includes("acs_ygpsar_poverty_by_gender_age_race") ||
            cube.name.includes("acs_ygf_place_of_birth_for_foreign_born")
          );

          const bigGeos = ids.length ? onlyNation ? ids.every(g => g === "01000US") : ids.every(g => pops[g] && pops[g] >= 250000) : true;
          const drilldowns = query.dimensions.filter(d => {
            const relation = d.relation || "";
            return relation.includes("Tract") || relation.includes("Place");
          }).length;

          return cubes.filter(cube => cube.name.match(bigGeos && !drilldowns ? /_1$/g : /_5$/g));

        },
        key: cube => cube.name.replace("_c_", "_").replace(/_[0-9]$/g, "")
      },
      {
        filter: cubes => cubes.filter(c => c.name.includes("_c_")),
        key: cube => cube.name.replace("_c_", "_")
      },
      {
        filter: cubes => cubes.filter(c => c.name === "ipeds_graduation_demographics_v3"),
        key: cube => cube.name === "ipeds_undergrad_grad_rate_demographics" || cube.name === "ipeds_graduation_demographics_v2" ? "ipeds_graduation_demographics_v3" : cube.name
      }
    ],
    dimensionMap: {
      "CIP2": "CIP",
      "Industry": "PUMS Industry",
      "Commodity L0": "PUMS Industry",
      // "Commodity L1": "PUMS Industry",
      "Industry L0": "PUMS Industry",
      // "Industry L1": "PUMS Industry",
      "Occupation": "PUMS Occupation",
      "OPEID": "University",
      "SCTG2": "NAPCS",
      "Destination State": "Geography",
      "Origin State": "Geography"
    },
    relations: {
      "Origin State": {
        neighbors: {
          url: id => `${CANON_LOGICLAYER_CUBE}/geoservice-api/neighbors/${id}`,
          callback: arr => arr.map(d => d.geoid)
        },
        parents: {
          url: id => `${CANON_API}/api/parents/geo/${id}`,
          callback: arr => arr.map(d => d.id)
        },
        similar: {
          url: id => `${CANON_API}/api/geo/similar/${id}`,
          callback: arr => arr.map(d => d.id)
        }
      },
      "Geography": {
        children: {
          url: id => `${CANON_API}/api/geo/children/${id}/`
        },
        tracts: {
          url: id => `${CANON_API}/api/geo/children/${id}/?level=Tract`
        },
        places: {
          url: id => `${CANON_API}/api/geo/children/${id}/?level=Place`
        },
        childrenCounty: {
          url: id => `${CANON_API}/api/geo/childrenCounty/${id}/`
        },
        neighbors: {
          url: id => `${CANON_LOGICLAYER_CUBE}/geoservice-api/neighbors/${id}`,
          callback: arr => arr.map(d => d.geoid)
        },
        parents: {
          url: id => `${CANON_API}/api/parents/geo/${id}`,
          callback: arr => arr.map(d => d.id)
        },
        similar: {
          url: id => `${CANON_API}/api/geo/similar/${id}`,
          callback: arr => arr.map(d => d.id)
        }
      },
      "CIP": {
        parents: {
          url: id => `${CANON_API}/api/parents/cip/${id}`,
          callback: arr => arr.map(d => d.id)
        }
      },
      "PUMS Industry": {
        parents: {
          url: id => `${CANON_API}/api/parents/naics/${id}`,
          callback: arr => arr.map(d => d.id)
        }
      },
      "NAPCS": {
        parents: {
          url: id => `${CANON_API}/api/parents/napcs/${id}`,
          callback: arr => arr.map(d => d.id)
        }
      },
      "PUMS Occupation": {
        parents: {
          url: id => `${CANON_API}/api/parents/soc/${id}`,
          callback: arr => arr.map(d => d.id)
        }
      },
      "University": {
        parents: {
          url: id => `${CANON_API}/api/parents/university/${id}`,
          callback: arr => arr.map(d => d.id)
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
          County: ["MSA", "State", "Nation"],
          MSA: ["State", "Nation"],
          Place: ["MSA", "State", "Nation"],
          PUMA: ["State", "Nation"]
        },
        url: (id, level) => {
          const targetLevel = level.toLowerCase();
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
          "Industry Group": ["Industry", "Industry L0", "Commodity L0"],
          "Industry Sub-Sector": ["Industry", "Industry L0", "Commodity L0"],
          "Industry Sector": ["Industry", "Industry L0", "Commodity L0"]
        },
        url: (id, level) => `${CANON_API}/api/naics/${id}/${level}`,
        callback: resp => resp
      },
      "PUMS Occupation": {
        levels: {
          "Major Occupation Group": ["Occupation"],
          "Minor Occupation Group": ["Occupation"],
          "Broad Occupation": ["Occupation"],
          "Detailed Occupation": ["Occupation"]
        },
        url: id => `${CANON_API}/api/soc/${id}/bls`,
        callback: resp => resp
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
