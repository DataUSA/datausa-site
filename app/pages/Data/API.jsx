import React, {Component} from "react";
import {Link} from "react-router";

export default class API extends Component {

  render() {

    return (
      <div id="API">
        <h2>Introduction</h2>
        <p>
          The Data USA API allows users to explore the entire database using carefully constructed query strings, returning data as JSON results. All of the visualizations on the page have a a "show data" button on their top-right that displays the API call(s) used to generate that visualization. Additionally, the new <Link to="/visualize">Visualization Builder</Link> is a great way to explore what's possible.  This page illustrates an example usage of exploring geographic data.
        </p>
        <h2>Example: Population Data</h2>
        <p>
          To get population data at the national level we can use the following API call:
        </p>
        <p>
          https://datausa.io/api/data?drilldowns=<strong>Nation</strong>&measures=<strong>Population</strong>
        </p>
        <p>
          Now let’s take a look at the output and break it down
        </p>
        <div className="code-box">
          <pre dangerouslySetInnerHTML={{__html: `{
  <span class="key">"data"</span>:[
    {
      <span class="key">"ID Nation"</span>: <span class="value">"01000US"</span>,
      <span class="key">"Nation"</span>: <span class="value">"United States"</span>,
      <span class="key">"ID Year"</span>: <span class="integer">2016</span>,
      <span class="key">"Year"</span>: <span class="value">"2016"</span>,
      <span class="key">"Population"</span>: <span class="integer">323127515</span>,
      <span class="key">"Slug Nation"</span>: <span class="value">"united-states"</span>
    },
    {
      <span class="key">"ID Nation"</span>: <span class="value">"01000US"</span>,
      <span class="key">"Nation"</span>: <span class="value">"United States"</span>,
      <span class="key">"ID Year"</span>: <span class="integer">2015</span>,
      <span class="key">"Year"</span>: <span class="value">"2015"</span>,
      <span class="key">"Population"</span>: <span class="integer">321418821</span>,
      <span class="key">"Slug Nation"</span>: <span class="value">"united-states"</span>
    },
    {
      <span class="key">"ID Nation"</span>: <span class="value">"01000US"</span>,
      <span class="key">"Nation"</span>: <span class="value">"United States"</span>,
      <span class="key">"ID Year"</span>: <span class="integer">2014</span>,
      <span class="key">"Year"</span>: <span class="value">"2014"</span>,
      <span class="key">"Population"</span>: <span class="integer">318857056</span>,
      <span class="key">"Slug Nation"</span>: <span class="value">"united-states"</span>
    },
    {
      <span class="key">"ID Nation"</span>: <span class="value">"01000US"</span>,
      <span class="key">"Nation"</span>: <span class="value">"United States"</span>,
      <span class="key">"ID Year"</span>: <span class="integer">2013</span>,
      <span class="key">"Year"</span>: <span class="value">"2013"</span>,
      <span class="key">"Population"</span>: <span class="integer">316128839</span>,
      <span class="key">"Slug Nation"</span>: <span class="value">"united-states"</span>
    }
  ],
  <span class="key">"source"</span>: [
    {
      <span class="key">"measures"</span>: [<span class="value">"Population"</span>],
      <span class="key">"annotations"</span>: {
        <span class="key">"source_name"</span>: <span class="value">"Census Bureau"</span>,
        <span class="key">"source_description"</span>: <span class="value">"Census Bureau conducts surveys of the United States Population, including the American Community Survey"</span>,
        <span class="key">"dataset_name"</span>: <span class="value">"ACS 1-year Estimate"</span>,
        <span class="key">"dataset_link"</span>: <span class="value">"http: //www.census.gov/programs-surveys/acs/"</span>,
        <span class="key">"table_id"</span>: <span class="value">"B01003"</span>,
        <span class="key">"topic"</span>: <span class="value">"Diversity"</span>
      },
      <span class="key">"name"</span>: <span class="value">"acs_yg_total_population_1"</span>,
      <span class="key">"substitutions"</span>: [ ]
    }
  ]
}`}} />
        </div>
        <h2>Data</h2>
        <p>
          The <em>data</em> section of the JSON result contains an object for each row of data. By default, the API returns as many years possible from the data. To only retrieve the latest year’s data, use:
        </p>
        <p>
          https://datausa.io/api/data?drilldowns=<strong>Nation</strong>&measures=<strong>Population</strong>&year=<strong>latest</strong>
        </p>
        <p>
          This call gives us the popoulation of the US based on the latest available year of data. Using the string "latest" instead of a hard-coded year ensures that if the underlying data is updated with a new year's worth of data, the API calls will all reflect this new data automatically. Additionally, to get data at the state level we can use:
        </p>
        <p>
          https://datausa.io/api/data?drilldowns=<strong>State</strong>&measures=<strong>Population</strong>&year=<strong>latest</strong>
        </p>
        <h2>Source</h2>
        <p>
          You may have noticed some additional information returned with each API call. The <em>source</em> section identifies the underlying data table where the rows have been retrieved from for the given request. The <em>substitutions</em> section will indicate whether any input variables have been substituted for the purposes of providing data (instead of providing no data). If the subs dictionary is empty, then no subsitutions have been made.
        </p>
      </div>
    );

  }

}
