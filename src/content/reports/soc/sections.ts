// Converted from legacy canon_cms_section rows (and their subtitle/description/stat/selector/visualization children) with profile_id = 4.
// Text keeps the CMS template syntax: {{variable}}, Formatter{{variable}} and [[selector]] (rendered by src/lib/template.ts).
import type {SectionDefinition} from "@/lib/reports/types";

export const sections: SectionDefinition[] = [
  {
    "id": 115,
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
        "id": 66,
        "allowed": "always",
        "text": "<p>{{hierarchy}}</p>"
      }
    ],
    "descriptions": [],
    "stats": [
      {
        "id": 220,
        "allowed": "always",
        "title": "<p>{{pumsYear}} Workforce</p>",
        "value": "<p>Abbreviate{{totalWorkforce}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 216,
        "allowed": "always",
        "title": "<p>Average Age</p>",
        "value": "<p>Abbreviate{{avgAgeWorkforce}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 221,
        "allowed": "hasBLS",
        "title": "<p>Estimated Job Growth</p>",
        "value": "<p>Abbreviate{{jobsGrowth}}%</p>",
        "subtitle": "<p>10-year projection</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 218,
        "allowed": "always",
        "title": "<p>Average Salary</p>",
        "value": "<p>Salary{{avgSalary}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 217,
        "allowed": "socAvgMaleSalary",
        "title": "<p>Average Male Salary</p>",
        "value": "<p>Salary{{socAvgMaleSalary}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 219,
        "allowed": "socAvgAgeFemale",
        "title": "<p>Average Female Salary</p>",
        "value": "<p>Salary{{socAvgFemaleSalary}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 116,
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
        "id": 210,
        "allowed": "always",
        "text": "<p>{{name}} are most often employed by the {{topIndustry}} industry. The average yearly wage for {{name}} was Salary{{avgSalary}} in {{topWageIndLastYear}}.</p>"
      },
      {
        "id": 209,
        "allowed": "always",
        "text": "<p>The locations that employ the most {{name}} are List{{topLocations}}. The locations with a relatively high concentration of {{name}} are List{{topConcentration}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 117,
    "slug": "employment",
    "type": "Grouping",
    "ordering": 2,
    "allowed": "always",
    "position": "default",
    "icon": "briefcase",
    "title": "<p>Employment</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 212,
        "allowed": "always",
        "text": "<p>Employment and salary information for the {{name}} workforce. {{name}} workforce in {{latestYear}} was Commas{{totalWorkforce2}} people, of which Abbreviate{{percentageFemale}}% were women and Abbreviate{{percentageMale}}% were men.</p>"
      },
      {
        "id": 564,
        "allowed": "top1WageName_pumasEBL",
        "text": "<p>{{name}} are paid most in {{top1WageName_pumasEBL}} but are relatively concentrated in {{puma1Name}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 184,
    "slug": "employment-over-time",
    "type": "TextViz",
    "ordering": 3,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Employment Over Time</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 374,
        "allowed": "showParragraphWorkforce_[[employment-measures]]",
        "text": "<p>The {{name}} workforce in {{latestYear}} was Commas{{totalWorkforce2}} people (Abbreviate{{percentageFemale}}% women and Abbreviate{{percentageMale}}% men). This implies an average annual growth of Abbreviate{{growthWorkforce}}% between {{firstYear}} (commas{{totalWorkforceFirst}}) and {{latestYear}} (commas{{totalWorkforce2}}).</p>"
      },
      {
        "id": 373,
        "allowed": "showParragraphAvgWage_[[employment-measures]]",
        "text": "<p>The average annual wage of {{name}} in {{latestYear}} was Salary{{totalAvgWage}}. This implies an average annual growth of Abbreviate{{growthAvgWage}}% between {{firstYear}} (salary{{avgWageFirstYear}}) and {{latestYear}} (salary{{totalAvgWage}}).</p>"
      }
    ],
    "stats": [
      {
        "id": 361,
        "allowed": "showParragraphAvgWage_[[employment-measures]]",
        "title": "<p>Average Wage Men</p>",
        "value": "<p>$Abbreviate{{avgWageMale}}</p>",
        "subtitle": "<p>± $Commas{{avgWageMaleMOE}}</p>",
        "tooltip": ""
      },
      {
        "id": 362,
        "allowed": "showParragraphAvgWage_[[employment-measures]]",
        "title": "<p>Average Wage Women</p>",
        "value": "<p>$Abbreviate{{avgWageFemale}}</p>",
        "subtitle": "<p>± $Commas{{avgWageFemaleMOE}}</p>",
        "tooltip": ""
      },
      {
        "id": 397,
        "allowed": "showParragraphWorkforce_[[employment-measures]]",
        "title": "<p>Male Workforce</p>",
        "value": "<p>Commas{{totalWorkforceMale}}</p>",
        "subtitle": "<p>± Abbreviate{{totalWorkforceMaleMOE}}</p>",
        "tooltip": ""
      },
      {
        "id": 398,
        "allowed": "showParragraphWorkforce_[[employment-measures]]",
        "title": "<p>Female Workforce</p>",
        "value": "<p>Commas{{totalWorkforceFemale}}</p>",
        "subtitle": "<p>± Abbreviate{{totalWorkforceFemaleMOE}}</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "employment-measures",
      "employment-ot-filter"
    ],
    "visualizations": [
      240,
      363
    ]
  },
  {
    "id": 120,
    "slug": "employment-by-location",
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
        "id": 218,
        "allowed": "always",
        "text": "<p>This map shows the {{geoWord_[[employment-bl-geo]]}} in the United States shaded by lower{{[[employment-bl-measure]]}} for {{name}}.</p>"
      },
      {
        "id": 512,
        "allowed": "showParagraphWage_[[employment-bl-measure]]",
        "text": "<p>During {{topWageLastYear_[[employment-bl-geo]]}}, the {{geoWord_[[employment-bl-geo]]}} that concentrated the best average annual wage were {{topWage_[[employment-bl-geo]]}}.</p>"
      },
      {
        "id": 532,
        "allowed": "showParagraphWorkforce_[[employment-bl-measure]]",
        "text": "<p>During {{topWorkforceLastYear_[[employment-bl-geo]]}}, the {{geoWord_[[employment-bl-geo]]}} that concentrated the largest workforce were {{topWorkforceList_[[employment-bl-geo]]}}.</p>"
      },
      {
        "id": 533,
        "allowed": "showParagraphRca_[[employment-bl-measure]]",
        "text": "<p>During {{topRcaLastYear_[[employment-bl-geo]]}}, the {{geoWord_[[employment-bl-geo]]}} with the highest specialization for {{name}} (based on the RCA) were {{topRCAList_[[employment-bl-geo]]}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "employment-bl-geo",
      "employment-bl-measure"
    ],
    "visualizations": [
      388
    ]
  },
  {
    "id": 118,
    "slug": "wage-ranking",
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
        "id": 214,
        "allowed": "always",
        "text": "<p>In {{wageRankingLastYear}}, {{name}} earned an average of Salary{{avgYearlyWage}}, Salary{{deltaAvgWage}} {{deltaAvgWageWord}} than the average national salary of Salary{{avgYearlyWageNational}}</p>"
      },
      {
        "id": 213,
        "allowed": "isBetweenPaid",
        "text": "<p>The graph shows the ranking of {{name}} in relation to all {{hierarchy}} in {{rankingLatestYear}}.</p>"
      },
      {
        "id": 216,
        "allowed": "isHighestPaid",
        "text": "<p>{{name}} are the highest paid occupation in the US followed by&nbsp;{{neighbourLess}}. This chart shows the various occupations closest to {{name}} as measured by average annual salary in the US.</p>"
      },
      {
        "id": 215,
        "allowed": "isLowestPaid",
        "text": "<p>{{name}} are the lowest paid occupation in the US followed by {{neighbourMore}}. This chart shows the various occupations closest to {{name}} as measured by average annual salary in the US.</p>"
      }
    ],
    "stats": [
      {
        "id": 222,
        "allowed": "always",
        "title": "<p>AVERAGE WAGE</p>",
        "value": "<p>Salary{{avgSalary}}</p>",
        "subtitle": "<p>#{{positionRanking}} in the ranking ({{rankingLatestYear}})</p>",
        "tooltip": ""
      },
      {
        "id": 395,
        "allowed": "always",
        "title": "<p>NATIONAL AVERAGE WAGE</p>",
        "value": "<p>Salary{{avgYearlyWageNational}}</p>",
        "subtitle": "<p>For all occupations across the US</p>",
        "tooltip": ""
      }
    ],
    "selectors": [],
    "visualizations": [
      241,
      242,
      368,
      369
    ]
  },
  {
    "id": 119,
    "slug": "wage-distribution",
    "type": "TextViz",
    "ordering": 6,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Wage Distribution</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 217,
        "allowed": "always",
        "text": "<p>In {{giniCurrYear}}, {{name}} had a wage GINI coefficient of Abbreviate{{giniCurr}}, which is {{giniDeltaWord}} than the national average of Abbreviate{{giniNation}}. In other words, wages are distributed {{giniWord}} evenly for {{name}} (shown in red) than for the overall labor force (shown in gray).</p>"
      },
      {
        "id": 513,
        "allowed": "always",
        "text": "<p>The graphic shows the distribution of average salaries by buckets for {{name}} compared to the entire workforce in the country.</p>"
      }
    ],
    "stats": [
      {
        "id": 223,
        "allowed": "always",
        "title": "<p>WAGE GINI</p>",
        "value": "<p>Abbreviate{{giniCurr}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "gender-options"
    ],
    "visualizations": [
      121,
      371
    ]
  },
  {
    "id": 244,
    "slug": "industry",
    "type": "Grouping",
    "ordering": 7,
    "allowed": "always",
    "position": "default",
    "icon": "rig",
    "title": "<p>Industry</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 540,
        "allowed": "always",
        "text": "<p>Information on the industries that employ {{name}} and on wages for those in the field. {{topIndustry}} is the industry that employs the most {{name}}, both by share and by number, though the highest paid industry for {{name}}, by average wage, is {{top1IndWageName}} ({{top1IndWage}}).</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 245,
    "slug": "occupation-by-industry",
    "type": "Default",
    "ordering": 8,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Occupations by Industries</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 510,
        "allowed": "showParragraphWorkforce_[[occupation-by-industry-measure]]",
        "text": "<p>This graphic shows the share of {{name}} employed by various industries. {{byIndustryWorkforce}}</p>"
      },
      {
        "id": 514,
        "allowed": "showParragraphAvgWage_[[occupation-by-industry-measure]]",
        "text": "<p>The graphic is colored to identify the industries with the best and worst average wages. {{byIndustryWage}}</p>"
      }
    ],
    "stats": [
      {
        "id": 400,
        "allowed": "always",
        "title": "<p>{{socCurrYear}} Workforce</p>",
        "value": "<p>Abbreviate{{socWorkforceLastYear}}</p>",
        "subtitle": "<p>± Commas{{socWorkforceLastYearMoe}}</p>",
        "tooltip": ""
      },
      {
        "id": 401,
        "allowed": "always",
        "title": "<p>1 YEAR GROWTH</p>",
        "value": "<p>Abbreviate{{socWorkforceRate}}%</p>",
        "subtitle": "<p>± Abbreviate{{socWorkforceRateMOE}}%</p>",
        "tooltip": ""
      }
    ],
    "selectors": [
      "occupation-by-industry-measure",
      "occupation-by-industry-metric"
    ],
    "visualizations": [
      372
    ]
  },
  {
    "id": 125,
    "slug": "demographics",
    "type": "Grouping",
    "ordering": 9,
    "allowed": "always",
    "position": "default",
    "icon": "geosearch",
    "title": "<p>Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 224,
        "allowed": "always",
        "text": "<p>Demographic information on {{name}} in the US. The workforce of {{name}} in {{latestYear}} was Commas{{totalWorkforce2}} people, with Abbreviate{{percentageFemale}}% woman, and Abbreviate{{percentageMale}}% men. The average age of male {{name}} in the workforce is Abbreviate{{socAvgAgeMale}} and of female {{name}} is Abbreviate{{socAvgAgeFemale}}, and the most common race/ethnicity for {{name}} is {{race1Name}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 248,
    "slug": "gender-and-age",
    "type": "TextViz",
    "ordering": 10,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Gender and Age</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 515,
        "allowed": "showParragraphWorkforce_[[gender-and-age-employment]]_[[gender-and-age-measure]]",
        "text": "<p>The workforce of {{name}} in {{latestYear}} was Commas{{totalWorkforce2}} people, with Abbreviate{{percentageFemale}}% woman, and Abbreviate{{percentageMale}}% men.</p>"
      },
      {
        "id": 516,
        "allowed": "showParragraphWorkforce_[[gender-and-age-employment]]_[[gender-and-age-measure]]",
        "text": "<p>The age ranges that concentrated the largest workforce were {{top1AgeWorkforceRange}} years (Commas{{top1AgeWorkforce}} people), {{top2AgeWorkforceRange}} years (Commas{{top2AgeWorkforce}} &nbsp;people), and {{top3AgeWorkforceRange}} years (Commas{{top3AgeWorkforce}} people). Among them they concentrated Abbreviate{{ageBucketShare}}% of the total workforce.</p>"
      },
      {
        "id": 517,
        "allowed": "showParragraphAvgWage_[[gender-and-age-employment]]_[[gender-and-age-measure]]",
        "text": "<p>The average wage for women was Salary{{avgWageFemale}} while the average wage for men was Salary{{avgWageMale}}.</p>"
      },
      {
        "id": 527,
        "allowed": "showParragraphAvgWage_[[gender-and-age-employment]]_[[gender-and-age-measure]]",
        "text": "<p>{{ageBucketWageText}}</p>"
      },
      {
        "id": 536,
        "allowed": "showParragraphUnemployment_[[gender-and-age-employment]]_[[gender-and-age-measure]]",
        "text": "<p>The unemployed of {{name}} in {{latestYear}} was Commas{{totalUnemployment}} people, with Abbreviate{{percentageUnemploymentFemale}}% woman, and Abbreviate{{percentageUnemploymentMale}}% men.</p>"
      },
      {
        "id": 537,
        "allowed": "showParragraphUnemployment_[[gender-and-age-employment]]_[[gender-and-age-measure]]",
        "text": "<p>The age ranges that concentrated the largest unemployment were {{top1AgeUnemploymentRange}} years (Commas{{top1AgeUnemployment}} people), {{top2AgeUnemploymentRange}} years (Commas{{top2AgeUnemployment}} people), and {{top3AgeUnemploymentRange}} years (Commas{{top3AgeUnemployment}} people). Among them they concentrated Abbreviate{{ageBucketShareUnemployment}}% of the total unemployed.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "gender-and-age-employment",
      "gender-and-age-measure"
    ],
    "visualizations": [
      373,
      374
    ]
  },
  {
    "id": 249,
    "slug": "ethnicity",
    "type": "Default",
    "ordering": 11,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Ethnicity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 511,
        "allowed": "always",
        "text": "<p>In {{latestYearRace}}, Abbreviate{{hispanicShare}}% of {{name}} workers were Hispanic and Abbreviate{{nonHispanicShare}}% non-Hispanic.</p>"
      },
      {
        "id": 518,
        "allowed": "always",
        "text": "<p>The treemap shows the distribution of Hispanic workers according to their origin, highlighting {{ethnicityList}}</p>"
      },
      {
        "id": 538,
        "allowed": "always",
        "text": "<p>You can review this information by gender using the selectors above.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "ethnicity-employment",
      "ethnicity-gender"
    ],
    "visualizations": [
      249,
      250,
      376,
      378
    ]
  },
  {
    "id": 250,
    "slug": "races",
    "type": "TextViz",
    "ordering": 12,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Races</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 519,
        "allowed": "always",
        "text": "<p>In {{latestYearRace}}, Abbreviate{{race1Share}}% of the {{name}} workforce were {{race1Name}}, of which abbreviate{{topWomenRacePct}}% were women and abbreviate{{topMenRacePct}}% men. Other races that concentrated a significant number of workers were {{race2Name}} (Abbreviate{{race2Share}}%) and {{race3Name}} (Abbreviate{{race3Share}}%).</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "races-employment",
      "races-filter"
    ],
    "visualizations": [
      257,
      264,
      379,
      380
    ]
  },
  {
    "id": 129,
    "slug": "education-and-skills",
    "type": "Grouping",
    "ordering": 13,
    "allowed": "always",
    "position": "default",
    "icon": "learning",
    "title": "<p>Education &amp; Skills</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 228,
        "allowed": "always",
        "text": "<p>Data on higher education choices for {{name}} from The Department of Education and Census Bureau. The most common major for {{name}} is {{major1Name}} but the most specialized major according to RCA in {{RCALatestYear}} were {{major1RCAName}}.</p>"
      },
      {
        "id": 546,
        "allowed": "topSkillsVis",
        "text": "<p>Among the necessary skills for {{name}}, {{top1Skills}} stands, but the revealed comparative advantage (RCA) shows that {{name}} need more than the average amount of {{top1SkillsRCA}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 130,
    "slug": "majors",
    "type": "TextViz",
    "ordering": 14,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Majors</p>",
    "short": "",
    "subtitles": [
      {
        "id": 41,
        "allowed": "always",
        "text": "<p>ACS PUMS data only shows the major for bachelor's degrees. However, we can filter the data based on highest degree obtained.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 520,
        "allowed": "showParragraphCommon_[[majors-select]]",
        "text": "<p>The most common majors achieved by {{name}} in {{majorsLatestYear}} (counting all academic degrees) were {{majorList}}.</p>"
      },
      {
        "id": 526,
        "allowed": "showParragraphSpec_[[majors-select]]",
        "text": "<p>The most specialized majors according to RCA in {{RCALatestYear}} (counting all academic degrees) were {{majorRCAList}}.</p>"
      },
      {
        "id": 539,
        "allowed": "always",
        "text": "<p>You can review this information for different academic grades by modifying the option selected in the selector above.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "majors-select",
      "degree-majors"
    ],
    "visualizations": [
      384
    ]
  },
  {
    "id": 251,
    "slug": "education-levels",
    "type": "TextViz",
    "ordering": 15,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Education Levels</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 521,
        "allowed": "showParragraphWorkforce_[[education-levels]]",
        "text": "<p>The main educational levels achieved by the {{name}} workers were {{top1EdLevelName}} (commas{{top1EdLevelPop}} people), {{top2EdLevelName}} (commas{{top2EdLevelPop}} people), and {{top3EdLevelName}} (commas{{top3EdLevelPop}} people).</p>"
      },
      {
        "id": 522,
        "allowed": "showParragraphWage_[[education-levels]]",
        "text": "<p>The best salaries received by {{name}} workers in {{topEdLevelWageYear}} correspond to those who achieved {{top1EdLevelWageName}} (Salary{{top1EdLevelWage}} on average).</p>"
      },
      {
        "id": 523,
        "allowed": "always",
        "text": "<p>The graphic shows the {{name}} lower{{[[education-levels]]}} by gender and educational level.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "education-levels"
    ],
    "visualizations": [
      262,
      385
    ]
  },
  {
    "id": 252,
    "slug": "skills",
    "type": "TextViz",
    "ordering": 16,
    "allowed": "showSkills",
    "position": "default",
    "icon": "",
    "title": "<p>Skills</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 524,
        "allowed": "showValue_[[skills-measure]]",
        "text": "<p>Data on the critical and distinctive skills necessary for {{name}} from the Bureau of Labor Statistics. {{name}} need many skills, but most especially {{top1Skills}}, {{top2Skills}}, {{top3Skills}}.</p>"
      },
      {
        "id": 525,
        "allowed": "showRCA_[[skills-measure]]",
        "text": "<p>The revealed comparative advantage (RCA) shows that {{name}} need more than the average amount of {{top1SkillsRCA}}, {{top2SkillsRCA}}, and {{top3SkillsRCA}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [
      "skills-chart-type",
      "skills-measure"
    ],
    "visualizations": [
      263,
      281
    ]
  },
  {
    "id": 131,
    "slug": "skill",
    "type": "Grouping",
    "ordering": 17,
    "allowed": "neverShow",
    "position": "default",
    "icon": "predictive-analysis",
    "title": "<p>Skills</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 229,
        "allowed": "always",
        "text": "<p>Data on the critical and distinctive skills necessary for {{name}} from the Bureau of Labor Statistics. {{name}} need many skills, but most especially&nbsp;List{{listSkills}}. The&nbsp;revealed comparative advantage&nbsp;(RCA) shows that {{name}} need more than the average amount of&nbsp;List{{listSkillsRCA}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 132,
    "slug": "radar",
    "type": "Column",
    "ordering": 18,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Radar Distribution</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [
      "skills-measure"
    ],
    "visualizations": [
      133
    ]
  },
  {
    "id": 133,
    "slug": "bar",
    "type": "Column",
    "ordering": 19,
    "allowed": "skill1Name",
    "position": "default",
    "icon": "",
    "title": "<p>Bar Chart</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [
      "skill-bar-value-bar"
    ],
    "visualizations": [
      134
    ]
  },
  {
    "id": 134,
    "slug": "growth",
    "type": "Grouping",
    "ordering": 20,
    "allowed": "hasBLS",
    "position": "default",
    "icon": "timeline-line-chart",
    "title": "<p>Projections</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 230,
        "allowed": "always",
        "text": "<p>Projections on job growth for {{blsName}} from the Bureau of Labor Statistics. The 10-year national workforce is projected to grow Abbreviate{{jobsGrowthNation}}%, but {{blsName}} are expected to see a growth of Abbreviate{{jobsGrowth}}% over the same period. This occupation is expected to grow MoreWord{{jobsGrowthComp}} the national average.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 135,
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
        "id": 64,
        "allowed": "blsSubtitle",
        "text": "<p>{{blsSubtitle}}</p>"
      }
    ],
    "descriptions": [
      {
        "id": 231,
        "allowed": "always",
        "text": "<p>This line chart shows the projected 10-year growth in the number of jobs for {{name}}. This profession is expected to grow MoreWord{{jobsGrowthComp}} than Abbreviate{{jobsGrowthNation}}%, the average rate of national job growth.</p>"
      }
    ],
    "stats": [
      {
        "id": 245,
        "allowed": "always",
        "title": "<p>Estimated Job Growth</p>",
        "value": "<p>Abbreviate{{jobsGrowth}}%</p>",
        "subtitle": "<p>10-year Projection</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 246,
        "allowed": "always",
        "title": "<p>National Growth</p>",
        "value": "<p>Abbreviate{{jobsGrowthNation}}%</p>",
        "subtitle": "<p>10-year Projection</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      135
    ]
  }
];
