// Converted from legacy canon_cms_materializer #45 "Icons" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 45,
  name: "Icons",
  ordering: 7,
  allowed: "always",
  logic: (variables) => {
    return {
      iconCIP: {
        "01": "/icons/visualizations/thing_wheat.png",
        "03": "/icons/visualizations/thing_recycle.png",
        "04": "/icons/visualizations/thing_textile.png",
        "05": "/icons/visualizations/place_earth.png",
        "09": "/icons/visualizations/thing_documentscroll.png",
        "10": "/icons/visualizations/thing_radiotower.png",
        "11": "/icons/visualizations/thing_computer.png",
        "12": "/icons/visualizations/thing_utensils.png",
        "13": "/icons/visualizations/thing_gradcap.png",
        "14": "/icons/visualizations/place_factory.png",
        "15": "/icons/visualizations/thing_gears.png",
        "16": "/icons/visualizations/export_val.png",
        "19": "/icons/visualizations/person_wheelchair.png",
        "22": "/icons/visualizations/thing_gavel.png",
        "23": "/icons/visualizations/thing_book.png",
        "24": "/icons/visualizations/app_rings.png",
        "25": "/icons/visualizations/person_admin.png",
        "26": "/icons/visualizations/thing_dna.png",
        "27": "/icons/visualizations/thing_pi.png",
        "29": "/icons/visualizations/thing_airplane.png",
        "30": "/icons/visualizations/thing_arrows.png",
        "31": "/icons/visualizations/thing_shoe.png",
        "38": "/icons/visualizations/thing_question.png",
        "39": "/icons/visualizations/thing_moon.png",
        "40": "/icons/visualizations/thing_leaf.png",
        "41": "/icons/visualizations/thing_flask.png",
        "42": "/icons/visualizations/thing_talkbubble.png",
        "43": "/icons/visualizations/thing_policeshield.png",
        "44": "/icons/visualizations/person_family.png",
        "45": "/icons/visualizations/app_network.png",
        "46": "/icons/visualizations/thing_trafficcone.png",
        "47": "/icons/visualizations/thing_wrench.png",
        "48": "/icons/visualizations/thing_sqruler.png",
        "49": "/icons/visualizations/thing_truck.png",
        "50": "/icons/visualizations/thing_theater.png",
        "51": "/icons/visualizations/thing_medic.png",
        "52": "/icons/visualizations/person_business.png",
        "54": "/icons/visualizations/app_stacked.png",
        "GS": "/icons/visualizations/thing_flask.png"
      },
      iconGender: {
        "Male": "/icons/visualizations/gender_mars.png",
        "Men": "/icons/visualizations/gender_mars.png",
        "Female": "/icons/visualizations/gender_venus.png",
        "Women": "/icons/visualizations/gender_venus.png"
      },
      iconIndPUMS: {
        "11-21": "/icons/visualizations/thing_wheat.png",
        "23": "/icons/visualizations/thing_trafficcone.png",
        "31-33": "/icons/visualizations/place_factory.png",
        "42": "/icons/visualizations/thing_box.png",
        "44-45": "/icons/visualizations/place_store.png",
        "48-49, 22": "/icons/visualizations/thing_truck.png",
        "51": "/icons/visualizations/thing_computer.png",
        "52-53": "/icons/visualizations/place_moneyhouse.png",
        "54-56": "/icons/visualizations/person_business.png",
        "61-62": "/icons/visualizations/thing_medic.png",
        "71-72": "/icons/visualizations/thing_theater.png",
        "81": "/icons/visualizations/person_general.png",
        "92": "/icons/visualizations/person_family.png",
        "928110": "/icons/visualizations/thing_airplane.png"
      },
      iconNativity: {
        "Native Born": "/icons/visualizations/thing_passportusa.png",
        "Foreign Born": "/icons/visualizations/thing_passportwld.png"
      },
      iconOccPUMS: {
        "110000-290000": "/icons/visualizations/thing_computer.png",
        "310000-390000": "/icons/visualizations/thing_utensils.png",
        "410000-430000": "/icons/visualizations/thing_box.png",
        "450000-490000": "/icons/visualizations/thing_wrench.png",
        "510000-530000": "/icons/visualizations/thing_truck.png",
        "550000": "/icons/visualizations/thing_airplane.png"
      },
      iconRace: "/icons/visualizations/person_profile.png",
      iconSector: {
        "1": "/icons/visualizations/thing_bigdot.png",
        "2": "/icons/visualizations/thing_stripewheel.png",
        "3": "/icons/visualizations/thing_stripewheel.png",
        "4": "/icons/visualizations/thing_bigdot.png",
        "5": "/icons/visualizations/thing_stripewheel.png",
        "6": "/icons/visualizations/thing_stripewheel.png",
        "7": "/icons/visualizations/thing_bigdot.png",
        "8": "/icons/visualizations/thing_stripewheel.png",
        "9": "/icons/visualizations/thing_stripewheel.png"
      }
    }
  }
};

export default materializer;
