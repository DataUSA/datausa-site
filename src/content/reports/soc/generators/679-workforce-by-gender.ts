// Converted from legacy canon_cms_generator #679 "Workforce by Gender" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 679,
  name: "Workforce by Gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Gender,Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count,Total+Population,Average+Wage,Average+Wage+Appx+MOE,Total+Population+MOE+Appx,Average+Age,Average+Age+Appx+MOE&filters=Record+Count.gte.5&time=Year.latest.2`,
  logic: (resp, {libs}) => {
    // /api/data?PUMS Occupation=<id>&Workforce Status=true&drilldowns=Gender&measures=Average Wage,Average Age,Average Age Appx MOE,Total Population,Total Population MOE Appx,Record Count&Record Count>=5

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear || d["Year"] === latestYear - 1);

    const yearMembers: any = [...new Set(data.map((d: any) => d["Year"]))].sort((a: any, b: any) => b - a);

    const _maleCurr = data.find((d: any) => d["Gender ID"] === 1 && d["Year"] === yearMembers[0]);
    const _femaleCurr = data.find((d: any) => d["Gender ID"] === 2 && d["Year"] === yearMembers[0]);

    const _malePrev = data.find((d: any) => d["Gender ID"] === 1 && d["Year"] === yearMembers[1]);
    const _femalePrev = data.find((d: any) => d["Gender ID"] === 2 && d["Year"] === yearMembers[1]);

    const maleCurr: any = _maleCurr ? _maleCurr["Total Population"] : false;
    const maleCurrMoe: any = _maleCurr ? _maleCurr["Total Population MOE Appx"] : false;
    const malePrev: any = _malePrev ? _malePrev["Total Population"]: false;
    const malePrevMoe: any = _malePrev ? _malePrev["Total Population MOE Appx"] : false;

    const femaleCurr: any = _femaleCurr ? _femaleCurr["Total Population"] : false;
    const femaleCurrMoe: any = _femaleCurr ? _femaleCurr["Total Population MOE Appx"] : false;
    const femalePrev: any = _femalePrev ? _femalePrev["Total Population"] : false;
    const femalePrevMoe: any = _femalePrev ? _femalePrev["Total Population MOE Appx"] : false;

    const total = maleCurr + femaleCurr;

    const maleShareCurr = 100 * (maleCurr / total);
    const femaleShareCurr = 100 * (femaleCurr / total);

    const femaleAge: any = _femaleCurr ? _femaleCurr["Average Age"] : false;
    const maleAge: any = _maleCurr ? _maleCurr["Average Age"] : false;

    return {
      yearMembers,
  
      socAvgAgeMale: _maleCurr ? _maleCurr["Average Age"] : false,
      socAvgAgeFemale: _femaleCurr ? _femaleCurr["Average Age"] : false,
      socAvgMaleSalary: _maleCurr ? _maleCurr["Average Wage"] : false,
      socAvgFemaleSalary: _femaleCurr ? _femaleCurr["Average Wage"] : false,
  
      femaleCurr,
      femaleCurrMoe,
      femaleShareCurr,
      femaleAge,
      femaleAgeMoe: _femaleCurr ? _femaleCurr["Average Age Appx MOE"] : false,

      maleCurr,
      maleCurrMoe,
      maleShareCurr,
      maleAge,
      maleAgeMoe: _maleCurr ? _maleCurr["Average Age Appx MOE"] : false,
  
      gender1Name: maleShareCurr > femaleShareCurr ? "Male" : "Female",
      gender1Share: maleShareCurr > femaleShareCurr ? maleShareCurr : femaleShareCurr,
      genderAgeDiff: maleAge - femaleAge,
      genderAgeDiffAbs: Math.abs(maleAge - femaleAge)
    }
  }
};

export default generator;
