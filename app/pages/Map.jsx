import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Vizbuilder from "@datawheel/canon-vizbuilder";
import localforage from "localforage";
import {Tooltip2} from "@blueprintjs/labs";
import "./Visualize.css";
import "./Map.css";
import {badMeasures} from "d3plus.js";
import colors from "../../static/data/colors.json";
import {Helmet} from "react-helmet";
import {defaultCart} from "pages/Cart";

const measureConfig = {};
badMeasures.forEach(measure => {
  measureConfig[measure] = {
    colorScaleConfig: {
      color: colors.colorScaleBad
    }
  };
});

const cartMax = 5;

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      cart: false,
      query: {}
    };
  }

  componentDidMount() {

    const {cartKey} = this.props;

    localforage.getItem(cartKey)
      .then(cart => {
        if (!cart) cart = defaultCart;
        this.setState({cart});
      })
      .catch(err => console.error(err));
  }

  onChange(query) {

    const {list} = this.context.formatters;

    const slug = `${query.measure.annotations._key}-${query.groups.map(d => d.level.annotations._key).join("-")}`;
    const params = {
      measures: [query.measure.name],
      drilldowns: query.groups.map(d => d.level.name)
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

    const {cart, query} = this.state;
    const {cartKey} = this.props;
    const inCart = cart.data.find(c => c.slug === query.slug);
    if (inCart) cart.data.splice(cart.data.indexOf(query), 1);
    else cart.data.push(query);
    localforage.setItem(cartKey, cart);
    this.forceUpdate();

  }

  render() {
    const {cart, query} = this.state;
    const {cube} = this.props;
    const cartSize = cart.length;
    const inCart = cart ? cart.data.find(c => c.slug === query.slug) : false;

    return <div id="Visualize" className="Map">

      <Helmet title={`Map${query && query.title ? ` of ${query.title}` : ""}`} />

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
        defaultGroup={["Geography.County", "Origin State.Origin State"]}
        defaultMeasure="Uninsured"
        measureConfig={measureConfig}
        onChange={this.onChange.bind(this)}
        config={{
          colorScaleConfig: {color: colors.colorScaleGood},
          colorScalePosition: "bottom",
          fitObject: "/topojson/State.json",
          fitFilter: d => !["02", "15", "43", "60", "66", "69", "72", "78"].includes(d.id.slice(7)),
          shapeConfig: {
            hoverOpacity: 1
          },
          title: false
        }}
        visualizations={["geomap"]}
        topojson={{
          "County": {topojson: "/topojson/County.json"},
          "MSA": {topojson: "/topojson/Msa.json"},
          "PUMA": {topojson: "/topojson/Puma.json"},
          "State": {topojson: "/topojson/State.json"},
          "Origin State": {topojson: "/topojson/State.json"},
          "Destination State": {topojson: "/topojson/State.json"}
        }} />

    </div>;

  }

}

Map.contextTypes = {
  formatters: PropTypes.object
};

export default connect(state => ({
  cube: state.env.CUBE,
  cartKey: state.env.CART
}))(Map);
