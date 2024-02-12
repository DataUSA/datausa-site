import React, {Component} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Helmet} from "react-helmet-async";
import {fetchData} from "@datawheel/canon-core";

import prepareProfile from "@datawheel/canon-cms/src/utils/prepareProfile";

import "./Embed.css";

import Topic from "toCanon/Topic";

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

class Embed extends Component {

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
    const {variables} = this.props.profile;
    return {
      formatters,
      onSelector: this.onSelector.bind(this),
      variables
    };
  }

  onSelector(name, value, isComparison, callback) {

    const {comparisons, profile, selectors} = this.state;
    const {formatters} = this.context;
    const {locale, router} = this.props;

    const comparison = comparisons.length ? comparisons[0] : false;

    selectors[`${isComparison ? "compare_" : ""}${name}`] = value;
    const split = splitComparisonKeys(selectors);

    const {variables} = profile;
    const newProfile = prepareProfile(variables._rawProfile, variables, formatters, locale, split.profile);
    newProfile.sections = newProfile.sections.filter(d => d.slug === router.params.tslug);
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

  render() {

    const {formatters} = this.context;
    const {stripHTML} = formatters;
    const {profile} = this.state;
    const {origin, router} = this.props;
    const {title, variables} = profile;
    const name = variables.nameLower || variables.name;
    const {slug, id} = router.params;

    const joiner = profile.variables.Dimension === "Geography" ? "in" : "for";
    const metaTitle = `${stripHTML(title)} ${joiner} ${name}`;
    const metaDesc = profile.sections[0].descriptions.length ? stripHTML(profile.sections[0].descriptions[0].description) : false;

    return <div id="Embed">
      <Helmet>
        <title>{ metaTitle }</title>
        <meta property="og:title" content={ metaTitle } />
        { metaDesc ? <meta name="description" content={ metaDesc } /> : null }
        <meta property="og:image" content={ `${origin}/api/profile/${slug}/${id}/splash` } />
        { metaDesc ? <meta property="og:description" content={ metaDesc } /> : null }
      </Helmet>
      <Topic contents={profile.sections[0]} />
    </div>;

  }

}

Embed.childContextTypes = {
  formatters: PropTypes.object,
  onSelector: PropTypes.func,
  variables: PropTypes.object
};

Embed.contextTypes = {
  formatters: PropTypes.object
};

Embed.need = [
  fetchData("profile", "/api/profile?slug=<slug>&id=<id>&section=<tslug>")
];

export default connect(state => ({
  profile: state.data.profile,
  origin: state.location.origin
}))(Embed);
