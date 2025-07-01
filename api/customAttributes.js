const axios = require("axios");
const colors = require("../static/data/colors.json");
const iocodes = require("../static/data/pums_naics_to_iocode.json");
const blsInds = require("../static/data/pums_bls_industry_crosswalk.json");
const blsOccs = require("../static/data/pums_bls_occupation_crosswalk.json");

const loadJSON = require("../utils/loadJSON");
const universitySimilar = loadJSON("/static/data/similar_universities_with_dist.json");
const napcs2sctg = loadJSON("/static/data/nacps2sctg.json");

const {CANON_API, CANON_CONST_TESSERACT, CANON_GEOSERVICE_API} = process.env;

const colorMapping = Object.keys(colors)
  .reduce((obj, k) => {
    const newKey = k.split(" ").reverse().join(""); // flip word order, if multiple
    obj[
      newKey.startsWith("color")
        ? newKey
        : `color${newKey.charAt(0).toUpperCase() + newKey.slice(1)}`
    ] = colors[k];
    return obj;
  }, {});

const stems = ["400801", "110104", "140501", "140901", "151001", "260909", "261101", "261302", "270301", "400401", "150303", "512005", "279999", "110101", "110102", "111099", "130501", "140101", "141801", "150699", "110803", "151199", "110804", "159999", "260399", "260807", "270103", "301801", "301701", "400599", "410399", "450301", "151299", "260205", "260406", "269999", "110899", "149999", "400299", "150306", "150703", "299999", "290403", "400101", "400699", "410301", "450603", "151399", "142501", "261502", "511401", "110299", "151599", "260903", "409", "260904", "261003", "261001", "110201", "110103", "110202", "110203", "110301", "110401", "110501", "110901", "111001", "141301", "111003", "111004", "111005", "111006", "261501", "130601", "140102", "140701", "261199", "130603", "140702", "140801", "261599", "270306", "140802", "140804", "140999", "270399", "270503", "141901", "140803", "140805", "140902", "140903", "141004", "270599", "141201", "290307", "141401", "142101", "150799", "142001", "142301", "142701", "142201", "143201", "143801", "143901", "144001", "144501", "150403", "143401", "150404", "143501", "143601", "143701", "144301", "144401", "290301", "150000", "150101", "150201", "150304", "150305", "150399", "150401", "150405", "150406", "150501", "150503", "290407", "290409", "150507", "150508", "150607", "150611", "150613", "150614", "150615", "150701", "150702", "150616", "150801", "150803", "150805", "150704", "150899", "150903", "150999", "151102", "151103", "151503", "151202", "151203", "151204", "151301", "151302", "151303", "400404", "151306", "151401", "151501", "151601", "260203", "260204", "260206", "260207", "260307", "260209", "260210", "260301", "140899", "260305", "260401", "260404", "260407", "260499", "260502", "260503", "260508", "260701", "260308", "260504", "422705", "260505", "260506", "260507", "260708", "260801", "260702", "260707", "260806", "260901", "260709", "260802", "260803", "260804", "260805", "260902", "260910", "260905", "260907", "400502", "260908", "261309", "260912", "261002", "400402", "260911", "261303", "261004", "400602", "21", "261005", "261006", "261102", "261103", "261201", "261301", "261007", "261304", "303301", "261305", "261306", "15", "261307", "261401", "401002", "261308", "261310", "261503", "261504", "270104", "270303", "270305", "280501", "280502", "290202", "422704", "270105", "270199", "270304", "290201", "290203", "290207", "290205", "290302", "290303", "290304", "290305", "290306", "290406", "290402", "290404", "290405", "400899", "290408", "300101", "300601", "300801", "303201", "301901", "303101", "302501", "303001", "400201", "400202", "400203", "400403", "400601", "400503", "400504", "400506", "400507", "400508", "400501", "400509", "400510", "400511", "400603", "400605", "400607", "400604", "400606", "400804", "400805", "400806", "401001", "400802", "400807", "400808", "401099", "409999", "410303", "422702", "422707", "410000", "410101", "410204", "410205", "410299", "422701", "422703", "422706", "422708", "422709", "422799", "430106", "140601", "430116", "450702", "511002", "511005", "512003", "512004", "512006", "512007", "512010", "512202", "512503", "512502", "512205", "512504", "512505", "512506", "521301", "521302", "521304", "110199", "140401", "512511", "512009", "512510", "110701", "521399", "142401", "144101", "140301", "260208", "141001", "141003", "150612", "150901", "151304", "260599", "261104", "260999", "141101", "270101", "280505", "290401", "301001", "143301", "302701", "400809", "270501", "270502", "290499", "400499", "400810", "150505", "151502", "290299", "260202", "260403", "150599", "151201", "260799", "270102", "4002", "512706", "29", "1110", "1102", "1409", "1108", "1407", "1408", "1511", "1503", "1504", "1505", "1506", "1507", "1508", "2610", "1509", "1512", "2608", "2705", "2611", "2603", "2604", "2605", "2607", "2609", "2904", "2703", "2615", "2903", "2701", "2902", "4008", "4102", "4103", "4227", "3015", "4701", "290399", "5213", "140799", "4004", "4006", "4005", "2602", "2613", "100304", "110801", "110802", "111002", "140201", "141099", "144201", "150499", "150506", "151305", "260299", "261399", "290204", "290206", "490101", "520407", "1002", "470110", "470616", "470609", "480510", "40902", "40901", "100105", "100201", "100202", "100203", "470199", "430204", "430201", "460415", "470103", "470106", "470302", "470603", "470604", "470605", "470606", "470607", "470608", "470610", "470409", "470612", "470614", "480501", "480503", "480506", "480507", "480508", "419999", "500502", "510717", "510906", "540104", "142801", "260102", "2101", "261099", "510603", "40", "1410", "1513", "510707", "1001", "470104", "40999", "11099", "520302", "30511", "1101", "110", "10106", "100299", "1515", "26", "27", "301501", "511001", "512312", "210101", "470613", "4010", "260899", "11002", "30509", "1099", "131309", "470303", "470105", "470611", "470615", "470617", "500913", "109999", "260101"];

