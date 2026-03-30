const axios = require("axios");

/**
 * Normalizes CANON_CONST_TESSERACT to a base URL whose path ends with .../tesseract/
 * (same pattern as cache/*.js and api/crosswalks.js).
 */
function tesseractRoot() {
  const raw = (process.env.CANON_CONST_TESSERACT || "").trim();
  if (!raw) return "";
  const noTrail = raw.replace(/\/+$/, "");
  if (/\/tesseract$/i.test(noTrail)) {
    return `${noTrail}/`;
  }
  return `${noTrail}/tesseract/`;
}

function forwardHeaders(req) {
  const headers = {};
  const pass = ["accept", "content-type", "authorization", "x-tesseract-jwt-token"];
  pass.forEach(name => {
    const v = req.get(name);
    if (v) headers[name] = v;
  });
  return headers;
}

/**
 * Opening a URL in the browser tab sends Accept: text/html,...; Tesseract/Kona often returns 400
 * for JSON APIs in that case. Use JSON-friendly Accept toward upstream unless the client already asks for JSON.
 */
function headersForTesseractUpstream(req) {
  const headers = forwardHeaders(req);
  const accept = (req.get("accept") || "").trim();
  const first = accept.split(",")[0].trim().toLowerCase();
  const wantsJson = first.includes("application/json") || first === "*/*";
  if (!accept || first.startsWith("text/html") || !wantsJson) {
    headers.accept = "application/json, text/plain, */*";
  }
  return headers;
}

function incomingRequestUrl(req) {
  const host = req.get("host") || "localhost";
  const proto = req.protocol || "http";
  let path = req.originalUrl || req.url || "";
  try {
    path = decodeURI(path);
  }
  catch (e) {
    /* keep raw */
  }
  return `${proto}://${host}${path}`;
}

/** Query string exactly as on the incoming URL (after `?`), without Express re-encoding. */
function rawIncomingQueryString(req) {
  const src = req.originalUrl || req.url || "";
  const i = src.indexOf("?");
  return i === -1 ? "" : src.slice(i + 1);
}

function outboundUrlWithQuery(pathNoQuery, query) {
  if (!query || typeof query !== "object" || !Object.keys(query).length) {
    return pathNoQuery;
  }
  const usp = new URLSearchParams();
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined) continue;
    if (Array.isArray(val)) {
      val.forEach(v => {
        if (v !== undefined && v !== null) usp.append(key, String(v));
      });
    }
    else if (val !== null) {
      usp.append(key, String(val));
    }
  }
  const q = usp.toString();
  return q ? `${pathNoQuery}?${q}` : pathNoQuery;
}

