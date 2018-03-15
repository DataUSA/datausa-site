import React, {Component} from "react";

import Anchor from "components/Anchor";
import SideNav from "components/SideNav";

export default class DataSources extends Component {

  render() {

    return (
      <div id="DataSources">
        <SideNav>Data Sources</SideNav>
        <div className="content">

          <h2 id="acs"><Anchor slug="acs">American Community Survey</Anchor></h2>
          <p>
            The <b>American Community Survey (ACS)</b> is conducted by the US Census and sent to a portion of the population every year. Data USA does not contain the entire ACS dataset but instead relavent topics to the curated profile pages of the site. As of the 2014 (most recent) ACS release there are 1 year and 5 year estimates. Previously there was also a 3 year estimate which has now been discontinued.
          </p>
          <h3>Where is it used?</h3>
          <p>
            The ACS dataset is used on the Geography, Occupation and Industry profiles. Although the ACS dataset includes some data on occupations and industries, Data USA is mostly using the ACS dataset for demographics on the Geography profiles.
          </p>
          <h3>Caveats</h3>
          <p>
            Due to sampling constraints, there is often a high margin of error when looking at data for smaller geographies. Apply caution when drawing conclusions from small geographic areas (for example: small counties, places and particularly tracts).
          </p>

          <h2 id="pums"><Anchor slug="pums">ACS PUMS</Anchor></h2>
          <p>
            The <b>American Community Survey (ACS) Public Use Microdata Sample (PUMS)</b> files are a set of untabulated records about individual people or housing units. The Census Bureau produces the PUMS files so that data users can create custom tables that are not available through pretabulated (or summary) ACS data products.
          </p>
          <h3>Where is it used?</h3>
          <p>
            The ACS PUMS dataset is used throughout the site where specific data cross sections are not made available through the preformatted ACS dataset. ACS PUMS data is the cornerstone of the occupations and industry data used throughout the Geography, Occupation and Industry profiles. Data USA also uses ACS PUMS to compare a location&#39;s current stock of graduates versus students currently pursuing high education degrees (provided by the IPEDs dataset).
          </p>
          <h3>Caveats</h3>
          <p>
            The PUMS dataset is complex. While we have computed aggregations of the data, we run manual spot checks in an attempt to validate our aggregations and calculations. We do not have an independent, automated validation process to verify every calculation, therefore please use particular caution when using the PUMS data on this site.
          </p>
          <p>
            Similar to the ACS dataset there are sometimes sampling biases when looking at data from a specifc slice of data. Due to the way the data is aggregated, ACS PUMS data is only availabe for the Nation, States and Public Use Microdata Areas (PUMAs).
          </p>
          <p>
            Wage values are adjusted using the ADJINC variable from the PUMS file.
          </p>
          <p>
            There are four main universes of tables: &#34;workforce&#34;, &#34;full-time&#34; and &#34;part-time&#34;. The default and most prevalent universe for our PUMS data uses the workforce universe. The conditions for this universe:
          </p>
          <ol>
            <li>Age of 16 years or older</li>
            <li>Wage greater than zero</li>
            <li>In the workforce (i.e. ESR code of 1,2,4,5)</li>
          </ol>
          <p>
            In addition, the above criteria full-time universe rows must have WKHP &gt;= 35, whereas part-time universe rows have WKHP &lt; 35.
          </p>
          <p>
            The other universe is everyone five years of age and older (that is the only restriction). This universe is only used for visualizations showing birthplaces for a location from PUMS.
          </p>
          <p>
            Another caveat to note is that when we display top statistics from PUMS data, such as highest average wage, or most common occupation, we will typically only show the top values where several (&gt;= 5) records are collapsed.
          </p>
          <p>
            For more detailed technical information on the PUMS aggregation methodology, please visit our technical <a href="https://github.com/DataUSA/datausa-api/wiki/Data API#pums">PUMS Aggregation Methodology page.</a>
          </p>

          <h2 id="bea"><Anchor slug="bea">Bureau of Economic Analysis</Anchor></h2>
          <p>
            The <b>Bureau of Economic Analysis (BEA)</b> publishes data on Input-Output also called Make-Use for industries in the United States. This Dataset is provided by the US Department of Commerce.
          </p>
          <h3>Where is it used?</h3>
          <p>
            The BEA I/O tables are used on the industry pages showing the input and output industries for the specified industry profile page.
          </p>
          <h3>Caveats</h3>
          <p>
            The BEA I/O tables use a modified version of the North American Industry Classification (NAICS) meaning that certain industry pages do not have a corresponding BEA I/O table industry and are thus swapped for the closest match.
          </p>

          <h2 id="bls"><Anchor slug="bls">Bureau of Labor Statistics</Anchor></h2>
          <p>
            The <b>Bureau of Labor Statistics (BLS)</b> is a public dataset made available by the United States Department of Labor.
          </p>
          <h3>Where is it used?</h3>
          <p>
            The BLS dataset is used on the Occupation and Industry pages showing the publicly available expected growth numbers in both number of employees and salary.
          </p>

          <h2 id="chr"><Anchor slug="chr">County Health Rankings</Anchor></h2>
          <p>
            The <b>University of Wisconsin County Health Rankings (CHR)</b> dataset is a collaboration between the Robert Wood Johnson Foundation and the University of Wisconsin Population Health Institute.
          </p>
          <h3>Where is it used?</h3>
          <p>The CHR data is used on the Geography profiles in the health and safety section.</p>
          <h3>Caveats</h3>
          <p>
            With regard to granularity the CHR dataset only includes State and County level data. Population estimates for 2016 CHR data are based on 2014 Census population estimates, and 2015 CHR data are based on 2011 Census population estimates.
          </p>

          <h2 id="ipeds"><Anchor slug="ipeds">IPEDS</Anchor></h2>
          <p>
            The <b>Integrated Postsecondary Education Data System (IPEDS)</b> is the core postsecondary education data collection program for the National Center for Education Statistics, a part of the Institute for Education Sciences within the United States Department of Education.
          </p>
          <h3>Where is it used?</h3>
          <p>
            The IPEDS dataset is used throughout all the profile pages but is the cornerstone of the Course profiles. These profiles center around a particular postsecondary course, bringing in data from IPEDS and related occupation and industrial data.
          </p>

          <h2 id="default"><Anchor slug="default">Default Rates</Anchor></h2>
          <p>
            A cohort default rate is the percentage of a school&#39;s borrowers who enter repayment on certain Federal Family Education Loan (FFEL) Program or William D. Ford Federal Direct Loan (Direct Loan) Program loans during a particular federal fiscal year (FY), October 1 to September 30, and default or meet other specified conditions prior to the end of the second following fiscal year. The U.S. Department of Education releases official cohort default rates once per year.
          </p>
          <h3>Where is it used?</h3>
          <p>
            Default rates are displayed in University Profiles for each institution, as well as on the national map page aggregated for each location.
          </p>
          <h3>Caveats</h3>
          <p>
            The geographical default rates are calculated based on the instititions within each geography, and do not necessarily reflect the population living in a location.
          </p>

          <h2 id="onet"><Anchor slug="onet">O*Net</Anchor></h2>
          <p>
            The <b>O*Net Skills</b> is a dataset containing detailed descriptions of the required and used skills for specific occupations. The O*Net dataset is sponsored by the United States Department of Labor. Data USA currently uses version 19.0 (July 2014) of the O*NET Database.
          </p>
          <h3>Where is it used?</h3>
          <p>
            The O*Net Skills dataset is used on both the Occupation and Course profile pages giving a detailed breakdown of the skills required for the specified occupation or course.
          </p>
          <h3>Caveats</h3>
          <p>
            Some occupations do not have directly corresponding data available in O*Net. For more detailed technical information on how we handle these cases, please visit our <a href="https://github.com/DataUSA/datausa-api/wiki/Data API#onet">O*Net Aggregation Methodology</a> page.
          </p>

          <h2 id="dartmouth"><Anchor slug="dartmouth">Dartmouth Atlas Project</Anchor></h2>
          <p>
            For more than 20 years, the <b>Dartmouth Atlas Project</b> has documented glaring variations in how medical resources are distributed and used in the United States. The project uses Medicare data to provide comprehensive information and analysis about national, regional, and local markets, as well as individual hospitals and their affiliated physicians.
          </p>
          <h3>Where is it used?</h3>
          <p>
            The Dartmouth data is used on the Geography profiles in the health and safety section.
          </p>
          <h3>Caveats</h3>
          <p>
            With regard to granularity the Dartmouth dataset only includes State and County level data.
          </p>

          <h2 id="cbp"><Anchor slug="cbp">County Business Patterns</Anchor></h2>
          <p>
            <b>County Business Patterns (CBP)</b> is an annual series that provides subnational economic data by industry. This series includes the number of establishments, employment during the week of March 12, first quarter payroll, and annual payroll. This data is useful for studying the economic activity of small areas; analyzing economic changes over time; and as a benchmark for other statistical series, surveys, and databases between economic censuses. Businesses use the data for analyzing market potential, measuring the effectiveness of sales and advertising programs, setting sales quotas, and developing budgets. Government agencies use the data for administration and planning.
          </p>
          <h3>Where is it used?</h3>
          <p>
            DataUSA provides access to the CBP data through our <a href="https://github.com/DataUSA/datausa-api/wiki/Data-API#cbp" target="_blank" rel="noopener noreferrer">API</a>.
          </p>

          <h2 id="freight"><Anchor slug="freight">Freight Analysis Framework</Anchor></h2>
          <p>
            The <span className="emphasize">Freight Analysis Framework (FAF)</span>, produced through a partnership between Bureau of Transportation Statistics (BTS) and Federal Highway Administration (FHWA), integrates data from a variety of sources to create a comprehensive picture of freight movement among states and major metropolitan areas by all modes of transportation. Starting with data from the 2012 Commodity Flow Survey (CFS) and international trade data from the Census Bureau, FAF incorporates data from agriculture, extraction, utility, construction, service, and other sectors. The FAF data give a picture of which goods are shipped from one region of the US to another region, according to type of commodity, mode of shipment, value, and weight.
          </p>
          <h3>Where is it used?</h3>
          <p>
            DataUSA provides access to the FAF data for 2012-2015 through our <a href="https://github.com/DataUSA/datausa-api/wiki/Data-API" target="_blank" rel="noopener noreferrer">API</a>.
          </p>
          <h3>Caveats</h3>
          <p>
            Shipment origin and destination are aggregated at the state level, and for certain Metropolitan Statistical Areas.
          </p>
          <p>
            DataUSA only provides information from the subset of FAF data where both the origin and destination of the shipment are in the United States. Original product codes (using the SCTG standard) are provided, as well as code equivalents from the NAPCS product code standard. The crosswalk used to apply the NAPCS codes is available <a href="/static/data/napcs-sctg-crosswalk.csv">here</a>.
          </p>
        </div>
      </div>
    );

  }

}
