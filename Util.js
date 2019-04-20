/** Represents integer range of form [min, max] */ 
class Range {
  constructor(min = 0, max = 0) {
    this.min = min;
    this.max = max;
  }

  /** Moves the range by the given count in the appropriate direction
   * @param {Number} count negative values decrease min, while positive values increase max
   */
  extend = (count) => {
    if (count < 0)
      this.min += count;
    else
      this.max += count;
  }

  /** Counts integers in range [min, max] */
  count = () => {
    // Add 1 because it includes both ends of range, i.e. |[0, 0]| = 1
    return this.max - this.min + 1;
  }

  /** Tests whether the provided number is in the range */
  contains = (n) => {
    return this.min <= n && n <= this.max;
  }
}

/** Color constants */
const red = 'red';
const blue = 'blue';
const white = 'white';

/** Conversion constant for degrees to radians */
const toRad = Math.PI / 180;

const xScale = (1 + Math.cos(60 * toRad)) / 2;
const yScale = Math.sin(60 * toRad);

/** HexLine = hexagon polypoints */
const HexLine = [];

for (let i = 0; i < 360; i += 60) {
  HexLine.push(Math.cos(i * toRad) / 2);
  HexLine.push(Math.sin(i * toRad) / 2);
}

/** Coords class for working with coordinate systems */
const Coords = deepFreeze({
   N: 0,
  NE: 1,
  SE: 2,
   S: 3,
  SW: 4,
  NW: 5,
  offsets: [[0, -1], [1, -0.5], [1, 0.5], [0, 1], [-1, 0.5], [-1, -0.5]],
  // Only transform for odd columns
  toCartesian: (x, y) => [x * xScale, y * yScale],
  toHex: (x, y) => [x / xScale,  y / yScale],
});

/** Vector class for working with array based Vec2s */
const Vector = deepFreeze({
  add: (v1, v2) => [v1[0] + v2[0], v1[1] + v2[1]],
  from: hex => [ hex.x, hex.y ]
});

/** Recursively 'freeze' an Object (effectively rendering it const) */
function deepFreeze(object) {
  // Retrieve the property names defined on object
  var propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self
  for (let name of propNames) {
    let value = object[name];

    object[name] = value && typeof value === "object" ? 
      deepFreeze(value) : value;
  }

  return Object.freeze(object);
}

/** Shuffles an array in place */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}