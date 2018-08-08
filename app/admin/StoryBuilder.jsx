import axios from "axios";
import React, {Component} from "react";
import {NonIdealState, Tree} from "@blueprintjs/core";
import PropTypes from "prop-types";
import CtxMenu from "./CtxMenu";
import StoryEditor from "./StoryEditor";
import StoryTopicEditor from "./StoryTopicEditor";

import stubs from "../../utils/stubs.js";
import deepClone from "../../utils/deepClone.js";

import "./StoryBuilder.css";

const topicIcons = {
  TextViz: "list-detail-view",
  Column: "list"
};

class StoryBuilder extends Component {

  constructor(props) {
    super(props);
    this.state = {
      nodes: null,
      stories: null
    };
  }

  componentDidMount() {
    axios.get("/api/cms/storytree").then(resp => {
      const stories = resp.data;
      this.setState({stories}, this.buildNodes.bind(this));
    });
  }

  /**
   * Decode HTML elements such as &amp;. Taken from:
   * https://stackoverflow.com/questions/3700326/decode-amp-back-to-in-javascript
   */
  decode(str) {
    const elem = document.createElement("textarea");
    elem.innerHTML = str;
    return elem.value;
  }

  buildNodes(openNode) {
    const {stories} = this.state;
    const {stripHTML} = this.context.formatters;
    const nodes = stories.map(s => ({
      id: `story${s.id}`,
      hasCaret: true,
      label: this.decode(stripHTML(s.title)),
      itemType: "story",
      data: s,
      childNodes: s.storytopics.map(t => ({
        id: `storytopic${t.id}`,
        hasCaret: false,
        label: this.decode(stripHTML(t.title)),
        iconName: topicIcons[t.type] || "help",
        itemType: "storytopic",
        data: t
      }))
    }));
    if (!openNode) {
      this.setState({nodes});
    }
    else {
      this.setState({nodes}, this.handleNodeClick.bind(this, nodes[0]));
    }
  }

  saveNode(node) {
    const payload = {id: node.data.id, ordering: node.data.ordering};
    axios.post(`/api/cms/${node.itemType}/update`, payload).then(resp => {
      resp.status === 200 ? console.log("saved") : console.log("error");
    });
  }

  moveItem(n, dir) {
    const {nodes} = this.state;
    const sorter = (a, b) => a.data.ordering - b.data.ordering;
    n = this.locateNode(n.itemType, n.data.id);
    let parentArray;
    if (n.itemType === "storytopic") parentArray = this.locateNode("story", n.data.story_id).childNodes;
    if (n.itemType === "story") parentArray = nodes;
    if (dir === "up") {
      const old = parentArray.find(node => node.data.ordering === n.data.ordering - 1);
      old.data.ordering++;
      n.data.ordering--;
      this.saveNode(old);
      this.saveNode(n);
    }
    if (dir === "down") {
      const old = parentArray.find(node => node.data.ordering === n.data.ordering + 1);
      old.data.ordering--;
      n.data.ordering++;
      this.saveNode(old);
      this.saveNode(n);
    }
    parentArray.sort(sorter);
    this.setState({nodes});
  }

  addItem(n, dir) {
    const {nodes} = this.state;
    n = this.locateNode(n.itemType, n.data.id);
    let parentArray;
    if (n.itemType === "storytopic") {
      parentArray = this.locateNode("story", n.data.story_id).childNodes;
    }
    else if (n.itemType === "story") {
      parentArray = nodes;
    }
    let loc = n.data.ordering;
    if (dir === "above") {
      for (const node of parentArray) {
        if (node.data.ordering >= n.data.ordering) {
          node.data.ordering++;
          this.saveNode(node);
        }
      }
    }
    if (dir === "below") {
      loc++;
      for (const node of parentArray) {
        if (node.data.ordering >= n.data.ordering + 1) {
          node.data.ordering++;
          this.saveNode(node);
        }
      }
    }

    const objStoryTopic = deepClone(stubs.objTopic);
    objStoryTopic.data.story_id = n.data.story_id;
    objStoryTopic.data.ordering = loc;

    const objStory = deepClone(stubs.objStory);
    objStory.data.ordering = loc;

    let obj = null;

    if (n.itemType === "storytopic") {
      obj = objStoryTopic;
    }
    if (n.itemType === "story") {
      obj = objStory;
      objStoryTopic.data.ordering = 0;
      obj.childNodes = [objStoryTopic];
    }

    if (obj) {

      const storyPath = "/api/cms/story/new";
      const storyTopicPath = "/api/cms/storytopic/new";

      if (n.itemType === "storytopic") {
        axios.post(storyTopicPath, obj.data).then(storytopic => {
          if (storytopic.status === 200) {
            obj.id = `storytopic${storytopic.data.id}`;
            obj.data.id = storytopic.data.id;
            const parent = this.locateNode("story", obj.data.story_id);
            parent.childNodes.push(obj);
            parent.childNodes.sort((a, b) => a.data.ordering - b.data.ordering);
            this.setState({nodes}, this.handleNodeClick.bind(this, obj));
          }
          else {
            console.log("storytopic error");
          }
        });
      }
      else if (n.itemType === "story") {
        axios.post(storyPath, obj.data).then(story => {
          obj.id = `story${story.data.id}`;
          obj.data.id = story.data.id;
          objStoryTopic.data.story_id = story.data.id;
          axios.post(objStoryTopic, objStoryTopic.data).then(storyTopic => {
            if (storyTopic.status === 200) {
              objStoryTopic.id = `storytopic${storyTopic.data.id}`;
              objStoryTopic.data.id = storyTopic.data.id;
              nodes.push(obj);
              nodes.sort((a, b) => a.data.ordering - b.data.ordering);
              this.setState({nodes}, this.handleNodeClick.bind(this, obj));
            }
            else {
              console.log("story error");
            }
          });
        });
      }
    }
  }

