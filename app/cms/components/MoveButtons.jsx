import axios from "axios";
import React, {Component} from "react";

class MoveButtons extends Component {

  constructor(props) {
    super(props);
    this.state = {
      item: null,
      array: null
    };
  }
  
  componentDidMount() {
    const {item, array} = this.props;
    this.setState({item, array});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.item !== this.props.item || prevProps.array !== this.props.array) {
      this.setState({item: this.props.item, array: this.props.array});
    }
  }

  updateOrdering(item1, item2, type) {
    const {array} = this.state;
    const payload1 = {id: item1.id, ordering: item1.ordering};
    const payload2 = {id: item2.id, ordering: item2.ordering};
    Promise.all([
      axios.post(`/api/cms/${type}/update`, payload1),
      axios.post(`/api/cms/${type}/update`, payload2)
    ]).then(() => {
      this.setState({array: array.sort((a, b) => a.ordering - b.ordering)});
      if (this.props.onMove) this.props.onMove();
    });
  }

  move(dir) {
    const {item, array} = this.state;
    const {type} = this.props;
    const item1 = item;
    if (dir === "left") {
      if (item1.ordering === 0) {
        return;
      }
      else {
        const item2 = array.find(i => i.ordering === item1.ordering - 1);
        item2.ordering = item1.ordering;
        item1.ordering--;
        this.updateOrdering(item1, item2, type);
      }
    }
    else if (dir === "right") {
      if (item1.ordering === array.length - 1) {
        return;
      }
      else {
        const item2 = array.find(i => i.ordering === item1.ordering + 1);
        item2.ordering = item1.ordering;
        item1.ordering++;
        this.updateOrdering(item1, item2, type);
      }
    }
  }

  render() {
    
    const {item, array} = this.state;

    if (!item || !array) return null;

    return (
      <div id="move-buttons">
        {item.ordering > 0 && <button onClick={() => this.move("left")}><span className="pt-icon pt-icon-arrow-left" /></button> }
        {item.ordering < array.length - 1 && <button onClick={() => this.move("right")}><span className="pt-icon pt-icon-arrow-right" /></button> }
      </div>
    );
  }
}

export default MoveButtons;
