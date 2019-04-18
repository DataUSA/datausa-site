import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Carousel from "react-slick";
import SVG from "react-inlinesvg";
import {nest} from "d3-collection";

import Vizbuilder from "@datawheel/canon-vizbuilder";
import {Icon} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";
import "./Visualize.css";
import {badMeasures} from "d3plus.js";
import {titleCase} from "d3plus-text";
import colors from "../../static/data/colors.json";
import {Helmet} from "react-helmet";
import {addToCart, removeFromCart} from "actions/cart";
import {updateTitle} from "actions/title";
import Tile from "components/Tile/Tile";

import albersUsaPr from "helpers/albersUsaPr";

const measureConfig = {};
badMeasures.forEach(measure => {
  measureConfig[measure] = {
    colorScaleConfig: {
      color: colors.colorScaleBad
    }
  };
});

const StateTopojson = {
  projection: albersUsaPr(),
  ocean: "transparent",
  topojson: "/topojson/State.json"
};

const examples = [
  {
    title: "Foreign Born Citizens by State",
    group: "Heritage & Demographics",
    image: "/api/profile/cip/regional-studies-us-canadian-foreign/thumb",
    link: "/visualize?groups=0-1dX7e9&measure=ZHkGoL"
  },
  // {
  //   title: "Foreign Born Citizens by MSA",
  //   group: "Heritage & Demographics",
  //   image: "/api/profile/cip/4509/thumb",
  //   link: "/visualize?groups=0-Z1SqIjF&measure=64auG"
  // },
  {
    title: "Russian Speakers by State",
    group: "Heritage & Demographics",
    image: "/images/profile/russia.jpg",
    link: "/visualize?groups=0-RENB7&groups=1-ZUWzdA-9&measure=Z16D5yA"
  },
  {
    title: "Household Income by Race",
    group: "Heritage & Demographics",
    image: "/api/profile/cip/public-finance/thumb",
    link: "/visualize?groups=0-Z2pUFmW&measure=Zw5c4M"
  },

  {
    title: "Opioid Deaths by County",
    group: "Health",
    image: "/api/profile/cip/pharmacology/thumb",
    link: "/visualize?groups=0-QuaqK&measure=2sUCF4"
  },
  {
    title: "Adult Obesity by County",
    group: "Health",
    image: "/api/profile/cip/190505/thumb",
    link: "/visualize?groups=0-Z1X72Pg&measure=Z1iORxu"
  },
  {
    title: "Food Environment Index",
    group: "Health",
    image: "/api/profile/cip/120507/thumb",
    link: "/visualize?groups=0-Z1X72Pg&measure=Z1xNbvc"
  },
  {
    title: "Adults with Major Depressive Disorder by State",
    group: "Health",
    image: "/api/profile/cip/420101/thumb",
    link: "/visualize?groups=0-Zc58ag&measure=3DN30"
  },
  {
    title: "Adults who Cannot Afford a Doctor",
    group: "Health",
    image: "/api/profile/naics/6211/thumb",
    link: "/visualize?groups=0-14F1wI&measure=1wObYo"
  },

  {
    title: "Home Ownership by State",
    group: "Housing",
    image: "/api/profile/naics/531/thumb",
    link: "/visualize?groups=0-ezfEN&measure=26YVLn"
  },
  {
    title: "Average Commute Time by Metro Area",
    group: "Housing",
    image: "/api/profile/soc/474051/thumb",
    link: "/visualize?groups=0-17bOR7&measure=Z1iWzH4"
  },
  {
    title: "People Driving Alone to Work by County",
    group: "Housing",
    image: "/api/profile/soc/5360XX/thumb",
    link: "/visualize?groups=0-Z1X72Pg&measure=2bT8FH"
  },
  {
    title: "Renter Occupied Households by State",
    group: "Housing",
    image: "/api/profile/naics/4232/thumb",
    link: "/visualize?groups=0-ezfEN&groups=1-RSHig-1&measure=26YVLn"
  },

  {
    title: "Black Females working in the Software Industry by State",
    group: "Labor",
    image: "/api/profile/soc/151131/thumb",
    link: "/visualize?groups=0-1LK22m&groups=1-2rAHKG-2&groups=2-ZJJp1G-5112&groups=3-Z5TtG5-2&measure=ZkH9RT"
  },
  {
    title: "German-Borns Working in the Performing Arts Industry",
    group: "Labor",
    image: "/api/profile/cip/509999/thumb",
    link: "/visualize?groups=0-1LK22m&groups=1-Z1bHF5a-110&groups=2-ZJJp1G-711&measure=ZkH9RT"
  },
  {
    title: "Naturalized US Citizens Working as Computer Scientists and Web Developers",
    group: "Labor",
    image: "/api/profile/cip/110701/thumb",
    link: "/visualize?groups=0-1LK22m&groups=1-ZgqxGk-4&groups=2-ZUeVm5-151111~151131~151134~15113X&measure=ZkH9RT"
  },
  {
    title: "Median Earnings in the Construction Industry by State",
    group: "Labor",
    image: "/api/profile/cip/46/thumb",
    link: "/visualize?groups=0-Z1kzMyb&groups=1-AY10R-2&measure=2oJ9qr"
  },
  {
    title: "Income Inequality by Metro Area",
    group: "Labor",
    image: "/api/profile/napcs/41/thumb",
    link: "/visualize?groups=0-Z15PG9U&measure=nJdNt"
  },
  {
    title: "Coal Mining Workers by State",
    group: "Labor",
    image: "/api/profile/naics/mining-quarrying-oil-gas-extraction/thumb",
    link: "/visualize?filters=0-h3NC-5-5&filters=1-ZkH9RT-4-2000&groups=0-1LK22m&groups=1-ZJJp1G-2121&measure=ZkH9RT"
  },

  {
    title: "Admissions for Universities in the Boston Metro Area",
    group: "Education",
    image: "/api/profile/geo/boston-cambridge-quincy-ma-nh-metro-area/thumb",
    link: "/visualize?groups=0-1CdfJW&groups=1-1YEWx6-31000US14460&measure=Z1GSog1"
  },
  {
    title: "Default Rate by State",
    group: "Education",
    image: "/api/profile/soc/434131/thumb",
    link: "/visualize?groups=0-24s1dP&measure=ZdVPNx"
  },
  {
    title: "Engineering Graduates by Gender",
    group: "Education",
    image: "/api/profile/cip/14/thumb",
    link: "/visualize?groups=0-BNDBG&groups=1-Z2i3TId-14&measure=1g4zN3"
  },

  {
    title: "Department of Interior Spending by State",
    group: "Government",
    image: "/api/profile/geo/washington-dc/thumb",
    link: "/visualize?groups=0-Z1MxM8L&groups=1-1pz0Cl-14&measure=1e64mv"
  },
  {
    title: "National Science Foundations Grants by State",
    group: "Government",
    image: "/api/profile/soc/1930XX/thumb",
    link: "/visualize?groups=0-Z1MxM8L&groups=1-1pz0Cl-49&groups=2-Z27NDkh-Grant&measure=1e64mv"
  },
  {
    title: "Spending by Department of Defense by State",
    group: "Government",
    image: "/api/profile/soc/550000/thumb",
    link: "/visualize?groups=0-Z1MxM8L&groups=1-1pz0Cl-97&measure=1e64mv"
  }
];

