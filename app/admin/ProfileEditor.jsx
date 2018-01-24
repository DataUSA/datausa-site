import React, {Component} from "react";
import {Card, Dialog} from "@blueprintjs/core";
import GeneratorEditor from "./GeneratorEditor";
import TextEditor from "./TextEditor";

import "./ProfileEditor.css";

class ProfileEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      builders: null
    };
  }

  componentDidMount() {
    const {data, builders} = this.props;
    this.setState({data, builders});   
  }

  componentDidUpdate() {
    if (this.props.data.id !== this.state.data.id) {
      this.setState({data: this.props.data});
    }
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

  /*
  saveContent() {
    const {data} = this.state;
    if (this.props.reportSave) this.props.reportSave(data);
    const toast = Toaster.create({className: "saveToast", position: Position.TOP_CENTER});
    axios.post("/api/builder/islands/save", data).then(resp => {
      if (resp.status === 200) {
        toast.show({message: "Saved!", intent: Intent.SUCCESS});
      } 
      else {
        toast.show({message: "Error!", intent: Intent.DANGER});
      }
    });
  }
  */

  openGeneratorEditor(g) {
    this.setState({currentGenerator: g, isGeneratorEditorOpen: true});
  }

  openTextEditor(t) {
    this.setState({currentText: t, isTextEditorOpen: true});
  }
  

  render() {

    const {data, builders, currentGenerator, currentText} = this.state;

    if (!data || !builders) return null;

    const generators = builders.generators.map(g =>
      <Card key={g.id} onClick={this.openGeneratorEditor.bind(this, g)} className="generator-card" interactive={true} elevation={Card.ELEVATION_ONE}>
        <h5>{g.name}</h5>
        <ul>
          <li>exported</li>
          <li>vars</li>
          <li>go</li>
          <li>here</li>
        </ul>
      </Card>
    );

    const materializedGenerators = builders.materializers.map(m => 
      <Card key={m.id} onClick={this.openGeneratorEditor.bind(this, m)} className="generator-card" interactive={true} elevation={Card.ELEVATION_ONE}>
        <h5>{m.name}</h5>
        <ul>
          <li>exported</li>
          <li>vars</li>
          <li>go</li>
          <li>here</li>
        </ul>
      </Card>
    );

    const stats = data.stats.map(s => 
      <Card key={s.id} onClick={this.openTextEditor.bind(this, s)} className="stat-card" interactive={true} elevation={Card.ELEVATION_ONE}>
        <h3>{s.title}</h3>
        <p>{s.subtitle}</p>
        <p>{s.value}</p>
      </Card>
    );

    const visualizations = data.visualizations.map(v =>
      <Card key={v.id} onClick={this.openGeneratorEditor.bind(this, v)} className="visualization-card" interactive={true} elevation={Card.ELEVATION_ONE}>
        <p>{v.logic}</p>
      </Card>
    );

    return (
      <div id="profile-editor">
        
        <Dialog
          iconName="code"
          isOpen={this.state.isGeneratorEditorOpen}
          onClose={() => this.setState({isGeneratorEditorOpen: false})}
          title="Variable Editor"
        >
          <div className="pt-dialog-body">
            <GeneratorEditor data={currentGenerator} />
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <button 
                className="pt-button pt-intent-danger"
                onClick={() => this.setState({isGeneratorEditorOpen: false})}
              >
                Cancel
              </button>
              <button
                className="pt-button pt-intent-success"
                onClick={() => this.setState({isGeneratorEditorOpen: false})}
              >
                Save
              </button>
            </div>
          </div>
        </Dialog>

        <Dialog
          iconName="document"
          isOpen={this.state.isTextEditorOpen}
          onClose={() => this.setState({isTextEditorOpen: false})}
          title="Text Editor"
        >
          <div className="pt-dialog-body">
            <TextEditor data={currentText} />
          </div>
          <div className="pt-dialog-footer">
            <div className="pt-dialog-footer-actions">
              <button 
                className="pt-button pt-intent-danger"
                onClick={() => this.setState({isTextEditorOpen: false})}
              >
                Cancel
              </button>
              <button
                className="pt-button pt-intent-success"
                onClick={() => this.setState({isTextEditorOpen: false})}
              >
                Save
              </button>
            </div>
          </div>
        </Dialog>


        <div id="preview-as">
          Hard Code Previewing as <strong>04000US25</strong>
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
            <Card className="generator-card" interactive={true} elevation={Card.ELEVATION_ONE}>
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
            <Card className="generator-card" interactive={true} elevation={Card.ELEVATION_ONE}>
              <h5>Add New</h5>
              <p>+</p>
            </Card>
          </div>
        </div>

        <div className="splash">
          <div className="cms-header">
            SPLASH
          </div>
          <div className="splash-cards">
            <Card className="splash-card" onClick={() => this.setState({isTextEditorOpen: true, currentText: data.title})} interactive={true} elevation={Card.ELEVATION_ONE}>
              <h6>title</h6>
              <h2>{data.title}</h2>
            </Card>
            <Card className="splash-card" onClick={() => this.setState({isTextEditorOpen: true, currentText: data.subtitle})} interactive={true} elevation={Card.ELEVATION_ONE}>
              <h6>subtitle</h6>
              <h2>{data.subtitle}</h2>
            </Card>
            <Card className="splash-card" onClick={() => this.setState({isTextEditorOpen: true, currentText: data.description})} interactive={true} elevation={Card.ELEVATION_ONE}>
              <h6>description</h6>
              <h2>{data.description}</h2>
            </Card>
          </div>
        </div>

        <div className="stats">
          <div className="cms-header">
            STATS
          </div>
          <div>
            {stats}
            <Card className="stat-card" interactive={true} elevation={Card.ELEVATION_ONE}>
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
            <Card className="visualization-card" interactive={true} elevation={Card.ELEVATION_ONE}>
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
