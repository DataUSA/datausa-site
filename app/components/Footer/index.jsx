import React, {Component} from "react";
import {Link} from "react-router";
import "./index.css";

export default class Footer extends Component {

  render() {

    return <footer id="Footer">
      <div className="footer-content">
        <div className="footer-links">
          <ul>
            <h4>Explore</h4>
            <li><Link to="/search/">Profiles</Link></li>
            <li><Link to="/visualize">Viz Builder</Link></li>
            <li><Link to="/map/">Maps</Link></li>
            <li><Link to="/cart/">Data Cart</Link></li>
          </ul>
          <ul>
            <h4>Sources</h4>
            <li><Link to="/about/datasets/">Data Sources</Link></li>
            <li><Link to="/about/api/">API</Link></li>
            <li><Link to="/about/classifications/">Classifications</Link></li>
            <li><a href="mailto:hello@datausa.io">Contact Us</a></li>
          </ul>
          <ul>
            <h4>About</h4>
            <li><Link to="/about/">Background</Link></li>
            <li><Link to="/about/press/">In the Press</Link></li>
            <li><Link to="/about/team/">Team</Link></li>
            <li><Link to="/about/glossary/">Glossary</Link></li>
            <li><Link to="/about/usage/">Terms of Use</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <div className="footer-mailer">
            Receive updates on news, datasets, and features?
            <form action="//datawheel.us12.list-manage.com/subscribe/post?u=458059cf58ada1fd2b7de3e39&amp;id=9a3f9a9f32" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="validate" target="_blank" noValidate="">
              <div id="mc_embed_signup_scroll">
                <div className="input-container">
                  <span className="bp3-icon bp3-icon-envelope"></span>
                  <input type="email" defaultValue="" name="EMAIL" className="email" id="mce-EMAIL" placeholder="your email address" required="" />
                  <input type="submit" defaultValue="Sign Up" name="subscribe" id="mc-embedded-subscribe" className="email-btn" />
                </div>
                <div style={{position: "absolute", left: "-5000px"}} aria-hidden="true">
                  <input type="text" name="b_458059cf58ada1fd2b7de3e39_9a3f9a9f32" tabIndex="-1" defaultValue="" />
                </div>
              </div>
            </form>
          </div>
          <div className="footer-logos">
            <a target="_blank" rel="noopener noreferrer" href="http://www2.deloitte.com/us/en.html">
              <img id="deloitte" src="/images/footer/deloitte.png" />
            </a>
            <a target="_blank" rel="noopener noreferrer" href="http://www.datawheel.us/">
              <img id="datawheel" src="/images/footer/datawheel.png" />
            </a>
          </div>
        </div>
      </div>
    </footer>;
  }

}
