const deepClone = o => {
  const output = Array.isArray(o) ? [] : {};
  for (const key in o) {
    if (o.hasOwnProperty(key)) {
      output[key] = typeof o[key] === "object" ? deepClone(o[key]) : o[key];
    }
  }
  return output;
};

module.exports = deepClone;
