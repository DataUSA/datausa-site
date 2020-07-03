import React, {Component} from "react";
import {Link} from "react-router";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import "./index.css";

import Search from "toCanon/Search";

import Column from "./Column";

const launch = new Date("01 May 2019 08:00:00 GMT-0400");

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      banner: new Date() < launch,
      image: "rocky"
    };
  }

  onImage(e) {
    this.setState({image: e.target.value});
  }

  render() {

    const {tiles} = this.props;
    const {banner, image} = this.state;

    return (
      <div id="Home">
        <div className="bg" style={{backgroundImage: `url("/images/home/bg/${image}.jpg")`}}></div>
        <img className="logo" src="/images/home/logo-shadow.png" alt="Data USA" />
        <div className="tagline">
          <a href="/visualize">Explore</a>, <a href="/map">map</a>, <a href="/profile/geo/chicago-il/?compare=seattle-wa">compare</a>, and <a href="/cart">download</a> U.S. data
        </div>

        {/* <select id="bg-select" className="bp3-select" onChange={this.onImage.bind(this)} defaultValue={image}>
          <option value="autumn">autumn</option>
          <option value="mountain">mountain</option>
          <option value="snow">snow</option>
          <option value="rocky">rocky</option>
        </select> */}

        <Search
          buttonLink="/search/"
          className="home-search"
          placeholder="ex. California, Hospitals, Graphic Design"
          primary={true}
          resultRender={d => <Link to={`/profile/${d.profile}/${d.slug || d.id}`} className="result-container">
            <img className="result-icon" src={ `/icons/dimensions/${d.dimension} - Color.svg` } />
            <div className="result-text">
              <div className="title">{ d.name }</div>
              <div className="sumlevel">{ d.hierarchy }</div>
            </div>
          </Link>}
          url="/api/searchLegacy/"
        />

        { banner ? <div className="subtitle">You are viewing a prototype for the new Data USA.<br />Beta testing will end on Wednesday May 1st at 8am EST.</div> : null }

        <div className="sponsors">
          <a target="_blank" rel="noopener noreferrer" href="http://www2.deloitte.com/us/en.html">
            <img id="deloitte" src="/images/home/logos/deloitte.png" />
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
