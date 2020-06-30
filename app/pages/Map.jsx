import React, {Component} from "react";
import PropTypes from "prop-types";
import {Link} from "react-router";
import {connect} from "react-redux";
import Vizbuilder from "@datawheel/canon-vizbuilder";
import {Tooltip} from "@blueprintjs/core";
import "./Visualize.css";
import "./Map.css";
import {badMeasures} from "d3plus.js";
import colors from "../../static/data/colors.json";
import {Helmet} from "react-helmet";
import {addToCart, removeFromCart} from "actions/cart";
import {updateTitle} from "actions/title";

const measureConfig = {};
badMeasures.forEach(measure => {
  measureConfig[measure] = {
    colorScaleConfig: {
      color: colors.colorScaleBad
    }
  };
});

const cartMax = 5;
const title = "Map";

class Map extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: {}
    };
  }

  componentDidMount() {
    this.props.updateTitle(title);
  }

  componentWillUnmount() {
    this.props.updateTitle(false);
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

      const queryTitle = `Map of ${query.measure.name}${params.drilldowns ? ` by ${list(params.drilldowns)}` : ""}`;

      const format = "function(d) { return d.data; }";

      this.props.updateTitle(queryTitle);
      this.setState({query: {urls: [url], format, slug, title: queryTitle}});

    }

  }

  onCart() {

    const query = {...this.state.query};
    query.title = query.title.replace("Map of ", "");
    const {addToCart, cart, removeFromCart} = this.props;
    const inCart = cart.data.find(c => c.slug === query.slug);
    if (inCart) removeFromCart(query);
    else addToCart(query);

  }

  render() {
    const {router} = this.context;
    const {query} = this.state;
    const {cart, cube} = this.props;
    const cartSize = cart ? cart.data.length : 0;
    const inCart = cart ? cart.data.find(c => c.slug === query.slug) : false;

    const queryTitle = query.title || title;

    const params = {...router.location.query};
    delete params.enlarged;
    const vizbuilder = `/visualize?${Object.entries(params).map(([k, v]) => `${k}=${v}`).join("&")}`;

    return <div id="Visualize" className="Map">

      <Helmet title={queryTitle}>
        <meta property="og:title" content={ `${queryTitle} | Data USA` } />
      </Helmet>

      <Vizbuilder
        src={[cube]}
        defaultGroup={["Geography.County", "Geography.State", "Origin State.Origin State"]}
        defaultMeasure="Poverty Rate"
        measureConfig={measureConfig}
        tableLogic={cubes => {
          const cube = cubes.find(d => d.name.match(/_5/));
          return cube || cubes[0];
        }}
        config={{
          colorScaleConfig: {color: colors.colorScaleGood},
          colorScalePosition: "bottom",
          fitObject: "/topojson/State.json",
          fitFilter: d => !["02", "15", "43", "60", "66", "69", "72", "78"].includes(d.id.slice(7)),
          title: false,
          zoomScroll: true
        }}
        instanceKey="map"
        visualizations={["geomap"]}
        topojson={{
          "County": {topojson: "/topojson/County.json"},
          "MSA": {
            topojson: "/topojson/Msa.json",
            topojsonFilter: d => d.id.indexOf("040") < 0
          },
          "PUMA": {topojson: "/topojson/Puma.json"},
          "State": {topojson: "/topojson/State.json"},
          "Origin State": {topojson: "/topojson/State.json"},
          "Destination State": {topojson: "/topojson/State.json"}
        }}>
        <div className="custom-controls">
          <Tooltip placement="top-end">
            <div className={ `bp3-button bp3-fill bp3-icon-shopping-cart ${ cartSize >= cartMax ? "bp3-disabled" : "" }` } onClick={this.onCart.bind(this)}>
              { !cart ? "Loading Cart..." : inCart ? "Remove from Cart" : "Add Data to Cart" }
            </div>
            <span>
              { inCart ? "Remove this dataset from the cart."
                : cartSize !== undefined && cartSize >= cartMax ? `Cart limit of ${cartSize} has been reached. Please visit the cart page to download the current cart and/or remove data.`
                  : "Add the underlying data to the cart, and merge with any existing cart data." }
            </span>
          </Tooltip>
          <Link className="bp3-button bp3-fill bp3-icon-series-derived" to={vizbuilder}>
            Explore in Viz Builder
          </Link>
          <h1 className="absolute-title">
            Map
          </h1>
        </div>
      </Vizbuilder>

    </div>;

  }

}

Map.contextTypes = {
  formatters: PropTypes.object,
  router: PropTypes.object
};

export default connect(state => ({
  cube: state.env.CUBE,
  cart: state.cart,
  vizbuilder: state.vizbuilder
}), dispatch => ({
  addToCart: build => dispatch(addToCart(build)),
  removeFromCart: build => dispatch(removeFromCart(build)),
  updateTitle: title => dispatch(updateTitle(title))
}))(Map);
