import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "datawheel-canon";
import {Geomap} from "d3plus-react";
import "./Map.css";
// import albersUsaPr from "helpers/albersUsaPr";

class Map extends Component {

  render() {

    const datasets = this.props.cubes.filter(c => c.dimensions.find(d => d.name === "Geography"));

    return (
      <div id="Map">
        <div className="sidebar">
          <select className="pt-select pt-fill">
            { datasets.map((d, i) => <option key={i} value={d.name}>{ d.caption || d.name }</option>) }
          </select>
        </div>
        <Geomap config={{
          projection: "geoAlbersUsa",
          topojson: "/topojson/states.json"}}
        className="visualization" />
      </div>
    );

  }

}

Map.need = [
  fetchData("cubes", "http://datausa-cube.datawheel.us:5000/cubes/", d => d)
];

export default connect(state => ({
  cubes: state.data.cubes.cubes
}))(Map);
