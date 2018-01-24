import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData} from "datawheel-canon";
import "./Profile.css";

import Stat from "./Stat";
import SectionIcon from "./SectionIcon";

import Section from "./Section";
import TextViz from "./topics/TextViz";

class Profile extends Component {

  render() {

    const {profile} = this.props;

    const {pid, pslug} = this.props.params;

    return (
      <div id="Profile">
        <div className="splash">
          <div className="profile-image" style={{backgroundImage: `url("/img/splash/${pslug}/${pid}.jpg")`}}></div>
          <h1 className="profile-title">{ profile.title }</h1>
          { profile.subtitle ? <div className="profile-subtitle">{ profile.subtitle }</div> : null }
          <div className="profile-stats">
            { profile.stats.map((s, i) => <Stat key={i} data={s} />) }
          </div>
          <div className="profile-sections">
            <SectionIcon slug="about" title="About" />
            { profile.sections.map((s, i) => <SectionIcon key={i} {...s} />) }
          </div>
        </div>
        <Section title="About" description={ profile.description } visualizations={ profile.visualizations } slug="about" />
        { profile.sections.map((s, i) => <Section key={i} {...s}>
          { s.topics.map((t, ii) => <TextViz key={ii} {...t} />) }
        </Section>) }
      </div>
    );

  }

}

Profile.need = [
  fetchData("profile", "http://localhost:3300/api/profile/<pslug>/<pid>", d => d)
];

export default connect(state => ({
  profile: state.data.profile
}))(Profile);