const blsIndustryMap = [
  [11, "15"],
  [30, "30"],
  [42, "40"],
  [51, "50"],
  [52, "55"],
  [54, "60"],
  [61, "65"],
  [71, "70"],
  [81, "80"],
  [92, "90"]
].reverse();

module.exports = function(app) {

  const {db} = app.settings;
  const {blsMonthlyIndustries, urls, opeid} = app.settings.cache;

  app.post("/api/cms/customAttributes/:pid", async(req, res) => {

    const {id, dimension, hierarchy} = req.body.variables;
    const meta = await db.profile_meta.findOne({where: {dimension}}).catch(() => {});
    const {slug} = meta;

    const origin = CANON_API;

    const breadcrumbs = await axios.get(`${origin}/api/parents/${slug}/${id}`)
        .then(resp => resp.data)
        .catch(() => []);

    const retObj = {
      ...colorMapping,
      breadcrumbs,
      freightYear: 2023,
      neverShow: false,
      geoservice: CANON_GEOSERVICE_API,
      tesseract: CANON_CONST_TESSERACT,
      url: urls[id]
    };

    if (dimension === "Geography") {

      const parentsElection = await axios.get(`${origin}/api/civic/senator/${id}`)
          .then(resp => resp.data)
          .catch(() => []);

      retObj.parentsElection = parentsElection;

      const state = breadcrumbs.find(d => d.hierarchy === "State");
      const stateElection = parentsElection.map(d => d["ID State"]).reduce((acc,item)=>{
        if(!acc.includes(item)){
          acc.push(item);
        }
        return acc;
      },[]);

      retObj.stateId = state && ["Congressional District"].includes(hierarchy) ? state.id : id;
      retObj.stateDataID = state && !["Nation", "State"].includes(hierarchy) ? state.id : id;
      retObj.hierarchyElectionSub = ["Nation", "County"].includes(hierarchy) ? hierarchy : "State";
      retObj.stateElectionId = ["Nation", "State", "County"].includes(hierarchy) ? id : stateElection.join(",");
      retObj.hierarchyElectionSubTemp = ["Nation"].includes(hierarchy) ? hierarchy : "State";
      retObj.stateElectionIdTemp = ["Nation", "State"].includes(hierarchy) ? id : stateElection.join(",");
      retObj.electionCut = hierarchy === "Nation" ? `State` : hierarchy === "County" ? `County&State+County=${retObj.stateDataID}` : `County&State+County=${retObj.stateElectionId}`;
      retObj.hierarchySub = hierarchy === "Nation" ? "State" : "County";
      retObj.CBPSection = hierarchy === "County" || (hierarchy === "State" && id !== "04000US72") || hierarchy === "MSA"
      retObj.includeIncome = hierarchy === "Nation" ? `&exclude=State:0` : hierarchy === "State" ? `&include=State+County:${id}` : hierarchy === "County" ? `&include=County+Tract:${id}` : hierarchy === "Place" ? `&include=Place+Place-Tract:${id}` : "";
      retObj.incomeDrilldown = hierarchy === "Nation" ? "State" : hierarchy === "State" ? "County" : hierarchy === "County" ? "Tract" : hierarchy === "Place" ? "Place-Tract" : "";
      retObj.specialTessCut = hierarchy === "Nation" ? "&exclude=State:0" : hierarchy === "State" ? `&include=State+County:${id}` : hierarchy === "County" ? `&include=County+Tract:${id}` : hierarchy === "Place" ? `&include=State+Place:${state ? state.id : id}` : hierarchy === "MSA" ? `&include=State+County:${state ? state.id : id}` : hierarchy === "PUMA" ? `&include=State+PUMA:${state ? state.id : id}` : "";
      retObj.specialTessDrilldown = hierarchy === "Nation" ? "State" : hierarchy === "State" ? "County" : hierarchy === "MSA" ? "County" : hierarchy === "PUMA" ? "PUMA" : hierarchy === "County" ? "Tract" : hierarchy === "Place" ? "Place" : "";

      if (hierarchy !== "Nation" && hierarchy !== "State" && hierarchy !== "PUMA") {
        const url = `${CANON_GEOSERVICE_API}relations/intersects/${id}?targetLevels=state`;
        const intersects = await axios.get(url)
          .then(resp => resp.data)
          .then(resp => {
            if (resp.error) {
              console.error(`[geoservice error] ${url}`);
              console.error(resp.error);
              return [];
            }
            else {
              return resp || [];
            }
          })
          .then(resp => resp.map(d => d.geoid))
          .catch(() => []);
        retObj.pumsID = intersects.join(",");
        retObj.pumsHierarchy = "State";
      }

      else if (hierarchy === "PUMA" || hierarchy === "State" || hierarchy === "Nation") {
        retObj.pumsID = id;
        retObj.pumsHierarchy = hierarchy;
      }

      if (hierarchy !== "Nation") {
        const url = `${CANON_GEOSERVICE_API}neighbors/${state ? state.id : id}`;
        const neighbors = await axios.get(url)
          .then(resp => resp.data)
          .then(resp => {
            if (resp.error) {
              console.error(`[geoservice error] ${url}`);
              console.error(resp.error);
              return [];
            }
            else {
              return resp || [];
            }
          })
          .then(resp => resp.map(d => d.geoid))
          .catch(() => []);
        retObj.stateNeighbors = neighbors.join(",");
      }

      else {
        retObj.stateNeighbors = "";
      }

    }
    else if (dimension === "PUMS Industry") {
      if (blsMonthlyIndustries[id]) {
        retObj.blsMonthlyID = blsMonthlyIndustries[id];
        retObj.blsMonthlyDimension = "Industry";
      }
      else {
        let prefix = parseFloat(id.slice(0, 2));
        if (prefix < 10) prefix = parseFloat(`${prefix}9`);
        const mapped = blsIndustryMap.find(d => prefix >= d[0]);
        retObj.blsMonthlyID = mapped ? mapped[1] : false;
        retObj.blsMonthlyDimension = "Supersector";
      }
      const beaIds = iocodes[id];
      retObj.beaL0 = beaIds && beaIds.L0 ? beaIds.L0 : false;
      retObj.beaL1 = beaIds && beaIds.L1 ? beaIds.L1 : false;
      retObj.blsIds = blsInds[id] || false;
      retObj.blsIdsStr = blsInds[id] ? blsInds[id].flat().join(",") : false;
    }
    else if (dimension === "PUMS Occupation") {
      retObj.blsIds = blsOccs[id] || false;
    }
    else if (dimension === "CIP") {
      retObj.stem = id.length === 6 ? stems.includes(id) ? "Stem Major" : false : "Contains Stem Majors";
      retObj.cip2 = id.slice(0, 2);
      retObj.cip4 = id.length >= 4 ? id.slice(0, 4) : false;
    }
    else if (dimension === "University") {
      const similarID = universitySimilar[id] ? universitySimilar[id].map(d => d.university) : [];
      const similarOpeidID = similarID.map(d => opeid[d]).filter(Boolean).join(",");

      retObj.opeid = opeid && opeid[id]? opeid[id] : false;
      retObj.similarID = similarID.join(",");
      retObj.similarOpeidId = similarOpeidID;
    }
    else if (dimension === "NAPCS") {
      retObj.sctg = (napcs2sctg[id] || []).join(",");
    }

    return res.json(retObj);

  });

};
