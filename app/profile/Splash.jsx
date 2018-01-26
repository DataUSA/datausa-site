import React, {Component} from "react";
import Stat from "./Stat";
import SectionIcon from "./SectionIcon";
import "./Splash.css";

export default class Splash extends Component {

  render() {
    const {profile, comparisons} = this.props;
    const {pid, pslug} = this.props.params;

    const data = [profile].concat(comparisons);

    return <div id="Splash">
      <div className="image-container">
        { data.map((d, i) => <div key={i} className="image" style={{backgroundImage: `url("/img/splash/${pslug}/${pid}.jpg")`}}></div>) }
      </div>
      <div className="content-container">
        { data.map((d, i) => <h1 key={i} className="profile-title">{ d.title }</h1>) }
      </div>
      <div className="content-container">
        { data.map((d, i) => <div key={i} className="profile-subtitle">{ profile.subtitle }</div>) }
      </div>
      <div className="profile-stats">
        { profile.stats.map((s, i) => <Stat key={i} data={s} />) }
      </div>
      <div className="profile-sections">
        <SectionIcon slug="about" title="About" />
        { profile.sections.map((s, i) => <SectionIcon key={i} {...s} />) }
      </div>
    </div>;
  }

}