const groupIcons = {
  "Health": "health",
  "Heritage & Demographics": "demographics",
  "Housing": "housing",
  "Labor": "workforce",
  "Education": "education",
  "Government": "operations"
};

const exampleGroups = nest()
  .key(d => d.group)
  .entries(examples);

const cartMax = 5;
const title = "Viz Builder";

class Visualize extends Component {

  constructor(props) {
    super(props);
    this.state = {
      intro: !props.router.location.search.length,
      query: {}
    };
  }

  componentDidMount() {
    this.props.updateTitle(title);
  }

  componentWillUnmount() {
    this.props.updateTitle(false);
  }

  showIntro() {
    this.setState({intro: true});
  }

  closeIntro() {
    this.setState({intro: false});
  }

  gotoExample(url) {
    const current = `${window.location.pathname}${window.location.search}`;
    if (url === current) this.setState({intro: false});
    else this.props.router.push(url);
  }

  componentDidUpdate(prevProps) {
    const {vizbuilder} = this.props;

    if (vizbuilder !== prevProps.vizbuilder && !vizbuilder.load.inProgress) {

      const {list} = this.context.formatters;
      const {query, uiParams} = vizbuilder;
      const {showConfidenceInt} = uiParams;

      const groups = query.groups.filter(d => d.key);
      const slug = `${query.measure.annotations._key}-${groups.map(d => d.key).join("-")}`;
      const params = {
        measures: [query.measure.name],
        drilldowns: groups.map(d => d.level.name)
      };

      groups.forEach(group => {
        if (group.members.length) params[group.level.name] = group.members.map(m => m.key).join(",");
      });

      if (showConfidenceInt) {
        if (query.moe) params.measures.push(query.moe.name);
        if (query.lci) params.measures.push(query.lci.name);
        if (query.uci) params.measures.push(query.uci.name);
      }

      const url = `/api/data?${Object.entries(params).map(([key, val]) => `${key}=${val}`).join("&")}`;

      const byGroups = groups
        .filter(group => !group.members.length)
        .map(group => group.level.name);

      const forGroups = groups
        .filter(group => group.members.length)
        .map(group => list(group.members.map(m => m.name)));

      const queryTitle = titleCase(`${query.measure.name}${byGroups.length ? ` by ${list(byGroups)}` : ""}${forGroups.length ? ` for ${list(forGroups)}` : ""}`);
      const format = "function(d) { return d.data; }";

      this.props.updateTitle(queryTitle);
      this.setState({query: {urls: [url], format, slug, title: queryTitle}});

    }

  }

