import axios from "axios";
import React, {Component} from "react";
import {Card, Dialog} from "@blueprintjs/core";
import Loading from "components/Loading";
import FooterButtons from "../components/FooterButtons";
import SelectorEditor from "../SelectorEditor";
import PropTypes from "prop-types";
import "./SelectorCard.css";

class SelectorCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      minData: null
    };
  }

  componentDidMount() {
    // this.hitDB.bind(this)();
    this.setState({minData: this.props.minData});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.minData !== this.props.minData) {
      this.setState({minData: this.props.minData});
    }
  }

  /*
  hitDB() {
    const {id, type} = this.props;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      this.setState({minData: resp.data}); 
    });
  }
  */

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

  render() {
    const {minData, isOpen} = this.state;
    const {variables} = this.props;

    if (!minData) return <Loading />;

    return (
      <Card className="splash-card" key={minData.id} onClick={() => this.setState({isOpen: true})} interactive={true} elevation={1}>
        <Dialog
          iconName="code"
          isOpen={isOpen}
          onClose={() => this.setState({isOpen: false})}
          title="Selector Editor"
          style={{minWidth: "800px"}}
        >
          <div className="pt-dialog-body">
            <SelectorEditor variables={variables} data={minData} />
          </div>
          <FooterButtons 
            onDelete={this.delete.bind(this)}
            onCancel={() => this.setState({isOpen: false})}
            onSave={this.save.bind(this)}
          />
        </Dialog>
        <h4>{minData.name}</h4>
        <ul>
          {minData.options && minData.options.map(o => 
            <li key={o.option} className={minData.default === o.option ? "is-default" : ""}>{o.option}</li>
          )}
        </ul>
      </Card>
    );
  }

}

SelectorCard.contextTypes = {
  formatters: PropTypes.object
};

export default SelectorCard;
