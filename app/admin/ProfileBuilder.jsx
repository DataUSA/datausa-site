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
      currentNode: null,
      variables: []
    };
  }

  componentDidMount() {
    axios.get("/api/cms/tree").then(resp => {
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

  saveNode(node) {
    axios.post(`/api/cms/${node.itemType}/update`, node.data).then(resp => {
      resp.status === 200 ? console.log("saved") : console.log("error");
    });
  }

  moveItem(n, dir) {
    console.log("move", n, dir);
  }

  addItem(n, dir) {
    const {nodes} = this.state;
    const arr = n.parent.childNodes;
    let loc = n.data.ordering;
    if (dir === "above") {
      for (const node of arr) {
        if (node.data.ordering >= n.data.ordering) {
          node.data.ordering++;
          this.saveNode(node);
        }
      }
    }
    if (dir === "below") {
      loc++;
      for (const node of arr) {
        if (node.data.ordering >= n.data.ordering + 1) {
          node.data.ordering++;
          this.saveNode(node);
        }
      }
    }
    const objTopic = {
      hasCaret: false,
      label: "new-topic-slug",
      itemType: "topic",
      parent: n.parent,
      data: {
        title: "New Topic Title",
        subtitle: "New Topic Subtitle",
        slug: "new-topic-slug",
        description: "New Topic Description",
        section_id: n.data.section_id,
        type: "TextViz",
        ordering: loc
      }
    };
    const objSection = {
      hasCaret: true,
      label: "new-section-slug",
      itemType: "section",
      parent: n.parent,
      data: {
        title: "New Section Title",
        slug: "new-section-slug",
        description: "New Section Description",
        profile_id: n.data.profile_id,
        ordering: loc
      }
    };
    const objProfile = {
      hasCaret: true,
      label: "new-profile-slug",
      itemType: "profile",
      parent: n.parent,
      data: {
        title: "New Profile Title",
        subtitle: "New Profile Subtitle",
        slug: "new-profile-slug",
        description: "New Profile Description",
        label: "New Profile Label",
        ordering: loc
      }
    };

    let obj = null;

    if (n.itemType === "topic") {
      obj = objTopic;
    }
    if (n.itemType === "section") {
      obj = objSection;
      objTopic.data.ordering = 0;
      objTopic.parent = obj;
      obj.childNodes = [objTopic];
    }
    if (n.itemType === "profile") {
      obj = objProfile;
      objSection.data.ordering = 0;
      objSection.parent = obj;
      objTopic.data.ordering = 0;
      objTopic.parent = objSection;
      objSection.childNodes = [objTopic];
      obj.childNodes = [objSection];
    }
    if (obj) {
      
      const profilePath = "/api/cms/profile/new";
      const sectionPath = "/api/cms/section/new";
      const topicPath = "/api/cms/topic/new";

      if (n.itemType === "topic") {
        axios.post(topicPath, obj.data).then(profile => {
          if (profile.status === 200) {
            obj.id = `topic${profile.data.id}`;
            console.log("saved topic");
            arr.push(obj);
            arr.sort((a, b) => a.data.ordering - b.data.ordering);
            this.setState({nodes}, this.handleNodeClick.bind(this, obj));
            
          }
          else {
            console.log("topic error");
          }
        });
      } 
      else if (n.itemType === "section") {
        axios.post(sectionPath, obj.data).then(section => {
          obj.id = `section${section.data.id}`;
          objTopic.data.section_id = section.data.id;
          axios.post(topicPath, objTopic.data).then(topic => {
            if (topic.status === 200) {
              objTopic.id = `topic${topic.data.id}`;
              console.log("saved section");
              arr.push(obj);
              arr.sort((a, b) => a.data.ordering - b.data.ordering);
              this.setState({nodes}, this.handleNodeClick.bind(this, obj));
            }
            else {
              console.log("section error");
            }
          });
        });
      }
      else if (n.itemType === "profile") {
        axios.post(profilePath, obj.data).then(profile => {
          obj.id = `profile${profile.data.id}`;
          objSection.data.profile_id = profile.data.id;
          axios.post(sectionPath, objSection.data).then(section => {
            objSection.id = section.data.id;
            objTopic.data.section_id = section.data.id;
            axios.post(topicPath, objTopic.data).then(topic => {
              if (topic.status === 200) {
                objTopic.id = `topic${topic.data.id}`;
                // WHY DOESNT THIS WORK DAVE
                arr.push(obj);
                arr.sort((a, b) => a.data.ordering - b.data.ordering);
                this.setState({nodes}, this.handleNodeClick.bind(this, obj));
              }
              else {
                console.log("profile error");
              }              
            });
          });
        });
      }
    }
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

  refreshVariables(variables) {
    this.setState({variables});
  }

  render() {

    const {nodes, currentNode, variables} = this.state;

    if (!nodes) return <div>Loading</div>;

    // console.log("updated nodes to", nodes[0].childNodes);

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
              ? <ProfileEditor id={currentNode.data.id} refreshVariables={this.refreshVariables.bind(this)} reportSave={this.reportSave.bind(this)} />
              : currentNode.itemType === "section"
                ? <SectionEditor id={currentNode.data.id} variables={variables} reportSave={this.reportSave.bind(this)}/>
                : currentNode.itemType === "topic"
                  ? <TopicEditor id={currentNode.data.id} variables={variables} reportSave={this.reportSave.bind(this)}/>
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
