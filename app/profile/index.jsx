import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet-async";

import {AnchorLink, fetchData} from "@datawheel/canon-core";
import SubNav from "toCanon/SubNav";
import Splash from "toCanon/Splash";
import SectionIcon from "toCanon/SectionIcon";
import Topic from "toCanon/Topic";

import {Position, Tooltip} from "@blueprintjs/core";
import axios from "axios";
import {select} from "d3-selection";
import "./index.css";

import Loading from "components/Loading";
import Tile from "components/Tile/Tile";
import Section from "toCanon/Section";
import {updateTitle} from "actions/title";

import NotFound from "../pages/NotFound/NotFound";

const categories = {
  geo: [
    {title: "Wages", slug: "wages", topic: "income", section: "economy"},
    {title: "Occupations", slug: "occupations", topic: "tmap_occ_num_emp", section: "economy"},
    {title: "Industries", slug: "industries", topic: "tmap_ind_num_emp", section: "economy"},
    {title: "Domestic Trade", slug: "trade", topic: "domestic_trade", section: "economy"},
    {title: "Race and Ethnicity", slug: "race-and-ethnicity", topic: "ethnicity", section: "demographics"},
    {title: "Heritage", slug: "heritage", topic: "foreign_born", section: "demographics"},
    {title: "Military", slug: "military", topic: "veterans", section: "demographics"},
    {title: "Housing", slug: "housing", topic: "property_value", section: "housing"},
    // {title: "Income", slug: "income", topic: "household_income", section: "housing"},
    {title: "Transportation", slug: "transportation", topic: "num_vehicles", section: "housing"}
  ],
  university: [
    {title: "Student Expenses", slug: "student_expenses", topic: "tuition", section: "costs"},
    {title: "Financial Aid", slug: "financial_aid", topic: "incomeawards", section: "costs"},
    {title: "Workforce", slug: "workforce", topic: "jobs", section: "graduates"},
    {title: "Degrees", slug: "degrees", topic: "majors", section: "graduates"},
    {title: "Diversity", slug: "diversity", topic: "rate", section: "graduates"},
    {title: "Finances", slug: "finances", topic: "endowment", section: "operations"},
    {title: "Expenses", slug: "expenses", topic: "salaries", section: "operations"},
    {title: "Faculty and Staff", slug: "faculty_and_staff", topic: "staff_tmap", section: "operations"}
  ],
  naics: [
    {title: "Occupations", slug: "occupations", topic: "tmap_top_occs", section: "workforce"},
    {title: "Wages", slug: "wages", topic: "wages", section: "workforce"},
    {title: "Opportunities", slug: "opportunities", topic: "wage_geo_rca", section: "workforce"}
  ],
  soc: [
    {title: "Wages", slug: "wages", topic: "wage_by_industry", section: "employment"},
    {title: "Industries", slug: "industries", topic: "top_ind_num_emp", section: "employment"}
  ],
  cip: [
    {title: "Wages", slug: "wages", topic: "top_income", section: "employment"},
    {title: "Occupations", slug: "occupations", topic: "top_occ_num_emp", section: "employment"},
    {title: "Industries", slug: "industries", topic: "top_ind_num_emp", section: "employment"}
  ]
};

class Profile extends Component {

  constructor(props) {

    super(props);

    const {pslug} = props.params;

    const cats = categories[pslug] || [];
    const sidenav = [];
    const sections = (!props.profile.error ? props.profile.sections : []);

    sections
      .slice(2)
      .filter(d => d.type === "Grouping")
      .forEach(s => {
        const sectionCats = cats
          .filter(c => c.section === s.slug && sections.find(ss => ss.slug === c.topic));
        if (sectionCats.length) sidenav.push(sectionCats.map(s => ({title: s.title, slug: `category_${s.slug}`})));
        else sidenav.push([{title: s.title.replace(/<[^>]+>/g, ""), slug: s.slug}]);
      });

    this.state = {
      activeSection: false,
      activeSidenav: false,
      comparisons: [],
      loading: false,
      profile: props.profile,
      showSidenav: false,
      sidenav
    };
    this.scrollBind = this.handleScroll.bind(this);
  }

  getChildContext() {
    const {formatters} = this.context;
    const {variables} = this.state.profile;
    return {
      addComparison: this.addComparison.bind(this),
      formatters,
      onSelector: this.onSelector.bind(this),
      removeComparison: this.removeComparison.bind(this),
      topics: [],
      variables
    };
  }

