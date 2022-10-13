import React, {Component} from "react";
import PropTypes from "prop-types";
import {AnchorLink} from "@datawheel/canon-core";
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
    const {descriptions, selectors, slug, stats, subtitles, title, titleCompare, visualizations} = contents;

    const miniviz = visualizations.length > 1 ? visualizations[0] : false;
    const mainviz = visualizations.length > 1 ? visualizations.slice(1) : visualizations;

    if (router.location.query.viz === "true") {
      return <div className={ `topic ${slug || ""} Column ${loading ? "topic-loading" : ""}` }>
        <div className="topic-content">
          { title &&
            <h4 id={ slug } className="topic-title">
              <AnchorLink to={ slug } className="anchor" dangerouslySetInnerHTML={{__html: stripP(titleCompare || title)}}></AnchorLink>
            </h4>
          }
          { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: stripP(content.subtitle)}} />) }
          { selectors.map(selector => <div className="bp3-select bp3-fill" key={selector.name}>
            {selector.title && selector.title !== "New Selector" ? <span className="topic-select-label">{selector.title}</span> : null}
            <select onChange={d => this.onSelector.bind(this)(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
              { selector.options.map(({label, option}) => <option value={option} key={option}>{variables[label || option] !== undefined ? variables[label || option] : label || option}</option>) }
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
          <h4 id={ slug } className="topic-title">
            <AnchorLink to={ slug } className="anchor" dangerouslySetInnerHTML={{__html: stripP(titleCompare || title)}}></AnchorLink>
          </h4>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: stripP(content.subtitle)}} />) }
        { selectors.map(selector => <div className="bp3-select bp3-fill" key={selector.name}>
          {selector.title && selector.title !== "New Selector" ? <span className="topic-select-label">{selector.title}</span> : null}
          <select onChange={d => this.onSelector.bind(this)(selector.name, d.target.value)} disabled={loading} defaultValue={selector.default}>
            { selector.options.map(({label, option}) => <option value={option} key={option}>{variables[label || option] !== undefined ? variables[label || option] : label || option}</option>)}
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
  formatters: PropTypes.object,
  onSelector: PropTypes.func,
  router: PropTypes.object,
  updateSource: PropTypes.func,
  variables: PropTypes.object
};

export default TextViz;
