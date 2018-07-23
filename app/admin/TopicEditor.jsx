import axios from "axios";
import React, {Component} from "react";
import {Button} from "@blueprintjs/core";
import Loading from "components/Loading";
import PropTypes from "prop-types";
import TextCard from "./components/TextCard";
import SelectorCard from "./components/SelectorCard";
import VisualizationCard from "./components/VisualizationCard";
import MoveButtons from "./components/MoveButtons";

import stubs from "../../utils/stubs.js";

import "./TopicEditor.css";

const propMap = {
  topic_stat: "stats",
  topic_description: "descriptions",
  topic_subtitle: "subtitles",
  topic_visualization: "visualizations",
  selector: "selectors"
};

class TopicEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)(false);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)(false);
    }
    if (prevProps.preview !== this.props.preview) {
      this.hitDB.bind(this)(true);
    }
  }

  hitDB(force) {
    axios.get(`/api/cms/topic/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data}, this.fetchVariables.bind(this, force));
    });
  }

  changeField(field, save, e) {
    console.log(field, save, e);
    const {minData} = this.state;
    minData[field] = e.target.value;
    save ? this.setState({minData}, this.save.bind(this)) : this.setState({minData});
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = Object.assign({}, stubs[type]);
    payload.topic_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        if (type === "selector") {
          minData[propMap[type]].push(resp.data);
        }
        else {
          minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        }
        this.setState({minData});
      }
    });
  }

  save() {
    const {minData} = this.state;
    axios.post("/api/cms/topic/update", minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
      }
    });
  }

  onSave(minData) {
    if (this.props.reportSave) this.props.reportSave("topic", minData.id, minData.title);
  }

  onMove() {
    this.forceUpdate();
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  fetchVariables(force) {
    const slug = this.props.masterSlug;
    const id = this.props.preview;
    if (this.props.fetchVariables) {
      this.props.fetchVariables(slug, id, force, () => this.setState({recompiling: false}));
    }
  }

  render() {

    const {minData} = this.state;
    const {variables} = this.props;

    if (!minData || !variables) return <Loading />;

    const varOptions = [<option key="always" value="always">Always</option>];

    for (const key in variables) {
      if (variables.hasOwnProperty(key) && !["_genStatus", "_matStatus"].includes(key)) {
        const value = variables[key];
        varOptions.push(
          <option key={key} value={key}>{`${key}: ${value}`}</option>
        );
      }
    }

    const typeOptions = minData.types.map(t =>
      <option key={t} value={t}>{t}</option>
    );

    return (
      <div id="section-editor">
        <div id="slug">
          slug
          <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={minData.slug} onChange={this.changeField.bind(this, "slug", false)}/>
          <button onClick={this.save.bind(this)}>rename</button>
        </div>
        <div className="pt-select">
          Allowed?
          <select value={minData.allowed || "always"} onChange={this.changeField.bind(this, "allowed", true)} style={{margin: "5px", width: "200px"}}>
            {varOptions}
          </select>
        </div>
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
          onSave={this.onSave.bind(this)}
          type="topic"
          variables={variables}
        />
        <h4>
          Subtitles
          <Button onClick={this.addItem.bind(this, "topic_subtitle")} iconName="add" />
        </h4>
        { minData.subtitles && minData.subtitles.map(s =>
          <div key={s.id}>
            <TextCard
              key={s.id}
              id={s.id}
              fields={["subtitle"]}
              type="topic_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
              selectors={minData.selectors.map(s => Object.assign({}, s))}
            />
            <MoveButtons
              item={s}
              array={minData.subtitles}
              type="topic_subtitle"
              onMove={this.onMove.bind(this)}
            />
          </div>)
        }
        <h4>
          Descriptions
          <Button onClick={this.addItem.bind(this, "topic_description")} iconName="add" />
        </h4>
        { minData.descriptions && minData.descriptions.map(d =>
          <div key={d.id}>
            <TextCard
              key={d.id}
              id={d.id}
              fields={["description"]}
              type="topic_description"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
              selectors={minData.selectors.map(s => Object.assign({}, s))}
            />
            <MoveButtons
              item={d}
              array={minData.descriptions}
              type="topic_description"
              onMove={this.onMove.bind(this)}
            />
          </div>)
        }
        <h4>
          Stats
          <Button onClick={this.addItem.bind(this, "topic_stat")} iconName="add" />
        </h4>
        <div className="stats">
          { minData.stats && minData.stats.map(s =>
            <div key={s.id}>
              <TextCard
                key={s.id}
                id={s.id}
                fields={["title", "subtitle", "value"]}
                type="topic_stat"
                onDelete={this.onDelete.bind(this)}
                variables={variables}
                selectors={minData.selectors.map(s => Object.assign({}, s))}
              />
              <MoveButtons
                item={s}
                array={minData.stats}
                type="topic_stat"
                onMove={this.onMove.bind(this)}
              />
            </div>)
          }
        </div>
        <h4>
          Visualizations
          <Button onClick={this.addItem.bind(this, "topic_visualization")} iconName="add" />
        </h4>
        <div className="visualizations">
          <div>
            { minData.visualizations && minData.visualizations.map(v =>
              <div key={v.id}>
                <VisualizationCard
                  key={v.id}
                  id={v.id}
                  onDelete={this.onDelete.bind(this)}
                  type="topic_visualization"
                  variables={variables}
                />
                <MoveButtons
                  item={v}
                  array={minData.visualizations}
                  type="topic_visualization"
                  onMove={this.onMove.bind(this)}
                />
              </div>
            )}
          </div>
        </div>
        <h4>
          Selectors
          <Button onClick={this.addItem.bind(this, "selector")} iconName="add" />
        </h4>
        { minData.selectors && minData.selectors.map(s =>
          <div key={s.id}>
            <SelectorCard
              key={s.id}
              minData={s}
              type="selector"
              onSave={() => this.forceUpdate()}
              onDelete={this.onDelete.bind(this)}
              variables={variables}
            />
            <MoveButtons
              item={s}
              array={minData.selectors}
              type="selector"
              onMove={this.onMove.bind(this)}
            />
          </div>)
        }

      </div>
    );
  }
}

TopicEditor.contextTypes = {
  formatters: PropTypes.object
};

export default TopicEditor;
