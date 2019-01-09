import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";
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

    const {location, origin} = this.props;
    const {pathname} = location;

    const fullscreen = pathname.indexOf("cart") === 0 ||
                       pathname.indexOf("map") === 0 ||
                       pathname.indexOf("cms") === 0 ||
                       pathname.indexOf("visualize") === 0 ||
                       pathname.indexOf("search") === 0;

    const bare = pathname.includes("profile") && pathname.split("/").length === 5;
    const beta = true;

    return (
      <div id="App" className={bare ? "bare" : ""}>
        <Helmet>
          <meta property="og:image" content={ `${origin}/images/share.jpg` } />
        </Helmet>
        { bare ? null : <Nav location={location} /> }
        { this.props.children }
        { fullscreen || bare ? null : <Footer location={location} /> }
        { beta && <div id="Beta">This is a prototype for the new Data USA. Please e-mail <a href="mailto:hello@datausa.io?subject=Prototype%20Feedback">hello@datausa.io</a> with any feedback.</div> }
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

export default connect(state => ({
  formatters: state.data.formatters,
  origin: state.location.origin
}))(App);
