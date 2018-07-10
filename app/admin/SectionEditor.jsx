import axios from "axios";
import React, {Component} from "react";
import {Button} from "@blueprintjs/core";
import Loading from "components/Loading";
import TextCard from "./components/TextCard";
import PropTypes from "prop-types";

import stubs from "../../utils/stubs.js";

import "./SectionEditor.css";

class SectionEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)();
    }
  }

  hitDB() {
    axios.get(`/api/cms/section/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data});
    });
  }

  changeField(field, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
    this.setState({minData});
  }

  chooseVariable(e) {
    const {minData} = this.state;
    minData.allowed = e.target.value;
    this.setState({minData}, this.save.bind(this));
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = Object.assign({}, stubs[type]);
    payload.section_id = minData.id; 
    // something about ordering will have to go here
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        if (type === "section_subtitle") minData.subtitles.push({id: resp.data.id});
        if (type === "section_description") minData.descriptions.push({id: resp.data.id});
        this.setState({minData});
      }
    });
  }

  onDelete(id, type) {
    const {minData} = this.state;
    const f = obj => obj.id !== id;
    if (type === "section_subtitle") minData.subtitles = minData.subtitles.filter(f);
    if (type === "section_description") minData.descriptions = minData.descriptions.filter(f);
    this.setState({minData});
  }

  save() {
    axios.post("/api/cms/section/update", this.state.minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.reportSave) this.props.reportSave();  
      }
    });
  }

  render() {

    const {minData} = this.state;
    const {variables} = this.props;

    if (!minData) return <Loading />;

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
          <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={minData.slug} onChange={this.changeField.bind(this, "slug")}/>
          <button onClick={this.save.bind(this)}>rename</button>
        </div>
        <div className="pt-select">
          Allowed?
          <select value={minData.allowed || "always"} onChange={this.chooseVariable.bind(this)} style={{margin: "5px", width: "200px"}}>
            {varOptions}
          </select>
        </div>
        <h4>Title</h4>
        <TextCard 
          id={minData.id}
          fields={["title"]}
          type="section"
          variables={variables}
        />
        <h4>Subtitles</h4>
        <Button onClick={this.addItem.bind(this, "section_subtitle")} iconName="add" />
        { minData.subtitles && minData.subtitles.map(s => 
          <TextCard 
            key={s.id}
            id={s.id}
            fields={["subtitle"]}
            type="section_subtitle"
            onDelete={this.onDelete.bind(this)}
            variables={variables}
          />) 
        }
        <h4>Descriptions</h4>
        <Button onClick={this.addItem.bind(this, "section_description")} iconName="add" />
        { minData.descriptions && minData.descriptions.map(d => 
          <TextCard 
            key={d.id}
            id={d.id}
            fields={["description"]}
            type="section_description"
            onDelete={this.onDelete.bind(this)}
            variables={variables}
          />)  
        }
      </div>
    );
  }
}

SectionEditor.contextTypes = {
  formatters: PropTypes.object
};

export default SectionEditor;