function cloneExpressQuery(q) {
  if (!q || typeof q !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(q)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/**
 * PHP-style `drilldowns[]=…&measures[]=…` often arrive as literal keys `drilldowns[]` on req.query
 * (or only the bracket form is set). Map them to `drilldowns` / `measures` for the proxy logic.
 */
function normalizeExpressQueryForProxy(q) {
  const out = cloneExpressQuery(q);
  const bracketToPlain = [
    ["drilldowns[]", "drilldowns"],
    ["measures[]", "measures"],
    ["measure[]", "measure"],
    ["cube[]", "cube"],
    ["locale[]", "locale"]
  ];
  for (const [bracketKey, plainKey] of bracketToPlain) {
    if (out[bracketKey] !== undefined && out[plainKey] === undefined) {
      out[plainKey] = out[bracketKey];
      delete out[bracketKey];
    }
  }
  return out;
}

/**
 * University.University.Carnegie+Parent → Carnegie+Parent (last dot segment per comma-separated drilldown).
 */
function collapseDrilldownHierarchy(dd) {
  const raw = Array.isArray(dd) ? dd.join(",") : String(dd == null ? "" : dd);
  return raw
    .split(",")
    .map(part => {
      const t = part.trim();
      if (!t) return "";
      if (!t.includes(".")) return t;
      const bits = t.split(".");
      return bits[bits.length - 1];
    })
    .filter(Boolean)
    .join(",");
}

/**
 * Kona treats `+` in query strings as space (x-www-form-urlencoded). Clients and hierarchies often use
 * `Carnegie+Parent` to mean "Carnegie Parent". Axios/URLSearchParams encode a literal plus as `%2B`, which
 * Kona decodes as a real `+` and then rejects as an unknown level. Normalize plus to spaces so encoding
 * produces `+` only as the space substitute (axios 200; `%2B` was 400).
 */
function normalizeDrilldownPlusAsSpace(params) {
  if (!params || params.drilldowns == null || params.drilldowns === "") return;
  const dd = params.drilldowns;
  const raw = Array.isArray(dd) ? dd.join(",") : String(dd);
  params.drilldowns = raw
    .split(",")
    .map(part => part.trim().replace(/\+/g, " "))
    .filter(Boolean)
    .join(",");
}

const CUBES_AGGREGATE_JSONRECORDS = /^cubes\/([^/]+)\/aggregate\.jsonrecords$/;

/**
 * IN:  .../cubes/ipeds_completions/aggregate.jsonrecords?drilldowns=University.University.Carnegie+Parent&measures=Completions
 * OUT: .../tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Carnegie+Parent&locale=en&measures=Completions
 * (drilldown value is sent as "Carnegie Parent" then encoded; see normalizeDrilldownPlusAsSpace.)
 */
function mapAggregateJsonrecordsToDataPath(pathSuffix, query) {
  const m = pathSuffix.replace(/^\//, "").match(CUBES_AGGREGATE_JSONRECORDS);
  if (!m) return null;
  const cube = m[1];
  const params = cloneExpressQuery(query);
  params.cube = cube;
  if (params.drilldowns != null && params.drilldowns !== "") {
    params.drilldowns = collapseDrilldownHierarchy(params.drilldowns);
  }
  if (params.locale == null || params.locale === "") {
    params.locale = "en";
  }
  ensureMeasuresQueryParam(params);
  return {pathSuffix: "data.jsonrecords", params};
}

/**
 * Tesseract `data.jsonrecords` expects `measures`; clients often send `measure`.
 * Avoids `{ error: true, detail: "... query.measures ... Field required ..." }`.
 */
function ensureMeasuresQueryParam(params) {
  if (!params || typeof params !== "object") return;
  const missingMeasures = params.measures == null || params.measures === "";
  const hasMeasure = params.measure != null && params.measure !== "";
  if (missingMeasures && hasMeasure) {
    params.measures = params.measure;
  }
}

/** Olap-client expects `{ data: [...] }`; some Tesseract responses use `{ members: [...] }`. */
function rewriteMembersTopLevelKey(payload) {
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }
  if (!Object.prototype.hasOwnProperty.call(payload, "members")) {
    return payload;
  }
  const next = {...payload};
  next.data = next.members;
  delete next.members;
  return next;
}

/**
 * Tesseract branch of olap-client maps each row with `memberAdapterFactory2`: it reads `json.ID` and
 * `json.Label` (or `${locale} Label`). Kona / logiclayer often returns `key` + `caption` instead, so
 * `key` stays undefined on Member and populateSearch's `data[member.key]` never matches aggregate IDs.
 */
function normalizeMemberJsonrecordsRowsForOlapClient(payload) {
  if (payload == null || typeof payload !== "object" || Array.isArray(payload)) {
    return payload;
  }
  const rows = payload.data;
  if (!Array.isArray(rows)) {
    return payload;
  }
  const next = {...payload};
  next.data = rows.map(row => {
    if (row == null || typeof row !== "object" || Array.isArray(row)) {
      return row;
    }
    const copy = {...row};
    if (copy.ID == null && copy.id != null) {
      copy.ID = copy.id;
    }
    if (copy.ID == null && copy.key != null) {
      copy.ID = copy.key;
    }
    if (copy.Label == null && copy.label != null) {
      copy.Label = copy.label;
    }
    if (copy.Label == null && copy.caption != null) {
      copy.Label = copy.caption;
    }
    if (copy.Label == null && typeof copy.name === "string" && copy.name !== "") {
      copy.Label = copy.name;
    }
    return copy;
  });
  return next;
}

module.exports = function(app) {

  function logProxyInOut(req, urlFull) {
    console.log(`[tesseract-proxy] in:  ${incomingRequestUrl(req)}`);
    console.log(`[tesseract-proxy] out: ${urlFull}`);
  }

  function logProxyError(req, urlFull, reason) {
    console.error(`[tesseract-proxy] === ERROR: ${reason} ===`);
    console.error(`[tesseract-proxy] in:  ${incomingRequestUrl(req)}`);
    console.error(`[tesseract-proxy] out: ${urlFull}`);
  }

  async function proxyToTesseract(req, res, upstreamPath, options = {}) {
    const incomingPathOnly = (req.originalUrl || req.url || "").split("?")[0];
    // Olap-client may request relations.jsonrecords; Kona may not expose it — stub avoids upstream errors.
    if (/\/relations\.jsonrecords$/.test(incomingPathOnly)) {
      res.status(200).json([]);
      return;
    }

    const root = tesseractRoot();
    if (!root) {
      logProxyError(req, "(CANON_CONST_TESSERACT not set — no upstream URL)", "CANON_CONST_TESSERACT is not set");
      res.status(503).json({error: "CANON_CONST_TESSERACT is not set"});
      return;
    }

    let pathSuffix = upstreamPath.replace(/^\//, "");
    const queryNorm = normalizeExpressQueryForProxy(req.query);
    let axiosParams = cloneExpressQuery(queryNorm);
    const mapped = mapAggregateJsonrecordsToDataPath(pathSuffix, queryNorm);
    if (mapped) {
      pathSuffix = mapped.pathSuffix;
      axiosParams = mapped.params;
    }
    else if (pathSuffix === "data.jsonrecords" || /(^|\/)data\.jsonrecords$/.test(pathSuffix)) {
      ensureMeasuresQueryParam(axiosParams);
    }
    if (pathSuffix === "data.jsonrecords" || /(^|\/)data\.jsonrecords$/.test(pathSuffix)) {
      normalizeDrilldownPlusAsSpace(axiosParams);
    }

    const passthroughQuery = options.passthroughQuery === true;
    const rawQs = passthroughQuery ? rawIncomingQueryString(req) : "";
    let url;
    let urlFull;
    if (passthroughQuery) {
      url = rawQs ? `${root}${pathSuffix}?${rawQs}` : `${root}${pathSuffix}`;
      urlFull = url;
      axiosParams = null;
    }
    else {
      url = `${root}${pathSuffix}`;
      urlFull = outboundUrlWithQuery(url, axiosParams);
    }

    logProxyInOut(req, urlFull);

    const method = (req.method || "GET").toLowerCase();

    try {
      const config = {
        method,
        // Same bytes as OUT / pasting in the browser: do not use axios `params` (different serializer than URLSearchParams).
        url: urlFull,
        headers: headersForTesseractUpstream(req),
        validateStatus: () => true
      };

      if (!["get", "head"].includes(method) && req.body !== undefined) {
        config.data = req.body;
      }

      const resp = await axios(config);
      if (resp.status >= 400) {
        logProxyError(req, urlFull, `upstream HTTP ${resp.status}`);
        const body = resp.data;
        const snippet =
          body != null && typeof body === "object"
            ? JSON.stringify(body).slice(0, 800)
            : String(body).slice(0, 800);
        if (snippet) {
          console.error(`[tesseract-proxy] upstream body: ${snippet}`);
        }
      }
      const ct = resp.headers["content-type"];
      if (ct) {
        res.setHeader("Content-Type", ct);
      }

      res.status(resp.status);
      if (typeof resp.data === "object" && resp.data !== null && !Buffer.isBuffer(resp.data)) {
        let payload = resp.data;
        if (options.rewriteMembersResponse) {
          payload = rewriteMembersTopLevelKey(payload);
          payload = normalizeMemberJsonrecordsRowsForOlapClient(payload);
        }
        res.json(payload);
      }
      else {
        res.send(resp.data);
      }
    }
    catch (err) {
      const status = err.response && err.response.status;
      logProxyError(
        req,
        urlFull,
        status ? `axios HTTP ${status}: ${err.message}` : `network / proxy: ${err.message}`
      );
      const msg = err.message || "Proxy error";
      if (status) {
        res.status(status).json({error: msg, upstream: urlFull});
      }
      else {
        res.status(502).json({error: msg, upstream: urlFull});
      }
    }
  }

  app.all("/tesseract-proxy/", (req, res) => {
    proxyToTesseract(req, res, "");
  });

  app.all("/tesseract-proxy", (req, res) => {
    proxyToTesseract(req, res, "");
  });

  app.all("/tesseract-proxy/members.jsonrecords", (req, res) => {
    proxyToTesseract(req, res, "members.jsonrecords", {
      passthroughQuery: true,
      rewriteMembersResponse: true
    });
  });

  /**
   * Any path under /tesseract-proxy/cubes → upstream .../tesseract/cubes/<rest>,
   * except cubes/<cube>/aggregate.jsonrecords → .../tesseract/data.jsonrecords (logiclayer shape; see mapAggregateJsonrecordsToDataPath).
   */
  app.use("/tesseract-proxy/cubes", (req, res) => {
    const pathOnly = (req.url || "/").split("?")[0];
    const clean = pathOnly.replace(/^\/+|\/+$/g, "");
    proxyToTesseract(req, res, clean ? `cubes/${clean}` : "cubes");
  });
};
