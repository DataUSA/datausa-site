const stateAbbreviations = {
  "Arizona": "AZ",
  "Alabama": "AL",
  "Alaska": "AK",
  "American Samoa": "AS",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "District of Columbia": "DC",
  "Florida": "FL",
  "Georgia": "GA",
  "Guam": "GU",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Northern Mariana Islands": "MP",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Puerto Rico": "PR",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "United States": "US",
  "U.S. Virgin Islands": "VI",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
};

const stateGrid = [
  ["AK", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "  ", "ME"],
  ["  ", "  ", "  ", "  ", "  ", "WI", "  ", "  ", "  ", "VT", "NH"],
  ["WA", "ID", "MT", "ND", "MN", "IL", "MI", "  ", "NY", "MA", "  "],
  ["OR", "NV", "WY", "SD", "IA", "IN", "OH", "PA", "NJ", "CT", "RI"],
  ["CA", "UT", "CO", "NE", "MO", "KY", "WV", "VA", "MD", "DE", "  "],
  ["  ", "AZ", "NM", "KS", "AR", "TN", "NC", "SC", "DC", "  ", "  "],
  ["MP", "  ", "  ", "OK", "LA", "MS", "AL", "GA", "  ", "  ", "PR"],
  ["GU", "HI", "AS", "  ", "TX", "  ", "  ", "  ", "FL", "  ", "VI"]
];

const colorArray = [
  "#f33535",
  "#ffb563",
  "#418e84",
  "#2f1fc1",
  "#bf168e",
  "#5a1d28",
  "#c19a1f",
  "#336a81",
  "#8c567c",
  "#ff8166",
  "#72f5c4",
  "#c0451e"
];

const ctSource = {
  dataset_link: "https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_time_series",
  dataset_name: "CSSE Covid 19 Time Series",
  source_link: "https://github.com/CSSEGISandData/COVID-19",
  source_name: "COVID-19 Data Repository by the Center for Systems Science and Engineering (CSSE) at Johns Hopkins University"
};

const googleSource = {
  dataset_link: "https://www.google.com/covid19/mobility/",
  dataset_name: "https://www.google.com/&#8203;covid19/&#8203;mobility/",
  source_name: "Google LLC <em>\"Google COVID-19 Community Mobility Reports\"</em>&nbsp;"
};

const kfSource = {
  dataset_link:
    "https://www.kff.org/other/state-indicator/beds-by-ownership/?currentTimeframe=0&selectedDistributions=total&selectedRows=%7B%22states%22:%7B%22all%22:%7B%7D%7D,%22wrapups%22:%7B%22united-states%22:%7B%7D%7D%7D&sortModel=%7B%22colId%22:%22Location%22,%22sort%22:%22asc%22%7D",
  dataset_name: "State Health Facts",
  source_link: "https://www.kff.org/",
  source_name: "Kaiser Family Foundation"
};

const dolSource = {
  dataset_link:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_x8FhDzveu6Q6uLlxxj7d69GmaliZyKUQf9nnYmoKOHqhHE_wcxykG68Gll5JBQ9F7pnr1jDu_oVP/pub?output=csv",
  dataset_name: "Unemployment insurance weekly claims by state",
  source_link: "https://oui.doleta.gov/unemploy/claims.asp",
  source_name: "DOL Unemployment Insurance Weekly Claims Data"
};

const ahaSource = {
  dataset_link: "https://www.ahadata.com",
  dataset_name: "Annual Survey Database",
  source_link: "https://www.aha.org/",
  source_name: "The American Hospital Association"
};

const pums1Source = {
  source_name: "Census Bureau",
  source_description:
    "The American Community Survey (ACS) Public Use Microdata Sample (PUMS) files are a set of untabulated records about individual people or housing units. The Census Bureau produces the PUMS files so that data users can create custom tables that are not available through pretabulated (or summary) ACS data products.",
  dataset_name: "ACS PUMS 1-Year Estimate",
  dataset_link:
    "https://census.gov/programs-surveys/acs/technical-documentation/pums.html",
  subtopic: "Demographics",
  table_id: "PUMS",
  topic: "Diversity",
  hidden_measures:
    "ygbpop RCA,ygopop RCA,ygipop RCA,yocpop RCA,yiopop RCA,ycbpop RCA"
};

const acs1Source = {
  source_name: "Census Bureau",
  source_description:
    "Census Bureau conducts surveys of the United States Population, including the American Community Survey",
  dataset_name: "ACS 1-year Estimate",
  dataset_link: "http://www.census.gov/programs-surveys/acs/",
  table_id: "S2701,S2703,S2704",
  topic: "Health",
  subtopic: "Access and Quality"
};

const wbSource = {
  dataset_link:
    "https://datacatalog.worldbank.org/dataset/world-development-indicators",
  dataset_name: "World Development Indicators",
  source_link: "https://www.worldbank.org/",
  source_name: "The World Bank"
};

module.exports = {
  stateAbbreviations,
  stateGrid,
  colorArray,
  ctSource,
  googleSource,
  kfSource,
  dolSource,
  ahaSource,
  pums1Source,
  acs1Source,
  wbSource
};
