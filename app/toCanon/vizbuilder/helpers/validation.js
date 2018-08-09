import {SYMBOLS as OPERATOR_SYMBOLS} from "./operators";

/**
 * Checks if an object can be used as a Condition
 * @param {object} condition An object to check
 */
export function isValidCondition(condition) {
  return isValidFilter(condition) || isValidCut(condition);
}

/**
 * Checks if an object can be used as a filter-type Condition.
 * This means it should have a numeric value, and a valid operator.
 * Since `values` should always be an Array, the numeric value must be on index 0.
 * @param {object} condition An object to check
 */
export function isValidFilter(condition) {
  return (
    condition.type === "filter" &&
    !isNaN(condition.values[0]) &&
    OPERATOR_SYMBOLS[condition.operator]
  );
}

/**
 * Checks if an object can be used as a cut-type Condition.
 * This means it should have at least 1 element in its values.
 * @param {object} condition An object to check
 */
export function isValidCut(condition) {
  return condition.type === "cut" && condition.values.length > 0;
}
