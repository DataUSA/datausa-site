import axios from "axios";
import React, {Component} from "react";
import {Button} from "@blueprintjs/core";
import TextCard from "../components/cards/TextCard";
import MoveButtons from "../components/MoveButtons";
import Loading from "../../components/Loading";

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
    const payload = {};
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
        <h4>Story</h4>
        <TextCard
          id={minData.id}
          fields={["title"]}
          plainfields={["image", "slug"]}
          type="story"
          onSave={this.onSave.bind(this)}
          variables={{}}
        />
        <h4>Descriptions</h4>
        <Button onClick={this.addItem.bind(this, "story_description")} iconName="add" />
        <div className="descriptions">
          { minData.descriptions && minData.descriptions.map(d =>
            <div key={d.id}>
              <TextCard key={d.id}
                id={d.id}
                onDelete={this.onDelete.bind(this)}
                fields={["description"]}
                type="story_description"
                variables={{}}
              />
              <MoveButtons
                item={d}
                array={minData.descriptions}
                type="story_description"
                onMove={this.onMove.bind(this)}
              />
            </div>)
          }
        </div>
        <h4>Footnotes</h4>
        <Button onClick={this.addItem.bind(this, "story_footnote")} iconName="add" />
        <div className="footnotes">
          { minData.footnotes && minData.footnotes.map(d =>
            <div key={d.id}>
              <TextCard key={d.id}
                id={d.id}
                ordering={d.ordering}
                onDelete={this.onDelete.bind(this)}
                fields={["description"]}
                type="story_footnote"
                variables={{}}
              />
              <MoveButtons
                item={d}
                array={minData.footnotes}
                type="story_footnote"
                onMove={this.onMove.bind(this)}
              />
            </div>)
          }
        </div>
        <h4>Authors</h4>
        <Button onClick={this.addItem.bind(this, "author")} iconName="add" />
        <div className="authors">
          { minData.authors && minData.authors.map(d =>
            <div key={d.id}>
              <TextCard key={d.id}
                id={d.id}
                onDelete={this.onDelete.bind(this)}
                fields={["bio"]}
                plainfields={["name", "title", "image", "twitter"]}
                type="author"
                variables={{}}
              />
              <MoveButtons
                item={d}
                array={minData.authors}
                type="author"
                onMove={this.onMove.bind(this)}
              />
            </div>)
          }
        </div>
      </div>
    );
  }
}

export default StoryEditor;
