import React, {Component} from "react";
import QuillWrapper from "./QuillWrapper";

import "./TextEditor.css";

class TextEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null, 
      fields: null
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

    if (!data || !fields) return null;

    const quills = fields.map(f => 
      <div key={f} style={{margin: "10px"}}>
        <span style={{fontWeight: "bold"}}>{f}</span>
        <QuillWrapper value={this.state.data[f]} onChange={this.handleEditor.bind(this, f)} />
      </div>
    );

    return (
      <div id="text-editor">
        <div className="pt-select">
          <select style={{margin: "5px"}}>
            <option selected>Choose a variable...</option>
            <option value="1">variables</option>
            <option value="2">go</option>
            <option value="3">here</option>
          </select>
        </div>
        <div className="pt-select">
          <select style={{margin: "5px"}}>
            <option selected>Choose a formatter...</option>
            <option value="1">formatters</option>
            <option value="2">go</option>
            <option value="3">here</option>
          </select>
        </div>
        <button className="pt-button pt-intent-success">Insert</button>
        {quills}
        
      </div>
    );
  }
}

export default TextEditor;
