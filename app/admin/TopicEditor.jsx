import axios from "axios";
import React, {Component} from "react";

import "./TopicEditor.css";

class TopicEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      themes: null
    };
  }

  /*
  componentDidMount() {
    const {data} = this.props;
    const themes = styleyml.islands;
    this.setState({data, themes});   
  }

  componentDidUpdate() {
    if (this.props.data.id !== this.state.data.id) {
      this.setState({data: this.props.data});
    }
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

    const {data, themes} = this.state;

    return (
      <div id="topic-editor">
        I'm a topic editor
        { JSON.stringify(this.props.data) }
      </div>
    );
  }
}

export default TopicEditor;
