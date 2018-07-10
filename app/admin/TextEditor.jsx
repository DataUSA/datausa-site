import React, {Component} from "react";
import QuillWrapper from "./QuillWrapper";
import PropTypes from "prop-types";

import "./TextEditor.css";

class TextEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null, 
      fields: null
      
      /*
      currentVariable: "choose-a-variable",
      currentFormatter: "choose-a-formatter"
      */
    };
  }

  componentDidMount() {
    const {data, fields} = this.props;
    this.setState({data, fields});   
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

  /*
  chooseVariable(e) {
    this.setState({currentVariable: e.target.value});
  }

  chooseFormatter(e) {
    this.setState({currentFormatter: e.target.value});
  }

  insertVariable() {
    const {currentVariable, currentFormatter} = this.state;
    console.log("would insert", currentVariable, currentFormatter);
  }*/

  render() {

    const {data, fields} = this.state;
    const {variables} = this.props;
    const {formatters} = this.context;

    if (!data || !fields || !variables || !formatters) return null;

    const quills = fields.map(f => 
      <div key={f} style={{margin: "10px"}}>
        <span style={{fontWeight: "bold"}}>{f}</span>
        <QuillWrapper value={this.state.data[f] || ""} onChange={this.handleEditor.bind(this, f)} />
      </div>
    );

    const varOptions = [<option key="always" value="always">Always</option>];

    for (const key in variables) {
      if (variables.hasOwnProperty(key) && !["_genStatus", "_matStatus"].includes(key)) {
        const value = variables[key];
        varOptions.push(
          <option key={key} value={key}>{`${key}: ${value}`}</option>
        );
      }
    }

    return (
      <div id="text-editor">
        <div className="pt-select">
          Allowed?
          <select value={data.allowed || "always"} onChange={this.chooseVariable.bind(this)} style={{margin: "5px", width: "300px"}}>
            {varOptions}
          </select>
        </div>
        {/*
        <div className="pt-select">
          <select onChange={this.chooseFormatter.bind(this)} style={{margin: "5px"}}>
            <option key="choose-a-formatter" value="choose-a-formatter">Choose a Formatter</option>
            {Object.keys(formatters).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button className="pt-button pt-intent-success" onClick={this.insertVariable.bind(this)}>Insert</button>
        */}

        {quills}
        
      </div>
    );
  }
}

TextEditor.contextTypes = {
  formatters: PropTypes.object
};

export default TextEditor;
