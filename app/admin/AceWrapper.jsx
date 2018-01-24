import React, {Component} from "react";

export default class AceWrapper extends Component {

  componentDidUpdate() {
    if (this.editor) {
      clearTimeout(this.resize);
      this.resize = setTimeout(editor => editor.resize(), 400, this.editor.editor);
    }
  }

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      const {readOnly} = this.props;
      require("brace/mode/html");
      require("brace/theme/kuroir");
      require("brace/theme/idle_fingers");
      return <Ace theme={readOnly ? "kuroir" : "idle_fingers"} width="auto" height="auto"
        ref={editor => this.editor = editor}
        showGutter={false}
        wrapEnabled={false}
        tabSize = {2}
        mode="html"
        setOptions={{behavioursEnabled: false}}
        editorProps={{
          $blockScrolling: Infinity
        }}
        {...this.props} />;
    }
    return null;
  }
}
