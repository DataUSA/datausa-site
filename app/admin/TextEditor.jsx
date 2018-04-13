import React, {Component} from "react";
import QuillWrapper from "./QuillWrapper";

import "./TextEditor.css";

class TextEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null, 
      fields: null,
      currentVariable: null,
      currentFormatter: null
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

    const {data, fields} = this.state;
    const {variables, formatters} = this.props;

    if (!data || !fields || !variables || !formatters) return null;

    const quills = fields.map(f => 
      <div key={f} style={{margin: "10px"}}>
        <span style={{fontWeight: "bold"}}>{f}</span>
        <QuillWrapper value={this.state.data[f]} onChange={this.handleEditor.bind(this, f)} />
      </div>
    );

    const varOptions = [];

    for (const key in variables) {
      if (variables.hasOwnProperty(key) && !["_genStatus", "_matStatus"].includes(key)) {
        const value = variables[key];
        varOptions.push(
          <option key={key} value={key}>{`${key}: ${value}`}</option>
        );
      }
    }

    const formatterOptions = formatters.map(f => 
      <option key={f.name} value={f.name}>{f.name}</option>
    );

    return (
      <div id="text-editor">
        <div className="pt-select">
          <select style={{margin: "5px"}}>
            {varOptions}
          </select>
        </div>
        <div className="pt-select">
          <select style={{margin: "5px"}}>
            {formatterOptions}
          </select>
        </div>
        <button className="pt-button pt-intent-success">Insert</button>
        {quills}
        
      </div>
    );
  }
}

export default TextEditor;
