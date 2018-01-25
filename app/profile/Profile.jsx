import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData, SubNav} from "datawheel-canon";
import {select} from "d3-selection";
import "./Profile.css";

import Stat from "./Stat";
import SectionIcon from "./SectionIcon";

import Section from "./Section";
import TextViz from "./topics/TextViz";

class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeSection: false
    };
    this.scrollBind = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.scrollBind);
    this.scrollBind();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollBind);
  }

  handleScroll() {

    const {sections} = this.props.profile;
    const {activeSection} = this.state;

    let newActiveSection = false;
    const elem = document.getElementById("about");
    const top = elem ? elem.getBoundingClientRect().top : 1;
    if (top <= 0) newActiveSection = "about";
    sections.forEach(section => {
      const elem = document.getElementById(section.slug);
      const top = elem ? elem.getBoundingClientRect().top : 1;
      if (top <= 0) newActiveSection = section.slug;
    });

    if (activeSection !== newActiveSection) {
      this.setState({activeSection: newActiveSection});
    }

  }

  render() {

    const {profile} = this.props;
    const {activeSection} = this.state;

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
        <SubNav type="scroll" anchor="top" visible={() => {
          if (!window) return false;
          const elem = select(".section.about").node();
          return elem.getBoundingClientRect().top <= 45;
        }}>
          <SectionIcon slug="about" title="About" active={ activeSection === "about" } />
          { profile.sections.map((s, i) => <SectionIcon key={i} {...s} active={ activeSection === s.slug } />) }
        </SubNav>
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
