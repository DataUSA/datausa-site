import React, {Component} from "react";
import PropTypes from "prop-types";
import Viz from "components/Viz/index";
import "./topic.css";
import SourceGroup from "../components/SourceGroup";
import axios from "axios";

class Column extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  onSelector(name, value) {
    const {onSelector, updateSource} = this.context;
    this.setState({loading: true});
    if (updateSource) updateSource(false);
    onSelector(name, value, () => this.setState({loading: false}));
  }

  render() {

    const {formatters, router, variables} = this.context;
    const {stripP} = formatters;
    const {contents, sources} = this.props;
    const {loading} = this.state;
    const {descriptions, selectors, slug, subtitles, title, titleCompare, visualizations} = contents;

    const hideText = router.location.query.viz === "true";

    return <div className={ `topic ${slug} Column ${loading ? "topic-loading" : ""}` }>
      <div className="topic-content">
        { title &&
          <h3 id={ slug } className="topic-title">
            <a href={ `#${ slug }`} className="anchor" dangerouslySetInnerHTML={{__html: stripP(titleCompare || title)}}></a>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: stripP(content.subtitle)}} />) }
        { selectors.map(selector => <div className="bp3-select bp3-fill" key={selector.name}>
          <select onChange={d => this.onSelector.bind(this)(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
            { selector.options.map(({label, option}) => <option value={option} key={option}>{variables[label || option]}</option>) }
          </select>
        </div>) }
        { !hideText && descriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
      </div>
      { visualizations.map((visualization, ii) => <Viz topic={contents} config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
      <SourceGroup sources={sources} />
    </div>;
  }

}

Column.contextTypes = {
  formatters: PropTypes.object,
  onSelector: PropTypes.func,
  router: PropTypes.object,
  updateSource: PropTypes.func,
  variables: PropTypes.object
};

export default Column;
