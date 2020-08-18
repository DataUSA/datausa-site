export const usage = {
  "agency-for-healthcare-research-and-quality": [
    "Patient access and care data is featured in the Health section of the geography profiles."
  ],
  "bureau-of-economic-analysis": [
    "The BEA I/O tables are used on the industry profiles, showing the input and output industries for the specified industry profile page."
  ],
  "bureau-of-labor-statistics": [
    "The BLS dataset is used on the occupation and industry pages, showing the publicly available expected growth numbers in both number of employees and salary."
  ],
  "census-bureau": [
    "The ACS dataset is used on the location, occupation and industry profiles. Although the ACS dataset includes some data on occupations and industries, Data USA is mostly using the ACS dataset for demographics on the Geography profiles.",
    "The ACS PUMS dataset is used throughout the site where specific data cross sections are not made available through the preformatted ACS dataset. ACS PUMS data is the cornerstone of the occupations and industry data used throughout the Geography, Occupation and Industry profiles. Data USA also uses ACS PUMS to compare a location's current stock of graduates versus students currently pursuing high education degrees (provided by the IPEDs dataset).",
    "DataUSA provides access to the CBP data through our <a href=\"https://github.com/DataUSA/datausa-api/wiki/Data-API#cbp\" target=\"_blank\" rel=\"noopener noreferrer\">API</a>."
  ],
  "centers-for-medicare-and-medicaid-services-cms": [
    "Medicare and medicaid data is featured in the Health section of the geography profiles."
  ],
  "center-on-budget-and-policy-priorities": [
    "Rental assistance data is featured in the Health section of the geography profiles."
  ],
  "commonwealth-fund": [
    "Various health indicators are featured in the Health section of the geography profiles."
  ],
  "county-health-rankings-roadmaps": [
    "The CHR data is used on the geography profiles in the health section."
  ],
  "dartmouth-atlas-of-healthcare": [
    "The Dartmouth data is used on the Geography profiles in the health and safety section."
  ],
  "department-of-education": [
    "Default rates are displayed in University Profiles for each institution, as well as on the national map page aggregated for each location."
  ],
  "department-of-housing-and-urban-development-hud": [
    "Homelessness data is featured in the Health section of the geography profiles."
  ],
  "department-of-transportation-federal-highway-administration": [
    "Freight Analysis Framework data is used in the Transport section of product profiles, as well as the Economy section of geography profiles."
  ],
  "integrated-postsecondary-education-data-system-ipeds": [
    "The IPEDS dataset is used throughout all the profile pages but is the cornerstone of the course and university profiles. These profiles center around a particular postsecondary course or university, combining data from IPEDS with related occupation and industrial data."
  ],
  "kaiser-family-foundation": [
    "Various health indicators are featured in the Health section of the geography profiles."
  ],
  "mit-election-lab": [
    "Presidential, Senate, and Representative voting results are featured in the Civics section of the geography profiles."
  ],
  "onet-online": [
    "The O*Net Skills dataset is used on both the Occupation and Course profile pages giving a detailed breakdown of the skills required for the specified occupation or course."
  ],
  "substance-abuse-and-mental-health-services-administration-samhsa": [
    "Various health indicators are featured in the Health section of the geography profiles."
  ],
  "usaspendinggov": [
    "Department spending is featured in the product profiles."
  ]
};

export const caveats = {
  "bureau-of-economic-analysis": [
    "The BEA I/O tables use a modified version of the North American Industry Classification (NAICS), meaning that certain industry pages do not have a corresponding BEA I/O table industry and are thus swapped for the closest match."
  ],
  "census-bureau": [
    "Due to sampling constraints, there is often a high margin of error when looking at data for smaller geographies. Apply caution when drawing conclusions from small geographic areas (for example: small counties, places and particularly tracts).",
    "The PUMS dataset is complex. While we have computed aggregations of the data, we run manual spot checks in an attempt to validate our aggregations and calculations. We do not have an independent, automated validation process to verify every calculation, therefore please use particular caution when using the PUMS data on this site.",
    "Similar to the ACS dataset there are sometimes sampling biases when looking at data from a specifc slice of data. Due to the way the data is aggregated, ACS PUMS data is only availabe for the Nation, States and Public Use Microdata Areas (PUMAs).",
    "Wage values are adjusted using the ADJINC variable from the PUMS file.",
    "There are four main universes of tables: \"workforce\", \"full-time\" and \"part-time\". The default and most prevalent universe for our PUMS data uses the workforce universe. The conditions for this universe: <ol><li>Age of 16 years or older</li><li>Wage greater than zero</li><li>In the workforce (i.e. ESR code of 1,2,4,5)</li></ol>",
    "In addition, the above criteria full-time universe rows must have WKHP &gt;= 35, whereas part-time universe rows have WKHP &lt; 35.",
    "The other universe is everyone five years of age and older (that is the only restriction). This universe is only used for visualizations showing birthplaces for a location from PUMS.",
    "Another caveat to note is that when we display top statistics from PUMS data, such as highest average wage, or most common occupation, we will typically only show the top values where several (&gt;= 5) records are collapsed.",
    "For more detailed technical information on the PUMS aggregation methodology, please visit our technical <a href=\"https://github.com/DataUSA/datausa-api/wiki/Data API#pums\">PUMS Aggregation Methodology page</a>."
  ],
  "county-health-rankings-roadmaps": [
    "With regard to granularity, the CHR dataset only includes State and County level data. Population estimates for 2016 CHR data are based on 2014 Census population estimates, and 2015 CHR data are based on 2011 Census population estimates.",
    "Additionally, certain indicators are collected at larger time intervals than others, so it is important to note the \"Collection Year\" in the tooltips, as new reports may utilize older collection data."
  ],
  "dartmouth-atlas-of-healthcare": [
    "With regard to granularity the Dartmouth dataset only includes State and County level data."
  ],
  "department-of-education": [
    "A cohort default rate is the percentage of a school's borrowers who enter repayment on certain Federal Family Education Loan (FFEL) Program or William D. Ford Federal Direct Loan (Direct Loan) Program loans during a particular federal fiscal year (FY), October 1 to September 30, and default or meet other specified conditions prior to the end of the second following fiscal year. The U.S. Department of Education releases official cohort default rates once per year.",
    "The geographical default rates are calculated based on the instititions within each geography, and do not necessarily reflect the population living in a location."
  ],
  "department-of-transportation-federal-highway-administration": [
    "DataUSA only provides information from the subset of FAF data where both the origin and destination of the shipment are in the United States. Original product codes (using the SCTG standard) are provided, as well as code equivalents from the NAPCS product code standard. The crosswalk used to apply the NAPCS codes is available <a href=\"/data/napcs-sctg-crosswalk.csv\">here</a>."
  ],
  "mit-election-lab": [
    "We have paired MIT's election results data with our own manual supplement for any special elections that have occured since the previously collected regular election (as in the case of resignations and deaths).",
    "The land boundaries for a portion of the geographical profiles featured in Data USA do not line up perfectly with congressional districts. In this case, when displaying representatives for the given location, we include any congressional district whose geographical boundaries overlap the given location's boundaries."
  ],
  "onet-online": [
    "Some occupations do not have directly corresponding data available in O*Net. For more detailed technical information on how we handle these cases, please visit our <a href=\"https://github.com/DataUSA/datausa-api/wiki/Data API#onet\">O*Net Aggregation Methodology</a> page."
  ]
};
