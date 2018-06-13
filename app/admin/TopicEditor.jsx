import axios from "axios";
import React, {Component} from "react";
import {Dialog, Card, NonIdealState} from "@blueprintjs/core";
import TextEditor from "./TextEditor";
import Loading from "components/Loading";
import GeneratorEditor from "./GeneratorEditor";
import varSwap from "../../utils/varSwap";
import PropTypes from "prop-types";

import "./TopicEditor.css";

class TopicEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rawData: null
    };
  }

  componentDidMount() {
    const {rawData} = this.props;
    this.setState({rawData});
  }

  componentDidUpdate() {
    if (this.props.rawData.id !== this.state.rawData.id) {
      this.setState({rawData: this.props.rawData});
    }
  }

  changeField(field, e) {
    const {rawData} = this.state;
    rawData[field] = e.target.value;
    this.setState({rawData});
  }

  chooseVariable(e) {
    const {rawData} = this.state;
    rawData.allowed = e.target.value;
    this.setState({rawData}, this.saveItem.bind(this, rawData, "topic"));
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
          this.setState({rawData});
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
          this.setState({rawData});
        }
        else {
          console.log("db error");
        }
      });
    }
    else if (type === "subtitle") {
      payload = {
        subtitle: "New Subtitle",
        topic_id: rawData.id
      };
      axios.post("/api/cms/topic_subtitle/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.subtitles.push(resp.data);
          this.setState({rawData});
        }
        else {
          console.log("db error");
        }
      });
    }
    else if (type === "description") {
      payload = {
        description: "New Description",
        topic_id: rawData.id
      };
      axios.post("/api/cms/topic_description/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.descriptions.push(resp.data);
          this.setState({rawData});
        }
        else {
          console.log("db error");
        }
      });
    }
    else if (type === "selector") {
      payload = {
        options: ["options", "go", "here"],
        default: "options",
        topic_id: rawData.id,
        name: "new-selector"
      };
      axios.post("/api/cms/selector/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.selectors.push(resp.data);
          this.setState({rawData});
        }
        else {
          console.log("db error");
        }
      });
    }
  }

  deleteItem(item, type) {
    const {rawData} = this.state;
    if (["stat", "visualization", "topic_subtitle", "topic_description"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_topic");
      axios.delete(`/api/cms/${type}/delete`, {params: {id: item.id}}).then(resp => {
        if (resp.status === 200) {
          if (type === "stat_topic") rawData.stats = rawData.stats.filter(s => s.id !== item.id);
          if (type === "visualization_topic") rawData.visualizations = rawData.visualizations.filter(v => v.id !== item.id);
          if (type === "topic_subtitle") rawData.subtitles = rawData.subtitles.filter(s => s.id !== item.id);
          if (type === "topic_description") rawData.descriptions = rawData.descriptions.filter(d => d.id !== item.id);
          this.setState({rawData, isGeneratorEditorOpen: false, isTextEditorOpen: false});
        }
      });
    }
  }

  saveItem(item, type) {
    if (["topic", "stat", "visualization", "topic_subtitle", "topic_description"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_topic");
      axios.post(`/api/cms/${type}/update`, item).then(resp => {
        if (resp.status === 200) {
          this.setState({isTextEditorOpen: false, isGeneratorEditorOpen: false});
          if (this.props.reportSave) this.props.reportSave();
        }
      });
    }
  }

  render() {

    const {rawData, currentText, currentFields, currentTextType, currentGenerator, currentGeneratorType} = this.state;
    const {formatters} = this.context;
    const {variables} = this.props;
    
    if (!rawData) return <Loading />;

    rawData.display_vars = varSwap(rawData, formatters, variables);
    if (rawData.stats) rawData.stats.forEach(s => s.display_vars = varSwap(s, formatters, variables));
    if (rawData.subtitles) rawData.subtitles.forEach(s => s.display_vars = varSwap(s, formatters, variables));
    if (rawData.descriptions) rawData.descriptions.forEach(d => d.display_vars = varSwap(d, formatters, variables));

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
          <button onClick={this.saveItem.bind(this, rawData, "topic")}>rename</button>
        </div>
        <div className="pt-select">
          Allowed?
          <select value={rawData.allowed || "always"} onChange={this.chooseVariable.bind(this)} style={{margin: "5px"}}>
            {varOptions}
          </select>
        </div>
        <Dialog
          iconName="code"
          isOpen={this.state.isGeneratorEditorOpen}
          onClose={() => this.setState({isGeneratorEditorOpen: false})}
          title="Variable Editor"
          style={{minWidth: "800px"}}
        >
          <div className="pt-dialog-body">
            <GeneratorEditor variables={variables} data={currentGenerator} type={currentGeneratorType} />
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
            <TextEditor data={currentText} variables={variables} fields={currentFields} />
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
        <h4>Title</h4>
        <Card className="splash-card" onClick={this.openTextEditor.bind(this, rawData, "topic", ["title"])} interactive={true} elevation={1}>
          <h4 className="splash-title" dangerouslySetInnerHTML={{__html: rawData.display_vars.title}}></h4>
        </Card>
        <h4>Subtitles</h4>
        { rawData.subtitles && rawData.subtitles.map(s => 
          <Card key={s.id} className="splash-card" onClick={this.openTextEditor.bind(this, s, "topic_subtitle", ["subtitle"])} interactive={true} elevation={1}>
            <p className="splash-title" dangerouslySetInnerHTML={{__html: s.display_vars.subtitle}}></p>
          </Card>) 
        }
        <Card className="generator-card" onClick={this.addItem.bind(this, "subtitle")} interactive={true} elevation={0}>
          <NonIdealState visual="add" title="New Subtitle" />
        </Card>
        <h4>Descriptions</h4>
        { rawData.descriptions && rawData.descriptions.map(d => 
          <Card key={d.id} className="splash-card" onClick={this.openTextEditor.bind(this, d, "topic_description", ["description"])} interactive={true} elevation={1}>
            <p className="splash-title" dangerouslySetInnerHTML={{__html: d.display_vars.description}}></p>
          </Card>) 
        }
        <Card className="generator-card" onClick={this.addItem.bind(this, "description")} interactive={true} elevation={0}>
          <NonIdealState visual="add" title="New Description" />
        </Card>
        <h4>Selectors</h4>
        { rawData.selectors && rawData.selectors.map(s => 
          <div key={s.id}>
            <h4>{s.name}</h4>
            <ul style={{border: "1px solid black"}}>
              {s.options.map(o => 
                <li key={o}>{o}</li>
              )}
            </ul>
          </div>
        )}
        <Card className="generator-card" onClick={this.addItem.bind(this, "selector")} interactive={true} elevation={0}>
          <NonIdealState visual="add" title="New Selector" />
        </Card>
      </div>
    );
  }
}

TopicEditor.contextTypes = {
  formatters: PropTypes.object
};

export default TopicEditor;

