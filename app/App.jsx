import React, {Component} from "react";
import "./App.css";

import {CanonComponent} from "datawheel-canon";
import "./helpers/d3plus.css";
import d3plus from "./helpers/d3plus";

import Nav from "components/Nav/index";
import Footer from "components/Footer/index";

export default class App extends Component {

  render() {

    const {location} = this.props;

    const fullscreen = location.pathname.indexOf("/cart") === 0 ||
                       location.pathname.indexOf("/map") === 0;

    const splash = location.pathname === "/" ||
                   location.pathname.indexOf("/profile") === 0;

    return (
      <CanonComponent d3plus={d3plus}>
        <Nav dark={!splash} location={location} />
        { this.props.children }
        { fullscreen ? null : <Footer location={location} /> }
      </CanonComponent>
    );

  }

}
