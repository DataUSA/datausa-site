import React, {Component} from "react";
import {connect} from "react-redux";
import {fetchData, SubNav} from "datawheel-canon";
import axios from "axios";
import {select} from "d3-selection";
import "./index.css";

import Loading from "components/Loading/index";
import Splash from "./Splash";
import Section from "./Section";
import SectionIcon from "./SectionIcon";
import TextViz from "./topics/TextViz";

class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeSection: false,
      comparisons: [],
      loading: false
    };
    this.scrollBind = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.scrollBind);
    this.scrollBind();
    const {query} = this.props.location;
    if (query.compare) {
      const {pslug} = this.props.params;
      this.setState({loading: true});
      axios.get(`/api/profile/${pslug}/${query.compare}`)
        .then(resp => {
          const {comparisons} = this.state;
          this.setState({comparisons: comparisons.concat([resp.data]), loading: false});
        });
    }
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

    const {params, profile} = this.props;
    const {activeSection, comparisons, loading} = this.state;

    const profiles = [profile].concat(comparisons);
    console.log(profiles);

    return (
      <div id="Profile">
        <Splash profile={profile} comparisons={comparisons} params={params} />
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
        { loading ? <Loading /> : null }
      </div>
    );

  }

}

Profile.need = [
  fetchData("profile", "/api/profile/<pslug>/<pid>", d => d)
];

export default connect(state => ({
  env: state.env,
  profile: state.data.profile
}))(Profile);
