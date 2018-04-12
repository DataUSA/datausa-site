export default list => list.reduce((str, item, i) => {
  if (!i) str += item;
  else if (i === list.length - 1 && i === 1) str += ` and ${item}`;
  else if (i === list.length - 1) str += `, and ${item}`;
  else str += `, ${item}`;
  return str;
}, "");
