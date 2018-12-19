import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";

import Anchor from "components/Anchor";
import {caveats, usage} from "./datasets.js";

class DataSources extends Component {

  render() {

    const {datasets} = this.props;

    return (
      <div id="DataSources">

        { datasets.map(dataset => {

          const {datasets, desc, title} = dataset;

          const slug = title
            .replace(/\.|\&|\(|\)|\*/g, "")
            .replace(/\s/g, "-")
            .toLowerCase()
            .replace(/^the\-/g, "")
            .replace(/^us\-/g, "")
            .replace(/\-\-/g, "-");

          const use = usage[slug] || [];
          const caveat = caveats[slug] || [];

          return <div key={title}>
            <h2 id={slug}><Anchor slug={slug}>{ title }</Anchor></h2>
            { desc.map((d, i) => <p key={i} dangerouslySetInnerHTML={{__html: d}} />) }
            { use.length > 0 && <h3>Where is it used?</h3> }
            { use.length > 0 && use.map((d, i) => <p key={i} dangerouslySetInnerHTML={{__html: d}} />) }
            { caveat.length > 0 && <h3>Caveats</h3> }
            { caveat.length > 0 && caveat.map((d, i) => <p key={i} dangerouslySetInnerHTML={{__html: d}} />) }
            { datasets.length > 0 && <h3>Dataset{ datasets.length > 1 ? "s" : "" }</h3> }
            { datasets.length > 0 && <ul>
              { datasets.map((d, i) => <li key={i}><a href={d.link} target="_blank" rel="noopener noreferrer">{d.title}</a></li>) }
            </ul> }
          </div>;

        }) }

      </div>
    );

  }

}

DataSources.need = [
  fetchData("datasets", "/api/datasets")
];

export default connect(state => ({datasets: state.data.datasets}))(DataSources);
