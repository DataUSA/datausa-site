import type {Metadata} from "next";
import {StaticPageJsonLd} from "@/components/seo/StaticPageJsonLd";
import {staticMetadata} from "@/lib/seo/metadata";

export const metadata: Metadata = staticMetadata("api");

const API = "https://api.datausa.io/tesseract";

function Code({children}: {children: string}) {
  return <code className="api-code">{children}</code>;
}

function ApiLink({path, strong}: {path: string; strong?: string}) {
  return (
    <p>
      <a href={`${API}${path}`} target="_blank" rel="noopener noreferrer">
        {strong ? <>{API}<strong>{strong}</strong></> : `${API}${path}`}
      </a>
    </p>
  );
}

const RESPONSE_EXAMPLE = `{
  <span class="key">"annotations"</span>:
    {
      <span class="key">"subtopic"</span>: <span>"Demographics"</span>,
      <span class="key">"dataset_link"</span>: <span>"http://www.census.gov/programs-surveys/acs/"</span>,
      <span class="key">"table_id"</span>: <span>"B01003"</span>,
      <span class="key">"dataset_name"</span>: <span>"ACS 5-year Estimate"</span>,
      <span class="key">"topic"</span>: <span>"Diversity"</span>,
      <span class="key">"source_name"</span>: <span>"Census Bureau"</span>,
      <span class="key">"source_description"</span>: <span>"The American Community Survey (ACS) is conducted by the US Census and sent to a portion of the population every year."</span>
    },
  <span class="key">"page"</span>:
    {
      <span class="key">"limit"</span>: <span>0</span>,
      <span class="key">"offset"</span>: <span>0</span>,
      <span class="key">"total"</span>: <span>52</span>
    },
  <span class="key">"columns"</span>:
    [
      <span>"State ID"</span>,
      <span>"State"</span>,
      <span>"Year"</span>,
      <span>"Population"</span>
    ],
  <span class="key">"data"</span>: [
    {
      <span class="key">"State ID"</span>: <span>"04000US01"</span>,
      <span class="key">"State"</span>: <span>"Alabama"</span>,
      <span class="key">"Year"</span>: <span>2023</span>,
      <span class="key">"Population"</span>: <span>5054253</span>
    },
    {
      <span class="key">"State ID"</span>: <span>"04000US02"</span>,
      <span class="key">"State"</span>: <span>"Alaska"</span>,
      <span class="key">"Year"</span>: <span>2023</span>,
      <span class="key">"Population"</span>: <span>733971</span>
    },
    {
      <span class="key">"State ID"</span>: <span>"04000US04"</span>,
      <span class="key">"State"</span>: <span>"Arizona"</span>,
      <span class="key">"Year"</span>: <span>2023</span>,
      <span class="key">"Population"</span>: <span>7268175</span>
    },
    ...
  ]
}`;

