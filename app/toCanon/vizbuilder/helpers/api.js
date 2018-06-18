import {Client} from "mondrian-rest-client";
import {queryBuilder, queryConverter} from "./query";

/** @type {Client} */
let client;
let lastPath, lastQuery;

export function initClient(src) {
  client = new Client(src);
}

export function cubes() {
  return client.cubes();
}

export function members(level) {
  return client.members(level);
}

export function query(params) {
  if (!params.cube) {
    throw new Error("Invalid query: No 'cube' property defined.");
  }

  const query = queryBuilder(params.cube.query, queryConverter(params));

  const newPath = query.path();
  if (newPath !== lastPath) {
    lastPath = newPath;
    lastQuery = client.query(query, params.format || "jsonrecords");
  }

  return Promise.resolve(lastQuery);
}
