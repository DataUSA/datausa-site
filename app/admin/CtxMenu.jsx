import React, {Component} from "react";
import {Menu, MenuItem, MenuDivider, Popover, Position} from "@blueprintjs/core";

import "./CtxMenu.css";

class CtxMenu extends Component {

  render() {

    const {node} = this.props;

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
        disabled={node.data.ordering === this.props.parentLength - 1}
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
        disabled={this.props.parentLength === 1} />
    </Menu>;

    return (
      <Popover content={menu} position={Position.RIGHT_TOP}>
        <span className="pt-icon-standard pt-icon-cog"></span>
      </Popover>
    );
  }
}

export default CtxMenu;
