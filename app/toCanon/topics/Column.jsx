import React, {Component} from "react";
import PropTypes from "prop-types";
import Viz from "components/Viz/index";
import "./topic.css";

class Column extends Component {

  render() {

    const {router} = this.context;
    const {contents} = this.props;
    const {descriptions, slug, subtitles, title, titleCompare, visualizations} = contents;

    const hideText = router.location.query.viz === "true";

    return <div className={ `topic ${slug} Column` }>
      <div className="topic-content">
        { title &&
          <h3 className="topic-title">
            <a href={ `#${ slug }`} id={ slug } className="anchor" dangerouslySetInnerHTML={{__html: titleCompare || title}}></a>
          </h3>
        }
        { subtitles.map((content, i) => <div key={i} className="topic-subtitle" dangerouslySetInnerHTML={{__html: content.subtitle}} />) }
        { !hideText && descriptions.map((content, i) => <div key={i} className="topic-description" dangerouslySetInnerHTML={{__html: content.description}} />) }
      </div>
      { visualizations.map((visualization, ii) => <Viz topic={contents} config={visualization} key={ii} className="topic-visualization" title={ title } slug={ `${slug}_${ii}` } />) }
    </div>;
  }

}

Column.contextTypes = {
  router: PropTypes.object
};

export default Column;
