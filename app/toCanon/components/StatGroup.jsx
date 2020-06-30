import React, {Component} from "react";
import "./StatGroup.css";

const sanitize = html => html
  .replace(/<p>/g, "").replace(/<\/p>/g, "")
  .replace(/\±/g, "<span class='plus-minus'>±</span>");

export default class StatGroup extends Component {

  render() {
    const {stats, title} = this.props;

    return <div className={ `StatGroup ${stats.length > 1 ? "multi" : "single"}` }>
      { title && stats.length > 1 && <div className="stat-title" dangerouslySetInnerHTML={{__html: sanitize(title)}}></div> }
      { stats.length > 1 && <ol>
        { stats.map((stat, i) => <li key={i}>
          <div className="stat-value" dangerouslySetInnerHTML={{__html: sanitize(stat.value)}}></div>
          <div className="stat-subtitle" dangerouslySetInnerHTML={{__html: sanitize(stat.subtitle)}}></div>
        </li>) }
      </ol> }
      { stats.length === 1 && <div className="stat-value" dangerouslySetInnerHTML={{__html: sanitize(stats[0].value)}}></div> }
      { title && stats.length === 1 && <div className="stat-title" dangerouslySetInnerHTML={{__html: sanitize(title)}}></div> }
      { stats.length === 1 && <div className="stat-subtitle" dangerouslySetInnerHTML={{__html: sanitize(stats[0].subtitle)}}></div> }
    </div>;
  }

}
