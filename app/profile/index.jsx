import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet-async";

import {fetchData} from "@datawheel/canon-core";
import Subnav from "@datawheel/canon-cms/src/components/sections/components/Subnav";
import prepareProfile from "@datawheel/canon-cms/src/utils/prepareProfile";
import Splash from "toCanon/Splash";
import Topic from "toCanon/Topic";

import axios from "axios";
import "./index.css";

import Loading from "components/Loading";
import Tile from "components/Tile/Tile";
import Section from "toCanon/Section";
import {updateTitle} from "actions/title";

import NotFound from "../pages/NotFound/NotFound";

const splitComparisonKeys = obj => {
  const split = {
    profile: {},
    comparison: {}
  };
  Object.keys(obj).forEach(k => {
    split
      [k.startsWith("compare_") ? "comparison" : "profile"]
      [k.replace("compare_", "")] =
    obj[k];
  });
  return split;
};

class Profile extends Component {

  constructor(props) {

    super(props);
    const query = {...props.router.location.query};

    this.state = {
      comparisons: [],
      loading: false,
      profile: props.profile,
      selectors: query
    };
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
    const {slug} = this.props.params;
    const {comparisons} = this.state;
    this.setState({loading: true});
    axios.get(`/api/profile?slug=${slug}&id=${id}`)
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

      const {query} = this.props.location;
      if (query.compare) this.addComparison.bind(this)(query.compare);

    }

  }

  componentWillUnmount() {
    this.props.updateTitle(false);
  }

  updateQuery() {

    const {router} = this.props;
    const {location} = router;
    const {basename, pathname, query} = location;

    const {comparisons, selectors} = this.state;

    const newQuery = {...query, ...selectors};

    if (comparisons.length) newQuery.compare = comparisons[0].dims[0].memberSlug;
    else delete newQuery.compare;

    const queryString = Object.entries(newQuery).map(([key, val]) => `${key}=${val}`).join("&");
    router.replace(`${basename}${pathname}${queryString ? `?${queryString}` : ""}`);

  }

  onSelector(name, value, isComparison, callback) {

    const {comparisons, profile, selectors} = this.state;
    const {formatters} = this.context;
    const {locale} = this.props;

    const comparison = comparisons.length ? comparisons[0] : false;

    selectors[`${isComparison ? "compare_" : ""}${name}`] = value;
    const split = splitComparisonKeys(selectors);

    const {variables} = profile;
    const newProfile = prepareProfile(variables._rawProfile, variables, formatters, locale, split.profile);
    const payload = {selectors, profile: {...profile, ...newProfile}};

    if (comparison) {
      const compVars = comparison.variables;
      const newComp = prepareProfile(compVars._rawProfile, compVars, formatters, locale, split.comparison);
      payload.comparisons = [{...comparison, ...newComp}];
    }

    this.setState(payload, () => {
      if (callback) callback();
      this.updateQuery.bind(this)();
    });

  }

  render() {

    const {origin, params, similar} = this.props;
    const {profile} = this.state;

    if (profile.error) return <NotFound {...profile} />;

    const {stripHTML} = this.context.formatters;
    const {slug} = params;
    const {comparisons, loading} = this.state;
    const joiner = ["geo"].includes(slug) ? "in" : "for";

    const profiles = [profile].concat(comparisons);
    profiles.forEach(d => {
      d.imageURL = `/api/profile/${slug}/${d.variables.slug}/splash`;
    });

    const GroupingSections = profile.sections.filter(d => d.type === "Grouping");
    const GroupingIndices = GroupingSections.map(s => profile.sections.indexOf(s));
    const topics = [];

    GroupingSections
      .forEach((s, i) => {
        const arr = [];

        profile.sections
          .slice(GroupingIndices[i] + 1, GroupingIndices[i + 1])
          .forEach(t => {
            t.section = s.slug;
            const sectionCompares = comparisons.map(c => c.sections.find(ss => ss.id === t.id)).filter(Boolean);
            if (comparisons.length) t.titleCompare = t.title.replace("</p>", ` ${joiner} ${stripHTML(profile.title)}</p>`);
            arr.push(<Topic key={`topic_${t.id}${comparisons.length ? "_orig" : ""}`} contents={t} />);
            sectionCompares
              .forEach((tt, i) => {
                tt.comparison = true;
                tt.titleCompare = tt.title.replace("</p>", ` ${joiner} ${stripHTML(comparisons[i].title)}</p>`);
                arr.push(<Topic variables={comparisons[i].variables} key={`topic_${tt.id}_comp`} contents={tt} />);
              });
          });
        topics.push(arr);
      });

    const metaTitle = stripHTML(profiles.map(d => d.title).join(" & "));
    const aboutSection = profile.sections.find(s => s.slug === "about");
    const metaDesc = aboutSection.descriptions.length ? stripHTML(aboutSection.descriptions[0].description) : false;

    /**
     * The following `groupedSections` logic was taken from the @datawheel/canon-cms
     * ProfileRenderer in order to provide the correct data shape to the SubNav component.
     */
    let {sections} = profile;
    // Find the first instance of a Hero section (excludes all following instances)
    const heroSection = sections.find(l => l.type === "Hero");
    // Remove all heros & modals from sections.
    if (heroSection) sections = sections.filter(l => l.type !== "Hero");
    sections = sections.filter(l => l.position !== "modal");

    // rename old section names
    sections.forEach(l => {
      if (!l.slug) l.slug = `section-${l.id}`;
    });

    let groupedSections = [];

    // make sure there are sections to loop through (issue #700)
    if (sections.length) {

      const groupableSections = ["SingleColumn", "Column"]; // sections to be grouped together
      const innerGroupedSections = []; // array for sections to be accumulated into
      // reduce sections into a nested array of groupedSections
      innerGroupedSections.push(sections.reduce((arr, section) => {
        if (arr.length === 0) arr.push(section); // push the first one
        else {
          const prevType = arr[arr.length - 1].type;
          const currType = section.type;
          // if the current and previous types are groupable and the same type, group them into an array
          if (groupableSections.includes(prevType) && groupableSections.includes(currType) && prevType === currType) {
            arr.push(section);
          }
          // otherwise, push the section as-is
          else {
            innerGroupedSections.push(arr);
            arr = [section];
          }
        }
        return arr;
      }, []));

      groupedSections = innerGroupedSections.reduce((arr, group) => {
        if (arr.length === 0 || group[0].type === "Grouping") arr.push([group]);
        else arr[arr.length - 1].push(group);
        return arr;
      }, []);

    }

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

        <Subnav sections={groupedSections} />

        <Section
          data={{
            ...aboutSection,
            title: "About",
            slug: "about",
            image: profile.images[0],
            profileSlug: slug,
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

        { similar.length && <div id="keep-exploring" className="keep-exploring">
          <h2>Keep Exploring</h2>
          <div className={`tiles ${slug}`}>
            { similar.map(d => <Tile key={d.slug || d.id} title={d.display || d.name} subtitle={d.hierarchy} image={`/api/profile/${slug}/${d.id}/thumb`} url={`/profile/${slug}/${d.slug || d.id}`} />) }
          </div>
        </div> }

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
  fetchData("profile", "/api/profile/?slug=<slug>&id=<id>"),
  fetchData("similar", "/api/<slug>/similar/<id>")
];

export default connect(state => ({
  env: state.env,
  origin: state.location.origin,
  profile: state.data.profile,
  similar: state.data.similar
}), dispatch => ({
  updateTitle: title => dispatch(updateTitle(title))
}))(Profile);
