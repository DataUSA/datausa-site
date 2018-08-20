import React, {Component} from "react";

class SelectorEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null
    };
  }

  componentDidMount() {
    const {data} = this.props;
    const showCustom = data.default.includes("{{");
    this.setState({data, showCustom});
  }

  addOption() {
    const {data} = this.state;
    if (!data.options) data.options = [];
    // TODO: make this smarter with a default variable (how to do this, when they are keys not ints?)
    data.options.push({option: "", allowed: "always"});
    this.setState({data});
  }

  chooseOption(index, e) {
    const {data} = this.state;
    data.options[index].option = e.target.value;
    this.setState({data});
  }

  chooseAllowed(index, e) {
    const {data} = this.state;
    data.options[index].allowed = e.target.value;
    this.setState({data});
  }

  chooseCustom(e) {
    const {data} = this.state;
    data.default = e.target.value;
    this.setState({data});
  }

  setDefault(option) {
    const {data} = this.state;
    data.default = option;
    this.setState({data, showCustom: false});
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

  toggleCustom() {
    this.setState({showCustom: !this.state.showCustom});
  }

  render() {

    const {data} = this.state;
    const {variables} = this.props;

    if (!data || !variables) return null;

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

    const customOptions = Object.keys(variables)
      .filter(key => !key.startsWith("_"))
      .sort((a, b) => a.localeCompare(b))
      .map(key => {
        const value = variables[key];
        const type = typeof value;
        const label = !["string", "number", "boolean"].includes(type) ? ` <i>(${type})</i>` : `: ${`${value}`.slice(0, 20)}${`${value}`.length > 20 ? "..." : ""}`;
        return <option key={`{{${key}}}`} value={`{{${key}}}`} dangerouslySetInnerHTML={{__html: `${key}${label}`}}></option>;
      });

    return (
      <div id="selector-editor">
        <label>
          Name:&nbsp;&nbsp;
          <input type="text" value={data.name} onChange={this.editName.bind(this)} />
        </label>
        <ul>
          {
            data.options && data.options.map((option, i) =>
              <li key={i}>
                <select value={option.option} onChange={this.chooseOption.bind(this, i)} style={{margin: "5px", width: "300px"}}>
                  {varOptions}
                </select>
                <select value={option.allowed} onChange={this.chooseAllowed.bind(this, i)} style={{margin: "5px", width: "300px"}}>
                  { varOptions }
                </select>
                <button className="pt-button" onClick={this.moveUp.bind(this, i)}><span className="pt-icon pt-icon-arrow-up" /></button>
                <button className="pt-button" onClick={this.moveDown.bind(this, i)}><span className="pt-icon pt-icon-arrow-down" /></button>
                <button className="pt-button" onClick={this.deleteOption.bind(this, i)}><span className="pt-icon pt-icon-delete" /></button>
                <input type="checkbox" checked={option.option === data.default} style={{margin: "5px"}} onChange={this.setDefault.bind(this, option.option)}/>
              </li>
            )
          }
        </ul>
        <button className="pt-button" onClick={this.addOption.bind(this)}>Add Option <span className="pt-icon pt-icon-plus"/></button><br/>
        <button className="pt-button" onClick={this.toggleCustom.bind(this)}>Custom Default <span className="pt-icon pt-icon-cog"/></button>
        {
          this.state.showCustom && <div>
            <select value={data.default} onChange={this.chooseCustom.bind(this)} style={{margin: "5px", width: "300px"}}>
              {customOptions}
            </select>
          </div>
        }
      </div>
    );
  }
}

export default SelectorEditor;
