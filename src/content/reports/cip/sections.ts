// Converted from legacy canon_cms_section rows (and their subtitle/description/stat/selector/visualization children) with profile_id = 2.
// Text keeps the CMS template syntax: {{variable}}, Formatter{{variable}} and [[selector]] (rendered by src/lib/template.ts).
import type {SectionDefinition} from "@/lib/reports/types";

export const sections: SectionDefinition[] = [
  {
    "id": 63,
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
        "id": 57,
        "allowed": "stem",
        "text": "<p>{{stem}}</p>"
      }
    ],
    "descriptions": [],
    "stats": [
      {
        "id": 139,
        "allowed": "compCurrVis",
        "title": "<p>Total Degrees​{{br}}Awarded in {{compYearCurr}}</p>",
        "value": "<p>Commas{{compCurr}}</p>",
        "subtitle": "<p>{{compSubtitle}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 140,
        "allowed": "tuitionPublicStateCurr",
        "title": "<p>Median In-State​{{br}}Public Tuition</p>",
        "value": "<p>{{tuitionPublicStateCurr}}</p>",
        "subtitle": "<p>Growing{{tuitionPublicStateGrowth}} GrowthPct{{tuitionPublicStateGrowth}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 141,
        "allowed": "tuitionPrivateCurr",
        "title": "<p>Median Out-of-State​{{br}}Private Tuition</p>",
        "value": "<p>{{tuitionPrivateCurr}}</p>",
        "subtitle": "<p>{{tuitionStatSubtitle}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 136,
        "allowed": "currWage",
        "title": "<p>Average Wage</p>",
        "value": "<p>$Commas{{currWage}}</p>",
        "subtitle": "<p>Growing{{wageGrowth}} GrowthPct{{wageGrowth}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 138,
        "allowed": "currForce",
        "title": "<p>People in Workforce</p>",
        "value": "<p>AbbreviateBig{{currForce}}</p>",
        "subtitle": "<p>Growing{{forceGrowth}} GrowthPct{{forceGrowth}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 137,
        "allowed": "currAge",
        "title": "<p>Average Employee Age</p>",
        "value": "<p>Abbreviate{{currAge}}</p>",
        "subtitle": "<p>Growing{{ageGrowth}} GrowthPct{{ageGrowth}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 64,
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
        "id": 144,
        "allowed": "degreeMostCommon",
        "text": "<p>{{degreeTopLocationsText}} {{degreeTopRCAText}} The most common degree awarded to students studying {{name}} is a Lower{{degreeMostCommon}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 65,
    "slug": "institutions",
    "type": "Grouping",
    "ordering": 2,
    "allowed": "institutionsVis",
    "position": "default",
    "icon": "learning",
    "title": "<p>Institutions</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 145,
        "allowed": "always",
        "text": "<p>Information about the types of higher education institutions that grant degrees in {{name}} and the types of students that study this field. {{institutionsText}}</p>"
      },
      {
        "id": 147,
        "allowed": "tuitionPrivateCurr",
        "text": "<p>{{tuitionText}}</p>"
      },
      {
        "id": 146,
        "allowed": "always",
        "text": "<p>The most common sector, by number of institutions, that offers {{name}} programs are {{degreeTopSector}} institutions (AbbreviateBig{{degreeTopSectorValue}} total). {{topSectorText}}</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 66,
    "slug": "tmap_institutions_grads",
    "type": "TextViz",
    "ordering": 3,
    "allowed": "institutionsSubSectionVis",
    "position": "default",
    "icon": "",
    "title": "<p>Institutions</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 148,
        "allowed": "topSector",
        "text": "<p>The most common sector, by number of degrees awarded in {{name}}, is {{topSector}} (AbbreviateBig{{topSectorValue}} completions in {{topSectorYear}}).</p>"
      },
      {
        "id": 149,
        "allowed": "always",
        "text": "<p>The following chart shows the share of universities that offer {{name}} programs, by the total number of completions, colored and grouped by their sector.</p>"
      }
    ],
    "stats": [
      {
        "id": 142,
        "allowed": "degree1ByUniversity",
        "title": "<p>Institution with the Most Degrees Awarded in {{name}} ({{degree1ByUniversityYear}})</p>",
        "value": "<p>{{degree1ByUniversity}}</p>",
        "subtitle": "<p>{{degree1ByUniversityCompletions}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 143,
        "allowed": "degree2ByUniversity",
        "title": "<p>Institution with the Most Degrees Awarded in {{name}} ({{degree1ByUniversityYear}})</p>",
        "value": "<p>{{degree2ByUniversity}}</p>",
        "subtitle": "<p>{{degree2ByUniversityCompletions}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 144,
        "allowed": "degree3ByUniversity",
        "title": "<p>Institution with the Most Degrees Awarded in {{name}} ({{degree1ByUniversityYear}})</p>",
        "value": "<p>{{degree3ByUniversity}}</p>",
        "subtitle": "<p>{{degree3ByUniversityCompletions}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      72,
      282
    ]
  },
  {
    "id": 67,
    "slug": "tuition_costs",
    "type": "TextViz",
    "ordering": 4,
    "allowed": "tuitionCostsVis",
    "position": "default",
    "icon": "",
    "title": "<p>Tuition Costs for Common Institutions</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 150,
        "allowed": "degree1ByUniversity",
        "text": "<p>{{degree1ByUniversity}} has the most {{name}} degree recipients, with AbbreviateBig{{degree1ByUniversityValue}} degrees awarded in {{degree1ByUniversityYear}}.</p>"
      },
      {
        "id": 151,
        "allowed": "always",
        "text": "<p>The following bar chart shows the Lower{{[[tuition-measure-tuition_costs]]}} for the top 5 institutions with the most degrees awarded in {{name}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 145,
        "allowed": "tuitionPublicStateCurr",
        "title": "<p>Median In-State Public</p>",
        "value": "<p>{{tuitionPublicStateCurr}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 146,
        "allowed": "tuitionPrivateCurr",
        "title": "<p>Median Out of State Private</p>",
        "value": "<p>{{tuitionPrivateCurr}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "tuition-measure-tuition_costs"
    ],
    "visualizations": [
      73,
      283
    ]
  },
  {
    "id": 68,
    "slug": "institutions_most_degrees",
    "type": "TextViz",
    "ordering": 5,
    "allowed": "specializedCollegesVis",
    "position": "default",
    "icon": "",
    "title": "<p>Specialized Colleges</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 152,
        "allowed": "degree1Share",
        "text": "<p>Out of all institutions that offer {{name}} programs and have at least 5 graduates in those programs, {{degree1Share}} has the highest percentage of degrees awarded in {{name}}, with {{degree1SharePct}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 149,
        "allowed": "degree1Share",
        "title": "<p>Highest Concentration Institution</p>",
        "value": "<p>{{degree1Share}}</p>",
        "subtitle": "<p>{{degree1SharePct}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 148,
        "allowed": "degree2Share",
        "title": "<p>Highest Concentration Institution</p>",
        "value": "<p>{{degree2Share}}</p>",
        "subtitle": "<p>{{degree2SharePct}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 147,
        "allowed": "degree3Share",
        "title": "<p>Highest Concentration Institution</p>",
        "value": "<p>{{degree3Share}}</p>",
        "subtitle": "<p>{{degree3SharePct}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      285
    ]
  },
  {
    "id": 69,
    "slug": "counties_most_degrees",
    "type": "TextViz",
    "ordering": 6,
    "allowed": "degreesAwardedByCountyVis",
    "position": "default",
    "icon": "",
    "title": "<p>Degrees Awarded by County</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 153,
        "allowed": "always",
        "text": "<p>This map shows the counties in the United States colored by the highest number of degrees awarded in {{name}} by year.</p>"
      }
    ],
    "stats": [
      {
        "id": 150,
        "allowed": "degree1County",
        "title": "<p>Counties with the Most Degrees Awarded in {{name}}</p>",
        "value": "<p>{{degree1County}}</p>",
        "subtitle": "<p>{{degreesAwarded1County}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 151,
        "allowed": "degree2County",
        "title": "<p>Counties with the Most Degrees Awarded in {{name}}</p>",
        "value": "<p>{{degree2County}}</p>",
        "subtitle": "<p>{{degreesAwarded2County}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 152,
        "allowed": "degree3County",
        "title": "<p>Counties with the Most Degrees Awarded in {{name}}</p>",
        "value": "<p>{{degree3County}}</p>",
        "subtitle": "<p>{{degreesAwarded3County}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      75,
      286
    ]
  },
  {
    "id": 71,
    "slug": "employment",
    "type": "Grouping",
    "ordering": 7,
    "allowed": "currWage",
    "position": "default",
    "icon": "briefcase",
    "title": "<p>Employment</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 155,
        "allowed": "always",
        "text": "<p>Information on the businesses and industries that employ {{parentName}} graduates and on wages and locations for those in the field.</p>"
      },
      {
        "id": 156,
        "allowed": "always",
        "text": "<p>The average salary for {{parentName}} majors is Salary{{currWage}} and the most common occupations are List{{commonOccupationPUMSnames}}.</p>"
      },
      {
        "id": 157,
        "allowed": "always",
        "text": "<p>The industry that employs the most {{parentName}} majors is {{industryTopEmployment}}, though the highest paying industry, by average wage, is {{payingIndustryTop}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 72,
    "slug": "top_income",
    "type": "TextViz",
    "ordering": 8,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Yearly Income for Common Jobs</p>",
    "short": "",
    "subtitles": [
      {
        "id": 22,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 159,
        "allowed": "always",
        "text": "<p>The average salary for {{parentName}} majors is Salary{{currWage}} and the most common occupations are List{{commonOccupationPUMSnames}}.</p>"
      },
      {
        "id": 158,
        "allowed": "always",
        "text": "<p>This chart shows the average annual salaries of the most common occupations for {{parentName}} majors.</p>"
      }
    ],
    "stats": [
      {
        "id": 156,
        "allowed": "always",
        "title": "<p>Average Wage in Workforce</p>",
        "value": "<p>$Commas{{currWage}}</p>",
        "subtitle": "<p><span style=\"color: rgb(239, 97, 69);\">± </span>$Commas{{currWageMOE}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 157,
        "allowed": "always",
        "title": "<p>1 Year Growth</p>",
        "value": "<p>GrowthPct{{wageGrowth}}</p>",
        "subtitle": "<p><span style=\"color: rgb(239, 97, 69);\">± </span>GrowthPct{{wageMOEGrowth}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      77,
      342
    ]
  },
  {
    "id": 73,
    "slug": "locations",
    "type": "TextViz",
    "ordering": 9,
    "allowed": "locationHighestPayingPUMA1",
    "position": "default",
    "icon": "",
    "title": "<p>Highest Paying Locations</p>",
    "short": "",
    "subtitles": [
      {
        "id": 23,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 160,
        "allowed": "always",
        "text": "<p>This map shows the public use micro areas (PUMAs) in the United States colored by the average salary of {{parentName}} majors.</p>"
      },
      {
        "id": 161,
        "allowed": "always",
        "text": "<p>Note that the census collects information tied to where people live, not where they work. It is possible that {{parentName}} majors live and work in the same place, but it is also possible that they live and work in two different places.</p>"
      }
    ],
    "stats": [
      {
        "id": 158,
        "allowed": "always",
        "title": "<p>Highest Paying Pumas</p>",
        "value": "<p>{{locationHighestPayingPUMA1}}</p>",
        "subtitle": "<p>{{locationHighestPayingPUMA1AvgWage}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 159,
        "allowed": "locationHighestPayingPUMA2",
        "title": "<p>Highest Paying Pumas</p>",
        "value": "<p>{{locationHighestPayingPUMA2}}</p>",
        "subtitle": "<p>{{locationHighestPayingPUMA2AvgWage}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 160,
        "allowed": "locationHighestPayingPUMA3",
        "title": "<p>Highest Paying Pumas</p>",
        "value": "<p>{{locationHighestPayingPUMA3}}</p>",
        "subtitle": "<p>{{locationHighestPayingPUMA3AvgWage}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      343
    ]
  },
  {
    "id": 74,
    "slug": "top_occ_num_emp",
    "type": "Column",
    "ordering": 10,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Most Common</p>",
    "short": "",
    "subtitles": [
      {
        "id": 24,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 162,
        "allowed": "always",
        "text": "<p>The most common occupations for {{parentName}} majors, by number of employees, are List{{commonOccupationPUMSnames}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      344,
      345
    ]
  },
  {
    "id": 75,
    "slug": "top_occ_rca",
    "type": "Column",
    "ordering": 11,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Most Specialized</p>",
    "short": "",
    "subtitles": [
      {
        "id": 25,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 163,
        "allowed": "always",
        "text": "<p>Compared to other majors, there are an unusually high number of {{parentName}} majors working as List{{occupationSpecializedTop3}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      391,
      393
    ]
  },
  {
    "id": 76,
    "slug": "top_occ_wage",
    "type": "Column",
    "ordering": 12,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Highest Paid</p>",
    "short": "",
    "subtitles": [
      {
        "id": 26,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 164,
        "allowed": "always",
        "text": "<p>The highest paid occupations by median income for {{parentName}} majors are List{{payingOccupationPUMSnames}}. </p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      83,
      84
    ]
  },
  {
    "id": 77,
    "slug": "tmap_occ_num_emp_degree",
    "type": "TextViz",
    "ordering": 13,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Occupations by Share</p>",
    "short": "",
    "subtitles": [
      {
        "id": 27,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 165,
        "allowed": "always",
        "text": "<p>The number of {{parentName}} graduates in the workforce has been Growing{{forceGrowth}} at a rate of GrowthPct{{forceGrowth}}, from AbbreviateBig{{prevForce}} in {{prevForceYear}} to AbbreviateBig{{currForce}} in {{currForceYear}}.</p>"
      },
      {
        "id": 166,
        "allowed": "always",
        "text": "<p>The largest single share of {{parentName}} graduates go on to work as {{commonOccupationTopName}} (GrowthPct{{commonOccupationTopShare}}). This chart shows the various jobs filled by those with a major in {{parentName}} by share of the total number of graduates.</p>"
      }
    ],
    "stats": [
      {
        "id": 162,
        "allowed": "always",
        "title": "<p>{{currForceYear}} Workforce</p>",
        "value": "<p>AbbreviateBig{{currForce}}</p>",
        "subtitle": "<p>± AbbreviateBig{{currForceMOE}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 161,
        "allowed": "always",
        "title": "<p>1 Year Growth</p>",
        "value": "<p>GrowthPct{{forceGrowth}}</p>",
        "subtitle": "<p>± GrowthPct{{forceMOEGrowth}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      85,
      394
    ]
  },
  {
    "id": 78,
    "slug": "top_ind_num_emp",
    "type": "Column",
    "ordering": 14,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Most Common</p>",
    "short": "",
    "subtitles": [
      {
        "id": 28,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 167,
        "allowed": "always",
        "text": "<p>The most common industries that employ {{parentName}} majors, by number of employees, are List{{commonIndustryNamesTop3}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      86,
      87,
      396,
      397
    ]
  },
  {
    "id": 79,
    "slug": "top_ind_wage",
    "type": "Column",
    "ordering": 15,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Highest Paid</p>",
    "short": "",
    "subtitles": [
      {
        "id": 29,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 168,
        "allowed": "always",
        "text": "<p>The highest paying industries of {{parentName}} majors, by average wage, are List{{payingIndustryNamesTop3}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      89,
      88,
      398,
      399
    ]
  },
  {
    "id": 80,
    "slug": "tmap_ind_num_emp",
    "type": "TextViz",
    "ordering": 16,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Industries by Share</p>",
    "short": "",
    "subtitles": [
      {
        "id": 30,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 169,
        "allowed": "always",
        "text": "<p>The number of {{parentName}} graduates in the workforce has been growing at a rate of GrowthPct{{forceGrowth}}, from AbbreviateBig{{prevForce}} in {{prevForceYear}} to AbbreviateBig{{currForce}} in {{currForceYear}}.</p>"
      },
      {
        "id": 170,
        "allowed": "always",
        "text": "<p>The industry which employs the most {{parentName}} graduates by share is {{commonIndustryNameTop1}}, followed by {{commonIndustryNameTop2}}. This visualization shows the industries that hire those who major in {{parentName}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 163,
        "allowed": "always",
        "title": "<p>{{currForceYear}} Workforce</p>",
        "value": "<p>AbbreviateBig{{currForce}}</p>",
        "subtitle": "<p>± AbbreviateBig{{currForceMOE}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 164,
        "allowed": "always",
        "title": "<p>1 Year Growth</p>",
        "value": "<p>GrowthPct{{forceGrowth}}</p>",
        "subtitle": "<p>± GrowthPct{{forceMOEGrowth}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      90,
      400
    ]
  },
  {
    "id": 81,
    "slug": "ind_geo_map",
    "type": "TextViz",
    "ordering": 17,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Specialty Locations</p>",
    "short": "",
    "subtitles": [
      {
        "id": 31,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 171,
        "allowed": "always",
        "text": "<p>This map shows the public use micro areas (PUMAs) in the United States where there are a relatively high population of {{parentName}} majors.</p>"
      },
      {
        "id": 172,
        "allowed": "always",
        "text": "<p>Note that the census collects information tied to where people live, not where they work. It is possible that {{parentName}} majors live and work in the same place, but it is also possible that they live and work in two different places.</p>"
      }
    ],
    "stats": [
      {
        "id": 165,
        "allowed": "location1NameRCA",
        "title": "<p>PUMAS with a relatively high number of {{parentName}} majors</p>",
        "value": "<p>{{location1NameRCA}}</p>",
        "subtitle": "<p>{{location1NameRCAScore}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 167,
        "allowed": "location2NameRCA",
        "title": "<p>PUMAS with a relatively high number of {{parentName}} majors</p>",
        "value": "<p>{{location2NameRCA}}</p>",
        "subtitle": "<p>{{location2NameRCAScore}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 166,
        "allowed": "location3NameRCA",
        "title": "<p>PUMAS with a relatively high number of {{parentName}} majors</p>",
        "value": "<p>{{location3NameRCA}}</p>",
        "subtitle": "<p>{{location3NameRCAScore}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      404
    ]
  },
  {
    "id": 82,
    "slug": "demographics",
    "type": "Grouping",
    "ordering": 18,
    "allowed": "always",
    "position": "default",
    "icon": "geosearch",
    "title": "<p>Diversity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 173,
        "allowed": "always",
        "text": "<p>Demographic information for those who earn a degree in {{parentName}} in the United States.</p>"
      },
      {
        "id": 376,
        "allowed": "currAge",
        "text": "<p>The average age of a person in the workforce with a degree in {{parentName}} is Abbreviate{{currAge}}.</p>"
      },
      {
        "id": 377,
        "allowed": "always",
        "text": "<p>{{degreesAwardedText}} {{diversityText}}</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 83,
    "slug": "workforce_age",
    "type": "TextViz",
    "ordering": 19,
    "allowed": "currAge",
    "position": "default",
    "icon": "",
    "title": "<p>Workforce Age</p>",
    "short": "",
    "subtitles": [
      {
        "id": 32,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 174,
        "allowed": "always",
        "text": "<p>This chart shows distribution of ages for employees with a degree in {{parentName}}. The most common ages of employees with this major are {{currCommonAge1}} and {{currCommonAge2}} years old, which represent Abbreviate{{currCommonAge1Pct}}% and Abbreviate{{currCommonAge2Pct}}% of the population, respectively.</p>"
      }
    ],
    "stats": [
      {
        "id": 168,
        "allowed": "always",
        "title": "<p>Average Age in {{currForceYear}}</p>",
        "value": "<p>Abbreviate{{currAge}}</p>",
        "subtitle": "<p>± Abbreviate{{currAgeMOE}} Years</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 169,
        "allowed": "always",
        "title": "<p>1 Year Change</p>",
        "value": "<p>GrowthPct{{ageGrowth}}</p>",
        "subtitle": "<p>± GrowthPct{{ageMOEGrowth}}</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      92,
      405
    ]
  },
  {
    "id": 84,
    "slug": "degree_obtainment",
    "type": "Column",
    "ordering": 20,
    "allowed": "degreesAwardedVis",
    "position": "default",
    "icon": "",
    "title": "<p>Degrees Awarded</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 175,
        "allowed": "always",
        "text": "<p>The most common degree types awarded to students graduating in {{name}} are List{{degreeMostCommonTop3}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      93,
      287
    ]
  },
  {
    "id": 85,
    "slug": "degree_workforce",
    "type": "Column",
    "ordering": 21,
    "allowed": "degreeMostCommonTop3PUMS",
    "position": "default",
    "icon": "",
    "title": "<p>Workforce Degrees</p>",
    "short": "",
    "subtitles": [
      {
        "id": 33,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 176,
        "allowed": "always",
        "text": "<p>The most common degree types held by the working population in {{parentName}} are List{{degreeMostCommonTop3PUMS}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      94,
      406
    ]
  },
  {
    "id": 86,
    "slug": "enrolled_sex",
    "type": "TextViz",
    "ordering": 22,
    "allowed": "gradsGenderTopRatio",
    "position": "default",
    "icon": "",
    "title": "<p>Sex Imbalance for Common Institutions</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 177,
        "allowed": "always",
        "text": "<p>This chart shows the granted degrees by sex at the {{degreeUniversityCount}} institutions that graduate the most students in {{name}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 170,
        "allowed": "always",
        "title": "<p>Most Common Sex with a Degree in this Field</p>",
        "value": "<p>{{gradsGenderTop}} (Abbreviate{{gradsGenderTopRatio}}%)</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      95
    ]
  },
  {
    "id": 87,
    "slug": "ethnicity_degrees",
    "type": "TextViz",
    "ordering": 23,
    "allowed": "raceEthnicityByDegreesVis",
    "position": "default",
    "icon": "",
    "title": "<p>Race &amp; Ethnicity by Degrees Awarded</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 178,
        "allowed": "always",
        "text": "<p>This chart shows the number of degrees awarded in {{name}} for each race &amp; ethnicity.</p>\n<p>In {{[[degrees]]RaceYear1}}, {{[[degrees]]RaceName1}} students earned the largest share of the degrees with this major.</p>"
      }
    ],
    "stats": [
      {
        "id": 173,
        "allowed": "[[degrees]]RaceVisible1",
        "title": "<p>Most Common Race or Ethnicity</p>",
        "value": "<p>{{[[degrees]]RaceName1}}</p>",
        "subtitle": "<p>commas{{[[degrees]]RaceValue1}} degrees awarded in {{[[degrees]]RaceYear1}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 171,
        "allowed": "[[degrees]]RaceVisible2",
        "title": "<p>Most Common Race or Ethnicity</p>",
        "value": "<p>{{[[degrees]]RaceName2}}</p>",
        "subtitle": "<p>commas{{[[degrees]]RaceValue2}} degrees awarded in {{[[degrees]]RaceYear2}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 172,
        "allowed": "[[degrees]]RaceVisible3",
        "title": "<p>Most Common Race or Ethnicity</p>",
        "value": "<p>{{[[degrees]]RaceName3}}</p>",
        "subtitle": "<p>commas{{[[degrees]]RaceValue3}} degrees awarded in {{[[degrees]]RaceYear3}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "degrees"
    ],
    "visualizations": [
      288
    ]
  },
  {
    "id": 88,
    "slug": "grads_ethnicity_sex",
    "type": "TextViz",
    "ordering": 24,
    "allowed": "raceEthnicityBySex",
    "position": "default",
    "icon": "",
    "title": "<p>Race &amp; Ethnicity by Sex</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 179,
        "allowed": "always",
        "text": "<p>This chart illustrates the differences by sex for each race &amp; ethnicity of {{[[degree-grads_ethnicity_gender]]}} recipients in {{name}}.</p>"
      },
      {
        "id": 542,
        "allowed": "degree7RG1Viz",
        "text": "<p>{{[[degree-grads_ethnicity_gender]]RG1Name}} students, who earn most of the degrees in this field, are the most common combination of race/ethnicity and sex.</p>"
      }
    ],
    "stats": [
      {
        "id": 176,
        "allowed": "degree7RG1Viz",
        "title": "<p>Most Common Race/Ethnicity and Sex Combination</p>",
        "value": "<p>{{[[degree-grads_ethnicity_gender]]RG1Name}}</p>",
        "subtitle": "<p>Commas{{[[degree-grads_ethnicity_gender]]RG1Value}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 174,
        "allowed": "degree7RG2Viz",
        "title": "<p>Most Common Race/Ethnicity and Sex Combination</p>",
        "value": "<p>{{[[degree-grads_ethnicity_gender]]RG2Name}}</p>",
        "subtitle": "<p>Commas{{[[degree-grads_ethnicity_gender]]RG2Value}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 175,
        "allowed": "degree7RG3Viz",
        "title": "<p>Most Common Race/Ethnicity and Sex Combination</p>",
        "value": "<p>{{[[degree-grads_ethnicity_gender]]RG3Name}}</p>",
        "subtitle": "<p>Commas{{[[degree-grads_ethnicity_gender]]RG3Value}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "degree-grads_ethnicity_gender"
    ],
    "visualizations": [
      289
    ]
  },
  {
    "id": 89,
    "slug": "global_diversity",
    "type": "TextViz",
    "ordering": 25,
    "allowed": "degreeCommonCountry1",
    "position": "default",
    "icon": "",
    "title": "<p>Global Diversity</p>",
    "short": "",
    "subtitles": [
      {
        "id": 34,
        "allowed": "isNotCIP2",
        "text": "<p>The closest comparable data for the {{digitCIP}} Digit Course {{name}} is from the 2 Digit Course {{parentName}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 180,
        "allowed": "always",
        "text": "<p>There are a relatively high number of people that were born in {{degreeCommonCountry1RCA}} that hold {{parentName}} degrees (Abbreviate{{degreeCommonCountry1RCAValue}} times more than expected), and the most common country of origin by total numbers for non-US students earning a degree in this field is {{degreeCommonCountry1}} (AbbreviateBig{{degreeCommonCountry1Value}} degree recipients).</p>"
      }
    ],
    "stats": [
      {
        "id": 179,
        "allowed": "always",
        "title": "<p>Most Common Countries of Origin</p>",
        "value": "<p>{{degreeCommonCountry1}}</p>",
        "subtitle": "<p>AbbreviateBig{{degreeCommonCountry1Value}} degree recipients</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 180,
        "allowed": "degreeCommonCountry2",
        "title": "<p>Most Common Countries of Origin</p>",
        "value": "<p>{{degreeCommonCountry2}}</p>",
        "subtitle": "<p>AbbreviateBig{{degreeCommonCountry2Value}} degree recipients</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 177,
        "allowed": "degreeCommonCountry3",
        "title": "<p>Most Common Countries of Origin</p>",
        "value": "<p>{{degreeCommonCountry3}}</p>",
        "subtitle": "<p>AbbreviateBig{{degreeCommonCountry3Value}} degree recipients</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 178,
        "allowed": "always",
        "title": "<p>High Relative Number of Students</p>",
        "value": "<p>{{degreeCommonCountry1RCA}}</p>",
        "subtitle": "<p>Abbreviate{{degreeCommonCountry1RCAValue}} times more than expected</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 181,
        "allowed": "degreeCommonCountry2RCA",
        "title": "<p>High Relative Number of Students</p>",
        "value": "<p>{{degreeCommonCountry2RCA}}</p>",
        "subtitle": "<p>Abbreviate{{degreeCommonCountry2RCAValue}} times more than expected</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 182,
        "allowed": "degreeCommonCountry3RCA",
        "title": "<p>High Relative Number of Students</p>",
        "value": "<p>{{degreeCommonCountry3RCA}}</p>",
        "subtitle": "<p>Abbreviate{{degreeCommonCountry3RCAValue}} times more than expected</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "birthplace-measure-global_diversity"
    ],
    "visualizations": [
      98,
      407
    ]
  },
  {
    "id": 90,
    "slug": "skills",
    "type": "Grouping",
    "ordering": 26,
    "allowed": "skillsTop1",
    "position": "default",
    "icon": "predictive-analysis",
    "title": "<p>Skills</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 181,
        "allowed": "always",
        "text": "<p>Data on the critical and distinctive skills necessary for those working in the {{name}} field from the Bureau of Labor Statistics. {{name}} majors need many skills, but most especially {{skillsTop1}}. The revealed comparative advantage (RCA) shows that {{name}} majors need more than the average amount of List{{skillsRCATop3}}.</p>"
      },
      {
        "id": 182,
        "allowed": "always",
        "text": "<p>These two visualizations, one a radial chart and one a bar chart, show the same information, a rating of how necessary the following skills are for {{name}} majors. Toggle between \"value\" and \"RCA\" to see the absolute rating of that skill (value) and the revealed comparative advantage (RCA), or how much greater or lesser that skill's rating is than the average. The longer the bar or the closer the line comes to the circumference of the circle, the more important that skill is. The importance of {{skillsRCATop1}} is very distinctive for majors, but the List{{skillsTop3}} are the three most important skills for people in the field.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 91,
    "slug": "radar",
    "type": "Column",
    "ordering": 27,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Radar Distribution</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [],
    "stats": [],
    "selectors": [
      "skill-radar-value-radar"
    ],
    "visualizations": [
      99,
      275
    ]
  },
  {
    "id": 92,
    "slug": "bar",
    "type": "Column",
    "ordering": 28,
    "allowed": "always",
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
      100,
      280
    ]
  }
];
