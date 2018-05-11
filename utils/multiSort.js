module.exports = function(data, keys, sort = "desc") {
  return data.sort((a, b) => {
    let comparitor = 0;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let aV = a[key], bV = b[key];
      if (aV !== bV) {
        if (!isNaN(parseFloat(aV))) aV = parseFloat(aV);
        if (!isNaN(parseFloat(bV))) bV = parseFloat(bV);
        comparitor = typeof aV === "string"
          ? sort === "desc" ?  bV.localeCompare(aV) : aV.localeCompare(bV)
          : sort === "desc" ?  bV - aV : aV - bV;
        break;
      }
    }
    return comparitor;
  });
};
