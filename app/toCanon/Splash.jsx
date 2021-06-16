import React, {Component} from "react";
import PropTypes from "prop-types";
import Stat from "./Stat";
import SectionIcon from "./SectionIcon";
import Search from "toCanon/Search";
import "./Splash.css";
import {Button} from "@blueprintjs/core";

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
    const {data: profile, height, comparisons, story} = this.props;

    const data = [profile].concat(comparisons);

    const slug = story ? "" : profile.meta[0].slug;
    const dimension = story ? "" : profile.meta[0].dimension;

    return <div id="Splash" style={{height}} className={`splash-${slug} splash-${(data[0].sections || data[0].topics)[0].stats.length}${revealPhoto ? " reveal-photo" : ""}`}>
      <div className="image-container" style={{height}}>
        { data.map((d, i) => <div key={i} className="image" style={{backgroundImage: `url("${story ? d.image : `/api/profile/${d.dims[0].slug}/${d.variables.slug1}/splash`}")`}}></div>) }
        <Button onClick={this.revealPhoto.bind(this)} icon="camera" className={ `bp3-minimal ${revealPhoto ? "bp3-active" : ""}` } />
      </div>
      <div className="content-container">
        { data.map((d, i) => <h1 key={i} className="profile-title" dangerouslySetInnerHTML={{__html: d.title}} />) }
      </div>
      <div className="content-container">
        { data.map((d, i) => <div key={i} className="profile-subtitle" dangerouslySetInnerHTML={{__html: (d.sections || d.topics)[0].subtitles.length ? (d.sections || d.topics)[0].subtitles[0].subtitle : null}} />) }
      </div>
      { !story && <Search className="SearchButton"
        icon={ false }
        inactiveComponent={ CompareButton }
        placeholder={ `Search ${profile.label.replace(/([A-z]$)/g, chr => chr === "y" ? "ies" : `${chr}s`)}` }
        primary={false}
        resultRender={d => <div onClick={() => addComparison(d.slug || d.id)} className="result-container">
          <img className="result-icon" src={ `/icons/dimensions/${d.dimension} - Color.svg` } />
          <div className="result-text">
            <div className="title">{ d.name }</div>
            <div className="sumlevel">{ d.hierarchy }</div>
          </div>
        </div>}
        url={ `/api/searchLegacy/?dimension=${dimension}` } /> }
      { !story && <div className="content-container">
        { data.map((d, i) => (d.sections || d.topics)[0].stats.length && <div key={i} className="profile-stats">
          { (d.sections || d.topics)[0].stats.map((s, ii) => <Stat key={ii} data={s} />) }
        </div>) }
      </div> }
      { !story && profile.sections &&
        <div className="profile-sections">
          <SectionIcon slug="about" title="About" />
          { profile.sections.filter(d => d.type === "Grouping").map((s, i) => <SectionIcon key={i} {...s} />) }
        </div>
      }
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
  comparisons: [],
  height: "100vh",
  story: false
};

export default Splash;
