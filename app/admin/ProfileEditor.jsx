import axios from "axios";
import React, {Component} from "react";
import {Callout, Card, Dialog, Icon, NonIdealState} from "@blueprintjs/core";
import GeneratorEditor from "./GeneratorEditor";
import TextEditor from "./TextEditor";
import Loading from "components/Loading";

import GeneratorCard from "./components/GeneratorCard";
import StatCard from "./components/StatCard";

import "./ProfileEditor.css";

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rawData: null,
      postData: null,
      formatters: null,
      recompiling: false,
      preview: "04000US25"
    };
  }

  componentDidMount() {
    const {rawData, formatters} = this.props;
    this.setState({rawData, formatters, recompiling: true}, this.fetchPostData.bind(this));
  }

  componentDidUpdate() {
    if (this.props.rawData.id !== this.state.rawData.id) {
      this.setState({rawData: this.props.rawData}, this.fetchPostData.bind(this));
    }
  }

  fetchPostData() {
    const {slug} = this.state.rawData;
    const id = this.state.preview;
    axios.get(`/api/profile/${slug}/${id}`).then(resp => {
      const postData = resp.data;
      this.setState({postData}, this.formatDisplays.bind(this));
    });
  }

  formatDisplays() {
    const {postData, rawData} = this.state;
    const {variables} = postData;

    for (const rkey in rawData) {
      if (rawData.hasOwnProperty(rkey) && typeof rawData[rkey] === "string") {
        rawData[`display_${rkey}`] = postData[rkey];
      }
    }

    if (rawData.stats) {
      rawData.stats = rawData.stats.map(stat => {
        for (const skey in stat) {
          if (stat.hasOwnProperty(skey) && typeof stat[skey] === "string") {
            const postStat = postData.stats.find(s => s.id === stat.id);
            if (postStat) stat[`display_${skey}`] = postStat[skey];
          }
        }
        return stat;
      });
    }

    for (const g of rawData.generators) {
      g.display_vars = {};
      const genStatus = variables._genStatus[g.id];
      for (const key in genStatus) {
        if (genStatus.hasOwnProperty(key)) {
          g.display_vars[key] = genStatus[key];
        }
      }
    }

    for (const m of rawData.materializers) {
      m.display_vars = {};
      const matStatus = variables._matStatus[m.id];
      for (const key in matStatus) {
        if (matStatus.hasOwnProperty(key)) {
          m.display_vars[key] = variables[key];
        }
      }
    }

    this.setState({rawData, recompiling: false});
  }

  changeField(field, e) {
    const {rawData} = this.state;
    rawData[field] = e.target.value;
    this.setState({rawData});
  }

  saveItem(item, type) {
    if (["generator", "materializer", "profile", "stat", "visualization"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_profile");
      axios.post(`/api/cms/${type}/update`, item).then(resp => {
        if (resp.status === 200) {
          this.setState({recompiling: true, isGeneratorEditorOpen: false, isTextEditorOpen: false}, this.fetchPostData());
          if (this.props.reportSave) this.props.reportSave();
        }
      });
    }
  }

  deleteItem(item, type) {
    const {rawData} = this.state;
    if (["generator", "materializer", "profile", "stat", "visualization"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_profile");
      axios.delete(`/api/cms/${type}/delete`, {params: {id: item.id}}).then(resp => {
        if (resp.status === 200) {
          if (type === "generator") rawData.generators = rawData.generators.filter(g => g.id !== item.id);
          if (type === "materializer") rawData.materializers = rawData.materializers.filter(m => m.id !== item.id);
          if (type === "stat_profile") rawData.stats = rawData.stats.filter(s => s.id !== item.id);
          if (type === "visualization_profile") rawData.visualizations = rawData.visualizations.filter(v => v.id !== item.id);
          this.setState({rawData, recompiling: true, isGeneratorEditorOpen: false, isTextEditorOpen: false}, this.fetchPostData());
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
          this.setState({rawData, recompiling: true}, this.fetchPostData.bind(this));
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
          this.setState({rawData, recompiling: true}, this.fetchPostData.bind(this));
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
          this.setState({rawData, recompiling: true}, this.fetchPostData.bind(this));
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
          this.setState({rawData, recompiling: true}, this.fetchPostData.bind(this));
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

  closeWindow(key) {
    this.setState({[key]: false}, this.fetchPostData.bind(this));
  }

  render() {

    const {preview, rawData, postData, formatters, recompiling, currentGenerator, currentGeneratorType, currentText, currentFields, currentTextType} = this.state;

    if (!rawData || !postData) return <Loading />;

    const visualizations = rawData.visualizations.map(v =>
      <Card key={v.id} onClick={this.openGeneratorEditor.bind(this, v, "visualization")} className="visualization-card" interactive={true} elevation={0}>
        <p>{v.logic}</p>
      </Card>
    );

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
            <GeneratorEditor data={currentGenerator} type={currentGeneratorType} />
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
          onClose={this.closeWindow.bind(this, "isTextEditorOpen")}
          title="Text Editor"
        >
          <div className="pt-dialog-body">
            <TextEditor data={currentText} formatters={formatters} variables={postData.variables} fields={currentFields} />
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

        <Callout id="preview-toggle">
          <span className="pt-label"><Icon iconName="media" />Preview ID</span>
          <div className="pt-select">
            <select value={preview} onChange={e => this.setState({recompiling: true, preview: e.target.value}, this.fetchPostData.bind(this))}>
              { ["04000US25", "16000US0644000"].map(s => <option value={s} key={s}>{s}</option>) }
            </select>
          </div>
        </Callout>

        <div id="slug">
          <label className="pt-label">
            slug
            <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={rawData.slug} onChange={this.changeField.bind(this, "slug")}/>
          </label>
          <button onClick={this.saveItem.bind(this, rawData, "profile")}>rename</button>

        </div>

        <h3>Variable Generators</h3>

        <div className="generator-cards">
          { rawData.generators.map(g =>
            <GeneratorCard key={g.id} name={g.name} vars={g.display_vars} type="generator"
              onClick={this.openGeneratorEditor.bind(this, g, "generator")} />
          ) }
          <Card className="generator-card" onClick={this.addItem.bind(this, "generator")} interactive={true} elevation={0}>
            <NonIdealState visual="add" title="New Generator" />
          </Card>
        </div>

        <div className="generator-cards">
          { rawData.materializers.map(m =>
            <GeneratorCard key={m.id} name={m.name} vars={m.display_vars} type="materializer"
              onClick={this.openGeneratorEditor.bind(this, m, "materializer")} />
          ) }
          <Card className="generator-card" onClick={this.addItem.bind(this, "materializer")} interactive={true} elevation={0}>
            <NonIdealState visual="add" title="New Materialized Generator" />
          </Card>
        </div>

        <div className="splash" style={{backgroundImage: `url("/api/profile/${rawData.slug}/${preview}/thumb")`}}>
          <Card className="splash-card" onClick={this.openTextEditor.bind(this, rawData, "profile", ["title", "subtitle"])} interactive={true} elevation={1}>
            <h4 className="splash-title" dangerouslySetInnerHTML={{__html: rawData.display_title}}></h4>
            <h6 className="splash-subtitle" dangerouslySetInnerHTML={{__html: rawData.display_subtitle}}></h6>
          </Card>
          <div className="stats">
            { rawData.stats.map(s =>
              <StatCard key={s.id}
                title={ s.display_title } value={ s.display_value } subtitle={ s.display_subtitle }
                onClick={this.openTextEditor.bind(this, s, "stat", ["title", "value", "subtitle"])} />
            ) }
            <Card className="stat-card" onClick={this.addItem.bind(this, "stat")} interactive={true} elevation={0}>
              <NonIdealState visual="add" title="Stat" />
            </Card>
          </div>
        </div>

        <h3>About</h3>

        <Card className="splash-card" onClick={this.openTextEditor.bind(this, rawData, "profile", ["description"])} interactive={true} elevation={1}>
          <div className="description" dangerouslySetInnerHTML={{__html: rawData.display_description}} />
        </Card>

        <div className="visualizations">
          <div>
            {visualizations}
            <Card className="visualization-card" onClick={this.addItem.bind(this, "visualization")} interactive={true} elevation={0}>
              <NonIdealState visual="add" title="Visualization" />
            </Card>
          </div>
        </div>

      </div>
    );
  }
}

export default ProfileEditor;
