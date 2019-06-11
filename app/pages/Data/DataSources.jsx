import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "@datawheel/canon-core";
import {Button, Collapse} from "@blueprintjs/core";
import {caveats, usage} from "./datasets.js";

class DataSources extends Component {

  constructor(props) {
    super(props);
    this.state = {active: []};
  }

  onClick(slug) {
    const {active} = this.state;
    if (active.includes(slug)) active.splice(active.indexOf(slug), 1);
    else active.push(slug);
    this.setState({active});
  }

  render() {

    const {datasets} = this.props;
    const {active} = this.state;

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

          const open = active.includes(slug);

          return <div key={title}>
            <Button
              active={open}
              className="bp3-fill"
              rightIconName={open ? "chevron-down" : "chevron-right"}
              onClick={this.onClick.bind(this, slug)}>{ title }</Button>
            <Collapse isOpen={open} keepChildrenMounted={true}>
              { desc.map((d, i) => <p key={i} dangerouslySetInnerHTML={{__html: d}} />) }
              { use.length > 0 && <div className="sub-title">Where is it used?</div> }
              { use.length > 0 && use.map((d, i) => <p key={i} dangerouslySetInnerHTML={{__html: d}} />) }
              { caveat.length > 0 && <div className="sub-title">Caveats</div> }
              { caveat.length > 0 && caveat.map((d, i) => <p key={i} dangerouslySetInnerHTML={{__html: d}} />) }
              { datasets.length > 0 && <div className="sub-title">Source Link{ datasets.length > 1 ? "s" : "" }</div> }
              { datasets.length > 0 && <ul>
                { datasets.map((d, i) => <li key={i}><a href={d.link} target="_blank" rel="noopener noreferrer">{d.title}</a></li>) }
              </ul> }
            </Collapse>
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
