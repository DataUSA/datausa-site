import React, {Component} from "react";
import {Link} from "react-router";
import "./index.css";

export default class Footer extends Component {

  render() {

    return <footer id="Footer">
      <div className="footer-content">
        <div className="footer-links">
          <img id="datausa" src="/images/logo_sm.png" alt="Data USA" />
          <p>Explore, map, compare, and download U.S. data</p>
          <div className="footer-column">
            <div className="link-column"><Link to="/">Home</Link></div>
            <div className="link-column"><Link to="/search/">Reports</Link></div>
            {/* <div className="link-column"><Link to="/visualize">VizBuilder</Link></div>
            <div className="link-column"><Link to="/map/">Maps</Link></div> */}
            <div className="link-column"><Link to="/about/background">About</Link></div>
          </div>
        </div>
        <div className="footer-contact">
            <p className="contact-label">Have Questions or Feedback?</p>
            <p className="contact-email">
              Contact us at <a href="mailto:hello@datausa.io?subject=Data%20USA%20Feedback">hello@datausa.io</a>
            </p>
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
