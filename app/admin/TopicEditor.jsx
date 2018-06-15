import axios from "axios";
import React, {Component} from "react";
import {Dialog, Card, NonIdealState} from "@blueprintjs/core";
import TextEditor from "./TextEditor";
import GeneratorEditor from "./GeneratorEditor";
import Loading from "components/Loading";
import SelectorEditor from "./SelectorEditor";
import FooterButtons from "./components/FooterButtons";
import varSwap from "../../utils/varSwap";
import selSwap from "../../utils/selSwap";

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
    this.setState({rawData}, this.formatDisplays.bind(this));
  }

  componentDidUpdate() {
    if (this.props.rawData.id !== this.state.rawData.id) {
      this.setState({rawData: this.props.rawData}, this.formatDisplays.bind(this));
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

  openTextEditor(t, type, fields) {
    this.setState({currentText: t, currentFields: fields, currentTextType: type, isTextEditorOpen: true});
  }

  openSelectorEditor(s, type) {
    this.setState({currentSelector: s, currentSelectorType: type, isSelectorEditorOpen: true}); 
  }

  openGeneratorEditor(g, type) {
    this.setState({currentGenerator: g, currentGeneratorType: type, isGeneratorEditorOpen: true});
  }

  formatDisplays() {
    const {rawData} = this.state;
    const {formatters} = this.context;
    const {variables} = this.props;

    const selectors = rawData.selectors ? rawData.selectors.map(s => ({name: s.name, option: s.default})) : [];
    
    const displayify = obj => obj.display_vars = varSwap(selSwap(obj, selectors), formatters, variables);
    
    displayify(rawData);
    if (rawData.stats) rawData.stats.forEach(displayify);
    if (rawData.subtitles) rawData.subtitles.forEach(displayify);
    if (rawData.descriptions) rawData.descriptions.forEach(displayify);
    // Do we need a visualization one? Check with dave

    this.setState({rawData});
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
          this.setState({rawData}, this.formatDisplays.bind(this));
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
          this.setState({rawData}, this.formatDisplays.bind(this));
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
          this.setState({rawData}, this.formatDisplays.bind(this));
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
          this.setState({rawData}, this.formatDisplays.bind(this));
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
          this.setState({rawData}, this.formatDisplays.bind(this));
        }
        else {
          console.log("db error");
        }
      });
    }
  }

  deleteItem(item, type) {
    const {rawData} = this.state;
    if (["stat", "visualization", "topic_subtitle", "topic_description", "selector"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_topic");
      axios.delete(`/api/cms/${type}/delete`, {params: {id: item.id}}).then(resp => {
        if (resp.status === 200) {
          const f = obj => obj.id !== item.id;
          if (type === "stat_topic") rawData.stats = rawData.stats.filter(f);
          if (type === "visualization_topic") rawData.visualizations = rawData.visualizations.filter(f);
          if (type === "topic_subtitle") rawData.subtitles = rawData.subtitles.filter(f);
          if (type === "topic_description") rawData.descriptions = rawData.descriptions.filter(f);
          if (type === "selector") rawData.selectors = rawData.selectors.filter(f);
          this.setState({rawData, isSelectorEditorOpen: false, isTextEditorOpen: false, isGeneratorEditorOpen: false}, this.formatDisplays.bind(this));
        }
      });
    }
  }

  saveItem(item, type) {
    if (["topic", "stat", "visualization", "topic_subtitle", "topic_description", "selector"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_topic");
      axios.post(`/api/cms/${type}/update`, item).then(resp => {
        if (resp.status === 200) {
          this.setState({isTextEditorOpen: false, isSelectorEditorOpen: false, isGeneratorEditorOpen: false}, this.formatDisplays.bind(this));
          if (this.props.reportSave) this.props.reportSave();
        }
      });
    }
  }

  render() {

    const {rawData, currentText, currentFields, currentTextType, currentGenerator, currentGeneratorType, currentSelector, currentSelectorType} = this.state;
    const {variables} = this.props;
    
    // The display_vars test here is because we don't format displays until after the first render (see mount). 
    // Maybe find a more reliable way to do this 
    if (!rawData || !rawData.display_vars) return <Loading />;

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
            <GeneratorEditor data={currentGenerator} variables={variables} type={currentGeneratorType} />
          </div>
          <FooterButtons
            onDelete={this.deleteItem.bind(this, currentGenerator, currentGeneratorType)}
            onCancel={() => this.setState({isGeneratorEditorOpen: false})}
            onSave={this.saveItem.bind(this, currentGenerator, currentGeneratorType)}
          />
        </Dialog>
        <Dialog
          iconName="code"
          isOpen={this.state.isSelectorEditorOpen}
          onClose={() => this.setState({isSelectorEditorOpen: false})}
          title="Selector Editor"
          style={{minWidth: "800px"}}
        >
          <div className="pt-dialog-body">
            <SelectorEditor variables={variables} data={currentSelector} type={currentSelectorType} />
          </div>
          <FooterButtons 
            onDelete={this.deleteItem.bind(this, currentSelector, currentSelectorType)}
            onCancel={() => this.setState({isSelectorEditorOpen: false})}
            onSave={this.saveItem.bind(this, currentSelector, currentSelectorType)}
          />
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
          <FooterButtons 
            onDelete={this.deleteItem.bind(this, currentText, currentTextType)}
            onCancel={() => this.setState({isTextEditorOpen: false})}
            onSave={this.saveItem.bind(this, currentText, currentTextType)}
          />
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
        <h4>Visualizations</h4>
        <div className="visualizations">
          <div>
            { rawData.visualizations && rawData.visualizations.map(v =>
              <Card key={v.id} onClick={this.openGeneratorEditor.bind(this, v, "visualization")} className="visualization-card" interactive={true} elevation={0}>
                <p>{v.logic}</p>
              </Card>
            )}
            <Card className="visualization-card" onClick={this.addItem.bind(this, "visualization")} interactive={true} elevation={0}>
              <NonIdealState visual="add" title="Visualization" />
            </Card>
          </div>
        </div>
        <h4>Selectors</h4>
        { rawData.selectors && rawData.selectors.map(s => 
          <Card className="splash-card" key={s.id} onClick={this.openSelectorEditor.bind(this, s, "selector")} interactive={true} elevation={1}>
            <h4>{s.name}</h4>
            <ul>
              {s.options && s.options.map(o => 
                <li key={o.option}>{o.option}</li>
              )}
            </ul>
          </Card>
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

