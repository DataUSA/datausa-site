# PrismSection — Code Reference

Supporting code samples for [prism-section.md](./prism-section.md).

---

## Install dependencies

```bash
npm install jsonwebtoken cookie-parser
```

---

## models/prism.js

```js
const Sequelize = require("sequelize");

module.exports = function(db) {
  return db.define("prism_registration", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    name:       { type: Sequelize.STRING, allowNull: false },
    occupation: { type: Sequelize.STRING, allowNull: false },
    org:        { type: Sequelize.STRING, allowNull: true },
    created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
  }, {
    tableName: "prism_registrations",
    timestamps: false
  });
};
```

Register in `canon.js` under the existing `db[0].tables` array:

```js
require("./models/prism")
```

---

## api/prismRoute.js

```js
const jwt          = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const COOKIE_NAME = "prism_token";
const SECRET      = process.env.PRISM_JWT_SECRET;
const COOKIE_TTL  = Number(process.env.PRISM_COOKIE_DAYS) * 24 * 60 * 60 * 1000;
const JWT_TTL     = `${process.env.PRISM_COOKIE_DAYS}d`;

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: COOKIE_TTL
};

const isPrismVerified = (req, res, next) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ gated: true });
  try {
    jwt.verify(token, SECRET);
    return next();
  }
  catch {
    return res.status(401).json({ gated: true });
  }
};

module.exports = function(app) {

  app.use("/api/prism", cookieParser());

  app.get("/api/prism/status", isPrismVerified, (_req, res) => {
    res.json({ verified: true });
  });

  app.post("/api/prism/register", async(req, res) => {
    const { name, email, occupation, org } = req.body;

    if (!name || !email || !occupation) {
      return res.status(400).json({ error: "name, email, and occupation are required" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "invalid email" });
    }

    try {
      await app.settings.db.prism_registration.upsert({ name, email, occupation, org });
    }
    catch (err) {
      console.error("[prism] db error", err);
      return res.status(500).json({ error: "registration failed" });
    }

    const token = jwt.sign({ email }, SECRET, { expiresIn: JWT_TTL });
    res.cookie(COOKIE_NAME, token, cookieOpts);
    return res.json({ ok: true });
  });

};
```

Register in `canon.js`:

```js
app.use(require("./api/prismRoute"));
```

---

## api/profileRoute.js

### Strip PrismSection data from the full payload

```js
function stripPrismData(profile) {
  return {
    ...profile,
    sections: profile.sections.map(section => {
      if (section.type === "PrismSection") {
        const { data, ...shell } = section;
        return shell;
      }
      return section;
    })
  };
}
```

### Gate the single-section fetch

```js
// Inside the profile route handler, before returning section data:
if (section.type === "PrismSection") {
  const token = req.cookies && req.cookies["prism_token"];
  try {
    jwt.verify(token, process.env.PRISM_JWT_SECRET);
  }
  catch {
    return res.status(401).json({ gated: true });
  }
}
```

---

## app/components/PrismSection.jsx

```jsx
import React, { Component } from "react";
import axios from "axios";
import GateForm from "./GateForm";

export default class PrismSection extends Component {

  state = { verified: false, loading: true, data: null };

  componentDidMount() {
    this.checkStatus();
  }

  checkStatus() {
    axios.get("/api/prism/status")
      .then(() => this.fetchData())
      .catch(() => this.setState({ loading: false, verified: false }));
  }

  fetchData() {
    const { slug, profileId, sectionId } = this.props;
    axios.get(`/api/profile/?slug=${slug}&id=${profileId}&section=${sectionId}`)
      .then(resp => this.setState({ verified: true, loading: false, data: resp.data }))
      .catch(() => this.setState({ verified: false, loading: false }));
  }

  handleRegister(formData) {
    return axios.post("/api/prism/register", formData)
      .then(() => this.checkStatus());
  }

  render() {
    const { verified, loading, data } = this.state;
    const { children, title, subtitle } = this.props;

    // Always render the gate on the server
    if (typeof window === "undefined") {
      return <GateForm title={title} subtitle={subtitle} />;
    }

    if (loading) return <div className="prism-loading" />;

    if (!verified) {
      return (
        <GateForm
          title={title}
          subtitle={subtitle}
          onSubmit={formData => this.handleRegister(formData)}
        />
      );
    }

    return typeof children === "function" ? children(data) : children;
  }
}
```