/** API documentation (legacy `Data/API.jsx`). */
export default function ApiPage() {
  return (
    <div id="API">
      <h1>Introduction</h1>
      <p>
        The Data USA API allows users to explore the entire database using carefully constructed query
        strings, returning data as JSON results. All of the visualizations on the page have a
        &#34;show data&#34; button on their top-right that displays the API call(s) used to generate that
        visualization.
      </p>
      <p>The following sections describe the main components of the API:</p>
      <ol className="api-toc">
        <li><a href="#endpoints">Endpoints</a></li>
        <li><a href="#request">Anatomy of a Request</a></li>
        <li><a href="#response">Anatomy of a Response</a></li>
        <li><a href="#parameters">Advanced Parameters</a></li>
      </ol>

      <h2 id="endpoints">Endpoints</h2>
      <p>Below is a list of the core endpoints available:</p>
      <p><Code>/cubes</Code></p>
      <p>Returns a list of all available data cubes in the Tesseract server.</p>
      <ApiLink path="/cubes" strong="/cubes" />

      <p><Code>{"/cubes/{name}"}</Code></p>
      <p>Returns the full schema of a specific cube, including its measures, dimensions, and levels.</p>
      <ApiLink path="/cubes/acs_yg_total_population_5" strong="/cubes/acs_yg_total_population_5" />

      <p><Code>{"/members?cube=<name>&level=<level>"}</Code></p>
      <p>
        Returns all members (distinct categorization values) for a selected level of a given cube.
        This is useful for populating filters or understanding the scope of available data in a dimension level.
      </p>
      <ApiLink path="/members?cube=acs_yg_total_population_5&level=State" strong="/members?cube=acs_yg_total_population_5&level=State" />

      <p><Code>{"/data.{format}"}</Code></p>
      <p>
        This is the main endpoint used to fetch the data itself. You can query specific dimensions,
        measures, and filters to retrieve the dataset you&#39;re interested in.
      </p>
      <p>
        The <Code>{"data.{format}"}</Code> endpoint allows you to choose the desired format of the response. Supported formats are:
      </p>
      <ul className="api-list">
        <li><Code>csv</Code> Comma-separated values</li>
        <li><Code>tsv</Code> Tab-separated values</li>
        <li><Code>parquet</Code> Apache Parquet columnar binary format (for big data processing)</li>
        <li><Code>xlsx</Code> Microsoft Excel spreadsheet</li>
        <li><Code>jsonarrays</Code> JSON array of arrays (compact)</li>
        <li><Code>jsonrecords</Code> JSON array of objects (more readable)</li>
      </ul>

      <h2 id="request">Anatomy of a Request</h2>
      <p>
        To learn how the data endpoint works, let&#39;s break down the anatomy of an example API request.
        In this case we analyze the population by state in 2023:
      </p>
      <p>
        <a href={`${API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&include=Year:2023&drilldowns=State,Year`} target="_blank" rel="noopener noreferrer">
          {API}/data.jsonrecords?cube=acs_yg_total_population_5&drilldowns=State,Year&measures=Population&include=Year:2023&limit=100,0
        </a>
      </p>

      <h4><b>1. Root URL</b></h4>
      <p><Code>{`${API}/data.jsonrecords`}</Code></p>
      <p>
        This is the root URL for the API. It will be the same for all requests. This will return a JSON
        object with a list of records. If you prefer a different format, you can change the extension to
        <Code>.csv</Code>, <Code>.xlsx</Code>, or <Code>.parquet.</Code>
      </p>

      <h4><b>2. Cube (or dataset)</b></h4>
      <p><Code>?cube=acs_yg_total_population_5</Code></p>
      <p>This is the dataset you want to query. You can find the list of all available datasets by querying the cubes endpoint.</p>

      <h4><b>3. Drilldowns</b></h4>
      <p><Code>&drilldowns=State,Year</Code></p>
      <p>
        This is the drilldown you want to add to your query. Drilldowns represent the columns
        (or dimensions) that you want to see in the response. You can find the list of all
        available drilldowns for this specific cube (or dataset) by querying the
        acs_yg_total_population_5 cube endpoint.
      </p>

      <h4><b>4. Measures</b></h4>
      <p><Code>&measures=Population</Code></p>
      <p>
        This is the measure you want to add to your query. Measures represent the columns (or metrics)
        that you want to see in the response. You can find the list of all available measures for this
        specific cube (or dataset) by querying the acs_yg_total_population_5 cube endpoint. It is important to
        note that measures will automatically be aggregated by the cube&#39;s default aggregation function.
      </p>

      <h4><b>5. Include (or filter)</b></h4>
      <p><Code>&include=Year:2023</Code></p>
      <p>
        These are the filters you want to add to your query. Any column (or dimensions) availble to
        the specified cube can be used to filter the response. Multiple filters can be added by
        separating them with a semicolon. Filters take 2 parameters: the column name and the value
        you want to filter by. To find the available values for a specific column, you can query
        the members endpoint for that cube along with the level parameter. For example, to find the
        available values for the year column, you can query the &#39;Year&#39;
        members endpoint for the acs_yg_total_population_5 cube.
      </p>

      <h4><b>6. Limit and Offset</b></h4>
      <p><Code>&limit=100,0</Code></p>
      <p>
        This is the limit you want to add to your query where the first number is the limit and
        the second number is the offset. It is used to limit the number of records returned in
        the response.
      </p>

      <h2 id="response">Anatomy of a Response</h2>
      <p>
        To understand how the data is returned, let&#39;s break down the anatomy of an example response.
        In this case we&#39;re we&#39;ll stick with our previous example of the population by state in 2023:
      </p>
      <p>
        <a href={`${API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&include=Year:2023&drilldowns=State,Year`} target="_blank" rel="noopener noreferrer">
          {API}/data.jsonrecords?cube=acs_yg_total_population_5&drilldowns=State,Year&measures=Population&include=Year:2023&limit=100,0
        </a>
      </p>

      <h3>Response Format</h3>
      <p>The response will be a JSON object with the following structure:</p>
      <div className="code-box">
        <pre dangerouslySetInnerHTML={{__html: RESPONSE_EXAMPLE}} />
      </div>

      <h4><b>1. Annotations</b></h4>
      <p>
        The annotations object contains metadata about the dataset such as the source name, source description,
        topic, subtopic, and dataset name.
      </p>
      <h4><b>2. Pagination</b></h4>
      <p>
        The page object contains metadata about the pagination of the data response, such as the limit,
        offset, and total number of records available for that set of parameters.
      </p>
      <h4><b>3. Columns</b></h4>
      <p>
        The columns object contains the list of columns in the dataset. Please note that even though we didn&#39;t specify
        to include the ID columns in the request, they are still returned.
      </p>
      <h4><b>4. Data</b></h4>
      <p>
        The data object contains the list of records in the dataset. The keys are the column names
        (including both drilldown and measure columns) and the values are the values for that column
        for the given record.
      </p>

      <h2 id="parameters">Advanced Parameters</h2>
      <p>The API supports a number of advanced parameters that allow you to filter and sort the data.</p>

      <h4><b>1. Include Members</b></h4>
      <p>
        The include parameter allows you to specify the unique members of a dimension that should be
        considered when calculating measures. Users can specify one or more members to include, separated
        by commas (,). The format is as follows:
      </p>
      <p><Code>{"&include=<level_name>:<member_key>,<member_key>,<member_key>"}</Code></p>
      <p>
        You can specify one or more include parameters in the request, either in different keys or
        in the same key separated by semicolons (;).
      </p>
      <pre className="api-pre"><Code>{"&include=<level1>:<level1_member1>&include=<level2>:<level2_member1>,<level2_member2>\n&include=<level1>:<level1_member1>;<level2>:<level2_member1>,<level2_member2>"}</Code></pre>
      <p>For example, the following API call will include data only for the 2023 and for Alabama:</p>
      <p>
        <a href={`${API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&include=Year:2023;State:04000US01&drilldowns=State,Year`} target="_blank" rel="noopener noreferrer">
          {API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&include=Year:2023;State:04000US01&drilldowns=State,Year
        </a>
      </p>

      <h4><b>2. Exclude Members</b></h4>
      <p>
        In the same way that include specifies the unique members that should be considered, the exclude parameter specifies that all available
        members except those mentioned should be considered in the aggregation. The format is the same:
      </p>
      <pre className="api-pre"><Code>{"&exclude=<level1>:<level1_member1>;<level2>:<level2_member1>,<level2_member2>\n&exclude=<level1>:<level1_member1>&include=<level2>:<level2_member1>,<level2_member2>"}</Code></pre>
      <p>For example, the following API call will return data for all available states except for Alabama:</p>
      <p>
        <a href={`${API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&exclude=State:04000US01&drilldowns=State`} target="_blank" rel="noopener noreferrer">
          {API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&exclude=State:04000US01&drilldowns=State
        </a>
      </p>

      <h4><b>3. Parents</b></h4>
      <p>
        The parents parameter allows you to include parent members in hierarchical dimensions. You can either specify specific levels to include
        parents for, or use a boolean value to include all parents. The format is as follows:
      </p>
      <pre className="api-pre"><Code>{"&parents=<level1>,<level2>\n&parents=true"}</Code></pre>
      <p>For example, the following API call will include parent members for the County level:</p>
      <p>
        <a href={`${API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&include=Year:2023&drilldowns=County,Year&parents=True`} target="_blank" rel="noopener noreferrer">
          {API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&include=Year:2023&drilldowns=County,Year&parents=True
        </a>
      </p>

      <h4><b>4. Filters</b></h4>
      <p>The filters parameter allows you to filter results based on measure values using various comparison operations. The basic format is:</p>
      <p><Code>{"&filters=<measure>.<operation>"}</Code></p>
      <p><b>Null Operations</b></p>
      <p>You can filter for null or non-null values using:</p>
      <pre className="api-pre"><Code>{"&filters=Population.isnull\n&filters=Population.isnotnull"}</Code></pre>
      <p><b>Comparison Operations</b></p>
      <p>The following comparison operations are supported:</p>
      <ul className="api-list">
        <li><Code>gt</Code> {"Greater Than (>)"}</li>
        <li><Code>gte</Code> {"Greater Than or Equal (>=)"}</li>
        <li><Code>lt</Code> {"Less Than (<)"}</li>
        <li><Code>lte</Code> {"Less Than or Equal (<=)"}</li>
        <li><Code>eq</Code> {"Equal (==)"}</li>
        <li><Code>neq</Code> {"Not Equal (!=)"}</li>
      </ul>
      <p>For example, to filter for Population greater than 30 million:</p>
      <p><Code>&filters=Population.gt.30000000</Code></p>
      <p>You can also combine multiple conditions using .and./.or.. For example, to filter for population between 250,000 and 750,000:</p>
      <p><Code>&filters=Population.gt.250000.and.lt.750000</Code></p>

      <h4><b>5. Ranking and Sort</b></h4>
      <p>The API provides two parameters for ordering results: ranking and sort.</p>
      <p><b>Ranking</b></p>
      <p>
        The ranking parameter allows you to rank results based on a measure. You can specify the measure
        name with an optional minus sign for descending order, or use a boolean value. The format is:
      </p>
      <pre className="api-pre"><Code>{"&ranking=<measure>\n&ranking=-<measure>\n&ranking=<measure1>,-<measure2>\n&ranking=true"}</Code></pre>
      <p><b>Sort</b></p>
      <p>
        The sort parameter allows you to sort results by either a measure or a level (dimension).
        You can specify ascending or descending order. The format is:
      </p>
      <pre className="api-pre"><Code>{"&sort=<measure or level>.asc\n&sort=<measure or level>.desc"}</Code></pre>
      <p>For example, to sort by Population in ascending order:</p>
      <p>
        <a href={`${API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&include=Year:2023&drilldowns=State,Year&sort=Population.asc`} target="_blank" rel="noopener noreferrer">
          {API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&include=Year:2023&drilldowns=State,Year&sort=Population.asc
        </a>
      </p>
      <p>Or, to fetch the top state above a threshold of 30 million sorted by year:</p>
      <p>
        <a href={`${API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&drilldowns=State,Year&filters=Population.gt.30000000&sort=Year.desc`} target="_blank" rel="noopener noreferrer">
          {API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&drilldowns=State,Year&filters=Population.gt.30000000&sort=Year.desc
        </a>
      </p>

      <h4><b>6. TopK</b></h4>
      <p>
        The TopK parameter allows you to get the top N records for each unique combination of specified levels, sorted by a measure
        or level. The format is:
      </p>
      <p><Code>{"&top=<amount>.<level1>[,<level2>].<measure or level>.<order>"}</Code></p>
      <p>For example, to get the year of the highest population for each state:</p>
      <p>
        <a href={`${API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&drilldowns=State,Year&top=1.State.Population.desc`} target="_blank" rel="noopener noreferrer">
          {API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&drilldowns=State,Year&top=1.State.Population.desc
        </a>
      </p>
      <p>Or, to get the 2 years with the highest population for each state:</p>
      <p>
        <a href={`${API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&drilldowns=State,Year&top=2.State.Population.desc`} target="_blank" rel="noopener noreferrer">
          {API}/data.jsonrecords?cube=acs_yg_total_population_5&measures=Population&drilldowns=State,Year&top=2.State.Population.desc
        </a>
      </p>
      <p><b>Note:</b> All columns mentioned in the parameter must be present in the request, either in drilldowns or measures.</p>

      <h4><b>7. Time</b></h4>
      <p>The time parameter provides special filtering capabilities for time-based dimensions. It supports two main formats:</p>
      <p><b>Latest/Oldest Format</b></p>
      <p>This format allows you to fetch the most recent or oldest data points available in the dataset:</p>
      <pre className="api-pre"><Code>{"&time=<dimension>.latest[.amount]\n&time=<dimension>.oldest[.amount]"}</Code></pre>
      <p><b>Trailing/Leading Format</b></p>
      <p>
        This format allows you to set a time frame relative to the most/least recent record available in the dataset.
        Works similarly to the latest/oldest format, but is strictly time-based:
      </p>
      <pre className="api-pre"><Code>{"&time=<dimension>.trailing[.amount]\n&time=<dimension>.leading[.amount]"}</Code></pre>
      <StaticPageJsonLd page="api" />
    </div>
  );
}
