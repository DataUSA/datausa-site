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
import colors from "../../static/data/colors.json";
import {Helmet} from "react-helmet";
import {addToCart, removeFromCart} from "actions/cart";
import {updateTitle} from "actions/title";

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
    link: "/visualize?groups=0-TBhjH&measure=64auG"
  },
  {
    title: "Foreign Born Citizens by MSA",
    group: "Heritage & Demographics",
    link: "/visualize?groups=0-Z1SqIjF&measure=64auG"
  },
  {
    title: "Russian Speakers by State",
    group: "Heritage & Demographics",
    link: "/visualize?groups=0-1cCiqp&groups=1-ZdEVTH-11&measure=ZjsmSE"
  },
  {
    title: "Household Income by Race",
    group: "Heritage & Demographics",
    link: "/visualize?groups=0-Z2pUFmW&measure=Zw5c4M"
  },

  {
    title: "Opioid Deaths by County",
    group: "Health",
    link: "/visualize?groups=0-QuaqK&measure=2sUCF4"
  },
  {
    title: "Adult Obesity by County",
    group: "Health",
    link: "/visualize?groups=0-Z1X72Pg&measure=Z1iORxu"
  },
  {
    title: "Food Environment Index",
    group: "Health",
    link: "/visualize?groups=0-Z1X72Pg&measure=Z1xNbvc"
  },
  {
    title: "Adults with Major Depressive Disorder by State",
    group: "Health",
    link: "/visualize?groups=0-Zc58ag&measure=3DN30"
  },
  {
    title: "Adults who Cannot Afford a Doctor",
    group: "Health",
    link: "/visualize?groups=0-14F1wI&measure=1wObYo"
  },

  {
    title: "Home Ownership by State",
    group: "Housing",
    link: "/visualize?groups=0-Z4LzeD&measure=Z1X8D4i"
  },
  {
    title: "Average Commute Time by Metro Area",
    group: "Housing",
    link: "/visualize?groups=0-ZNTHUM&measure=ZMlbux"
  },
  {
    title: "People Driving Alone to Work by County",
    group: "Housing",
    link: "/visualize?groups=0-Z1X72Pg&measure=2bT8FH"
  },
  {
    title: "Renter Occupied Households by State",
    group: "Housing",
    link: "/visualize?groups=0-Z4LzeD&groups=1-Z1xMhVU-1&measure=Z1X8D4i"
  },

  {
    title: "Black Females working in the Software Industry by State",
    group: "Labor",
    link: "/visualize?groups=0-z9TnC&groups=1-Z1Oby8M-2&groups=2-1mjmRl-5112&groups=3-1dQe8s-2&measure=1qWfo"
  },
  {
    title: "German-Borns Working in the Performing Arts Industry",
    group: "Labor",
    link: "/visualize?groups=0-z9TnC&groups=1-1SyFhe-110&groups=2-1mjmRl-711&measure=1qWfo"
  },
  {
    title: "Naturalized US Citizens Working as Computer Scientists and Web Developers",
    group: "Labor",
    link: "/visualize?groups=0-z9TnC&groups=1-13xVLW-4&groups=2-19hV1x-151111~151131~151134~15113X&measure=1qWfo"
  },
  {
    title: "Median Earnings in the Construction Industry by State",
    group: "Labor",
    link: "/visualize?groups=0-Z1DVCsC&groups=1-1m43RW-4&measure=ALgX7"
  },
  {
    title: "Income Inequality by Metro Area",
    group: "Labor",
    link: "/visualize?groups=0-23eSQ7&measure=230vWl"
  },
  {
    title: "Coal Mining Workers by State",
    group: "Labor",
    link: "/visualize?filters=0-Z2nLcvC-5-5&filters=1-1qWfo-4-2000&groups=0-z9TnC&groups=1-1mjmRl-2121&measure=1qWfo"
  },

  {
    title: "Admissions for Universities in the Boston Metro Area",
    group: "Education",
    link: "/visualize?groups=0-1CdfJW&groups=1-1YEWx6-31000US14460&measure=Z1GSog1"
  },
  {
    title: "Default Rate by State",
    group: "Education",
    link: "/visualize?groups=0-24s1dP&measure=ZdVPNx"
  },
  {
    title: "Engineering Graduates by Gender",
    group: "Education",
    link: "/visualize?groups=0-BNDBG&groups=1-Z2i3TId-14&measure=1g4zN3"
  },

  {
    title: "Department of Interior Spending by State",
    group: "Government",
    link: "/visualize?groups=0-Z1MxM8L&groups=1-1pz0Cl-14&measure=1e64mv"
  },
  {
    title: "National Science Foundations Grants by State",
    group: "Government",
    link: "/visualize?groups=0-Z1MxM8L&groups=1-1pz0Cl-49&groups=2-Z27NDkh-Grant&measure=1e64mv"
  },
  {
    title: "Spending by Department of Defense by State",
    group: "Government",
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
    window.location = url;
    // this.props.router.push(url);
  }

  componentDidUpdate(prevProps) {
    const {vizbuilder} = this.props;

    if (vizbuilder !== prevProps.vizbuilder && !vizbuilder.load.inProgress) {

      const {list} = this.context.formatters;
      const {query} = vizbuilder;

      const groups = query.groups.filter(d => d.key);
      const slug = `${query.measure.annotations._key}-${groups.map(d => d.key).join("-")}`;
      const params = {
        measures: [query.measure.name],
        drilldowns: groups.map(d => d.level.name)
      };
      if (query.moe) params.measures.push(query.moe.name);
      if (query.lci) params.measures.push(query.lci.name);
      if (query.uci) params.measures.push(query.uci.name);

      const url = `/api/data?${Object.entries(params).map(([key, val]) => `${key}=${val.join(",")}`).join("&")}`;

      const queryTitle = `${query.measure.name}${params.drilldowns ? ` by ${list(params.drilldowns)}` : ""}`;

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
          { exampleGroups.map((d, i) =>
            <div key={i} className="carousel">
              <h2><SVG src={`/icons/sections/${groupIcons[d.key]}.svg`} />{ d.key }</h2>
              <Carousel {...carouselSettings} ref={c => this.carousel = c}>
                {d.values.map((example, ii) =>
                  <div key={ii}
                    onClick={this.gotoExample.bind(this, example.link)}
                    className="pt-card pt-interactive">
                    <span>{ example.title }</span>
                  </div>
                )}
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

        <div className="options">
          <div className="option" onClick={this.showIntro.bind(this)}>
            <Icon iconName="help" />
            Show Examples
          </div>
          { cart ? <Tooltip2 placement="top-end">
            <div className={ `option add-to-cart ${ cartSize >= cartMax ? "disabled" : "" }` } onClick={this.onCart.bind(this)}>
              <span className="option-label">{ !cart ? "Loading Cart" : inCart ? "Remove from Cart" : "Add Data to Cart" }</span>
            </div>
            <span>
              { inCart ? "Remove this dataset from the cart."
                : cartSize !== undefined && cartSize >= cartMax ? `Cart limit of ${cartSize} has been reached. Please visit the cart page to download the current cart and/or remove data.`
                  : "Add the underlying data to the cart, and merge with any existing cart data." }
            </span>
          </Tooltip2> : null }
        </div>

        <Vizbuilder
          src={[cube]}
          defaultGroup={["Geography.State", "Origin State.Origin State", "Gender.Gender", "Age.Age"]}
          defaultMeasure="Total Population"
          measureConfig={measureConfig}
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
              topojson: "/topojson/Msa.json"
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
          ]} />

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
