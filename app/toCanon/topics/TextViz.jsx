import React, {Component} from "react";
import PropTypes from "prop-types";
import {AnchorLink} from "@datawheel/canon-core";
import axios from "axios";
import {nest} from "d3-collection";
import {NonIdealState, Spinner} from "@blueprintjs/core";
import Viz from "components/Viz/index";
import "./topic.css";
import SourceGroup from "../components/SourceGroup";
import StatGroup from "../components/StatGroup";

class TextViz extends Component {

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
    const {descriptions, selectors, slug, stats, subtitles, title, titleCompare, visualizations} = contents;

    const miniviz = visualizations.length > 1 ? visualizations[0] : false;
    const mainviz = visualizations.length > 1 ? visualizations.slice(1) : visualizations;

    if (router.location.query.viz === "true") {
      return <div className={ `topic ${slug || ""} Column ${loading ? "topic-loading" : ""}` }>
        <div className="topic-content">
          { title &&
            <h3 id={ slug } className="topic-title">
              <AnchorLink to={ slug } className="anchor" dangerouslySetInnerHTML={{__html: titleCompare || title}}></AnchorLink>
            </h3>
          }
          { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
          { selectors.map(selector => <div className="bp3-select bp3-fill" key={selector.name}>
            <select onChange={d => this.onSelector.bind(this)(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
              { selector.options.map(({option}) => <option value={option} key={option}>{variables[option]}</option>) }
            </select>
          </div>) }
          { miniviz && <Viz topic={contents} config={miniviz} className="topic-miniviz" title={ title } slug={ `${slug}_miniviz` } /> }
        </div>
        { mainviz.map((visualization, ii) => <Viz topic={contents} config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
        <SourceGroup sources={sources} />
      </div>;
    }

    const statGroups = nest().key(d => d.title).entries(stats);

    return <div className={ `topic ${slug || ""} TextViz ${loading ? "topic-loading" : ""}` }>
      <div className="topic-content">
        { title &&
          <h3 id={ slug } className="topic-title">
            <AnchorLink to={ slug } className="anchor" dangerouslySetInnerHTML={{__html: titleCompare || title}}></AnchorLink>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { selectors.map(selector => <div className="bp3-select bp3-fill" key={selector.name}>
          <select onChange={d => this.onSelector.bind(this)(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
            { selector.options.map(({option}) => <option value={option} key={option}>{variables[option]}</option>) }
          </select>
        </div>) }
        <div className="topic-stats">
          { statGroups.map(({key, values}) => <StatGroup key={key} title={key} stats={values} />) }
        </div>
        <div className="topic-descriptions">
          { descriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
          { loading && <NonIdealState icon={<Spinner />} /> }
        </div>
        { miniviz && <Viz topic={contents} config={miniviz} className="topic-miniviz" title={ title } slug={ `${slug}_miniviz` } /> }
        <SourceGroup sources={sources} />
      </div>
      { mainviz.map((visualization, ii) => <Viz topic={contents} config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
    </div>;
  }

}

TextViz.contextTypes = {
  router: PropTypes.object,
  updateSource: PropTypes.func,
  variables: PropTypes.object
};

export default TextViz;
