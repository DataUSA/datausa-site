import axios from "axios";
import React, {Component} from "react";
import {Button} from "@blueprintjs/core";
import Loading from "components/Loading";
import TextCard from "./components/TextCard";
import PropTypes from "prop-types";
import MoveButtons from "./components/MoveButtons";

import stubs from "../../utils/stubs.js";

import "./SectionEditor.css";

const propMap = {
  section_subtitle: "subtitles",
  section_description: "descriptions"
};

class SectionEditor extends Component {

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
    axios.get(`/api/cms/section/get/${this.props.id}`).then(resp => {
      this.setState({minData: resp.data}, this.fetchVariables.bind(this, force));
    });
  }

  changeField(field, e) {
    const {minData} = this.state;
    minData[field] = e.target.value;
    this.setState({minData});
  }

  chooseVariable(e) {
    const {minData} = this.state;
    minData.allowed = e.target.value;
    this.setState({minData}, this.save.bind(this));
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = Object.assign({}, stubs[type]);
    payload.section_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        this.setState({minData});
      }
    });
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData[propMap[type]] = newArray;
    this.setState({minData});
  }

  onSave(minData) {
    if (this.props.reportSave) this.props.reportSave("section", minData.id, minData.title);
  }

  onMove() {
    this.forceUpdate();
  }

  save() {
    const {minData} = this.state;
    axios.post("/api/cms/section/update", minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
      }
    });
  }

  fetchVariables(force) {
    const slug = this.props.masterSlug;
    const id = this.props.preview;
    if (this.props.fetchVariables) {
      this.props.fetchVariables(slug, id, force);
    }
  }

  render() {

    const {minData} = this.state;
    const {variables} = this.props;

    if (!minData || !variables) return <Loading />;

    const varOptions = [<option key="always" value="always">Always</option>]
      .concat(Object.keys(variables)
        .filter(key => !key.startsWith("_"))
        .sort((a, b) => a.localeCompare(b))
        .map(key => <option key={key} value={key}>{`${key}: ${variables[key]}`}</option>));

    return (
      <div id="section-editor">
        <div id="slug">
          slug
          <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={minData.slug} onChange={this.changeField.bind(this, "slug")}/>
          <button onClick={this.save.bind(this)}>rename</button>
        </div>
        <div className="pt-select">
          Allowed?
          <select value={minData.allowed || "always"} onChange={this.chooseVariable.bind(this)} style={{margin: "5px", width: "200px"}}>
            {varOptions}
          </select>
        </div>
        <h4>Title</h4>
        <TextCard
          id={minData.id}
          fields={["title"]}
          type="section"
          onSave={this.onSave.bind(this)}
          variables={variables}
        />
        <h4>
          Subtitles
          <Button onClick={this.addItem.bind(this, "section_subtitle")} iconName="add" />
        </h4>
        { minData.subtitles && minData.subtitles.map(s =>
          <div key={s.id}>
            <TextCard
              key={s.id}
              id={s.id}
              fields={["subtitle"]}
              type="section_subtitle"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
            />
            <MoveButtons
              item={s}
              array={minData.subtitles}
              type="section_subtitle"
              onMove={this.onMove.bind(this)}
            />
          </div>)
        }
        <h4>
          Descriptions
          <Button onClick={this.addItem.bind(this, "section_description")} iconName="add" />
        </h4>
        { minData.descriptions && minData.descriptions.map(d =>
          <div key={d.id}>
            <TextCard
              key={d.id}
              id={d.id}
              fields={["description"]}
              type="section_description"
              onDelete={this.onDelete.bind(this)}
              variables={variables}
            />
            <MoveButtons
              item={d}
              array={minData.descriptions}
              type="section_description"
              onMove={this.onMove.bind(this)}
            />
          </div>)
        }
      </div>
    );
  }
}

SectionEditor.contextTypes = {
  formatters: PropTypes.object
};

export default SectionEditor;