  onCart() {

    const {query} = this.state;
    const {addToCart, cart, removeFromCart} = this.props;
    const inCart = cart.data.find(c => c.slug === query.slug);
    if (inCart) removeFromCart(query);
    else addToCart(query);

  }

  next() {
    this.carousel.slickNext();
  }

  previous() {
    this.carousel.slickPrev();
  }

  render() {
    const {intro, query} = this.state;
    const {cart, cube} = this.props;
    const cartSize = cart ? cart.data.length : 0;
    const inCart = cart ? cart.data.find(c => c.slug === query.slug) : false;

    const queryTitle = query.title || title;

    const SlickButtonFix = ({currentSlide, slideCount, children, ...props}) =>
      <div {...props}>{children}</div>;

    // slick config
    const carouselSettings = {
      dots: false, // may or may not be stupid, depending on how items we're showing
      infinite: false, // all things must come to an end
      speed: 300, // faster paging
      touchThreshold: 20, // easier swiping
      touchMove: false,
      // custom next/prev arrows
      prevArrow:
        <SlickButtonFix>
          <button className="slick-arrow-button" onClick={this.previous.bind(this)}>
            <Icon iconName="chevron-left" />
          </button>
        </SlickButtonFix>,
      nextArrow:
        <SlickButtonFix>
          <button className="slick-arrow-button" onClick={this.next.bind(this)}>
            <Icon iconName="chevron-right" />
          </button>
        </SlickButtonFix>,
      // layout (desktop first)
      slidesToShow: 4,
      slidesToScroll: 4,
      responsive: [
        {
          breakpoint: 1399,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 767,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    };

    if (intro) {
      return <div id="Visualize" className="visualize-intro">
        <Helmet title={queryTitle}>
          <meta property="og:title" content={ `${queryTitle} | Data USA` } />
        </Helmet>
        <div className="text">
          <h1>Viz Builder</h1>
          <p>
            Welcome to the Data USA custom visualization builder. This page allows you to select any indicator from the site. You may specify custom groupings and filters, and then view the resulting data as a series of visualizations based on your selection.
          </p>
          <p>
            The examples on the right are a small sample of what is possible with the Viz Builder. Click on one to get started!
          </p>
          <div className="advanced" onClick={this.closeIntro.bind(this)}>Go directly to interface &raquo;</div>
        </div>
        <div className="examples">
          { exampleGroups.map(d =>
            <div key={d.key} className="carousel">
              <h2><SVG src={`/icons/sections/${groupIcons[d.key]}.svg`} />{ d.key }</h2>
              <Carousel {...carouselSettings} ref={c => this.carousel = c}>
                {d.values.map(example => <Tile key={example.title} new={example.new} onClick={this.gotoExample.bind(this, example.link)} image={example.image} title={example.title} />)}
              </Carousel>
            </div>) }
        </div>
      </div>;
    }
    else {

      return <div id="Visualize">

        <Helmet title={queryTitle}>
          <meta property="og:title" content={ `${queryTitle} | Data USA` } />
        </Helmet>

        <Vizbuilder
          src={[cube]}
          defaultGroup={["Geography.State", "Origin State.Origin State", "Gender.Gender", "Age.Age"]}
          defaultMeasure="Total Population"
          groupLimit={4}
          measureConfig={measureConfig}
          tableLogic={cubes => {
            const cube = cubes.find(d => d.name.match(/_1/));
            return cube || cubes[0];
          }}
          config={{
            colorScaleConfig: {
              color: colors.colorScaleGood
            },
            colorScalePosition: "bottom",
            detectResizeDelay: 100,
            shapeConfig: {
              hoverOpacity: 1
            },
            zoomScroll: true
          }}
          topojson={{
            "County": {
              projection: albersUsaPr(),
              ocean: "transparent",
              topojson: "/topojson/County.json"
            },
            "MSA": {
              projection: albersUsaPr(),
              ocean: "transparent",
              topojson: "/topojson/Msa.json",
              topojsonFilter: d => d.id.indexOf("040") < 0
            },
            "PUMA": {
              projection: albersUsaPr(),
              ocean: "transparent",
              topojson: "/topojson/Puma.json"
            },
            "State": StateTopojson,
            "Origin State": StateTopojson,
            "Destination State": StateTopojson
          }}
          visualizations={[
            "geomap",
            "treemap",
            "barchart",
            "lineplot",
            "histogram",
            "stacked"
          ]}>
          <div className="custom-controls">
            <Tooltip2 placement="top-end">
              <div className={ `pt-button pt-fill pt-icon-shopping-cart ${ cartSize >= cartMax ? "pt-disabled" : "" }` } onClick={this.onCart.bind(this)}>
                { !cart ? "Loading Cart..." : inCart ? "Remove from Cart" : "Add Data to Cart" }
              </div>
              <span>
                { inCart ? "Remove this dataset from the cart."
                  : cartSize !== undefined && cartSize >= cartMax ? `Cart limit of ${cartSize} has been reached. Please visit the cart page to download the current cart and/or remove data.`
                    : "Add the underlying data to the cart, and merge with any existing cart data." }
              </span>
            </Tooltip2>
            <Tooltip2 className="absolute-title" placement="bottom">
              <h1 onClick={this.showIntro.bind(this)}>
                Viz Builder
              </h1>
              <span>
                Click to show some example queries.
              </span>
            </Tooltip2>
          </div>
        </Vizbuilder>

      </div>;
    }
  }

}

Visualize.contextTypes = {
  formatters: PropTypes.object
};

export default connect(state => ({
  cube: state.env.CUBE,
  cart: state.cart,
  vizbuilder: state.vizbuilder
}), dispatch => ({
  addToCart: build => dispatch(addToCart(build)),
  removeFromCart: build => dispatch(removeFromCart(build)),
  updateTitle: title => dispatch(updateTitle(title))
}))(Visualize);
