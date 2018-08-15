import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import "./App.css";

import {fetchData} from "@datawheel/canon-core";
import "./d3plus.css";

import libs from "../utils/libs";
import Nav from "components/Nav/index";
import Footer from "components/Footer/index";

class App extends Component {

  constructor(props) {

    super(props);

    this.state = {
      formatters: (props.formatters || []).reduce((acc, d) => {
        const f = Function("n", "libs", "formatters", d.logic);
        const fName = d.name.replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs, acc);
        return acc;
      }, {})
    };

  }

  getChildContext() {
    const {formatters} = this.state;
    const {router} = this.props;
    return {formatters, router};
  }

  render() {

    const {location} = this.props;
    const {pathname} = location;

    const fullscreen = pathname.indexOf("cart") === 0 ||
                       pathname.indexOf("map") === 0 ||
                       pathname.indexOf("visualize") === 0 ||
                       pathname.includes("profilebuilder") ||
                       pathname.indexOf("visualize") === 0;

    const bare = pathname.includes("profile") && pathname.split("/").length === 5;

    return (
      <div className={bare ? "bare" : ""}>
        { bare ? null : <Nav location={location} /> }
        { this.props.children }
        { fullscreen || bare ? null : <Footer location={location} /> }
        <div id="Beta">This is a prototype for the new Data USA. Please e-mail <a href="mailto:hello@datausa.io?subject=Prototype%20Feedback">hello@datausa.io</a> with any feedback.</div>
      </div>
    );

  }

}

App.childContextTypes = {
  formatters: PropTypes.object,
  router: PropTypes.object
};

App.need = [
  fetchData("formatters", "/api/formatters")
];

export default connect(state => ({formatters: state.data.formatters}))(App);
