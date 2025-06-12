const axios = require("axios");
const {CANON_CONST_TESSERACT} = process.env;
const prefix = `${CANON_CONST_TESSERACT}${CANON_CONST_TESSERACT.slice(-1) === "/" ? "" : "/"}`;

/**
 * Parses tesseract's members format into a flat lookup of key -> [parent keys]
 * @param {Array} levelsData - Array of API responses for each dimension level
 * @returns {Object} - { key: [parentKey1, parentKey2, ...] }
 */
function parseFlatParents(levelsData, isCIP = false) {
  const lookup = {};
  for (const level of levelsData) {
    for (const member of level.members) {
      let key = String(member.key);
      if (isCIP && (/^\d{1}$/.test(key) || /^\d{3}$/.test(key) || /^\d{5}$/.test(key))) {
        key = `0${key}`;
      }
      const parentKeys = Array.from(
        new Set(
          (member.ancestor || [])
            .map(a => {
              let parentKey = String(a.key);
              if (isCIP && (/^\d{1}$/.test(parentKey) || /^\d{3}$/.test(parentKey) || /^\d{5}$/.test(parentKey))) {
                parentKey = `0${parentKey}`;
              }
              return parentKey;
            })
            .filter(k => k !== key)
        )
      );
      lookup[key] = parentKeys;
    }
  }
  return lookup;
}

module.exports = async function () {
  try {
    // INDUSTRY
    const industryEndpoints = [
      "tesseract/members?cube=pums_5&level=Industry%20Sector&parents=true",
      "tesseract/members?cube=pums_5&level=Industry%20Sub-Sector&parents=true",
      "tesseract/members?cube=pums_5&level=Industry%20Group&parents=true"
    ];

    // OCCUPATION
    const occupationEndpoints = [
      "tesseract/members?cube=pums_5&level=Major%20Occupation%20Group&parents=true",
      "tesseract/members?cube=pums_5&level=Minor%20Occupation%20Group&parents=true",
      "tesseract/members?cube=pums_5&level=Broad%20Occupation&parents=true",
      "tesseract/members?cube=pums_5&level=Detailed%20Occupation&parents=true"
    ];

    // UNIVERSITY
    const universityEndpoints = [
      "tesseract/members?cube=ipeds_completions&level=Carnegie+Parent&parents=true",
      "tesseract/members?cube=ipeds_completions&level=Carnegie&parents=true",
      "tesseract/members?cube=ipeds_completions&level=University&parents=true"
    ];

    // CIP
    const cipEndpoints = [
      "tesseract/members?cube=ipeds_completions&level=CIP2&parents=true",
      "tesseract/members?cube=ipeds_completions&level=CIP4&parents=true",
      "tesseract/members?cube=ipeds_completions&level=CIP6&parents=true"
    ];

    // NAPCS
    const napcsEndpoints = [
      "tesseract/members?cube=usa_spending&level=NAPCS+Section&parents=true",
      "tesseract/members?cube=usa_spending&level=NAPCS+Group&parents=true",
      "tesseract/members?cube=usa_spending&level=NAPCS+Class&parents=true"
    ];

    // Fetch all endpoints in parallel
    const [
      ...industries
    ] = await Promise.all(industryEndpoints.map(url => axios.get(prefix + url).then(r => r.data)));

    const [
      ...occupations
    ] = await Promise.all(occupationEndpoints.map(url => axios.get(prefix + url).then(r => r.data)));

    const [
      ...universities
    ] = await Promise.all(universityEndpoints.map(url => axios.get(prefix + url).then(r => r.data)));

    const [
      ...courses
    ] = await Promise.all(cipEndpoints.map(url => axios.get(prefix + url).then(r => r.data)));

    const [
      ...products
    ] = await Promise.all(napcsEndpoints.map(url => axios.get(prefix + url).then(r => r.data)));

    console.log(parseFlatParents(courses, true));

    return {
      naics: parseFlatParents(industries),
      soc: parseFlatParents(occupations),
      cip: parseFlatParents(courses, true),
      university: parseFlatParents(universities),
      napcs: parseFlatParents(products)
    };
  } catch (err) {
    console.error(` 🌎  Parents Cache Error: ${err.message}`);
    if (err.config) console.error(err.config.url);
    return [];
  }
};
