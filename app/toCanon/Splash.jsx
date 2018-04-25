import React, {Component} from "react";
import Stat from "./Stat";
import SectionIcon from "./SectionIcon";
import "./Splash.css";

class Splash extends Component {

  render() {
    const {data: profile, height, comparisons} = this.props;

    const data = [profile].concat(comparisons);

    return <div id="Splash" style={{height}}>
      <div className="image-container" style={{height}}>
        { data.map((d, i) => <div key={i} className="image" style={{backgroundImage: `url("${d.image}")`}}></div>) }
      </div>
      <div className="content-container">
        { data.map((d, i) => <h1 key={i} className="profile-title" dangerouslySetInnerHTML={{__html: d.title}} />) }
      </div>
      <div className="content-container">
        { data.map((d, i) => <div key={i} className="profile-subtitle" dangerouslySetInnerHTML={{__html: d.subtitle}} />) }
      </div>
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

Splash.defaultProps = {
  comparisons: [],
  height: "100vh"
};

export default Splash;