  addComparison(id) {
    const {pslug} = this.props.params;
    const {comparisons} = this.state;
    this.setState({loading: true});
    axios.get(`/api/profile?slug=${pslug}&id=${id}`)
      .then(resp => {
        const newComparisons = comparisons.concat([resp.data]);
        this.setState({comparisons: newComparisons, loading: false});

        const {router} = this.props;
        const {location} = router;

        const {stripHTML} = this.context.formatters;
        const {profile} = this.state;
        const profiles = [profile].concat(newComparisons);
        const title = stripHTML(profiles.map(d => d.title).join(" & "));
        this.props.updateTitle(title);

        router.push(`${location.basename}${location.pathname}?compare=${id}`);
      });
  }

  removeComparison() {
    this.setState({comparisons: []});
    const {router} = this.props;
    const {location} = router;

    const {stripHTML} = this.context.formatters;
    const {profile} = this.state;
    const title = stripHTML(profile.title);
    this.props.updateTitle(title);

    router.push(`${location.basename}${location.pathname}`);
  }

  componentDidMount() {

    if (!this.state.profile.error) {

      const {stripHTML} = this.context.formatters;
      const {profile} = this.state;
      const {comparisons} = this.state;
      const profiles = [profile].concat(comparisons);
      const title = stripHTML(profiles.map(d => d.title).join(" & "));
      this.props.updateTitle(title);

      window.addEventListener("scroll", this.scrollBind);
      this.scrollBind();
      const {query} = this.props.location;
      if (query.compare) this.addComparison.bind(this)(query.compare);

    }

  }

  componentWillUnmount() {
    this.props.updateTitle(false);
    if (!this.state.profile.error) {
      window.removeEventListener("scroll", this.scrollBind);
    }
  }

  handleScroll() {

    const sections = this.state.profile.sections
      .slice(2)
      .filter(d => d.type === "Grouping");

    const {activeSection, activeSidenav, showSidenav, sidenav} = this.state;
    const navHeight = 85;

    let newActiveSection = false;
    const elem = document.getElementById("about");
    const top = elem ? elem.getBoundingClientRect().top : 1;
    if (top <= navHeight) newActiveSection = "about";
    sections.forEach(section => {
      const elem = document.getElementById(section.slug);
      const top = elem ? elem.getBoundingClientRect().top : 1;
      if (top <= navHeight) newActiveSection = section.slug;
    });

    let newActiveSidenav = false;
    sidenav.forEach(section => {
      section.forEach(category => {
        const elem = document.getElementById(category.slug);
        const top = elem ? elem.getBoundingClientRect().top : 1;
        if (top <= navHeight) newActiveSidenav = category.slug;
      });
    });

    const newShowSidenav = newActiveSection && newActiveSection !== "about" && document.getElementById("keep-exploring").getBoundingClientRect().top > window.innerHeight;

    if (activeSection !== newActiveSection || activeSidenav !== newActiveSidenav || showSidenav !== newShowSidenav) {
      this.setState({
        activeSection: newActiveSection,
        activeSidenav: newActiveSidenav,
        showSidenav: newShowSidenav
      });
    }

  }

  onSelector(name, value, callback) {

    const {profile} = this.state;
    const {id, variables} = profile;
    const {params} = this.props;

    const payload = {variables};
    const url = `/api/profile?profile=${id}&slug=${params.pslug}&id=${params.pid}&${name}=${value}`;

    axios.post(url, payload)
      .then(resp => {
        this.setState({profile: resp.data});
        if (callback) callback();
      });
  }

