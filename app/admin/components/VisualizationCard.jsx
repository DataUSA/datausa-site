import axios from "axios";
import React, {Component} from "react";
import {Card, Icon, Dialog} from "@blueprintjs/core";
import GeneratorEditor from "../GeneratorEditor";
import Loading from "components/Loading";
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
    const {type, variables} = this.props;
    const {minData, isOpen} = this.state;

    if (!minData) return <Loading />;

    return (
      <Card onClick={() => this.setState({isOpen: true})} className="visualization-card" interactive={true} elevation={1}>
        <Dialog
          iconName="code"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          title="Variable Editor"
          style={{minWidth: "800px"}}
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
        <p>{minData.logic}</p>
      </Card>
    );
  }

}

export default VisualizationCard;
