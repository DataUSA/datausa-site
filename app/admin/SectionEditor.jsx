import axios from "axios";
import React, {Component} from "react";
import {Button, Callout, Icon} from "@blueprintjs/core";
import Loading from "components/Loading";
import TextCard from "./components/TextCard";
import PropTypes from "prop-types";
import MoveButtons from "./components/MoveButtons";

import stubs from "../../utils/stubs.js";

import "./SectionEditor.css";

const propMap = {
  section_subtitle: "subtitles",
  section_description: "descriptions"
};

class SectionEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      preview: "04000US25"
    };
  }

  componentDidMount() {
    if (this.props.currentID) this.setState({preview: this.props.currentID});
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)();
    }
  }

  hitDB() {
    axios.get(`/api/cms/section/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data}, this.fetchVariables.bind(this, false));
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
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        this.setState({minData});
      }
    });
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  onSave(minData) {
    if (this.props.reportSave) this.props.reportSave("section", minData.id, minData.title);  
  }

  onMove() {
    this.forceUpdate();
  }

  save() {
    const {minData} = this.state;
    axios.post("/api/cms/section/update", minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
      }
    });
  }

  fetchVariables(force) {
    const slug = this.props.masterSlug;
    const id = this.state.preview;
    if (this.props.fetchVariables) {
      this.props.fetchVariables(slug, id, force);
    }
  }

  render() {

    const {minData, preview} = this.state;
    const {variables} = this.props;

    if (!minData || !variables) return <Loading />;

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
        <Callout id="preview-toggle">
          <span className="pt-label"><Icon iconName="media" />Preview ID</span>
          <div className="pt-select">
            <select value={preview} onChange={e => this.setState({preview: e.target.value}, this.fetchVariables.bind(this, true))}>
              { ["04000US25", "04000US36"].map(s => <option value={s} key={s}>{s}</option>) }
            </select>
          </div>
        </Callout>
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
          onSave={this.onSave.bind(this)}
          variables={variables}
        />
        <h4>Subtitles</h4>
        <Button onClick={this.addItem.bind(this, "section_subtitle")} iconName="add" />
        { minData.subtitles && minData.subtitles.map(s => 
          <div key={s.id}>
            <TextCard 
              key={s.id}
              id={s.id}
              fields={["subtitle"]}
              type="section_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
            />
            <MoveButtons 
              item={s}
              array={minData.subtitles}
              type="section_subtitle"
              onMove={this.onMove.bind(this)}
            />
          </div>) 
        }
        <h4>Descriptions</h4>
        <Button onClick={this.addItem.bind(this, "section_description")} iconName="add" />
        { minData.descriptions && minData.descriptions.map(d => 
          <div key={d.id}>
            <TextCard 
              key={d.id}
              id={d.id}
              fields={["description"]}
              type="section_description"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
            />
            <MoveButtons 
              item={d}
              array={minData.descriptions}
              type="section_description"
              onMove={this.onMove.bind(this)}
            />
          </div>)  
        }
      </div>
    );
  }
}

SectionEditor.contextTypes = {
  formatters: PropTypes.object
};

export default SectionEditor;
