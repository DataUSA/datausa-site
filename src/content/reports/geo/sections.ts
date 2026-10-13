// Converted from legacy canon_cms_section rows (and their subtitle/description/stat/selector/visualization children) with profile_id = 1.
// Text keeps the CMS template syntax: {{variable}}, Formatter{{variable}} and [[selector]] (rendered by src/lib/template.ts).
import type {SectionDefinition} from "@/lib/reports/types";

export const sections: SectionDefinition[] = [
  {
    "id": 1,
    "slug": "hero",
    "type": "Hero",
    "ordering": 0,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>{{name}}</p>",
    "short": "",
    "subtitles": [
      {
        "id": 52,
        "allowed": "always",
        "text": "<p>{{hierarchyTitle}}</p>"
      }
    ],
    "descriptions": [],
    "stats": [
      {
        "id": 6,
        "allowed": "popCurr",
        "title": "<p>{{popYearCurr}} Population</p>",
        "value": "<p>AbbreviateBig{{popCurr}}</p>",
        "subtitle": "<p>{{popSubtitle}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 7,
        "allowed": "isNation",
        "title": "<p>President</p>",
        "value": "<p>{{presidentImage}} {{presidentName}}</p>",
        "subtitle": "<p>{{presidentParty}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 8,
        "allowed": "isNation",
        "title": "<p>Electoral Votes</p>",
        "value": "<p>306 to 232</p>",
        "subtitle": "<p>51.4% Popular Vote</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 9,
        "allowed": "singleState",
        "title": "<p>US Senator</p>",
        "value": "<p>{{senator1Image}}{{senator1Name}}</p>",
        "subtitle": "<p>{{senator1Party}} Party</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 10,
        "allowed": "singleState",
        "title": "<p>US Senator</p>",
        "value": "<p>{{senator2Image}}{{senator2Name}}</p>",
        "subtitle": "<p>{{senator2Party}} Party</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 355,
        "allowed": "houseSingle",
        "title": "<p>US Representative</p>",
        "value": "<p>{{house1Image}}{{house1Name}}</p>",
        "subtitle": "<p>{{house1Sub}}</p>",
        "tooltip": ""
      },
      {
        "id": 4,
        "allowed": "visibleAgeStat",
        "title": "<p>{{ageCurrYear}} Median Age</p>",
        "value": "<p>{{ageCurr}}</p>",
        "subtitle": "<p>GrowthPct{{ageGrowth}} 1-year IncreaseWord{{ageGrowth}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 1,
        "allowed": "visiblePovertyStat",
        "title": "<p>{{currPovertyYear}} Poverty Rate</p>",
        "value": "<p>Abbreviate{{povertyRate}}%</p>",
        "subtitle": "<p>GrowthPct{{povertyRateGrowth}} 1-year IncreaseWord{{povertyRateGrowth}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 5,
        "allowed": "incomeCurr",
        "title": "<p>{{incomeCurrYear}} Median Household Income</p>",
        "value": "<p>Salary{{incomeCurr}}</p>",
        "subtitle": "<p>{{incomeSubtitle}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 2,
        "allowed": "propertyCurr",
        "title": "<p>{{propertyCurrYear}} Median Property Value</p>",
        "value": "<p>Salary{{propertyCurr}}</p>",
        "subtitle": "<p>{{propertySubtitle}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 3,
        "allowed": "visibleEmployees",
        "title": "<p>{{empCurrYear}} Employed Population</p>",
        "value": "<p>AbbreviateBig{{empCurr}}</p>",
        "subtitle": "<p>{{empSubtitle}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 2,
    "slug": "about",
    "type": "About",
    "ordering": 1,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "About",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 1,
        "allowed": "popPrev",
        "text": "<p>In the year of {{popYearCurr}}, {{nameLower}} had a population of Abbreviate{{popCurr}} people with a median age of {{ageCurr}} and a median household income of Salary{{incomeCurr}}. Between {{popYearPrev}} and {{popYearCurr}} the population of {{name}} GrewWord{{popGrowth}} from AbbreviateBig{{popPrev}} to AbbreviateBig{{popCurr}}, a Abbreviate{{popGrowth}}% IncreaseWord{{popGrowth}} and its median household income GrewWord{{incomeGrowth}} from Salary{{incomePrev}} to Salary{{incomeCurr}}, a Abbreviate{{incomeGrowth}}% IncreaseWord{{incomeGrowth}} between {{incomePrevYear}} and {{incomeCurrYear}}.</p>"
      },
      {
        "id": 357,
        "allowed": "acsSingleYear",
        "text": "<p>In {{popYearCurr}}, {{nameUpper}} had a population of Abbreviate{{popCurr}} people with a median age of {{ageCurr}}.</p>"
      },
      {
        "id": 6,
        "allowed": "never",
        "text": "<p>{{presidentName}} won the {{presidentYear}} presidential election with {{presidentElectoral}} electoral votes for the {{presidentParty}} party. {{presidentOppName}} received {{presidentOppElectoral}} electoral votes for the {{presidentOppParty}} party.</p>"
      },
      {
        "id": 7,
        "allowed": "never",
        "text": "<p>In the {{electionVotesYear}} presidential election, the popular vote in {{electionVotesGeoName}} went to {{electionVotes1Name}} with Abbreviate{{electionVotes1Share}}% of the vote. The runner-up was {{electionVotes2Name}} (Abbreviate{{electionVotes2Share}}%), followed by {{electionVotes3Name}} (Abbreviate{{electionVotes3Share}}%).</p>"
      },
      {
        "id": 8,
        "allowed": "raceTopSentence",
        "text": "<p>{{raceTopSentence}}</p>"
      },
      {
        "id": 382,
        "allowed": "always",
        "text": "<p>{{languagePctWord}} of the households in {{nameLower}} reported speaking a non-English language at home as their primary shared language. This does not consider the potential multi-lingual nature of households, but only the primary self-reported language spoken by all members of the household.</p>"
      },
      {
        "id": 375,
        "allowed": "citizenshipCurr",
        "text": "<p>Abbreviate{{citizenshipCurr}}% of the residents in {{nameLower}} are U.S. citizens.</p>"
      },
      {
        "id": 4,
        "allowed": "universityTop5",
        "text": "<p>The largest universities in {{ipedsName}} are List{{aboutUniversities}}.</p>"
      },
      {
        "id": 3,
        "allowed": "propertyCurr",
        "text": "<p>In {{propertyCurrYear}}, the median property value in {{nameLower}} was Salary{{propertyCurr}}, and the homeownership rate was Abbreviate{{pct_rentOwn}}%.</p>"
      },
      {
        "id": 463,
        "allowed": "commuteTime",
        "text": "<p>Most people in {{nameLower}} transportation{{commuteMeans1}}, and the average commute time was Abbreviate{{commuteTime}} minutes. The average car ownership in {{nameLower}} was {{vehicles}} per household.</p>"
      },
      {
        "id": 2,
        "allowed": "neightborNamesVis",
        "text": "<p>{{nameUpper}} borders List{{neighborNames}}.</p>"
      },
      {
        "id": 5,
        "allowed": "isNation",
        "text": "<p>The most populated states in the United States are List{{mostPopulatedStates}} and the least populated are List{{leastPopulatedStates}}. The most populated counties are List{{mostPopulatedCounties}}, while the most populated census designated places are List{{mostPopulatedPlaces}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      1
    ]
  },
  {
    "id": 42,
    "slug": "demographics",
    "type": "Grouping",
    "ordering": 2,
    "allowed": "visiblePopulationDiversity",
    "position": "default",
    "icon": "geosearch",
    "title": "<p>Population &amp; Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 101,
        "allowed": "citizenshipCurr",
        "text": "<p>{{nameUpper}} is home to a population of Abbreviate{{popCurr}} people, from which Abbreviate{{citizenshipCurr}}% are citizens.</p>"
      },
      {
        "id": 569,
        "allowed": "foreignbornTotal",
        "text": "<p>As of {{foreignbornCurrYear}}, Abbreviate{{foreignbornCurr}}% of {{name}} residents were born outside of the country (Abbreviate{{foreignbornTotal}} people).</p>"
      },
      {
        "id": 103,
        "allowed": "raceTopRatio",
        "text": "<p>In {{raceCurrYear}}, there were Abbreviate{{raceTopRatio}} times more {{race1Name}} residents (Abbreviate{{race1Value}} people) in {{nameLower}} than any other race or ethnicity. There were Abbreviate{{race2Value}} {{race2Name}} and Abbreviate{{race3Value}} {{race3Name}} residents, the second and third most common ethnic groups.</p>"
      },
      {
        "id": 102,
        "allowed": "language1Name",
        "text": "<p>The most common non-English languages spoken as the primary language in households in {{nameLower}} are List{{languageList}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 200,
    "slug": "population_and_diversity",
    "type": "SubGrouping",
    "ordering": 3,
    "allowed": "visiblePopulationSection",
    "position": "default",
    "icon": "",
    "title": "<p>Population &amp; Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 185,
    "slug": "population_by_location",
    "type": "TextViz",
    "ordering": 4,
    "allowed": "isNationState",
    "position": "default",
    "icon": "",
    "title": "<p>Population by Location</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 384,
        "allowed": "isNation",
        "text": "<p>In {{lastYearPopulation}} there were commas{{totalPopulationUSA}} residents in {{nameLower}}.</p>"
      },
      {
        "id": 383,
        "allowed": "isNation",
        "text": "<p>The states with the highest resident population were list{{top3PopulationByState}}.</p>"
      },
      {
        "id": 386,
        "allowed": "isState",
        "text": "<p>In {{lastYearPopulation}} there were commas{{totalPopulationState}} residents in {{nameLower}}.</p>"
      },
      {
        "id": 387,
        "allowed": "isState",
        "text": "<p>The Public Use Microdata Areas (PUMA) with the highest resident population were list{{top3PopulationByPuma}}.</p>"
      },
      {
        "id": 385,
        "allowed": "always",
        "text": "<p>The following map shows all of the states in {{nameLower}} colored by the resident population.</p>"
      }
    ],
    "stats": [
      {
        "id": 374,
        "allowed": "isNation",
        "title": "<p>The 3 states with the highest resident population</p>",
        "value": "<p>{{populationState1}}</p>",
        "subtitle": "<p>commas{{populationStateValue1}}</p>",
        "tooltip": ""
      },
      {
        "id": 375,
        "allowed": "isNation",
        "title": "<p>The 3 states with the highest resident population</p>",
        "value": "<p>{{populationState2}}</p>",
        "subtitle": "<p>commas{{populationStateValue2}}</p>",
        "tooltip": ""
      },
      {
        "id": 376,
        "allowed": "isNation",
        "title": "<p>The 3 states with the highest resident population</p>",
        "value": "<p>{{populationState3}}</p>",
        "subtitle": "<p>commas{{populationStateValue3}}</p>",
        "tooltip": ""
      },
      {
        "id": 379,
        "allowed": "isState",
        "title": "<p>The 3 PUMAS with the highest resident population</p>",
        "value": "<p>{{populationPuma1}}</p>",
        "subtitle": "<p>commas{{populationPumaValue1}}</p>",
        "tooltip": ""
      },
      {
        "id": 380,
        "allowed": "isState",
        "title": "<p>The 3 PUMAS with the highest resident population</p>",
        "value": "<p>{{populationPuma2}}</p>",
        "subtitle": "<p>commas{{populationPumaValue2}}</p>",
        "tooltip": ""
      },
      {
        "id": 381,
        "allowed": "isState",
        "title": "<p>The 3 PUMAS with the highest resident population</p>",
        "value": "<p>{{populationPuma3}}</p>",
        "subtitle": "<p>commas{{populationPumaValue3}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "genderResidents",
      "pums5RacesResident"
    ],
    "visualizations": [
      377
    ]
  },
  {
    "id": 186,
    "slug": "residents",
    "type": "TextViz",
    "ordering": 5,
    "allowed": "visibleResidents",
    "position": "default",
    "icon": "",
    "title": "<p>Residents by Gender and Age</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 398,
        "allowed": "residentsAllRaces_[[pums5RacesPyramid]]",
        "text": "<p>The resident population of {{name}} in {{lastYearPopulation}} was commas{{residentPopulation_[[pums5RacesPyramid]]}} inhabitants, with abbreviate{{menResidentsPct_[[pums5RacesPyramid]]}}% men, and abbreviate{{womenResidentsPct_[[pums5RacesPyramid]]}}% women.</p>"
      },
      {
        "id": 1398,
        "allowed": "residentsOneRace_[[pums5RacesPyramid]]",
        "text": "<p>In {{lastYearPopulation}}, the number of residents of {{name}} who reported their race as {{[[pums5RacesPyramid]]}} was commas{{residentPopulation_[[pums5RacesPyramid]]}}, with abbreviate{{menResidentsPct_[[pums5RacesPyramid]]}}% men, and abbreviate{{womenResidentsPct_[[pums5RacesPyramid]]}}% women.</p>"
      },
      {
        "id": 2398,
        "allowed": "residentsNoRace_[[pums5RacesPyramid]]",
        "text": "<p>In {{lastYearPopulation}}, no residents of {{name}} reported their race as {{[[pums5RacesPyramid]]}}.</p>"
      },
      {
        "id": 400,
        "allowed": "always",
        "text": "<p>The visualization shows the distribution of the residents by gender and age in {{name}}.</p>"
      },
      {
        "id": 399,
        "allowed": "always",
        "text": "<p>With the upper buttons you can add a filter by race.</p>"
      }
    ],
    "stats": [
      {
        "id": 377,
        "allowed": "always",
        "title": "<p>Women</p>",
        "value": "<p>commas{{womenResidents_[[pums5RacesPyramid]]}}</p>",
        "subtitle": "<p>abbreviate{{womenResidentsPct_[[pums5RacesPyramid]]}}%</p>",
        "tooltip": ""
      },
      {
        "id": 378,
        "allowed": "always",
        "title": "<p>Men</p>",
        "value": "<p>commas{{menResidents_[[pums5RacesPyramid]]}}</p>",
        "subtitle": "<p>abbreviate{{menResidentsPct_[[pums5RacesPyramid]]}}%</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "pums5RacesPyramid"
    ],
    "visualizations": [
      375
    ]
  },
  {
    "id": 46,
    "slug": "citizenship",
    "type": "TextViz",
    "ordering": 6,
    "allowed": "citizenshipCurr",
    "position": "default",
    "icon": "",
    "title": "<p>Citizenship</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 111,
        "allowed": "acsMultiYearNotNation",
        "text": "<p>As of {{citizenshipCurrYear}}, Abbreviate{{citizenshipCurr}}% of {{name}} residents were US citizens, which is HighWord{{citizenshipComp}} the national average of Abbreviate{{citizenshipNation}}%. In {{citizenshipPrevYear}}, the percentage of US citizens in {{nameLower}} was Abbreviate{{citizenshipPrev}}%, meaning that the rate of citizenship has been Increasing{{citizenshipDiff}}.</p>"
      },
      {
        "id": 353,
        "allowed": "acsSingleYear",
        "text": "<p>As of {{citizenshipCurrYear}}, Abbreviate{{citizenshipCurr}}% of {{name}} residents were US citizens, which is HighWord{{citizenshipComp}} the national average of Abbreviate{{citizenshipNation}}%.</p>"
      },
      {
        "id": 109,
        "allowed": "notNation",
        "text": "<p>The following chart shows US citizenship percentages in {{nameLower}} compared to that of it's neighboring and parent geographies.</p>"
      },
      {
        "id": 110,
        "allowed": "isNation",
        "text": "<p>As of {{citizenshipCurrYear}}, Abbreviate{{citizenshipCurr}}% of {{name}} residents were US citizens. In {{citizenshipPrevYear}}, the percentage of US citizens was Abbreviate{{citizenshipPrev}}%, meaning that the rate of citizenship has been Increasing{{citizenshipDiff}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 100,
        "allowed": "always",
        "title": "<p>{{citizenshipCurrYear}} Citizenship</p>",
        "value": "<p>Abbreviate{{citizenshipCurr}}%</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 101,
        "allowed": "citizenshipPrev",
        "title": "<p>{{citizenshipPrevYear}} Citizenship</p>",
        "value": "<p>Abbreviate{{citizenshipPrev}}%</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      430,
      431
    ]
  },
  {
    "id": 201,
    "slug": "diversity",
    "type": "SubGrouping",
    "ordering": 7,
    "allowed": "visibleDiversityFullSection",
    "position": "default",
    "icon": "",
    "title": "<p>Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 47,
    "slug": "race_and_ethnicity",
    "type": "TextViz",
    "ordering": 8,
    "allowed": "visibleRaceEth",
    "position": "default",
    "icon": "",
    "title": "<p>Race and Ethnicity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 113,
        "allowed": "raceTopRatio",
        "text": "<p>In {{raceCurrYear}}, there were Abbreviate{{raceTopRatio}} times more {{race1Name}} residents (Abbreviate{{race1Value}} people) in {{nameLower}} than any other race or ethnicity. There were Abbreviate{{race2Value}} {{race2Name}} and Abbreviate{{race3Value}} {{race3Name}} residents, the second and third most common ethnic groups.</p>"
      },
      {
        "id": 360,
        "allowed": "hispanicPopShare",
        "text": "<p>Abbreviate{{hispanicPopShare}}% of the people in {{nameLower}} are hispanic (Abbreviate{{hispanicPop}} people).</p>"
      },
      {
        "id": 112,
        "allowed": "raceNum",
        "text": "<p>The following chart shows the {{raceNum}} races represented in {{nameLower}} as a share of the total population.</p>"
      }
    ],
    "stats": [
      {
        "id": 103,
        "allowed": "race1Name",
        "title": "<p>The 3 largest ethnic groups in {{name}}</p>",
        "value": "<p>{{race1Name}}</p>",
        "subtitle": "<p>Abbreviate{{race1Value}} ± Abbreviate{{race1Moe}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 102,
        "allowed": "race2Name",
        "title": "<p>The 3 largest ethnic groups in {{name}}</p>",
        "value": "<p>{{race2Name}}</p>",
        "subtitle": "<p>Abbreviate{{race2Value}} ± Abbreviate{{race2Moe}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 104,
        "allowed": "race3Name",
        "title": "<p>The 3 largest ethnic groups in {{name}}</p>",
        "value": "<p>{{race3Name}}</p>",
        "subtitle": "<p>Abbreviate{{race3Value}} ± Abbreviate{{race3Moe}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 356,
        "allowed": "hispanicPopShare",
        "title": "<p>Hispanic Population</p>",
        "value": "<p>Abbreviate{{hispanicPopShare}}%</p>",
        "subtitle": "<p>Abbreviate{{hispanicPop}} people</p>",
        "tooltip": ""
      }
    ],
    "selectors": [],
    "visualizations": [
      365
    ]
  },
  {
    "id": 45,
    "slug": "global_diversity",
    "type": "TextViz",
    "ordering": 9,
    "allowed": "visibleGlobalDiversity",
    "position": "default",
    "icon": "",
    "title": "<p>Global Diversity</p>",
    "short": "",
    "subtitles": [
      {
        "id": 20,
        "allowed": "subtitlePums",
        "text": "<p>{{subtitlePums}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 108,
        "allowed": "always",
        "text": "<p>In {{birthplaceYear}}, the most common birthplace for the foreign-born residents of {{pumaName}} was {{birthplace1Name}}, the natal country of Commas{{birthplace1Value}} {{pumaName}} residents, followed by {{birthplace2Name}} with Commas{{birthplace2Value}} and {{birthplace3Name}} with Commas{{birthplace3Value}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 98,
        "allowed": "birthplace1Name",
        "title": "<p>Most Common Origin</p>",
        "value": "<p>{{birthplace1Name}}</p>",
        "subtitle": "<p>Commas{{birthplace1Value}} ± Commas{{birthplace1Moe}} people</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 99,
        "allowed": "birthplace2Name",
        "title": "<p>Most Common Origin</p>",
        "value": "<p>{{birthplace2Name}}</p>",
        "subtitle": "<p>Commas{{birthplace2Value}} ± Commas{{birthplace2Moe}} people</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 97,
        "allowed": "birthplace3Name",
        "title": "<p>Most Common Origin</p>",
        "value": "<p>{{birthplace3Name}}</p>",
        "subtitle": "<p>Commas{{birthplace3Value}} ± Commas{{birthplace3Moe}} people</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      366
    ]
  },
  {
    "id": 44,
    "slug": "foreign_born_population",
    "type": "TextViz",
    "ordering": 10,
    "allowed": "foreignbornCurr",
    "position": "default",
    "icon": "",
    "title": "<p>Foreign-Born Population</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 107,
        "allowed": "acsMultiYearNotNation",
        "text": "<p>As of {{foreignbornCurrYear}}, Abbreviate{{foreignbornCurr}}% of {{name}} residents (Abbreviate{{foreignbornTotal}} people) were born outside of the United States, which is HighWord{{foreignbornComp}} the national average of Abbreviate{{foreignbornNation}}%. In {{foreignbornPrevYear}}, the percentage of foreign-born citizens in {{nameLower}} was Abbreviate{{foreignbornPrev}}%, meaning that the rate has been Increasing{{foreignbornDiff}}.</p>"
      },
      {
        "id": 352,
        "allowed": "acsSingleYear",
        "text": "<p>As of {{foreignbornCurrYear}}, Abbreviate{{foreignbornCurr}}% of {{name}} residents (Abbreviate{{foreignbornTotal}} people) were born outside of the United States, which is HighWord{{foreignbornComp}} the national average of Abbreviate{{foreignbornNation}}%.</p>"
      },
      {
        "id": 106,
        "allowed": "notNation",
        "text": "<p>The following chart shows the percentage of foreign-born residents in {{nameLower}} compared to that of it's neighboring and parent geographies.</p>"
      },
      {
        "id": 105,
        "allowed": "isNation",
        "text": "<p>As of {{foreignbornCurrYear}}, Abbreviate{{foreignbornCurr}}% of {{name}} residents (Abbreviate{{foreignbornTotal}} people) were born outside of the country. In {{foreignbornPrevYear}}, the percentage of foreign-born citizens was Abbreviate{{foreignbornPrev}}%, meaning that the rate has been Increasing{{foreignbornDiff}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 95,
        "allowed": "always",
        "title": "<p>{{foreignbornCurrYear}} Foreign-Born Population</p>",
        "value": "<p>Abbreviate{{foreignbornCurr}}%</p>",
        "subtitle": "<p>Abbreviate{{foreignbornTotal}} people</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 96,
        "allowed": "foreignbornPrev",
        "title": "<p>{{foreignbornPrevYear}} Foreign-Born Population</p>",
        "value": "<p>Abbreviate{{foreignbornPrev}}%</p>",
        "subtitle": "<p>Abbreviate{{foreignbornTotalPrev}} people</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      432,
      433
    ]
  },
  {
    "id": 48,
    "slug": "languages",
    "type": "TextViz",
    "ordering": 11,
    "allowed": "language1Name",
    "position": "default",
    "icon": "",
    "title": "<p>Non-English Households</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 114,
        "allowed": "always",
        "text": "<p>{{languagePctWord}} of the households in {{nameLower}} reported speaking a non-English language at home as their primary shared language, which is HighWord{{languageDiff}} the national average of Abbreviate{{languagePctNation}}%. This does not consider the potential multi-lingual nature of households, but only the primary self-reported language spoken by all members of the household.</p>"
      },
      {
        "id": 372,
        "allowed": "always",
        "text": "<p>In {{languageYear}}, the most common non-English language spoken in households in {{nameLower}} was {{language1Name}}. Abbreviate{{language1Pct}}% of the households in {{nameLower}} reported speaking {{language1Name}} at home as the primary shared language between all members living in the household.</p>"
      }
    ],
    "stats": [
      {
        "id": 106,
        "allowed": "always",
        "title": "<p>Most Common Non-English Languages</p>",
        "value": "<p>{{language1Name}}</p>",
        "subtitle": "<p>Commas{{language1Value}} households (Abbreviate{{language1Pct}}%)</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 105,
        "allowed": "language2Value",
        "title": "<p>Most Common Non-English Languages</p>",
        "value": "<p>{{language2Name}}</p>",
        "subtitle": "<p>Commas{{language2Value}} households (Abbreviate{{language2Pct}}%)</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 107,
        "allowed": "language3Value",
        "title": "<p>Most Common Non-English Languages</p>",
        "value": "<p>{{language3Name}}</p>",
        "subtitle": "<p>Commas{{language3Value}} households (Abbreviate{{language3Pct}}%)</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      367
    ]
  },
  {
    "id": 202,
    "slug": "military",
    "type": "SubGrouping",
    "ordering": 12,
    "allowed": "conflict1Name",
    "position": "default",
    "icon": "",
    "title": "<p>Military</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 49,
    "slug": "veteran",
    "type": "TextViz",
    "ordering": 13,
    "allowed": "conflict1Name",
    "position": "default",
    "icon": "",
    "title": "<p>Veterans</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 115,
        "allowed": "conflict1Size",
        "text": "<p>{{nameUpper}} has a large population of military personnel who served in {{conflict1Name}}, Abbreviate{{conflict1Size}} times greater than any other conflict.</p>"
      },
      {
        "id": 561,
        "allowed": "always",
        "text": "<p>The chart shows the distribution of veterans by conflict in {{nameUpper}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 108,
        "allowed": "always",
        "title": "<p>Most Common Service Period</p>",
        "value": "<p>{{conflict1Name}}</p>",
        "subtitle": "<p>Commas{{conflict1Value}} ± Commas{{conflict1Moe}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 109,
        "allowed": "conflict2Name",
        "title": "<p>Most Common Service Period</p>",
        "value": "<p>{{conflict2Name}}</p>",
        "subtitle": "<p>Commas{{conflict2Value}} ± Commas{{conflict2Moe}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 110,
        "allowed": "conflict3Name",
        "title": "<p>Most Common Service Period</p>",
        "value": "<p>{{conflict3Name}}</p>",
        "subtitle": "<p>Commas{{conflict3Value}} ± Commas{{conflict3Moe}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      370
    ]
  },
  {
    "id": 34,
    "slug": "health",
    "type": "Grouping",
    "ordering": 14,
    "allowed": "visiblehealthSection",
    "position": "default",
    "icon": "pulse",
    "title": "<p>Health</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 80,
        "allowed": "notDistrict",
        "text": "<p>Abbreviate{{insuranceSome}}% of the population of {{nameLower}} has health coverage, with Abbreviate{{insuranceEmp}}% on employee plans, Abbreviate{{insuranceMedicaid}}% on Medicaid, Abbreviate{{insuranceMedicare}}% on Medicare, Abbreviate{{insuranceNon}}% on non-group plans, and Abbreviate{{insuranceOther}}% on military or VA plans.</p>"
      },
      {
        "id": 79,
        "allowed": "visibleTextProvider",
        "text": "<p>Primary care physicians in {{stateName}} see commas{{PhysicianCurr}} patients per year on average, which represents a GrowthPct{{PhysicianGrowth}} IncreaseWord{{PhysicianGrowth}} from the previous year (commas{{PhysicianPrev}} patients). Compare this to dentists who see {{DentistCurr}} patients per year, and mental health providers who see {{MentalCurr}} patients per year.</p>"
      },
      {
        "id": 559,
        "allowed": "visibleTextProviderCounty",
        "text": "<p>Primary care physicians in {{countyName}} see commas{{PhysicianCurrCounty}} patients per year on average, which represents a GrowthPct{{PhysicianGrowthCounty}} IncreaseWord{{PhysicianGrowthCounty}} from the previous year (commas{{PhysicianPrevCounty}} patients). Compare this to dentists who see {{DentistCurrCounty}} patients per year, and mental health providers who see {{MentalCurrCounty}} patients per year.</p>"
      },
      {
        "id": 83,
        "allowed": "isNation",
        "text": "<p>{{physicians1Name}}, {{physicians2Name}} and {{physicians3Name}} are the states with highest number of primary care patients per physician per year, with Commas{{physicians1Value}}, Commas{{physicians2Value}} and Commas{{physicians3Value}} patients on average in {{yearPhysicians}}.</p>"
      },
      {
        "id": 84,
        "allowed": "isNation",
        "text": "<p>Comparing with dentists, {{dentists1Name}}, {{dentists2Name}} and {{dentists3Name}} are the states with highest number of patients per year, with Commas{{dentists1Value}}, Commas{{dentists2Value}} and Commas{{dentists3Value}} on average in {{yearDentists}}.</p>"
      },
      {
        "id": 560,
        "allowed": "isNation",
        "text": "<p>Among all U.S. states, {{diabetes1Name}} has the highest prevalence of diabetes (growthPct{{diabetes1Value}}). Additionally, {{obesity1Name}} has the highest prevalence of adult obesity (growthPct{{obesity1Value}})</p>"
      },
      {
        "id": 466,
        "allowed": "isNotDistrict",
        "text": "<p>By gender, of the total number of insured persons, growthPct{{menCoverage}} were men and growthPct{{womenCoverage}} were women.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 218,
    "slug": "coverage",
    "type": "SubGrouping",
    "ordering": 15,
    "allowed": "visibleCoverageSection",
    "position": "default",
    "icon": "",
    "title": "<p>Coverage</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 35,
    "slug": "clinician_patient_ratio",
    "type": "TextViz",
    "ordering": 16,
    "allowed": "visiblePatient",
    "position": "default",
    "icon": "",
    "title": "<p>Patient to Clinician Ratios</p>",
    "short": "",
    "subtitles": [
      {
        "id": 14,
        "allowed": "isMsaOrPuma",
        "text": "<p>Data is only available at the state level. Showing data for {{providerName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 87,
        "allowed": "always",
        "text": "<p>Sentence{{[[provider-clinician_patient_ratio]]Type}} in {{providerName_}} see an average of commas{{value_[[provider-clinician_patient_ratio]]}} patients per year. This represents a growthPct{{growthValue_[[provider-clinician_patient_ratio]]}} IncreaseWord{{growthValue_[[provider-clinician_patient_ratio]]}} from the previous year (commas{{prevValue_[[provider-clinician_patient_ratio]]}} patients).</p>"
      },
      {
        "id": 88,
        "allowed": "always",
        "text": "<p>The following chart shows how the number of patients seen by Lower{{[[provider-clinician_patient_ratio]]Type}} has been changing over time in {{providerName_}} in comparison to its neighboring geographies.</p>"
      }
    ],
    "stats": [
      {
        "id": 70,
        "allowed": "always",
        "title": "<p>{{[[provider-clinician_patient_ratio]]}} in {{providerName_}}</p>",
        "value": "<p>commas{{value_[[provider-clinician_patient_ratio]]}} to 1</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "provider-clinician_patient_ratio"
    ],
    "visualizations": [
      42
    ]
  },
  {
    "id": 258,
    "slug": "distance-to-health-services-by-state",
    "type": "PrismSection",
    "ordering": 17,
    "allowed": "visiblePrismDataState",
    "position": "default",
    "icon": "",
    "title": "<p>Distance to Health Services by State</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 568,
        "allowed": "always",
        "text": "<p>The visualization shows the distribution of addresses by average distance to {{[[healthServiceSelector]]}} across {{name}} and neighboring geographies, and the share of addresses within each distance category.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "healthServiceSelector"
    ],
    "visualizations": [
      446
    ]
  },
  {
    "id": 255,
    "slug": "distance-to-health-services-by-counties",
    "type": "PrismSection",
    "ordering": 18,
    "allowed": "visiblePrismDataState",
    "position": "default",
    "icon": "",
    "title": "<p>Distance to Health Services by County</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 565,
        "allowed": "always",
        "text": "<p>The map shows how average distance to {{[[healthServiceSelector2]]}} varies across counties in {{name}}, indicating county-level differences in access across the state.</p>"
      }
    ],
    "stats": [
      {
        "id": 402,
        "allowed": "top1CountyName_[[healthServiceSelector2]]",
        "title": "<p>COUNTIES WITH GREATEST AVERAGE DISTANCE TO HEALTH SERVICES</p>\n<p><em>Click a county name for facility-level data. Similar data is available for all U.S. counties.</em></p>",
        "value": "<p>{{top1CountyName_[[healthServiceSelector2]]}}</p>",
        "subtitle": "<p>{{top1CountyHousehols_[[healthServiceSelector2]]}} addresses are approximately {{top1CountyAvgDistance_[[healthServiceSelector2]]}} miles from the nearest health facility.</p>",
        "tooltip": ""
      },
      {
        "id": 403,
        "allowed": "top2CountyName_[[healthServiceSelector2]]",
        "title": "<p>COUNTIES WITH GREATEST AVERAGE DISTANCE TO HEALTH SERVICES</p>\n<p><em>Click a county name for facility-level data. Similar data is available for all U.S. counties.</em></p>",
        "value": "<p>{{top2CountyName_[[healthServiceSelector2]]}}</p>",
        "subtitle": "<p>{{top2CountyHousehols_[[healthServiceSelector2]]}} addresses are approximately {{top2CountyAvgDistance_[[healthServiceSelector2]]}} miles from the nearest health facility.</p>",
        "tooltip": ""
      },
      {
        "id": 404,
        "allowed": "top3CountyName_[[healthServiceSelector2]]",
        "title": "<p>COUNTIES WITH GREATEST AVERAGE DISTANCE TO HEALTH SERVICES</p>\n<p><em>Click a county name for facility-level data. Similar data is available for all U.S. counties.</em></p>",
        "value": "<p>{{top3CountyName_[[healthServiceSelector2]]}}</p>",
        "subtitle": "<p>{{top3CountyHousehols_[[healthServiceSelector2]]}} addresses are approximately {{top3CountyAvgDistance_[[healthServiceSelector2]]}} miles from the nearest health facility.</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "healthServiceSelector2"
    ],
    "visualizations": [
      441
    ]
  },
  {
    "id": 256,
    "slug": "location-of-health-services-facilities",
    "type": "PrismSectionForm",
    "ordering": 19,
    "allowed": "isPrismCounty",
    "position": "default",
    "icon": "",
    "title": "<p>Location of Health Services Facilities</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 566,
        "allowed": "hidden",
        "text": "<p>As of 2025, there are a total of {{facilities_[[healthServiceSelector3]]}} {{[[healthServiceSelector3]]}} in {{name}}. The map shows a sample of the locations for this health facility type. Contact Deloitte to access the full dataset.</p>"
      }
    ],
    "stats": [
      {
        "id": 405,
        "allowed": "top1FacilityName_[[healthServiceSelector3]]",
        "title": "<p>Top 5 Health Facilities Servicing the Greatest Number of Addresses</p>",
        "value": "<p>Sentence{{top1FacilityName_[[healthServiceSelector3]]}}</p>",
        "subtitle": "<p>{{top1HouseholdServed_[[healthServiceSelector3]]}} addresses are identified as having this as their nearest facility.</p>\n<p><br></p>\n<p>{{top1FacilityAddress_[[healthServiceSelector3]]}}, {{top1FacilityCity_[[healthServiceSelector3]]}}, {{top1FacilityTract_[[healthServiceSelector3]]}}</p>",
        "tooltip": ""
      },
      {
        "id": 406,
        "allowed": "top2FacilityName_[[healthServiceSelector3]]",
        "title": "<p>Top 5 Health Facilities Servicing the Greatest Number of Addresses</p>",
        "value": "<p>Sentence{{top2FacilityName_[[healthServiceSelector3]]}}</p>",
        "subtitle": "<p>{{top2HouseholdServed_[[healthServiceSelector3]]}} addresses are identified as having this as their nearest facility.</p>\n<p><br></p>\n<p>{{top2FacilityAddress_[[healthServiceSelector3]]}}, {{top2FacilityCity_[[healthServiceSelector3]]}}, {{top2FacilityTract_[[healthServiceSelector3]]}}</p>",
        "tooltip": ""
      },
      {
        "id": 407,
        "allowed": "top3FacilityName_[[healthServiceSelector3]]",
        "title": "<p>Top 5 Health Facilities Servicing the Greatest Number of Addresses</p>",
        "value": "<p>Sentence{{top3FacilityName_[[healthServiceSelector3]]}}</p>",
        "subtitle": "<p>{{top3HouseholdServed_[[healthServiceSelector3]]}} addresses are identified as having this as their nearest facility.</p>\n<p><br></p>\n<p>{{top3FacilityAddress_[[healthServiceSelector3]]}}, {{top3FacilityCity_[[healthServiceSelector3]]}}, {{top3FacilityTract_[[healthServiceSelector3]]}}</p>",
        "tooltip": ""
      },
      {
        "id": 408,
        "allowed": "top4FacilityName_[[healthServiceSelector3]]",
        "title": "<p>Top 5 Health Facilities Servicing the Greatest Number of Addresses</p>",
        "value": "<p>Sentence{{top4FacilityName_[[healthServiceSelector3]]}}</p>",
        "subtitle": "<p>{{top4HouseholdServed_[[healthServiceSelector3]]}} addresses are identified as having this as their nearest facility.</p>\n<p><br></p>\n<p>{{top4FacilityAddress_[[healthServiceSelector3]]}}, {{top4FacilityCity_[[healthServiceSelector3]]}}, {{top4FacilityTract_[[healthServiceSelector3]]}}</p>",
        "tooltip": ""
      },
      {
        "id": 409,
        "allowed": "top5FacilityName_[[healthServiceSelector3]]",
        "title": "<p>Top 5 Health Facilities Servicing the Greatest Number of Addresses</p>",
        "value": "<p>Sentence{{top5FacilityName_[[healthServiceSelector3]]}}</p>",
        "subtitle": "<p>{{top5HouseholdServed_[[healthServiceSelector3]]}} addresses are identified as having this as their nearest facility.</p>\n<p><br></p>\n<p>{{top5FacilityAddress_[[healthServiceSelector3]]}}, {{top5FacilityCity_[[healthServiceSelector3]]}}, {{top5FacilityTract_[[healthServiceSelector3]]}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "healthServiceSelector3"
    ],
    "visualizations": [
      442
    ]
  },
  {
    "id": 223,
    "slug": "health_care_diversity",
    "type": "TextViz",
    "ordering": 20,
    "allowed": "coverageByAge",
    "position": "default",
    "icon": "",
    "title": "<p>Health Care Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 434,
        "allowed": "always",
        "text": "<p>In {{lastYearCoverage_ageOption}}, insured persons according to age ranges were distributed in list{{coverageByAge}}.</p>"
      },
      {
        "id": 435,
        "allowed": "always",
        "text": "<p>By gender, of the total number of insured persons, growthPct{{menCoverage}} were men and growthPct{{womenCoverage}} were women.</p>"
      },
      {
        "id": 436,
        "allowed": "always",
        "text": "<p>The following chart shows the number of people with health coverage by Lower{{[[healthDiversity]]}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "healthDiversity"
    ],
    "visualizations": [
      395
    ]
  },
  {
    "id": 40,
    "slug": "uninsured_people",
    "type": "TextViz",
    "ordering": 21,
    "allowed": "insuranceYearCurr",
    "position": "default",
    "icon": "",
    "title": "<p>Uninsured People</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 97,
        "allowed": "acsMultiYear",
        "text": "<p>Between {{insuranceYearPrev}} and {{insuranceYearCurr}}, the percent of uninsured citizens in {{nameLower}} GrewWord{{insuranceGrowth}} by GrowthPct{{insuranceGrowth}} from Abbreviate{{insurancePrev}}% to Abbreviate{{insuranceNone}}%.</p>"
      },
      {
        "id": 98,
        "allowed": "always",
        "text": "<p>The following chart shows how the percent of uninsured individuals in {{nameLower}} changed over time compared with the percent of individuals enrolled in various types of health insurance.</p>"
      }
    ],
    "stats": [
      {
        "id": 84,
        "allowed": "always",
        "title": "<p>Uninsured</p>",
        "value": "<p>Abbreviate{{insuranceNone}}%</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 85,
        "allowed": "always",
        "title": "<p>Employer Coverage</p>",
        "value": "<p>Abbreviate{{insuranceEmp}}%</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 86,
        "allowed": "always",
        "title": "<p>Medicaid</p>",
        "value": "<p>Abbreviate{{insuranceMedicaid}}%</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 87,
        "allowed": "always",
        "title": "<p>Medicare</p>",
        "value": "<p>Abbreviate{{insuranceMedicare}}%</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 88,
        "allowed": "always",
        "title": "<p>Non-Group</p>",
        "value": "<p>Abbreviate{{insuranceNon}}%</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 89,
        "allowed": "always",
        "title": "<p>Military or VA</p>",
        "value": "<p>Abbreviate{{insuranceOther}}%</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      401
    ]
  },
  {
    "id": 219,
    "slug": "health_indicators",
    "type": "SubGrouping",
    "ordering": 22,
    "allowed": "visibleHealthIndSection",
    "position": "default",
    "icon": "",
    "title": "<p>Health Indicators</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 224,
    "slug": "health_outcomes",
    "type": "TextViz",
    "ordering": 23,
    "allowed": "visibleOutcomes",
    "position": "default",
    "icon": "",
    "title": "<p>Health Outcomes</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 444,
        "allowed": "visibleStateLengthLife_[[healthOutcomesOptions]]_[[lengthOfLife]]",
        "text": "<p>{{textStateCountyHealthOutcomes_[[lengthOfLife]]}}</p>"
      },
      {
        "id": 445,
        "allowed": "visibleStateQualityLife_[[healthOutcomesOptions]]_[[qualityOfLife]]",
        "text": "<p>{{textStateCountyHealthOutcomes_[[qualityOfLife]]}}</p>"
      },
      {
        "id": 438,
        "allowed": "isState",
        "text": "<p>The &nbsp;map shows the distribution of the indicator in the counties of {{name}} and the graphic underneath the paragraph shows the trend of the indicator in {{name}}.</p>"
      },
      {
        "id": 439,
        "allowed": "isCounty",
        "text": "<p>The graphic shows the trend of the indicator in {{name}}.</p>"
      },
      {
        "id": 442,
        "allowed": "visibleNationLengthLife_[[healthOutcomesOptions]]",
        "text": "<p>{{top3HealthOutcomes_[[lengthOfLife]]}}</p>"
      },
      {
        "id": 443,
        "allowed": "visibleNationQualityLife_[[healthOutcomesOptions]]",
        "text": "<p>{{top3HealthOutcomes_[[qualityOfLife]]}}</p>"
      },
      {
        "id": 440,
        "allowed": "isNation",
        "text": "<p>The following map shows all of the states in the United States colored according to the indicator selected in the upper buttons.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "healthOutcomesOptions",
      "lengthOfLife",
      "qualityOfLife"
    ],
    "visualizations": [
      214,
      213,
      424,
      425
    ]
  },
  {
    "id": 225,
    "slug": "health_behaviors",
    "type": "TextViz",
    "ordering": 24,
    "allowed": "visibleBehavior",
    "position": "default",
    "icon": "",
    "title": "<p>Health Behaviors</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 446,
        "allowed": "visibleStateDietAndExercise_[[healthBehaviorsOptions]]_[[dietAndExerciseOptions]]",
        "text": "<p>{{textStateCountyHealthBehavior_[[dietAndExerciseOptions]]}}</p>"
      },
      {
        "id": 447,
        "allowed": "visibleStateAlcoholDrugsTobacco_[[healthBehaviorsOptions]]_[[alcoholDrugsTobaccoOptions]]",
        "text": "<p>{{textStateCountyHealthBehavior_[[alcoholDrugsTobaccoOptions]]}}</p>"
      },
      {
        "id": 448,
        "allowed": "isState",
        "text": "<p>The &nbsp;map shows the distribution of the indicator in the counties of {{name}} and the graphic underneath the paragraph shows the trend of the indicator in {{name}}.</p>"
      },
      {
        "id": 449,
        "allowed": "isCounty",
        "text": "<p>The graphic shows the trend of the indicator in {{name}}.</p>"
      },
      {
        "id": 450,
        "allowed": "visibleNationDietAndExercise_[[healthBehaviorsOptions]]",
        "text": "<p>{{top3HealthBehavior_[[dietAndExerciseOptions]]}}</p>"
      },
      {
        "id": 451,
        "allowed": "visibleNationAlcoholDrugsTobacco_[[healthBehaviorsOptions]]",
        "text": "<p>{{top3HealthBehavior_[[alcoholDrugsTobaccoOptions]]}}</p>"
      },
      {
        "id": 452,
        "allowed": "isNation",
        "text": "<p>The following map shows all of the states in the United States colored according to the indicator selected in the upper buttons.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "healthBehaviorsOptions",
      "dietAndExerciseOptions",
      "alcoholDrugsTobaccoOptions"
    ],
    "visualizations": [
      215,
      216,
      426,
      427
    ]
  },
  {
    "id": 226,
    "slug": "clinical-care",
    "type": "TextViz",
    "ordering": 25,
    "allowed": "visibleHealthCare",
    "position": "default",
    "icon": "",
    "title": "<p>Clinical Care</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 453,
        "allowed": "visibleStateAccessCare_[[clinicalCareOptions]]_[[accessCareOptions]]",
        "text": "<p>{{textStateCountyHealthCare_[[accessCareOptions]]}}</p>"
      },
      {
        "id": 454,
        "allowed": "visibleStateQualityCare_[[clinicalCareOptions]]_[[qualityCareOptions]]",
        "text": "<p>{{textStateCountyHealthCare_[[qualityCareOptions]]}}</p>"
      },
      {
        "id": 455,
        "allowed": "isState",
        "text": "<p>The &nbsp;map shows the distribution of the indicator in the counties of {{name}} and the graphic underneath the paragraph shows the trend of the indicator in {{name}}.</p>"
      },
      {
        "id": 456,
        "allowed": "isCounty",
        "text": "<p>The graphic shows the trend of the indicator in {{name}}.</p>"
      },
      {
        "id": 457,
        "allowed": "visibleNationAccessCare_[[clinicalCareOptions]]",
        "text": "<p>{{top3HealthCare_[[accessCareOptions]]}}</p>"
      },
      {
        "id": 458,
        "allowed": "visibleNationQualityCare_[[clinicalCareOptions]]",
        "text": "<p>{{top3HealthCare_[[qualityCareOptions]]}}</p>"
      },
      {
        "id": 459,
        "allowed": "isNation",
        "text": "<p>The following map shows all of the states in the United States colored according to the indicator selected in the upper buttons.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "clinicalCareOptions",
      "accessCareOptions",
      "qualityCareOptions"
    ],
    "visualizations": [
      428,
      429
    ]
  },
  {
    "id": 15,
    "slug": "economy",
    "type": "Grouping",
    "ordering": 26,
    "allowed": "visibleEconomy",
    "position": "default",
    "icon": "briefcase",
    "title": "<p>Economy</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 462,
        "allowed": "isNation",
        "text": "<p>The workforce of {{nameLower}} in {{lastYearWorkforce}} was abbreviate{{womenWorkforcePct}}% woman and abbreviate{{menWorkforcePct}}% men. The states that concentrated the largest workforce were list{{top3WorkforceByState}}.</p>"
      },
      {
        "id": 42,
        "allowed": "textEconomyAbout",
        "text": "<p>The economy of {{nameLower}} employs Abbreviate{{empCurr}} people. In {{payingIndustryYear}}, the largest industries in {{nameLower}} were List{{commonIndustryList}}, and the highest paying industries were List{{payingIndustryList}}.</p>"
      },
      {
        "id": 361,
        "allowed": "visibleTextSalaries",
        "text": "<p>Males in {{wage1Geo}} have an average income that is Abbreviate{{wage1Gap}} times higher than the average income of females, which is Salary{{wage1Female}}. The income inequality in {{wage1Geo}} (measured using the Gini index) is Abbreviate{{gini1Curr}}, which is HighWord{{gini1Comp}} than the national average.</p>"
      },
      {
        "id": 344,
        "allowed": "wa2geo",
        "text": "<p>Comparatively, males in {{wage2Geo}} have an average income that is Abbreviate{{wage2Gap}} times higher than the average income of females, which is Salary{{wage2Female}}. The income inequality in {{wage2Geo}} is Abbreviate{{gini2Curr}}, which is HighWord{{gini2Comp}} than the national average.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 203,
    "slug": "employment",
    "type": "SubGrouping",
    "ordering": 27,
    "allowed": "visibleEmploymentSection",
    "position": "default",
    "icon": "",
    "title": "<p>Employment</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 187,
    "slug": "workforce_diversity",
    "type": "TextViz",
    "ordering": 28,
    "allowed": "visibleWorkforceDiversity",
    "position": "default",
    "icon": "",
    "title": "<p>Workforce Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 396,
        "allowed": "always",
        "text": "<p>The workforce of {{nameLower}} in {{lastYearWorkDiv}} was commas{{workforcePopulation}} people, with abbreviate{{womenWorkforcePct}}% woman, and abbreviate{{menWorkforcePct}}% men.</p>"
      },
      {
        "id": 395,
        "allowed": "always",
        "text": "<p>The visualization shows the distribution of the workforce by gender and age in {{nameLower}}.</p>"
      },
      {
        "id": 397,
        "allowed": "always",
        "text": "<p>With the upper buttons you can see the distribution of the average salary and add a filter by race.</p>"
      }
    ],
    "stats": [
      {
        "id": 372,
        "allowed": "always",
        "title": "<p>Women</p>",
        "value": "<p>commas{{womenWorkforce}}</p>",
        "subtitle": "<p>abbreviate{{womenWorkforcePct}}%</p>",
        "tooltip": ""
      },
      {
        "id": 373,
        "allowed": "always",
        "title": "<p>Men</p>",
        "value": "<p>commas{{menWorkforce}}</p>",
        "subtitle": "<p>abbreviate{{menWorkforcePct}}%</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "measureWorkforcePyramid",
      "pums5WorkforcePyramid"
    ],
    "visualizations": [
      381
    ]
  },
  {
    "id": 189,
    "slug": "workforce-and-wage-by-location",
    "type": "TextViz",
    "ordering": 29,
    "allowed": "visibleWorkforceWage",
    "position": "default",
    "icon": "",
    "title": "<p>Workforce and Wage by Location</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 393,
        "allowed": "isState",
        "text": "<p>In {{lastYearWorkforce}} there were commas{{totalWorkforceState}} people working in {{nameLower}}. The Public Use Microdata Areas (PUMA) that concentrated the largest workforce were list{{top3WorkforceByPuma}}.</p>"
      },
      {
        "id": 401,
        "allowed": "isNation",
        "text": "<p>In {{lastYearWorkforce}} there were commas{{totalWorkforceUSA}} people working in {{nameLower}}. The states that concentrated the largest workforce were list{{top3WorkforceByState}}.</p>"
      },
      {
        "id": 392,
        "allowed": "isNation",
        "text": "<p>The following map shows all of the states in {{nameLower}} colored by workforce or average wage.</p>"
      },
      {
        "id": 402,
        "allowed": "isState",
        "text": "<p>The following map shows all of the PUMAs in {{nameLower}} colored by workforce or average wage.</p>"
      },
      {
        "id": 394,
        "allowed": "always",
        "text": "<p>With the upper buttons you can see the yearly change and add a filter by race.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "measureWorkforceGeomap",
      "yearlyChangeWorkforceGeomap",
      "pums5RacesWorkforce"
    ],
    "visualizations": [
      383
    ]
  },
  {
    "id": 23,
    "slug": "occupations",
    "type": "TextViz",
    "ordering": 30,
    "allowed": "visibleOccupation",
    "position": "default",
    "icon": "",
    "title": "<p>Occupations</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 63,
        "allowed": "acsMultiYear",
        "text": "<p>From {{empPrevYear}} to {{empCurrYear}}, employment in {{nameLower}} GrewWord{{empGrowth}} at a rate of Abbreviate{{empGrowth}}%, from Abbreviate{{empPrev}} employees to Abbreviate{{empCurr}} employees.</p>"
      },
      {
        "id": 349,
        "allowed": "acsSingleYear",
        "text": "<p>In {{empCurrYear}}, there were Abbreviate{{empCurr}} employees (± Commas{{empCurrMoe}}) in {{nameLower}}.</p>"
      },
      {
        "id": 64,
        "allowed": "always",
        "text": "<p>The most common job groups, by number of people living in {{nameLower}}, are List{{commonOccupationList}}. This chart illustrates the share breakdown of the primary jobs held by residents of {{nameLower}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 57,
        "allowed": "useAcs",
        "title": "<p>{{empCurrYear}} Value</p>",
        "value": "<p>Abbreviate{{empCurr}}</p>",
        "subtitle": "<p>± Commas{{empCurrMoe}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 58,
        "allowed": "usePums",
        "title": "<p>{{empCurrYear}} Value</p>",
        "value": "<p>Abbreviate{{empCurr}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 56,
        "allowed": "empGrowth",
        "title": "<p>1 Year GrowthWord{{empGrowth}}</p>",
        "value": "<p>Abbreviate{{empGrowth}}%</p>",
        "subtitle": "<p>± Abbreviate{{empGrowthMoe}}%</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "genderOccupations",
      "measureOccupations",
      "growthOccupations"
    ],
    "visualizations": [
      386
    ]
  },
  {
    "id": 5,
    "slug": "covid-unemployment",
    "type": "Default",
    "ordering": 31,
    "allowed": "visibleUnemployment",
    "position": "default",
    "icon": "",
    "title": "<p>Unemployment Insurance Claims</p>",
    "short": "",
    "subtitles": [
      {
        "id": 2,
        "allowed": "isNotNationState",
        "text": "<p>Data is only available at the state level. Showing data for {{stateNameEmployment}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 13,
        "allowed": "notNation",
        "text": "<p>This chart shows weekly unemployment insurance claims in {{stateNameEmployment}} (not-seasonally adjusted) compared with the four states with the most similar impact.</p>"
      },
      {
        "id": 16,
        "allowed": "isNation",
        "text": "<p>This chart shows weekly unemployment insurance claims in the United States (not-seasonally adjusted).</p>"
      },
      {
        "id": 14,
        "allowed": "always",
        "text": "<p>The most recent data point uses Advance State Claims data, which can be revised in subsequent weeks.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      3
    ]
  },
  {
    "id": 204,
    "slug": "industries",
    "type": "SubGrouping",
    "ordering": 32,
    "allowed": "visibleIndustriesSection",
    "position": "default",
    "icon": "",
    "title": "<p>Industries</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 27,
    "slug": "employment_by_industries",
    "type": "Default",
    "ordering": 33,
    "allowed": "empCurr",
    "position": "default",
    "icon": "",
    "title": "<p>Employment by Industries</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 68,
        "allowed": "acsMultiYear",
        "text": "<p>From {{empPrevYear}} to {{empCurrYear}}, employment in {{nameLower}} GrewWord{{empGrowth}} at a rate of Abbreviate{{empGrowth}}%, from Abbreviate{{empPrev}} employees to Abbreviate{{empCurr}} employees.</p>"
      },
      {
        "id": 350,
        "allowed": "acsSingleYear",
        "text": "<p>In {{empCurrYear}}, there were Abbreviate{{empCurr}} employees (± Commas{{empCurrMoe}}) in {{nameLower}}.</p>"
      },
      {
        "id": 69,
        "allowed": "always",
        "text": "<p>The most common employment sectors for those who live in {{nameLower}}, are List{{commonIndustryList}}. This chart shows the share breakdown of the primary industries for residents of {{nameLower}}, though some of these residents may live in {{nameLower}} and work somewhere else. Census data is tagged to a residential address, not a work address.</p>"
      }
    ],
    "stats": [
      {
        "id": 60,
        "allowed": "useAcs",
        "title": "<p>{{empCurrYear}} Value</p>",
        "value": "<p>Abbreviate{{empCurr}}</p>",
        "subtitle": "<p>± Commas{{empCurrMoe}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 61,
        "allowed": "usePums",
        "title": "<p>{{empCurrYear}} Value</p>",
        "value": "<p>Abbreviate{{empCurr}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 59,
        "allowed": "empGrowth",
        "title": "<p>1 Year GrowthWord{{empGrowth}}</p>",
        "value": "<p>Abbreviate{{empGrowth}}%</p>",
        "subtitle": "<p>± Abbreviate{{empGrowthMoe}}%</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "measureTreemapIndustries",
      "genderTreemapIndustries",
      "yearlyChangeTreemapIndustries"
    ],
    "visualizations": [
      387
    ]
  },
  {
    "id": 190,
    "slug": "median_earnings",
    "type": "TextViz",
    "ordering": 34,
    "allowed": "medianEarningsByIndustryVis",
    "position": "default",
    "icon": "",
    "title": "<p>Median Earnings by Industry</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 390,
        "allowed": "always",
        "text": "<p>The industries with the best median earnings for men in {{lastYearMedianEarnings}} are list{{top3IndustriesMedianEarningMen}}.</p>"
      },
      {
        "id": 391,
        "allowed": "always",
        "text": "<p>The industries with the best median earnings for women in {{lastYearMedianEarnings}} are list{{top3IndustriesMedianEarningWomen}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 370,
        "allowed": "menMedianEarning",
        "title": "<p>Median earning men ± {{menMedianEarningMoe}}</p>",
        "value": "<p>{{menMedianEarning}}</p>",
        "subtitle": "",
        "tooltip": ""
      },
      {
        "id": 371,
        "allowed": "womenMedianEarning",
        "title": "<p>Median earning women ± {{womenMedianEarningMoe}}</p>",
        "value": "<p>{{womenMedianEarning}}</p>",
        "subtitle": "",
        "tooltip": ""
      }
    ],
    "selectors": [],
    "visualizations": [
      439
    ]
  },
  {
    "id": 182,
    "slug": "covid-employment",
    "type": "Default",
    "ordering": 35,
    "allowed": "singleStateNotPlace",
    "position": "default",
    "icon": "",
    "title": "<p>Employment by Industry Sector</p>",
    "short": "",
    "subtitles": [
      {
        "id": 61,
        "allowed": "always",
        "text": "<p>Data is only available at the state level. Showing data for {{latestEmploymentState}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 371,
        "allowed": "always",
        "text": "<p>As of {{latestEmploymentMonth}} {{latestEmploymentCurrYear}}, there are abbreviate{{latestEmployment}} people employed in {{latestEmploymentState}}. This represents a abbreviate{{latestEmploymentGrowth}}% increaseWord{{latestEmploymentGrowth}} in employment when compared to {{latestEmploymentMonth}} {{latestEmploymentPrevYear}}.</p>"
      },
      {
        "id": 554,
        "allowed": "always",
        "text": "<p>Right after the beginning of the COVID-19 pandemic, during {{covidMonthEmployment}}, a general dip can be seen across industry sectors, resulting in an overall {{covidEmploymentGrowthWord}} in employment by abbreviate{{covidEmploymentGrowth}}%.</p>"
      },
      {
        "id": 370,
        "allowed": "always",
        "text": "<p>The following chart shows monthly employment numbers for each industry sector in {{latestEmploymentState}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 360,
        "allowed": "always",
        "title": "<p>Year-over-year growthWord{{latestEmploymentGrowth}}</p>",
        "value": "<p>abbreviate{{latestEmploymentGrowth}}%</p>",
        "subtitle": "<p>Employment change between {{latestEmploymentMonth}} {{latestEmploymentPrevYear}} and {{latestEmploymentMonth}} {{latestEmploymentCurrYear}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "monthly-employment"
    ],
    "visualizations": [
      185
    ]
  },
  {
    "id": 191,
    "slug": "establishments",
    "type": "TextViz",
    "ordering": 36,
    "allowed": "visibleEstablishmentSize",
    "position": "default",
    "icon": "",
    "title": "<p>Establishments by Size</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 389,
        "allowed": "always",
        "text": "<p>The visualization shows the distribution of establishments by industry and by size according to the number of employees.</p>"
      },
      {
        "id": 556,
        "allowed": "isState",
        "text": "<p>Depending on the option selected, the visualization shows the number of employees or number of establishments and its share across establishment sizes.</p>"
      },
      {
        "id": 558,
        "allowed": "isMSAorCounty",
        "text": "<p>The visualization shows the number of establishments and its share across establishment sizes.</p>"
      }
    ],
    "stats": [
      {
        "id": 367,
        "allowed": "establishmentValue1",
        "title": "<p>The industries with the most establishments</p>",
        "value": "<p>commas{{establishmentValue1}}</p>",
        "subtitle": "<p>{{establishmentIndustry1}}</p>",
        "tooltip": ""
      },
      {
        "id": 368,
        "allowed": "establishmentValue2",
        "title": "<p>The industries with the most establishments</p>",
        "value": "<p>commas{{establishmentValue2}}</p>",
        "subtitle": "<p>{{establishmentIndustry2}}</p>",
        "tooltip": ""
      },
      {
        "id": 369,
        "allowed": "establishmentValue3",
        "title": "<p>The industries with the most establishments</p>",
        "value": "<p>commas{{establishmentValue3}}</p>",
        "subtitle": "<p>{{establishmentIndustry3}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "establishmentSizeIndustries",
      "establishmentSize",
      "establishmentSizeMetric"
    ],
    "visualizations": [
      294
    ]
  },
  {
    "id": 192,
    "slug": "payroll",
    "type": "TextViz",
    "ordering": 37,
    "allowed": "visiblePayroll",
    "position": "default",
    "icon": "",
    "title": "<p>Payroll by Industry Sector</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 388,
        "allowed": "always",
        "text": "<p>The chart shows the total annual payroll and the average annual payroll by industry.</p>"
      }
    ],
    "stats": [
      {
        "id": 364,
        "allowed": "payrollValue1",
        "title": "<p>The industries with the highest total annual payroll</p>",
        "value": "<p>{{payrollValue1}}</p>",
        "subtitle": "<p>{{payrollIndustry1}}</p>",
        "tooltip": ""
      },
      {
        "id": 365,
        "allowed": "payrollValue2",
        "title": "<p>The industries with the highest total annual payroll</p>",
        "value": "<p>{{payrollValue2}}</p>",
        "subtitle": "<p>{{payrollIndustry2}}</p>",
        "tooltip": ""
      },
      {
        "id": 366,
        "allowed": "payrollValue3",
        "title": "<p>The industries with the highest total annual payroll</p>",
        "value": "<p>{{payrollValue3}}</p>",
        "subtitle": "<p>{{payrollIndustry3}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [],
    "visualizations": [
      293
    ]
  },
  {
    "id": 205,
    "slug": "domestic_trade",
    "type": "SubGrouping",
    "ordering": 38,
    "allowed": "freightName",
    "position": "default",
    "icon": "",
    "title": "<p>Domestic Trade</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 31,
    "slug": "domestic_production_consumption",
    "type": "Default",
    "ordering": 39,
    "allowed": "freightName",
    "position": "default",
    "icon": "",
    "title": "<p>Domestic Production &amp; Consumption</p>",
    "short": "",
    "subtitles": [
      {
        "id": 11,
        "allowed": "always",
        "text": "<p>Domestic production and consumption consists of products and services shipped from {{freightName}} to other states, or from other states to {{freightName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 74,
        "allowed": "always",
        "text": "<p>In {{freightYear}}, the top {{[[trade-flow-domestic_trade]]Dir}} {{freightName}} product (by {{[[trade-flow-domestic_trade]]Val}}) was {{freight[[trade-flow-domestic_trade]]Product1Name}} with {{freight[[trade-flow-domestic_trade]]Product1Value}}, followed by {{freight[[trade-flow-domestic_trade]]Product2Name}} ({{freight[[trade-flow-domestic_trade]]Product2Value}}) and {{freight[[trade-flow-domestic_trade]]Product3Name}} ({{freight[[trade-flow-domestic_trade]]Product3Value}}).</p>"
      },
      {
        "id": 73,
        "allowed": "always",
        "text": "<p>The following chart shows the share of these products in relation to all {{[[trade-flow-domestic_trade]]Dir}} {{electionState}} products.</p>"
      }
    ],
    "stats": [
      {
        "id": 62,
        "allowed": "always",
        "title": "<p>Top {{[[trade-flow-domestic_trade]]}}</p>",
        "value": "<p>{{freight[[trade-flow-domestic_trade]]Product1Name}}</p>",
        "subtitle": "<p>{{freight[[trade-flow-domestic_trade]]Product1Value}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 63,
        "allowed": "always",
        "title": "<p>Top {{[[trade-flow-domestic_trade]]}}</p>",
        "value": "<p>{{freight[[trade-flow-domestic_trade]]Product2Name}}</p>",
        "subtitle": "<p>{{freight[[trade-flow-domestic_trade]]Product2Value}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 64,
        "allowed": "always",
        "title": "<p>Top {{[[trade-flow-domestic_trade]]}}</p>",
        "value": "<p>{{freight[[trade-flow-domestic_trade]]Product3Name}}</p>",
        "subtitle": "<p>{{freight[[trade-flow-domestic_trade]]Product3Value}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "trade-flow-domestic_trade"
    ],
    "visualizations": [
      277
    ]
  },
  {
    "id": 32,
    "slug": "trade_growth",
    "type": "TextViz",
    "ordering": 40,
    "allowed": "freightName",
    "position": "default",
    "icon": "",
    "title": "<p>Domestic Trade Growth</p>",
    "short": "",
    "subtitles": [
      {
        "id": 12,
        "allowed": "always",
        "text": "<p>Showing data for {{freightName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 76,
        "allowed": "always",
        "text": "<p>In {{freight[[trade-flow-trade_growth]]LatestYear}}, total {{[[trade-flow-trade_growth]]Dir}} {{freight[[trade-flow-trade_growth]]1Name}} trade was {{freight[[trade-flow-trade_growth]]1LatestValue}}. This is expected to IncreaseWord{{freight[[trade-flow-trade_growth]]1Growth}} GrowthPct{{freight[[trade-flow-trade_growth]]1Growth}} to {{freight[[trade-flow-trade_growth]]1FutureValue}} by {{freight[[trade-flow-trade_growth]]FutureYear}}.</p>"
      },
      {
        "id": 345,
        "allowed": "freight[[trade-flow-trade_growth]]2Name",
        "text": "<p>Comparatively, total {{[[trade-flow-trade_growth]]Dir}} {{freight[[trade-flow-trade_growth]]2Name}} trade was {{freight[[trade-flow-trade_growth]]2LatestValue}}. This is expected to IncreaseWord{{freight[[trade-flow-trade_growth]]2Growth}} GrowthPct{{freight[[trade-flow-trade_growth]]2Growth}} to {{freight[[trade-flow-trade_growth]]2FutureValue}} by {{freight[[trade-flow-trade_growth]]FutureYear}}.</p>"
      },
      {
        "id": 346,
        "allowed": "freight[[trade-flow-trade_growth]]3Name",
        "text": "<p>Total {{[[trade-flow-trade_growth]]Dir}} {{freight[[trade-flow-trade_growth]]3Name}} trade was {{freight[[trade-flow-trade_growth]]3LatestValue}}. This is expected to IncreaseWord{{freight[[trade-flow-trade_growth]]3Growth}} GrowthPct{{freight[[trade-flow-trade_growth]]3Growth}} to {{freight[[trade-flow-trade_growth]]3FutureValue}} by {{freight[[trade-flow-trade_growth]]FutureYear}}.</p>"
      },
      {
        "id": 75,
        "allowed": "singleState",
        "text": "<p>The following chart shows how the domestic {{[[trade-flow-trade_growth]]Dir}} {{freightName}} trade is projected to change in comparison to its neighboring states.</p>"
      }
    ],
    "stats": [
      {
        "id": 65,
        "allowed": "always",
        "title": "<p>{{freight[[trade-flow-trade_growth]]LatestYear}} Value in {{freight[[trade-flow-trade_growth]]1Name}}</p>",
        "value": "<p>{{freight[[trade-flow-trade_growth]]1LatestValue}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 66,
        "allowed": "always",
        "title": "<p>Projected {{freight[[trade-flow-trade_growth]]FutureYear}} Value in {{freight[[trade-flow-trade_growth]]1Name}}</p>",
        "value": "<p>{{freight[[trade-flow-trade_growth]]1FutureValue}}</p>",
        "subtitle": "<p>GrowthPct{{freight[[trade-flow-trade_growth]]1Growth}} GrowthWord{{freight[[trade-flow-trade_growth]]1Growth}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 353,
        "allowed": "freight[[trade-flow-trade_growth]]2Name",
        "title": "<p>{{freight[[trade-flow-trade_growth]]LatestYear}} Value in {{freight[[trade-flow-trade_growth]]2Name}}</p>",
        "value": "<p>{{freight[[trade-flow-trade_growth]]2LatestValue}}</p>",
        "subtitle": "",
        "tooltip": ""
      },
      {
        "id": 354,
        "allowed": "freight[[trade-flow-trade_growth]]2Name",
        "title": "<p>Projected {{freight[[trade-flow-trade_growth]]FutureYear}} Value in {{freight[[trade-flow-trade_growth]]2Name}}</p>",
        "value": "<p>{{freight[[trade-flow-trade_growth]]2FutureValue}}</p>",
        "subtitle": "<p>GrowthPct{{freight[[trade-flow-trade_growth]]2Growth}} GrowthWord{{freight[[trade-flow-trade_growth]]2Growth}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "trade-flow-trade_growth"
    ],
    "visualizations": [
      40
    ]
  },
  {
    "id": 33,
    "slug": "interstate_trade",
    "type": "TextViz",
    "ordering": 41,
    "allowed": "freightName",
    "position": "default",
    "icon": "",
    "title": "<p>Interstate Trade</p>",
    "short": "",
    "subtitles": [
      {
        "id": 13,
        "allowed": "always",
        "text": "<p>Interstate trade consists of products and services shipped from {{freightName}} to other states, or from other states to {{freightName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 77,
        "allowed": "always",
        "text": "<p>In {{freightYear}}, the top {{[[trade-flow-interstate_trade]]Dir}} {{freightName}} domestic partner for goods and services (by {{[[trade-flow-interstate_trade]]Val}}) was {{freight[[trade-flow-interstate_trade]]State1Name}} with {{freight[[trade-flow-interstate_trade]]State1Value}}, followed by {{freight[[trade-flow-interstate_trade]]State2Name}} with {{freight[[trade-flow-interstate_trade]]State2Value}} and {{freight[[trade-flow-interstate_trade]]State3Name}} and {{freight[[trade-flow-interstate_trade]]State3Value}}.</p>"
      },
      {
        "id": 78,
        "allowed": "always",
        "text": "<p>The following map shows the amount of trade that {{freightName}} shares with each state (excluding itself).</p>"
      }
    ],
    "stats": [
      {
        "id": 67,
        "allowed": "always",
        "title": "<p>Most Common Trade Partners</p>",
        "value": "<p>{{freight[[trade-flow-interstate_trade]]State1Name}}</p>",
        "subtitle": "<p>{{freight[[trade-flow-interstate_trade]]State1Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 68,
        "allowed": "always",
        "title": "<p>Most Common Trade Partners</p>",
        "value": "<p>{{freight[[trade-flow-interstate_trade]]State2Name}}</p>",
        "subtitle": "<p>{{freight[[trade-flow-interstate_trade]]State2Value}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 69,
        "allowed": "always",
        "title": "<p>Most Common Trade Partners</p>",
        "value": "<p>{{freight[[trade-flow-interstate_trade]]State3Name}}</p>",
        "subtitle": "<p>{{freight[[trade-flow-interstate_trade]]State3Value}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [
      "trade-flow-interstate_trade"
    ],
    "visualizations": [
      279
    ]
  },
  {
    "id": 7,
    "slug": "civics",
    "type": "Grouping",
    "ordering": 42,
    "allowed": "visibleElection",
    "position": "default",
    "icon": "flag",
    "title": "<p>Civics</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 20,
        "allowed": "hidden",
        "text": "<p>{{presidentName}} won the {{presidentYear}} presidential election with {{presidentElectoral}} electoral votes for the {{presidentParty}} party. {{presidentOppName}} received {{presidentOppElectoral}} electoral votes for the {{presidentOppParty}} party.</p>"
      },
      {
        "id": 22,
        "allowed": "electionVotesYear",
        "text": "<p>In the {{electionVotesYear}} presidential election, the popular vote in {{electionGeo}} went to {{electionVotes1Name}} with Abbreviate{{electionVotes1Share}}% of the vote. The runner-up was {{electionVotes2Name}} (Abbreviate{{electionVotes2Share}}%), followed by {{electionVotes3Name}} (Abbreviate{{electionVotes3Share}}%).</p>"
      },
      {
        "id": 473,
        "allowed": "isNationState",
        "text": "<p>The most partisan Lower{{countyDataDepth}} was {{presidentChildrenCandidate1Geo}} with Abbreviate{{presidentChildrenCandidate1Share}}% of the vote going to {{presidentChildrenCandidate1Name}} running for the {{presidentChildrenCandidate1Party}} Party.</p>"
      },
      {
        "id": 19,
        "allowed": "notNation",
        "text": "<p>{{senatorNames}} are the senators currently representing the state of {{electionState}}. In the United States, senators are elected to 6-year terms with the terms for individual senators staggered.</p>"
      },
      {
        "id": 23,
        "allowed": "notNation",
        "text": "<p>{{houseName}} is currently represented by {{houseMember}} in the U.S. house, and members of the House of Representives are elected to 2-year terms.</p>"
      },
      {
        "id": 365,
        "allowed": "isNation",
        "text": "<p>The United States senate currently has a Democratic majority with 48 Democratic seats and 2 Independents caucusing with the Democrats. The United States house of representatives currently has a Democratic majority with 222 seats, and 212 seats for the Republican party.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 206,
    "slug": "presidential_elections",
    "type": "SubGrouping",
    "ordering": 43,
    "allowed": "visiblePresident",
    "position": "default",
    "icon": "",
    "title": "<p>Presidential Elections</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 9,
    "slug": "popular_vote",
    "type": "TextViz",
    "ordering": 44,
    "allowed": "visiblePresident",
    "position": "default",
    "icon": "",
    "title": "<p>Presidential Popular Vote Over Time</p>",
    "short": "",
    "subtitles": [
      {
        "id": 4,
        "allowed": "electionVotesSub",
        "text": "<p>{{electionVotesSub}}</p>"
      },
      {
        "id": 59,
        "allowed": "hidden",
        "text": "<p>Showing data up to the 2016 election. Updated election results are currently being processed, and will be released in the coming months.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 28,
        "allowed": "always",
        "text": "<p>In the {{electionVotesYear}} presidential election, the popular vote in {{electionGeo}} went to {{electionVotes1Name}} with Abbreviate{{electionVotes1Share}}% of the vote. The runner-up was {{electionVotes2Name}} (Abbreviate{{electionVotes2Share}}%), followed by {{electionVotes3Name}} (Abbreviate{{electionVotes3Share}}%).</p>"
      },
      {
        "id": 27,
        "allowed": "always",
        "text": "<p>The following chart shows the popular vote results in {{electionGeo}} for each registered party from 1976 to {{electionVotesYear}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 15,
        "allowed": "electionVotes1Name",
        "title": "<p>{{electionVotesYear}} Election Results</p>",
        "value": "<p>{{electionVotes1Image}}{{electionVotes1Name}} (Abbreviate{{electionVotes1Share}}%)</p>",
        "subtitle": "<p>{{electionVotes1Party}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 14,
        "allowed": "electionVotes2Name",
        "title": "<p>{{electionVotesYear}} Election Results</p>",
        "value": "<p>{{electionVotes2Image}}{{electionVotes2Name}} (Abbreviate{{electionVotes2Share}}%)</p>",
        "subtitle": "<p>{{electionVotes2Party}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 13,
        "allowed": "electionVotes3Name",
        "title": "<p>{{electionVotesYear}} Election Results</p>",
        "value": "<p>{{electionVotes3Image}}{{electionVotes3Name}} (Abbreviate{{electionVotes3Share}}%)</p>",
        "subtitle": "<p>{{electionVotes3Party}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      6
    ]
  },
  {
    "id": 10,
    "slug": "president-map",
    "type": "TextViz",
    "ordering": 45,
    "allowed": "isNationState",
    "position": "default",
    "icon": "",
    "title": "<p>Presidential Popular Vote by {{countyDataDepth}}</p>",
    "short": "",
    "subtitles": [
      {
        "id": 5,
        "allowed": "electionPresidentSub",
        "text": "<p>{{electionPresidentSub}}</p>"
      },
      {
        "id": 60,
        "allowed": "hidden",
        "text": "<p>Showing data up to the 2016 election. Updated election results are currently being processed, and will be released in the coming months.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 29,
        "allowed": "always",
        "text": "<p>In the {{electionVotesYear}} presidential election, the most partisan Lower{{countyDataDepth}} in {{electionState}} was {{presidentChildrenCandidate1Geo}} with Abbreviate{{presidentChildrenCandidate1Share}}% of the vote going to {{presidentChildrenCandidate1Name}} running for the {{presidentChildrenCandidate1Party}} Party.</p>"
      },
      {
        "id": 30,
        "allowed": "notNation",
        "text": "<p>The following map shows the Plural{{countyDataDepthLower}} in {{electionState}} colored by their party leaning.</p>"
      }
    ],
    "stats": [
      {
        "id": 327,
        "allowed": "always",
        "title": "<p>Popular Vote for {{electionVotes1GeoName}}</p>",
        "value": "<p>{{electionVotes1Name}}</p>",
        "subtitle": "<p>Abbreviate{{electionVotes1Share}}% for the {{electionVotes1Party}}</p>",
        "tooltip": ""
      },
      {
        "id": 17,
        "allowed": "presidentChildrenCandidate1Name",
        "title": "<p>Most Partisan Plural{{countyDataDepth}} in {{electionState}}</p>",
        "value": "<p>{{presidentChildrenCandidate1Geo}}</p>",
        "subtitle": "<p>Abbreviate{{presidentChildrenCandidate1Share}}% for {{presidentChildrenCandidate1Name}} ({{presidentChildrenCandidate1Party}} Party)</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 16,
        "allowed": "presidentChildrenCandidate2Name",
        "title": "<p>Most Partisan Plural{{countyDataDepth}} in {{electionState}}</p>",
        "value": "<p>{{presidentChildrenCandidate2Geo}}</p>",
        "subtitle": "<p>Abbreviate{{presidentChildrenCandidate2Share}}% for {{presidentChildrenCandidate2Name}} ({{presidentChildrenCandidate2Party}} Party)</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 18,
        "allowed": "presidentChildrenCandidate3Name",
        "title": "<p>Most Partisan Plural{{countyDataDepth}} in {{electionState}}</p>",
        "value": "<p>{{presidentChildrenCandidate3Geo}}</p>",
        "subtitle": "<p>Abbreviate{{presidentChildrenCandidate3Share}}% for {{presidentChildrenCandidate3Name}} ({{presidentChildrenCandidate3Party}} Party)</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      7
    ]
  },
  {
    "id": 8,
    "slug": "president-electoral",
    "type": "TextViz",
    "ordering": 46,
    "allowed": "isNation",
    "position": "default",
    "icon": "",
    "title": "<p>2020 Electoral College by State</p>",
    "short": "",
    "subtitles": [
      {
        "id": 58,
        "allowed": "hidden",
        "text": "<p>Showing data up to the 2016 election. Updated election results are currently being processed, and will be released in the coming months.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 26,
        "allowed": "always",
        "text": "<p>{{presidentName}} won the {{presidentYear}} presidential election with {{presidentElectoral}} electoral votes for the {{presidentParty}}. {{presidentOppName}} received {{presidentOppElectoral}} electoral votes for the {{presidentOppParty}}.</p>"
      },
      {
        "id": 25,
        "allowed": "always",
        "text": "<p>The following map shows the outcome in each state based on electoral results from {{presidentYear}} back to the 1992 presidential election.</p>"
      }
    ],
    "stats": [
      {
        "id": 11,
        "allowed": "always",
        "title": "<p>{{presidentParty}} Nominee</p>",
        "value": "<p>{{presidentImage}}{{presidentName}}</p>",
        "subtitle": "<p>{{presidentElectoral}} Electoral Votes</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 12,
        "allowed": "always",
        "title": "<p>{{presidentOppParty}} Nominee</p>",
        "value": "<p>{{presidentOppImage}}{{presidentOppName}}</p>",
        "subtitle": "<p>{{presidentOppElectoral}} Electoral Votes</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      5
    ]
  },
  {
    "id": 207,
    "slug": "senators_elections",
    "type": "SubGrouping",
    "ordering": 47,
    "allowed": "visibleSenatorSection",
    "position": "default",
    "icon": "",
    "title": "<p>Senator Elections</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 11,
    "slug": "us_senator",
    "type": "TextViz",
    "ordering": 48,
    "allowed": "visibleSenator",
    "position": "default",
    "icon": "",
    "title": "<p>US Senators from {{electionState}}</p>",
    "short": "",
    "subtitles": [
      {
        "id": 6,
        "allowed": "electionSenateSub",
        "text": "<p>{{electionSenateSub}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 31,
        "allowed": "always",
        "text": "<p>{{senatorNames}} are the senators currently representing {{electionState}}.</p>"
      },
      {
        "id": 33,
        "allowed": "always",
        "text": "<p>In the United States, senators are elected to 6-year terms with the terms for individual senators staggered.</p>"
      },
      {
        "id": 32,
        "allowed": "always",
        "text": "<p>The following chart shows elected senators in {{electionState}} over time, excluding special elections, colored by their political party.</p>"
      }
    ],
    "stats": [
      {
        "id": 21,
        "allowed": "always",
        "title": "<p>Senator from {{senator1State}}{{senator1Class}}</p>",
        "value": "<p>{{senator1Image}}{{senator1Name}}</p>",
        "subtitle": "<p>{{senator1Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 22,
        "allowed": "always",
        "title": "<p>Senator from {{senator2State}}{{senator2Class}}</p>",
        "value": "<p>{{senator2Image}}{{senator2Name}}</p>",
        "subtitle": "<p>{{senator2Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 23,
        "allowed": "senator3Name",
        "title": "<p>Senator from {{senator3State}}{{senator3Class}}</p>",
        "value": "<p>{{senator3Image}}{{senator3Name}}</p>",
        "subtitle": "<p>{{senator3Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 24,
        "allowed": "senator4Name",
        "title": "<p>Senator from {{senator4State}}{{senator4Class}}</p>",
        "value": "<p>{{senator4Image}}{{senator4Name}}</p>",
        "subtitle": "<p>{{senator4Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 19,
        "allowed": "senator5Name",
        "title": "<p>Senator from {{senator5State}}{{senator5Class}}</p>",
        "value": "<p>{{senator5Image}}{{senator5Name}}</p>",
        "subtitle": "<p>{{senator5Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 20,
        "allowed": "senator6Name",
        "title": "<p>Senator from {{senator6State}}{{senator6Class}}</p>",
        "value": "<p>{{senator6Image}}{{senator6Name}}</p>",
        "subtitle": "<p>{{senator6Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      8
    ]
  },
  {
    "id": 12,
    "slug": "senate-party",
    "type": "TextViz",
    "ordering": 49,
    "allowed": "isNation",
    "position": "default",
    "icon": "",
    "title": "<p>Senate Elections by Party</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 35,
        "allowed": "never",
        "text": "<p>The United States senate currently has a {{senateParty1Name}} majority with {{senateParty1Count}} seats. The senate minority is made up of {{senateParty2Count}} {{senateParty2Name}} seats and {{senateParty3Count}} {{senateParty3Name}} seats.</p>"
      },
      {
        "id": 363,
        "allowed": "always",
        "text": "<p>The United States senate currently has a Democratic majority with 48 Democratic seats and 2 Independents caucusing with the Democrats.</p>"
      },
      {
        "id": 34,
        "allowed": "always",
        "text": "<p>The following chart shows senate election results by party from 1976 to 2020 (excluding special elections).</p>"
      }
    ],
    "stats": [
      {
        "id": 25,
        "allowed": "never",
        "title": "<p>Senate Majority</p>",
        "value": "<p>{{senateParty1Name}}</p>",
        "subtitle": "<p>{{senateParty1Count}} Seats</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 357,
        "allowed": "always",
        "title": "<p>Senate Majority</p>",
        "value": "<p>Democratic</p>",
        "subtitle": "<p>48 Seats (+2)</p>",
        "tooltip": ""
      }
    ],
    "selectors": [],
    "visualizations": [
      9
    ]
  },
  {
    "id": 208,
    "slug": "us_representatives",
    "type": "SubGrouping",
    "ordering": 50,
    "allowed": "visibleHouseSection",
    "position": "default",
    "icon": "",
    "title": "<p>US Representative Elections</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 14,
    "slug": "house-representatives",
    "type": "TextViz",
    "ordering": 51,
    "allowed": "isNation",
    "position": "default",
    "icon": "",
    "title": "<p>House of Representatives by Party</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 40,
        "allowed": "houseParty1Count",
        "text": "<p>The United States house of representatives currently has a {{houseParty1Name}} majority with {{houseParty1Count}} seats. {{houseMinorities}}</p>"
      },
      {
        "id": 364,
        "allowed": "hidden",
        "text": "<p>The United States house of representatives currently has a Democratic majority with 222 seats, and 212 seats for the Republican party.</p>"
      },
      {
        "id": 39,
        "allowed": "always",
        "text": "<p>The following chart shows house election results by party from 2008 to 2020 (excluding special elections).</p>"
      }
    ],
    "stats": [
      {
        "id": 36,
        "allowed": "always",
        "title": "<p>House Majority</p>",
        "value": "<p>{{houseParty1Name}}</p>",
        "subtitle": "<p>{{houseParty1Count}} Seats</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      11
    ]
  },
  {
    "id": 13,
    "slug": "house",
    "type": "TextViz",
    "ordering": 52,
    "allowed": "visibleHouse",
    "position": "default",
    "icon": "",
    "title": "<p>US Representatives from {{houseName}}</p>",
    "short": "",
    "subtitles": [
      {
        "id": 51,
        "allowed": "never",
        "text": "<p>{{houseSubtitle}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 36,
        "allowed": "houseFilled",
        "text": "<p>{{name}} is currently represented by {{house1Name}} ({{house1Party}} Party).</p>"
      },
      {
        "id": 358,
        "allowed": "houseVacant",
        "text": "<p>The seat for {{name}} currently sits vacant.</p>"
      },
      {
        "id": 37,
        "allowed": "houseMulti",
        "text": "<p>{{houseState}} is currently represented by {{houseTotal}} {{houseMemberWord}} in the U.S. house.</p>"
      },
      {
        "id": 38,
        "allowed": "always",
        "text": "<p>Members of the House of Representives are elected to 2-year terms, and the following chart shows the how the {{houseMemberWord}} for {{houseName}} have changed over time starting in 2008.</p>"
      }
    ],
    "stats": [
      {
        "id": 26,
        "allowed": "house1Name",
        "title": "<p>{{house1District}} Representative</p>",
        "value": "<p>{{house1Image}}{{house1Name}}</p>",
        "subtitle": "<p>{{house1Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 27,
        "allowed": "house2Name",
        "title": "<p>{{house2District}} Representative</p>",
        "value": "<p>{{house2Image}}{{house2Name}}</p>",
        "subtitle": "<p>{{house2Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 28,
        "allowed": "house3Name",
        "title": "<p>{{house3District}} Representative</p>",
        "value": "<p>{{house3Image}}{{house3Name}}</p>",
        "subtitle": "<p>{{house3Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 29,
        "allowed": "house4Name",
        "title": "<p>{{house4District}} Representative</p>",
        "value": "<p>{{house4Image}}{{house4Name}}</p>",
        "subtitle": "<p>{{house4Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 30,
        "allowed": "house5Name",
        "title": "<p>{{house5District}} Representative</p>",
        "value": "<p>{{house5Image}}{{house5Name}}</p>",
        "subtitle": "<p>{{house5Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      184,
      10
    ]
  },
  {
    "id": 50,
    "slug": "education",
    "type": "Grouping",
    "ordering": 53,
    "allowed": "visibleEducationSection",
    "position": "default",
    "icon": "learning",
    "title": "<p>Education</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 116,
        "allowed": "lastYearEnrollmentGender",
        "text": "<p>The student population of {{name}} in {{lastYearEnrollmentGender}} is skewed towards {{ipedsEnrollmentSex}}, with Commas{{ipedsEnrollmentMale}} male students and Commas{{ipedsEnrollmentFemale}} female students.</p>"
      },
      {
        "id": 117,
        "allowed": "gradsRaceYear",
        "text": "<p>{{Students graduating}} from Universities in {{name}} are {{ipedsRaceList}}.</p>"
      },
      {
        "id": 118,
        "allowed": "universityGradsList",
        "text": "<p>The largest universities in {{name}} by number of degrees awarded are List{{universityGradsList}}.</p>"
      },
      {
        "id": 119,
        "allowed": "cipGradsList",
        "text": "<p>The most popular majors in {{ipedsName}} are List{{cipGradsList}}.</p>"
      },
      {
        "id": 120,
        "allowed": "tuitionBoth",
        "text": "<p>The median tuition costs are Salary{{tuitionPrivate}} for private four year colleges, and Salary{{tuitionPublicState}} and Salary{{tuitionPublicOOS}} respectively, for public four year colleges for in-state students and out-of-state students.</p>"
      },
      {
        "id": 378,
        "allowed": "tuitionPvtOnly",
        "text": "<p>The median tuition cost for private four year colleges is Salary{{tuitionPrivate}}.</p>"
      },
      {
        "id": 379,
        "allowed": "tuitionPubOnly",
        "text": "<p>The median tuition cost for a public four year colleges is Salary{{tuitionPublicState}} for in-state students and Salary{{tuitionPublicOOS}} for out-of-state students.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 209,
    "slug": "admission_and_enrollment",
    "type": "SubGrouping",
    "ordering": 54,
    "allowed": "visibleAdmEnr",
    "position": "default",
    "icon": "",
    "title": "<p>Admissions &amp; Enrollments</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 193,
    "slug": "admissions_applicants_enrolled",
    "type": "TextViz",
    "ordering": 55,
    "allowed": "visibleApplicantEnrollment",
    "position": "default",
    "icon": "",
    "title": "<p>Applicants, Admissions &amp; Enrolled</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 403,
        "allowed": "always",
        "text": "<p>In {{lastYearAdmission}} in {{nameLower}}, the percentage of applicants admitted was abbreviate{{applicantAdmitted}}%, while the percentage of admitted who enrolled was abbreviate{{admittedEnrolled}}%. {{textEnrollment}}</p>"
      },
      {
        "id": 404,
        "allowed": "isNationState",
        "text": "<p>The map shows the percentage of applicants admitted, admitted who enrolled or the number of students enrolled according to the option selected in the upper button.</p>"
      },
      {
        "id": 405,
        "allowed": "isNationState",
        "text": "<p>The line chart below shows the annual evolution of the indicator by gender.</p>"
      },
      {
        "id": 406,
        "allowed": "notNationStateDistrict",
        "text": "<p>The line chart &nbsp;shows the evolution of the percentage of applicants admitted, admitted who enrolled or the number of students enrolled according to the option selected in the upper button.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "carnegieParents1",
      "enrolledOptions"
    ],
    "visualizations": [
      328,
      329
    ]
  },
  {
    "id": 194,
    "slug": "enrollments_diversity",
    "type": "TextViz",
    "ordering": 56,
    "allowed": "visibleEnrollment",
    "position": "default",
    "icon": "",
    "title": "<p>Enrollments by Gender and Races</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 407,
        "allowed": "always",
        "text": "<p>In {{lastYearEnrollment}} there were commas{{enrollmentsTotal}} students enrolled in {{nameLower}}, abbreviate{{menEnrollmentsPct}}% men and abbreviate{{womenEnrollmentsPct}}% women.</p>"
      },
      {
        "id": 408,
        "allowed": "always",
        "text": "<p>By race, the largest number of students enrolled was concentrated in {{topRaceEnrollment}} with commas{{topRaceEnrollmentValue}} records, of which abbreviate{{topRaceEnrollmentWomenPct}}% were women and abbreviate{{topRaceEnrollmentMenPct}}% men.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "carnegieParents2",
      "enrollmentsDiversity"
    ],
    "visualizations": [
      202,
      333
    ]
  },
  {
    "id": 210,
    "slug": "completions",
    "type": "SubGrouping",
    "ordering": 57,
    "allowed": "visibleCompletions",
    "position": "default",
    "icon": "",
    "title": "<p>Completions</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 51,
    "slug": "majors",
    "type": "TextViz",
    "ordering": 58,
    "allowed": "visibleDegrees",
    "position": "default",
    "icon": "",
    "title": "<p>Concentrations</p>",
    "short": "",
    "subtitles": [
      {
        "id": 53,
        "allowed": "ipedsSubtitle",
        "text": "<p>{{ipedsSubtitle}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 122,
        "allowed": "always",
        "text": "<p>In {{degreesYear}}, the most common concentation for {{[[degree-majors]]}} recipients in {{ipedsName}} was {{[[degree-majors]]CIP1Name}} with Commas{{[[degree-majors]]CIP1Value}} degrees awarded.</p>"
      },
      {
        "id": 121,
        "allowed": "always",
        "text": "<p>This visualization illustrates the percentage of students graduating with a {{[[degree-majors]]}} from schools in {{ipedsName}} according to their major.</p>"
      }
    ],
    "stats": [
      {
        "id": 113,
        "allowed": "[[degree-majors]]CIP1Value",
        "title": "<p>Most Common</p>",
        "value": "<p>{{[[degree-majors]]CIP1Name}}</p>",
        "subtitle": "<p>Commas{{[[degree-majors]]CIP1Value}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 111,
        "allowed": "[[degree-majors]]CIP2Value",
        "title": "<p>Most Common</p>",
        "value": "<p>{{[[degree-majors]]CIP2Name}}</p>",
        "subtitle": "<p>Commas{{[[degree-majors]]CIP2Value}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 112,
        "allowed": "[[degree-majors]]CIP3Value",
        "title": "<p>Most Common</p>",
        "value": "<p>{{[[degree-majors]]CIP3Name}}</p>",
        "subtitle": "<p>Commas{{[[degree-majors]]CIP3Value}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "degree-majors"
    ],
    "visualizations": [
      334
    ]
  },
  {
    "id": 52,
    "slug": "universities",
    "type": "TextViz",
    "ordering": 59,
    "allowed": "visibleUniversities",
    "position": "default",
    "icon": "",
    "title": "<p>Universities</p>",
    "short": "",
    "subtitles": [
      {
        "id": 54,
        "allowed": "ipedsSubtitle",
        "text": "<p>{{ipedsSubtitle}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 123,
        "allowed": "always",
        "text": "<p>In {{universityGradsYear}}, the institution with the largest number of graduating students was {{universityGrads1Name}} with Commas{{universityGrads1Value}} degrees awarded.</p>"
      }
    ],
    "stats": [
      {
        "id": 117,
        "allowed": "universityGrads1Name",
        "title": "<p>Largest Universities by degrees awarded</p>",
        "value": "<p>{{universityGrads1Name}}</p>",
        "subtitle": "<p>Commas{{universityGrads1Value}} degrees awarded</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 118,
        "allowed": "universityGrads2Name",
        "title": "<p>Largest Universities by degrees awarded</p>",
        "value": "<p>{{universityGrads2Name}}</p>",
        "subtitle": "<p>Commas{{universityGrads2Value}} degrees awarded</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 116,
        "allowed": "universityGrads3Name",
        "title": "<p>Largest Universities by degrees awarded</p>",
        "value": "<p>{{universityGrads3Name}}</p>",
        "subtitle": "<p>Commas{{universityGrads3Value}} degrees awarded</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [
      "genderUniversities",
      "racesUniversities"
    ],
    "visualizations": [
      335
    ]
  },
  {
    "id": 54,
    "slug": "student-diversity",
    "type": "TextViz",
    "ordering": 60,
    "allowed": "visibleGradsRace",
    "position": "default",
    "icon": "",
    "title": "<p>Student Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 409,
        "allowed": "always",
        "text": "<p>In {{lastYearCompletions}}, commas{{menCompletions}} men were awarded degrees from institutions in {{nameLower}}, which is abbreviate{{rateCompletions}} times {{rateCompletionsWord}} than the commas{{womenCompletions}} female students who received degrees in the same year.</p>"
      },
      {
        "id": 126,
        "allowed": "always",
        "text": "<p>In {{gradsRaceYear}}, the most common race/ethnicity group awarded degrees at institutions was {{gradsRace1Name}} students. These Commas{{gradsRace1Value}} degrees mean that there were Abbreviate{{gradsRace1Ratio}} times more degrees awarded to {{gradsRace1Name}} students then the next closest race/ethnicity group, {{gradsRace2Name}}, with Commas{{gradsRace2Value}} degrees awarded.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "completionsUniversities",
      "genderRaceOptions",
      "statusEducation"
    ],
    "visualizations": [
      336
    ]
  },
  {
    "id": 220,
    "slug": "degrees-over-time",
    "type": "TextViz",
    "ordering": 61,
    "allowed": "visibleAwarded",
    "position": "default",
    "icon": "",
    "title": "<p>Awarded Degrees over Time</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 410,
        "allowed": "always",
        "text": "<p>The graph shows the evolution of awarded degrees by Lower{{[[degreesOrSector]]}}. Under the paragraphs, the average number of awarded degrees by university in each degree is shown.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "degreesOrSector"
    ],
    "visualizations": [
      337,
      338
    ]
  },
  {
    "id": 211,
    "slug": "tuition",
    "type": "SubGrouping",
    "ordering": 62,
    "allowed": "visibleTuition",
    "position": "default",
    "icon": "",
    "title": "<p>Tuition</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 196,
    "slug": "district_tuition",
    "type": "TextViz",
    "ordering": 63,
    "allowed": "visibleTuition",
    "position": "default",
    "icon": "",
    "title": "<p>Average Net Price by Sector</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 411,
        "allowed": "topStateTuition",
        "text": "<p>{{topStateTuition}} is the sector with the highest median state tuition in {{lastYearTuition}}.</p>"
      },
      {
        "id": 413,
        "allowed": "topStateFee",
        "text": "<p>{{topStateFee}} is the sector with the highest median state fee in {{lastYearTuition}}.</p>"
      },
      {
        "id": 474,
        "allowed": "topStateBooks",
        "text": "<p>{{topStateBooks}} is the sector with the highest average net price of books and supplies.</p>"
      },
      {
        "id": 412,
        "allowed": "always",
        "text": "<p>The graph shows the average net price by sector and year.</p>"
      }
    ],
    "stats": [
      {
        "id": 382,
        "allowed": "hidden",
        "title": "<p>Median In-State Public</p>",
        "value": "<p>Salary{{tuitionPublicState}}</p>",
        "subtitle": "",
        "tooltip": ""
      },
      {
        "id": 383,
        "allowed": "hidden",
        "title": "<p>Median Private</p>",
        "value": "<p>Salary{{tuitionPrivate}}</p>",
        "subtitle": "",
        "tooltip": ""
      }
    ],
    "selectors": [
      "carnegieUniversities"
    ],
    "visualizations": [
      339
    ]
  },
  {
    "id": 227,
    "slug": "population-education",
    "type": "SubGrouping",
    "ordering": 64,
    "allowed": "visibleWorkingPopulation",
    "position": "default",
    "icon": "",
    "title": "<p>Working Population</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 228,
    "slug": "educational-pyramid",
    "type": "TextViz",
    "ordering": 65,
    "allowed": "lastYearNoSchooling",
    "position": "default",
    "icon": "",
    "title": "<p>Educational Pyramid</p>",
    "short": "",
    "subtitles": [
      {
        "id": 68,
        "allowed": "notNationStatePumaMSA",
        "text": "<p>Data is only available at the state level. Showing data for {{stateParentName}}.</p>"
      },
      {
        "id": 70,
        "allowed": "isMSA",
        "text": "<p>Data is only available at the state level. Showing data for {{electionState}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 470,
        "allowed": "isNationStatePuma",
        "text": "<p>In {{lastYearNoSchooling}}, abbreviate{{noSchoolingMenPct}}% of men over 25 years of age had not completed any academic degree (no schooling), while abbreviate{{noSchoolingWomenPct}}% of women were in the same situation.</p>"
      },
      {
        "id": 471,
        "allowed": "notNationStatePuma",
        "text": "<p>In {{lastYearNoSchooling_}}, abbreviate{{noSchoolingMenPct_}}% of men over 25 years of age had not completed any academic degree (no schooling), while abbreviate{{noSchoolingWomenPct_}}% of women were in the same situation.</p>"
      },
      {
        "id": 469,
        "allowed": "always",
        "text": "<p>This visualization shows the gender distribution of the population according to the academic level reached.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "popEducation",
      "educationAges"
    ],
    "visualizations": [
      392
    ]
  },
  {
    "id": 229,
    "slug": "degrees",
    "type": "TextViz",
    "ordering": 66,
    "allowed": "lastYearPumsEducation",
    "position": "default",
    "icon": "",
    "title": "<p>Educational Attainment</p>",
    "short": "",
    "subtitles": [
      {
        "id": 69,
        "allowed": "notNationStatePumaMSA",
        "text": "<p>Data is only available at the state level. Showing data for {{stateParentName}}.</p>"
      },
      {
        "id": 71,
        "allowed": "isMSA",
        "text": "<p>Data is only available at the state level. Showing data for {{electionState}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 467,
        "allowed": "isNationStatePuma",
        "text": "<p>The most common educational levels obtained by the working population of {{nameLower}} in {{lastYearPumsEducation}} were list{{top3DegreesPopulation}}.</p>"
      },
      {
        "id": 472,
        "allowed": "notNationStatePuma",
        "text": "<p>The most common educational levels obtained by the working population in {{lastYearDegrees_}} were list{{top3DegreesPopulation_}}.</p>"
      },
      {
        "id": 468,
        "allowed": "always",
        "text": "<p>This visualization illustrates the percentage distribution of the population according to the highest educational level reached. You can filter the data by race by using the selector above.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "raceEducation"
    ],
    "visualizations": [
      390
    ]
  },
  {
    "id": 55,
    "slug": "housing",
    "type": "Grouping",
    "ordering": 67,
    "allowed": "always",
    "position": "default",
    "icon": "home",
    "title": "<p>Housing &amp; Living</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 127,
        "allowed": "visibleTextHousing",
        "text": "<p>The median property value in {{nameLower}} was Salary{{propertyCurr}} in {{propertyCurrYear}}, which is Abbreviate{{propertyRatio}} times LargerThan{{propertyDiff}} the national average of Salary{{propertyNation}}. Between {{propertyPrevYear}} and {{propertyCurrYear}} the median property value increased from Salary{{propertyPrev}} to Salary{{propertyCurr}}, a GrowthPct{{propertyGrowth}} IncreaseWord{{propertyGrowth}}. The homeownership rate in {{nameLower}} is Abbreviate{{pct_rentOwn}}%, which is HighWord{{homeownerComp}} the national average of Abbreviate{{homeownerNation}}%.</p>"
      },
      {
        "id": 359,
        "allowed": "commuteTime",
        "text": "<p>People in {{nameLower}} have an average commute time of Abbreviate{{commuteTime}} minutes, and they transportation{{commuteMeans1}}. Car ownership in {{nameLower}} is HighWord{{vehiclesDiff}} the national average, with an average of {{vehicles}} per household.</p>"
      },
      {
        "id": 460,
        "allowed": "incomeRace0Child3Visible",
        "text": "<p>Median household income in {{nameLower}} is Salary{{incomeCurr}}. In {{incomeGeoYear}}, the {{child}} with the highest Median Household Income in {{nameLower}} was {{incomeRace0Child1Name}} with a value of Salary{{incomeRace0Child1Value}}, followed by {{incomeRace0Child2Name}} and {{incomeRace0Child3Name}}, with respective values of Salary{{incomeRace0Child2Value}} and Salary{{incomeRace0Child3Value}}.</p>"
      },
      {
        "id": 465,
        "allowed": "visibleTextSevereHousingProblems",
        "text": "<p>In {{lastYearSevereHousingStates}}, growthPct{{severeHousingRate}} of the population was living with severe housing problems in {{name}}. From {{prevYearSevereHousingStates}} to {{lastYearSevereHousingStates}}, the indicator {{severeHousingProblemWord}} growthPct{{severeHousingProblemDiff}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 212,
    "slug": "housing",
    "type": "SubGrouping",
    "ordering": 68,
    "allowed": "visibleHousing",
    "position": "default",
    "icon": "",
    "title": "<p>Housing</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 56,
    "slug": "property",
    "type": "TextViz",
    "ordering": 69,
    "allowed": "propertyCurr",
    "position": "default",
    "icon": "",
    "title": "<p>Property</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 129,
        "allowed": "notNation",
        "text": "<p>The following chart display {{textTaxValue2_[[propertyTaxesValue]]}} distributed between a series of {{textTaxValue1_[[propertyTaxesValue]]}} buckets compared to the national averages for each bucket. In {{nameLower}} the largest share of households {{textNotNation_[[propertyTaxesValue]]}} in the Bucket{{propertyBucket_[[propertyTaxesValue]]}} range.</p>"
      },
      {
        "id": 414,
        "allowed": "notNation",
        "text": "<p>The chart underneath the paragraph shows the Lower{{[[propertyTaxesValue]]}} in {{name}} compared to it's parent and neighbor geographies.</p>"
      },
      {
        "id": 130,
        "allowed": "isNation",
        "text": "<p>The following chart displays {{textTaxValue2_[[propertyTaxesValue]]}} distributed between a series of {{textTaxValue1_[[propertyTaxesValue]]}} buckets. In {{nameLower}} the largest share of households {{textNotNation_[[propertyTaxesValue]]}} in the Bucket{{propertyBucket_[[propertyTaxesValue]]}} range.</p>"
      }
    ],
    "stats": [
      {
        "id": 384,
        "allowed": "visiblePropertyStat",
        "title": "<p>Median Property Value {{propertyCurrYear}}</p>",
        "value": "<p>salary{{propertyCurr}}</p>",
        "subtitle": "<p>±salary{{propertyCurrMoe}}</p>",
        "tooltip": ""
      },
      {
        "id": 385,
        "allowed": "always",
        "title": "<p>Median Property Taxes</p>",
        "value": "<p>salary{{propertyTaxesValue}}</p>",
        "subtitle": "<p>±salary{{propertyTaxesMoe}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "propertyTaxesValue"
    ],
    "visualizations": [
      63,
      413
    ]
  },
  {
    "id": 59,
    "slug": "rent_own",
    "type": "TextViz",
    "ordering": 70,
    "allowed": "curr_homeownersMortgage",
    "position": "default",
    "icon": "",
    "title": "<p>Rent vs Own</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 136,
        "allowed": "acsMultiYear",
        "text": "<p>In {{currYear_[[rentMortgage]]}}, Abbreviate{{curr_[[rentMortgage]]}}% of the housing units in {{nameLower}} were occupied by their {{textRentMortgage_[[rentMortgage]]}}. This percentage GrewWord{{diff_[[rentMortgage]]}} from the previous year's rate of Abbreviate{{prev_[[rentMortgage]]}}%.</p>"
      },
      {
        "id": 356,
        "allowed": "acsSingleYear",
        "text": "<p>In {{currYear_[[rentMortgage]]}}, Abbreviate{{curr_[[rentMortgage]]}}% of the housing units in {{nameLower}} were occupied by their {{textRentMortgage_[[rentMortgage]]}}.</p>"
      },
      {
        "id": 137,
        "allowed": "notNation",
        "text": "<p>This chart shows the percentage of {{textRentMortgage_[[rentMortgage]]}} in {{nameLower}} compared it's parent and neighboring geographies.</p>"
      }
    ],
    "stats": [
      {
        "id": 129,
        "allowed": "always",
        "title": "<p>Homeownership</p>",
        "value": "<p>Abbreviate{{pct_rentOwn}}%</p>",
        "subtitle": "<p>{{currYear_rentOwn}}</p>",
        "tooltip": ""
      },
      {
        "id": 130,
        "allowed": "always",
        "title": "<p>Homeowners with Mortgage</p>",
        "value": "<p>Abbreviate{{pct_homeownersMortgage}}%</p>",
        "subtitle": "<p>{{currYear_homeownersMortgage}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "rentMortgage"
    ],
    "visualizations": [
      435,
      436
    ]
  },
  {
    "id": 213,
    "slug": "equity",
    "type": "SubGrouping",
    "ordering": 71,
    "allowed": "visibleEquitySection",
    "position": "default",
    "icon": "",
    "title": "<p>Equity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 20,
    "slug": "income-by-location",
    "type": "Default",
    "ordering": 72,
    "allowed": "visibleIncomeByLocation",
    "position": "default",
    "icon": "",
    "title": "<p>Income by Location</p>",
    "short": "",
    "subtitles": [
      {
        "id": 10,
        "allowed": "always",
        "text": "<p>Use the dropdown to filter by race/ethnicity.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 57,
        "allowed": "[[race-income-income_geo]]Child3Visible",
        "text": "<p>In {{incomeGeoYear}}, the {{child}} with the highest Median Household Income ({{[[race-income-income_geo]]}}) in {{nameLower}} was {{[[race-income-income_geo]]Child1Name}} with a value of Salary{{[[race-income-income_geo]]Child1Value}}, followed by {{[[race-income-income_geo]]Child2Name}} and {{[[race-income-income_geo]]Child3Name}}, with respective values of Salary{{[[race-income-income_geo]]Child2Value}} and Salary{{[[race-income-income_geo]]Child3Value}}.</p>"
      },
      {
        "id": 55,
        "allowed": "always",
        "text": "<p>The following map shows all of the Plural{{child}} in {{nameLower}} colored by their Median Household Income ({{[[race-income-income_geo]]}}).</p>"
      }
    ],
    "stats": [
      {
        "id": 47,
        "allowed": "[[race-income-income_geo]]Child1Visible",
        "title": "<p>Highest Median Household Income ({{[[race-income-income_geo]]}})</p>",
        "value": "<p>{{[[race-income-income_geo]]Child1Name}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 48,
        "allowed": "[[race-income-income_geo]]Child2Visible",
        "title": "<p>Highest Median Household Income ({{[[race-income-income_geo]]}})</p>",
        "value": "<p>{{[[race-income-income_geo]]Child2Name}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 46,
        "allowed": "[[race-income-income_geo]]Child3Visible",
        "title": "<p>Highest Median Household Income ({{[[race-income-income_geo]]}})</p>",
        "value": "<p>{{[[race-income-income_geo]]Child3Name}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "race-income-income_geo"
    ],
    "visualizations": [
      416
    ]
  },
  {
    "id": 57,
    "slug": "household_income",
    "type": "TextViz",
    "ordering": 73,
    "allowed": "incomeCurr",
    "position": "default",
    "icon": "",
    "title": "<p>Household Income</p>",
    "short": "",
    "subtitles": [
      {
        "id": 21,
        "allowed": "always",
        "text": "<p>Please note that the buckets used in this visualization were not evenly distributed by ACS when publishing the data.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 133,
        "allowed": "visibleTextIncome",
        "text": "<p>In {{incomeCurrYear}}, the median household income of the Abbreviate{{households}} households in {{nameLower}} GrewTo{{incomeGrowth}} Salary{{incomeCurr}} from the previous year's value of Salary{{incomePrev}}.</p>"
      },
      {
        "id": 355,
        "allowed": "acsSingleYear",
        "text": "<p>In {{incomeCurrYear}}, the median household income of the Abbreviate{{households}} households in {{nameLower}} was Salary{{incomeCurr}}.</p>"
      },
      {
        "id": 131,
        "allowed": "notNation",
        "text": "<p>The following chart displays the households in {{nameLower}} distributed between a series of income buckets compared to the national averages for each bucket. The largest share of households have an income in the Bucket{{householdIncomeBucket}} range.</p>"
      },
      {
        "id": 132,
        "allowed": "isNation",
        "text": "<p>The following chart displays the households in {{nameLower}} distributed between a series of income buckets. The largest share of households have an income in the Bucket{{householdIncomeBucket}} range.</p>"
      }
    ],
    "stats": [
      {
        "id": 126,
        "allowed": "incomeCurrMOE",
        "title": "<p>Median Household Income</p>",
        "value": "<p>Salary{{incomeCurr}}</p>",
        "subtitle": "<p>± Salary{{incomeCurrMOE}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 127,
        "allowed": "always",
        "title": "<p>Number of Households</p>",
        "value": "<p>Abbreviate{{households}}</p>",
        "subtitle": "<p>± Commas{{householdsMoe}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      409
    ]
  },
  {
    "id": 19,
    "slug": "income_distro",
    "type": "Default",
    "ordering": 74,
    "allowed": "visibleWageDistribution",
    "position": "default",
    "icon": "",
    "title": "<p>Wage Distribution</p>",
    "short": "",
    "subtitles": [
      {
        "id": 9,
        "allowed": "subtitlePums",
        "text": "<p>The closest comparable wage GINI for {{nameLower}} is from {{pumaName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 54,
        "allowed": "always",
        "text": "<p>In {{giniCurrYear}}, the income inequality in {{gini1Geo}} was Abbreviate{{gini1Curr}} according to the GINI calculation of the wage distribution. Income inequality had a GrowthPct{{gini1Growth}} GrowthWord{{gini1Growth}} from {{giniPrevYear}} to {{giniCurrYear}}, which means that wage distribution grew somewhat MoreLess{{gini1Direction}} even. The GINI for {{gini1Geo}} was HighWord{{gini1Comp}} than the national average of Abbreviate{{giniNation}}. In other words, wages are distributed MoreLess{{gini1CompDir}} evenly in {{gini1Geo}} in comparison to the national average.</p>"
      },
      {
        "id": 53,
        "allowed": "gini2Geo",
        "text": "<p>In the same year, the income inequality in {{gini2Geo}} was Abbreviate{{gini2Curr}} and income inequality had a GrowthPct{{gini2Growth}} GrowthWord{{gini2Growth}} from {{giniPrevYear}} to {{giniCurrYear}}, which means that wage distribution grew somewhat MoreLess{{gini2Direction}} even. The GINI for {{gini2Geo}} was HighWord{{gini2Comp}} than the national average of Abbreviate{{giniNation}}, meaning wages are distributed MoreLess{{gini2CompDir}} evenly in {{gini2Geo}} in comparison to the national average.</p>"
      },
      {
        "id": 337,
        "allowed": "gini3Geo",
        "text": "<p>The income inequality in {{gini3Geo}} was Abbreviate{{gini3Curr}} and income inequality had a GrowthPct{{gini3Growth}} GrowthWord{{gini3Growth}} from {{giniPrevYear}} to {{giniCurrYear}}, which means that wage distribution grew somewhat MoreLess{{gini3Direction}} even. The GINI for {{gini3Geo}} was HighWord{{gini3Comp}} than the national average of Abbreviate{{giniNation}}, meaning wages are distributed MoreLess{{gini3CompDir}} evenly in {{gini3Geo}} in comparison to the national average.</p>"
      },
      {
        "id": 52,
        "allowed": "notNation",
        "text": "<p>This chart shows the number of workers in {{pumaName}} across various wage buckets compared to the national average.</p>"
      },
      {
        "id": 51,
        "allowed": "isNation",
        "text": "<p>This chart shows the number of workers in {{pumaName}} across various wage buckets.</p>"
      }
    ],
    "stats": [
      {
        "id": 44,
        "allowed": "always",
        "title": "<p>{{giniCurrYear}} Wage GINI in {{gini1Geo}}</p>",
        "value": "<p>Abbreviate{{gini1Curr}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 45,
        "allowed": "always",
        "title": "<p>{{giniPrevYear}} Wage GINI in {{gini1Geo}}</p>",
        "value": "<p>Abbreviate{{gini1Prev}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 343,
        "allowed": "gini2Geo",
        "title": "<p>{{giniCurrYear}} Wage GINI in {{gini2Geo}}</p>",
        "value": "<p>Abbreviate{{gini2Curr}}</p>",
        "subtitle": "",
        "tooltip": ""
      },
      {
        "id": 344,
        "allowed": "gini2Geo",
        "title": "<p>{{giniPrevYear}} Wage GINI in {{gini2Geo}}</p>",
        "value": "<p>Abbreviate{{gini2Prev}}</p>",
        "subtitle": "",
        "tooltip": ""
      },
      {
        "id": 345,
        "allowed": "gini3Geo",
        "title": "<p>{{giniCurrYear}} Wage GINI in {{gini3Geo}}</p>",
        "value": "<p>Abbreviate{{gini3Curr}}</p>",
        "subtitle": "",
        "tooltip": ""
      },
      {
        "id": 346,
        "allowed": "gini3Geo",
        "title": "<p>{{giniPrevYear}} Wage GINI in {{gini3Geo}}</p>",
        "value": "<p>Abbreviate{{gini3Prev}}</p>",
        "subtitle": "",
        "tooltip": ""
      }
    ],
    "selectors": [],
    "visualizations": [
      414
    ]
  },
  {
    "id": 214,
    "slug": "transportation",
    "type": "SubGrouping",
    "ordering": 75,
    "allowed": "visibleTransportationSection",
    "position": "default",
    "icon": "",
    "title": "<p>Transportation</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 61,
    "slug": "mode_transport",
    "type": "Default",
    "ordering": 76,
    "allowed": "commuteMeansYear",
    "position": "default",
    "icon": "",
    "title": "<p>Commuter Transportation</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 140,
        "allowed": "commuteMeans1Pct",
        "text": "<p>In {{commuteMeansYear}}, Abbreviate{{commuteMeans1Pct}}% of workers in {{nameLower}} transportation{{commuteMeans1}}, followed by those who transportation{{commuteMeans2}} (Abbreviate{{commuteMeans2Pct}}%) and those who transportation{{commuteMeans3}} (Abbreviate{{commuteMeans3Pct}}%).</p>"
      },
      {
        "id": 141,
        "allowed": "always",
        "text": "<p>The following chart shows the number of households using each mode of transportation over time, using a logarithmic scale on the y-axis to help better show variations in the smaller means of commuting.</p>"
      }
    ],
    "stats": [
      {
        "id": 133,
        "allowed": "commuteMeans1Pct",
        "title": "<p>Most Common Commute in {{commuteMeansYear}}</p>",
        "value": "<p>{{commuteMeans1}} (Abbreviate{{commuteMeans1Pct}}%)</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 132,
        "allowed": "commuteMeans2Pct",
        "title": "<p>Most Common Commute in {{commuteMeansYear}}</p>",
        "value": "<p>{{commuteMeans2}} (Abbreviate{{commuteMeans2Pct}}%)</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 134,
        "allowed": "commuteMeans3Pct",
        "title": "<p>Most Common Commute in {{commuteMeansYear}}</p>",
        "value": "<p>{{commuteMeans3}} (Abbreviate{{commuteMeans3Pct}}%)</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      410
    ]
  },
  {
    "id": 60,
    "slug": "commute_time",
    "type": "TextViz",
    "ordering": 77,
    "allowed": "commuteTime",
    "position": "default",
    "icon": "",
    "title": "<p>Commute Time</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 138,
        "allowed": "notNation",
        "text": "<p>Using averages, employees in {{nameLower}} have a LongWord{{commuteTimeDiff}} commute time (Abbreviate{{commuteTime}} minutes) than the normal US worker (Abbreviate{{commuteTimeNation}} minutes). Additionally, Abbreviate{{superCommuters}}% of the workforce in {{nameLower}} have \"super commutes\" in excess of 90 minutes.</p>"
      },
      {
        "id": 139,
        "allowed": "always",
        "text": "<p>The chart below shows how the median household income in {{name}} compares to that of it's neighboring and parent geographies.</p>"
      }
    ],
    "stats": [
      {
        "id": 131,
        "allowed": "always",
        "title": "<p>Average Travel Time</p>",
        "value": "<p>Abbreviate{{commuteTime}} minutes</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      438,
      437,
      411
    ]
  },
  {
    "id": 62,
    "slug": "car-ownership",
    "type": "TextViz",
    "ordering": 78,
    "allowed": "vehiclesNum",
    "position": "default",
    "icon": "",
    "title": "<p>Car Ownership</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 143,
        "allowed": "notNation",
        "text": "<p>The following chart displays the households in {{nameLower}} distributed between a series of car ownership buckets compared to the national averages for each bucket. The largest share of households in {{nameLower}} have {{vehicles}}.</p>"
      },
      {
        "id": 142,
        "allowed": "isNation",
        "text": "<p>The following chart displays the households in {{nameLower}} distributed between a series of car ownership buckets. The largest share of households in {{nameLower}} have {{vehicles}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 135,
        "allowed": "always",
        "title": "<p>Average Number</p>",
        "value": "<p>{{vehicles}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      412
    ]
  },
  {
    "id": 215,
    "slug": "poverty",
    "type": "SubGrouping",
    "ordering": 79,
    "allowed": "visiblePovertySection",
    "position": "default",
    "icon": "",
    "title": "<p>Poverty</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 197,
    "slug": "severe_housing_problems",
    "type": "TextViz",
    "ordering": 80,
    "allowed": "visibleSevereHousingProblems",
    "position": "default",
    "icon": "",
    "title": "<p>Severe Housing Problems</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 416,
        "allowed": "isStateCounty",
        "text": "<p>In {{lastYearSevereHousingStates}}, growthPct{{severeHousingRate}} of the population was living with severe housing problems in {{name}}. {{textGrowthSevereHousing}}</p>"
      },
      {
        "id": 417,
        "allowed": "isState",
        "text": "<p>The map show the severe housing problems rate in the counties of California. The graph underneath the paragraph shows the trend of the percentage of the population living with severe housing problems.</p>"
      },
      {
        "id": 420,
        "allowed": "isNation",
        "text": "<p>In {{lastYearSevereHousingProblem}}, the states with the highest rate of severe housing problems were list{{top3SevereHousingProblem}}.</p>"
      },
      {
        "id": 419,
        "allowed": "isNation",
        "text": "<p>The following map shows all of the states in the United States colored by the severe housing problems rate.</p>"
      },
      {
        "id": 421,
        "allowed": "isCounty",
        "text": "<p>The graph shows the trend of the percentage of the population living with severe housing problems.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      418,
      419
    ]
  },
  {
    "id": 21,
    "slug": "poverty_and_diversity",
    "type": "Default",
    "ordering": 81,
    "allowed": "povertyRate",
    "position": "default",
    "icon": "",
    "title": "<p>Poverty &amp; Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 60,
        "allowed": "notNation",
        "text": "<p>Abbreviate{{povertyRate}}% of the population for whom poverty status is determined in {{nameLower}} (Abbreviate{{currPoverty}} out of Abbreviate{{currPovertyTotal}} people) live below the poverty line, a number that is HighWord{{povertyComp}} the national average of Abbreviate{{povertyRateUS}}%. The largest demographic living in poverty are Plural{{povertySex1}} Bucket{{povertyAge1}}, followed by Plural{{povertySex2}} Bucket{{povertyAge2}} and then Plural{{povertySex3}} Bucket{{povertyAge3}}.</p>"
      },
      {
        "id": 58,
        "allowed": "isNation",
        "text": "<p>Abbreviate{{povertyRate}}% of the population for whom poverty status is determined in {{nameLower}} (Abbreviate{{currPoverty}} out of Abbreviate{{currPovertyTotal}} people) live below the poverty line. The largest demographic living in poverty are Plural{{povertySex1}} Bucket{{povertyAge1}}, followed by Plural{{povertySex2}} Bucket{{povertyAge2}} and then Plural{{povertySex3}} Bucket{{povertyAge3}}.</p>"
      },
      {
        "id": 415,
        "allowed": "always",
        "text": "<p>The most common racial or ethnic group living below the poverty line in {{nameLower}} is {{racePoverty1Name}}, followed by {{racePoverty2Name}} and {{racePoverty3Name}}.</p>"
      },
      {
        "id": 59,
        "allowed": "always",
        "text": "<p>The Census Bureau uses a set of <a href=\"https://www.census.gov/data/tables/time-series/demo/income-poverty/historical-poverty-thresholds.html\" target=\"_blank\">money income thresholds</a> that vary by family size and composition to determine who classifies as impoverished. If a family's total income is less than the family's threshold than that family and every individual in it is considered to be living in poverty.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "sexAgeRacePoverty"
    ],
    "visualizations": [
      403
    ]
  },
  {
    "id": 198,
    "slug": "children_in_poverty",
    "type": "TextViz",
    "ordering": 82,
    "allowed": "visibleChildrenInPoverty",
    "position": "default",
    "icon": "",
    "title": "<p>Children in Poverty</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 422,
        "allowed": "isStateCounty",
        "text": "<p>In {{lastYearChildrenInPovertyStates}}, growthPct{{childrenInPovertyRate}} of the children was living in poverty in {{name}}. {{povertyChildrenGrowthText}}</p>"
      },
      {
        "id": 423,
        "allowed": "isState",
        "text": "<p>The map show the children in poverty rate in the counties of California. The graph underneath the paragraph shows the trend of the percentage of children in poverty.</p>"
      },
      {
        "id": 424,
        "allowed": "isNation",
        "text": "<p>In {{lastYearChildrenInPoverty}}, the states with the highest rate of children living in poverty were list{{top3ChildrenInPoverty}}.</p>"
      },
      {
        "id": 425,
        "allowed": "isNation",
        "text": "<p>The following map shows all of the states in the United States colored by the percentage of children living in poverty.</p>"
      },
      {
        "id": 426,
        "allowed": "isCounty",
        "text": "<p>The graph shows the trend of the percentage of the children living in poverty.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      420,
      421
    ]
  },
  {
    "id": 37,
    "slug": "social_needs",
    "type": "Default",
    "ordering": 83,
    "allowed": "notDistrict",
    "position": "default",
    "icon": "",
    "title": "<p>Social Needs</p>",
    "short": "",
    "subtitles": [
      {
        "id": 16,
        "allowed": "notNation",
        "text": "<p>{{[[social-social_needs]]Sub}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 92,
        "allowed": "[[social-social_needs]]VisibleMore",
        "text": "<p>In {{[[social-social_needs]]Year}}, {{[[social-social_needs]]1Name}} had the highest Lower{{[[social-social_needs]]}} in {{[[social-social_needs]]Parent}}, at {{[[social-social_needs]]1Value}}, followed by {{[[social-social_needs]]2Name}} ({{[[social-social_needs]]2Value}}).</p>"
      },
      {
        "id": 562,
        "allowed": "[[social-social_needs]]VisibleText1",
        "text": "<p>In {{[[social-social_needs]]Year}}, {{[[social-social_needs]]1Name}} had the highest Lower{{[[social-social_needs]]}} in {{[[social-social_needs]]Parent}}, at {{[[social-social_needs]]1Value}}.</p>"
      },
      {
        "id": 91,
        "allowed": "always",
        "text": "<p>The following map shows the Lower{{[[social-social_needs]]}} by {{[[social-social_needs]]Level}} over multiple years.</p>"
      }
    ],
    "stats": [
      {
        "id": 76,
        "allowed": "[[social-social_needs]]Visible1",
        "title": "<p>Most prevalent {{[[social-social_needs]]LevelPlural}}</p>",
        "value": "<p>{{[[social-social_needs]]1Name}}</p>",
        "subtitle": "<p>{{[[social-social_needs]]1Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 74,
        "allowed": "[[social-social_needs]]VisibleMore",
        "title": "<p>Most prevalent {{[[social-social_needs]]LevelPlural}}</p>",
        "value": "<p>{{[[social-social_needs]]2Name}}</p>",
        "subtitle": "<p>{{[[social-social_needs]]2Sub}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "social-social_needs"
    ],
    "visualizations": [
      417
    ]
  },
  {
    "id": 216,
    "slug": "security",
    "type": "SubGrouping",
    "ordering": 84,
    "allowed": "visibleCrimes",
    "position": "default",
    "icon": "",
    "title": "<p>Security</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 221,
    "slug": "crimes_and_accidents",
    "type": "TextViz",
    "ordering": 85,
    "allowed": "visibleCrimes",
    "position": "default",
    "icon": "",
    "title": "<p>Crimes &amp; Accidents</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 431,
        "allowed": "lastYear_[[socialNeedsSelector]]",
        "text": "<p>In {{lastYear_[[socialNeedsSelector]]}}, the {{crimesText_[[socialNeedsSelector]]}} was abbreviate{{currRate_[[socialNeedsSelector]]}} in {{name}}. {{textGrowth_[[socialNeedsSelector]]}}</p>"
      },
      {
        "id": 428,
        "allowed": "isState",
        "text": "<p>The following map shows the {{crimesText_[[socialNeedsSelector]]}}.</p>"
      },
      {
        "id": 429,
        "allowed": "isState",
        "text": "<p>The graph underneath the paragraph shows the trend of the indicator in {{name}}.</p>"
      },
      {
        "id": 430,
        "allowed": "isCounty",
        "text": "<p>The graph shows the trend in the {{crimesText_[[socialNeedsSelector]]}}.</p>"
      },
      {
        "id": 432,
        "allowed": "isNation",
        "text": "<p>The following map shows all of the states in the United States colored by the {{crimesText_[[socialNeedsSelector]]}}.</p>"
      },
      {
        "id": 433,
        "allowed": "isNation",
        "text": "<p>In {{lastYearSec_[[socialNeedsSelector]]}}, the states with the highest {{crimesText_[[socialNeedsSelector]]}} were list{{top3Crimes_[[socialNeedsSelector]]}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "socialNeedsSelector"
    ],
    "visualizations": [
      422,
      423
    ]
  }
];
