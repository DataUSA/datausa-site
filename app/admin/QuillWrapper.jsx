import React, {Component} from "react";

import "./QuillWrapper.css";

class QuillWrapper extends Component {

  render() {
    if (typeof window !== "undefined") {
      const Quill = require("react-quill");
      require("react-quill/dist/quill.snow.css");
      const modules = {
        toolbar: [
          ["bold", "italic", "underline", "code", "blockquote", "code-block", "link"],
          [{list: "ordered"}, {list: "bullet"}],
          ["clean"]
        ],
        clipboard: {
          matchVisual: false
        }
      };
      return <div>
        <Quill
          theme="snow"
          modules={modules}
          onChangeSelection={range => range ? this.setState({currentRange: range}) : null}
          ref={c => this.quillRef = c}
          {...this.props}
        />
      </div>;
    }
    return null;
  }
}

export default QuillWrapper;
