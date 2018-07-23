import axios from "axios";
import React, {Component} from "react";
import {Button, Card, NonIdealState} from "@blueprintjs/core";
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
  profile_stat: "stats",
  profile_description: "descriptions",
  profile_visualization: "visualizations"
};

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      variables: null,
      recompiling: true
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)(false);
    }
    if (prevProps.preview !== this.props.preview) {
      this.hitDB.bind(this)(true);
    }
  }

  hitDB(force) {
    axios.get(`/api/cms/profile/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data, recompiling: true}, this.fetchVariables.bind(this, force));
    });
  }

  fetchVariables(force) {
    const slug = this.props.masterSlug;
    const id = this.props.preview;
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

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
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
    // todo: move this ordering out to axios (let the server concat it to the end)
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

    const {minData, recompiling} = this.state;
    const {variables, preview} = this.props;

    if (!minData || !variables) return <Loading />;

    return (
      <div id="profile-editor">
        <div id="status">
          {recompiling ? "Refreshing Variables 🔄" : "Variables Loaded ✅"}
        </div>

        <div id="slug">
          <label className="pt-label pt-inline">
            Profile Slug
            <div className="pt-input-group">
              <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={minData.slug} onChange={this.changeField.bind(this, "slug")}/>
              <button className="pt-button" onClick={this.save.bind(this)}>Rename</button>
            </div>
          </label>
        </div>

        <h4>
          Generators
          <Button onClick={this.addItem.bind(this, "generator")} iconName="add" />
        </h4>
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

        <h4>
          Materializers
          <Button onClick={this.addItem.bind(this, "materializer")} iconName="add" />
        </h4>
        <p className="pt-text-muted">Variables constructed from other variables. No API calls needed.</p>
        <div className="generator-cards materializers">
          { minData.materializers && minData.materializers
            .map(m => <div key={m.id}>
              <GeneratorCard
                key={m.id}
                id={m.id}
                onSave={this.onSave.bind(this)}
                onDelete={this.onDelete.bind(this)}
                type="materializer"
                variables={variables}
              />
              <MoveButtons
                item={m}
                array={minData.materializers}
                type="materializer"
                onMove={this.onMove.bind(this)}
              />
            </div>)
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
              <div key={s.id}>
                <TextCard key={s.id}
                  id={s.id}
                  onDelete={this.onDelete.bind(this)}
                  type="profile_stat"
                  fields={["title", "subtitle", "value"]}
                  variables={variables}
                />
                <MoveButtons
                  item={s}
                  array={minData.stats}
                  type="profile_stat"
                  onMove={this.onMove.bind(this)}
                />
              </div>)
            }
            <Card className="stat-card" onClick={this.addItem.bind(this, "profile_stat")} interactive={true} elevation={0}>
              <NonIdealState visual="add" title="Stat" />
            </Card>
          </div>
        </div>

        <h4>
          About
          <Button onClick={this.addItem.bind(this, "profile_description")} iconName="add" />
        </h4>

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

        <h4>
          Visualizations
          <Button onClick={this.addItem.bind(this, "profile_visualization")} iconName="add" />
        </h4>
        <div className="visualizations">
          <div>
            { minData.visualizations && minData.visualizations.map(v =>
              <div key={v.id}>
                <VisualizationCard
                  key={v.id}
                  id={v.id}
                  onDelete={this.onDelete.bind(this)}
                  type="profile_visualization"
                  variables={variables}
                />
                <MoveButtons
                  item={v}
                  array={minData.visualizations}
                  type="profile_visualization"
                  onMove={this.onMove.bind(this)}
                />
              </div>)
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
