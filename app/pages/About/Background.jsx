import React, {Component} from "react";
import {AnchorLink} from "@datawheel/canon-core";
import "./Background.css";

import Anchor from "components/Anchor";

const videos = [
  "https://www.youtube.com/embed/VJ29nJl-xWw"
  // "https://player.vimeo.com/video/166762095?badge=0&byline=0&portrait=0&title=0"
];

export default class Background extends Component {

  constructor(props) {
    super(props);
    this.state = {video: 0};
  }

  onNext() {
    const {video} = this.state;
    this.setState({video: video === videos.length - 1 ? 0 : video + 1});
  }

  onPrev() {
    const {video} = this.state;
    this.setState({video: video === 0 ? videos.length - 1 : video - 1});
  }

  render() {
    const {video} = this.state;

    return (
      <div id="Background">
        <div className="video-container">
          { videos.map((url, i) => <iframe key={i} className={ `video ${ video === i ? "active" : video > i ? "prev" : "next" }` } src={ url } frameBorder="0" allowFullScreen></iframe>) }
          { videos.length > 1 && <span className="video-prev bp3-icon-large bp3-icon-chevron-left" onClick={this.onPrev.bind(this)}></span> }
          { videos.length > 1 && <span className="video-next bp3-icon-large bp3-icon-chevron-right" onClick={this.onNext.bind(this)}></span> }
        </div>
        <div className="logos">
          <AnchorLink to="about-deloitte"><img src="/images/footer/deloitte_dark.png" /></AnchorLink>
          <AnchorLink to="about-datawheel"><img src="/images/footer/datawheel_dark.png" /></AnchorLink>
        </div>
        <p>
          In 2014, Deloitte, Datawheel, and Cesar Hidalgo, Professor at the MIT Media Lab and Director of Collective Learning, came together to embark on an ambitious journey -- to understand and visualize the critical issues facing the United States in areas like jobs, skills and education across industry and geography. And, to use this knowledge to inform decision making among executives, policymakers and citizens.
        </p>
        <p>
          Our team, comprised of economists, data scientists, designers, researchers and business executives, worked for over a year with input from policymakers, government officials and everyday citizens to develop Data USA, the most comprehensive website and visualization engine of public US Government data. Data USA tells millions of stories about America. Through advanced data analytics and visualization, it tells stories about: places in America—towns, cities and states; occupations, from teachers to welders to web developers; industries--where they are thriving, where they are declining and their interconnectedness to each other; and education and skills, from where is the best place to live if you’re a computer science major to the key skills needed to be an accountant.
        </p>
        <p>
          Data USA puts public US Government data in your hands. Instead of searching through multiple data sources that are often incomplete and difficult to access, you can simply point to Data USA to answer your questions. Data USA provides an open, easy-to-use platform that turns data into knowledge. It allows millions of people to conduct their own analyses and create their own stories about America – its people, places, industries, skill sets and educational institutions. Ultimately, accelerating society’s ability to learn and better understand itself.
        </p>
        <p>
          How can Data USA be useful? If you are an executive, it can help you better understand your customers and talent pool. It can inform decisions on where to open or relocate your business or plant.  You may also want to build on the Data USA platform using the API and integrate additional data. If you are a recent college graduate, Data USA can help you find locations with the greatest opportunities for the job you want and the major you have. If you are a policymaker, Data USA can be a powerful input to economic and workforce development programs. Or, you may be a public health professional and want to dive into behavioral disease patterns across the country. These are just a few examples of how an open data platform like Data USA can benefit everyday citizens, business and government.
        </p>
        <h3 id="about-deloitte"><Anchor slug="about-deloitte">About Deloitte</Anchor></h3>
        <p>
          Deloitte refers to one or more of Deloitte Touche Tohmatsu Limited, a UK private company limited by guarantee (“DTTL”), its network of member firms, and their related entities. DTTL and each of its member firms are legally separate and independent entities. DTTL (also referred to as “Deloitte Global”) does not provide services to clients. Please see <a href="https://www.deloitte.com/about" target="_blank" rel="noopener noreferrer">www.deloitte.com/about</a> for a detailed description of DTTL and its member firms. Please see <a href="https://www.deloitte.com/us/about" target="_blank" rel="noopener noreferrer">www.deloitte.com/us/about</a> for a detailed description of the legal structure of Deloitte LLP and its subsidiaries. Certain services may not be available to attest clients under the rules and regulations of public accounting.
        </p>
        <h3 id="about-datawheel"><Anchor slug="about-datawheel">About Datawheel</Anchor></h3>
        <p>
          Datawheel is a small but mighty crew of programmers and designers with a passion for crafting data into predictive, decision-making, and storytelling tools. Every visualization platform they build is a tailored solution that marries the needs of users and the data supporting it. <a href="http://www.datawheel.us/" target="_blank" rel="noopener noreferrer">Click here</a> to learn more.
        </p>
        <h3>About the Visualizations</h3>
        <p>
          The visualizations in Data USA are powered by <a href="http://d3plus.org/">D3plus</a>, an open-source visualization engine that was created by members of the Datawheel team.
        </p>
      </div>
    );

  }

}
