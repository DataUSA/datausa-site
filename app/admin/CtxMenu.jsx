import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";
import {Menu, MenuItem, MenuDivider, Popover, Position} from "@blueprintjs/core";

import "./CtxMenu.css";

class CtxMenu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      node: null
    };
  }

  componentDidMount() {
    const node = this.props.node;
    this.setState({node});
  }

  render() {

    const {node} = this.state;

    if (!node) return null;

    const menu = <Menu>
      <MenuItem
        iconName="arrow-up"
        onClick={this.props.moveItem.bind(this, node, "up")}
        text={`Move ${node.itemType} Up`}
        disabled={node.data.ordering === 0}
      />
      <MenuItem
        iconName="arrow-down"
        onClick={this.props.moveItem.bind(this, node, "down")}
        text={`Move ${node.itemType} Down`}
        disabled={node.parent && node.parent.childNodes[node.parent.childNodes.length - 1].data.id === node.data.id}
      />
      <MenuDivider />
      <MenuItem
        iconName="add"
        onClick={this.props.addItem.bind(this, node, "above")}
        text={`Add ${node.itemType} Above`}
      />
      <MenuItem
        iconName="add"
        onClick={this.props.addItem.bind(this, node, "below")}
        text={`Add ${node.itemType} Below`}
      />
      <MenuDivider />
      <MenuItem
        className="pt-intent-danger"
        onClick={this.props.deleteItem.bind(this, node)}
        text={`Delete ${node.itemType}`}
        iconName="delete"
        disabled={node.parent && node.parent.childNodes.length === 1} />
    </Menu>;

    return (
      <Popover content={menu} position={Position.RIGHT}>
        <span className="pt-icon-standard pt-icon-cog"></span>
      </Popover>
    );
  }
}

export default CtxMenu;
