import React, {Component} from "react";
import PropTypes from "prop-types";
import {select} from "d3-selection";
import {AnchorLink} from "datawheel-canon";
import styles from "style.yml";
const navHeight = parseInt(styles["nav-height"], 10) * 2;

import "./SideNav.css";

class SideNav extends Component {

  constructor() {
    super();
    this.state = {
      activeSection: false,
      activeTopic: false,
      top: false,
      topics: [],
      visible: navHeight
    };
    this.scrollBind = this.handleScroll.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", this.scrollBind);
    const parent = select(this.container.parentNode);
    let topic;
    const topics = [];
    parent.selectAll("h2[id], h3[id]")
      .each(function() {
        const slug = this.id, title = select(this).select("a").text() || select(this).select("a img").attr("alt");
        if (this.tagName.toLowerCase() === "h2") {
          topic = {sections: [], slug, title};
          topics.push(topic);
        }
        else {
          topic.sections.push({slug, title});
        }
      });
    this.setState({
      activeTopic: topics[0].slug,
      top: this.container.getBoundingClientRect().top + window.scrollY,
      topics
    });
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollBind);
  }

  handleScroll() {

    clearTimeout(this.scrollTimeout);
    const scrollY = window.scrollY;

    this.scrollTimeout = setTimeout(() => {
      if (scrollY === window.scrollY) {
        const {activeSection, activeTopic, topics, visible} = this.state;

        const newVisible = window.scrollY + navHeight;

        let newActiveSection = false, newActiveTopic = false;
        topics.forEach(topic => {
          const elem = document.getElementById(topic.slug);
          const top = elem ? elem.getBoundingClientRect().top : 1;
          if (top <= 1) newActiveTopic = topic;
        });

        if (newActiveTopic) {
          (newActiveTopic.sections || []).forEach(section => {
            const elem = document.getElementById(section.slug);
            const top = elem ? elem.getBoundingClientRect().top : 1;
            if (top <= 1) newActiveSection = section.slug;
          });
          newActiveTopic = newActiveTopic.slug;
        }

        if (visible !== newVisible || activeTopic !== newActiveTopic || activeSection !== newActiveSection) {
          // TODO: I couldn't figure out how to update the hash without causing a snap-to-section
          // const newHash = newActiveSection || newActiveTopic,
          //       oldHash = this.context.location.hash.slice(1);
          // if (newHash !== oldHash) browserHistory.push(`${this.context.location.pathname}#${newHash}`);
          this.setState({
            visible: newVisible,
            activeSection: newActiveSection,
            activeTopic: newActiveTopic
          });
        }
      }
    }, 10);

  }

  render() {

    const {activeSection, activeTopic, topics, visible} = this.state;

    return (
      <div ref={ comp => this.container = comp } id="SideNav" className={ visible > navHeight ? "active" : "" }>
        <div className="content">
          <h1>{ this.props.children }</h1>
          { topics.length
            ? <ul>
              { topics.map(topic => <li key={topic.slug} className={ activeTopic === topic.slug ? "active" : "" }><AnchorLink to={ topic.slug }>{ topic.title }</AnchorLink>
                { topic.sections && topic.sections.length
                  ? <ul>{ topic.sections.map((section, i) => <li key={i} className={ activeSection === section.slug ? "active" : "" }>
                    <AnchorLink to={ section.slug }>
                      <span className="pt-icon-standard pt-icon-dot"></span>
                      { section.title }
                    </AnchorLink>
                  </li>) }
                  </ul>
                  : null }
              </li>) }
            </ul>
            : null}
        </div>
      </div>
    );
  }
}

SideNav.contextTypes = {
  location: PropTypes.object
};

export default SideNav;
