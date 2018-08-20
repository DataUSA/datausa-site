import {Client} from "mondrian-rest-client";
import {queryBuilder, queryConverter} from "./query";
import {getIncludedMembers} from "./sorting";

/**
 * @typedef QueryResults
 * @prop {object[]} dataset The dataset for the current query
 * @prop {object} members An object with the list of current member names for the current drilldowns. Is the output of the `getIncludedMembers` function.
 */

/** @type {Client} */
let client;

/** @type {string} */
let lastPath;

/** @type {Promise<QueryResults>} */
let lastQuery;

/**
 * Resets the client object used site-wide with a new URL.
 * @param {string} src The URL for the mondrian server.
 * @returns {void}
 */
export function resetClient(src) {
  client = new Client(src);
}

/**
 * Returns a Promise that resolves to an array with all the
 * cubes available in the current mondrian server.
 * @returns {Promise<Cube[]>}
 */
export function cubes() {
  return client.cubes();
}

/**
 * Returns a Promise that resolves to an array with all the
 * members available for a certain level element.
 * Each member has all their internal properties.
 * @param {Level} level A mondrian-rest-client Level element
 * @returns {Promise<Member[]>}
 */
export function members(level) {
  return client.members(level);
}

/**
 * Returns a Promise that resolves to the results of the current query
 * for the mondrian server.
 * @param {object} params The `query` element from the Vizbuilder's state.
 * @returns {Promise<QueryResults>}
 */
export function query(params) {
  if (!params.cube) {
    throw new Error("Invalid query: No 'cube' property defined.");
  }

  const query = queryBuilder(params.cube.query, queryConverter(params));

  const newPath = query.path();
  if (newPath !== lastPath) {
    lastPath = newPath;
    lastQuery = client
      .query(query, params.format || "jsonrecords")
      .then(result => {
        const dataset = (result.data || {}).data || [];
        const members = getIncludedMembers(query, dataset);
        return {dataset, members};
      });
  }

  return Promise.resolve(lastQuery);
}
