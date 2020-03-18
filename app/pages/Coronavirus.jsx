import React, {Component} from "react";
import {connect} from "react-redux";
import axios from "axios";
import {NonIdealState, Slider, Spinner} from "@blueprintjs/core";
import {Helmet} from "react-helmet";
import {AnchorLink} from "@datawheel/canon-core";

import {max, merge} from "d3-array";
import {nest} from "d3-collection";
import {timeFormat} from "d3-time-format";
const dayFormat = timeFormat("%A %B %d");
const dateFormat = timeFormat("%b %d");
const hourFormat = timeFormat("%I:%M %p");

import {colorLegible} from "d3plus-color";
import {assign, unique} from "d3plus-common";
import {formatAbbreviate} from "d3plus-format";
import {titleCase} from "d3plus-text";
import {LinePlot} from "d3plus-react";

import "./Coronavirus.css";
import {divisions, stateToDivision} from "helpers/stateDivisions";
import colors from "../../static/data/colors.json";
import {updateTitle} from "actions/title";

import SectionIcon from "toCanon/SectionIcon";

class UncontrolledSlider extends React.Component {
  state = {value: 0};
  componentWillMount() {
    const {initialValue} = this.props;
    this.setState({
      value: initialValue
    });
  }
  render() {
    const {value} = this.state;
    const {initialValue, ...rest} = this.props;

    return (
      <Slider
        {...{...rest, value}}
        onChange={value => {
          this.setState({value});
        }}
      />
    );
  }
}

