import axios from "axios";
import React, {Component} from "react";
import {Card, Dialog} from "@blueprintjs/core";
import varSwapRecursive from "../../../utils/varSwapRecursive";
import Loading from "components/Loading";
import FooterButtons from "../components/FooterButtons";
import TextEditor from "../TextEditor";
import PropTypes from "prop-types";
import "./TextCard.css";

class TextCard extends Component {

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
    const {type} = this.props;
    const {minData} = this.state;
    axios.post(`/api/cms/${type}/update`, minData).then(resp => {
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

  shouldShow(k, v) {
    return typeof v === "string" &&
      !["id", "profile_id", "allowed", "ordering", "slug", "label", "type"].includes(k);
  }

  render() {
    const {displayData, minData, isOpen} = this.state;
    const {variables, fields, type} = this.props;

    if (!minData || !displayData) return <Loading />;

    let cardClass = "splash-card";
    if (["stat_profile", "stat_topic"].includes(type)) cardClass = "stat-card";

    return (
      <Card onClick={() => this.setState({isOpen: true})} className={cardClass} interactive={true} elevation={1}>
        <Dialog
          iconName="document"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          title="Text Editor"
        >
          <div className="pt-dialog-body">
            <TextEditor data={minData} variables={variables} fields={fields} />
          </div>
          <FooterButtons
            onDelete={["profile", "section", "topic"].includes(type) ? false : this.delete.bind(this)}
            onCancel={() => this.setState({isOpen: false})}
            onSave={this.save.bind(this)}
          />
        </Dialog>
        { displayData && Object.keys(displayData).map(k =>
          this.shouldShow(k, displayData[k]) && <p dangerouslySetInnerHTML={{__html: displayData[k]}}></p>
        ) }
      </Card>
    );
  }

}

TextCard.contextTypes = {
  formatters: PropTypes.object
};

export default TextCard;
