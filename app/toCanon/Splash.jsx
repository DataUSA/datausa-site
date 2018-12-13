import React, {Component} from "react";
import PropTypes from "prop-types";
import {Link} from "react-router";
import Stat from "./Stat";
import SectionIcon from "./SectionIcon";
import Search from "toCanon/Search";
import "./Splash.css";

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

  getChildContext() {
    const {addComparison, removeComparison} = this.context;
    const {comparisons} = this.props;
    return {
      addComparison,
      comparisons,
      removeComparison
    };
  }

  render() {
    const {addComparison} = this.context;
    const {data: profile, height, comparisons} = this.props;

    const data = [profile].concat(comparisons);

    return <div id="Splash" style={{height}}>
      <div className="image-container" style={{height}}>
        { data.map((d, i) => <div key={i} className="image" style={{backgroundImage: `url("${d.imageURL}")`}}></div>) }
      </div>
      <div className="content-container">
        { data.map((d, i) => <h1 key={i} className="profile-title" dangerouslySetInnerHTML={{__html: d.title}} />) }
      </div>
      <div className="content-container">
        { data.map((d, i) => <div key={i} className="profile-subtitle" dangerouslySetInnerHTML={{__html: d.subtitle}} />) }
      </div>
      <Search className="SearchButton"
        icon={ false }
        inactiveComponent={ CompareButton }
        placeholder={ `Search ${profile.label.replace(/([A-z]$)/g, chr => chr === "y" ? "ies" : `${chr}s`)}` }
        primary={true}
        resultRender={d => <div onClick={() => addComparison(d.slug || d.id)} className="result-container">
          <img className="result-icon" src={ `/icons/dimensions/${d.dimension} - Color.svg` } />
          <div className="result-text">
            <div className="title">{ d.name }</div>
            <div className="sumlevel">{ d.hierarchy }</div>
          </div>
        </div>}
        url={ `/api/search/?dimension=${profile.dimension}` } />
      <div className="content-container">
        { data.map((d, i) => d.stats && <div key={i} className="profile-stats">
          { d.stats.map((s, ii) => <Stat key={ii} data={s} />) }
        </div>) }
      </div>
      { profile.sections &&
        <div className="profile-sections">
          <SectionIcon slug="about" title="About" />
          { profile.sections.map((s, i) => <SectionIcon key={i} {...s} />) }
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
  height: "100vh"
};

export default Splash;
