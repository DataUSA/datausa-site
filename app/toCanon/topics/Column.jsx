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
      contents: props.contents,
      loading: false
    };
  }

  onSelector(name, value) {
    const {router, updateSource} = this.context;
    const {pid, pslug} = router.params;
    const {id} = this.state.contents;
    this.setState({loading: true});
    if (updateSource) updateSource(false);
    axios.get(`/api/topic/${pslug}/${pid}/${id}?${name}=${value}`)
      .then(resp => {
        this.setState({contents: resp.data, loading: false});
      });
  }

  render() {

    const {router, variables} = this.context;
    const {sources} = this.props;
    const {contents, loading} = this.state;
    const {descriptions, selectors, slug, subtitles, title, titleCompare, visualizations} = contents;

    const hideText = router.location.query.viz === "true";

    return <div className={ `topic ${slug} Column ${loading ? "topic-loading" : ""}` }>
      <div className="topic-content">
        { title &&
          <h3 id={ slug } className="topic-title">
            <a href={ `#${ slug }`} className="anchor" dangerouslySetInnerHTML={{__html: titleCompare || title}}></a>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { selectors.map(selector => <div className="pt-select pt-fill" key={selector.name}>
          <select onChange={d => this.onSelector.bind(this)(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
            { selector.options.map(({option}) => <option value={option} key={option}>{variables[option]}</option>) }
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
  router: PropTypes.object,
  updateSource: PropTypes.func,
  variables: PropTypes.object
};

export default Column;
