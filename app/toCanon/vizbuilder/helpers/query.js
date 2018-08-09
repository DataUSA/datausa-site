import {SYMBOLS as OPERATOR_SYMBOLS} from "./operators";
import {isValidCut, isValidFilter} from "./validation";

/**
 * Converts the params in the current `query` state to a
 * mondrian-rest-client Query object.
 * @param {Query} query A new Query object, obtained from the corresponding Cube.
 * @param {object} params A query params object, ready to be implemented.
 * @returns {Query}
 */
export function queryBuilder(query, params) {
  let i, item;

  item = params.measures.length;
  for (i = 0; i < item; i++) {
    query = query.measure(params.measures[i]);
  }

  item = params.drilldowns.length;
  for (i = 0; i < item; i++) {
    query = query.drilldown(...params.drilldowns[i]);
  }

  for (i = 0; i < params.cuts.length; i++) {
    item = params.cuts[i];
    if (typeof item !== "string") {
      const key = "property" in item ? item.property.fullName : item.key;

      item = item.values.map(v => `${key}.&[${v}]`).join(",");
      if (item.indexOf("],[") > -1) {
        item = `{${item}}`;
      }
    }
    query = query.cut(item);
  }

  item = params.filters.length;
  for (i = 0; i < item; i++) {
    query = query.filter(...params.filters[i]);
  }

  if (params.limit) {
    query = query.pagination(params.limit, params.offset);
  }

  if (params.order) {
    query = query.sorting(params.order, params.orderDesc);
  }

  for (item in params.options) {
    if (params.options.hasOwnProperty(item)) {
      query = query.option(item, params.options[item]);
    }
  }

  return query; // setLangCaptions(query, params.locale);
}

/**
 * Creates a query params object, ready to be converted into a
 * mondrian-rest-client Query object.
 * @param {object} params The current `query` object from the Vizbuilder state.
 * @returns {object}
 */
export function queryConverter(params) {
  const query = {
    measures: [params.measure.name],
    drilldowns: []
      .concat(params.drilldown, params.timeDrilldown)
      .filter(Boolean)
      .map(lvl => lvl.fullName.slice(1, -1).split("].[")),
    cuts: [],
    filters: [],
    limit: undefined,
    offset: undefined,
    order: undefined,
    orderDesc: undefined,
    options: params.options,
    locale: "en"
  };

  if (params.moe) {
    query.measures.push(params.moe.name);
  }

  for (let i = 0; i < params.conditions.length; i++) {
    const condition = params.conditions[i];

    if (!condition.property) {
      continue;
    }

    if (isValidCut(condition)) {
      const cut = {
        key: condition.property.fullName,
        values: condition.values.map(v => v.key)
      };
      query.cuts.push(cut);
    }

    if (isValidFilter(condition)) {
      const filter = [].concat(
        condition.property.name,
        OPERATOR_SYMBOLS[condition.operator],
        condition.values
      );
      query.filters.push(filter);
    }
  }

  return query;
}
