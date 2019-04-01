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
  }

  _hexPos = (x, y) => {
    if (!this.x.contains(x))
      return null;

    if (x % 2 === 0) {
      // Even row, all integer coords
      if (!this.y.contains(y))
        return null;

      return { x: x - this.x.min, y: y - this.y.min };
    }
    else {
      // Odd row, y coords are at fractional coords
      if (!this.y.contains(y + Math.sign(y)))
        return null;

      return { x: x - this.x.min, y: Math.floor(y - this.y.min) };
    }
  }

  /** Add a new hex at the provided position and return it */
  AddHex = (x, y) => {
    // Make space for new hex if necessary
    while (y < this.y.min) {
      this.columns.forEach(column => column.unshift(null));
      this.y.extend(-1);
    }

    while (this.y.max < y) {
      this.columns.forEach(column => column.push(null));
      this.y.extend(1);
    }

    while (x < this.x.min) {
      this.columns.unshift(new Array(this.y.count()).fill(null));
      this.x.extend(-1);
    }

    while (this.x.min < x) {
      this.columns.push(new Array(this.y.count()).fill(null));
      this.x.extend(1);
    }

    // Place the hex
    let hex = new Hex(x, y);
    this.hexes.push(hex);

    let pos = this._hexPos(x, y);
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