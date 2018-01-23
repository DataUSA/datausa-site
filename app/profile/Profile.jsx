import React, {Component} from "react";
import "./Profile.css";

import Stat from "./Stat";
import SectionIcon from "./SectionIcon";

import Section from "./Section";
import TextViz from "./topics/TextViz";

export default class Profile extends Component {

  render() {

    const profile = {
      title: "Massachusetts",
      subtitle: "State",
      description: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lobortis augue non nisi interdum, eu interdum velit egestas. Proin malesuada orci eget massa suscipit, nec pulvinar elit laoreet. Quisque sodales massa quis justo feugiat, quis dapibus nunc hendrerit.</p><p>Morbi fermentum accumsan est, fermentum rutrum nisi fringilla ac. Proin pharetra sagittis arcu in egestas. Vivamus a vehicula turpis. In hac habitasse platea dictumst. Fusce vel ornare est, non feugiat velit. Nulla volutpat bibendum urna, in egestas magna pharetra non. Sed non tellus sed est eleifend consectetur pretium ut odio.</p><p>Morbi gravida libero a iaculis tincidunt. Cras luctus urna in est placerat, in sodales eros dignissim. Maecenas sit amet urna ac risus ultrices interdum id in metus. Suspendisse ut elit est. Praesent volutpat nisl efficitur porta auctor. Quisque tincidunt lacus eget dolor lobortis volutpat sed eu dui.</p>",
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
          description: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lobortis augue non nisi interdum, eu interdum velit egestas. Proin malesuada orci eget massa suscipit, nec pulvinar elit laoreet. Quisque sodales massa quis justo feugiat, quis dapibus nunc hendrerit.</p><p>Morbi fermentum accumsan est, fermentum rutrum nisi fringilla ac. Proin pharetra sagittis arcu in egestas. Vivamus a vehicula turpis. In hac habitasse platea dictumst. Fusce vel ornare est, non feugiat velit. Nulla volutpat bibendum urna, in egestas magna pharetra non. Sed non tellus sed est eleifend consectetur pretium ut odio.</p><p>Morbi gravida libero a iaculis tincidunt. Cras luctus urna in est placerat, in sodales eros dignissim. Maecenas sit amet urna ac risus ultrices interdum id in metus. Suspendisse ut elit est. Praesent volutpat nisl efficitur porta auctor. Quisque tincidunt lacus eget dolor lobortis volutpat sed eu dui.</p>",
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
              description: "<p>Morbi fermentum accumsan est, fermentum rutrum nisi fringilla ac. Proin pharetra sagittis arcu in egestas. Vivamus a vehicula turpis. In hac habitasse platea dictumst. Fusce vel ornare est, non feugiat velit. Nulla volutpat bibendum urna, in egestas magna pharetra non. Sed non tellus sed est eleifend consectetur pretium ut odio.</p><p>Morbi gravida libero a iaculis tincidunt. Cras luctus urna in est placerat, in sodales eros dignissim. Maecenas sit amet urna ac risus ultrices interdum id in metus. Suspendisse ut elit est. Praesent volutpat nisl efficitur porta auctor. Quisque tincidunt lacus eget dolor lobortis volutpat sed eu dui.</p>",
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
        },
        {
          title: "Health",
          slug: "health",
          description: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla lobortis augue non nisi interdum, eu interdum velit egestas. Proin malesuada orci eget massa suscipit, nec pulvinar elit laoreet. Quisque sodales massa quis justo feugiat, quis dapibus nunc hendrerit.</p><p>Morbi fermentum accumsan est, fermentum rutrum nisi fringilla ac. Proin pharetra sagittis arcu in egestas. Vivamus a vehicula turpis. In hac habitasse platea dictumst. Fusce vel ornare est, non feugiat velit. Nulla volutpat bibendum urna, in egestas magna pharetra non. Sed non tellus sed est eleifend consectetur pretium ut odio.</p><p>Morbi gravida libero a iaculis tincidunt. Cras luctus urna in est placerat, in sodales eros dignissim. Maecenas sit amet urna ac risus ultrices interdum id in metus. Suspendisse ut elit est. Praesent volutpat nisl efficitur porta auctor. Quisque tincidunt lacus eget dolor lobortis volutpat sed eu dui.</p>",
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
          { profile.subtitle ? <div className="profile-subtitle">{ profile.subtitle }</div> : null }
          <div className="profile-stats">
            { profile.stats.map((s, i) => <Stat key={i} data={s} />) }
          </div>
          <div className="profile-sections">
            <SectionIcon slug="about" title="About" />
            { profile.sections.map((s, i) => <SectionIcon key={i} {...s} />) }
          </div>
        </div>
        <Section title="About" description={ profile.description } visualizations={ profile.visualizations } slug="about" />
        { profile.sections.map((s, i) => <Section key={i} {...s}>
          { s.topics.map((t, ii) => <TextViz key={ii} {...t} />) }
        </Section>) }
      </div>
    );

  }

}
