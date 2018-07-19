const axisStyles = {
  barConfig: {
    stroke: "#ccc"
  },
  gridConfig: {
    stroke: "#ccc"
  },
  shapeConfig: {
    labelConfig: {
      fontColor: () => "#211f1a",
      fontFamily: () => "Source Sans Pro",
      fontSize: () => 12,
      fontWeight: () => 400
    },
    stroke: "#ccc"
  },
  tickSize: 5,
  titleConfig: {
    fontColor: () => "#211f1a",
    fontFamily: () => "Palanquin",
    fontSize: () => 12,
    fontWeight: () => 400
  }
};

export default {
  colorScaleConfig: {
    color: "#004374",
    scale: "jenks"
  },
  legendConfig: {
    shapeConfig: {
      labelConfig: {
        fontFamily: () => "Palanquin",
        fontSize: () => 13
      },
      height: () => 25,
      width: () => 25
    }
  },
  messageMask: false,
  messageStyle: {
    "color": "#888",
    "font-family": "'Palanquin', sans-serif",
    "font-size": "16px",
    "font-weight": "300"
  },
  padPixel: 1,
  shapeConfig: {
    fill: "#ef6145",
    labelConfig: {
      fontFamily: () => "Pathway Gothic One",
      fontSize: () => 13,
      padding: 5
    }
  },
  tooltipConfig: {
    background: "white",
    border: "1px solid #888",
    padding: "10px",
    titleStyle: {
      "color": "#888",
      "font-family": "'Palanquin', sans-serif",
      "font-size": "16px",
      "font-weight": "300"
    }
  },
  xConfig: {...axisStyles},
  yConfig: {...axisStyles}
};
