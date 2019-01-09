import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";

import {CanonProfile, fetchData, SubNav} from "@datawheel/canon-core";
import Splash from "toCanon/Splash";
import SectionIcon from "toCanon/SectionIcon";
import Topic from "toCanon/Topic";

import axios from "axios";
import {select} from "d3-selection";
import "./index.css";

import Loading from "components/Loading";
import Tile from "components/Tile/Tile";
import Section from "toCanon/Section";

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
    return {
      addComparison: this.addComparison.bind(this),
      formatters,
      removeComparison: this.removeComparison.bind(this),
      variables
    };
  }

  addComparison(id) {
    const {pslug} = this.props.params;
    const {comparisons} = this.state;
    this.setState({loading: true});
    axios.get(`/api/profile/${pslug}/${id}`)
      .then(resp => {
        this.setState({comparisons: comparisons.concat([resp.data]), loading: false});
        const {router} = this.props;
        const {location} = router;
        router.push(`${location.basename}${location.pathname}?compare=${id}`);
      });
  }

  removeComparison() {
    this.setState({comparisons: []});
    const {router} = this.props;
    const {location} = router;
    router.push(`${location.basename}${location.pathname}`);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.scrollBind);
    this.scrollBind();
    const {query} = this.props.location;
    if (query.compare) this.addComparison.bind(this)(query.compare);
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
    const {origin, params, profile, similar} = this.props;
    const {pslug} = params;
    const {activeSection, comparisons, loading} = this.state;

    const joiner = ["geo"].includes(pslug) ? "in" : "for";

    const profiles = [profile].concat(comparisons);
    profiles.forEach(d => {
      d.imageURL = `/api/profile/${pslug}/${d.id}/splash`;
    });

    const topics = [];
    profile.sections
      .forEach(s => {
        const arr = [];
        const sectionCompares = comparisons.map(c => c.sections.find(ss => ss.id === s.id)).filter(Boolean);
        s.topics.forEach(t => {
          if (comparisons.length) t.titleCompare = t.title.replace("</p>", ` ${joiner} ${formatters.stripHTML(profile.title)}</p>`);
          arr.push(<Topic key={`topic_${t.id}${comparisons.length ? "_orig" : ""}`} contents={t} />);
          sectionCompares
            .map(ss => ss.topics.find(tt => tt.id === t.id))
            .forEach(tt => {
              tt.titleCompare = tt.title.replace("</p>", ` ${joiner} ${formatters.stripHTML(comparisons[0].title)}</p>`);
              arr.push(<Topic variables={comparisons[0].variables} key={`topic_${tt.id}_comp`} contents={tt} />);
            });
        });
        topics.push(arr);
      });

    const metaTitle = formatters.stripHTML(profiles.map(d => d.title).join(" & "));
    const metaDesc = formatters.stripHTML(profile.descriptions[0].description);

    return (
      <CanonProfile>
        <Helmet>
          <title>{ metaTitle }</title>
          <meta property="og:title" content={ metaTitle } />
          <meta name="description" content={metaDesc} />
          <meta property="og:image" content={ `${origin}${profile.imageURL}` } />
          <meta property="og:description" content={metaDesc} />
        </Helmet>
        <Splash data={profile} comparisons={comparisons} />
        <Section data={{...profile, title: "About", slug: "about", profileSlug: profile.slug} } comparisons={comparisons} breadcrumbs={true} photo={true} />
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
        { similar.length && <div className="keep-exploring">
          <h2>Keep Exploring</h2>
          <div className="tiles">
            { similar.map(d => <Tile key={d.id} title={d.display || d.name} subtitle={d.hierarchy} image={`/api/profile/${profile.slug}/${d.id}/thumb`} url={`/profile/${profile.slug}/${d.slug || d.id}`} />) }
          </div>
        </div> }
        { loading ? <Loading /> : null }
      </CanonProfile>
    );

  }

}

Profile.childContextTypes = {
  addComparison: PropTypes.func,
  formatters: PropTypes.object,
  removeComparison: PropTypes.func,
  variables: PropTypes.object
};

Profile.contextTypes = {
  formatters: PropTypes.object
};

Profile.need = [
  fetchData("profile", "/api/profile/<pslug>/<pid>"),
  fetchData("similar", "/api/<pslug>/similar/<pid>")
];

export default connect(state => ({
  env: state.env,
  origin: state.location.origin,
  profile: state.data.profile,
  similar: state.data.similar
}))(Profile);
