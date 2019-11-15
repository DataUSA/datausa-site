const d3Array = require("d3-array");

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

          if (cubes.find(cube => cube.name.includes("_c_"))) {
            cubes = cubes.filter(cube => cube.name.includes("_c_"));
          }
          else if (cubes.find(cube => cube.name.includes("_2016_"))) {
            cubes = cubes.filter(cube => cube.name.includes("_2016_"));
          }

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
        key: cube => cube.name.replace("_c_", "_").replace("_2016_", "_").replace(/_[0-9]$/g, "")
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
    }
  }
};
