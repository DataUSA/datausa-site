import React, {Component} from "react";
import {Callout, Icon} from "@blueprintjs/core";

const previewHash = {
  geo: ["04000US25", "01000US", "04000US36", "05000US25025", "31000US14460", "16000US0455000", "79500US2500506", "16000US0606308"],
  cip: ["110701", "1107", "11"],
  soc: ["151131", "290000", "550000"],
  naics: ["622", "62", "61-62", "44-45"],
  university: ["167358", "16", "DOC", "488943"],
  napcs: ["61101", "81103", "37", "34201"]
};

class Preview extends Component {

  constructor(props) {
    super(props);
    this.state = {
      preview: "",
      prevewArray: []
    };
  }

  componentDidMount() {
    this.updatePreview.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentSlug !== this.props.currentSlug) {
      this.updatePreview.bind(this)();
    }
  }

  updatePreview() {
    const {currentSlug} = this.props;
    const previewArray = previewHash[currentSlug];
    const preview = previewArray ? previewArray[0] : "";
    this.setState({preview, previewArray});
    if (this.props.onSelectPreview) this.props.onSelectPreview(preview);
  }

  onSelect(e) {
    this.setState({preview: e.target.value});
    if (this.props.onSelectPreview) this.props.onSelectPreview(e.target.value);
  }

  render() {

    const {preview, previewArray} = this.state;

    if (!preview || !previewArray) return null;

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
