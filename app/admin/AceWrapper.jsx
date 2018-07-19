import React, {Component} from "react";
import ace from "brace";
import "brace/ext/language_tools";

const langTools = ace.acequire("ace/ext/language_tools");

export default class AceWrapper extends Component {

  componentDidMount() {
    this.updateCompleter.bind(this)();
  }

  updateCompleter() {
    const wordList = Object.keys(this.props.variables || {}).sort();
    const completer = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        callback(null, wordList.map(word => ({
          caption: word,
          value: word,
          meta: "variable"
        })));
      }
    };
    langTools.setCompleters([completer]);
  }

  componentDidUpdate(prevProps) {
    if (this.editor) {
      clearTimeout(this.resize);
      this.resize = setTimeout(editor => editor.resize(), 400, this.editor.editor);
    }
    if (this.editor && prevProps.variables !== this.props.variables) {
      this.updateCompleter.bind(this)();
    }
  }

  render() {
    if (typeof window !== "undefined") {
      const Ace = require("react-ace").default;
      const {readOnly} = this.props;
      require("brace/mode/javascript");
      require("brace/theme/kuroir");
      require("brace/theme/idle_fingers");
      return <Ace theme={readOnly ? "kuroir" : "idle_fingers"} width="auto" height="auto"
        ref={editor => this.editor = editor}
        wrapEnabled={false}
        tabSize = {2}
        mode="javascript"
        setOptions={{
          fontSize: "14px",
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true
        }}
        editorProps={{
          $blockScrolling: Infinity
        }}
        {...this.props} />;
    }
    return null;
  }
}
