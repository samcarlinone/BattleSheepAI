class BoardRenderer {
  constructor(main, draw, margin = 0) {
    this.main = main;
    this.draw = draw;
    this.margin = margin;

    this.nullHexes = this.draw.group();
    this.hexes = this.draw.group();
    this.numbers = this.draw.group();
  }

  /** Render the board, available listeners at: https://svgjs.com/docs/2.7/events/, listener this = [pos] */
  Render = (board, skip = false, listeners = {}, highlights = []) => {
    this.main.viewbox(...this.GetViewbox(board));
    let points = board.GetPoints(this.margin);

    // Clear old
    this.nullHexes.remove();
    this.hexes.remove();
    this.numbers.remove();
    this.nullHexes = this.draw.group();
    this.hexes = this.draw.group();
    this.numbers = this.draw.group();

    let hex = this.draw.polygon(HexLine).remove();

    let highlighted = [];

    for (let i = 0; i < points.length; i++) {
      let source = board.GetHex(...points[i]);
      let pos = Coords.toCartesian(...points[i]);

      if (skip && !source)
        continue;

      let newHex = hex
        .clone()
        .center(...pos)
        .addClass(source ? 'hex' : 'hex no-hex');

      // highlights
      let highlight = highlights.find(h => h.point[0] === points[i][0] && h.point[1] === points[i][1]);

      if (highlight) {
        newHex.addClass(highlight.class);
        highlighted.push(newHex);
      }

      // Event listeners
      Object.entries(listeners).forEach(listener => newHex.on(...listener, points[i]));

      if (source) {
        this.hexes.add(newHex);

        // Color?
        if (source.color) {
          let circle = this.draw.circle(0.7).addClass(source.color + '-circle').center(...pos).remove().addTo(this.numbers);
          let label = this.draw.plain(source.count+'').addClass('hex-label').center(...pos).remove().addTo(this.numbers);

          // Event listeners
          Object.entries(listeners).forEach(listener => circle.on(...listener, points[i]));
          Object.entries(listeners).forEach(listener => label.on(...listener, points[i]));
        }
      }
      else
        this.nullHexes.add(newHex)
    }

    for (let hex of highlighted) {
      hex.front();
    }
  }

  /** Gets the smallest viewbox that can contain the Board */
  GetViewbox = (board) => {
    return [board.x.min - this.margin, board.y.min - this.margin, board.x.count() + 2 * this.margin, board.y.count() + 2 * this.margin];
  }
}