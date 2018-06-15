import axios from "axios";
import React, {Component} from "react";
import {Button, Callout, Card, Dialog, Icon, NonIdealState} from "@blueprintjs/core";
import GeneratorEditor from "./GeneratorEditor";
import TextEditor from "./TextEditor";
import PropTypes from "prop-types";
import Loading from "components/Loading";
import FooterButtons from "./components/FooterButtons";

import GeneratorCard from "./components/GeneratorCard";
import StatCard from "./components/StatCard";

import varSwap from "../../utils/varSwap";

import "./ProfileEditor.css";

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rawData: null,
      variables: null,
      recompiling: true,
      preview: "04000US25"
    };
  }

  componentDidMount() {
    const {rawData} = this.props;
    this.setState({rawData, recompiling: true}, this.fetchVariables.bind(this));
  }

  componentDidUpdate() {
    if (this.props.rawData.id !== this.state.rawData.id) {
      this.setState({rawData: this.props.rawData, recompiling: true}, this.fetchVariables.bind(this));
    }
  }

  fetchVariables() {
    const {slug} = this.state.rawData;
    const id = this.state.preview;
    axios.get(`/api/variables/${slug}/${id}`).then(resp => {
      const variables = resp.data;
      this.setState({variables}, this.formatDisplays.bind(this));
      if (this.props.refreshVariables) this.props.refreshVariables(variables);
    });
  }

  formatDisplays() {
    const {rawData, variables} = this.state;
    const {formatters} = this.context;

    rawData.display_vars = varSwap(rawData, formatters, variables);
    if (rawData.stats) rawData.stats.forEach(stat => stat.display_vars = varSwap(stat, formatters, variables));
    if (rawData.descriptions) rawData.descriptions.forEach(desc => desc.display_vars = varSwap(desc, formatters, variables));
    // rawData.generators.forEach(g => g.display_vars = varSwap(variables._genStatus[g.id], formatters, variables._genStatus[g.id]));
    if (rawData.generators) rawData.generators.forEach(g => g.display_vars = variables._genStatus[g.id]);
    // rawData.materializers.forEach(m => m.display_vars = varSwap(variables._matStatus[m.id], formatters, variables._matStatus[g.id]));
    if (rawData.materializers) rawData.materializers.forEach(m => m.display_vars = variables._matStatus[m.id]);

    this.setState({rawData, recompiling: false});
  }

  changeField(field, e) {
    const {rawData} = this.state;
    rawData[field] = e.target.value;
    this.setState({rawData});
  }

  saveItem(item, type) {
    const {rawData} = this.state;
    if (["generator", "materializer", "profile", "stat", "visualization", "profile_description"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_profile");
      axios.post(`/api/cms/${type}/update`, item).then(resp => {
        if (resp.status === 200) {
          this.setState({recompiling: true, isGeneratorEditorOpen: false, isTextEditorOpen: false}, this.fetchVariables.bind(this));
          if (type === "profile_description") {
            rawData.descriptions.sort((a, b) => a.ordering - b.ordering);
            this.setState({rawData});
          }
          if (this.props.reportSave) this.props.reportSave();
        }
      });
    }
  }

  deleteItem(item, type) {
    const {rawData} = this.state;
    if (["generator", "materializer", "profile", "stat", "visualization", "profile_description"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_profile");
      axios.delete(`/api/cms/${type}/delete`, {params: {id: item.id}}).then(resp => {
        if (resp.status === 200) {
          const f = obj => obj.id !== item.id;
          if (type === "generator") rawData.generators = rawData.generators.filter(f);
          if (type === "materializer") rawData.materializers = rawData.materializers.filter(f);
          if (type === "stat_profile") rawData.stats = rawData.stats.filter(f);
          if (type === "visualization_profile") rawData.visualizations = rawData.visualizations.filter(f);
          if (type === "profile_description") rawData.descriptions = rawData.descriptions.filter(f);
          this.setState({rawData, recompiling: true, isGeneratorEditorOpen: false, isTextEditorOpen: false}, this.fetchVariables.bind(this));
        }
      });
    }
  }

  addItem(type) {
    const {rawData} = this.state;
    let payload;
    if (type === "generator") {
      payload = {
        name: "New Generator",
        api: "http://api-goes-here",
        description: "New Description",
        logic: "return {}",
        profile_id: rawData.id
      };
      axios.post("/api/cms/generator/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.generators.push(resp.data);
          this.setState({rawData, recompiling: true}, this.fetchVariables.bind(this));
        }
        else {
          console.log("db error");
        }
      });
    }
    else if (type === "materializer") {
      payload = {
        name: "New Materializer",
        description: "New Description",
        logic: "return {}",
        ordering: rawData.materializers.length,
        profile_id: rawData.id
      };
      axios.post("/api/cms/materializer/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.materializers.push(resp.data);
          this.setState({rawData, recompiling: true}, this.fetchVariables.bind(this));
        }
        else {
          console.log("db error");
        }
      });
    }
    else if (type === "stat") {
      payload = {
        title: "New Stat",
        subtitle: "New Subtitle",
        value: "New Value",
        profile_id: rawData.id
      };
      axios.post("/api/cms/stat_profile/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.stats.push(resp.data);
          this.setState({rawData, recompiling: true}, this.fetchVariables.bind(this));
        }
        else {
          console.log("db error");
        }
      });
    }
    else if (type === "visualization") {
      payload = {
        logic: "return {}",
        profile_id: rawData.id
      };
      axios.post("/api/cms/visualization_profile/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.visualizations.push(resp.data);
          this.setState({rawData, recompiling: true}, this.fetchVariables.bind(this));
        }
        else {
          console.log("db error");
        }
      });
    }
    else if (type === "description") {
      payload = {
        description: "New Description",
        profile_id: rawData.id,
        ordering: rawData.descriptions ? rawData.descriptions.length : 0
      };
      axios.post("/api/cms/profile_description/new", payload).then(resp => {
        if (resp.status === 200) {
          rawData.descriptions.push(resp.data);
          this.setState({rawData, recompiling: true}, this.fetchVariables.bind(this));
        }
        else {
          console.log("db error");
        }
      });
    }
  }

  openGeneratorEditor(g, type) {
    this.setState({currentGenerator: g, currentGeneratorType: type, isGeneratorEditorOpen: true});
  }

  openTextEditor(t, type, fields) {
    this.setState({currentText: t, currentFields: fields, currentTextType: type, isTextEditorOpen: true});
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

  closeWindow(key) {
    this.setState({[key]: false}, this.fetchVariables.bind(this));
  }

  render() {

    const {preview, rawData, variables, recompiling, currentGenerator, currentGeneratorType, currentText, currentFields, currentTextType} = this.state;

    const showExperimentalButtons = false;

    if (recompiling || !rawData || !variables) return <Loading />;

    return (
      <div id="profile-editor">

        {recompiling ? <Loading /> : null}

        <Dialog
          iconName="code"
          isOpen={this.state.isGeneratorEditorOpen}
          onClose={this.closeWindow.bind(this, "isGeneratorEditorOpen")}
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
          iconName="document"
          isOpen={this.state.isTextEditorOpen}
          onClose={this.closeWindow.bind(this, "isTextEditorOpen")}
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
              <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={rawData.slug} onChange={this.changeField.bind(this, "slug")}/>
              <button className="pt-button" onClick={this.saveItem.bind(this, rawData, "profile")}>Rename</button>
            </div>
          </label>


        </div>

        <h3>
          Generators
          <Button onClick={this.addItem.bind(this, "generator")} iconName="add" />
        </h3>
        <p className="pt-text-muted">Variables constructed from JSON data calls.</p>

        <div className="generator-cards">
          { rawData.generators && rawData.generators
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(g =>
              <GeneratorCard key={g.id} name={g.name} vars={g.display_vars} type="generator"
                onClick={this.openGeneratorEditor.bind(this, g, "generator")} />
            ) }
        </div>

        <h3>
          Materializers
          <Button onClick={this.addItem.bind(this, "materializer")} iconName="add" />
        </h3>
        <p className="pt-text-muted">Variables constructed from other variables. No API calls needed.</p>

        <div className="generator-cards materializers">
          { rawData.materializers && rawData.materializers
            .map(m =>
              <GeneratorCard key={m.id} name={m.name} vars={m.display_vars} type="materializer"
                onClick={this.openGeneratorEditor.bind(this, m, "materializer")} />
            ) }
        </div>

        <div className="splash" style={{backgroundImage: `url("/api/profile/${rawData.slug}/${preview}/thumb")`}}>
          <Card className="splash-card" onClick={this.openTextEditor.bind(this, rawData, "profile", ["title", "subtitle"])} interactive={true} elevation={1}>
            <h4 className="splash-title" dangerouslySetInnerHTML={{__html: rawData.display_vars.title}}></h4>
            <h6 className="splash-subtitle" dangerouslySetInnerHTML={{__html: rawData.display_vars.subtitle}}></h6>
          </Card>
          <div className="stats">
            { rawData.stats && rawData.stats.map(s =>
              <StatCard key={s.id}
                vars={s.display_vars}
                onClick={this.openTextEditor.bind(this, s, "stat", ["title", "value", "subtitle"])} />
            ) }
            <Card className="stat-card" onClick={this.addItem.bind(this, "stat")} interactive={true} elevation={0}>
              <NonIdealState visual="add" title="Stat" />
            </Card>
          </div>
        </div>

        <h3>About</h3>

        <div className="descriptions">
          { rawData.descriptions && rawData.descriptions.map(d =>
            <div key={d.id}>
              <Card className="splash-card" onClick={this.openTextEditor.bind(this, d, "profile_description", ["description"])} interactive={true} elevation={1}>
                <p className="splash-title" dangerouslySetInnerHTML={{__html: d.display_vars.description}}></p>
              </Card>
              {showExperimentalButtons && rawData.descriptions.length > 1 && <div>
                {d.ordering > 0 && <button onClick={() => this.move("left", d, rawData.descriptions, "profile_description")}><span className="pt-icon pt-icon-arrow-left" /></button> }
                {d.ordering < rawData.descriptions.length - 1 && <button onClick={() => this.move("right", d, rawData.descriptions, "profile_description")}><span className="pt-icon pt-icon-arrow-right" /></button> }
              </div>}
            </div>)
          }
          <Card className="stat-card" onClick={this.addItem.bind(this, "description")} interactive={true} elevation={0}>
            <NonIdealState visual="add" title="Description" />
          </Card>
        </div>

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

      </div>
    );
  }
}

ProfileEditor.contextTypes = {
  formatters: PropTypes.object
};

export default ProfileEditor;
