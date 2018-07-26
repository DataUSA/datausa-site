import React, {Component} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {Dialog} from "@blueprintjs/core";
import varSwapRecursive from "utils/varSwapRecursive";
import GeneratorEditor from "../GeneratorEditor";
import Loading from "components/Loading";
import Viz from "components/Viz";
import FooterButtons from "../components/FooterButtons";
import "./VisualizationCard.css";

class VisualizationCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
    };
  }

  componentDidMount() {
    this.hitDB.bind(this)();
  }

  hitDB() {
    const {id, type} = this.props;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      this.setState({minData: resp.data});
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

  save() {
    const {type} = this.props;
    const {minData} = this.state;
    axios.post(`/api/cms/${type}/update`, minData).then(resp => {
      if (resp.status === 200) {
        this.setState({isOpen: false});
        if (this.props.onSave) this.props.onSave();
      }
    });
  }

  render() {

    const {minData, isOpen} = this.state;

    if (!minData) return <Loading />;

    const {formatters} = this.context;
    const {selectors, type, variables} = this.props;

    minData.selectors = selectors;
    const {logic} = varSwapRecursive(minData, formatters, variables);
    const re = new RegExp(/height\:[\s]*([0-9]+)/g);
    let height = re.exec(logic);
    height = height ? height[1] : "400";

    return (
      <div onClick={() => this.setState({isOpen: true})} className="pt-card pt-elevation-1 pt-interactive visualization-card" style={{height: `${height}px`}}>
        <Dialog
          className="generator-editor-dialog"
          iconName="code"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          title="Variable Editor"
        >
          <div className="pt-dialog-body">
            <GeneratorEditor data={minData} variables={variables} type={type} />
          </div>
          <FooterButtons
            onDelete={this.delete.bind(this)}
            onCancel={() => this.setState({isOpen: false})}
            onSave={this.save.bind(this)}
          />
        </Dialog>
        { logic ? <Viz config={{logic}} configOverride={{height, scrollContainer: "#item-editor"}} options={false} /> : <p>No configuration defined.</p> }
      </div>
    );
  }

}

VisualizationCard.contextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

export default VisualizationCard;
