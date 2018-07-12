import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "datawheel-canon";
import "./index.css";

import Search from "toCanon/Search";

import Column from "./Column";

class Home extends Component {

  render() {

    const {tiles} = this.props;

    return (
      <div id="Home">
        <div className="bg"></div>
        <img className="logo" src="/images/home/logo-shadow.png" alt="Data USA" />
        <h2 className="tagline">
          <a href="/search">Search</a>, <a href="/map">map</a>, <a href="/profile/geo/chicago-il/?compare=seattle-wa">compare</a>, and <a href="/cart">download</a> U.S. data
        </h2>

        <Search
          buttonLink="/search"
          className="home-search"
          placeholder="ex. California, Hospitals, Graphic Design"
          primary={true}
          resultLink={ d => `/profile/${d.type}/${d.id}` }
          resultRender={d => <div className="result-container">
            <img className="result-icon" src={ `/images/search/${d.dimension}.svg` } />
            <div className="result-text">
              <div className="title">{ d.name }</div>
              <div className="sumlevel">{ d.hierarchy }</div>
            </div>
          </div>}
          url="/api/search/"
        />

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
        <div className="columns">
          { tiles.map((column, i) => <Column key={i} className="primary" data={column} />)}
        </div>
        <div className="columns">
          { tiles.map((column, i) => <Column key={i} className="secondary" data={column} />)}
        </div>
      </div>
    );

  }

}

Home.need = [
  fetchData("home", "/api/home")
];

export default connect(state => ({tiles: state.data.home}))(Home);
