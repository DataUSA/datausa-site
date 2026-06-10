const v = require("valibot");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

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
  country: v.optional(v.string()),
  state: v.optional(v.string()),
  reason: v.optional(v.string()),
  otherReason: v.optional(v.string()),
  tellUsMore: v.optional(v.string()),
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
    jwt.verify(token, SECRET);
    return next();
  }
  catch {
    return res.status(401).json({ gated: true });
  }
};

module.exports = function(app) {

  app.use("/api/prism", cookieParser());

  // TODO: remove this before sending to deployment
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/prism/registrations", async(_req, res) => {
      try {
        const rows = await app.settings.db.prism_submission.findAll({ raw: true });
        return res.json(rows);
      }
      catch (err) {
        console.error("[prism] list error", err);
        return res.status(500).json({ error: "failed to fetch registrations" });
      }
    });
  }

  app.get("/api/prism/status", isPrismVerified, (_req, res) => {
    res.json({ verified: true });
  });

  app.post("/api/prism/register", async(req, res) => {
    const result = v.safeParse(RegisterSchema, req.body);

    if (!result.success) {
      return res.status(400).json({ error: "validation failed", issues: v.flatten(result.issues).nested });
    }

    const {
      firstName, lastName, email, jobTitle, company,
      country, state, reason, otherReason, tellUsMore
    } = result.output;

    try {
      await app.settings.db.prism_submission.create({
        firstName, lastName, email, jobTitle, company,
        country, state, reason, otherReason, tellUsMore
      });
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
