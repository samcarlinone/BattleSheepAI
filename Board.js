class Hex {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;

    this.links = Array(6).fill(null);
    this.count = 0;
    this.color = null;
  }
}

class Board {
  constructor() {
    this.x = new Range();
    this.y = new Range();

    this.hexes = [ new Hex() ];
    this.columns = [[ this.hexes[0] ]];

    this._safe = true; // Enable / disable potentially performance degrading safety checks
  }

  _hexPos = (x, y) => {
    if (!this.x.contains(x) || !this.y.contains(y))
      return null;

    if (x % 2 === 0) {
      return { x: x - this.x.min, y: y - this.y.min };
    }
    else {
      return { x: x - this.x.min, y: Math.floor(y - this.y.min) };
    }
  }

  _checkCoords = (x, y) => {
    if (x % 2 === 0) {
      if (y % 1 !== 0)
        throw "Y-Coordinate must be an integer for even rows!";
    } else {
      if (y % 1 === 0)
        throw "Y-Coordinate must be fractional for odd rows!";
    }
  }

  /** Add a new hex at the provided position and return it */
  AddHex = (x, y) => {
    // Ensure proper coordinates
    if (this._safe)
      this._checkCoords(x, y);

    // Make space for new hex if necessary
    while (y - 0.5 < this.y.min) {
      this.columns.forEach(column => column.unshift(null));
      this.y.extend(-1);
    }

    while (this.y.max < y + 0.5) {
      this.columns.forEach(column => column.push(null));
      this.y.extend(1);
    }

    while (x < this.x.min) {
      this.columns.unshift(new Array(this.y.count()).fill(null));
      this.x.extend(-1);
    }

    while (this.x.max < x) {
      this.columns.push(new Array(this.y.count()).fill(null));
      this.x.extend(1);
    }

    // Place the hex
    let pos = this._hexPos(x, y);

    // Don't allow duplicate placements
    if (this.columns[pos.x][pos.y] != null)
      return this.columns[pos.x][pos.y];

    let hex = new Hex(x, y);
    this.hexes.push(hex);
    this.columns[pos.x][pos.y] = hex;

    // Connect the hex to its neighbors
    for (let i = 0; i < 6; i++) {
      let oHex = this.GetHex(x + Coords.offsets[i][0], y + Coords.offsets[i][1]);

      if (oHex === null)
        continue;

      // Links are arranged in same order as hex directions / offsets
      hex.links[i] = oHex;
      // The other hex has the link on the opposite side
      oHex.links[(i + 3) % 6] = hex;
    }

    return hex;
  }

  /** Gets the hex at specified coordinates or null */
  GetHex = (x, y) => {
    // Ensure proper coordinates
    if (this._safe)
      this._checkCoords(x, y);

    let pos = this._hexPos(x, y);
    return pos === null ? null : this.columns[pos.x][pos.y];
  }

  /** Starting at next hex, returns last empty hex (or null if none exists) */
  Trace = (x, y, dir) => {
    // Get start hex
    let hex = this.GetHex(x, y);

    // Follow links
    while (hex.links[dir] !== null && hex.links[dir].color === null)
      hex = hex.links[dir];

    if (hex.x === x && hex.y === y)
      return null;
    else
      return hex;
  }
}