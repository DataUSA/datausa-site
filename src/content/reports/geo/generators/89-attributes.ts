// Converted from legacy canon_cms_generator #89 "[Attributes]" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 89,
  name: "[Attributes]",
  allowed: "always",
  api: attrs => `/api/search?id=${attrs.id1}&dimension=Geography`,
  logic: (resp, {libs}) => {
    const data = resp.results[0];
    const {titleCase} = libs.d3plus;

    const {
      dimension, 
      hierarchy,
      id, 
      name,
      slug,
      sumlevel
    } = data;

    const hierarchyNames: Record<string, any> = {
      "MSA": "Metropolitan Statistical Area (MSA)",
      "Place": "Census Place",
      "PUMA": "Public Use Microdata Area (PUMA)"
    };

    const prismExceptions: any = [
      "buena-vista-city-va",
      "charlottesville-city-va",
      "emporia-city-va",
      "fairfax-city-va",
      "lexington-city-va",
      "martinsville-city-va",
      "norton-city-va",
      "winchester-city-va"
    ]

    const hierarchyTitle = hierarchy in hierarchyNames ? hierarchyNames[hierarchy] : hierarchy;
            
    const lower = (d: any) => d.includes("MSA") || d.includes("PUMA") ? d : d.toLowerCase();

    const prefix = id.slice(0, 3);
    const child = prefix === "010" ? "state"
      : prefix === "040" ? "county"
        : prefix === "050" ? "tract"
          : prefix === "310" ? "county"
            : prefix === "160" ? "place"
              : prefix === "795" ? "PUMA"
                : prefix === "500" ? "tract"
                  : lower(hierarchy);
              
              
    const isNationStatePuma = hierarchy === "Nation" || hierarchy === "State" || hierarchy === "PUMA"
    const isNationState = hierarchy === "Nation" || hierarchy === "State"
    const isState = hierarchy === "State"
    const notNationStatePuma = !isNationStatePuma
    const notNationStatePumaMSA = !isNationStatePuma && hierarchy !== "MSA"
    const isCountyStateMSA = hierarchy === "County" || hierarchy === "State" || hierarchy === "MSA"
    const isCountyStateMSAnotPR = hierarchy === "County" || (hierarchy === "State" && id !== "04000US72") || hierarchy === "MSA" 
    const isNationStateDistrict = hierarchy === "Nation" || hierarchy === "State" || hierarchy === "District"
    const isStateDistrictPumaMSAPlace = hierarchy === "State" || hierarchy === "District" || hierarchy === "PUMA" || hierarchy === "MSA" || hierarchy === "Place" 
    const notNationStateDistrict = !isNationStateDistrict
    const isNotMSA = hierarchy !== "MSA" 
    const isNotNation = hierarchy !== "Nation" 
    const isCounty = hierarchy === "County" 
    const isPrismCounty = hierarchy === "County" && !prismExceptions.includes(slug); 
    const isMsaOrPuma = hierarchy === "MSA" || hierarchy === "PUMA" 
    const isMSA = hierarchy === "MSA"
    const isNotDistrict = hierarchy !== "Congressional District"
    const isMSAorCounty = hierarchy === "MSA" || hierarchy === "County" 
    const isStateCounty = hierarchy === "County" || hierarchy === "State"
    const isNationStateCounty = hierarchy === "Nation" || hierarchy === "County" || hierarchy === "State"
    const isNationStateCountyPlace = hierarchy === "Nation" || hierarchy === "County" || hierarchy === "State" || hierarchy === "Place"
    const isNationStateCountynotPR = hierarchy === "Nation" || hierarchy === "County" || (hierarchy === "State" && id !== "04000US72")
    const isStatePumaMsaCounty = hierarchy === "State" || hierarchy === "MSA" || hierarchy === "PUMA" || hierarchy === "County"

    return {
      isNotNation,
      isMsaOrPuma,
      isStatePumaMsaCounty,
      isNotDistrict,
      isStateDistrictPumaMSAPlace,
      isNationStateCountyPlace,
      notNationStatePumaMSA,
      isCountyStateMSAnotPR,
      isNationStatePuma,
      isNationStateCountynotPR,
      isNationState,
      isNotNationState: !isNationState,
      isState,
      isMSA,
      isCounty,
      isPrismCounty,
      isNotMSA,
      isMSAorCounty,
      isStateCounty,
      isNationStateCounty,
      notNationStatePuma,
      notNationStateDistrict,
      isCountyStateMSA,
      child,
      childPlural: `${child.replace(/\w$/g, (chr: any) => chr === "y" ? "ies" : `${chr}s`)}`,
      childHierarchy: titleCase(child),
      countyDataDepth: id === "01000US" ? "State" : "County",
      countyDataDepthLower: id === "01000US" ? "state" : "county",
      countyDataDepthLowerPlural: id === "01000US" ? "states" : "counties",
      hierarchyPlural: `${hierarchy.replace(/\w$/g, (chr: any) => chr === "y" ? "ies" : `${chr}s`)}`,
      hierarchyLower: lower(hierarchy),
      hierarchyLowerPlural: `${lower(hierarchy).replace(/\w$/g, (chr: any) => chr === "y" ? "ies" : `${chr}s`)}`,
      hierarchyTitle,
      nameLower: `${id === "01000US" ? "the " : ""}${name}`,
      nameUpper: `${id === "01000US" ? "The " : ""}${name}`,
      sumlevel,
      isNation: id === "01000US",
      notTerritory: id === "01000US" || !["60", "66", "69", "72", "78"].includes(id.slice(7, 9)),
      notNation: id !== "01000US",
      isPuma: prefix === "795",
      notPuma: prefix !== "795",
      isDistrict: prefix === "500",
      notDistrict: prefix !== "500",
      isPlace: (hierarchy === "Place" || hierarchy === "County" || hierarchy === "Congressional District"),
      notPlace: !(hierarchy === "Place" || hierarchy === "County" || hierarchy === "Congressional District"),
      notNationPlace: id !== "01000US" && hierarchy !== "Place",
  
    };
  }
};

export default generator;
