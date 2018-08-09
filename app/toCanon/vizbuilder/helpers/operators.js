/**
 * These enums are to be used as comparison state for the Conditional elements.
 */

const OPERATORS = {
  UNDEFINED: 0,
  EQUAL: 1,
  LOWER: 2,
  LOWEREQUAL: 3,
  HIGHER: 4,
  HIGHEREQUAL: 5,
  NOTEQUAL: 6,
  CONTAINS: 8
};

export const LABELS = {
  undefined: "Undefined",
  0: "Undefined",
  EQUAL: "Equal to",
  1: "Equal to",
  LOWER: "Lower than",
  2: "Lower than",
  LOWEREQUAL: "Lower than or equal to",
  3: "Lower than or equal to",
  HIGHER: "Higher than",
  4: "Higher than",
  HIGHEREQUAL: "Higher than or equal to",
  5: "Higher than or equal to",
  NOTEQUAL: "Not equal to",
  6: "Not equal to",
  CONTAINS: "Contains the term",
  8: "Contains the term"
};

export const SYMBOLS = {
  UNDEFINED: null,
  0: null,
  EQUAL: "=",
  1: "=",
  LOWER: "<",
  2: "<",
  LOWEREQUAL: "<=",
  3: "<=",
  HIGHER: ">",
  4: ">",
  HIGHEREQUAL: ">=",
  5: ">=",
  NOTEQUAL: "!=",
  6: "!=",
  CONTAINS: null,
  8: null
};

export const KIND_NUMBER = [
  "EQUAL",
  "LOWER",
  "LOWEREQUAL",
  "HIGHER",
  "HIGHEREQUAL",
  "NOTEQUAL"
];

export const KIND_TEXT = ["EQUAL", "NOTEQUAL", "CONTAINS"];

export default OPERATORS;
