import axios from "axios";
import React, {Component} from "react";
import {Dialog, Card, NonIdealState} from "@blueprintjs/core";
import TextEditor from "./TextEditor";
import Loading from "components/Loading";
import varSwapRecursive from "../../utils/varSwapRecursive";
import FooterButtons from "./components/FooterButtons";
import PropTypes from "prop-types";

import "./SectionEditor.css";

class SectionEditor extends Component {

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
    this.setState({rawData}, this.saveItem.bind(this, rawData, "section"));
  }

  openTextEditor(t, type, fields) {
    this.setState({currentText: t, currentFields: fields, currentTextType: type, isTextEditorOpen: true});
  }

  addItem(type) {
    const {rawData} = this.state;
    let payload;
    if (type === "subtitle") {
      payload = {
        subtitle: "New Subtitle",
        section_id: rawData.id
      };
      axios.post("/api/cms/section_subtitle/new", payload).then(resp => {
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
        section_id: rawData.id
      };
      axios.post("/api/cms/section_description/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.descriptions.push(resp.data);
          this.setState({rawData});
        }
        else {
          console.log("db error");
        }
      });
    }
  }

  saveItem(item, type) {
    if (["section_subtitle", "section_description"].includes(type)) {
      axios.post(`/api/cms/${type}/update`, item).then(resp => {
        if (resp.status === 200) {
          this.setState({isTextEditorOpen: false});
          if (this.props.reportSave) this.props.reportSave();
        }
      });
    }
  }

  deleteItem(item, type) {
    const {rawData} = this.state;
    if (["section_subtitle", "section_description"].includes(type)) {
      axios.delete(`/api/cms/${type}/delete`, {params: {id: item.id}}).then(resp => {
        if (resp.status === 200) {
          if (type === "section_subtitle") rawData.subtitles = rawData.subtitles.filter(s => s.id !== item.id);
          if (type === "section_description") rawData.descriptions = rawData.descriptions.filter(d => d.id !== item.id);
          this.setState({rawData, isTextEditorOpen: false});
        }
      });
    }
  }

  render() {

    const {rawData, currentText, currentFields, currentTextType} = this.state;
    const {formatters} = this.context;
    const {variables} = this.props;

    if (!rawData) return <Loading />;

    rawData.display_vars = varSwapRecursive(rawData, formatters, variables);
    if (rawData.subtitles) rawData.subtitles.forEach(s => s.display_vars = varSwapRecursive(s, formatters, variables));
    if (rawData.descriptions) rawData.descriptions.forEach(d => d.display_vars = varSwapRecursive(d, formatters, variables));

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
          <button onClick={this.saveItem.bind(this, rawData, "section")}>rename</button>
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
            <TextEditor data={currentText} variables={variables} fields={currentFields} />
          </div>
          <FooterButtons 
            onDelete={this.deleteItem.bind(this, currentText, currentTextType)}
            onCancel={() => this.setState({isTextEditorOpen: false})}
            onSave={this.saveItem.bind(this, currentText, currentTextType)}
          />
        </Dialog>
        <h4>Title</h4>
        <Card className="splash-card" onClick={this.openTextEditor.bind(this, rawData, "section", ["title"])} interactive={true} elevation={1}>
          <h4 className="splash-title" dangerouslySetInnerHTML={{__html: rawData.display_vars.title}}></h4>
        </Card>
        <h4>Subtitles</h4>
        { rawData.subtitles && rawData.subtitles.map(s => 
          <Card key={s.id} className="splash-card" onClick={this.openTextEditor.bind(this, s, "section_subtitle", ["subtitle"])} interactive={true} elevation={1}>
            <h6 className="splash-title" dangerouslySetInnerHTML={{__html: s.display_vars.subtitle}}></h6>
          </Card>) 
        }
        <Card className="generator-card" onClick={this.addItem.bind(this, "subtitle")} interactive={true} elevation={0}>
          <NonIdealState visual="add" title="New Subtitle" />
        </Card>
        <h4>Descriptions</h4>
        { rawData.descriptions && rawData.descriptions.map(d => 
          <Card key={d.id} className="splash-card" onClick={this.openTextEditor.bind(this, d, "section_description", ["description"])} interactive={true} elevation={1}>
            <h6 className="splash-title" dangerouslySetInnerHTML={{__html: d.display_vars.description}}></h6>
          </Card>) 
        }
        <Card className="generator-card" onClick={this.addItem.bind(this, "description")} interactive={true} elevation={0}>
          <NonIdealState visual="add" title="New Description" />
        </Card>
      </div>
    );
  }
}

SectionEditor.contextTypes = {
  formatters: PropTypes.object
};

export default SectionEditor;
