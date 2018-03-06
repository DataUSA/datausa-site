import React, {Component} from "react";
import "./Home.css";

export default class Home extends Component {

  render() {

    return (
      <div id="Home">
        <div className="bg"></div>
        <img className="logo" src="/images/home/logo-shadow.png" alt="Data USA" />
        <h2 className="tagline">
          <a href="/search">Search</a>, <a href="/map">map</a>, <a href="/profile/geo/chicago-il/?compare=seattle-wa">compare</a>, and <a href="/cart">download</a> U.S. data
        </h2>
        <div className="sponsors">
          <a target="_blank" rel="noopener noreferrer" href="http://www2.deloitte.com/us/en.html">
            <img id="deloitte" src="/images/home/logos/deloitte.png" />
          </a>
          <a target="_blank" rel="noopener noreferrer" href="http://macro.media.mit.edu/">
            <img id="macro" src="/images/home/logos/mit.png" />
          </a>
          <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/">
            <img id="datawheel" src="/images/home/logos/datawheel.png" />
          </a>
        </div>
      </div>
    );

  }

}
