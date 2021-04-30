import React, {Component} from "react";
import Anchor from "components/Anchor";
import SideNav from "components/SideNav";

export default class Usage extends Component {

  render() {

    return (
      <div id="Usage">
        <SideNav>Terms<br />of Use</SideNav>
        <div className="content">
          <h2 id="usage">
            <Anchor slug="usage">License</Anchor>
          </h2>
          <p>
            Data USA is an aggregate visualization engine with public datasets from many different sources including those from official US departments as well as educational institutions. We encourage the use of the site as a means of informational and educational purposes. All of the content on the site is presented under a <a href="http://www.gnu.org/licenses/agpl-3.0.txt" target="_blank" rel="noopener noreferrer">GNU Affero General Public License v3.0 (GPLv3)</a>.
          </p>
          <h2 id="content">
            <Anchor slug="content">Content Usage</Anchor>
          </h2>
          <p>
            You can copy, download or print content for your own use, and you can also include excerpts from Data USA, databases and multimedia products in your own documents, presentations, blogs, websites and teaching materials, provided that suitable acknowledgment of Data USA as source is given.
          </p>
          <p>
            All requests for commercial use and translation rights should be submitted to <a href="mailto:hello@datausa.io">hello@datausa.io</a>.
          </p>
          <h2 id="disclaimers">
            <Anchor slug="disclaimers">Disclaimers</Anchor>
          </h2>
          <p>
            <b>Information on this site is provided on an &#34;as is&#34; and &#34;as available&#34; basis.</b> Data USA makes every effort to ensure, but does not guarantee, the accuracy or completeness of the information on the Data USA website(s). Our goal is to keep this information timely and accurate. If errors are brought to our attention, we will try to correct them.
          </p>
          <p>
            Data USA may add, change, improve, or update the information of the website without notice. Data USA reserves its exclusive right in its sole discretion to alter, limit or discontinue part of this site. Under no circumstances shall Data USA be liable for any loss, damage, liability or expense suffered which is claimed to result from use of this site, including without limitation, any fault, error, omission, interruption or delay. Use of this site is at User&#39;s sole risk.
          </p>
          <p>
            We make every effort to minimize disruption caused by technical errors. However some data or information on Data USA website(s) may have been created or structured in files or formats which are not error-free and we cannot guarantee that our service will not be interrupted or otherwise affected by such problems. Data USA accepts no responsibility with regards to such problems (failure of performance, computer virus, communication line failure, alteration of content, etc.) incurred as a result of using Data USA website(s) or any link to external sites.
          </p>
          <p>
            The User specifically acknowledges and agrees that Data USA is not liable for any conduct of any other User, including, but not limited to, the types of conduct listed above.
          </p>
          <p>
            Data USA reserves the right to deny at its sole discretion any User access to Data USA website(s) or any portion thereof without notice.
          </p>
          <p>
            For site security purpose and to ensure that Data USA website(s) remain(s) available to all users, it (they) employ(s) software programs to monitor network traffic to identify unauthorised attempts to upload or change information, or otherwise cause damage and to detect other possible security breaches.
          </p>
        </div>
      </div>
    );

  }

}
