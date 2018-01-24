import axios from "axios";
import React, {Component} from "react";
import QuillWrapper from "./QuillWrapper";
import AceWrapper from "./AceWrapper";

import "./GeneratorEditor.css";

class GeneratorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    const {data} = this.props;
    this.setState({data});   
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
  

  render() {

    const {data} = this.state;
    const {type} = this.props;

    if (!data) return null;

    return (
      <div id="generator-editor">
        <div className="generator-input">
          Name<br/>
          <input className="pt-input" style={{width: "600px"}} type="text" dir="auto" value={data.name} onChange={this.changeField.bind(this, "name")}/>
        </div>
        { type === "generator" 
          ? <div className="generator-input">
            API<br/>
            <input className="pt-input" style={{width: "600px"}} type="text" dir="auto" value={data.api} onChange={this.changeField.bind(this, "api")}/>
          </div>
          : null
        }
        <div className="generator-input">
          Description<br/>
          <input className="pt-input" style={{width: "600px"}} type="text" dir="auto" value={data.description} onChange={this.changeField.bind(this, "api")}/>
        </div>
        <div id="generator-ace">
          Logic<br/>
          { type === "generator" 
            ? <span>You have access to the variable <strong>resp</strong>, which represents the response to the above API call.</span>
            : <span>You have access to all variables previously created by generators</span>
          }
          <AceWrapper
            className="editor"
            ref={ comp => this.editor = comp }
            onChange={this.handleEditor.bind(this, "logic")}
            value={data.logic}
            style={{marginTop: "10px", minHeight: "300px"}}
            {...this.props}
          /> 
          Be sure to return an <strong>object</strong> with the variables you want stored as keys.<br/>
        </div>

      </div>
    );
  }
}

export default GeneratorEditor;
