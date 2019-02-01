import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet";

import {AnchorLink, CanonProfile, fetchData, SubNav} from "@datawheel/canon-core";
import Splash from "toCanon/Splash";
import SectionIcon from "toCanon/SectionIcon";
import Topic from "toCanon/Topic";

import {Tooltip2} from "@blueprintjs/labs";
import axios from "axios";
import {select} from "d3-selection";
import "./index.css";

import Loading from "components/Loading";
import Tile from "components/Tile/Tile";
import Section from "toCanon/Section";

const categories = {
  geo: [
    {title: "Wages", slug: "wages", topic: "income", section: "economy"},
    {title: "Occupations", slug: "occupations", topic: "tmap_occ_num_emp", section: "economy"},
    {title: "Industries", slug: "industries", topic: "tmap_ind_num_emp", section: "economy"},
    {title: "Age", slug: "age", topic: "age_nativity", section: "demographics"},
    {title: "Heritage", slug: "heritage", topic: "global_diversity", section: "demographics"},
    {title: "Military", slug: "military", topic: "veterans", section: "demographics"},
    {title: "Income", slug: "income", topic: "household_income", section: "housing"},
    {title: "Housing", slug: "housing", topic: "property_value", section: "housing"},
    {title: "Transportation", slug: "transportation", topic: "num_vehicles", section: "housing"}
  ],
  university: [
    {title: "Student Expenses", slug: "student_expenses", topic: "tuition", section: "costs"},
    {title: "Financial Aid", slug: "financial_aid", topic: "incomeawards", section: "costs"},
    {title: "Workforce", slug: "workforce", topic: "jobs", section: "graduates"},
    {title: "Degrees", slug: "degrees", topic: "majors", section: "graduates"},
    {title: "Diversity", slug: "diversity", topic: "rate", section: "graduates"},
    {title: "Finances", slug: "finances", topic: "endowment", section: "operations"},
    {title: "Expenses", slug: "expenses", topic: "expenses", section: "operations"},
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
    props.profile.sections.forEach(s => {
      const sectionCats = cats.filter(c => c.section === s.slug);
      if (sectionCats.length) sidenav.push(sectionCats.map(s => ({title: s.title, slug: `category_${s.slug}`})));
      else sidenav.push([{title: s.title.replace(/<[^>]+>/g, ""), slug: s.slug}]);
    });

    this.state = {
      activeSection: false,
      activeSidenav: false,
      comparisons: [],
      loading: false,
      showSidenav: false,
      sidenav
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

  render() {

    const {stripHTML} = this.context.formatters;
    const {origin, params, profile, similar} = this.props;
    const {pslug} = params;
    const {activeSection, activeSidenav, comparisons, loading, showSidenav, sidenav} = this.state;
    const joiner = ["geo"].includes(pslug) ? "in" : "for";

    const profiles = [profile].concat(comparisons);
    profiles.forEach(d => {
      d.imageURL = `/api/profile/${pslug}/${d.id}/splash`;
    });

    const topics = [];
    const cats = categories[pslug] || [];
    profile.sections
      .forEach(s => {
        const arr = [];
        const sectionCompares = comparisons.map(c => c.sections.find(ss => ss.id === s.id)).filter(Boolean);
        s.topics.forEach(t => {
          const cat = cats.find(c => c.topic === t.slug);
          if (cat) {
            arr.push([
              <h2 id={`category_${cat.slug}`} className="category" key={`category_${cat.slug}`}>
                <AnchorLink to={`category_${cat.slug}`}>{cat.title}</AnchorLink>
              </h2>
            ]);
          }
          if (comparisons.length) t.titleCompare = t.title.replace("</p>", ` ${joiner} ${stripHTML(profile.title)}</p>`);
          arr.push(<Topic key={`topic_${t.id}${comparisons.length ? "_orig" : ""}`} contents={t} />);
          sectionCompares
            .map(ss => ss.topics.find(tt => tt.id === t.id))
            .forEach(tt => {
              tt.titleCompare = tt.title.replace("</p>", ` ${joiner} ${stripHTML(comparisons[0].title)}</p>`);
              arr.push(<Topic variables={comparisons[0].variables} key={`topic_${tt.id}_comp`} contents={tt} />);
            });
        });
        topics.push(arr);
      });

    const metaTitle = stripHTML(profiles.map(d => d.title).join(" & "));
    const metaDesc = stripHTML(profile.descriptions[0].description);

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
        { similar.length && <div id="keep-exploring" className="keep-exploring">
          <h2>Keep Exploring</h2>
          <div className="tiles">
            { similar.map(d => <Tile key={d.id} title={d.display || d.name} subtitle={d.hierarchy} image={`/api/profile/${profile.slug}/${d.id}/thumb`} url={`/profile/${profile.slug}/${d.slug || d.id}`} />) }
          </div>
        </div> }
        <div className={`sidenav ${showSidenav ? "visible" : ""}`}>
          { sidenav.map((s, i) => <div key={i} className="sidenav-section">
            {s.map(t => <Tooltip2 className={`sidenav-circle ${t.slug === activeSidenav ? "active" : ""}`} key={t.slug} content={<span className="sidenav-label">{t.title}</span>}>
              <AnchorLink to={t.slug}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</AnchorLink>
            </Tooltip2>)}
          </div>) }
        </div>
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
