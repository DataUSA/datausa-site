import React, {Component} from "react";

import "./FooterButtons.css";

class FooterButtons extends Component {

  render() {
    
    const {onDelete, onCancel, onSave} = this.props;

    return (
      <div id="buttons">
        <div className="pt-dialog-footer">
          <div className="pt-dialog-footer-actions">
            <button
              className="pt-button pt-intent-danger"
              onClick={onDelete}
            >
              Delete
            </button>
            <button
              className="pt-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="pt-button pt-intent-success"
              onClick={onSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default FooterButtons;
