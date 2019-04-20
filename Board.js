class Hex {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;

    this.links = Array(6).fill(null);
    this.count = 0;
    this.color = null;
  }
}

class Move {
  constructor(dir, take, x, y) {
    this.dir = dir;
    this.take = take;
    this.x = x;
    this.y = y;
  }
}

class Board {
  constructor() {
    this.x = new Range();
    this.y = new Range();

    this.hexes = [ new Hex() ];
    this.columns = [[ this.hexes[0] ]];

    this.moves = [];

    this._safe = true; // Enable / disable potentially performance degrading safety checks
  }

  /** Gets the board internal state */
  GetData = () => {
    return { hexes: this.hexes }
  }

  /** Sets the board internal state */
  SetData = data => {
    for (let h of data.hexes) {
      let hex = this.AddHex(h.x, h.y);
      hex.color = h.color;
      hex.count = h.count;
    }
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

  /** Checks whether the passed hex is not null and uncolored */
  IsOpen = (hex) => {
    return hex !== null && hex.color === null;
  }

  /** Starting at next hex, returns last empty hex (or null if none exists) */
  Trace = (x, y, dir) => {
    // Get start hex
    let hex = this.GetHex(x, y);

    // Follow links
    while (this.IsOpen(hex.links[dir]))
      hex = hex.links[dir];

    // Return null if we didn't make it out of the starting node
    if (hex.x === x && hex.y === y)
      return null;
    else
      return hex;
  }

  /** Does a given hex have a place it can move to? */
  CanMove = hex => {
    if (hex.color === null || hex.count === 1)
      return false;

    for (let i = 0; i < 6; i++) {
      let move = hex.links[i];

      if (move !== null && (move.color === null || move.color === white))
        return true;
    }

    return false;
  }

  /** Does the given color have any hexes with an available move (returns hex) */
  HasMoves = color => {
    return this.hexes.find(hex => hex.color === color && this.CanMove(hex));
  }

  /** Get the direction from one hex to another (or null if not on the same line) */
  GetDirection = (from, to) => {
    let x = to.x - from.x;
    let y = to.y - from.y;

    if (x === 0) {
      // Straight up or down
      return y > 0 ? Coords.S : Coords.N;
    } else {
      // In a line?
      if (Math.abs(x / y) === 2) {
        if (x < 0) {
          // To the left
          return y > 0 ? Coords.SW : Coords.NW;
        }
        else {
          // To the right
          return y > 0 ? Coords.SE : Coords.NE;
        }
      }
    }

    return null;
  }

  /** Check whether a move is valid */
  IsValid = (move) => {
    let start = this.GetHex(move.x, move.y);

    // Does start exist, is it colored?
    if (start === null || start.color === null)
      return false;

    // Are we taking / leaving at least 1?
    if (!(move.take >= 1 && start.count - move.take >= 1))
      return false;

    // Is there a valid space (only need one)?
    if (!this.IsOpen(start.links[move.dir]))
      return false;

    return true;
  }

  /** Executes a given move on the board
   * @returns whether the move could be executed */
  Execute = (move) => {
    if (!this.IsValid(move))
      return false;

    // Remember this
    this.moves.push(move);

    // Actually move
    let start = this.GetHex(move.x, move.y);
    let end = this.Trace(move.x, move.y, move.dir);

    start.count -= move.take;
    end.count += move.take;

    end.color = start.color;

    return true;
  }

  /** Undoes a given move (moves must be undone in correct order, this method shouldn't be used externally) */
  _Undo = (move) => {
    let start = this.GetHex(move.x, move.y);
    // Since trace gives us the first emtpy or null, we get that and then go one further
    let beforeEnd = this.Trace(move.x, move.y, move.dir) || start;
    let end = beforeEnd.links[move.dir];

    start.count += move.take;
    end.count -= move.take;

    end.color = null;
  }

  /** Undo a given number of moves */
  Revert = (numToUndo) => {
    for (let i = 0; i < numToUndo; i++)
      this._Undo(this.moves.pop());
  }

  /** Gets all the points in the range */
  GetPoints = (margin) => {
    let result = [];

    for (let x = this.x.min - margin; x <= this.x.max + margin; x++) {
      if (x % 2 == 0) {
        for (let y = this.y.min - margin; y <= this.y.max + margin; y++)
          result.push([x, y]);
      }
      else {
        for (let y = this.y.min - margin - 0.5; y <= this.y.max + margin + 0.5; y++)
          result.push([x, y]);
      }
    }

    return result;
  }
}