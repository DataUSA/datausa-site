import React, {Component} from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import {fetchData, LazyImage} from "@datawheel/canon-core";
import {formatAbbreviate} from "d3plus-format";
import {Geomap} from "d3plus-react";
import SVG from "react-inlinesvg";
import "./index.css";


import {format} from "d3-format";
const commas = format(",");

import Search from "toCanon/Search";

import Column from "./Column";

class Home extends Component {

  render() {

    const {router, tiles} = this.props;

    return (
      <div className="home">

        <header className="home-header">

          <div className="home-bg" />

          <div className="home-header-content">

            <div className="home-left">

              <img className="logo" src="/images/home/logo-shadow.png" alt="Data USA" />
              <div className="tagline">
                The definitive place to explore US public data
              </div>

              <Search
                buttonLink="/search/"
                className="home-search mobile"
                placeholder="Search reports"
                resultRender={d => <Link to={`/profile/${d.profile}/${d.slug || d.id}`} className="result-container">
                  <SVG className={`result-icon ${d.profile}`} src={ `/icons/dimensions/${d.dimension}.svg` } />
                  <div className="result-text">
                    <div className="title">{ d.name }</div>
                    <div className="sumlevel">{ d.hierarchy }</div>
                  </div>
                </Link>}
                url="/api/searchLegacy/"
              />

              <div className="report-counts">
                { tiles.map((column, i) => (
                  <Link to={column.url} className={`report-count ${column.slug}`} key={i}>
                    <div className="report-count-icon">
                      <SVG src={column.icon} height={25} width="auto" />
                    </div>
                    <div>
                      <div>{commas(column.total)}</div>
                      <div>{column.title}</div>
                    </div>
                  </Link>
                ))}
              </div>

            </div>

            <div className="home-right">
              <Search
                buttonLink="/search/"
                className="home-search"
                placeholder="Search reports"
                primary={true}
                resultRender={d => <Link to={`/profile/${d.profile}/${d.slug || d.id}`} className="result-container">
                  <SVG className={`result-icon ${d.profile}`} src={ `/icons/dimensions/${d.dimension}.svg` } />
                  <div className="result-text">
                    <div className="title">{ d.name }</div>
                    <div className="sumlevel">{ d.hierarchy }</div>
                  </div>
                </Link>}
                url="/api/searchLegacy/"
              />

              <Geomap config={{
                data: `/api/data?drilldowns=State&year=latest&measures=Population`,
                groupBy: "ID State",
                label: d => d.State,
                legend: false,
                loadingHTML: "",
                ocean: "transparent",
                on: {
                  click: d => {
                    router.push(`/profile/geo/${d["Slug State"]}`);
                  }
                },
                projection:
                  typeof window !== "undefined"
                    ? window.albersUsaPr()
                    : "geoMercator",
                shapeConfig: {
                  Path: {
                    fill: d => "rgba(64, 74, 89, 0.4)",
                    fillOpacity: 1,
                    stroke: "#6d7b8e",
                    strokeOpacity: 1,
                    strokeWidth: 0.5
                  }
                },
                tiles: false,
                tooltipConfig: {
                  footer: `<img src="/icons/tooltip/template.svg" style="padding-right:2px;"/> Click to View Report`,
                  tbody: [
                    ["Year", d => d.Year],
                    ["Population", d => formatAbbreviate(d.Population)]
                  ]
                },
                topojson: "/topojson/State.json",
                zoom: false
              }} />

            </div>

          </div>

          <div className="company-logos">
            <a target="_blank" rel="noopener noreferrer" href="http://www2.deloitte.com/us/en.html">
              <img id="deloitte" src="/images/home/logos/deloitte.png" />
            </a>
            <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/">
              <img id="datawheel" src="/images/home/logos/datawheel.png" />
            </a>
          </div>

        </header>

        <section className="dark stripe">
          <span className="stripe-title">Daily Updates</span>
          <span className="stripe-desc">Explore the latest Covid-19 numbers in the United States</span>
          <Link to="/coronavirus" className="arrow-link light">Go to COVID Explorer</Link>
        </section>

        <section className="light">
          <div className="home-flex">
            <div className="home-text">
              <h2>
                Browse through more than 47,000 automated reports
              </h2>
              <p>
                Data USA puts public US Government data in your hands. Instead of searching through multiple data sources that are often incomplete and difficult to access, our platform provides an open, easy-to-use platform that turns data into knowledge.
              </p>
              <div className="feature-items">
                <div className="feature-item">
                  <div className="feature-icon">
                    <SVG className="feature-data" src="/icons/features/data.svg" width={25} height="auto" />
                  </div>
                  <span>
                    View aggregated data
                  </span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <SVG src="/icons/features/cart.svg" width={25} height="auto" />
                  </div>
                  <span>
                    Merge and download data
                  </span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <SVG src="/icons/features/compare.svg" width={25} height="auto" />
                  </div>
                  <span>
                    Compare reports
                  </span>
                </div>
              </div>
              <Link to="/search" className="arrow-link">
                Search Reports
              </Link>
            </div>
            <LazyImage
              imageProps={{
                className: "home-image home-mockup",
                src: "/images/home/home-mockup.png",
                alt: "Data USA Mockups"
              }}
              backgroundImage={true}
            />
          </div>
        </section>

        <section className="report-grid">
          <h2>
            Recent popular reports
          </h2>
          <div className="report-columns">
            { tiles.map((column, i) => <Column key={i} data={column} />)}
          </div>
          <Link to="/search" className="arrow-link light">
            Search All Reports
          </Link>
        </section>

        <section className="light">
          <h2>
            The most powerful tools
            <br />
            in U.S. public data
          </h2>
          <div className="home-split">
            <LazyImage
              imageProps={{
                className: "home-image home-graphic",
                src: "/icons/pages/vizbuilder-graphic.png",
                alt: "Viz Builder Graphic"
              }}
            />
            <div className="home-text">
              <div className="page-icon">
                <SVG src="/icons/pages/vizbuilder-icon.svg" width={40} height="auto" />
              </div>
              <h3>
                Viz Builder
              </h3>
              <p>
                The Viz Builder tool allows you to dig even deeper into US public data. You can select any indicator from the site, specify custom groupings and filters, and then view the resulting data as a series of visualizations based on your selection.
              </p>
              <Link to="/visualize" className="arrow-link">
                Go to the Viz Builder
              </Link>
            </div>
          </div>
          <div className="home-split">
            <div className="home-text">
              <div className="page-icon">
                <SVG src="/icons/pages/map-icon.svg" width={40} height="auto" />
              </div>
              <h3>
                National Maps
              </h3>
              <p>
                The national mapping tool facilitates the creation of custom US choropleth maps based on any of the indicators available on the site.
              </p>
              <Link to="/map" className="arrow-link">
                Go to Maps
              </Link>
            </div>
            <LazyImage
              imageProps={{
                className: "home-image home-graphic",
                src: "/icons/pages/map-graphic.png",
                alt: "Map Graphic"
              }}
            />
          </div>
        </section>

      </div>
    );

  }

}

Home.need = [
  fetchData("home", "/api/home")
];

export default connect(state => ({tiles: state.data.home}))(Home);
