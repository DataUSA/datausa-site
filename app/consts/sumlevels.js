module.exports = {
  geo: {
    "010": {
      sumlevel: "nation",
      label: "nation",
      children: "040"
    },
    "040": {
      sumlevel: "state",
      label: "state",
      children: "050",
      desc: "Includes all 50 US states as well as Washington D.C. and Puerto Rico.",
      link: "/about/glossary/#state"
    },
    "050": {
      sumlevel: "county",
      label: "county",
      children: "140",
      desc: "Most or all county subdivisions are legal entities, known to the Census Bureau as minor civil divisions.",
      link: "/about/glossary/#county"
    },
    "310": {
      sumlevel: "msa",
      label: "metropolitan statistical area",
      shortlabel: "metro area",
      children: "050",
      desc: "A Metropolitan Statistical Area is an official designation of one or more counties around a core urban area which is the primary focus of economic activity for those counties.",
      link: "/about/glossary/#msa"
    },
    "160": {
      sumlevel: "place",
      label: "census place",
      shortlabel: "place",
      children: "140",
      desc: "The United States Census Bureau defines a place as a concentration of population which has a name, is locally recognized, and is not part of any other place.",
      link: "/about/glossary/#place"
    },
    "860": {
      sumlevel: "zip",
      label: "zip code"
    },
    "795": {
      sumlevel: "puma",
      label: "public use microdata area",
      shortlabel: "PUMA",
      desc: "Public Use Microdata Areas are geographic units containing at least 100,000 people used by the US Census for providing statistical and demographic information.",
      link: "/about/glossary/#puma"
    },
    "140": {
      sumlevel: "tract",
      label: "census tract",
      shortlabel: "tract",
      desc: "Census tracts are small, relatively permanent statistical subdivisions of a county or equivalent entity that are updated by local participants prior to each decennial census.",
      link: "/about/glossary/#tract"
    }
  },
  cip: {
    1: {
      label: "2 Digit Course",
      shortlabel: "2_digit_course"
    },
    2: {
      label: "4 Digit Course",
      shortlabel: "4_digit_course"
    },
    3: {
      label: "6 Digit Course",
      shortlabel: "6_digit_course"
    }
  },
  soc: {
    0: {
      label: "Major Occupation Group",
      shortlabel: "major_group"
    },
    1: {
      label: "Minor Occupation Group",
      shortlabel: "minor_group"
    },
    2: {
      label: "Broad Occupation",
      shortlabel: "broad_occupation"
    },
    3: {
      label: "Detailed Occupation",
      shortlabel: "detailed_occupation"
    }
  },
  naics: {
    0: {
      label: "Industry Sector",
      shortlabel: "sector"
    },
    1: {
      label: "Industry Sub-Sector",
      shortlabel: "sub_sector"
    },
    2: {
      label: "Industry Group",
      shortlabel: "group"
    }
  },
  university: {
    0: {
      label: "Carnegie Group"
    },
    1: {
      label: "Carnegie Sub-Group"
    },
    2: {
      label: "University"
    }
  }
};
