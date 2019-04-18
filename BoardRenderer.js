class BoardRenderer {
  constructor(main, draw, margin) {
    this.main = main;
    this.draw = draw;
    this.margin = margin;

    this.nullHexes = this.draw.group();
    this.hexes = this.draw.group();
  }

  /** Render the board, available listeners at: https://svgjs.com/docs/2.7/events/, listener this = [pos] */
  Render = (board, skip = false, listeners = {}) => {
    this.main.viewbox(...this.GetViewbox(board));
    let points = board.GetPoints(this.margin);

    // Clear old
    this.nullHexes.remove();
    this.hexes.remove();
    this.nullHexes = this.draw.group();
    this.hexes = this.draw.group();

    let hex = this.draw.polygon(HexLine)
      .remove();

    for (let i = 0; i < points.length; i++) {
      let source = board.GetHex(...points[i]);
      let pos = Coords.toCartesian(...points[i]);

      if (skip && !source)
        continue;

      let newHex = hex
        .clone()
        .center(...pos)
        .addClass(source ? 'hex' : 'hex no-hex');

      Object.entries(listeners).forEach(listener => newHex.on(...listener, points[i]))

      if (source) {
        this.hexes.add(newHex);

        // Color?
        if (source.color) {
          this.draw.circle(0.7).addClass(source.color + '-circle').center(...pos).remove().addTo(this.hexes);
          this.draw.plain(source.count+'').addClass('hex-label').center(...pos).remove().addTo(this.hexes);
        }
      }
      else
        this.nullHexes.add(newHex)
    }
  }

  /** Gets the smallest viewbox that can contain the Board */
  GetViewbox = (board) => {
    return [board.x.min - this.margin, board.y.min - this.margin, board.x.count() + 2 * this.margin, board.y.count() + 2 * this.margin];
  }
}