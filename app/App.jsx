import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import "./App.css";

import {Canon, fetchData} from "datawheel-canon";
import "./d3plus.css";

import libs from "../utils/libs";
import Nav from "components/Nav/index";
import Footer from "components/Footer/index";

class App extends Component {

  constructor(props) {

    super(props);

    this.state = {
      formatters: (props.formatters || []).reduce((acc, d) => {
        const f = Function("n", "libs", d.logic);
        const fName = d.name.replace(/\s/g, "").replace(/^\w/g, chr => chr.toLowerCase());
        acc[fName] = n => f(n, libs);
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

    const fullscreen = location.pathname.indexOf("/cart") === 0 ||
                       location.pathname.indexOf("/map") === 0;

    return (
      <Canon>
        <Nav location={location} />
        { this.props.children }
        { fullscreen ? null : <Footer location={location} /> }
      </Canon>
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
