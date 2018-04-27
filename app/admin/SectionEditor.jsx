import axios from "axios";
import React, {Component} from "react";
import {connect} from "react-redux";
import {Callout, Dialog, Card, NonIdealState} from "@blueprintjs/core";
import GeneratorEditor from "./GeneratorEditor";
import TextEditor from "./TextEditor";
import Loading from "components/Loading";

import GeneratorCard from "./components/GeneratorCard";
import StatCard from "./components/StatCard";

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

    if (recompiling || !rawData) return <Loading />;

    return (
      <div id="section-editor">
        <div id="slug">
          <label className="pt-label">
            slug
            <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={rawData.slug} onChange={this.changeField.bind(this, "slug")}/>
          </label>
          <button onClick={this.saveContent.bind(this)}>rename</button>
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
          <h4 className="splash-title" dangerouslySetInnerHTML={{__html: rawData.title}}></h4>
          <h6 className="splash-description" dangerouslySetInnerHTML={{__html: rawData.description}}></h6>
        </Card>
      </div>
    );
  }
}

export default SectionEditor;
