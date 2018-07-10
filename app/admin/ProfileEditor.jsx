import axios from "axios";
import React, {Component} from "react";
import {Button, Callout, Card, Icon, NonIdealState} from "@blueprintjs/core";
import PropTypes from "prop-types";
import Loading from "components/Loading";

import GeneratorCard from "./components/GeneratorCard";
import TextCard from "./components/TextCard";
import VisualizationCard from "./components/VisualizationCard";

import stubs from "../../utils/stubs.js";

import "./ProfileEditor.css";

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      variables: null,
      recompiling: true,
      preview: "04000US25"
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
    axios.get(`/api/cms/profile/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data}, this.fetchVariables.bind(this));
    });
  }

  fetchVariables() {
    const {slug} = this.state.minData;
    const id = this.state.preview;
    axios.get(`/api/variables/${slug}/${id}`).then(resp => {
      const variables = resp.data;
      this.setState({variables, recompiling: false});
      if (this.props.refreshVariables) this.props.refreshVariables(variables);
    });
  }

  changeField(field, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
    this.setState({minData});
  }

  onSave() {
    this.setState({recompiling: true}, this.fetchVariables.bind(this));
  }

  onDelete(id, type) {
    const {minData} = this.state;
    const f = obj => obj.id !== id;
    if (type === "generator") minData.generators = minData.generators.filter(f);
    if (type === "materializer") minData.materializers = minData.materializers.filter(f);
    if (type === "stat_profile") minData.stats = minData.stats.filter(f);
    if (type === "profile_description") minData.descriptions = minData.descriptions.filter(f);
    if (type === "generator" || type === "materializer") {
      this.setState({minData, recompiling: true}, this.fetchVariables.bind(this));  
    }
    else {
      this.setState({minData});
    }
  }

  save() {
    axios.post("/api/cms/profile/update", this.state.minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.reportSave) this.props.reportSave();  
      }
    });
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = Object.assign({}, stubs[type]);
    payload.profile_id = minData.id; 
    // something about ordering will have to go here
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        if (type === "generator") minData.generators.push({id: resp.data.id, name: resp.data.name});
        if (type === "materializer") minData.materializers.push({id: resp.data.id, name: resp.data.name});
        if (type === "stat_profile") minData.stats.push({id: resp.data.id});
        if (type === "visualization_profile") minData.visualizations.push({id: resp.data.id});
        if (type === "profile_description") minData.descriptions.push({id: resp.data.id});
        if (type === "generator" || type === "materializer") {
          this.setState({minData}, this.fetchVariables.bind(this));
        }
        else {
          this.setState({minData});
        }
      }
    });
  }

  move(dir, item, array, db) {
    const item1 = item;
    if (dir === "left") {
      if (item1.ordering === 0) {
        return;
      }
      else {
        const item2 = array.find(i => i.ordering === item1.ordering - 1);
        item2.ordering = item1.ordering;
        item1.ordering--;
        this.saveItem(item1, db);
        this.saveItem(item2, db);
      }
    }
    else if (dir === "right") {
      if (item1.ordering === array.length - 1) {
        return;
      }
      else {
        const item2 = array.find(i => i.ordering === item1.ordering + 1);
        item2.ordering = item1.ordering;
        item1.ordering++;
        this.saveItem(item1, db);
        this.saveItem(item2, db);
      }
    }

  }

  render() {

    const {preview, minData, variables, recompiling} = this.state;

    const showExperimentalButtons = false;

    if (!minData || !variables) return <Loading />;

    return (
      <div id="profile-editor">
        <div id="status">
          {recompiling ? "Refreshing Variables 🔄" : "Variables Loaded ✅"}
        </div>
  
        <Callout id="preview-toggle">
          <span className="pt-label"><Icon iconName="media" />Preview ID</span>
          <div className="pt-select">
            <select value={preview} onChange={e => this.setState({recompiling: true, preview: e.target.value}, this.fetchVariables.bind(this))}>
              { ["04000US25", "16000US0644000"].map(s => <option value={s} key={s}>{s}</option>) }
            </select>
          </div>
        </Callout>

        <div id="slug">
          <label className="pt-label pt-inline">
            Profile Slug
            <div className="pt-input-group">
              <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={minData.slug} onChange={this.changeField.bind(this, "slug")}/>
              <button className="pt-button" onClick={this.save.bind(this)}>Rename</button>
            </div>
          </label>
        </div>
        
        <h3>
          Generators
          <Button onClick={this.addItem.bind(this, "generator")} iconName="add" />
        </h3>
        <p className="pt-text-muted">Variables constructed from JSON data calls.</p>
        <div className="generator-cards">
          { minData.generators && minData.generators
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(g => <GeneratorCard 
              key={g.id} 
              id={g.id} 
              onSave={this.onSave.bind(this)}
              onDelete={this.onDelete.bind(this)}
              type="generator" 
              variables={variables} 
            />) 
          }
        </div>

        <h3>
          Materializers
          <Button onClick={this.addItem.bind(this, "materializer")} iconName="add" />
        </h3>
        <p className="pt-text-muted">Variables constructed from other variables. No API calls needed.</p>
        <div className="generator-cards materializers">
          { minData.materializers && minData.materializers
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(m => <GeneratorCard 
              key={m.id} 
              id={m.id} 
              onSave={this.onSave.bind(this)}
              onDelete={this.onDelete.bind(this)}
              type="materializer" 
              variables={variables} 
            />)
          }
        </div>

        <div className="splash" style={{backgroundImage: `url("/api/profile/${minData.slug}/${preview}/thumb")`}}>
          <TextCard 
            id={minData.id}
            fields={["title", "subtitle"]}
            type="profile"
            variables={variables}
          />
          <div className="stats">
            { minData.stats && minData.stats.map(s =>
              <TextCard key={s.id}
                id={s.id}
                onDelete={this.onDelete.bind(this)}
                type="stat_profile"
                fields={["title", "subtitle", "value"]}
                variables={variables}
              />) 
            }
            <Card className="stat-card" onClick={this.addItem.bind(this, "stat_profile")} interactive={true} elevation={0}>
              <NonIdealState visual="add" title="Stat" />
            </Card>
          </div>
        </div>

        <h3>
          About
          <Button onClick={this.addItem.bind(this, "profile_description")} iconName="add" />
        </h3>
        
        <div className="descriptions">
          { minData.descriptions && minData.descriptions.map(d =>
            <div key={d.id}>
              <TextCard key={d.id}
                id={d.id}
                onDelete={this.onDelete.bind(this)}
                fields={["description"]}
                type="profile_description"
                variables={variables}
              />
              {showExperimentalButtons && minData.descriptions.length > 1 && <div>
                {d.ordering > 0 && <button onClick={() => this.move("left", d, minData.descriptions, "profile_description")}><span className="pt-icon pt-icon-arrow-left" /></button> }
                {d.ordering < minData.descriptions.length - 1 && <button onClick={() => this.move("right", d, minData.descriptions, "profile_description")}><span className="pt-icon pt-icon-arrow-right" /></button> }
              </div>}
            </div>)
          }
        </div>

        <h3>
          Visualizations
          <Button onClick={this.addItem.bind(this, "visualization_profile")} iconName="add" />
        </h3>
        <div className="visualizations">
          <div>
            { minData.visualizations && minData.visualizations.map(v =>
              <VisualizationCard 
                key={v.id} 
                id={v.id} 
                onDelete={this.onDelete.bind(this)}
                type="visualization_profile" 
                variables={variables} 
              />)
            }
          </div>
        </div>
      </div>
    );
  }
}

ProfileEditor.contextTypes = {
  formatters: PropTypes.object
};

export default ProfileEditor;
