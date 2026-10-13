/**
 * Composite Albers USA projection that also places Puerto Rico (and Alaska/Hawaii) in insets.
 * Ported from the legacy `app/helpers/albersUsaPr.js`; used by national Geomaps.
 */
import {geoAlbers, geoConicEqualArea, geoStream, type GeoProjection, type GeoStream} from "d3-geo";

type Point = [number, number];

let x0 = Infinity;
let x1 = -x0;
let y0 = x0;
let y1 = x1;

function noop() {}

function boundsPoint(x: number, y: number) {
  if (x < x0) x0 = x;
  if (x > x1) x1 = x;
  if (y < y0) y0 = y;
  if (y > y1) y1 = y;
}

const boundsStream = {
  point: boundsPoint,
  lineStart: noop,
  lineEnd: noop,
  polygonStart: noop,
  polygonEnd: noop,
  result: (): [Point, Point] => {
    const bounds: [Point, Point] = [[x0, y0], [x1, y1]];
    x1 = y1 = -(y0 = x0 = Infinity);
    return bounds;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fit(projection: any, fitBounds: (b: [Point, Point]) => void, object: any) {
  const clip = projection.clipExtent && projection.clipExtent();
  projection.scale(150).translate([0, 0]);
  if (clip) projection.clipExtent(null);
  geoStream(object, projection.stream(boundsStream as unknown as GeoStream));
  fitBounds(boundsStream.result());
  if (clip) projection.clipExtent(clip);
  return projection;
}

/** Modified Albers projection to include Puerto Rico. */
export function albersUsaPr(): GeoProjection {
  const epsilon = 1e-6;
  const lower48 = geoAlbers();
  const alaska = geoConicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]);
  const hawaii = geoConicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]);
  const puertoRico = geoConicEqualArea().rotate([66, 0]).center([0, 18]).parallels([8, 18]);

  // Each region's point stream. The stream's `point` must be called on the stream (it reads
  // `this.stream`); the legacy helper detached it, which only failed when projecting single points.
  let alaskaPoint: GeoStream;
  let hawaiiPoint: GeoStream;
  let lower48Point: GeoStream;
  let puertoRicoPoint: GeoStream;
  let point: Point | null = null;

  const pointStream = {point: (x: number, y: number) => { point = [x, y]; }} as unknown as GeoStream;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const albersUsa: any = (coordinates: Point) => {
    const x = coordinates[0];
    const y = coordinates[1];
    point = null;
    (lower48Point.point(x, y), point) || (alaskaPoint.point(x, y), point) || (hawaiiPoint.point(x, y), point) || (puertoRicoPoint.point(x, y), point);
    return point;
  };

  albersUsa.invert = (coordinates: Point) => {
    const k = lower48.scale();
    const t = lower48.translate();
    const x = (coordinates[0] - t[0]) / k;
    const y = (coordinates[1] - t[1]) / k;
    return (y >= .120 && y < .234 && x >= -.425 && x < -.214 ? alaska
      : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii
        : y >= .204 && y < .234 && x >= .320 && x < .380 ? puertoRico
          : lower48).invert!(coordinates);
  };

  albersUsa.stream = (stream: GeoStream) => {
    const streams = [lower48.stream(stream), alaska.stream(stream), hawaii.stream(stream), puertoRico.stream(stream)];
    return {
      point: (x: number, y: number) => streams.forEach(s => s.point(x, y)),
      sphere: () => streams.forEach(s => s.sphere?.()),
      lineStart: () => streams.forEach(s => s.lineStart()),
      lineEnd: () => streams.forEach(s => s.lineEnd()),
      polygonStart: () => streams.forEach(s => s.polygonStart()),
      polygonEnd: () => streams.forEach(s => s.polygonEnd())
    };
  };

  albersUsa.precision = (p?: number) => {
    if (p === undefined) return lower48.precision();
    [lower48, alaska, hawaii, puertoRico].forEach(proj => proj.precision(p));
    return albersUsa;
  };

  albersUsa.scale = (s?: number) => {
    if (s === undefined) return lower48.scale();
    lower48.scale(s);
    alaska.scale(s * .35);
    hawaii.scale(s);
    puertoRico.scale(s);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = (t?: Point) => {
    if (t === undefined) return lower48.translate();
    const k = lower48.scale();
    const x = +t[0];
    const y = +t[1];
    lower48Point = lower48.translate(t).clipExtent([[x - .455 * k, y - .238 * k], [x + .455 * k, y + .238 * k]]).stream(pointStream);
    alaskaPoint = alaska.translate([x - .307 * k, y + .201 * k]).clipExtent([[x - .425 * k + epsilon, y + .120 * k + epsilon], [x - .214 * k - epsilon, y + .234 * k - epsilon]]).stream(pointStream);
    hawaiiPoint = hawaii.translate([x - .205 * k, y + .212 * k]).clipExtent([[x - .214 * k + epsilon, y + .166 * k + epsilon], [x - .115 * k - epsilon, y + .234 * k - epsilon]]).stream(pointStream);
    puertoRicoPoint = puertoRico.translate([x + .350 * k, y + .224 * k]).clipExtent([[x + .320 * k, y + .204 * k], [x + .380 * k, y + .234 * k]]).stream(pointStream);
    return albersUsa;
  };

  albersUsa.fitExtent = (extent: [Point, Point], object: unknown) => fit(albersUsa, b => {
    const h = extent[1][1] - extent[0][1];
    const w = extent[1][0] - extent[0][0];
    const k = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1]));
    const x = +extent[0][0] + (w - k * (b[1][0] + b[0][0])) / 2;
    const y = +extent[0][1] + (h - k * (b[1][1] + b[0][1])) / 2;
    albersUsa.scale(150 * k).translate([x, y]);
  }, object);

  albersUsa.fitSize = (size: Point, object: unknown) => albersUsa.fitExtent([[0, 0], size], object);

  albersUsa.fitWidth = (width: number, object: unknown) => fit(albersUsa, b => {
    const w = +width;
    const k = w / (b[1][0] - b[0][0]);
    const x = (w - k * (b[1][0] + b[0][0])) / 2;
    const y = -k * b[0][1];
    albersUsa.scale(150 * k).translate([x, y]);
  }, object);

  albersUsa.fitHeight = (height: number, object: unknown) => fit(albersUsa, b => {
    const h = +height;
    const k = h / (b[1][1] - b[0][1]);
    const x = -k * b[0][0];
    const y = (h - k * (b[1][1] + b[0][1])) / 2;
    albersUsa.scale(150 * k).translate([x, y]);
  }, object);

  return albersUsa.scale(1070) as GeoProjection;
}
