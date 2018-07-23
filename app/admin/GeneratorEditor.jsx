import React, {Component} from "react";
import AceWrapper from "./AceWrapper";

import "./GeneratorEditor.css";

class GeneratorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      variables: []
    };
  }

  componentDidMount() {
    const {data, variables} = this.props;
    this.setState({data, variables});
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

  chooseVariable(e) {
    const {data} = this.state;
    data.allowed = e.target.value;
    this.setState({data});
  }

  render() {

    const {data, variables} = this.state;
    const {type} = this.props;

    const preMessage = {
      generator: <span>You have access to the variable <strong>resp</strong>, which represents the response to the above API call.</span>,
      materializer: <span>You have access to all variables previously created by generators</span>,
      profile_visualization: <span>You have access to all variables previously created by generators and materializers.</span>,
      topic_visualization: <span>You have access to all variables previously created by generators and materializers.</span>
    };

    const postMessage = {
      generator: <span>Be sure to return an <strong>object</strong> with the variables you want stored as keys.</span>,
      materalizer: <span>Be sure to return an <strong>object</strong> with the variables you want stored as keys.</span>,
      profile_visualization: <span>Be sure to return a valid config object for a visualization</span>,
      topic_visualization: <span>Be sure to return a valid config object for a visualization</span>
    };

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => <option key={key} value={key}>{`${key}: ${variables[key]}`}</option>));

    if (!data) return null;

    return (
      <div id="generator-editor">
        { type === "generator" || type === "materializer"
          ? <div className="generator-input">
            Name<br/>
            <input className="pt-input" style={{width: "600px"}} type="text" dir="auto" value={data.name} onChange={this.changeField.bind(this, "name")}/>
          </div>
          : null
        }
        { type === "generator"
          ? <div className="generator-input">
            API<br/>
            <input className="pt-input" style={{width: "600px"}} type="text" dir="auto" value={data.api} onChange={this.changeField.bind(this, "api")}/>
          </div>
          : null
        }
        { type === "generator" || type === "materializer"
          ? <div className="generator-input">
            Description<br/>
            <input className="pt-input" style={{width: "600px"}} type="text" dir="auto" value={data.description} onChange={this.changeField.bind(this, "description")}/>
          </div>
          : null
        }
        <div id="generator-ace">
          { type === "profile_visualization" || type === "topic_visualization"
            ? <div className="pt-select">
              Allowed?
              <select value={data.allowed || "always"} onChange={this.chooseVariable.bind(this)} style={{margin: "5px", width: "200px"}}>
                {varOptions}
              </select>
            </div> : null
          }
          <br/>
          <strong>Callback</strong><br/>
          {preMessage[type]}
          <AceWrapper
            className="editor"
            variables={variables}
            ref={ comp => this.editor = comp }
            onChange={this.handleEditor.bind(this, "logic")}
            value={data.logic}
            style={{marginTop: "10px", minHeight: "300px"}}
            {...this.props}
          />
          {postMessage[type]}
        </div>
      </div>
    );
  }
}

export default GeneratorEditor;
