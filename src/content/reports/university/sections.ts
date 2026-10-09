// Converted from legacy canon_cms_section rows (and their subtitle/description/stat/selector/visualization children) with profile_id = 5.
// Text keeps the CMS template syntax: {{variable}}, Formatter{{variable}} and [[selector]] (rendered by src/lib/template.ts).
import type {SectionDefinition} from "@/lib/reports/types";

export const sections: SectionDefinition[] = [
  {
    "id": 136,
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
        "id": 63,
        "allowed": "url",
        "text": "<p>{{urlLink}}</p>"
      }
    ],
    "descriptions": [],
    "stats": [
      {
        "id": 252,
        "allowed": "tuitionCostCurr",
        "title": "<p>{{tuitionYearCurr}} Undergraduate Tuition</p>",
        "value": "<p>$Commas{{tuitionCostCurr}}</p>",
        "subtitle": "<p>{{tuitionGrowthSub}}</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 251,
        "allowed": "aidNetPrice",
        "title": "<p>{{aidNetPriceYearCurr}} Average Net Price</p>",
        "value": "<p>$Commas{{aidNetPrice}}</p>",
        "subtitle": "<p>After Financial Aid</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 250,
        "allowed": "showDefaultRate",
        "title": "<p>{{defaultYearCurr}} Default Rate</p>",
        "value": "<p>Abbreviate{{defaultRate}}%</p>",
        "subtitle": "<p>on Student Loans</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 249,
        "allowed": "acceptanceRate",
        "title": "<p>{{applicantsYearCurr}} Acceptance Rate</p>",
        "value": "<p>GrowthPct{{acceptanceRate}}</p>",
        "subtitle": "<p>Commas{{applicantsTotal}} Applicants</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 247,
        "allowed": "enrollmentTotal",
        "title": "<p>{{enrollmentYearCurr}} Enrolled Students</p>",
        "value": "<p>Commas{{enrollmentTotal}}</p>",
        "subtitle": "<p>GrowthPct{{enrollmentFTPercent}} Full-Time</p>",
        "tooltip": "New Tooltip"
      },
      {
        "id": 248,
        "allowed": "gradRatePercent",
        "title": "<p>{{gradRateYearCurr}} Graduation Rate</p>",
        "value": "<p>GrowthPct{{gradRatePercent}}</p>",
        "subtitle": "<p>Commas{{gradRateCount}} Graduates</p>",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 137,
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
        "id": 543,
        "allowed": "aboutParagraph1Vis",
        "text": "<p>{{name}} is a higher education institution located in {{nameCounty}}. {{mostCommonDegreesText}}</p>"
      },
      {
        "id": 235,
        "allowed": "isHiddenUniversity",
        "text": "<p>{{name}} is a Carnegie Classification grouping of higher education institutions. In {{latestYearDegrees}}, the most popular Bachelor's Degree concentrations at {{name}} were List{{degreeCommonTop3}}.</p>"
      },
      {
        "id": 236,
        "allowed": "aboutParagraph3Vis",
        "text": "<p>In {{gradsYearCurr}}, Commas{{gradsTotal}} degrees were awarded across all undergraduate and graduate programs at {{name}}. GrowthPct{{gradsFemalePercent}} of these degrees were awarded to women, and GrowthPct{{gradsMalePercent}} awarded men. {{gradsRaceAboutText}}</p>"
      },
      {
        "id": 233,
        "allowed": "isUniversityWithTuition",
        "text": "<p>{{aboutTuitionText}}</p>"
      },
      {
        "id": 232,
        "allowed": "isHiddenUniversityWithTuition",
        "text": "<p>The median undergraduate tuition at {{name}} is $Commas{{tuitionCostCurr}}, which is $Commas{{districtTuitionDiffAbs}} MoreWord{{districtTuitionDiff}} than the national median of $Commas{{districtTuitionNation}}. The cost of out-of-state tuition is $Commas{{outOfStateTuition}}, which is Abbreviate{{costInStateOutState}}% of the cost for in-state students, and is $Commas{{outOfStateTuitionDiffAbs}} MoreWord{{outOfStateTuitionDiff}} than the national median $Commas{{outOfStateTuitionNation}}.</p>"
      },
      {
        "id": 555,
        "allowed": "showDefaultRate",
        "text": "<p>In {{defaultYearCurr}} the default rate for borrower's at {{name}} was Abbreviate{{defaultRate}}%, corresponding to {{defaultCount}} out of the commas{{defaultTotal}} total borrowers.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      136
    ]
  },
  {
    "id": 138,
    "slug": "costs",
    "type": "Grouping",
    "ordering": 2,
    "allowed": "costsVis",
    "position": "default",
    "icon": "dollar",
    "title": "<p>Costs</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 239,
        "allowed": "isUniversityWithTuition",
        "text": "<p>{{tuitionText}}</p>"
      },
      {
        "id": 240,
        "allowed": "isHiddenUniversity",
        "text": "<p>The median in-state tuition for {{name}} is $Commas{{tuitionCostCurr}}, which is $Commas{{inStateTuitionDiffAbs}} MoreWord{{inStateTuitionDiff}} than the national median in-state tuition of $Commas{{inStateTuitionNation}}. The cost of out-of-state tuition is $Commas{{outOfStateTuition}}, which is Abbreviate{{costInStateOutState}}% of the cost for in-state students, and is $Commas{{outOfStateTuitionDiffAbs}} MoreWord{{outOfStateTuitionDiff}} than the national median out-of-state tuition of $Commas{{outOfStateTuitionNation}}.</p>"
      },
      {
        "id": 237,
        "allowed": "aidNetPrice",
        "text": "<p>After taking grants and loans into account, the average net price for students is $Commas{{aidNetPrice}}.</p>"
      },
      {
        "id": 238,
        "allowed": "isUniversityAidVis",
        "text": "<p>{{aidGrantLoanText}}</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 139,
    "slug": "tuition",
    "type": "TextViz",
    "ordering": 3,
    "allowed": "tuitionCostsVis",
    "position": "default",
    "icon": "",
    "title": "<p>Tuition Costs</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 241,
        "allowed": "isUniversity",
        "text": "<p>In {{tuitionYearCurr}}, the cost of tuition at {{name}} was $Commas{{tuitionCostCurr}}. {{tuitionCostsText}}</p>"
      },
      {
        "id": 242,
        "allowed": "isHiddenUniversity",
        "text": "<p>In {{tuitionYearCurr}}, the cost of out-of-state tuition at {{name}} was $Commas{{outOfStateTuition}}, which is Abbreviate{{costInStateOutState}}% of the cost for in-state students, which was $Commas{{inStateTuition}}. The cost of out-of-state tuition at {{name}} is $Commas{{outOfStateTuitionDiffAbs}} MoreWord{{outOfStateTuitionDiffAbs}} than the overall (public and private) national median of $Commas{{outOfStateTuitionNation}}, and the in-state tuition is $Commas{{inStateTuitionDiffAbs}} MoreWord{{inStateTuitionDiffAbs}} than the overall (public and private) national median $Commas{{inStateTuitionNation}}.</p>"
      },
      {
        "id": 243,
        "allowed": "always",
        "text": "<p>This chart compares the tuition costs of {{name}} (in red) with those of other similar universities.</p>"
      }
    ],
    "stats": [
      {
        "id": 253,
        "allowed": "always",
        "title": "<p>{{tuitionYearCurr}} Undergraduate Tuition</p>",
        "value": "<p>$Commas{{tuitionCostCurr}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      290,
      297
    ]
  },
  {
    "id": 140,
    "slug": "netprice",
    "type": "TextViz",
    "ordering": 4,
    "allowed": "aidVis",
    "position": "default",
    "icon": "",
    "title": "<p>Average Net Price</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 246,
        "allowed": "aidNetPrice",
        "text": "<p>In {{aidNetPriceYearCurr}} {{name}} had an average net price — the price paid after factoring in grants and loans — of $Commas{{aidNetPrice}}. {{aidNetPriceGrowthText}}</p>"
      },
      {
        "id": 245,
        "allowed": "always",
        "text": "<p>This chart compares the average net price of {{name}} (in red) with that of other similar universities.</p>"
      },
      {
        "id": 244,
        "allowed": "always",
        "text": "<p>Average net price is calculated from full-time beginning undergraduate students who were awarded a grant or scholarship from federal, state or local governments, or the institution.</p>"
      }
    ],
    "stats": [
      {
        "id": 254,
        "allowed": "aidNetPrice",
        "title": "<p>{{aidNetPriceYearCurr}} Value</p>",
        "value": "<p>$Commas{{aidNetPrice}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 255,
        "allowed": "aidNetPriceGrowth",
        "title": "<p>1 Year Growth</p>",
        "value": "<p>GrowthPct{{aidNetPriceGrowth}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      298,
      299
    ]
  },
  {
    "id": 141,
    "slug": "other_expenses",
    "type": "TextViz",
    "ordering": 5,
    "allowed": "roomCostGrowth",
    "position": "default",
    "icon": "",
    "title": "<p>Other Student Expenses</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 247,
        "allowed": "always",
        "text": "<p>The average yearly cost of room and board at {{name}} was of $Commas{{roomCostCurr}} in {{roomYearCurr}}. The cost of room and board {{roomCostSentence}} between {{roomYearPrev}} and {{roomYearCurr}}.</p>"
      },
      {
        "id": 545,
        "allowed": "tuitionBooksCurr",
        "text": "<p>During the same period, the average yearly cost of books and supplies was $Commas{{tuitionBooksCurr}}. The cost of books and supplies {{tuitionBooksSentence}} during the same period.</p>"
      },
      {
        "id": 248,
        "allowed": "always",
        "text": "<p>This chart compares the average student costs at {{name}} (in red) with that of similar universities.</p>"
      }
    ],
    "stats": [
      {
        "id": 256,
        "allowed": "roomCostCurr",
        "title": "<p>Room and Board</p>",
        "value": "<p>$Commas{{roomCostCurr}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 257,
        "allowed": "tuitionBooksCurr",
        "title": "<p>Books and Supplies</p>",
        "value": "<p>$Commas{{tuitionBooksCurr}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      300
    ]
  },
  {
    "id": 142,
    "slug": "incomeawards",
    "type": "TextViz",
    "ordering": 6,
    "allowed": "visibleFinancialAidSection",
    "position": "default",
    "icon": "",
    "title": "<p>Financial Aid by Income Level</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 249,
        "allowed": "always",
        "text": "<p>{{aidGrantPercent}}% of undergraduate students at {{name}} received financial aid through grants or loans in {{aidGrantYearCurr}}. {{aidGrantText}}</p>"
      },
      {
        "id": 250,
        "allowed": "always",
        "text": "<p>This chart compares the average award discount at {{name}} (in red) with that of other similar universities.</p>"
      },
      {
        "id": 251,
        "allowed": "always",
        "text": "<p>The average award discount is the ratio between the average grant or scholarship value, and the cost, which is the sum of out-of-state tuition, room, board, book, supplies, and other expenses.</p>"
      }
    ],
    "stats": [
      {
        "id": 258,
        "allowed": "aidGrantPercent",
        "title": "<p>Undergraduates Receiving Financial Aid through Grants</p>",
        "value": "<p>{{aidGrantPercent}}%</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 259,
        "allowed": "aidLoanPercent",
        "title": "<p>Undergraduates Receiving Financial Aid through Loans</p>",
        "value": "<p>{{aidLoanPercent}}%</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      301,
      302
    ]
  },
  {
    "id": 143,
    "slug": "default_rate",
    "type": "TextViz",
    "ordering": 7,
    "allowed": "defaultRate",
    "position": "default",
    "icon": "",
    "title": "<p>Student Loan Default Rate</p>",
    "short": "",
    "subtitles": [
      {
        "id": 42,
        "allowed": "always",
        "text": "<p>Cohort default rates only account for borrowers who default in the first three years, and some schools only have a small proportion of borrowers entering repayment. These rates should be interpreted with caution, as they may not be reflective of the entire school population.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 253,
        "allowed": "always",
        "text": "<p>In {{defaultYearCurr}} the default rate for borrower's at {{name}} was Abbreviate{{defaultRate}}%, which represents {{defaultCount}} out of the {{defaultTotal}} total borrowers.</p>"
      },
      {
        "id": 252,
        "allowed": "always",
        "text": "<p>A cohort default rate is the percentage of a school's borrowers who enter repayment on certain Federal Family Education Loan (FFEL) Program or William D. Ford Federal Direct Loan (Direct Loan) Program loans during a particular federal fiscal year (FY), October 1 to September 30, and default or meet other specified conditions prior to the end of the second following fiscal year.</p>"
      }
    ],
    "stats": [
      {
        "id": 260,
        "allowed": "always",
        "title": "<p>{{defaultYearCurr}} Default Rate</p>",
        "value": "<p>Abbreviate{{defaultRate}}%</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 261,
        "allowed": "always",
        "title": "<p>Number of Defaults</p>",
        "value": "<p>{{defaultCount}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      144
    ]
  },
  {
    "id": 144,
    "slug": "admissions",
    "type": "Grouping",
    "ordering": 8,
    "allowed": "admissionsVis",
    "position": "default",
    "icon": "predictive-analysis",
    "title": "<p>Admissions</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 254,
        "allowed": "applicantsNoDataVis",
        "text": "<p>{{name}} received Commas{{applicantsTotal}} undergraduate applications in {{applicantsYearCurr}}, which represents a GrowthPct{{applicantsTotalGrowth}} annual GrowthWord{{applicantsTotalGrowth}}. Out of those Commas{{applicantsTotal}} applicants, Commas{{admissionsTotal}} {{admissionsTotalWord}} accepted for enrollment, representing a Abbreviate{{acceptanceRate}}% acceptance rate.</p>"
      },
      {
        "id": 549,
        "allowed": "applicantsNoDataVis_",
        "text": "<p>{{name}} received Commas{{applicantsTotal}} undergraduate applications in {{applicantsYearCurr}}.</p>"
      },
      {
        "id": 255,
        "allowed": "always",
        "text": "<p>There were Commas{{enrollmentTotal}} students enrolled at {{name}} in {{enrollmentYearCurr}}. {{applicantsWithSATText}}</p>"
      },
      {
        "id": 256,
        "allowed": "enrollmentYield",
        "text": "<p>{{name}} has an overall enrollment yield of Abbreviate{{enrollmentYield}}%, which represents the number of admitted students who ended up enrolling.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 145,
    "slug": "acceptance",
    "type": "TextViz",
    "ordering": 9,
    "allowed": "always",
    "position": "default",
    "icon": "",
    "title": "<p>Acceptance Rate</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 258,
        "allowed": "admissionsTextVis2Years",
        "text": "<p>In {{applicantsYearCurr}}, the undergraduate acceptance rate of {{name}} was Abbreviate{{acceptanceRate}}% (Commas{{admissionsTotal}} admissions from Commas{{applicantsTotal}} applications). This is HighWord{{acceptanceRateDiff}} the acceptance rate of {{applicantsYearPrev}}, which was Abbreviate{{acceptanceRatePrev}}%. {{applicantsAndAdmissionsText}}</p>"
      },
      {
        "id": 550,
        "allowed": "admissionsTextVisCurrYear",
        "text": "<p>In {{applicantsYearCurr}}, the undergraduate acceptance rate of {{name}} was Abbreviate{{acceptanceRate}}% (Commas{{admissionsTotal}} admissions from Commas{{applicantsTotal}} applications). {{applicantsAndAdmissionsText}}</p>"
      },
      {
        "id": 257,
        "allowed": "always",
        "text": "<p>This chart compares the acceptance rate of {{name}} (in red) with that of other similar universities, and the chart below shows the acceptance rate by gender.</p>"
      }
    ],
    "stats": [
      {
        "id": 262,
        "allowed": "acceptanceRateVis",
        "title": "<p>Acceptance Rate in {{applicantsYearCurr}}</p>",
        "value": "<p>Abbreviate{{acceptanceRate}}%</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 263,
        "allowed": "admissionsTotalVis",
        "title": "<p>Accepted Out of Commas{{applicantsTotal}}</p>",
        "value": "<p>Commas{{admissionsTotal}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      303,
      304,
      305
    ]
  },
  {
    "id": 146,
    "slug": "sat",
    "type": "TextViz",
    "ordering": 10,
    "allowed": "satAdmissions",
    "position": "default",
    "icon": "",
    "title": "<p>SAT Scores</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 259,
        "allowed": "always",
        "text": "<p>Abbreviate{{applicantsWithSAT}}% of enrolled first-time students at {{name}} in {{applicantsWithSATYear}} submitted SAT scores with their applications.</p>"
      },
      {
        "id": 260,
        "allowed": "always",
        "text": "<p>The following chart shows the average SAT scores for the 25th, 50th, and 75th percentile of applicants for each section of the test that they are evaluated on.</p>"
      }
    ],
    "stats": [
      {
        "id": 264,
        "allowed": "applicantsWithSAT",
        "title": "<p>Submission Percentage ({{applicantsWithSATYear}})</p>",
        "value": "<p>Abbreviate{{applicantsWithSAT}}%</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 265,
        "allowed": "applicantsWithSATCount",
        "title": "<p>Scores Submitted ({{applicantsWithSATYear}})</p>",
        "value": "<p>Commas{{applicantsWithSATCount}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      307
    ]
  },
  {
    "id": 147,
    "slug": "enrollment",
    "type": "Grouping",
    "ordering": 11,
    "allowed": "enrollmentsVis",
    "position": "default",
    "icon": "book",
    "title": "<p>Enrollment</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 261,
        "allowed": "always",
        "text": "<p>{{name}} had a total enrollment of Commas{{enrollmentTotal}} students in {{enrollmentYearCurr}}. The full-time enrollment at {{name}} is Commas{{enrollmentFTCount}} students and the part-time enrollment is Commas{{enrollmentPTCount}}. This means that Abbreviate{{enrollmentFTPercent}}% of students enrolled at {{name}} are enrolled full-time.</p>"
      },
      {
        "id": 262,
        "allowed": "raceListVis",
        "text": "<p>The enrolled student population at {{name}}, both undergraduate and graduate, is List{{raceList}}.</p>"
      },
      {
        "id": 263,
        "allowed": "always",
        "text": "<p>{{enrollmentUndergradRGText}} {{enrollmentGradRGText}}</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 148,
    "slug": "enrollment_status",
    "type": "TextViz",
    "ordering": 12,
    "allowed": "enrollmentFTPTVis",
    "position": "default",
    "icon": "",
    "title": "<p>Full-Time vs Part-Time Enrollment</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 264,
        "allowed": "isHiddenCarnegieParent",
        "text": "<p>The total enrollment at {{name}} in {{enrollmentYearCurr}}, both undergraduate and graduate, is Commas{{enrollmentTotal}} students. The full-time enrollment at {{name}} is Commas{{enrollmentFTCount}} and the part-time enrollment is Commas{{enrollmentPTCount}}. {{enrollmentsCarnegieText}}</p>"
      },
      {
        "id": 266,
        "allowed": "isCarnegieParent",
        "text": "<p>The total enrollment at {{name}}, both undergraduate and graduate, is Commas{{enrollmentTotal}} students. The full-time enrollment at {{name}} is Commas{{enrollmentFTCount}} and the part-time enrollment is Commas{{enrollmentPTCount}}. This means that Abbreviate{{enrollmentFTPercent}}% of students enrolled at {{name}} are enrolled full-time.</p>"
      },
      {
        "id": 265,
        "allowed": "always",
        "text": "<p>This chart shows the full-time vs part-time enrollment status at {{name}} (in red) compares to similar universities.</p>"
      }
    ],
    "stats": [
      {
        "id": 266,
        "allowed": "always",
        "title": "<p>Full-Time Enrollment</p>",
        "value": "<p>Abbreviate{{enrollmentFTPercent}}%</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      308,
      309
    ]
  },
  {
    "id": 149,
    "slug": "retention",
    "type": "TextViz",
    "ordering": 13,
    "allowed": "retentionRate",
    "position": "default",
    "icon": "",
    "title": "<p>Retention Rate over Time</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 268,
        "allowed": "always",
        "text": "<p>Retention rate measures the number of first-time students who began their studies the previous fall and returned to school the following fall. The retention rate for full-time undergraduates at {{name}} was Abbreviate{{retentionRate}}%. {{retentionRateText}}</p>"
      },
      {
        "id": 267,
        "allowed": "always",
        "text": "<p>This chart shows the retention rate over time at {{name}} (highlighted in red) compares to similar universities.</p>"
      }
    ],
    "stats": [
      {
        "id": 267,
        "allowed": "always",
        "title": "<p>{{retentionYearCurr}} Retention Rate</p>",
        "value": "<p>Abbreviate{{retentionRate}}%</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      310
    ]
  },
  {
    "id": 150,
    "slug": "enrollment_race",
    "type": "TextViz",
    "ordering": 14,
    "allowed": "enrollmentRaceEthnicityVis",
    "position": "default",
    "icon": "",
    "title": "<p>Enrollment by Race &amp; Ethnicity</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 271,
        "allowed": "isHiddenCarnegieParent",
        "text": "<p>The enrolled student population at {{name}} is List{{raceList}}. This includes both full-time and part-time students as well as graduate and undergraduates. {{enrollmentCarnegieText}}</p>"
      },
      {
        "id": 270,
        "allowed": "isCarnegieParent",
        "text": "<p>The enrolled student population at {{name}} is List{{raceList}}. This includes both full-time and part-time students as well as graduate and undergraduates. </p>"
      },
      {
        "id": 269,
        "allowed": "raceAlienCount",
        "text": "<p>Any student who is studying in the United States on a temporary basis is categorized as a \"Non-Resident Alien\", and the share of those students are shown in the chart below. Additionally, Commas{{raceUnknownCount}} students (Abbreviate{{raceUnknownPercent}}%) did not report their race.</p>"
      }
    ],
    "stats": [
      {
        "id": 268,
        "allowed": "raceTop1Name",
        "title": "<p>Most Common Race or Ethnicity ({{raceTopYear}})</p>",
        "value": "<p>{{raceTop1Name}}</p>",
        "subtitle": "<p>Commas{{raceTop1Count}} enrolled students</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 269,
        "allowed": "raceTop2Name",
        "title": "<p>Most Common Race or Ethnicity ({{raceTopYear}})</p>",
        "value": "<p>{{raceTop2Name}}</p>",
        "subtitle": "<p>Commas{{raceTop2Count}} enrolled students</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 270,
        "allowed": "raceTop3Name",
        "title": "<p>Most Common Race or Ethnicity ({{raceTopYear}})</p>",
        "value": "<p>{{raceTop3Name}}</p>",
        "subtitle": "<p>Commas{{raceTop3Count}} enrolled students</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      311,
      312
    ]
  },
  {
    "id": 151,
    "slug": "graduates",
    "type": "Grouping",
    "ordering": 15,
    "allowed": "graduatesVis",
    "position": "default",
    "icon": "learning",
    "title": "<p>Graduates</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 272,
        "allowed": "gradsRaceByShareVis",
        "text": "<p>In {{gradsYearCurr}}, commas{{gradsGenderDiffAbs}} MoreFewerWord{{gradsGenderDiff}} women than men received degrees from {{name}}. {{gradsRaceMostCommonText}} {{gradsRaceRatioText}}</p>"
      },
      {
        "id": 273,
        "allowed": "bachelorsMostPopularDegree",
        "text": "<p>The most common Bachelor's Degree concentration at {{name}} is {{degreeCommonText}}</p>"
      },
      {
        "id": 544,
        "allowed": "bachelorsNotMostPopularDegree",
        "text": "<p>The most common {{mostPopularDegree}} concentration at {{name}} is {{degreeCommonText}}</p>"
      },
      {
        "id": 274,
        "allowed": "gradsRCAVis",
        "text": "<p>In {{gradsRCATopYear}}, &nbsp;the most specialized majors across all degree types at {{name}}, meaning they have significantly more degrees awarded in that concentration than the national average across all institutions, are List{{gradsRCATop3}}.</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 152,
    "slug": "jobs",
    "type": "TextViz",
    "ordering": 16,
    "allowed": "commonJobsByMajorVis",
    "position": "default",
    "icon": "",
    "title": "<p>Common Jobs by Major</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 275,
        "allowed": "always",
        "text": "<p>The most common jobs for people who hold a degree in one of the 5 most specialized majors at {{name}} are List{{commonJobsTop5}}.</p>"
      },
      {
        "id": 276,
        "allowed": "gradsRCAVis",
        "text": "<p>The most specialized majors at {{name}} in {{gradsRCATopYear}} are List{{gradsRCATop5}} (as of {{gradsRCATopYear}}).</p>"
      }
    ],
    "stats": [
      {
        "id": 271,
        "allowed": "always",
        "title": "<p>Most Common Job</p>",
        "value": "<p>{{commonJobsTop1Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      341
    ]
  },
  {
    "id": 153,
    "slug": "wages",
    "type": "TextViz",
    "ordering": 17,
    "allowed": "highestPayingByMajorVis",
    "position": "default",
    "icon": "",
    "title": "<p>Highest Paying Jobs by Major</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 277,
        "allowed": "always",
        "text": "<p>The highest paying jobs for people who hold a degree in one of the 5 most specialized majors at {{name}} are List{{commonJobsHighestWageTop5Names}}</p>"
      },
      {
        "id": 278,
        "allowed": "gradsRCAVis",
        "text": "<p>The most specialized majors at {{name}} are List{{gradsRCATop5}} (as of {{gradsRCATopYear}}).</p>"
      }
    ],
    "stats": [
      {
        "id": 272,
        "allowed": "always",
        "title": "<p>Highest Paying Job</p>",
        "value": "<p>{{commonJobsHighestWageTop1Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      155
    ]
  },
  {
    "id": 154,
    "slug": "industries",
    "type": "TextViz",
    "ordering": 18,
    "allowed": "commonIndustriesByMajorVis",
    "position": "default",
    "icon": "",
    "title": "<p>Common Industries by Major</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 280,
        "allowed": "always",
        "text": "<p>The most common industries for people who hold a degree in one of the 5 most specialized majors at {{name}} are List{{commonIndustriesTop5}}.</p>"
      },
      {
        "id": 279,
        "allowed": "gradsRCAVis",
        "text": "<p>The most specialized majors at {{name}} are List{{gradsRCATop5}} (as of {{gradsRCATopYear}}).</p>"
      }
    ],
    "stats": [
      {
        "id": 273,
        "allowed": "always",
        "title": "<p>Most Common Industry</p>",
        "value": "<p>{{commonIndustriesTop1Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      156
    ]
  },
  {
    "id": 155,
    "slug": "majors",
    "type": "TextViz",
    "ordering": 19,
    "allowed": "majorsAwardedVis",
    "position": "default",
    "icon": "",
    "title": "<p>Majors Awarded</p>",
    "short": "",
    "subtitles": [
      {
        "id": 43,
        "allowed": "always",
        "text": "<p>IPEDS uses the Classification of Instructional Programs (CIP) standard, so the categories may not match the exact concentrations offered by {{name}}.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 281,
        "allowed": "always",
        "text": "<p>In {{degreeTopLatestYear}}, the most common Lower{{[[degree-majors]]}} concentration at {{name}} was {{[[degree-majors]]Top1Name}} with commas{{[[degree-majors]]Top1Value}} degrees awarded.</p>"
      },
      {
        "id": 282,
        "allowed": "always",
        "text": "<p>This visualization illustrates the percentage of degree-majors recipients from Lower{{[[degree-majors]]}} programs at {{name}} according to their major.</p>"
      }
    ],
    "stats": [
      {
        "id": 276,
        "allowed": "always",
        "title": "<p>Most Common ({{degreeTopLatestYear}})</p>",
        "value": "<p>{{[[degree-majors]]Top1Name}}</p>",
        "subtitle": "<p>commas{{[[degree-majors]]Top1Value}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 274,
        "allowed": "[[degree-majors]]Top2Value",
        "title": "<p>Most Common ({{degreeTopLatestYear}})</p>",
        "value": "<p>{{[[degree-majors]]Top2Name}}</p>",
        "subtitle": "<p>commas{{[[degree-majors]]Top2Value}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 275,
        "allowed": "[[degree-majors]]Top3Value",
        "title": "<p>Most Common ({{degreeTopLatestYear}})</p>",
        "value": "<p>{{[[degree-majors]]Top3Name}}</p>",
        "subtitle": "<p>commas{{[[degree-majors]]Top3Value}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [
      "degree-majors"
    ],
    "visualizations": [
      313
    ]
  },
  {
    "id": 156,
    "slug": "sex",
    "type": "TextViz",
    "ordering": 20,
    "allowed": "sexBreakdownCommonMajorsVis",
    "position": "default",
    "icon": "",
    "title": "<p>Sex Breakdown for Common Majors</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 284,
        "allowed": "gradsFemale",
        "text": "<p>In {{gradsYearCurr}}, commas{{gradsMale}} degrees were awarded to men at {{name}}, which is Abbreviate{{gradsRatio}} times MoreWord{{gradsRatioDiff}} the number of degrees awarded to females (commas{{gradsFemale}}).</p>"
      },
      {
        "id": 283,
        "allowed": "always",
        "text": "<p>This chart displays the sex disparity between the top 5 majors at {{name}} by degrees awarded.</p>"
      }
    ],
    "stats": [
      {
        "id": 278,
        "allowed": "always",
        "title": "<p>Degrees Awarded to Men</p>",
        "value": "<p>commas{{gradsMale}}</p>",
        "subtitle": "<p>in {{gradsYearCurr}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 277,
        "allowed": "always",
        "title": "<p>Degrees Awarded to Women</p>",
        "value": "<p>commas{{gradsFemale}}</p>",
        "subtitle": "<p>in {{gradsYearCurr}}</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      314
    ]
  },
  {
    "id": 157,
    "slug": "gender_men",
    "type": "Column",
    "ordering": 21,
    "allowed": "gradsMaleVis",
    "position": "default",
    "icon": "",
    "title": "<p>Most Common Male Majors</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 285,
        "allowed": "always",
        "text": "<p>{{commonMaleMajorsText}}</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      315
    ]
  },
  {
    "id": 158,
    "slug": "gender_women",
    "type": "Column",
    "ordering": 22,
    "allowed": "gradsFemaleVis",
    "position": "default",
    "icon": "",
    "title": "<p>Most Common Female Majors</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 286,
        "allowed": "always",
        "text": "<p>{{commonFemaleMajorsText}}</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": [
      316
    ]
  },
  {
    "id": 159,
    "slug": "timeframe",
    "type": "TextViz",
    "ordering": 23,
    "allowed": "timeframeYearCurr",
    "position": "default",
    "icon": "",
    "title": "<p>Time to Complete</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 289,
        "allowed": "always",
        "text": "<p>{{timeToCompleteText}}</p>"
      },
      {
        "id": 287,
        "allowed": "always",
        "text": "<p>The following chart shows these completion rates over time compared to the average for the {{nameCarnegieParent}} Carnegie Classification group.</p>"
      },
      {
        "id": 288,
        "allowed": "always",
        "text": "<p>Graduation rate is defined as the percentage of full-time, first-time students who received a degree or award within a specific percentage of \"normal time\" to completion for their program.</p>"
      }
    ],
    "stats": [
      {
        "id": 279,
        "allowed": "timeframe100",
        "title": "<p>100% Completion Time</p>",
        "value": "<p>Abbreviate{{timeframe100}}%</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 280,
        "allowed": "timeframe150",
        "title": "<p>150% Completion Time</p>",
        "value": "<p>Abbreviate{{timeframe150}}%</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      317
    ]
  },
  {
    "id": 160,
    "slug": "rate",
    "type": "TextViz",
    "ordering": 24,
    "allowed": "gradRateByRaceVis",
    "position": "default",
    "icon": "",
    "title": "<p>Graduation Rate by Race and Sex</p>",
    "short": "",
    "subtitles": [
      {
        "id": 44,
        "allowed": "always",
        "text": "<p>Showing demographic groups with ≥ 5 graduating students.</p>"
      }
    ],
    "descriptions": [
      {
        "id": 292,
        "allowed": "always",
        "text": "<p>The student demographic with the highest graduation rate in {{gradRateRGYear}} at {{name}} is {{gradRateRGTop1Gender}} and {{gradRateRGTop1Race}} (Abbreviate{{gradRateRGTop1Percent}}% graduation rate). Across all {{nameCarnegieParent}}, {{gradsOverallTop1Name}} students have the highest graduation rate (Abbreviate{{gradsOverallTop1Percent}}%).</p>"
      },
      {
        "id": 290,
        "allowed": "always",
        "text": "<p>The department of education defines graduation rate as the percentage of full-time, first-time students who received a degree or award within 150% of \"normal time\" to completion.</p>"
      },
      {
        "id": 291,
        "allowed": "nonResidentVisibility",
        "text": "<p>The National Center for Education Statistics (NCES) categorizes any student who is studying in the United States on a temporary basis as a \"Non-Resident Alien\", and the graduation rate of those students is shown in the chart below. Additionally, Abbreviate{{gradsUnknownPercent}}% of graduates ({{gradsUnknownCount}} students) did not report their race.</p>"
      }
    ],
    "stats": [
      {
        "id": 281,
        "allowed": "always",
        "title": "<p>Highest Graduation Rate (Abbreviate{{gradRateRGTop1Percent}}%)</p>",
        "value": "<p>{{gradRateRGTop1Name}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      318,
      319
    ]
  },
  {
    "id": 161,
    "slug": "ethnicity",
    "type": "TextViz",
    "ordering": 25,
    "allowed": "gradsRaceByShareVis",
    "position": "default",
    "icon": "",
    "title": "<p>Race &amp; Ethnicity by Share</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 294,
        "allowed": "always",
        "text": "<p>The most common race/ethnicity at {{name}} is Lower{{gradsRace1Name}} (commas{{gradsRace1Count}} degrees awarded). {{gradsRaceRatioText}}</p>"
      },
      {
        "id": 293,
        "allowed": "gradsRaceUnknownPercent",
        "text": "<p>Abbreviate{{gradsRaceUnknownPercent}}% of degree recipients (commas{{gradsRaceUnknownCount}} students) did not report their race.</p>"
      }
    ],
    "stats": [
      {
        "id": 283,
        "allowed": "gradsRace1Name",
        "title": "<p>Most Common Student Race or Ethnicity ({{gradsRaceYear}})</p>",
        "value": "<p>{{gradsRace1Name}}</p>",
        "subtitle": "<p>commas{{gradsRace1Count}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 282,
        "allowed": "gradsRace2Name",
        "title": "<p>Most Common Student Race or Ethnicity ({{gradsRaceYear}})</p>",
        "value": "<p>{{gradsRace2Name}}</p>",
        "subtitle": "<p>commas{{gradsRace2Count}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 284,
        "allowed": "gradsRace3Name",
        "title": "<p>Most Common Student Race or Ethnicity ({{gradsRaceYear}})</p>",
        "value": "<p>{{gradsRace3Name}}</p>",
        "subtitle": "<p>commas{{gradsRace3Count}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      164
    ]
  },
  {
    "id": 162,
    "slug": "ethnicity_sex",
    "type": "TextViz",
    "ordering": 26,
    "allowed": "completionsRGVis",
    "position": "default",
    "icon": "",
    "title": "<p>Race &amp; Ethnicity by Sex</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 295,
        "allowed": "always",
        "text": "<p>The most common race/ethnicity and sex grouping at {{name}} is Lower{{completionsRGTop1Name}} (commas{{completionsRGTop1Count}} degrees awarded). {{completionsRGText}}</p>"
      }
    ],
    "stats": [
      {
        "id": 285,
        "allowed": "completionsRGTop1Name",
        "title": "<p>Most Common Sex Demographic ({{completionsRGYear}})</p>",
        "value": "<p>{{completionsRGTop1Name}}</p>",
        "subtitle": "<p>commas{{completionsRGTop1Count}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 286,
        "allowed": "completionsRGTop2Name",
        "title": "<p>Most Common Sex Demographic ({{completionsRGYear}})</p>",
        "value": "<p>{{completionsRGTop2Name}}</p>",
        "subtitle": "<p>commas{{completionsRGTop2Count}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 287,
        "allowed": "completionsRGTop3Name",
        "title": "<p>Most Common Sex Demographic ({{completionsRGYear}})</p>",
        "value": "<p>{{completionsRGTop3Name}}</p>",
        "subtitle": "<p>commas{{completionsRGTop3Count}} degrees awarded</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      320
    ]
  },
  {
    "id": 163,
    "slug": "operations",
    "type": "Grouping",
    "ordering": 27,
    "allowed": "operationsVis",
    "position": "default",
    "icon": "briefcase",
    "title": "<p>Operations</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 298,
        "allowed": "financeEndowment",
        "text": "<p>{{name}} has an endowment valued at nearly $Abbreviate{{financeEndowment}}, as of the end of the {{financeYearCurr}} fiscal year. {{operationsCarnegieText}}</p>"
      },
      {
        "id": 297,
        "allowed": "financeExpText",
        "text": "<p>{{financeExpText}} {{staffOperationsText}} {{staffGenderTopText}}</p>"
      },
      {
        "id": 296,
        "allowed": "staffOtherTop1Name",
        "text": "<p>{{staffOtherAboutText}}</p>"
      }
    ],
    "stats": [],
    "selectors": [],
    "visualizations": []
  },
  {
    "id": 164,
    "slug": "endowment",
    "type": "TextViz",
    "ordering": 28,
    "allowed": "financeEndowment",
    "position": "default",
    "icon": "",
    "title": "<p>Endowment</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 302,
        "allowed": "isHiddenCarnegieParentCopy",
        "text": "<p>{{name}} has an endowment valued at about $Abbreviate{{financeEndowment}}, as of the end of the {{financeYearCurr}} fiscal year. The endowment of {{name}} GrewWord{{financeEndowmentDiff}} GrowthPct{{financeGrowth}} from the previous year. The value of their endowment was $Abbreviate{{financeCarnegieParentEndowmentDiffAbs}} HighWord{{financeCarnegieParentEndowmentDiff}} than the median endowment of {{nameCarnegieParent}} according to the Carnegie Classification grouping.</p>"
      },
      {
        "id": 303,
        "allowed": "isCarnegieParent",
        "text": "<p>{{name}} have a median endowment valued at about $Abbreviate{{financeEndowment}}, as of the end of the {{financeYearCurr}} fiscal year. The endowment of {{name}} GrewWord{{financeEndowmentDiff}} GrowthPct{{financeGrowth}} from the previous year.</p>"
      },
      {
        "id": 300,
        "allowed": "always",
        "text": "<p>This line chart shows how the endowment at {{name}} (in red) compares to that of some similar universities.</p>"
      },
      {
        "id": 299,
        "allowed": "isUniversity",
        "text": "<p>The small bar chart below shows the endowment quintiles for all universities in the {{nameCarnegie}} Carnegie Classification grouping.</p>"
      },
      {
        "id": 301,
        "allowed": "isHiddenUniversity",
        "text": "<p>The small bar chart below shows the endowment quintiles for all universities in the {{name}} Carnegie Classification grouping.</p>"
      }
    ],
    "stats": [
      {
        "id": 289,
        "allowed": "financeEndowment",
        "title": "<p>{{financeYearCurr}} Endowment</p>",
        "value": "<p>$Abbreviate{{financeEndowment}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 288,
        "allowed": "financeGrowth",
        "title": "<p>GrowthWord{{financeEndowmentDiff}} from {{financeYearPrev}}</p>",
        "value": "<p>GrowthPct{{financeGrowth}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      321,
      322,
      323
    ]
  },
  {
    "id": 165,
    "slug": "grants_contracts",
    "type": "TextViz",
    "ordering": 29,
    "allowed": "financeGrants",
    "position": "default",
    "icon": "",
    "title": "<p>Government Grants and Contracts</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 304,
        "allowed": "always",
        "text": "<p>As of {{financeGrantsYearCurr}}, {{name}} received $Abbreviate{{financeFederalGrants}} in grants and contracts from the federal government, $Abbreviate{{financeStateGrants}} from state grants and contracts, and $Abbreviate{{financeLocalGrants}} from local grants and contracts.</p>"
      }
    ],
    "stats": [
      {
        "id": 290,
        "allowed": "always",
        "title": "<p>Grants &amp; Contracts</p>",
        "value": "<p>$Abbreviate{{financeFederalGrants}} - Federal</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 291,
        "allowed": "always",
        "title": "<p>Grants &amp; Contracts</p>",
        "value": "<p>$Abbreviate{{financeStateGrants}} - State</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 292,
        "allowed": "always",
        "title": "<p>Grants &amp; Contracts</p>",
        "value": "<p>$Abbreviate{{financeLocalGrants}} - Local</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      340
    ]
  },
  {
    "id": 166,
    "slug": "salaries",
    "type": "TextViz",
    "ordering": 30,
    "allowed": "salaryExpenditureVis",
    "position": "default",
    "icon": "",
    "title": "<p>Salary Expenditure</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 306,
        "allowed": "salaryExpenditureYearCurrVis",
        "text": "<p>In {{financeSalariesYearCurr}}, {{name}} paid a median of $Abbreviate{{financeSalaries}} in salaries.</p>"
      },
      {
        "id": 551,
        "allowed": "salaryExpenditureYearPrevVis",
        "text": "<p>In {{financeSalariesYearCurr}}, {{name}} paid a median of $Abbreviate{{financeSalaries}} in salaries, {{financeSalaryRatioText}} a GrowthPct{{financeSalariesGrowth}} GrowthWord{{financeSalariesDiff}} from the previous year. {{salaryExpenditureText}}</p>"
      },
      {
        "id": 305,
        "allowed": "salaryExpenditureCarnegieParagraphVis",
        "text": "<p>The median for similar {{nameCarnegieParent}} is Abbreviate{{salaryCarnegieParent}} (Abbreviate{{overallExpenditure}}% of overall expenditures).</p>"
      }
    ],
    "stats": [
      {
        "id": 293,
        "allowed": "always",
        "title": "<p>{{financeSalariesYearCurr}} Salaries</p>",
        "value": "<p>$Abbreviate{{financeSalaries}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 294,
        "allowed": "salaryExpenditureYearPrevVis",
        "title": "<p>GrowthWord{{financeSalariesDiff}} from {{financeSalariesYearPrev}}</p>",
        "value": "<p>GrowthPct{{financeSalariesGrowth}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      326,
      327
    ]
  },
  {
    "id": 167,
    "slug": "instructional_salaries",
    "type": "TextViz",
    "ordering": 31,
    "allowed": "staffInstructionalEmployees",
    "position": "default",
    "icon": "",
    "title": "<p>Instructional Salaries</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 307,
        "allowed": "always",
        "text": "<p>In {{staffInstructionalYear}}, {{name}} paid a total of $abbreviate{{staffInstructionalSalaries}} to commas{{staffInstructionalEmployees}} employees working as instructors, which represents abbreviate{{staffInstructionalShare}}% of all salaries paid.</p>"
      },
      {
        "id": 308,
        "allowed": "isHiddenCarnegieParent",
        "text": "<p>This is compared to a median of $abbreviate{{staffInstructionalSalariesCarnegie}} (abbreviate{{staffInstructionalShareCarnegie}}%) for similar {{staffInstructionalNameCarnegie}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 296,
        "allowed": "always",
        "title": "<p>Instructional Salaries</p>",
        "value": "<p>$abbreviate{{staffInstructionalSalaries}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      },
      {
        "id": 295,
        "allowed": "always",
        "title": "<p>Number of Employees</p>",
        "value": "<p>commas{{staffInstructionalEmployees}}</p>",
        "subtitle": "",
        "tooltip": "New Tooltip"
      }
    ],
    "selectors": [],
    "visualizations": [
      331,
      332
    ]
  },
  {
    "id": 168,
    "slug": "staff_tmap",
    "type": "TextViz",
    "ordering": 32,
    "allowed": "occupationsByShareVis",
    "position": "default",
    "icon": "",
    "title": "<p>Occupations by Share</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 310,
        "allowed": "neverShow",
        "text": "<p>{{staffText}}</p>"
      },
      {
        "id": 309,
        "allowed": "staffOtherTop1Name",
        "text": "<p>{{staffOtherText}}</p>"
      }
    ],
    "stats": [
      {
        "id": 298,
        "allowed": "neverShow",
        "title": "<p>Most Common Instructor</p>",
        "value": "<p>{{staffOtherTop1Name}}</p>",
        "subtitle": "<p>commas{{staffOtherTop1Count}} Employees</p>",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 297,
        "allowed": "neverShow",
        "title": "<p>Most Common Non-Instructional Employee</p>",
        "value": "<p>{{staffOtherTop2Name}}</p>",
        "subtitle": "<p>commas{{staffOtherTop2Count}} Employees</p>",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      325
    ]
  },
  {
    "id": 169,
    "slug": "instructors_sex",
    "type": "TextViz",
    "ordering": 33,
    "allowed": "staffGenderTop1Vis",
    "position": "default",
    "icon": "",
    "title": "<p>Instructors by Academic Rank and Sex</p>",
    "short": "",
    "subtitles": [],
    "descriptions": [
      {
        "id": 311,
        "allowed": "always",
        "text": "<p>{{staffGenderCommonText}}</p>"
      },
      {
        "id": 312,
        "allowed": "always",
        "text": "<p>This chart shows the sex split between each academic rank present at {{name}}.</p>"
      }
    ],
    "stats": [
      {
        "id": 299,
        "allowed": "staffGenderTop1Name",
        "title": "<p>Most Common Demographic ({{staffGenderYearCurr}})</p>",
        "value": "<p>{{staffGenderTop1Name}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 300,
        "allowed": "staffGenderTop2Name",
        "title": "<p>Most Common Demographic ({{staffGenderYearCurr}})</p>",
        "value": "<p>{{staffGenderTop2Name}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      },
      {
        "id": 301,
        "allowed": "staffGenderTop3Name",
        "title": "<p>Most Common Demographic ({{staffGenderYearCurr}})</p>",
        "value": "<p>{{staffGenderTop3Name}}</p>",
        "subtitle": "",
        "tooltip": "<p>New Tooltip</p>"
      }
    ],
    "selectors": [],
    "visualizations": [
      324
    ]
  }
];
