import axios from "axios";
import React, {Component} from "react";
import {Card, Icon, Dialog} from "@blueprintjs/core";
import GeneratorEditor from "../GeneratorEditor";
import Loading from "components/Loading";
import FooterButtons from "../components/FooterButtons";
import "./GeneratorCard.css";

import ConsoleVariable from "./ConsoleVariable";

class GeneratorCard extends Component {

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
    if (this.state.minData && prevProps.variables !== this.props.variables) {
      this.formatDisplay.bind(this)();
    }
  }

  hitDB() {
    const {id, type} = this.props;
    axios.get(`/api/cms/${type}/get/${id}`).then(resp => {
      this.setState({minData: resp.data}, this.formatDisplay.bind(this));
    });
  }

  formatDisplay() {
    const {variables, type} = this.props;
    const {id} = this.state.minData;
    const displayData = type === "generator" ? variables._genStatus[id] : variables._matStatus[id];
    this.setState({displayData});
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
    const {displayData, minData, isOpen} = this.state;

    if (!minData || !variables) return <Loading />;

    return (
      <Card onClick={() => this.setState({isOpen: true})} className="generator-card" interactive={true} elevation={1}>
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
        <h5><Icon className={type} iconName="th" />{minData.name}</h5>
        <div className="table">
          <table className="pt-table pt-condensed pt-bordered">
            <tbody>
              { displayData && Object.keys(displayData).map(k =>
                <tr key={ k }>
                  <td><code>{ k }</code></td>
                  <td><ConsoleVariable value={ displayData[k] } /></td>
                </tr>
              ) }
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

}

export default GeneratorCard;
