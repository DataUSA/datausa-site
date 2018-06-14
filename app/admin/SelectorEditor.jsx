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

  setDefault(option) {
    const {data} = this.state;
    data.default = option;
    this.setState({data}); 
  }

  deleteOption(i) {
    const {data} = this.state;
    data.options.splice(i, 1);
    this.setState({data});  
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

  editName(e) {
    const {data} = this.state;
    data.name = e.target.value;
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
        <label>
          Name:&nbsp;&nbsp;
          <input type="text" value={data.name} onChange={this.editName.bind(this)} />
        </label>
        <ul>
          {
            data.options.map((option, i) => 
              <li key={i}>
                <select value={option} onChange={this.chooseVariable.bind(this, i)} style={{margin: "5px"}}>
                  {varOptions}
                </select>
                <button className="pt-button" onClick={this.moveUp.bind(this, i)}><span className="pt-icon pt-icon-arrow-up" /></button>
                <button className="pt-button" onClick={this.moveDown.bind(this, i)}><span className="pt-icon pt-icon-arrow-down" /></button>
                <button className="pt-button" onClick={this.deleteOption.bind(this, i)}><span className="pt-icon pt-icon-delete" /></button>
                <input type="checkbox" className="pt-input" checked={option === data.default} style={{margin: "5px"}} onChange={this.setDefault.bind(this, option)}/>
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
