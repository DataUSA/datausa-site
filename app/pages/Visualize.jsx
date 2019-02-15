import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Vizbuilder from "@datawheel/canon-vizbuilder";
import {Icon} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";
import "./Visualize.css";
import {badMeasures} from "d3plus.js";
import colors from "../../static/data/colors.json";
import {Helmet} from "react-helmet";
import {addToCart, removeFromCart} from "actions/cart";

const measureConfig = {};
badMeasures.forEach(measure => {
  measureConfig[measure] = {
    colorScaleConfig: {
      color: colors.colorScaleBad
    }
  };
});

const StateTopojson = {
  projection: "geoAlbersUsa",
  ocean: "transparent",
  topojson: "/topojson/State.json"
};

const examples = [
  {
    title: "Universities with endowments greater than $10B",
    icon: "bank-account",
    link: "/visualize?filters=0-Z1jivMs-4-10000000000&groups=0-HIqzX&measure=Z1jivMs"
  },
  {
    title: "Opioid overdoses by state over time",
    icon: "pulse",
    link: "/visualize?groups=0-Zpn26u&measure=2sUCF4"
  },
  {
    title: "States with the highest number of coal mining workers",
    icon: "build",
    link: "/visualize?filters=0-Z2nLcvC-5-5&filters=1-1qWfo-4-2000&groups=0-z9TnC&groups=1-1mjmRl-2121&measure=1qWfo"
  }
];

const cartMax = 5;

class Visualize extends Component {

  constructor(props) {
    super(props);
    this.state = {
      intro: !props.router.location.search.length,
      query: {}
    };
  }

  showIntro() {
    this.setState({intro: true});
  }

  closeIntro() {
    this.setState({intro: false});
  }

  gotoExample(url) {
    this.props.router.push(url);
  }

  onChange(query) {

    const {list} = this.context.formatters;

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

    const title = `${query.measure.name}${params.drilldowns ? ` by ${list(params.drilldowns)}` : ""}`;

    const format = "function(d) { return d.data; }";
    this.setState({query: {urls: [url], format, slug, title}});

  }

  onCart() {

    const {query} = this.state;
    const {addToCart, cart, removeFromCart} = this.props;
    const inCart = cart.data.find(c => c.slug === query.slug);
    if (inCart) removeFromCart(query);
    else addToCart(query);

  }

  render() {
    const {intro, query} = this.state;
    const {cart, cube} = this.props;
    const cartSize = cart ? cart.data.length : 0;
    const inCart = cart ? cart.data.find(c => c.slug === query.slug) : false;

    if (intro) {
      return <div id="Visualize" className="visualize-intro">
        <Helmet title="Viz Builder" />
        <h1>Viz Builder</h1>
        <p>
          Welcome to the Data USA custom visualization builder. This page allows you to select any indicator from the site. You may specify custom groupings and filters, and then view the resulting data as a series of visualizations based on your selection.
        </p>
        <p>
          The following are a few sample queries. Click on one to get started:
        </p>
        <div className="examples">
          { examples.map((d, i) => <div key={i}
            onClick={this.gotoExample.bind(this, d.link)}
            className="pt-card pt-interactive">
            <Icon iconName={d.icon} />
            { d.title }
          </div>) }
        </div>
        <div className="advanced" onClick={this.closeIntro.bind(this)}>Go directly to interface &raquo;</div>
      </div>;
    }
    else {

      return <div id="Visualize">

        { query ? <Helmet title={`${query.title ? `${query.title} | ` : ""}Viz Builder`} /> : null }

        <div className="help" onClick={this.showIntro.bind(this)}>
          <Icon iconName="help" />
          Help
        </div>

        <div className="options">
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
          onChange={this.onChange.bind(this)}
          config={{
            colorScaleConfig: {
              color: colors.colorScaleGood
            },
            colorScalePosition: "bottom"
          }}
          topojson={{
            "County": {
              projection: "geoAlbersUsa",
              ocean: "transparent",
              topojson: "/topojson/County.json"
            },
            "MSA": {
              projection: "geoAlbersUsa",
              ocean: "transparent",
              topojson: "/topojson/Msa.json"
            },
            "PUMA": {
              projection: "geoAlbersUsa",
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
  cart: state.cart
}), dispatch => ({
  addToCart: build => dispatch(addToCart(build)),
  removeFromCart: build => dispatch(removeFromCart(build))
}))(Visualize);
