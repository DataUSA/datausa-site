import React, {Component} from "react";
import PropTypes from "prop-types";
import Stat from "./Stat";
import Search from "toCanon/Search";
import "./Splash.css";
import {Button} from "@blueprintjs/core";
import SVG from "react-inlinesvg";
import stripP from "@datawheel/canon-cms/src/utils/formatters/stripP";

class CompareButton extends Component {

  render() {
    const {active, onClick} = this.props;
    const {comparisons, removeComparison} = this.context;
    const compareActive = comparisons.length;
    return (
      <div className={`profile-compare ${active ? "active" : ""}`} onClick={ compareActive ? removeComparison : onClick }>
        <img className="compare-img" src={`/images/icons/compare${compareActive ? "-active" : ""}.svg`} />
        <span className="compare-text">{compareActive ? "Remove" : "Add"} Comparison</span>
      </div>
    );
  }

}

CompareButton.contextTypes = {
  addComparison: PropTypes.func,
  comparisons: PropTypes.array,
  removeComparison: PropTypes.func
};

CompareButton.defaultProps = {
  active: false,
  onClick: false
};

class Splash extends Component {

  constructor(props) {
    super(props);
    this.state = {revealPhoto: false};
  }

  getChildContext() {
    const {addComparison, removeComparison} = this.context;
    const {comparisons} = this.props;
    return {
      addComparison,
      comparisons,
      removeComparison
    };
  }

  revealPhoto() {
    this.setState({revealPhoto: !this.state.revealPhoto});
  }

  render() {
    const {revealPhoto} = this.state;
    const {addComparison} = this.context;
    const {data: profile, comparisons} = this.props;

    const data = [profile].concat(comparisons);

    const slug = profile.meta[0].slug;
    const dimension = profile.meta[0].dimension;

    return <div id="Splash" className={`cp-hero splash-${slug} splash-${(data[0].sections || data[0].topics)[0].stats.length}${revealPhoto ? " reveal-photo" : ""}`}>
      <div className="image-container">
        { data.map((d, i) => <div key={i} className="image" style={{backgroundImage: `url("/api/profile/${d.dims[0].slug}/${d.variables.slug1}/splash")`}}></div>) }
        <Button onClick={this.revealPhoto.bind(this)} icon="camera" className={ `bp3-minimal ${revealPhoto ? "bp3-active" : ""}` } />
      </div>
      <div className="content-container">
        { data.map((d, i) => <h1 key={i} className="profile-title" dangerouslySetInnerHTML={{__html: d.title}} />) }
      </div>
      <div className="content-container">
        { data.map((d, i) => <div key={i} className="profile-subtitle" dangerouslySetInnerHTML={{__html: (d.sections || d.topics)[0].subtitles.length ? (d.sections || d.topics)[0].subtitles[0].subtitle : null}} />) }
      </div>
      <Search className="SearchButton"
        icon={ false }
        inactiveComponent={ CompareButton }
        placeholder={ `Search ${stripP(profile.label).replace(/([A-z]$)/g, chr => chr === "y" ? "ies" : `${chr}s`)}` }
        primary={false}
        resultRender={d => <div onClick={() => addComparison(d.slug || d.id)} className="result-container">
          <SVG className={`result-icon ${d.profile}`} src={ `/icons/dimensions/${d.dimension}.svg` } />
          <div className="result-text">
            <div className="title">{ d.name }</div>
            <div className="sumlevel">{ d.hierarchy }</div>
          </div>
        </div>}
        url={ `/api/searchLegacy/?dimension=${dimension}` } />
      <div className="content-container">
        { data.map((d, i) => (d.sections || d.topics)[0].stats.length && <div key={i} className="profile-stats">
          { (d.sections || d.topics)[0].stats.map((s, ii) => <Stat key={ii} data={s} />) }
        </div>) }
      </div>
    </div>;
  }

}

Splash.childContextTypes = {
  addComparison: PropTypes.func,
  comparisons: PropTypes.array,
  removeComparison: PropTypes.func
};

Splash.contextTypes = {
  addComparison: PropTypes.func,
  removeComparison: PropTypes.func
};

Splash.defaultProps = {
  comparisons: []
};

export default Splash;
