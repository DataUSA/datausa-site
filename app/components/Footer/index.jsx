import React, {Component} from "react";
import {Link} from "react-router";
import "./index.css";

export default class Footer extends Component {

  render() {

    return <footer id="Footer">
      <div className="footer-content">
        <div className="footer-links">
          <img src="/images/logo_sm.png" alt="Data USA" />
          <p>Explore, map, compare, and download U.S. data</p>
          <div className="footer-column">
            <div><h4><Link to="/">Home</Link></h4></div>
            <div><h4><Link to="/search/">Reports</Link></h4></div>
            <div><h4><Link to="/visualize">VizBuilder</Link></h4></div>
            <div><h4><Link to="/map/">Maps</Link></h4></div>
            <div><h4><Link to="/about/background">About</Link></h4></div>
          </div>
        </div>
        <div className="footer-contact">
            <form action="//datawheel.us12.list-manage.com/subscribe/post?u=458059cf58ada1fd2b7de3e39&amp;id=9a3f9a9f32" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate="">
              <div id="mc_embed_signup_scroll">
                <div className="input-container">
                  <input type="email" defaultValue="" name="EMAIL" className="email" id="mce-EMAIL" placeholder="RECEIVE UPDATES ON NEWS, DATASETS, AND FEATURES?" required="" />
                  <span className="bp3-icon bp3-icon-envelope"></span>
                  <input type="submit" defaultValue="Sign Up" name="subscribe" id="mc-embedded-subscribe" className="email-btn" />
                </div>
                <div style={{position: "absolute", left: "-5000px"}} aria-hidden="true">
                  <input type="text" name="b_458059cf58ada1fd2b7de3e39_9a3f9a9f32" tabIndex="-1" defaultValue="" />
                </div>
              </div>
            </form>
          </div>
      </div>
      <div className="footer-logos">
        <a target="_blank" rel="noopener noreferrer" href="http://www2.deloitte.com/us/en.html">
          <img id="deloitte" src="/images/footer/deloitte.png" />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/">
          <img id="datawheel" src="/images/footer/datawheel.png" />
        </a>
      </div>
    </footer>;
  }

}
