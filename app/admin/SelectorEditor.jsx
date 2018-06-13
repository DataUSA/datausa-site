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

  addOption() {
    const {data} = this.state;
    // TODO: make this smarter with a default variable (how to do this, when they are keys not ints?)
    data.options.push("");
    this.setState({data});
  }

  chooseVariable(index, e) {
    const {data} = this.state;
    data.options[index] = e.target.value;
    this.setState({data});
  }

  setDefault(option, e) {
    const {data} = this.state;
    data.default = option;
    this.setState({data}); 
    // console.log(option, e.target.checked);
  }

  moveUp(i) {
    const {data} = this.state;
    if (i === 0) {
      return;
    }
    else {
      const temp = data.options[i - 1];
      data.options[i - 1] = data.options[i];
      data.options[i] = temp;
    }
    this.setState({data});
  }

  moveDown(i) {
    const {data} = this.state;
    if (i === data.options.length - 1) {
      return;
    }
    else {
      const temp = data.options[i + 1];
      data.options[i + 1] = data.options[i];
      data.options[i] = temp;
    }
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
        <ul>
          {
            data.options.map((option, i) => 
              <li key={i}>
                <select value={option} onChange={this.chooseVariable.bind(this, i)} style={{margin: "5px"}}>
                  {varOptions}
                </select>
                <button className="pt-button" onClick={this.moveUp.bind(this, i)}><span className="pt-icon pt-icon-arrow-up" /></button>
                <button className="pt-button" onClick={this.moveDown.bind(this, i)}><span className="pt-icon pt-icon-arrow-down" /></button>
                <input type="checkbox" checked={option === data.default} style={{margin: "5px"}} onChange={this.setDefault.bind(this, option)}/>
              </li>
            )
          }
        </ul>
        <button className="pt-button" onClick={this.addOption.bind(this)}>Add Option <span className="pt-icon pt-icon-plus"/></button>
      </div>
    );
  }
}

export default SelectorEditor;
