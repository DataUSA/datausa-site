import axios from "axios";
import React, {Component} from "react";
import {Button, Callout, Card, Icon, NonIdealState} from "@blueprintjs/core";
import PropTypes from "prop-types";
import Loading from "components/Loading";

import GeneratorCard from "./components/GeneratorCard";
import TextCard from "./components/TextCard";
import VisualizationCard from "./components/VisualizationCard";
import MoveButtons from "./components/MoveButtons";

import stubs from "../../utils/stubs.js";

import "./ProfileEditor.css";

const propMap = {
  generator: "generators",
  materializer: "materializers",
  stat_profile: "stats",
  profile_description: "descriptions"
};

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
      this.setState({minData: resp.data, recompiling: true}, this.fetchVariables.bind(this, false));
    });
  }

  fetchVariables(force) {
    const slug = this.props.masterSlug;
    const id = this.state.preview;
    if (this.props.fetchVariables) {
      this.props.fetchVariables(slug, id, force, () => this.setState({recompiling: false}));
    }
  }

  changeField(field, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
    this.setState({minData});
  }

  onSave() {
    this.setState({recompiling: true}, this.fetchVariables.bind(this, true));
  }

  onDelete(id, type) {
    const {minData} = this.state;
    const f = obj => obj.id !== id;
    minData[propMap[type]] = minData[propMap[type]].filter(f);
    if (type === "generator" || type === "materializer") {
      this.setState({minData, recompiling: true}, this.fetchVariables.bind(this, true));  
    }
    else {
      this.setState({minData});
    }
  }

  save() {
    const {minData} = this.state;
    axios.post("/api/cms/profile/update", minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.reportSave) this.props.reportSave("profile", minData.id, minData.slug);  
      }
    });
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = Object.assign({}, stubs[type]);
    payload.profile_id = minData.id; 
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        if (type === "generator" || type === "materializer") {
          minData[propMap[type]].push({id: resp.data.id, name: resp.data.name, ordering: resp.data.ordering || null});
          this.setState({minData}, this.fetchVariables.bind(this, true));
        }
        else {
          minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
          this.setState({minData});
        }
      }
    });
  }

  onMove() {
    this.forceUpdate();
  }

  render() {

    const {preview, minData, recompiling} = this.state;
    const {variables} = this.props;

    if (!minData || !variables) return <Loading />;

    return (
      <div id="profile-editor">
        <div id="status">
          {recompiling ? "Refreshing Variables 🔄" : "Variables Loaded ✅"}
        </div>
  
        <Callout id="preview-toggle">
          <span className="pt-label"><Icon iconName="media" />Preview ID</span>
          <div className="pt-select">
            <select value={preview} onChange={e => this.setState({recompiling: true, preview: e.target.value}, this.fetchVariables.bind(this, true))}>
              { ["04000US25", "04000US36"].map(s => <option value={s} key={s}>{s}</option>) }
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
              <MoveButtons 
                item={d}
                array={minData.descriptions}
                type="profile_description"
                onMove={this.onMove.bind(this)}
              />
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
