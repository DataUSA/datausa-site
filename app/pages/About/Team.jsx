import React, {Component} from "react";
import {connect} from "react-redux";
import {AnchorLink, fetchData} from "datawheel-canon";
import slugify from "toCanon/slugify";

import Anchor from "components/Anchor";
import SideNav from "components/SideNav";

import "./Team.css";

class Team extends Component {

  render() {
    const {team} = this.props;

    return (
      <div id="Team">
        <SideNav>Team</SideNav>
        <div className="content">
          { team.map((org, i) => <div className="team" key={i}>
            <h2 id={ slugify(org.title) }>
              <AnchorLink to={ slugify(org.title) }>
                <img className="logo" src={ `/images/footer/${ slugify(org.title) }_dark.png` } alt={ org.title } />
              </AnchorLink>
            </h2>
            { org.members.map(member => <div className="member" key={ slugify(member.name) }>
              <img className="avatar" alt={ member.name } src={ member.img ? member.img : "/static/img/story/author.png" } />
              <div className="meta">
                <h3 id={ slugify(member.name) }>
                  <Anchor slug={ slugify(member.name) }>{ member.name }</Anchor>
                </h3>
                <div className="title">{ member.title }</div>
                { member.about.map((p, i) => <p key={i}>{ p }</p>) }
                { member.twitter ? <a className="social" href={ member.twitter } target="_blank" rel="noopener noreferrer">Twitter</a> : null }
              </div>
            </div>)}
          </div>) }
        </div>
      </div>
    );

  }

}

Team.need = [
  fetchData("team", "/api/team")
];

export default connect(state => ({team: state.data.team}))(Team);
