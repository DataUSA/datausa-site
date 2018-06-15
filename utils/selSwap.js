module.exports = (sourceString, selectors) => {
  selectors.forEach(selector => {
    for (const name in selector) {
      if (selector.hasOwnProperty(name)) {
        const re = new RegExp(`\\[\\[${name}\\]\\]`, "g");
        sourceString = sourceString.replace(re, selector[name]);
      }
    }
  });
  return sourceString;
};
