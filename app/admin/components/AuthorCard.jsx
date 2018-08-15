import axios from "axios";
import React, {Component} from "react";
import {Card, Button, Dialog} from "@blueprintjs/core";
import varSwapRecursive from "../../../utils/varSwapRecursive";
import Loading from "components/Loading";
import FooterButtons from "../components/FooterButtons";
import TextEditor from "../TextEditor";
import TextCard from "../components/TextCard";
import MoveButtons from "../components/MoveButtons";
import PropTypes from "prop-types";
import stubs from "../../../utils/stubs.js";
import "./AuthorCard.css";

/**
 * This was directly copied from TextCard, but because it's so specific, probably doesn't
 * need all the variables/selectors. TODO: Prune this to its "author-only" core code
 *
 * Addendum: This is now less of a "Card," and more of an editor in itself. When editing 
 * this code, turn this into an AuthorEditor that is capable of listing the author stats
 * (as a traditional card does) but also managing the list of descriptions (as, for example,
 * a StoryEditor does)
 */

const propMap = {
  author_description: "descriptions"
};

class AuthorCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null,
      displayData: null
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  componentDidUpdate(prevProps) {
    if (this.state.minData && (prevProps.variables !== this.props.variables || this.props.selectors !== prevProps.selectors)) {
      this.formatDisplay.bind(this)();
    }
    if (prevProps.id !== this.props.id) {
      this.hitDB.bind(this)();
    }
  }

  hitDB() {
    const {id, type} = this.props;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      this.setState({minData: resp.data}, this.formatDisplay.bind(this));
    });
  }

  formatDisplay() {
    const {variables, selectors} = this.props;
    const {formatters} = this.context;
    const {minData} = this.state;
    // Setting "selectors" here is pretty hacky. The varSwap needs selectors in order
    // to run, and it expects them INSIDE the object. Find a better way to do this without
    // polluting the object itself
    minData.selectors = selectors;
    const displayData = varSwapRecursive(minData, formatters, variables);
    this.setState({displayData});
  }

  save() {
    const {type, fields} = this.props;
    const {minData} = this.state;
    const payload = {id: minData.id};
    fields.forEach(field => payload[field] = minData[field]);
    axios.post(`/api/cms/${type}/update`, payload).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false}, this.formatDisplay.bind(this));
        if (this.props.onSave) this.props.onSave(minData);
      }
    });
  }

  delete() {
    const {type} = this.props;
    const {minData} = this.state;
    axios.delete(`/api/cms/${type}/delete`, {params: {id: minData.id}}).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.onDelete) this.props.onDelete(type, resp.data);
      }
    });
  }

  onDelete(type, newArray) {
    const {minData} = this.state;
    minData.descriptions = newArray;
    this.setState({minData});
  }

  onMove() {
    this.forceUpdate();
  }

  addItem(type) {
    const {minData} = this.state;
    const payload = Object.assign({}, stubs[type]);
    payload.author_id = minData.id;
    // todo: move this ordering out to axios (let the server concat it to the end)
    payload.ordering = minData[propMap[type]].length;
    axios.post(`/api/cms/${type}/new`, payload).then(resp => {
      if (resp.status === 200) {
        minData[propMap[type]].push({id: resp.data.id, ordering: resp.data.ordering});
        this.setState({minData});
      }
    });
  }

  render() {
    const {displayData, minData, isOpen} = this.state;
    const {variables, fields, type} = this.props;

    if (!minData || !displayData) return <Loading />;

    let cardClass = "splash-card";
    if (["profile_stat", "topic_stat"].includes(type)) cardClass = "stat-card";
    const displaySort = ["title", "value", "subtitle"];
    const displays = Object.keys(displayData)
      .filter(k => typeof displayData[k] === "string" && !["id", "image", "profile_id", "allowed", "ordering", "slug", "label", "type"].includes(k))
      .sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b));

    return (
      <div style={{outline: "1px solid darkblue", padding: "5px"}}>
        <Card onClick={() => this.setState({isOpen: true})} className={cardClass} interactive={true} elevation={1}>
          <Dialog
            iconName="document"
            isOpen={isOpen}
            onClose={() => this.setState({isOpen: false})}
            title="Text Editor"
          >
            <div className="pt-dialog-body">
              <TextEditor data={minData} variables={variables} fields={fields.sort((a, b) => displaySort.indexOf(a) - displaySort.indexOf(b))} />
            </div>
            <FooterButtons
              onDelete={["profile", "section", "topic"].includes(type) ? false : this.delete.bind(this)}
              onCancel={() => this.setState({isOpen: false})}
              onSave={this.save.bind(this)}
            />
          </Dialog>
          { displays.map((k, i) => <p key={i} className={k} dangerouslySetInnerHTML={{__html: displayData[k]}}></p>) }
        </Card>
        <h4>Descriptions</h4>        
        <div style={{marginLeft: "40px", outline: "1px solid black"}}>
          <Button onClick={this.addItem.bind(this, "author_description")} iconName="add" />
          {minData.descriptions && minData.descriptions.map(d => 
            <div key={d.id}>
              <TextCard 
                id={d.id}
                onDelete={this.onDelete.bind(this)}
                fields={["description"]}
                type="author_description"
                variables={{}}
              />
              <MoveButtons
                item={d}
                array={minData.descriptions}
                type="author_description"
                onMove={this.onMove.bind(this)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

}

AuthorCard.contextTypes = {
  formatters: PropTypes.object
};

export default AuthorCard;
