import axios from "axios";
import React, {Component} from "react";
import TextCard from "./components/TextCard";
import Loading from "components/Loading";

import stubs from "../../utils/stubs.js";

import "./StoryEditor.css";

const propMap = {
  author: "authors",
  story_description: "descriptions",
  story_footnote: "footnotes"
};

class StoryEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)();
    }
  }

  hitDB() {
    axios.get(`/api/cms/story/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data});
    });
  }

  changeField(field, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
    this.setState({minData});
  }

  onSave(minData) {
    if (this.props.reportSave) this.props.reportSave("story", minData.id, minData.title);
  }

  save() {
    const {minData} = this.state;
    axios.post("/api/cms/story/update", minData).then(resp => {
      if (resp.status === 200) {
        console.log("saved");
      }
    });
  }
  
  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = Object.assign({}, stubs[type]);
    payload.story_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        this.setState({minData});
      }
    });
  }

  onMove() {
    this.forceUpdate();
  }

  render() {

    const {minData} = this.state;

    if (!minData) return <Loading />;

    return (
      <div>
        <h4>Title</h4>
        <TextCard
          id={minData.id}
          fields={["title"]}
          type="story"
          onSave={this.onSave.bind(this)}
          variables={{}}
        />
        <div>
          <label className="pt-label pt-inline">
            Image
            <div className="pt-input-group">
              <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={minData.image} onChange={this.changeField.bind(this, "image")}/>
              <button className="pt-button" onClick={this.save.bind(this)}>Save</button>
            </div>
          </label>
        </div>
      </div>
    );
  }
}

export default StoryEditor;
