// Converted from legacy canon_cms_materializer #23 "Icons" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 23,
  name: "Icons",
  ordering: 0,
  allowed: "always",
  logic: (variables) => {
    return {
      iconOccPUMS: {
        "110000-290000": "/icons/visualizations/thing_computer.png",
        "310000-390000": "/icons/visualizations/thing_utensils.png",
        "410000-430000": "/icons/visualizations/thing_box.png",
        "450000-490000": "/icons/visualizations/thing_wrench.png",
        "510000-530000": "/icons/visualizations/thing_truck.png",
        "550000": "/icons/visualizations/thing_airplane.png"
      },
      iconGender: {
        "Male": "/icons/visualizations/gender_mars.png",
        "Men": "/icons/visualizations/gender_mars.png",
        "Female": "/icons/visualizations/gender_venus.png",
        "Women": "/icons/visualizations/gender_venus.png"
      },
      iconRace: "/icons/visualizations/person_profile.png"
    }
  }
};

export default materializer;
