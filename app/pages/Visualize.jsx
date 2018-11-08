import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Vizbuilder from "@datawheel/canon-vizbuilder";
import localforage from "localforage";
import {Button, Dialog, Icon, Intent} from "@blueprintjs/core";
import {Tooltip2} from "@blueprintjs/labs";
import "./Visualize.css";
import {badMeasures} from "d3plus.js";
import colors from "../../static/data/colors.json";

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

const introKey = "datausa-visualize-intro";
const cartMax = 5;

class Visualize extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cart: false,
      intro: false,
      query: {}
    };
  }

  componentDidMount() {

    const {cartKey} = this.props;

    localforage.getItem(introKey)
      .then(intro => {
        if (!intro) this.setState({intro: true});
      })
      .catch(err => console.error(err));

    localforage.getItem(cartKey)
      .then(cart => {
        if (!cart) cart = [];
        this.setState({cart});
      })
      .catch(err => console.error(err));
  }

  hideInfo() {
    this.setState({intro: false});
    localforage.setItem(introKey, true);
  }

  onChange(query) {
    const {list} = this.context.formatters;
    console.log(query);
    const slug = `${query.measure.annotations._key}-${query.groups.map(d => d.level.annotations._key).join("-")}`;
    const params = {
      measures: [query.measure.name],
      drilldowns: query.groups.map(d => d.level.name)
    };
    if (query.moe) params.measures.push(query.moe.name);
    if (query.lci) params.measures.push(query.lci.name);
    if (query.uci) params.measures.push(query.uci.name);
    console.log(params);
    const url = `/api/data?${Object.entries(params).map(([key, val]) => `${key}=${val.join(",")}`).join("&")}`;
    console.log(url);
    const title = `${query.measure.name}${params.drilldowns ? ` by ${list(params.drilldowns)}` : ""}`;
    console.log(title);
    console.log(slug);
    const format = "function(d) { return d.data; }";
    this.setState({query: {urls: [url], format, slug, title}});
  }

  onCart() {
    const {cart, query} = this.state;
    const {cartKey} = this.props;
    const inCart = cart.find(c => c.slug === query.slug);
    if (inCart) cart.splice(cart.indexOf(query), 1);
    else cart.push(query);
    localforage.setItem(cartKey, cart);
    this.forceUpdate();
  }

  render() {
    const {cart, intro, query} = this.state;
    const cartSize = cart.length;
    const inCart = cart ? cart.find(c => c.slug === query.slug) : false;

    return <div id="Visualize">

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

      <Vizbuilder
        src="https://ironwood-api.datausa.io/"
        defaultGroup={["Geography.State", "Origin State.Origin State", "Gender.Gender", "Age.Age"]}
        defaultMeasure="Total Population"
        measureConfig={measureConfig}
        onChange={this.onChange.bind(this)}
        config={{
          colorScaleConfig: {
            color: colors.colorScaleGood
          }
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
        }} />

      <Dialog isOpen={intro} className="visualize-intro">
        <div className="pt-dialog-header">
          <h5>Maps &amp; Charts</h5>
          <button aria-label="Close" className="pt-dialog-close-button pt-icon-small-cross" onClick={this.hideInfo.bind(this)}></button>
        </div>
        <div className="pt-dialog-body">
          <p className="icons">
            <Icon iconName="horizontal-bar-chart" />
            <Icon iconName="globe" />
            <Icon iconName="timeline-line-chart" />
            <Icon iconName="grid-view" />
            <Icon iconName="grouped-bar-chart" />
            <Icon iconName="timeline-area-chart" />
          </p>
          <p>
            Welcome to the custom visualization builder. This page allows you to view any indicator used throughout the site as a set of custom visualizations.
          </p>
          <p>
            Start by choosing an indicator from the dropdown list, and then add custom groupings and filters to narrow down your exploration.
          </p>
        </div>
        <div className="pt-dialog-footer">
          <Button className="pt-fill" text="Let's start!" intent={Intent.SUCCESS} onClick={this.hideInfo.bind(this)} />
        </div>
      </Dialog>;
    </div>;
  }

}

Visualize.contextTypes = {
  formatters: PropTypes.object
};

export default connect(state => ({cartKey: state.env.CART}))(Visualize);
