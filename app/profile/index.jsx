import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";

import {CanonProfile, fetchData, SubNav} from "@datawheel/canon-core";
import Splash from "toCanon/Splash";
import SectionIcon from "toCanon/SectionIcon";
import Topic from "./Topic";

import axios from "axios";
import {select} from "d3-selection";
import "./index.css";

import Loading from "components/Loading/index";
import Section from "./Section";

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

  getChildContext() {
    const {formatters} = this.context;
    const {variables} = this.props.profile;
    return {formatters, variables};
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

    const {formatters} = this.context;
    const {params, profile} = this.props;
    const {pslug} = params;
    const {activeSection, comparisons, loading} = this.state;

    const profiles = [profile].concat(comparisons);
    profiles.forEach(d => {
      d.image = `/api/profile/${pslug}/${d.pid}/splash`;
    });

    const topics = [];
    profile.sections.forEach(s => {
      const arr = [];
      const sectionCompares = comparisons.map(c => c.sections.find(ss => ss.title === s.title));
      s.topics.forEach(t => {
        arr.push(<Topic contents={t} />);
        sectionCompares.map(ss => ss.topics.find(tt => tt.title === t.title))
          .forEach(tt => {
            arr.push(<Topic contents={tt} />);
          });
      });
      topics.push(arr);
    });

    return (
      <CanonProfile>
        <Helmet title={ formatters.stripHTML(profiles.map(d => d.title).join(" & ")) } />
        <Splash data={profile} comparisons={comparisons} />
        <Section data={{...profile, title: "About", slug: "about"} } comparisons={comparisons} />
        { profile.sections.map((s, i) => {
          const compares = comparisons.map(c => c.sections[i]);
          return <Section key={i} data={s} comparisons={compares}>
            { topics[i] }
          </Section>;
        }) }
        <SubNav type="scroll" anchor="top" visible={() => {
          if (typeof window === undefined) return false;
          const elem = select(".Section.about").node();
          return elem.getBoundingClientRect().top <= 45;
        }}>
          <SectionIcon slug="about" title="About" active={ activeSection === "about" } />
          { profile.sections.map((s, i) => <SectionIcon key={i} {...s} active={ activeSection === s.slug } />) }
        </SubNav>
        { loading ? <Loading /> : null }
      </CanonProfile>
    );

  }

}

Profile.childContextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

Profile.contextTypes = {
  formatters: PropTypes.object
};

Profile.need = [
  fetchData("profile", "/api/profile/<pslug>/<pid>")
];

export default connect(state => ({
  env: state.env,
  profile: state.data.profile
}))(Profile);