  render() {

    const {origin, params, similar} = this.props;
    const {profile} = this.state;

    if (profile.error) return <NotFound />;

    const {stripHTML} = this.context.formatters;
    const {pslug} = params;
    const {activeSection, activeSidenav, comparisons, loading, showSidenav, sidenav} = this.state;
    const joiner = ["geo"].includes(pslug) ? "in" : "for";

    const profiles = [profile].concat(comparisons);
    profiles.forEach(d => {
      d.imageURL = `/api/profile/${pslug}/${d.variables.slug}/splash`;
    });

    const GroupingSections = profile.sections.filter(d => d.type === "Grouping");
    const GroupingIndices = GroupingSections.map(s => profile.sections.indexOf(s));
    const topics = [];
    const cats = categories[pslug] || [];

    GroupingSections
      .forEach((s, i) => {
        const arr = [];

        profile.sections
          .slice(GroupingIndices[i] + 1, GroupingIndices[i + 1])
          .forEach(t => {
            const cat = cats.find(c => c.topic === t.slug);
            if (cat) {
              arr.push([
                <h2 id={`category_${cat.slug}`} className="category" key={`category_${cat.slug}`}>
                  <AnchorLink to={`category_${cat.slug}`}>{cat.title}</AnchorLink>
                </h2>
              ]);
            }
            t.section = s.slug;
            const sectionCompares = comparisons.map(c => c.sections.find(ss => ss.id === t.id)).filter(Boolean);
            if (comparisons.length) t.titleCompare = t.title.replace("</p>", ` ${joiner} ${stripHTML(profile.title)}</p>`);
            arr.push(<Topic key={`topic_${t.id}${comparisons.length ? "_orig" : ""}`} contents={t} />);
            sectionCompares
              .forEach((tt, i) => {
                tt.titleCompare = tt.title.replace("</p>", ` ${joiner} ${stripHTML(comparisons[i].title)}</p>`);
                arr.push(<Topic variables={comparisons[i].variables} key={`topic_${tt.id}_comp`} contents={tt} />);
              });
          });
        topics.push(arr);
      });

    const metaTitle = stripHTML(profiles.map(d => d.title).join(" & "));
    const aboutSection = profile.sections.find(s => s.slug === "about");
    const metaDesc = aboutSection.descriptions.length ? stripHTML(aboutSection.descriptions[0].description) : false;

    return (
      <div id="Profile">

        <Helmet>
          <title>{ metaTitle }</title>
          <meta property="og:title" content={ `${metaTitle} | Data USA` } />
          { metaDesc && <meta name="description" content={metaDesc} /> }
          <meta property="og:image" content={ `${origin}${profile.imageURL}` } />
          { metaDesc && <meta property="og:description" content={metaDesc} /> }
        </Helmet>

        <Splash data={profile} comparisons={comparisons} />

        <Section
          data={{
            ...aboutSection,
            title: "About",
            slug: "about",
            image: profile.images[0],
            profileSlug: pslug,
            breadcrumbs: profile.variables.breadcrumbs
          }}
          comparisons={comparisons.length ? [{
            ...comparisons[0].sections.find(s => s.slug === "about"),
            image: comparisons[0].images[0],
            breadcrumbs: comparisons[0].variables.breadcrumbs
          }] : []}
          breadcrumbs={true}
          photo={true}
        />

        { GroupingSections.map((s, i) => {
          const compares = comparisons.map(c => c.sections.filter(d => d.type === "Grouping")[i]);
          return <Section key={i} data={s} comparisons={compares}>
            { topics[i] }
          </Section>;
        }) }

        <SubNav type="scroll" anchor="top" visible={() => {
          if (typeof window === undefined) return false;
          const elem = select("#Splash .profile-sections").node();
          const top = elem.getBoundingClientRect().top;
          return top && top <= 45;
        }}>
          <SectionIcon slug="about" title="About" active={ activeSection === "about" } />
          { GroupingSections.map((s, i) => <SectionIcon key={i} {...s} active={ activeSection === s.slug } />) }
        </SubNav>

        { similar.length && <div id="keep-exploring" className="keep-exploring">
          <h2>Keep Exploring</h2>
          <div className={`tiles ${pslug}`}>
            { similar.map(d => <Tile key={d.slug || d.id} title={d.display || d.name} subtitle={d.hierarchy} image={`/api/profile/${pslug}/${d.id}/thumb`} url={`/profile/${pslug}/${d.slug || d.id}`} />) }
          </div>
        </div> }

        <div className={`sidenav ${showSidenav ? "visible" : ""}`}>
          { sidenav.map((s, i) => <div key={i} className="sidenav-section">
            {s.map(t => <Tooltip position={Position.LEFT} className={`sidenav-circle ${t.slug === activeSidenav ? "active" : ""}`} key={t.slug} content={<span className="sidenav-label">{t.title}</span>}>
              <AnchorLink to={t.slug}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</AnchorLink>
            </Tooltip>)}
          </div>) }
        </div>

        { loading ? <Loading /> : null }

      </div>
    );

  }

}

Profile.childContextTypes = {
  addComparison: PropTypes.func,
  formatters: PropTypes.object,
  onSelector: PropTypes.func,
  removeComparison: PropTypes.func,
  topics: PropTypes.array,
  variables: PropTypes.object
};

Profile.contextTypes = {
  formatters: PropTypes.object
};

Profile.need = [
  fetchData("profile", "/api/profile?slug=<pslug>&id=<pid>"),
  fetchData("similar", "/api/<pslug>/similar/<pid>")
];

export default connect(state => ({
  env: state.env,
  origin: state.location.origin,
  profile: state.data.profile,
  similar: state.data.similar
}), dispatch => ({
  updateTitle: title => dispatch(updateTitle(title))
}))(Profile);