  deleteItem(n) {
    const {nodes} = this.state;
    const {stripHTML} = this.context.formatters;
    n = this.locateNode(n.itemType, n.data.id);
    // todo: instead of the piecemeal refreshes being done for each of these tiers - is it sufficient to run buildNodes again?
    if (n.itemType === "storytopic") {
      const parent = this.locateNode("story", n.data.story_id);
      axios.delete("/api/cms/storytopic/delete", {params: {id: n.data.id}}).then(resp => {
        const storytopics = resp.data.map(storyTopicData => ({
          id: `storytopic${storyTopicData.id}`,
          hasCaret: false,
          iconName: topicIcons[storyTopicData.type] || "help",
          label: this.decode(stripHTML(storyTopicData.title)),
          itemType: "storytopic",
          data: storyTopicData
        }));
        parent.childNodes = storytopics;
        this.setState({nodes}, this.handleNodeClick.bind(this, parent.childNodes[0]));
      });
    }
    else if (n.itemType === "story") {
      axios.delete("/api/cms/story/delete", {params: {id: n.data.id}}).then(resp => {
        const stories = resp.data;
        this.setState({stories}, this.buildNodes.bind(this, true));
      });
    }
  }

  handleNodeClick(node) {
    node = this.locateNode(node.itemType, node.data.id);
    const {nodes, currentNode} = this.state;
    let parentLength = 0;
    if (node.itemType === "storytopic") parentLength = this.locateNode("story", node.data.story_id).childNodes.length;
    if (node.itemType === "story") parentLength = nodes.length;
    if (!currentNode) {
      node.isSelected = true;
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.deleteItem.bind(this)} />;
    }
    else if (node.id !== currentNode.id) {
      node.isSelected = true;
      currentNode.isSelected = false;
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.deleteItem.bind(this)} />;
      currentNode.secondaryLabel = null;
    }
    // This case is needed becuase, even if the same node is reclicked, its CtxMenu MUST update to reflect the new node (it may no longer be in its old location)
    else if (currentNode && node.id === currentNode.id) {
      node.secondaryLabel = <CtxMenu node={node} parentLength={parentLength} moveItem={this.moveItem.bind(this)} addItem={this.addItem.bind(this)} deleteItem={this.deleteItem.bind(this)} />;
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

  /**
   * Given a node type (story, storytopic) and an id, crawl down the tree and fetch a reference to the Tree node with that id
   */
  locateNode(type, id) {
    const {nodes} = this.state;
    let node = null;
    if (type === "story") {
      node = nodes.find(s => s.data.id === id);
    }
    else if (type === "storytopic") {
      nodes.forEach(s => {
        const attempt = s.childNodes.find(t => t.data.id === id);
        if (attempt) node = attempt;
      });
    }
    return node;
  }

  /**
   * If a save occurred in one of the editors, the user may have changed the title. This callback is responsible for
   * updating the tree labels accordingly. 
   */
  reportSave(type, id, newValue) {
    const {nodes} = this.state;
    const {stripHTML} = this.context.formatters;
    const node = this.locateNode.bind(this)(type, id);
    // Update the label based on the new value. If this is a section or a topic, this is the only thing needed
    if (node) {
      node.data.title = newValue;
      node.label = this.decode(stripHTML(newValue));
    }
    this.setState({nodes});
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
            ? currentNode.itemType === "story"
              ? <StoryEditor
                id={currentNode.data.id}
                reportSave={this.reportSave.bind(this)}
              />
              : currentNode.itemType === "storytopic"
                ? <StoryTopicEditor
                  id={currentNode.data.id}
                  reportSave={this.reportSave.bind(this)}
                />
                : null
            : <NonIdealState title="No Profile Selected" description="Please select a Profile from the menu on the left." visual="path-search" />
          }
        </div>

      </div>
    );
  }
}

StoryBuilder.childContextTypes = {
  formatters: PropTypes.object,
  variables: PropTypes.object
};

StoryBuilder.contextTypes = {
  formatters: PropTypes.object
};

export default StoryBuilder;
