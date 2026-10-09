// Converted from legacy canon_cms_materializer #37 "Neighbors" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 37,
  name: "Neighbors",
  ordering: 2,
  allowed: "always",
  logic: (variables) => {
    const {socLevel, socParentID, listOccupations, mostSimilarOccup, id, avgSalary} = variables;

    const url = (id: any, name: any) => `<a href='/profile/soc/${id}'>${name}</a>`;

    const keys: any = ["Major Occupation Group", "Minor Occupation Group", "Broad Occupation", "Detailed Occupation"];
    const keyParentLevel = socLevel > 1 ? keys[socLevel - 2] : "";

    const _key = Object.keys(mostSimilarOccup[0]).reduce((all: any, d: any) => {
      if (
        !new RegExp(/(year|id|rank|workforce|wage)/, "gi").test(d)
      ) all.push(d);
      return all;
    }, []);

    const keySameLevel = _key[0];

    const item = mostSimilarOccup.find((d: any) => d[`${_key[0]} ID`] === id);
    const pos = mostSimilarOccup.findIndex((d: any) => d[`${_key[0]} ID`] === id);

    const averageWage = item["Average Wage"];
    const occupRank = item["Rank"];

    const categoriesSameLevel = listOccupations.filter((d: any) => d[`ID ${keyParentLevel}`] === socParentID).map((d: any) => url(d["ID " + keySameLevel], d[keySameLevel]));
    const neighbors = mostSimilarOccup.map((d: any) => url(d[keySameLevel + " ID"], d[keySameLevel]));

    const similarOccup = mostSimilarOccup.reduce((all: any, d: any) => {
      if (d[keySameLevel + " ID"] !== id) {
        all.push(
          {
            Name: d[keySameLevel], 
            ID: d[keySameLevel + " ID"], 
            Diff: Math.abs(d["Average Wage"] - avgSalary)
          }
        );
      }
      return all;
    }, []).sort((a: any, b: any) => a.Diff - b.Diff).slice(0, 3).map((d: any) => url(d["ID"], d["Name"]));

    let list: any = [...new Set(categoriesSameLevel)];
    if (list.length > 5) {
      const text: string = `${list.length - 5} more`;
      list = list.slice(0, 5);
      list.push(text);
    }

    return {
      occupRank,
      isFirstRank: occupRank === 1,
      isNotFirstRank: occupRank > 1,
      firstLevel: socLevel === 1,
      otherLevel: socLevel > 1,
      similarOccup,
      averageWage,
      keySameLevel, 
      categoriesSameLevel: list,
      neighbourMore: pos > 0 && neighbors[pos - 1],
      neighbourLess: pos < 4 && neighbors[pos + 1],
      neighborsPanel: neighbors.length > 3,
      isLowestPaid: pos === 4,
      isHighestPaid: pos === 0,
      isBetweenPaid: pos > 0 && pos < 4,
  
      neighbourLevel: _key[0]
    }

  }
};

export default materializer;
