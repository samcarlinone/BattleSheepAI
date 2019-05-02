importScripts('Board.js', 'Util.js');

// Note: this script is only called if blue can make a move
onmessage = function(e) {
  let board = new Board();
  board.SetData(e.data);

  // let blueHex = board.HasMoves(blue);
  // let direction = [0, 1, 2, 3, 4, 5].find(n => blueHex.links[n] !== null && blueHex.links[n].color === null);
  // let take = Math.floor(Math.random() * (blueHex.count - 2)) + 1;
  // let move = new Move(direction, take, blueHex.x, blueHex.y);

  let move = AlphaBetaSearch(board, blue);

  postMessage({ move });
}

// ==== <Alpha Beta Pruning Search (adapted from slides)>
function AlphaBetaSearch(board, color) {
  startColor = color;

  let v = MaxValue(board, Number.MIN_VALUE, Number.MAX_VALUE);
  return Actions(board).find(move => move.value === v);
}

function MaxValue(board, a, b) {
  UpdateColor(true);
  if (TerminalTest(board)) return Utility(board);

  let v = Number.MIN_VALUE;

  for (let move of Actions(board)) {
    board.Execute(move);
    v = Math.max(v, MinValue(board, a, b));
    board.Revert(1);

    if (v >= b) return v;
    a = Math.max(a, v);
  }

  return v;
}

function MinValue(board, a, b) {
  UpdateColor(false);
  if (TerminalTest(board)) return Utility(board);

  let v = Number.MAX_VALUE;

  for (let move of Actions(board)) {
    board.Execute(move);
    v = Math.min(v, MaxValue(board, a, b));
    board.Revert(1);

    if (v <= a) return v;
    b = Math.min(b, v);
  }

  return v;
}

// Color Variables (so we don't have to pass color around)
let colors = [blue, red];
let startColor;
let currentColor;

function UpdateColor(isMax) {
  if (isMax)
    currentColor = startColor;
  else
    currentColor = startColor === colors[0] ? colors[1] : colors[0];
}

/** Actions: Returns [Move] for a given board */
function Actions(board) {
  // TODO: Implement
  return [];
}

/** Utility: Returns a the Utility score for a given board */
function Utility(board) {
  // TODO: Implement
  return 0;
}

/** TerminalTest */
function TerminalTest(board) {
  // TODO: Implement
  return true;
}