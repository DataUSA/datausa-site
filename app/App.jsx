import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";
import localforage from "localforage";
import "./App.css";

import {Button} from "@blueprintjs/core";
import {fetchCart} from "actions/cart";
import {fetchData} from "@datawheel/canon-core";
import "./d3plus.css";

import libs from "../utils/libs";
import Nav from "components/Nav/index";
import Footer from "components/Footer/index";

import albersUsaPr from "helpers/albersUsaPr";

// const launch = new Date("01 May 2019 08:00:00 GMT-0400");
const bannerKey = "datausa-banner-v2";
const bannerLink = "/coronavirus";
const bannerText = "COVID-19 in Numbers";
const bannerPersist = true;

class App extends Component {

  constructor(props) {

    super(props);

    this.state = {
      // banner: new Date() < launch,
      banner: false,
      formatters: (props.formatters || []).reduce((acc, d) => {
        const f = Function("n", "libs", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, acc);
        return acc;
      }, {})
    };

  }

  async componentDidMount() {
    this.props.fetchCart();
    const banner = bannerPersist ? false : await localforage.getItem(bannerKey);
    const {basename, pathname} = this.props.router.location;
    const embed = pathname.includes("profile") && pathname.split("/").filter(Boolean).length === 5;
    if (`${basename}${pathname}` === bannerLink) localforage.setItem(bannerKey, true);
    else if (!banner && !embed) this.setState({banner: true});
  }

  componentWillMount() {
    if (typeof window !== "undefined") window.albersUsaPr = albersUsaPr;
  }

  getChildContext() {
    const {formatters} = this.state;
    const {router} = this.props;
    return {formatters, router};
  }

  clickBanner() {
    localforage.setItem(bannerKey, true);
    this.props.router.push(bannerLink);
  }

  toggleBanner(e) {
    e.stopPropagation();
    localforage.setItem(bannerKey, true);
    this.setState({banner: !this.state.banner});
  }

  render() {

    const {location, origin} = this.props;
    const {banner} = this.state;
    const {pathname} = location;

    const fullscreen = pathname.indexOf("cart") === 0 ||
                       pathname.indexOf("map") === 0 ||
                       pathname.indexOf("cms") === 0 ||
                       pathname.indexOf("visualize") === 0 ||
                       pathname.indexOf("search") === 0;

    const bare = pathname.includes("profile") && pathname.split("/").filter(Boolean).length === 5;

    const showBanner = banner && pathname.indexOf("cms") < 0;

    return (
      <div id="App" className={`${bare ? "bare" : ""} ${showBanner ? "visible-banner" : ""}`}>
        <Helmet>
          <meta property="og:image" content={ `${origin}/images/share.jpg` } />
        </Helmet>
        { bare ? null : <Nav location={location} /> }
        { this.props.children }
        { fullscreen || bare ? null : <Footer location={location} /> }
        <div className={showBanner ? "visible" : ""} onClick={this.clickBanner.bind(this)} id="Banner">
          <span className="banner-text">{ bannerText }</span>
          <Button className="close pt-minimal" iconName="cross" onClick={this.toggleBanner.bind(this)} />
        </div>
      </div>
    );

  }

}

App.childContextTypes = {
  formatters: PropTypes.object,
  router: PropTypes.object
};

App.need = [
  fetchData("formatters", "/api/formatters"),
  fetchData("measures", "/api/cubes/", resp => {
    const obj = {};
    for (const measure in resp.measures) {
      if ({}.hasOwnProperty.call(resp.measures, measure)) {
        const annotations = resp.measures[measure].annotations;
        const format = annotations.error_for_measure
          ? resp.measures[annotations.error_for_measure].annotations.units_of_measurement
          : annotations.units_of_measurement;
        obj[measure] = format;
      }
    }
    return obj;
  })
];

export default connect(state => ({
  formatters: state.data.formatters,
  origin: state.location.origin
}), dispatch => ({
  fetchCart: () => dispatch(fetchCart())
}))(App);
