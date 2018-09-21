import React from "react";

import Vizbuilder from "@datawheel/canon-vizbuilder";

import "./Visualize.css";

const measureConfig = {};

const badMeasures = [
  "Population in Poverty by Gender, Age, and Race",
  "Children In Poverty",
  "Unemployment",
  "Children In Poverty",

  "Uninsured",
  "Uninsured Adults",
  "Uninsured Children",
  "Could Not See Doctor Due To Cost",

  "Adult Obesity",
  "Diabetes",
  "Sexually Transmitted Infections",
  "Hiv Prevalence",
  "Alcohol-Impaired Driving Deaths",
  "Excessive Drinking",
  "Adult Smoking",
  "Homicide Rate",
  "Violent Crime",
  "Motor Vehicle Crash Deaths",

  "Premature Death",
  "Poor Or Fair Health",
  "Poor Physical Health Days",
  "Poor Mental Health Days",
  "Low Birthweight",
  "Food Environment Index",
  "Physical Inactivity",
  "Access To Exercise Opportunities",
  "Teen Births",
  "Social Associations",
  "Injury Deaths",
  "Air Pollution - Particulate Matter 1",
  "Drinking Water Violations",
  "Premature Age-Adjusted Mortality",
  "Infant Mortality",
  "Child Mortality",
  "Food Insecurity",
  "Limited Access To Healthy Foods",
  "Children Eligible For Free Or Reduced Price Lunch",

  "Severe Housing Problems",

  "Opioid Overdose Death Rate Per 100,000 Age-Adjusted",
  "Drug Overdose Death Rate Per 100,000 Age-Adjusted",
  "Drug Overdose Deaths",
  "Nonmedical Use of Prescription Pain Relievers Among Individuals Aged 12+",

  "Borrowers In Default",
  "Borrowers Entered Repayment",
  "Default Rate"
];

badMeasures.forEach(measure => {
  measureConfig[measure] = {
    colorScaleConfig: {
      color: ["#f8ecec", "#edd1d1", "#e4b4b4", "#dc9595", "#d57676", "#cf5555", "#CA3434", "#7b0000"]
    }
  };
});

const StateTopojson = {
  projection: "geoAlbersUsa",
  ocean: "transparent",
  topojson: "/topojson/State.json"
};

export default class Visualize extends React.Component {
  render() {
    return <Vizbuilder
      src="https://canon-api.datausa.io"
      defaultDimension={["Geography", "Origin State", "Gender", "Age"]}
      defaultLevel={["State", "Origin State"]}
      defaultMeasure="Opioid Overdose Death Rate Per 100,000 Age-Adjusted"
      measureConfig={measureConfig}
      topojson={{
        "County": {
          topojson: "/topojson/County.json"
        },
        "Msa": {
          topojson: "/topojson/Msa.json"
        },
        "Puma": {
          topojson: "/topojson/Puma.json"
        },
        "State": StateTopojson,
        "Origin State": StateTopojson,
        "Destination State": StateTopojson
      }} />;
  }
}
