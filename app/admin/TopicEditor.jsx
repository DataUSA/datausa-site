import axios from "axios";
import React, {Component} from "react";
import {Dialog, Card, NonIdealState} from "@blueprintjs/core";
import TextEditor from "./TextEditor";
import Loading from "components/Loading";
import StatCard from "./components/StatCard";
import GeneratorEditor from "./GeneratorEditor";

import "./TopicEditor.css";

class TopicEditor extends Component {

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

  openGeneratorEditor(g, type) {
    this.setState({currentGenerator: g, currentGeneratorType: type, isGeneratorEditorOpen: true});
  }

  openTextEditor(t, type, fields) {
    this.setState({currentText: t, currentFields: fields, currentTextType: type, isTextEditorOpen: true});
  }

  addItem(type) {
    const {rawData} = this.state;
    let payload;
    if (type === "stat") {
      payload = {
        title: "New Stat",
        subtitle: "New Subtitle",
        value: "New Value",
        topic_id: rawData.id
      };
      axios.post("/api/cms/stat_topic/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.stats.push(resp.data);
          this.setState({rawData, recompiling: true}, this.fetchPostData.bind(this));
        }
        else {
          console.log("db error");
        }
      });
    }
    else if (type === "visualization") {
      payload = {
        logic: "return {}",
        topic_id: rawData.id
      };
      axios.post("/api/cms/visualization_topic/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.visualizations.push(resp.data);
          this.setState({rawData, recompiling: true}, this.fetchPostData.bind(this));
        }
        else {
          console.log("db error");
        }
      });
    }
  }

  deleteItem(item, type) {
    const {rawData} = this.state;
    if (["generator", "materializer", "profile", "stat", "visualization"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_topic");
      axios.delete(`/api/cms/${type}/delete`, {params: {id: item.id}}).then(resp => {
        if (resp.status === 200) {
          if (type === "stat_topic") rawData.stats = rawData.stats.filter(s => s.id !== item.id);
          if (type === "visualization_topic") rawData.visualizations = rawData.visualizations.filter(v => v.id !== item.id);
          this.setState({rawData, recompiling: true, isGeneratorEditorOpen: false, isTextEditorOpen: false}, this.fetchPostData.bind(this));
        }
      });
    }
  }

  saveItem(item, type) {
    if (["topic", "stat", "visualization"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_topic");
      axios.post(`/api/cms/${type}/update`, item).then(resp => {
        if (resp.status === 200) {
          this.setState({recompiling: true, isTextEditorOpen: false, isGeneratorEditorOpen: false}, this.fetchPostData.bind(this));
          if (this.props.reportSave) this.props.reportSave();
        }
      });
    }
  }

  render() {

    const {recompiling, rawData, currentText, currentFields, currentTextType, currentGenerator, currentGeneratorType} = this.state;
    
    if (recompiling || !rawData) return <Loading />;

    return (
      <div id="section-editor">
        <div id="slug">
          <label className="pt-label">
            slug
            <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={rawData.slug} onChange={this.changeField.bind(this, "slug")}/>
          </label>
          <button onClick={this.saveItem.bind(this, rawData, "topic")}>rename</button>
        </div>
        <Dialog
          iconName="code"
          isOpen={this.state.isGeneratorEditorOpen}
          onClose={() => this.setState({isGeneratorEditorOpen: false})}
          title="Variable Editor"
          style={{minWidth: "800px"}}
        >
          <div className="pt-dialog-body">
            <GeneratorEditor data={currentGenerator} type={currentGeneratorType} />
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <button
                className="pt-button pt-intent-danger"
                onClick={this.deleteItem.bind(this, currentGenerator, currentGeneratorType)}
              >
                Delete
              </button>
              <button
                className="pt-button"
                onClick={() => this.setState({isGeneratorEditorOpen: false})}
              >
                Cancel
              </button>
              <button
                className="pt-button pt-intent-success"
                onClick={this.saveItem.bind(this, currentGenerator, currentGeneratorType)}
              >
                Save
              </button>
            </div>
          </div>
        </Dialog>
        <Dialog
          iconName="document"
          isOpen={this.state.isTextEditorOpen}
          onClose={() => this.setState({isTextEditorOpen: false})}
          title="Text Editor"
        >
          <div className="pt-dialog-body">
            <TextEditor data={currentText} variables={[]} fields={currentFields} />
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <button
                className="pt-button pt-intent-danger"
                onClick={this.deleteItem.bind(this, currentText, currentTextType)}
              >
                Delete
              </button>
              <button
                className="pt-button"
                onClick={() => this.setState({isTextEditorOpen: false})}
              >
                Cancel
              </button>
              <button
                className="pt-button pt-intent-success"
                onClick={this.saveItem.bind(this, currentText, currentTextType)}
              >
                Save
              </button>
            </div>
          </div>
        </Dialog>
        <Card className="splash-card" onClick={this.openTextEditor.bind(this, rawData, "topic", ["title", "subtitle", "description"])} interactive={true} elevation={1}>
          <h4 className="splash-title" dangerouslySetInnerHTML={{__html: rawData.title}}></h4>
          <h4 className="splash-subtitle" dangerouslySetInnerHTML={{__html: rawData.subtitle}}></h4>
          <h6 className="splash-description" dangerouslySetInnerHTML={{__html: rawData.description}}></h6>
        </Card>
        <div className="stats">
          { rawData.stats.map(s =>
            <StatCard key={s.id}
              /*title={ s.display_title } value={ s.display_value } subtitle={ s.display_subtitle }*/
              title={ s.title } value={ s.value } subtitle={ s.subtitle }
              onClick={this.openTextEditor.bind(this, s, "stat", ["title", "value", "subtitle"])} />
          ) }
          <Card className="stat-card" onClick={this.addItem.bind(this, "stat")} interactive={true} elevation={0}>
            <NonIdealState visual="add" title="Stat" />
          </Card>
        </div>
        <div className="visualizations">
          <div>
            { rawData.visualizations.map(v =>
              <Card key={v.id} onClick={this.openGeneratorEditor.bind(this, v, "visualization")} className="visualization-card" interactive={true} elevation={0}>
                <p>{v.logic}</p>
              </Card>
            ) }
            <Card className="visualization-card" onClick={this.addItem.bind(this, "visualization")} interactive={true} elevation={0}>
              <NonIdealState visual="add" title="Visualization" />
            </Card>
          </div>
        </div>

      </div>
    );
  }
}

export default TopicEditor;

