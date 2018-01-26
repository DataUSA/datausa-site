import axios from "axios";
import React, {Component} from "react";
import {Card, Dialog} from "@blueprintjs/core";
import GeneratorEditor from "./GeneratorEditor";
import TextEditor from "./TextEditor";
import Loading from "../components/Loading";

import "./ProfileEditor.css";

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      builders: null,
      variables: null,
      recompiling: false,
      preview: "04000US25"
    };
  }

  componentDidMount() {
    const {data, builders} = this.props;
    this.setState({data, builders, recompiling: true}, this.compileVariables.bind(this));   
  }

  componentDidUpdate() {
    if (this.props.data.id !== this.state.data.id) {
      this.setState({data: this.props.data}, this.compileVariables.bind(this));
    }
  }

  compileVariables() {
    const {slug} = this.state.data;
    const id = this.state.preview;
    axios.get(`/api/profile/${slug}/${id}`).then(resp => {
      const {variables} = resp.data;
      this.setState({variables}, this.formatDisplays.bind(this));
    });
  }

  formatDisplays() {
    const {builders, variables} = this.state;
    const data = this.displayify(this.state.data);
    if (data.stats) data.stats = data.stats.map(s => this.displayify(s));
    // TODO, get Dave's help on this
    for (const g of builders.generators) {
      g.display_vars = [];
      const genStatus = variables._genStatus[g.id];
      for (const key in genStatus) {
        if (genStatus.hasOwnProperty(key)) {
          g.display_vars.push(`${key}: ${variables[key]}`);  
        }
      }
    }

    for (const m of builders.materializers) {
      m.display_vars = [];
      const matStatus = variables._matStatus[m.id];
      for (const key in matStatus) {
        if (matStatus.hasOwnProperty(key)) {
          m.display_vars.push(`${key}: ${variables[key]}`);  
        }
      }
    }

    this.setState({data, builders, recompiling: false});
  }

  displayify(sourceObj) {
    const {variables} = this.state;
    for (const skey in sourceObj) {
      if (sourceObj.hasOwnProperty(skey) && typeof sourceObj[skey] === "string") {
        sourceObj[`display_${skey}`] = sourceObj[skey];
        const re = new RegExp(/([A-z0-9]*)\{\{([A-z0-9]+)\}\}/g);
        let m;
        do {
          m = re.exec(sourceObj[`display_${skey}`]);
          if (m) {
            // const formatter = m[1] ? formatterFunctions[m[1]] : d => d;
            const formatter = d => d;
            const reswap = new RegExp(`${m[0]}`, "g");
            sourceObj[`display_${skey}`] = sourceObj[`display_${skey}`].replace(reswap, formatter(variables[m[2]]));
            // sourceObj[skey] = sourceObj[skey].replace(m[0], formatter(variables[m[2]]));
            //console.log("after", sourceObj[`display_${skey}`]);
          }
        } while (m);
      }
    }
    return sourceObj;
  }

  changeField(field, e) {
    const {data} = this.state;
    data[field] = e.target.value;
    this.setState({data});
  }

  handleEditor(field, t) {
    const {data} = this.state;
    data[field] = t;
    this.setState({data});    
  }

  saveItem(item, type) {
    if (["generator", "materializer", "profile", "stat", "visualization"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_profile");
      axios.post(`/api/cms/${type}/update`, item).then(resp => {
        if (resp.status === 200) {
          this.setState({recompiling: true, isGeneratorEditorOpen: false, isTextEditorOpen: false}, this.compileVariables());
        } 
      });
    }
  }

  deleteItem(item, type) {
    const {data, builders} = this.state;
    if (["generator", "materializer", "profile", "stat", "visualization"].includes(type)) {
      if (type === "stat" || type === "visualization") type = type.concat("_profile");
      axios.delete(`/api/cms/${type}/delete`, {params: {id: item.id}}).then(resp => {
        if (resp.status === 200) {
          if (type === "generator") builders.generators = builders.generators.filter(g => g.id !== item.id);
          if (type === "materializer") builders.materializers = builders.materializers.filter(m => m.id !== item.id);
          if (type === "stat_profile") data.stats = data.stats.filter(s => s.id !== item.id);
          if (type === "visualization_profile") data.visualizations = data.visualizations.filter(v => v.id !== item.id);
          this.setState({data, builders, recompiling: true, isGeneratorEditorOpen: false, isTextEditorOpen: false}, this.compileVariables());
        } 
      });
    }
  }

  addItem(type) {
    const {data, builders} = this.state;
    let payload;
    if (type === "generator") {
      payload = {
        name: "New Generator",
        api: "http://api-goes-here",
        description: "New Description",
        logic: "return {}",
        profile_id: data.id
      };
      axios.post("/api/cms/generator/new", payload).then(resp => {
        if (resp.status === 200) {
          builders.generators.push(resp.data);
          this.setState({builders, recompiling: true}, this.compileVariables.bind(this));
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
        ordering: builders.materializers.length,
        profile_id: data.id
      };
      axios.post("/api/cms/materializer/new", payload).then(resp => {
        if (resp.status === 200) {
          builders.materializers.push(resp.data);
          this.setState({builders, recompiling: true}, this.compileVariables.bind(this));
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
        profile_id: data.id
      };
      axios.post("/api/cms/stat_profile/new", payload).then(resp => {
        if (resp.status === 200) {
          data.stats.push(resp.data);
          this.setState({data, recompiling: true}, this.compileVariables.bind(this));
        } 
        else {
          console.log("db error");
        }
      });
    }
    else if (type === "visualization") {
      payload = {
        logic: "return {}",
        profile_id: data.id
      };
      axios.post("/api/cms/visualization_profile/new", payload).then(resp => {
        if (resp.status === 200) {
          data.visualizations.push(resp.data);
          this.setState({data, recompiling: true}, this.compileVariables.bind(this));
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
    this.setState({[key]: false}, this.compileVariables.bind(this));
  }

  render() {

    const {data, builders, recompiling, currentGenerator, currentGeneratorType, currentText, currentFields, currentTextType} = this.state;

    if (!data || !builders) return <Loading />;

    const generators = builders.generators.map(g =>
      <Card key={g.id} onClick={this.openGeneratorEditor.bind(this, g, "generator")} className="generator-card" interactive={true} elevation={Card.ELEVATION_ONE}>
        <h5>{g.name}</h5>
        <ul>
          {g.display_vars ? g.display_vars.map(v => <li key={`g${v}`}>{v}</li>) : null} 
        </ul>
      </Card>
    );

    const materializedGenerators = builders.materializers.map(m => 
      <Card key={m.id} onClick={this.openGeneratorEditor.bind(this, m, "materializer")} className="generator-card" interactive={true} elevation={Card.ELEVATION_ONE}>
        <h5>{m.name}</h5>
        <ul>
          {m.display_vars ? m.display_vars.map(v => <li key={`m${v}`}>{v}</li>) : null} 
        </ul>
      </Card>
    );

    const stats = data.stats.map(s => 
      <Card key={s.id} onClick={this.openTextEditor.bind(this, s, "stat", ["title", "subtitle", "value"])} className="stat-card" interactive={true} elevation={Card.ELEVATION_ONE}>
        <h6>title</h6>
        <div dangerouslySetInnerHTML={{__html: s.display_title}} />
        <h6>subtitle</h6>
        <div dangerouslySetInnerHTML={{__html: s.display_subtitle}} />
        <h6>value</h6>
        <div dangerouslySetInnerHTML={{__html: s.display_value}} />
      </Card>
    );

    const visualizations = data.visualizations.map(v =>
      <Card key={v.id} onClick={this.openGeneratorEditor.bind(this, v, "visualization")} className="visualization-card" interactive={true} elevation={Card.ELEVATION_ONE}>
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
            <TextEditor data={currentText} fields={currentFields} />
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

        <div id="preview-as">
          Hard Code Previewing as <strong>{this.state.preview}</strong>
        </div>

        <div id="slug">
          <label className="pt-label">
            slug
            <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={data.slug} onChange={this.changeField.bind(this, "slug")}/>
          </label>
        </div>
        
        <div className="generators">
          <div className="cms-header">
            DATABASE VARIABLE GENERATORS
          </div>
          <div className="generator-cards">
            {generators}
            <Card className="generator-card" onClick={this.addItem.bind(this, "generator")} interactive={true} elevation={Card.ELEVATION_ONE}>
              <h5>Add New</h5>
              <p>+</p>
            </Card>
          </div>
        </div>

        <div className="materialized-generators">
          <div className="cms-header">
            MATERIALIZED VARIABLE GENERATORS
          </div>
          <div className="generator-cards">
            {materializedGenerators}
            <Card className="generator-card" onClick={this.addItem.bind(this, "materializer")} interactive={true} elevation={Card.ELEVATION_ONE}>
              <h5>Add New</h5>
              <p>+</p>
            </Card>
          </div>
        </div>

        <div className="splash">
          <div className="cms-header">
            SPLASH
          </div>
          <Card className="splash-card" onClick={this.openTextEditor.bind(this, data, "profile", ["title", "subtitle", "description"])} interactive={true} elevation={Card.ELEVATION_ONE}>
            <h6>title</h6>
            <div dangerouslySetInnerHTML={{__html: data.display_title}} /><br/>
            <h6>subtitle</h6>
            <div dangerouslySetInnerHTML={{__html: data.display_subtitle}} /><br/>
            <h6>description</h6>
            <div dangerouslySetInnerHTML={{__html: data.display_description}} /><br/>
          </Card>
        </div>

        <div className="stats">
          <div className="cms-header">
            STATS
          </div>
          <div>
            {stats}
            <Card className="stat-card" onClick={this.addItem.bind(this, "stat")} interactive={true} elevation={Card.ELEVATION_ONE}>
              <h5>Add New</h5>
              <p>+</p>
            </Card>
          </div>
        </div>

        <div className="visualizations">
          <div className="cms-header">
            VISUALIZATIONS
          </div>
          <div>
            {visualizations}
            <Card className="visualization-card" onClick={this.addItem.bind(this, "visualization")} interactive={true} elevation={Card.ELEVATION_ONE}>
              <h5>Add New</h5>
              <p>+</p>
            </Card>
          </div>
        </div>

      </div>
    );
  }
}

export default ProfileEditor;
