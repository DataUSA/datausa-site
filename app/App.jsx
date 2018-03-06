import React, {Component} from "react";
import "./App.css";

import {Canon} from "datawheel-canon";
import "./d3plus.css";

import Nav from "components/Nav/index";
import Footer from "components/Footer/index";

export default class App extends Component {

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
