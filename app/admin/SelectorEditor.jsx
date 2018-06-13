import React, {Component} from "react";

import "./SelectorEditor.css";

class SelectorEditor extends Component {

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

  render() {

    const {data} = this.state;
    const {variables} = this.props;

    if (!data || !variables) return null;
    
    const varOptions = [];
    for (const key in variables) {
      if (variables.hasOwnProperty(key) && !["_genStatus", "_matStatus"].includes(key)) {
        const value = variables[key];
        varOptions.push(
          <option key={key} value={key}>{`${key}: ${value}`}</option>
        );
      }
    }

    return (
      <div id="selector-editor">
        {JSON.stringify(data)}
      </div>
    );
  }
}

export default SelectorEditor;
