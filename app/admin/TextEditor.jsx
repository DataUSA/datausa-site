import React, {Component} from "react";
import QuillWrapper from "./QuillWrapper";

import "./TextEditor.css";

class TextEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null, 
      field: null
    };
  }

  componentDidMount() {
    const {data, field} = this.props;
    this.setState({data, field});   
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

    const {data, field} = this.state;

    if (!data) return null;

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
        <QuillWrapper value={data[field]} onChange={this.handleEditor.bind(this, field)} />
      </div>
    );
  }
}

export default TextEditor;
