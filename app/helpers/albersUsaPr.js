import {geoAlbers, geoConicEqualArea, geoStream} from "d3-geo";

/** */
function noop() {}

let x0 = Infinity,
    x1 = -x0,
    y0 = x0,
    y1 = x1;

const boundsStream = {
  point: boundsPoint,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop,
  result: () => {
    const bounds = [[x0, y0], [x1, y1]];
    x1 = y1 = -(y0 = x0 = Infinity);
    return bounds;
  }
};

/** */
function boundsPoint(x, y) {
  if (x < x0) x0 = x;
  if (x > x1) x1 = x;
  if (y < y0) y0 = y;
  if (y > y1) y1 = y;
}

/** */
function fit(projection, fitBounds, object) {
  const clip = projection.clipExtent && projection.clipExtent();
  projection.scale(150).translate([0, 0]);
  if (clip) projection.clipExtent(null);
  geoStream(object, projection.stream(boundsStream));
  fitBounds(boundsStream.result());
  if (clip) projection.clipExtent(clip);
  return projection;
}

/** modified albers projection to include Puerto Rico */
export default function() {
  const ε = 1e-6;

  const lower48 = geoAlbers();

  const alaska = geoConicEqualArea()
    .rotate([154, 0])
    .center([-2, 58.5])
    .parallels([55, 65]);

  const hawaii = geoConicEqualArea()
    .rotate([157, 0])
    .center([-3, 19.9])
    .parallels([8, 18]);

  const puertoRico = geoConicEqualArea()
    .rotate([66, 0])
    .center([0, 18])
    .parallels([8, 18]);

  let alaskaPoint,
      hawaiiPoint,
      lower48Point,
      point,
      puertoRicoPoint;

  const pointStream = {
    point: (x, y) => {
      point = [x, y];
    }
  };

  /** */
  function albersUsa(coordinates) {
    const x = coordinates[0], y = coordinates[1];
    point = null;
    (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || (hawaiiPoint(x, y), point) || (puertoRicoPoint(x, y), point);
    return point;
  }

  albersUsa.invert = function(coordinates) {
    const k = lower48.scale(),
          t = lower48.translate(),
          x = (coordinates[0] - t[0]) / k,
          y = (coordinates[1] - t[1]) / k;
    return (y >= .120 && y < .234 && x >= -.425 && x < -.214 ? alaska
      : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii
        : y >= .204 && y < .234 && x >= .320 && x < .380 ? puertoRico
          : lower48).invert(coordinates);
  };

  albersUsa.stream = function(stream) {
    const alaskaStream = alaska.stream(stream),
          hawaiiStream = hawaii.stream(stream),
          lower48Stream = lower48.stream(stream),
          puertoRicoStream = puertoRico.stream(stream);
    return {
      point: (x, y) => {
        lower48Stream.point(x, y);
        alaskaStream.point(x, y);
        hawaiiStream.point(x, y);
        puertoRicoStream.point(x, y);
      },
      sphere: () => {
        lower48Stream.sphere();
        alaskaStream.sphere();
        hawaiiStream.sphere();
        puertoRicoStream.sphere();
      },
      lineStart: () => {
        lower48Stream.lineStart();
        alaskaStream.lineStart();
        hawaiiStream.lineStart();
        puertoRicoStream.lineStart();
      },
      lineEnd: () => {
        lower48Stream.lineEnd();
        alaskaStream.lineEnd();
        hawaiiStream.lineEnd();
        puertoRicoStream.lineEnd();
      },
      polygonStart: () => {
        lower48Stream.polygonStart();
        alaskaStream.polygonStart();
        hawaiiStream.polygonStart();
        puertoRicoStream.polygonStart();
      },
      polygonEnd: () => {
        lower48Stream.polygonEnd();
        alaskaStream.polygonEnd();
        hawaiiStream.polygonEnd();
        puertoRicoStream.polygonEnd();
      }
    };
  };

  albersUsa.precision = function(_) {
    if (!arguments.length) return lower48.precision();
    lower48.precision(_);
    alaska.precision(_);
    hawaii.precision(_);
    puertoRico.precision(_);
    return albersUsa;
  };

  albersUsa.scale = function(_) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(_);
    alaska.scale(_ * .35);
    hawaii.scale(_);
    puertoRico.scale(_);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(_) {
    if (!arguments.length) return lower48.translate();
    const k = lower48.scale(), x = +_[0], y = +_[1];

    lower48Point = lower48
      .translate(_)
      .clipExtent([[x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]])
      .stream(pointStream).point;

    alaskaPoint = alaska
      .translate([x - .307 * k, y + .201 * k])
      .clipExtent([[x - .425 * k + ε, y + .120 * k + ε], [x - .214 * k - ε, y + .234 * k - ε]])
      .stream(pointStream).point;

    hawaiiPoint = hawaii
      .translate([x - .205 * k, y + .212 * k])
      .clipExtent([[x - .214 * k + ε, y + .166 * k + ε], [x - .115 * k - ε, y + .234 * k - ε]])
      .stream(pointStream).point;

    puertoRicoPoint = puertoRico
      .translate([x + .350 * k, y + .224 * k])
      .clipExtent([[x + .320 * k, y + .204 * k], [x + .380 * k, y + .234 * k]])
      .stream(pointStream).point;

    return albersUsa;
  };

  albersUsa.fitExtent = function(extent, object) {
    return fit(albersUsa, b => {
      const h = extent[1][1] - extent[0][1],
            w = extent[1][0] - extent[0][0];
      const k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1]));
      const x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2,
            y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
      albersUsa.scale(150 * k).translate([x, y]);
    }, object);
  };

  albersUsa.fitSize = function(size, object) {
    return albersUsa.fitExtent(albersUsa, [[0, 0], size], object);
  };

  albersUsa.fitWidth = function(width, object) {
    return fit(albersUsa, b => {
      const w = +width;
      const k = w / (b[1][0] - b[0][0]);
      const x = (w - k * (b[1][0] + b[0][0])) / 2,
            y = -k * b[0][1];
      albersUsa.scale(150 * k).translate([x, y]);
    }, object);
  };

  albersUsa.fitHeight = function(height, object) {
    return fit(albersUsa, b => {
      const h = +height;
      const k = h / (b[1][1] - b[0][1]);
      const x = -k * b[0][0],
            y = (h - k * (b[1][1] + b[0][1])) / 2;
      albersUsa.scale(150 * k).translate([x, y]);
    }, object);
  };

  return albersUsa.scale(1070);
}
