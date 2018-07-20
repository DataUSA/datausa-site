import React, {Component} from "react";
import {Callout, Icon} from "@blueprintjs/core";

import "./Preview.css";

class Preview extends Component {

  constructor(props) {
    super(props);
    this.state = {
      preview: "04000US25",
      previewArray: ["01000US", "04000US25", "04000US36", "05000US25025", "31000US14460", "16000US0455000"]
    };
  }

  componentDidMount() {
    if (this.props.onSelectPreview) this.props.onSelectPreview(this.state.preview);
  }

  onSelect(e) {
    this.setState({preview: e.target.value});
    if (this.props.onSelectPreview) this.props.onSelectPreview(e.target.value);
  }

  render() {

    const {preview, previewArray} = this.state;

    return (
      <Callout id="preview-toggle">
        <span className="pt-label"><Icon iconName="media" />Preview ID</span>
        <div className="pt-select">
          <select value={preview} onChange={this.onSelect.bind(this)}>
            { previewArray.map(s => <option value={s} key={s}>{s}</option>) }
          </select>
        </div>
      </Callout>
    );
  }
}

export default Preview;
