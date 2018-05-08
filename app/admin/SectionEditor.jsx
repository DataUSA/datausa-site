import axios from "axios";
import React, {Component} from "react";
import {Dialog, Card} from "@blueprintjs/core";
import TextEditor from "./TextEditor";
import Loading from "components/Loading";
import varSwap from "../../utils/varSwap";
import PropTypes from "prop-types";

import "./SectionEditor.css";

class SectionEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rawData: null,
      recompiling: false
    };
  }

  componentDidMount() {
    const {rawData} = this.props;
    this.setState({rawData, recompiling: true}, this.fetchPostData.bind(this));
  }

  componentDidUpdate() {
    if (this.props.rawData.id !== this.state.rawData.id) {
      this.setState({rawData: this.props.rawData}, this.fetchPostData.bind(this));
    }
  }

  changeField(field, e) {
    const {rawData} = this.state;
    rawData[field] = e.target.value;
    this.setState({rawData});
  }

  fetchPostData() {
    this.setState({recompiling: false});
  }

  chooseVariable(e) {
    const {rawData} = this.state;
    rawData.allowed = e.target.value;
    this.setState({rawData}, this.saveContent.bind(this));
  }

  saveContent() {
    const {rawData} = this.state;
    axios.post("/api/cms/section/update", rawData).then(resp => {
      if (resp.status === 200) {
        console.log("success");
        this.setState({isTextEditorOpen: false});
        if (this.props.reportSave) this.props.reportSave();
      }
      else {
        console.log("error");
      }
    });
  }

  render() {

    const {recompiling, rawData} = this.state;
    const {formatters} = this.context;
    const {variables} = this.props;

    if (recompiling || !rawData) return <Loading />;

    rawData.display_vars = varSwap(rawData, formatters, variables);

    const varOptions = [<option key="always" value="always">Always</option>];
    
    for (const key in variables) {
      if (variables.hasOwnProperty(key) && !["_genStatus", "_matStatus"].includes(key)) {
        const value = variables[key];
        varOptions.push(
          <option key={key} value={key}>{`${key}: ${value}`}</option>
        );
      }
    }

    return (
      <div id="section-editor">
        <div id="slug">
          slug
          <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={rawData.slug} onChange={this.changeField.bind(this, "slug")}/>
          <button onClick={this.saveContent.bind(this)}>rename</button>
        </div>
        <div className="pt-select">
          Allowed?
          <select value={rawData.allowed || "always"} onChange={this.chooseVariable.bind(this)} style={{margin: "5px"}}>
            {varOptions}
          </select>
        </div>
        <Dialog
          iconName="document"
          isOpen={this.state.isTextEditorOpen}
          onClose={() => this.setState({isTextEditorOpen: false})}
          title="Text Editor"
        >
          <div className="pt-dialog-body">
            <TextEditor data={rawData} variables={[]} fields={["title", "description"]} />
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <button
                className="pt-button"
                onClick={() => this.setState({isTextEditorOpen: false})}
              >
                Cancel
              </button>
              <button
                className="pt-button pt-intent-success"
                onClick={this.saveContent.bind(this)}
              >
                Save
              </button>
            </div>
          </div>
        </Dialog>
        <Card className="splash-card" onClick={() => this.setState({isTextEditorOpen: true})} interactive={true} elevation={1}>
          <h4 className="splash-title" dangerouslySetInnerHTML={{__html: rawData.display_vars.title}}></h4>
          <h6 className="splash-description" dangerouslySetInnerHTML={{__html: rawData.display_vars.description}}></h6>
        </Card>
      </div>
    );
  }
}

SectionEditor.contextTypes = {
  formatters: PropTypes.object
};

export default SectionEditor;
