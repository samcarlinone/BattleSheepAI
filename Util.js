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

/** Conversion constant for degrees to radians */
const toRad = Math.PI / 180;

/** Color constants */
const red = 'red';
const blue = 'blue';

/** Coords class for working with coordinate systems */
let Coords = deepFreeze({
   N: 0,
  NE: 1,
  SE: 2,
   S: 3,
  SW: 4,
  NW: 5,
  offsets: [[0, -1], [1, -0.5], [1, 0.5], [0, 1], [-1, 0.5], [-1, -0.5]],
  toCartesian: (x, y) => [x, y * 2 + Math.sin(60 * toRad)],
  toHex: (x, y) => [x, (y - Math.sin(60 * toRad) / 2)]
});

/** Recursively 'freeze' an Object effectively rendering it const */
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