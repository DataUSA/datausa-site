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
      generator: <p className="pt-text-muted">You have access to the variable <strong>resp</strong>, which represents the response to the above API call.</p>,
      materializer: <p className="pt-text-muted">You have access to all variables previously created by generators</p>,
      profile_visualization: <p className="pt-text-muted">You have access to all variables previously created by generators and materializers.</p>,
      topic_visualization: <p className="pt-text-muted">You have access to all variables previously created by generators and materializers.</p>
    };

    const postMessage = {
      generator: <p className="pt-text-muted">Be sure to return an <strong>object</strong> with the variables you want stored as keys.</p>,
      materalizer: <p className="pt-text-muted">Be sure to return an <strong>object</strong> with the variables you want stored as keys.</p>,
      profile_visualization: <p className="pt-text-muted">Be sure to return a valid config object for a visualization</p>,
      topic_visualization: <p className="pt-text-muted">Be sure to return a valid config object for a visualization</p>
    };

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => {
          const value = variables[key];
          const type = typeof value;
          const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
          return <option key={key} value={key} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
        }));

    if (!data) return null;

    return (
      <div id="generator-editor">
        { type === "generator" || type === "materializer"
          ? <label className="pt-label pt-inline">
            <span className="label-text">Name</span>
            <input className="pt-input" type="text" dir="auto" value={data.name} onChange={this.changeField.bind(this, "name")}/>
          </label>
          : null
        }
        { type === "generator"
          ? <label className="pt-label pt-inline">
            <span className="label-text">API</span>
            <input className="pt-input" type="text" dir="auto" value={data.api} onChange={this.changeField.bind(this, "api")}/>
          </label>
          : null
        }
        { type === "generator" || type === "materializer"
          ? <label className="pt-label pt-inline">
            <span className="label-text">Description</span>
            <input className="pt-input" type="text" dir="auto" value={data.description} onChange={this.changeField.bind(this, "description")}/>
          </label>
          : null
        }
        <div id="generator-ace">
          { type === "profile_visualization" || type === "topic_visualization"
            ? <label className="pt-label pt-inline">
              <span className="label-text">Allowed</span>
              <div className="pt-select">
                <select value={ data.allowed || "always" } onChange={this.chooseVariable.bind(this)}>
                  {varOptions}
                </select>
              </div>
            </label> : null
          }
          <label className="pt-label">Callback {preMessage[type]}</label>
          <AceWrapper
            className="editor"
            variables={variables}
            ref={ comp => this.editor = comp }
            onChange={this.handleEditor.bind(this, "logic")}
            value={data.logic}
            {...this.props}
          />
          {postMessage[type]}
        </div>
      </div>
    );
  }
}

export default GeneratorEditor;
