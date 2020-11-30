import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Carousel from "react-slick";
import SVG from "react-inlinesvg";
import {nest} from "d3-collection";
import {hot} from "react-hot-loader/root";

import {Vizbuilder} from "@datawheel/canon-vizbuilder";
import {Icon, Tooltip} from "@blueprintjs/core";
import "./Visualize.css";
import {badMeasures} from "d3plus.js";
import {titleCase} from "d3plus-text";
import colors from "../../static/data/colors.json";
import {Helmet} from "react-helmet-async";
import {addToCart, removeFromCart} from "actions/cart";
import {updateTitle} from "actions/title";
import Tile from "components/Tile/Tile";
import {examples, groupIcons} from "./VisualizeExamples";

import albersUsaPr from "helpers/albersUsaPr";
import birthplaceCodes from "helpers/birthplaceCodes";

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

  onChange(query) {

    const {list} = this.context.formatters;
    const measureName = decodeURI(query.measure.split("/").pop())
      .replace(/%2C/g, ",");

    const groups = Object.values(query.groups).filter(d => d.key);
    let slug = measureName;
    const params = {
      measures: [measureName],
      drilldowns: groups.map(d => d.level)
    };

    groups.forEach(group => {
      slug += `-${group.key}`;
      if (group.members.length) {
        params[group.level] = group.members.join(",");
        slug += `-${params[group.level]}`;
      }
    });

    const url = `/api/data?${Object.entries(params).map(([key, val]) => `${key}=${val}`).join("&")}`;

    const byGroups = groups
      // .filter(group => !group.members.length)
      .map(group => `${group.level}${group.members.length ? ` (${group.members.length} selected)`: ""}`);

    const forGroups = [];
    // const forGroups = groups
    //   .filter(group => group.members.length)
    //   .map(group => list(group.members.map(m => m.name)));

    const queryTitle = titleCase(`${measureName}${byGroups.length ? ` by ${list(byGroups)}` : ""}${forGroups.length ? ` for ${list(forGroups)}` : ""}`);
    const format = "function(d) { return d.data; }";

    this.props.updateTitle(queryTitle);
    this.setState({query: {urls: [url], format, slug, title: queryTitle}});

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

    const position = typeof window !== "undefined" && window.innerWidth <= 900 ? "below" : "on the right";

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
            <Icon icon="chevron-left" />
          </button>
        </SlickButtonFix>,
      nextArrow:
        <SlickButtonFix>
          <button className="slick-arrow-button" onClick={this.next.bind(this)}>
            <Icon icon="chevron-right" />
          </button>
        </SlickButtonFix>,
      // layout (desktop first)
      slidesToShow: 5,
      slidesToScroll: 5,
      responsive: [
        {
          breakpoint: 1700,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 4
          }
        },
        {
          breakpoint: 1400,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 1100,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 3
          }
        },
        {
          breakpoint: 700,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 500,
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
          <iframe className="video" src="https://player.vimeo.com/video/343322385?color=ef6145&byline=0&portrait=0" frameBorder="0" allowFullScreen></iframe>
          <p>
            The Viz Builder is a tool that allows you to dig deep into US public data. From this page, you can select any indicator from the site, specify custom groupings and filters, and then view the resulting data as a series of visualizations based on your selection.
          </p>
          <p>
            The examples {position} are a small sample of what is possible with the Viz Builder. Click on one to get started!
          </p>
          <div className="bp3-button bp3-fill bp3-icon-settings" onClick={this.closeIntro.bind(this)}>
            Go directly to interface
          </div>
        </div>
        <div className="examples">
          { exampleGroups.map(d =>
            <div key={d.key} className="carousel">
              <h2><SVG src={`/icons/sections/${groupIcons[d.key]}.svg`} />{ d.key }</h2>
              <Carousel key="carousel" {...carouselSettings} ref={c => this.carousel = c}>
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
          src={cube}
          defaultGroup={["Geography.State", "Origin State.Origin State", "Gender.Gender", "Age.Age"]}
          defaultMeasure="Total Population"
          groupLimit={4}
          measureConfig={measureConfig}
          defaultTable={cubes => {
            const cube = cubes.find(d => d.name.match(/_5/));
            return cube || cubes[0];
          }}
          config={{
            colorScaleConfig: {
              color: colors.colorScaleGood
            },
            colorScalePosition: "bottom",
            detectResizeDelay: 100,
            zoomScroll: true
          }}
          onChange={this.onChange.bind(this)}
          titleArea={
            <Tooltip className="absolute-title" placement="bottom">
              <h1 onClick={this.showIntro.bind(this)}>
                Viz Builder
              </h1>
              <span>
                Click to show some example queries.
              </span>
            </Tooltip>
          }
          topojson={{
            "Birthplace": {
              ocean: "#d4dadc",
              topojson: "/topojson/birthplace-all.json",
              topojsonId: d => birthplaceCodes[d.id],
              topojsonFilter: d => d.id !== "ATA" && birthplaceCodes[d.id]
            },
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
          sourcesArea={
            <Tooltip placement="bottom">
              <div className={ `bp3-button bp3-fill bp3-icon-shopping-cart ${ cartSize >= cartMax ? "bp3-disabled" : "" }` } onClick={this.onCart.bind(this)}>
                { !cart ? "Loading Cart..." : inCart ? "Remove from Cart" : "Add Data to Cart" }
              </div>
              <span>
                { inCart ? "Remove this dataset from the cart."
                  : cartSize !== undefined && cartSize >= cartMax ? `Cart limit of ${cartSize} has been reached. Please visit the cart page to download the current cart and/or remove data.`
                    : "Add the underlying data to the cart, and merge with any existing cart data." }
              </span>
            </Tooltip>
          }
          visualizations={[
            "geomap",
            "barchart",
            "lineplot",
            "histogram",
            "treemap",
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
  cart: state.cart
}), dispatch => ({
  addToCart: build => dispatch(addToCart(build)),
  removeFromCart: build => dispatch(removeFromCart(build)),
  updateTitle: title => dispatch(updateTitle(title))
}))(hot(Visualize));
