// Converted from legacy canon_cms_section rows (and their subtitle/description/stat/selector/visualization children) with profile_id = 3.
// Text keeps the CMS template syntax: {{variable}}, Formatter{{variable}} and [[selector]] (rendered by src/lib/template.ts).
import type {SectionDefinition} from "@/lib/reports/types";

export const sections: SectionDefinition[] = [
  {
    "id": 93,
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
        "id": 65,
        "allowed": "always",
        "text": "<p>{{hierarchy}}</p>"
      }
    ],
    "descriptions": [],
    "stats": [
      {
        "id": 188,
        "allowed": "always",
        "title": "<p>Workforce Population</p>",
        "value": "<p>Abbreviate{{workforcePopulation}}</p>",
        "subtitle": "<p>{{lastYearWorkforcePop}}</p>",
        "tooltip": ""
      },
      {
        "id": 186,
        "allowed": "always",
        "title": "<p>Average Employee Age</p>",
        "value": "<p>Abbreviate{{avgAge}}</p>",
        "subtitle": "<p>{{totalWageYear}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 189,
        "allowed": "jobsGrowthIndustry",
        "title": "<p>Estimated Job Growth</p>",
        "value": "<p>Abbreviate{{jobsGrowthIndustry}}%</p>",
        "subtitle": "<p>10-Year Projection</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 185,
        "allowed": "always",
        "title": "<p>Average Salary</p>",
        "value": "<p>Salary{{avgSalary}}</p>",
        "subtitle": "<p>{{totalWageYear}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 184,
        "allowed": "always",
        "title": "<p>Average Male Salary</p>",
        "value": "<p>Salary{{menWage}}</p>",
        "subtitle": "<p>{{lastYearWorkforcePop}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 183,
        "allowed": "always",
        "title": "<p>Average Female Salary</p>",
        "value": "<p>Salary{{womenWage}}</p>",
        "subtitle": "<p>{{lastYearWorkforcePop}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 94,
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
        "id": 183,
        "allowed": "always",
        "text": "<p>The top three occupations in the {{name}} {{naicsLevelName}} are List{{topOccupationsWorkforce}}. On average, full-time employees in the {{name}} {{naicsLevelName}} work Abbreviate{{avgHoursFullTime}} hours per week and have an average annual salary of Salary{{avgSalaryFullTime}}. Part-time employees in the same industry work Abbreviate{{avgHoursPartTime}} hours and earn an average annual salary of Salary{{avgSalaryPartTime}}.</p>"
      },
      {
        "id": 184,
        "allowed": "always",
        "text": "<p>The locations with the highest concentration of employees in the {{name}} {{naicsLevelName}} are List{{top3_specialization_pumas}}.</p>"
      },
      {
        "id": 498,
        "allowed": "always",
        "text": "<p>The workforce of {{name}} {{naicsLevelName}} in {{lastYearWorkforcePop}} was commas{{workforcePopulation}} people, with abbreviate{{womenWorkforcePct}}% woman, and abbreviate{{menWorkforcePct}}% men.</p>"
      },
      {
        "id": 497,
        "allowed": "always",
        "text": "<p>In {{lastYearRaces}}, abbreviate{{topRacePct}}% of the workforce in the {{name}} {{naicsLevelName}} was {{topRaceName}} (commas{{topRaceValue}} people), of which abbreviate{{womenRacePct}}% were women and abbreviate{{menRacePct}}% men.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 230,
    "slug": "employment_salaries",
    "type": "Grouping",
    "ordering": 2,
    "allowed": "always",
    "position": "default",
    "icon": "dollar",
    "title": "<p>Employment &amp; Salaries</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 499,
        "allowed": "always",
        "text": "<p>A snapshot of workforce, wages, and opportunities in the {{name}} {{naicsLevelName}}.</p>"
      },
      {
        "id": 500,
        "allowed": "always",
        "text": "<p>The workforce in {{name}} {{naicsLevelName}} was commas{{workforcePopulation}} people and is concentrated in {{top1_workforce_states}}. The average annual salary was Salary{{avgSalary}}, being salary{{diffAverageWage}} {{diffAverageWageWord}} than the national average salary, which was salary{{avgSalaryNation}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 183,
    "slug": "monthly-employment",
    "type": "Default",
    "ordering": 3,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Monthly Employment</p>",
    "short": "",
    "subtitles": [
      {
        "id": 62,
        "allowed": "latestEmploymentSubtitle",
        "text": "<p>Showing data for the {{latestEmploymentSector}} industry sector.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 368,
        "allowed": "always",
        "text": "<p>As of {{latestEmploymentMonth}} {{latestEmploymentCurrYear}}, there are abbreviate{{latestEmployment}} people employed in the {{latestEmploymentSector}} industry. This represents a abbreviate{{latestEmploymentGrowth}}% increaseWord{{latestEmploymentGrowth}} in employment when compared to {{latestEmploymentMonth}} {{latestEmploymentPrevYear}}.</p>"
      },
      {
        "id": 366,
        "allowed": "always",
        "text": "<p>This chart shows monthly employment numbers for {{latestEmploymentSector}} over time (non-seasonally adjusted).</p>"
      }
    ],
    "stats": [
      {
        "id": 358,
        "allowed": "always",
        "title": "<p>Year-over-year growthWord{{latestEmploymentGrowth}}</p>",
        "value": "<p>abbreviate{{latestEmploymentGrowth}}%</p>",
        "subtitle": "<p>Employment change between {{latestEmploymentMonth}} {{latestEmploymentPrevYear}} and {{latestEmploymentMonth}} {{latestEmploymentCurrYear}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "bls-start-year",
      "monthly-employment"
    ],
    "visualizations": [
      186
    ]
  },
  {
    "id": 232,
    "slug": "employment_by_location",
    "type": "TextViz",
    "ordering": 4,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Employment by Location</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 477,
        "allowed": "always",
        "text": "<p>The Lower{{[[geoOption]]_Text}} that concentrated the {{[[workforceByStates]]_Text}} in {{lastYearEmploymentLocation}} were list{{top3_[[workforceByStates]]_[[geoOption]]}}.</p>"
      },
      {
        "id": 476,
        "allowed": "always",
        "text": "<p>This map shows the Lower{{[[geoOption]]_Text}} in the United States shaded by Lower{{[[workforceByStates]]}} for {{name}} {{naicsLevelName}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "workforceByStates",
      "geoOption"
    ],
    "visualizations": [
      348
    ]
  },
  {
    "id": 233,
    "slug": "wage_ranking",
    "type": "TextViz",
    "ordering": 5,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Yearly Wage Ranking</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 479,
        "allowed": "avgSalary",
        "text": "<p>In {{totalWageYear}}, {{name}} {{naicsLevelName}} had an average annual wage of salary{{avgSalary}}, salary{{diffAverageWage}} {{diffAverageWageWord}} than the average national salary of salary{{avgSalaryNation}}.</p>"
      },
      {
        "id": 481,
        "allowed": "always",
        "text": "<p>The graph shows the position of {{name}} {{naicsLevelName}} in the ranking of industries by average annual wage.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      349,
      350
    ]
  },
  {
    "id": 102,
    "slug": "wage_distribution",
    "type": "Default",
    "ordering": 6,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Wage Distribution</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 195,
        "allowed": "always",
        "text": "<p>{{name}} has a wage GINI of Abbreviate{{giniCurr}}, which is MoreWord{{giniComp}} than the national average of Abbreviate{{giniNation}}. In other words, wages are distributed MoreLess{{giniCompDir}} evenly in {{name}} (shown in red) in comparison to the national average for those wage buckets (shown in gray).</p>"
      },
      {
        "id": 478,
        "allowed": "always",
        "text": "<p>The graphic shows the distribution of average salaries by buckets for {{name}} {{naicsLevelName}} workers compared to the entire workforce in the country.</p>"
      }
    ],
    "stats": [
      {
        "id": 197,
        "allowed": "always",
        "title": "<p>WAGE GINI</p>",
        "value": "<p>Abbreviate{{giniCurr}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [
      "genderWage"
    ],
    "visualizations": [
      351
    ]
  },
  {
    "id": 234,
    "slug": "occupations",
    "type": "Grouping",
    "ordering": 7,
    "allowed": "always",
    "position": "default",
    "icon": "people",
    "title": "<p>Occupations</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 501,
        "allowed": "always",
        "text": "<p>A review of jobs and wages in the {{name}} {{naicsLevelName}}.</p>"
      },
      {
        "id": 502,
        "allowed": "always",
        "text": "<p>{{top1OccupationsWorkforce}}, but the {{name}} {{naicsLevelName}} employs a relatively high number of list{{top2and3OccupationsWorkforce}}.</p>"
      },
      {
        "id": 503,
        "allowed": "always",
        "text": "<p>The highest average salary in {{name}} goes to {{top1OccupationsWage}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 235,
    "slug": "occupations_distribution",
    "type": "Default",
    "ordering": 8,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Occupations Distribution</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 482,
        "allowed": "workforce_[[occupationOption]]",
        "text": "<p>The graph shows the distribution of employees in the {{name}} {{naicsLevelName}} according to occupations. In {{lastYearOccupationWorkforce}}, the occupations that concentrated the largest number of employees in this industry were list{{top3OccupationsWorkforce}}</p>"
      },
      {
        "id": 483,
        "allowed": "wage_[[occupationOption]]",
        "text": "<p>The graph groups occupations in the {{name}} {{naicsLevelName}} by number of employees and is colored to identify the occupations with the best and worst average wage. In {{lastYearOccupationWage}}, the highest-paying occupations in this industry were list{{top3OccupationsWage}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "occupationOption",
      "changeOccupation"
    ],
    "visualizations": [
      352
    ]
  },
  {
    "id": 106,
    "slug": "wage_sex",
    "type": "Default",
    "ordering": 9,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Wage by Sex in Common Jobs</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 200,
        "allowed": "always",
        "text": "<p>On average, Male workers in the {{name}} {{naicsLevelName}} make Abbreviate{{comparisonSalaryMaleTimes}} times {{comparisonSalaryMale}} than their Female counterparts. This chart shows the sex-based wage disparity in the 5 most common occupations in the {{name}} {{naicsLevelName}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 203,
        "allowed": "always",
        "title": "<p>AVERAGE MALE SALARY</p>",
        "value": "<p>Salary{{menWage}}</p>",
        "subtitle": "<p>±Salary{{avgSalaryMaleMOE}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 204,
        "allowed": "always",
        "title": "<p>AVERAGE FEMALE SALARY</p>",
        "value": "<p>Salary{{womenWage}}</p>",
        "subtitle": "<p>±Salary{{avgSalaryFemaleMOE}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      353
    ]
  },
  {
    "id": 236,
    "slug": "business",
    "type": "Grouping",
    "ordering": 10,
    "allowed": "always",
    "position": "default",
    "icon": "briefcase",
    "title": "<p>Business</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 504,
        "allowed": "always",
        "text": "<p>Estimates of the sources of the costs and the purchasers of the products in the {{name}} {{naicsLevelName}}. Based on estimates from the Bureau of Economic Analysis, this section indicates the amount of money spent by a specific industry in other industries.</p>"
      },
      {
        "id": 505,
        "allowed": "always",
        "text": "<p>The industrial flow illustrates the intermediate inputs and the use of outputs of the {{name}} {{naicsLevelName}}.</p>"
      },
      {
        "id": 506,
        "allowed": "always",
        "text": "<p>The {{name}} {{naicsLevelName}} gets the most input, by its share of the cost of all intermediate inputs, from the {{topIntermediate1Name}} Industry.</p>"
      },
      {
        "id": 507,
        "allowed": "lastYearEstablishments",
        "text": "<p>list{{top2EstablishmentState}} stand out as the states with the largest number of establishments in the {{name}} {{naicsLevelName}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 109,
    "slug": "sankey",
    "type": "Default",
    "ordering": 11,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Industrial Flow</p>",
    "short": "",
    "subtitles": [
      {
        "id": 36,
        "allowed": "isNotParent",
        "text": "<p>The closest comparable data for {{name}} is from {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 484,
        "allowed": "always",
        "text": "<p>{{topIntermediate1Name}} has the highest single input, by dollars, to the {{name}} {{naicsLevelName}}, and the largest industry purchasing services from the {{name}} {{naicsLevelName}} is {{topOutput1Name}}.</p>"
      },
      {
        "id": 485,
        "allowed": "always",
        "text": "<p>In this flow diagram, all of the industries listed to the left are those places from which the highlighted industry has made purchases. They are the intermediate inputs to the highlighted industry. All those industries listed on the right side are those industries that have made purchases from the highlighted industry. They are the use of outputs of the highlighted industry. The visualizations below offer alternative ways to see and understand this data.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      115
    ]
  },
  {
    "id": 110,
    "slug": "tmap_consumption",
    "type": "Default",
    "ordering": 12,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Intermediate Inputs</p>",
    "short": "",
    "subtitles": [
      {
        "id": 37,
        "allowed": "isNotParent",
        "text": "<p>The closest comparable data for {{name}} is from {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 204,
        "allowed": "always",
        "text": "<p>The {{name}} {{naicsLevelName}} gets the most input, by its share of the cost of all intermediate inputs, from the {{topIntermediate1Name}} Industry. This visualization does not include labor and capital costs.</p>"
      }
    ],
    "stats": [
      {
        "id": 210,
        "allowed": "always",
        "title": "<p>HIGHEST INPUT INDUSTRY</p>",
        "value": "<p>{{topIntermediate1Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 209,
        "allowed": "always",
        "title": "<p>HIGHEST INPUT INDUSTRY</p>",
        "value": "<p>{{topIntermediate2Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 208,
        "allowed": "always",
        "title": "<p>HIGHEST INPUT INDUSTRY</p>",
        "value": "<p>{{topIntermediate3Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      116
    ]
  },
  {
    "id": 111,
    "slug": "tmap_production",
    "type": "Default",
    "ordering": 13,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Use of Output by Other Industries</p>",
    "short": "",
    "subtitles": [
      {
        "id": 38,
        "allowed": "isNotParent",
        "text": "<p>The closest comparable data for {{name}} is from {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 205,
        "allowed": "always",
        "text": "<p>The {{topOutput1Name}} Industry purchases the greatest share of products and services from the {{name}} {{naicsLevelName}} in order to produce other goods and services. Purchases of the {{name}} {{naicsLevelName}} for final consumption by consumers, businesses, or government are not included here.</p>"
      }
    ],
    "stats": [
      {
        "id": 213,
        "allowed": "topOutput1Name",
        "title": "<p>LARGEST PURCHASING INDUSTRY</p>",
        "value": "<p>{{topOutput1Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 211,
        "allowed": "topOutput2Name",
        "title": "<p>LARGEST PURCHASING INDUSTRY</p>",
        "value": "<p>{{topOutput2Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 212,
        "allowed": "topOutput3Name",
        "title": "<p>LARGEST PURCHASING INDUSTRY</p>",
        "value": "<p>{{topOutput3Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      117
    ]
  },
  {
    "id": 238,
    "slug": "establishments",
    "type": "TextViz",
    "ordering": 14,
    "allowed": "lastYearEstablishments",
    "position": "default",
    "icon": "",
    "title": "<p>Establishments</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 486,
        "allowed": "always",
        "text": "<p>The charts shows the distribution of establishments in the {{name}} industry by states and the number of establishments according to size.</p>"
      }
    ],
    "stats": [
      {
        "id": 386,
        "allowed": "always",
        "title": "<p>States with more establishments in {{lastYearEstablishments}}</p>",
        "value": "<p>{{establishmentState1}}</p>",
        "subtitle": "<p>commas{{establishmentStateValue1}}</p>",
        "tooltip": ""
      },
      {
        "id": 387,
        "allowed": "always",
        "title": "<p>States with more establishments in {{lastYearEstablishments}}</p>",
        "value": "<p>{{establishmentState2}}</p>",
        "subtitle": "<p>commas{{establishmentStateValue2}}</p>",
        "tooltip": ""
      },
      {
        "id": 388,
        "allowed": "always",
        "title": "<p>States with more establishments in {{lastYearEstablishments}}</p>",
        "value": "<p>{{establishmentState3}}</p>",
        "subtitle": "<p>commas{{establishmentStateValue3}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [],
    "visualizations": [
      354,
      355
    ]
  },
  {
    "id": 239,
    "slug": "median_earnings",
    "type": "TextViz",
    "ordering": 15,
    "allowed": "isSectorMedianEarnings",
    "position": "default",
    "icon": "",
    "title": "<p>Median Earnings</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 487,
        "allowed": "always",
        "text": "<p>The charts shows the median earnings of the {{name}} industry by state and the annual evolution of the median earnings of the industry compared to the national level.</p>"
      }
    ],
    "stats": [
      {
        "id": 389,
        "allowed": "always",
        "title": "<p>States with the highest median earnings in<strong> </strong>{{lastYearEarnings}}</p>",
        "value": "<p>{{earningsState1}}</p>",
        "subtitle": "<p>salary{{earningsStateValue1}}</p>",
        "tooltip": ""
      },
      {
        "id": 390,
        "allowed": "always",
        "title": "<p>States with the highest median earnings in<strong> </strong>{{lastYearEarnings}}</p>",
        "value": "<p>{{earningsState2}}</p>",
        "subtitle": "<p>salary{{earningsStateValue2}}</p>",
        "tooltip": ""
      },
      {
        "id": 391,
        "allowed": "always",
        "title": "<p>States with the highest median earnings in<strong> </strong>{{lastYearEarnings}}</p>",
        "value": "<p>{{earningsState3}}</p>",
        "subtitle": "<p>salary{{earningsStateValue3}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [],
    "visualizations": [
      356,
      357
    ]
  },
  {
    "id": 237,
    "slug": "diversity",
    "type": "Grouping",
    "ordering": 16,
    "allowed": "always",
    "position": "default",
    "icon": "geosearch",
    "title": "<p>Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 475,
        "allowed": "always",
        "text": "<p>Demographic information on the {{name}} {{naicsLevelName}} in the US.</p>"
      },
      {
        "id": 508,
        "allowed": "always",
        "text": "<p>Of the total workforce, abbreviate{{womenWorkforcePct}}% corresponds to women and abbreviate{{menWorkforcePct}}% men. Male employees tend to earn {{comparisonSalaryMale}} than Female employees, with average respective salaries of Salary{{menWage}} and Salary{{womenWage}}.</p>"
      },
      {
        "id": 509,
        "allowed": "always",
        "text": "<p>abbreviate{{pctTopEducationLevel}}% of workers have a listOr{{top3EducationLevel}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 240,
    "slug": "gender_and_age",
    "type": "TextViz",
    "ordering": 17,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Gender and Age</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 488,
        "allowed": "pyramidWork_[[workforcePyramid]]",
        "text": "<p>The workforce of {{name}} industry in {{lastYearWorkforcePop}} was commas{{workforcePopulation}} people, with abbreviate{{womenWorkforcePct}}% woman, and abbreviate{{menWorkforcePct}}% men.</p>"
      },
      {
        "id": 489,
        "allowed": "pyramidWork_[[workforcePyramid]]",
        "text": "<p>The visualization shows the distribution of the workforce by gender and age in {{name}} industry.</p>"
      },
      {
        "id": 491,
        "allowed": "pyramidWage_[[workforcePyramid]]",
        "text": "<p>The average wage for women in {{name}} industry was salary{{womenWage}} while the average wage for men was salary{{menWage}}.</p>"
      },
      {
        "id": 490,
        "allowed": "pyramidWage_[[workforcePyramid]]",
        "text": "<p>The visualization shows the distribution of averages wages by gender and age in {{name}} industry.</p>"
      }
    ],
    "stats": [
      {
        "id": 392,
        "allowed": "always",
        "title": "<p>Women</p>",
        "value": "<p>commas{{womenWorkforce}}</p>",
        "subtitle": "<p>abbreviate{{womenWorkforcePct}}%</p>",
        "tooltip": ""
      },
      {
        "id": 393,
        "allowed": "always",
        "title": "<p>Men</p>",
        "value": "<p>commas{{menWorkforce}}</p>",
        "subtitle": "<p>abbreviate{{menWorkforcePct}}%</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "workforcePyramid"
    ],
    "visualizations": [
      358
    ]
  },
  {
    "id": 241,
    "slug": "races",
    "type": "TextViz",
    "ordering": 18,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Races</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 492,
        "allowed": "always",
        "text": "<p>In {{lastYearRaces}}, abbreviate{{topRacePct}}% of the workforce in the {{name}} industry was {{topRaceName}} (commas{{topRaceValue}} people), of which abbreviate{{womenRacePct}}% were women and abbreviate{{menRacePct}}% men.</p>"
      },
      {
        "id": 493,
        "allowed": "top2Race",
        "text": "<p>Other races that concentrated a significant number of workers were {{top2Race}} and {{top3Race}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      359
    ]
  },
  {
    "id": 243,
    "slug": "educational_levels",
    "type": "TextViz",
    "ordering": 19,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Educational Levels</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 494,
        "allowed": "educationWork_[[educationWorkforceWage]]",
        "text": "<p>The main educational levels achieved by the {{name}} workers in {{lastYearEducation}} were list{{top3WorkforceEducation}}.</p>"
      },
      {
        "id": 496,
        "allowed": "educationWage_[[educationWorkforceWage]]",
        "text": "<p>The best salaries received by the workers of the {{name}} industry in {{lastYearEducation}} correspond to those who achieved the lower{{topWageEducation}}.</p>"
      },
      {
        "id": 495,
        "allowed": "always",
        "text": "<p>The chart shows the {{name}} Lower{{[[educationWorkforceWage]]}} by gender and educational level.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "educationWorkforceWage"
    ],
    "visualizations": [
      360
    ]
  },
  {
    "id": 112,
    "slug": "growth",
    "type": "Grouping",
    "ordering": 20,
    "allowed": "jobsGrowthIndustry",
    "position": "default",
    "icon": "timeline-line-chart",
    "title": "<p>Projections</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 206,
        "allowed": "always",
        "text": "<p>Growth projections of the {{blsName}} industry, both by number of employees and output, from the Bureau of Labor and Statistics. The national workforce is projected to grow Abbreviate{{jobsGrowthNation}}% in the next ten years. The {{blsName}} industry has a {{jobsGrowthWord}} projected workforce growth at Abbreviate{{jobsGrowthIndustry}}%. Its projected 10-year growth in output (Abbreviate{{outputGrowthIndustry}}%) is {{outputGrowthWord}} than the projected national growth in output (Abbreviate{{outputGrowthNation}}%).</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 113,
    "slug": "job_growth",
    "type": "TextViz",
    "ordering": 21,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Job Growth</p>",
    "short": "",
    "subtitles": [
      {
        "id": 39,
        "allowed": "blsSubtitle",
        "text": "<p>{{blsSubtitle}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 207,
        "allowed": "always",
        "text": "<p>This line chart shows the projected 10-year growth in the number of jobs for {{blsName}}. This industry is expected to grow MoreWord{{jobsGrowthComp}} than Abbreviate{{jobsGrowthNation}}%, the average rate of national job growth.</p>"
      }
    ],
    "stats": [
      {
        "id": 214,
        "allowed": "always",
        "title": "<p>Estimated Job Growth</p>",
        "value": "<p>Abbreviate{{jobsGrowthIndustry}}%</p>",
        "subtitle": "<p>10-year Projection</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 363,
        "allowed": "always",
        "title": "<p>National Growth</p>",
        "value": "<p>Abbreviate{{jobsGrowthNation}}%</p>",
        "subtitle": "<p>10-year Projection</p>",
        "tooltip": ""
      }
    ],
    "selectors": [],
    "visualizations": [
      118
    ]
  },
  {
    "id": 114,
    "slug": "output_growth",
    "type": "TextViz",
    "ordering": 22,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Output Growth</p>",
    "short": "",
    "subtitles": [
      {
        "id": 40,
        "allowed": "blsSubtitle",
        "text": "<p>{{blsSubtitle}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 208,
        "allowed": "always",
        "text": "<p>This line chart shows the projected 10-year growth in output of the {{blsName}} industry.</p>"
      }
    ],
    "stats": [
      {
        "id": 215,
        "allowed": "always",
        "title": "<p>Estimate Growth</p>",
        "value": "<p>Abbreviate{{outputGrowthIndustry}}%</p>",
        "subtitle": "<p>10-year Projection</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      119
    ]
  }
];
