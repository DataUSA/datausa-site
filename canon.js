const d3Array = require("d3-array");

const {CANON_API, CANON_GEOSERVICE_API} = process ? process.env : {};

const geoRelations = {
  children: {
    url: id => `${CANON_API}/api/geo/children/${id}/`
  },
  districts: {
    url: id => `${CANON_API}/api/geo/children/${id}/?level=Congressional District`
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
    url: id => `${CANON_GEOSERVICE_API}/api/neighbors/${id}`,
    callback: resp => {
      if (resp.error) {
        console.error("[geoservice error]");
        console.error(resp.error);
        return [];
      }
      else {
        return (resp  || []).map(d => d.geoid);
      }
    }
  },
  parents: {
    url: id => `${CANON_API}/api/parents/geo/${id}`,
    callback: arr => arr.map(d => d.id)
  },
  similar: {
    url: id => `${CANON_API}/api/geo/similar/${id}`,
    callback: arr => arr.map(d => d.id)
  }
};

module.exports = {
  db: [
    {
      host: process.env.CANON_DB_HOST,
      name: process.env.CANON_DB_NAME,
      user: process.env.CANON_DB_USER,
      pass: process.env.CANON_DB_PW,
      tables: [
        require("@datawheel/canon-cms/models"),
        require("@datawheel/canon-core/models")
      ]
    }
  ],
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
        filter: cubes => {

          if (cubes.find(cube => cube.name.includes("_c_"))) {
            cubes = cubes.filter(cube => cube.name.includes("_c_"));
          }
          else if (cubes.find(cube => cube.name.includes("_2016_"))) {
            cubes = cubes.filter(cube => cube.name.includes("_2016_"));
          }

          return cubes.length === 1 ? cubes : cubes.filter(cube => cube.name.match(/_5$/g));

        },
        key: cube => cube.name.replace("_c_", "_").replace("_2016_", "_").replace(/_[0-9]$/g, "")
      },
      {
        filter: cubes => cubes.filter(c => c.name === "ipeds_graduation_demographics_v3"),
        key: cube => !cube ? "test" : cube.name === "ipeds_undergrad_grad_rate_demographics" || cube.name === "ipeds_graduation_demographics_v2" ? "ipeds_graduation_demographics_v3" : cube.name
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
      "Destination State": geoRelations,
      "Origin State": geoRelations,
      "Geography": geoRelations,
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
          "State": ["Nation"],
          "County": ["MSA", "State", "Origin State", "Destination State", "Nation"],
          "MSA": ["State", "Origin State", "Destination State", "Nation"],
          "Place": ["County", "MSA", "State", "Origin State", "Destination State", "Nation"],
          "PUMA": ["State", "Origin State", "Destination State", "Nation"]
        },
        url: (id, level) => {
          const targetLevel = level.toLowerCase();
          return `${CANON_GEOSERVICE_API}/api/relations/intersects/${id}?targetLevels=${targetLevel}&overlapSize=true`;
        },
        callback: resp => {
          let arr = [];
          if (resp.error) {
            console.error("[geoservice error]");
            console.error(resp.error);
          }
          else {
            arr = resp  || [];
          }
          arr = arr.filter(d => d.overlap_size > 0.00001).sort((a, b) => b.overlap_size - a.overlap_size);
          return arr.length ? arr.every(d => d.level === "state") ? arr.filter(d => d.level === "state").map(d => d.geoid) : arr[0].geoid : "01000US";
        }
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
