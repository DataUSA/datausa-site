import React, {Component} from "react";
import PropTypes from "prop-types";

class PlainTextEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: null,
      fields: null
    };
  }

  componentDidMount() {
    const {data, fields} = this.props;
    this.setState({data, fields});
  }

  changeField(field, e) {
    const {data} = this.state;
    data[field] = e.target.value;
    this.setState({data});
  }

  render() {

    const {data, fields} = this.state;

    if (!data || !fields) return null;

    const inputs = fields.map(f =>
      <div key={f} style={{margin: "10px"}}>
        <span style={{fontWeight: "bold"}}>{f}</span>
        <input className="pt-input" style={{width: "180px"}} type="text" dir="auto" value={data[f]} onChange={this.changeField.bind(this, f)}/>
      </div>
    );

    return (
      <div id="text-editor">
        {inputs}
      </div>
    );
  }
}

PlainTextEditor.contextTypes = {
  formatters: PropTypes.object
};

export default PlainTextEditor;