const stateAbbreviations = {"Arizona": "AZ", "Alabama": "AL", "Alaska": "AK", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"};
const countryAbbreviations = {"Afghanistan": "AFG", "Åland Islands": "ALA", "Albania": "ALB", "Algeria": "DZA", "American Samoa": "ASM", "Andorra": "AND", "Angola": "AGO", "Anguilla": "AIA", "Antarctica": "ATA", "Antigua and Barbuda": "ATG", "Argentina": "ARG", "Armenia": "ARM", "Aruba": "ABW", "Australia": "AUS", "Austria": "AUT", "Azerbaijan": "AZE", "Bahamas": "BHS", "Bahrain": "BHR", "Bangladesh": "BGD", "Barbados": "BRB", "Belarus": "BLR", "Belgium": "BEL", "Belize": "BLZ", "Benin": "BEN", "Bermuda": "BMU", "Bhutan": "BTN", "Bolivia (Plurinational State of)": "BOL", "Bonaire, Sint Eustatius and Saba": "BES", "Bosnia and Herzegovina": "BIH", "Botswana": "BWA", "Bouvet Island": "BVT", "Brazil": "BRA", "British Indian Ocean Territory": "IOT", "Brunei Darussalam": "BRN", "Bulgaria": "BGR", "Burkina Faso": "BFA", "Burundi": "BDI", "Cabo Verde": "CPV", "Cambodia": "KHM", "Cameroon": "CMR", "Canada": "CAN", "Cayman Islands": "CYM", "Central African Republic": "CAF", "Chad": "TCD", "Chile": "CHL", "China": "CHN", "Christmas Island": "CXR", "Cocos (Keeling) Islands": "CCK", "Colombia": "COL", "Comoros": "COM", "Congo": "COG", "Congo, Democratic Republic of the": "COD", "Cook Islands": "COK", "Costa Rica": "CRI", "Côte d'Ivoire": "CIV", "Croatia": "HRV", "Cuba": "CUB", "Curaçao": "CUW", "Cyprus": "CYP", "Czechia": "CZE", "Denmark": "DNK", "Djibouti": "DJI", "Dominica": "DMA", "Dominican Republic": "DOM", "Ecuador": "ECU", "Egypt": "EGY", "El Salvador": "SLV", "Equatorial Guinea": "GNQ", "Eritrea": "ERI", "Estonia": "EST", "Eswatini": "SWZ", "Ethiopia": "ETH", "Falkland Islands (Malvinas)": "FLK", "Faroe Islands": "FRO", "Fiji": "FJI", "Finland": "FIN", "France": "FRA", "French Guiana": "GUF", "French Polynesia": "PYF", "French Southern Territories": "ATF", "Gabon": "GAB", "Gambia": "GMB", "Georgia": "GEO", "Germany": "DEU", "Ghana": "GHA", "Gibraltar": "GIB", "Greece": "GRC", "Greenland": "GRL", "Grenada": "GRD", "Guadeloupe": "GLP", "Guam": "GUM", "Guatemala": "GTM", "Guernsey": "GGY", "Guinea": "GIN", "Guinea-Bissau": "GNB", "Guyana": "GUY", "Haiti": "HTI", "Heard Island and McDonald Islands": "HMD", "Holy See": "VAT", "Honduras": "HND", "Hong Kong": "HKG", "Hungary": "HUN", "Iceland": "ISL", "India": "IND", "Indonesia": "IDN", "Iran (Islamic Republic of)": "IRN", "Iraq": "IRQ", "Ireland": "IRL", "Isle of Man": "IMN", "Israel": "ISR", "Italy": "ITA", "Jamaica": "JAM", "Japan": "JPN", "Jersey": "JEY", "Jordan": "JOR", "Kazakhstan": "KAZ", "Kenya": "KEN", "Kiribati": "KIR", "Korea (Democratic People's Republic of)": "PRK", "Korea, Republic of": "KOR", "Kuwait": "KWT", "Kyrgyzstan": "KGZ", "Lao People's Democratic Republic": "LAO", "Latvia": "LVA", "Lebanon": "LBN", "Lesotho": "LSO", "Liberia": "LBR", "Libya": "LBY", "Liechtenstein": "LIE", "Lithuania": "LTU", "Luxembourg": "LUX", "Macao": "MAC", "Madagascar": "MDG", "Malawi": "MWI", "Malaysia": "MYS", "Maldives": "MDV", "Mali": "MLI", "Malta": "MLT", "Marshall Islands": "MHL", "Martinique": "MTQ", "Mauritania": "MRT", "Mauritius": "MUS", "Mayotte": "MYT", "Mexico": "MEX", "Micronesia (Federated States of)": "FSM", "Moldova, Republic of": "MDA", "Monaco": "MCO", "Mongolia": "MNG", "Montenegro": "MNE", "Montserrat": "MSR", "Morocco": "MAR", "Mozambique": "MOZ", "Myanmar": "MMR", "Namibia": "NAM", "Nauru": "NRU", "Nepal": "NPL", "Netherlands": "NLD", "New Caledonia": "NCL", "New Zealand": "NZL", "Nicaragua": "NIC", "Niger": "NER", "Nigeria": "NGA", "Niue": "NIU", "Norfolk Island": "NFK", "North Macedonia": "MKD", "Northern Mariana Islands": "MNP", "Norway": "NOR", "Oman": "OMN", "Pakistan": "PAK", "Palau": "PLW", "Palestine, State of": "PSE", "Panama": "PAN", "Papua New Guinea": "PNG", "Paraguay": "PRY", "Peru": "PER", "Philippines": "PHL", "Pitcairn": "PCN", "Poland": "POL", "Portugal": "PRT", "Puerto Rico": "PRI", "Qatar": "QAT", "Réunion": "REU", "Romania": "ROU", "Russian Federation": "RUS", "Rwanda": "RWA", "Saint Barthélemy": "BLM", "Saint Helena, Ascension and Tristan da Cunha": "SHN", "Saint Kitts and Nevis": "KNA", "Saint Lucia": "LCA", "Saint Martin (French part)": "MAF", "Saint Pierre and Miquelon": "SPM", "Saint Vincent and the Grenadines": "VCT", "Samoa": "WSM", "San Marino": "SMR", "Sao Tome and Principe": "STP", "Saudi Arabia": "SAU", "Senegal": "SEN", "Serbia": "SRB", "Seychelles": "SYC", "Sierra Leone": "SLE", "Singapore": "SGP", "Sint Maarten (Dutch part)": "SXM", "Slovakia": "SVK", "Slovenia": "SVN", "Solomon Islands": "SLB", "Somalia": "SOM", "South Africa": "ZAF", "South Georgia and the South Sandwich Islands": "SGS", "South Sudan": "SSD", "Spain": "ESP", "Sri Lanka": "LKA", "Sudan": "SDN", "Suriname": "SUR", "Svalbard and Jan Mayen": "SJM", "Sweden": "SWE", "Switzerland": "CHE", "Syrian Arab Republic": "SYR", "Taiwan, Province of China": "TWN", "Tajikistan": "TJK", "Tanzania, United Republic of": "TZA", "Thailand": "THA", "Timor-Leste": "TLS", "Togo": "TGO", "Tokelau": "TKL", "Tonga": "TON", "Trinidad and Tobago": "TTO", "Tunisia": "TUN", "Turkey": "TUR", "Turkmenistan": "TKM", "Turks and Caicos Islands": "TCA", "Tuvalu": "TUV", "Uganda": "UGA", "Ukraine": "UKR", "United Arab Emirates": "ARE", "United Kingdom of Great Britain and Northern Ireland": "GBR", "United States of America": "USA", "United States Minor Outlying Islands": "UMI", "Uruguay": "URY", "Uzbekistan": "UZB", "Vanuatu": "VUT", "Venezuela (Bolivarian Republic of)": "VEN", "Viet Nam": "VNM", "Virgin Islands (British)": "VGB", "Virgin Islands (U.S.)": "VIR", "Wallis and Futuna": "WLF", "Western Sahara": "ESH", "Yemen": "YEM", "Zambia": "ZMB", "Zimbabwe": "ZWE"};

const labelSpace = 10;

/** */
function calculateDomain(data) {
  if (data && data instanceof Array && data.length) {
    const domain = unique(data.map(d => d.Date)).sort((a, b) => a - b);
    let lastDate = domain[domain.length - 1];
    const endDate = lastDate + (lastDate  - domain[0]) / labelSpace;
    lastDate = new Date(lastDate);
    while (domain[domain.length - 1] < endDate) {
      lastDate.setDate(lastDate.getDate() + 1);
      domain.push(lastDate.getTime());
    }
    return domain;
  }
  return [];
}

/** */
function calculateDayDomain(data) {
  if (data && data instanceof Array && data.length) {
    const domain = unique(data.map(d => d.Days)).sort((a, b) => a - b);
    let lastDate = domain[domain.length - 1];
    const endDate = lastDate + (lastDate  - domain[0]) / labelSpace;
    while (domain[domain.length - 1] < endDate) {
      lastDate++;
      domain.push(lastDate);
    }
    return domain;
  }
  return [];
}

class Coronavirus extends Component {

  constructor(props) {
    super(props);
    this.state = {
      countryCutoffData: [],
      countryData: [],
      cutoff: 10,
      countries: false,
      data: false,
      date: false,
      level: "state",
      measure: "Confirmed",
      scale: "linear",
      stateCutoffData: [],
      stateData: [],
      title: "Coronavirus in the United States"
    };
  }

  componentWillUnmount() {
    this.props.updateTitle(false);
  }

  componentDidMount() {
    const {title} = this.state;
    this.props.updateTitle(title);
    axios.get("/api/coronavirus/state")
      .then(resp => resp.data)
      .then(resp => {

        const data = resp.data
          .map(d => {
            d.Date = new Date(d.Date).getTime();
            d.ConfirmedPC = d.Confirmed / resp.population[d["ID Geography"]] * 100000;
            if (d.Level === "state") {
              const dID = stateToDivision[d["ID Geography"]];
              let division = divisions.find(x => x["ID Division"] === dID);
              if (!division) division = divisions.find(x => x["ID Division"] === 5);
              return Object.assign(d, division);
            }
            return d;
          });

        const countries = resp.countries
          .map(d => {
            d["ID Geography"] = countryAbbreviations[d.Geography] || d.Geography;
            d.Date = new Date(d.Date).getTime();
            d.ConfirmedPC = d.Confirmed / resp.world[d.Geography] * 100000;
            const division = divisions.find(x => x["ID Region"] === 6);
            return Object.assign(d, division);
          });

        this.setState({countries, data, date: new Date(resp.timestamp)}, this.prepData.bind(this));
      })
      .catch(() => this.setState({data: "Error loading data, please try again later."}));
  }

  changeCutoff(value) {
    this.setState({cutoff: value}, this.prepData.bind(this));
  }

  changeScale(event) {
    this.setState({scale: event.target.value});
  }

  prepData() {

    const {countries, cutoff, data, level, measure} = this.state;

    const stateData = data instanceof Array ? data.filter(d => d.Level === level) : [];

    const stateCutoffData = merge(nest()
      .key(d => d["ID Geography"])
      .entries(stateData)
      .map(group => {
        let days = 0;
        return group.values
          .reduce((arr, d) => {
            if (d.Confirmed >= cutoff) {
              days++;
              d.Days = days;
              arr.push(d);
            }
            return arr;
          }, []);
      }).sort((a, b) => max(b, d => d[measure]) - max(a, d => d[measure])));

    const countryData = countries;

    const countryCutoffData = merge(nest()
      .key(d => d["ID Geography"])
      .entries(countries)
      .map(group => {
        let days = 0;
        return group.values
          .reduce((arr, d) => {
            if (d.Confirmed >= 50) {
              days++;
              d.Days = days;
              arr.push(d);
            }
            return arr;
          }, []);
      }).sort((a, b) => max(b, d => d[measure]) - max(a, d => d[measure])))
      .concat(stateCutoffData);

    // const visibleLabels = {};
    // const labelSpace = 5;
    // nest()
    //   .key(d => d["ID Geography"])
    //   .entries(stateData)
    //   .forEach(group => {
    //     const d = group.values[group.values.length - 1];
    //     const compares = stateData
    //       .filter(v => v.Days === d.Days)
    //       .sort((a, b) => a[measure] - b[measure]);
    //     const i = compares.indexOf(d);
    //     const prevDiff = compares[i - 1] ? d[measure] - compares[i - 1][measure] : Infinity;
    //     const nextDiff = compares[i + 1] ? compares[i + 1][measure] - d[measure] : Infinity;
    //     if (prevDiff > labelSpace || nextDiff > labelSpace) {
    //       visibleLabels[group.key] = true;
    //     }
    //   });

    this.setState({stateCutoffData, stateData, countryCutoffData, countryData});
  }

  render() {

    const {
      countryCutoffData,
      countryData,
      cutoff,
      date,
      measure,
      scale,
      stateCutoffData,
      stateData,
      title
    } = this.state;

    const w = typeof window !== "undefined" ? window.innerWidth : 1200;
    const smallLabels = w < 768;

    const maxValue = max(stateData, d => d[measure]);
    const maxValuePC = max(stateData, d => d[`${measure}PC`]);
    const maxValueWorldPC = max(countryData, d => d[`${measure}PC`]);
    const minValue = scale === "log" ? 1 : 0;

    const stateDomain = calculateDomain(stateData);
    const stateCutoffDomain = calculateDayDomain(stateCutoffData);
    const countryDomain = calculateDomain(countryData);
    const countryCutoffDomain = calculateDayDomain(countryCutoffData);
    const countryCutoffLabels = countryCutoffDomain.filter(d => d === 1 || d % 10 === 0);

    const labelWidth = stateCutoffDomain.length ? w / (stateCutoffDomain[stateCutoffDomain.length - 1] + 1) : 0;

    const sharedConfig = {
      aggs: {
        "ID Division": arr => arr[0],
        "ID Region": arr => arr[0]
      },
      discrete: "x",
      groupBy: ["ID Region", "ID Geography"],
      label: d => d.Geography instanceof Array ? d.Region : d.Geography,
      legendTooltip: {
        tbody: []
      },
      on: {
        mouseenter(d) {
          if (d["ID Geography"] instanceof Array) this.hover(h => (h.data || h)["ID Region"] === d["ID Region"]);
          else this.hover(h => h["ID Geography"] === d["ID Geography"]);
        }
      },
      shapeConfig: {
        hoverOpacity: 0.25,
        Line: {
          label: d =>
            smallLabels
              ? stateAbbreviations[d.Geography] || countryAbbreviations[d.Geography] || d.Geography
              : d.Geography,
          labelConfig: {
            fontColor: d => colorLegible(colors.Region[d["ID Region"]]),
            fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
            fontSize: () => 14,
            padding: 0,
            verticalAlign: "middle"
          },
          labelBounds: (d, i, s) => {
            // if (visibleLabels[d["ID Geography"]]) {
            const [firstX, firstY] = s.points[0];
            const [lastX, lastY] = s.points[s.points.length - 1];
            const height = 30;
            return   {
              x: lastX - firstX + 5,
              y: lastY - firstY - height / 2 + 1,
              width: labelWidth,
              height
            };
            // }
            // return false;
          },
          sort: a => a["ID Region"] !== 6 ? 1 : -1,
          stroke: d => colors.Region[d["ID Region"]]
        }
      },
      tooltipConfig: {
        tbody: [
          ["Date", d => dayFormat(new Date(d.Date))],
          ["Confirmed", d => formatAbbreviate(d.Confirmed)],
          ["Cases per 100,000", d => formatAbbreviate(d.ConfirmedPC)],
          ["Recovered", d => formatAbbreviate(d.Recovered)],
          ["Deaths", d => formatAbbreviate(d.Deaths)]
        ]
      },
      y: measure,
      yConfig: {
        barConfig: {
          stroke: "transparent"
        },
        domain: [minValue, maxValue],
        scale,
        tickFormat: formatAbbreviate,
        title: `${measure}${measure !== "Deaths" ? " Cases" : ""} (${scale === "log" ? "Logarithmic" : "Linear"})`
      }
    };

    const AxisToggle = () =>
      <label className="pt-label pt-inline">
        Y-Axis Scale
        <div className="pt-select">
          <select value={scale} onChange={this.changeScale.bind(this)}>
            <option value="linear">Linear</option>
            <option value="log">Logarithmic</option>
          </select>
        </div>
      </label>;

    const CutoffToggle = () =>
      <div className="cutoff-slider">
        <UncontrolledSlider
          initialValue={cutoff}
          min={0}
          max={100}
          labelStepSize={10}
          onRelease={this.changeCutoff.bind(this)}
        />
      </div>;

    return <div id="Coronavirus">

      <Helmet title={title}>
        <meta property="og:title" content={ `${title} | Data USA` } />
      </Helmet>

      <div id="Splash" className="splash-coronavirus">
        {/* <div className="image-container">
          <div className="image" style={{backgroundImage: "url('')"}}></div>
        </div> */}
        <div className="content-container">
          <h1 className="profile-title">Coronavirus in the United States</h1>
        </div>
        <div className="content-container">
          {date && <div className="profile-subtitle">
            Last updated on {dayFormat(date)} at {hourFormat(date)}.
          </div>}
        </div>
        <div className="splash-columns">
          <p>
            How is Coronavirus spreading in the United States? How fast is it growing in each state? And how are different states prepared to cope with the spread of this global pandemic?
          </p>
          <p>
            At Data USA, we have the mission to visualize and distribute data of U.S. public interest. To honor that mission, we have created a series of interactive graphics to help track the evolution of Coronavirus (also known as COVID-19 and SARS-COV 2). These visualizations help put the spread of coronavirus in context, and the preparedness of different U.S. states in context.
          </p>
          <p>
            The sources of this data are: <a href="https://github.com/CSSEGISandData/COVID-19" target="_blank" rel="noopener noreferrer">Johns Hopkins University</a>, the Kaiser Family Foundation, and the World Bank’s World Development Indicators.
          </p>
        </div>
        <div className="profile-sections">
          <SectionIcon slug="cases" title="Cases by State" />
          <SectionIcon slug="growth" title="Growth Rate" />
          <SectionIcon slug="risks" title="Risks and Readiness" />
        </div>
      </div>

      <div id="coronavirus-main">

        <div className="Section coronavirus-section">
          <h2 className="section-title">
            <AnchorLink to="cases" id="cases" className="anchor">
              Cases by State
            </AnchorLink>
          </h2>
          <div className="section-body">
            <div className="section-content">
              <AnchorLink to="cases-total" className="anchor">Total</AnchorLink>
              <AnchorLink to="cases-pc" className="anchor">Per Capita</AnchorLink>
              <AnchorLink to="cases-adj" className="anchor">Time Adjusted</AnchorLink>
              <AnchorLink to="cases-intl" className="anchor">International Comparison</AnchorLink>
            </div>
          </div>
          <div className="section-topics">

            <div className="topic TextViz">
              <div className="topic-content">
                <h3 id="cases-total" className="topic-title">
                  <a href="cases-total" className="anchor">Total Confirmed Cases by Date</a>
                </h3>
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    This chart shows the number of confirmed COVID-19 cases in each U.S. state by date. It is the simplest of all charts, which does not control for the size of a state, or the time the spread began.
                  </p>
                </div>
              </div>
              <div className="visualization topic-visualization">
                { stateData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateData,
                    x: "Date",
                    xConfig: {
                      domain: stateDomain,
                      tickFormat: dateFormat
                    }
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

            <div className="topic TextViz">
              <div className="topic-content">
                <h3 id="cases-pc" className="topic-title">
                  <a href="cases-pc" className="anchor">Total Confirmed Cases per Capita</a>
                </h3>
                <div className="topic-description">
                  <p>
                    This chart normalizes the number of confirmed COVID-19 cases divided by the population of each state. It gives an idea of the density of COVID-19 infections by state.
                  </p>
                </div>
              </div>
              <div className="visualization topic-visualization">
                { stateData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateData,
                    x: "Date",
                    xConfig: {
                      domain: stateDomain,
                      tickFormat: dateFormat
                    },
                    y: `${measure}PC`,
                    yConfig: {
                      domain: [0, maxValuePC],
                      scale: "linear",
                      title: `${measure}${measure !== "Deaths" ? " Cases" : ""} per 100,000`
                    }
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

            <div className="topic TextViz">
              <div className="topic-content">
                <h3 id="cases-adj" className="topic-title">
                  <a href="cases-adj" className="anchor">Total Confirmed Cases Since Reaching {cutoff} Cases</a>
                </h3>
                <CutoffToggle />
                <AxisToggle />
                <div className="topic-description">
                  <p>
                    Since the spread of COVID-19 did not start at the same time in all states, we can shift the temporal axis to make it relative to an event, such as 10, 50, or 100 cases.
                  </p>
                  <p>
                    Move the slider to adjust this threshold.
                  </p>
                </div>
              </div>
              <div className="visualization topic-visualization">
                { stateCutoffData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: stateCutoffData,
                    x: "Days",
                    xConfig: {
                      domain: stateCutoffDomain,
                      tickFormat: d => `${formatAbbreviate(d)} day${d !== 1 ? "s" : ""}`,
                      title: `Days Since ${cutoff} Confirmed Cases`
                    },
                    yConfig: {
                      domain: [cutoff, maxValue]
                    }
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

            <div className="topic TextViz">
              <div className="topic-content">
                <h3 id="cases-intl" className="topic-title">
                  <a href="cases-intl" className="anchor">International Comparison</a>
                </h3>
                <div className="topic-description">
                  <p>
                    To get a sense of how the COVID-19 trajectory in the U.S. states compares with other countries, we present the per capita number of total cases for each state that has reported more than 50 cases, starting from the day they reported 50 cases.
                  </p>
                </div>
              </div>
              <div className="visualization topic-visualization">
                { countryCutoffData.length
                  ? <LinePlot className="d3plus" config={assign({}, sharedConfig, {
                    data: countryCutoffData,
                    x: "Days",
                    xConfig: {
                      domain: countryCutoffDomain,
                      labels: countryCutoffLabels,
                      tickFormat: d => `${formatAbbreviate(d)} day${d !== 1 ? "s" : ""}`,
                      title: "Days Since 50 Confirmed Cases"
                    },
                    y: `${measure}PC`,
                    yConfig: {
                      domain: [0, maxValueWorldPC],
                      scale: "linear",
                      title: `${measure}${measure !== "Deaths" ? " Cases" : ""} per 100,000`
                    }
                  })} />
                  : <NonIdealState title="Loading Data..." visual={<Spinner />} /> }
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>;

  }

}

export default connect(null, dispatch => ({
  updateTitle: title => dispatch(updateTitle(title))
}))(Coronavirus);
