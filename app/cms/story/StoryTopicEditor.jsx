import axios from "axios";
import React, {Component} from "react";
import {Button} from "@blueprintjs/core";
import Loading from "../../components/Loading";
import TextCard from "../components/cards/TextCard";
import VisualizationCard from "../components/cards/VisualizationCard";
import MoveButtons from "../components/MoveButtons";

const propMap = {
  storytopic_stat: "stats",
  storytopic_description: "descriptions",
  storytopic_subtitle: "subtitles",
  storytopic_visualization: "visualizations"
};

class StoryTopicEditor extends Component {

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
    axios.get(`/api/cms/storytopic/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data});
    });
  }

  changeField(field, save, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
    save ? this.setState({minData}, this.save.bind(this)) : this.setState({minData});
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = {};
    payload.storytopic_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        this.setState({minData});
      }
    });
  }

  save() {
    const {minData} = this.state;
    const payload = {id: minData.id, slug: minData.slug, type: minData.type};
    axios.post("/api/cms/storytopic/update", payload).then(() => {
      console.log("saved");
    });
  }

  onSave(minData) {
    if (this.props.reportSave) this.props.reportSave("storytopic", minData.id, minData.title);
  }

  onMove() {
    this.forceUpdate();
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  render() {

    const {minData} = this.state;

    if (!minData) return <Loading />;     

    const typeOptions = minData.types.map(t =>
      <option key={t} value={t}>{t}</option>
    );

    return (
      <div id="storytopic-editor">
        <div className="pt-select">
          Topic Type
          <select value={minData.type} onChange={this.changeField.bind(this, "type", true)} style={{margin: "5px", width: "200px"}}>
            {typeOptions}
          </select>
        </div>
        <h4>Title</h4>
        <TextCard
          id={minData.id}
          fields={["title"]}
          plainfields={["slug"]}
          onSave={this.onSave.bind(this)}
          type="storytopic"
          variables={{}}
        />
        <h4>
          Subtitles
          <Button onClick={this.addItem.bind(this, "storytopic_subtitle")} iconName="add" />
        </h4>
        { minData.subtitles && minData.subtitles.map(s =>
          <div key={s.id}>
            <TextCard
              key={s.id}
              id={s.id}
              fields={["subtitle"]}
              type="storytopic_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
            />
            <MoveButtons
              item={s}
              array={minData.subtitles}
              type="storytopic_subtitle"
              onMove={this.onMove.bind(this)}
            />
          </div>)
        }
        <h4>
          Stats
          <Button onClick={this.addItem.bind(this, "storytopic_stat")} iconName="add" />
        </h4>
        <div className="stats">
          { minData.stats && minData.stats.map(s =>
            <div key={s.id}>
              <TextCard
                key={s.id}
                id={s.id}
                fields={["title", "subtitle", "value"]}
                type="storytopic_stat"
                onDelete={this.onDelete.bind(this)}
                variables={{}}
              />
              <MoveButtons
                item={s}
                array={minData.stats}
                type="storytopic_stat"
                onMove={this.onMove.bind(this)}
              />
            </div>)
          }
        </div>
        <h4>
          Descriptions
          <Button onClick={this.addItem.bind(this, "storytopic_description")} iconName="add" />
        </h4>
        { minData.descriptions && minData.descriptions.map(d =>
          <div key={d.id}>
            <TextCard
              key={d.id}
              id={d.id}
              fields={["description"]}
              type="storytopic_description"
              onDelete={this.onDelete.bind(this)}
              variables={{}}
            />
            <MoveButtons
              item={d}
              array={minData.descriptions}
              type="storytopic_description"
              onMove={this.onMove.bind(this)}
            />
          </div>)
        }
        <h4>
          Visualizations
          <Button onClick={this.addItem.bind(this, "storytopic_visualization")} iconName="add" />
        </h4>
        <div className="visualizations">
          <div>
            { minData.visualizations && minData.visualizations.map(v =>
              <div key={v.id}>
                <VisualizationCard
                  key={v.id}
                  id={v.id}
                  onDelete={this.onDelete.bind(this)}
                  type="storytopic_visualization"
                  variables={{}}
                />
                <MoveButtons
                  item={v}
                  array={minData.visualizations}
                  type="storytopic_visualization"
                  onMove={this.onMove.bind(this)}
                />
              </div>
            )}
          </div>
        </div>

      </div>
    );
  }
}

export default StoryTopicEditor;
