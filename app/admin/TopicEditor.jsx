import axios from "axios";
import React, {Component} from "react";
import {Button, Callout, Icon} from "@blueprintjs/core";
import Loading from "components/Loading";
import PropTypes from "prop-types";
import TextCard from "./components/TextCard";
import SelectorCard from "./components/SelectorCard";
import VisualizationCard from "./components/VisualizationCard";

import stubs from "../../utils/stubs.js";

import "./TopicEditor.css";

class TopicEditor extends Component {

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
    axios.get(`/api/cms/topic/get/${this.props.id}`).then(resp => {
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
    payload.topic_id = minData.id; 
    // something about ordering will have to go here
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        if (type === "topic_subtitle") minData.subtitles.push({id: resp.data.id});
        if (type === "topic_description") minData.descriptions.push({id: resp.data.id});
        if (type === "stat_topic") minData.stats.push({id: resp.data.id});
        if (type === "visualization_topic") minData.visualizations.push({id: resp.data.id});
        if (type === "selector") minData.selectors.push(resp.data);
        this.setState({minData});
      }
    });
  }

  save() {
    const {minData} = this.state;
    axios.post("/api/cms/topic/update", minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
      }
    });
  }

  onSave(minData) {
    if (this.props.reportSave) this.props.reportSave("topic", minData.id, minData.title);
  }

  onDelete(id, type) {
    const {minData} = this.state;
    const f = obj => obj.id !== id;
    if (type === "topic_subtitle") minData.subtitles = minData.subtitles.filter(f);
    if (type === "topic_description") minData.descriptions = minData.descriptions.filter(f);
    if (type === "stat_topic") minData.stats = minData.stats.filter(f);
    if (type === "visualization_topic") minData.visualizations = minData.visualizations.filter(f);
    if (type === "selector") minData.selectors = minData.selectors.filter(f);
    this.setState({minData});
  }

  fetchVariables(force) {
    const slug = this.props.masterSlug;
    const id = this.state.preview;
    if (this.props.fetchVariables) {
      this.props.fetchVariables(slug, id, force, () => this.setState({recompiling: false}));
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
          onSave={this.onSave.bind(this)}
          type="topic"
          variables={variables}
        />
        <h4>Subtitles</h4>
        <Button onClick={this.addItem.bind(this, "topic_subtitle")} iconName="add" />
        { minData.subtitles && minData.subtitles.map(s => 
          <TextCard 
            key={s.id}
            id={s.id}
            fields={["subtitle"]}
            type="topic_subtitle"
            onDelete={this.onDelete.bind(this)}
            variables={variables}
            selectors={minData.selectors.map(s => Object.assign({}, s))}
          />) 
        }
        <h4>Descriptions</h4>
        <Button onClick={this.addItem.bind(this, "topic_description")} iconName="add" />
        { minData.descriptions && minData.descriptions.map(d => 
          <TextCard 
            key={d.id}
            id={d.id}
            fields={["description"]}
            type="topic_description"
            onDelete={this.onDelete.bind(this)}
            variables={variables}
            selectors={minData.selectors.map(s => Object.assign({}, s))}
          />) 
        }
        <h4>Stats</h4>
        <Button onClick={this.addItem.bind(this, "stat_topic")} iconName="add" />
        <div className="stats">
          { minData.stats && minData.stats.map(s =>
            <TextCard 
              key={s.id}
              id={s.id}
              fields={["title", "subtitle", "value"]}
              type="stat_topic"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
              selectors={minData.selectors.map(s => Object.assign({}, s))}
            />)
          }
        </div>
        <h4>Visualizations</h4>
        <Button onClick={this.addItem.bind(this, "visualization_topic")} iconName="add" />
        <div className="visualizations">
          <div>
            { minData.visualizations && minData.visualizations.map(v =>
              <VisualizationCard 
                key={v.id} 
                id={v.id} 
                onDelete={this.onDelete.bind(this)}
                type="visualization_topic" 
                variables={variables} 
              />
            )}
          </div>
        </div>
        <h4>Selectors</h4>
        <Button onClick={this.addItem.bind(this, "selector")} iconName="add" />
        { minData.selectors && minData.selectors.map(s => 
          <SelectorCard 
            key={s.id}
            // id={s.id}
            minData={s}
            type="selector"
            onSave={() => this.forceUpdate()}
            onDelete={this.onDelete.bind(this)}
            variables={variables}
          />)
        }

      </div>
    );
  }
}

TopicEditor.contextTypes = {
  formatters: PropTypes.object
};

export default TopicEditor;

