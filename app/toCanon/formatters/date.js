import {timeFormat} from "d3-time-format";
import {date as dateParse} from "d3plus-axis";

export default date => {
  if (typeof date === "string") date = dateParse(date);
  return timeFormat("%B %d, %Y")(date);
};
