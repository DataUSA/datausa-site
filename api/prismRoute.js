const v = require("valibot");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const {Country, State} = require("country-state-city");

const EnvSchema = v.object({
  PRISM_JWT_SECRET: v.pipe(v.string(), v.nonEmpty("PRISM_JWT_SECRET is required")),
  PRISM_COOKIE_DAYS: v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1)),
});

const env = v.parse(EnvSchema, process.env);

const RegisterSchema = v.object({
  firstName: v.pipe(v.string(), v.nonEmpty()),
  lastName: v.pipe(v.string(), v.nonEmpty()),
  email: v.pipe(v.string(), v.nonEmpty(), v.email()),
  jobTitle: v.optional(v.string()),
  company: v.pipe(v.string(), v.nonEmpty()),
  country: v.pipe(v.string(), v.nonEmpty()),
  state: v.optional(v.string()),
  reason: v.optional(v.string()),
  otherReason: v.optional(v.string()),
  tellUsMore: v.optional(v.string()),
  consent: v.pipe(v.boolean(), v.literal(true, "consent is required")),
});

const COOKIE_NAME = "prism_token";
const SECRET      = env.PRISM_JWT_SECRET;
const COOKIE_TTL  = env.PRISM_COOKIE_DAYS * 24 * 60 * 60 * 1000;
const JWT_TTL     = `${env.PRISM_COOKIE_DAYS}d`;

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
    req.prismUser = jwt.verify(token, SECRET);
    return next();
  }
  catch {
    return res.status(401).json({ gated: true });
  }
};

module.exports = function(app) {

  app.use("/api/prism", cookieParser());

  app.get("/api/prism/countries", (_req, res) => {
    const countries = Country.getAllCountries().map(c => ({
      value: c.isoCode,
      label: c.name,
    }));
    res.json(countries);
  });

  app.get("/api/prism/states/:countryCode", (req, res) => {
    const states = State.getStatesOfCountry(req.params.countryCode).map(s => ({
      value: s.isoCode,
      label: s.name,
    }));
    res.json(states);
  });

  app.get("/api/prism/status", isPrismVerified, (req, res) => {
    res.json({ verified: true, user_id: req.prismUser.user_id });
  });

  app.post("/api/prism/register", async(req, res) => {
    const result = v.safeParse(RegisterSchema, req.body);

    if (!result.success) {
      return res.status(400).json({
        ok: false,
        error: "validation failed",
        issues: v.flatten(result.issues).nested,
      });
    }

    const {
      firstName, lastName, email, jobTitle, company,
      country, state, reason, otherReason, tellUsMore, consent
    } = result.output;

    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    let submission;
    try {
      submission = await app.settings.db.prism_submission.create({
        firstName, lastName, email, jobTitle, company,
        country, state, reason, otherReason, tellUsMore,
        consent, expiresAt
      });
    }
    catch (err) {
      console.error("[prism] db error", err);
      return res.status(500).json({ ok: false, error: "registration failed" });
    }

    const token = jwt.sign({ email, user_id: submission.id }, SECRET, { expiresIn: JWT_TTL });
    res.cookie(COOKIE_NAME, token, cookieOpts);
    return res.json({ ok: true, user_id: submission.id });
  });

};
