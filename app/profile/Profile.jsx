import React, {Component} from "react";
import "./Profile.css";

import Stat from "./Stat";
import SectionIcon from "./SectionIcon";

export default class Profile extends Component {

  render() {

    const profile = {
      title: "Massachusetts",
      description: "State",
      introduction: "Welcome to the profile page for Massachusetts.",
      stats: [
        {
          title: "Population",
          value: "8.5M",
          subtitle: "2.4% Growth"
        }
      ],
      visualizations: [
        {
          data: "https://my-long-data-url-that-I-will-provide-as-a-content-creator",
          groupBy: "geo",
          type: "BarChart",
          x: "year",
          y: "pop"
        }
      ],
      variables: {
        name: "Massachusetts",
        pop_2015: 2523647,
        pop_2016: 2234098
      },
      sections: [
        {
          title: "Economy",
          slug: "economy",
          description: "Yo, this be about money.",
          stats: [
            {
              title: "Population",
              value: "8.5M",
              subtitle: "2.4% Growth"
            }
          ],
          topics: [
            {
              title: "Population Over Time",
              slug: "pop_time",
              subtitle: "Warning! This data is not granular!",
              description: "<p>The population in Massachusetts as of 2015 was 2.5M.",
              type: "TextViz",
              visualizations: [
                {
                  data: "https://my-long-data-url-that-I-will-provide-as-a-content-creator",
                  groupBy: "geo",
                  type: "BarChart",
                  x: "year",
                  y: "pop"
                }
              ]
            }
          ]
        }
      ]
    };

    const {pid, pslug} = this.props.params;

    console.log(profile);

    return (
      <div id="Profile">
        <div className="splash">
          <div className="profile-image" style={{backgroundImage: `url("/img/splash/${pslug}/${pid}.jpg")`}}></div>
          <h1 className="profile-title">{ profile.title }</h1>
          { profile.description ? <div className="profile-description">{ profile.description }</div> : null }
          <div className="profile-stats">
            { profile.stats.map((s, i) => <Stat key={i} data={s} />) }
          </div>
          <div className="profile-sections">
            <SectionIcon slug="about" title="About" />
            { profile.sections.map((s, i) => <SectionIcon key={i} slug={s.slug} title={s.title} />) }
          </div>
        </div>
      </div>
    );

  }

}
