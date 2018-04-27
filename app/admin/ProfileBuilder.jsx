import axios from "axios";
import React, {Component} from "react";
import {NonIdealState, Tree} from "@blueprintjs/core";
import ProfileEditor from "./ProfileEditor";
import SectionEditor from "./SectionEditor";
import TopicEditor from "./TopicEditor";
import PropTypes from "prop-types";
import CtxMenu from "./CtxMenu";

import "./ProfileBuilder.css";

class ProfileBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: null,
      profiles: null,
      currentNode: null
    };
  }

  /*getChildContext() {
    const {variables} = this.statecurr;
    return {variables};
  }*/

  componentDidMount() {
    axios.get("/api/internalprofile/all").then(resp => {
      const profiles = resp.data;
      this.setState({profiles}, this.buildNodes.bind(this));
    });
  }

  buildNodes() {
    const {profiles} = this.state;
    const {stripHTML} = this.context.formatters;
    let nodes = profiles.map(p => ({
      id: `profile${p.id}`,
      hasCaret: true,
      label: p.slug,
      itemType: "profile",
      parent: {childNodes: []},
      data: p,
      childNodes: p.sections.map(s => ({
        id: `section${s.id}`,
        hasCaret: true,
        label: stripHTML(s.title),
        itemType: "section",
        data: s,
        childNodes: s.topics.map(t => ({
          id: `topic${t.id}`,
          hasCaret: false,
          label: stripHTML(t.title),
          itemType: "topic",
          data: t
        }))
      }))
    }));
    const parent = {childNodes: nodes};
    nodes = nodes.map(p => ({...p,
      parent,
      childNodes: p.childNodes.map(s => ({...s,
        parent: p,
        childNodes: s.childNodes.map(t => ({...t,
          parent: s
        }))
      })
      )}));
    this.setState({nodes});
  }

  moveItem(n, dir) {
    console.log("move", n, dir);
  }

  addItem(n, dir) {
    console.log("add", n, dir);
  }

  deleteItem(n) {
    console.log("delete", n);
  }

  handleNodeClick(node) {
    const {currentNode} = this.state;
    if (!currentNode) {
      node.isSelected = true;
      node.secondaryLabel = <CtxMenu node={node} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.deleteItem.bind(this)} />;
    }
    else if (node.id !== currentNode.id) {
      node.isSelected = true;
      currentNode.isSelected = false;
      node.secondaryLabel = <CtxMenu node={node} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.deleteItem.bind(this)} />;
      currentNode.secondaryLabel = null;
    }
    if (this.props.setPath) this.props.setPath(node);
    this.setState({currentNode: node});
  }

  handleNodeCollapse(node) {
    node.isExpanded = false;
    this.setState({nodes: this.state.nodes});
  }

  handleNodeExpand(node) {
    node.isExpanded = true;
    this.setState({nodes: this.state.nodes});
  }

  // If a save occurs in any of the editors, the user may have changed a slug. Though this changes the underlying data,
  // it does not change the blueprint Tree Object's label.  This hard-coded nested map refreshes all the labels based on the data.
  updateLabels() {
    const {nodes} = this.state;
    const {stripHTML} = this.context.formatters;
    nodes.map(p => {
      p.label = p.data.slug;
      if (p.childNodes) {
        p.childNodes.map(s => {
          s.label = stripHTML(s.data.title);
          if (s.childNodes) {
            s.childNodes.map(t => {
              t.label = stripHTML(t.data.title);
              return t;
            });
          }
          return s;
        });
      }
      return p;
    });
    this.setState({nodes});
  }

  reportSave() {
    this.updateLabels();
  }

  render() {

    const {nodes, currentNode} = this.state;

    if (!nodes) return <div>Loading</div>;

    return (
      <div id="profile-builder">
        <div id="tree">
          <Tree
            onNodeClick={this.handleNodeClick.bind(this)}
            onNodeCollapse={this.handleNodeCollapse.bind(this)}
            onNodeExpand={this.handleNodeExpand.bind(this)}
            contents={nodes}

          />
        </div>
        <div id="item-editor">
          { currentNode
            ? currentNode.itemType === "profile"
              ? <ProfileEditor rawData={currentNode.data} reportSave={this.reportSave.bind(this)} />
              : currentNode.itemType === "section"
                ? <SectionEditor rawData={currentNode.data} reportSave={this.reportSave.bind(this)}/>
                : currentNode.itemType === "topic"
                  ? <TopicEditor data={currentNode.data} reportSave={this.reportSave.bind(this)}/>
                  : null
            : <NonIdealState title="No Profile Selected" description="Please select a Profile from the menu on the left." visual="path-search" />
          }
        </div>

      </div>
    );
  }
}

ProfileBuilder.contextTypes = {
  formatters: PropTypes.object
};

export default ProfileBuilder;
