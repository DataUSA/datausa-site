// Converted from legacy canon_cms_materializer #9 "Colors" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 9,
  name: "Colors",
  ordering: 0,
  allowed: "always",
  logic: (variables) => {
    return !variables.colorGood ? {
      colorBackground: "#00112C",
      colorGrey: "#C6C7CA",
      colorHighlight: "#ef6145",
      colorLeast: "#58879A",
      colorMost: "#1A3E61",
      colorGood: "#3182bd",
      colorBad: "#cf5555",
      colorScaleDiverging: ["#7b0000", "#cf5555", "#dc9595", "#C6C7CA", "#90bad8", "#4c96cb", "#004374"],
      colorScaleGood: [
        "#b0cde1",
        "#90bad8",
        "#4c96cb",
        "#3182bd",
        "#004374"
      ],
      colorScaleBad: [
        "#e4b4b4",
        "#dc9595",
        "#cf5555",
        "#CA3434",
        "#7b0000"
      ],
      colorCIP: {
        "01": "#aee0ae",
        "03": "#979bbd",
        "04": "#5a1d28",
        "05": "#c0451e",
        "09": "#bf168e",
        "10": "#d1685e",
        "11": "#336a81",
        "12": "#17c0c0",
        "13": "#4b9dcd",
        "14": "#fdf18d",
        "15": "#8c567c",
        "16": "#b36a52",
        "19": "#e6d26e",
        "22": "#0072cd",
        "23": "#1f304c",
        "24": "#7072a0",
        "25": "#acb57e",
        "26": "#ffb563",
        "27": "#89bfea",
        "29": "#8e7b41",
        "30": "#33425b",
        "31": "#72f5c4",
        "38": "#003651",
        "39": "#2f1fc1",
        "40": "#82a8e7",
        "41": "#d8e9f0",
        "42": "#5467de",
        "43": "#ff8166",
        "44": "#ffb587",
        "45": "#c19a1f",
        "46": "#bc9a96",
        "47": "#92407c",
        "48": "#ffd3a6",
        "49": "#418e84",
        "50": "#1fc1ad",
        "51": "#f33535",
        "52": "#2c5753",
        "54": "#49418e",
        "GS": "#853b3c"
      },
      colorGender: {
        "Male": "#1A3E61",
        "Men": "#1A3E61",
        "Female": "#CA3434",
        "Women": "#CA3434"
      },
      colorIndACS: {
        "0": "#49418e",
        "1": "#c19a1f",
        "2": "#fdf18d",
        "3": "#5467de",
        "4": "#1f304c",
        "5": "#c1461f",
        "6": "#5b1e29",
        "7": "#bf168e",
        "8": "#2c5753",
        "9": "#f33535",
        "10": "#1fc1ad",
        "11": "#82a8e7",
        "12": "#ffb587"
      },
      colorIndPUMS: {
        "11-21": "#49418e",
        "23": "#c19a1f",
        "31-33": "#fdf18d",
        "42": "#5467de",
        "44-45": "#1f304c",
        "48-49, 22":"#c1461f",
        "51": "#5b1e29",
        "52-53": "#bf168e",
        "54-56": "#2c5753",
        "61-62": "#f33535",
        "71-72": "#1fc1ad",
        "81": "#82a8e7",
        "92": "#ffb587",
        "928110": "#2f1fc1"
      },
      colorKaiser: {
        "0": "#17c0c0",
        "1": "#2e6695",
        "2": "#33425b",
        "3": "#ff8166",
        "4": "#ffd3a6",
        "5": "#2f1fc1"
      },
      colorNativity: {
        "Native Born": "#41a392",
        "Foreign Born": "#455a7d"
      },
      colorOccACS: {
        "0": "#ff8166",
        "1": "#ffb563",
        "2": "#1a9b9a",
        "3": "#336a81",
        "4": "#49418e"
      },
      colorOccPUMS: {
        "110000-290000": "#ff8166",
        "310000-390000": "#ffb563",
        "410000-430000": "#1a9b9a",
        "450000-490000": "#336a81",
        "510000-530000": "#49418e",
        "550000": "#2f1fc1"
      },
      colorRaceACS: {
        "0": "#004374",
        "1": "#ff8166",
        "2": "#ffb563",
        "3": "#c19a1f",
        "4": "#1a9b9a",
        "5": "#bf168e",
        "6": "#2f1fc1",
        "7": "#336a81",
        "8": "#82a8e7",
        "9": "#49418e"
      },
      colorRaceIPEDS: {
        "white": "#ff8166",
        "black": "#ffb563",
        "native": "#c19a1f",
        "asian": "#1a9b9a",
        "hawaiian": "#bf168e",
        "unknown": "#2f1fc1",
        "multiracial": "#336a81",
        "hispanic": "#49418e"
      },
      colorRacePUMS: {
        "1": "#ff8166",
        "2": "#ffb563",
        "3": "#c19a1f",
        "4": "#f33535",
        "5": "#82a8e7",
        "6": "#1a9b9a",
        "7": "#bf168e",
        "8": "#2f1fc1",
        "9": "#336a81"
      },
      colorSector: {
        "0": "#AC4BAE",
        "1": "#FAA34A",
        "2": "#8BC84D",
        "3": "#398059",
        "4": "#FF8166",
        "5": "#4CA3B6",
        "6": "#2C689B",
        "7": "#FFCD33",
        "8": "#308984",
        "9": "#453A8B"
      },
      colorParty: {
        "Democratic": "#1A3E61",
        "Democratic-Farmer-Labor": "#3584c2",
        "Democratic-farmer-labor": "#3584c2",
        "Republican": "#CA3434",
        "American Solidarity Party": "#ffb563",
        "Libertarian": "#e6d26e",
        "Free Libertarian": "#e6d26e",
        "Green": "#2c5753",
        "D.c. Statehood Green": "#2c5753",
        "Pacific Green": "#2c5753",
        "Independent Green": "#2c5753",
        "Wisconsin Green": "#2c5753",
        "Progressive/green": "#2c5753",
        "Independence": "#92407c",
        "Independent": "#92407c",
        "Independent American": "#92407c",
        "Independent People Of Colorado": "#92407c",
        "New Independent Party Iowa": "#92407c",
        "American Independent": "#92407c",
        "American Independent Party": "#92407c",
        "New Mexico Independent Party": "#92407c",
        "Alaskan Independence Party": "#92407c",
        "America's Independent Party": "#92407c",
        "Independent Nomination": "#92407c",
        "Independent Voters": "#92407c",
        "Independents For Economic Recovery": "#92407c",
        "Independents For Larouche": "#92407c",
        "Ron Daniels Independent": "#92407c",
        "Tisch Independent Citizens": "#92407c",
        "Democrat/republican": "#92407c",
        "Veterans Party Of America": "#92407c",
        "American Constitution Party": "#92407c"
      },
      colorType: {
        "Parks": "#1fc1ad",
        "Residential": "#bf168e",
        "Grocery and Pharmacy": "#f33535",
        "Retail and Recreation": "#1f304c",
        "Workplaces": "#2c5753",
        "Transit Stations": "#c1461f"
      },
      colorGeo: "#879bf5"
    } : {colorMaterializer: "This materializer can now be deleted."};
  }
};

export default materializer;
