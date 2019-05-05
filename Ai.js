importScripts('Board.js', 'Util.js');

// Note: this script is only called if blue can make a move
onmessage = function(e) {
  let board = new Board();
  board.SetData(e.data);

  //let blueHex = board.HasMoves(blue);
  //let direction = [0, 1, 2, 3, 4, 5].find(n => blueHex.links[n] !== null && blueHex.links[n].color === null);
  //let take = Math.floor(Math.random() * (blueHex.count - 2)) + 1;
  //let move = new Move(direction, take, blueHex.x, blueHex.y);

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
  let moves = Actions(board);
  if(moves.length === 0) moves = ['no-op'];
  
  for (let move of moves) {
    if (move !== 'no-op') board.Execute(move);
    v = Math.max(v, MinValue(board, a, b));
    if (move !== 'no-op') board.Revert(1);

    if (v >= b) return v;
    a = Math.max(a, v);
  }

  return v;
}

function MinValue(board, a, b) {
  UpdateColor(false);
  if (TerminalTest(board)) return Utility(board);

  let v = Number.MAX_VALUE;
  
  let moves = Actions(board);
  if (moves.length === 0) moves = ['no-op'];
  
  for (let move of moves) {
    if (move !== 'no-op') board.Execute(move);
    v = Math.min(v, MaxValue(board, a, b));
    if (move !== 'no-op') board.Revert(1);

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
  // TODO: Complete implementation
  var hexes = board.hexes;
  var moves = [];
  for(let h of hexes) {
    if (h.color === this.currentColor) {
      for(let c of h.links) {
        //rather than checking just one in every direction, use Trace
        if (board.IsOpen(c)) {
          moves.push(new Move(c, 1, h.x, h.y))
        }
      }
    }
  }
  return moves;
}

/** Utility: Returns the Utility score for a given board */
function Utility(board) {
  // TODO: Complete implementation
  var utility = 0.0;
  var hexes = board.GetData();
  
  for(let h of hexes){
    //count # of moves our own stacks can make
    if(h.color === this.currentColor) 
      for (let linked of h.links) 
        if (board.IsOpen(linked))
          utility += 1;
    
    //check if our opponent has no moves
    if((h.color !== this.currentColor) && (h.color !== null) && !(board.CanMove(h)))
      utility = utility + h.count;

    //check if we have no moves
    if(!h.CanMove)
      utility = utility - 1;
  }
  return utility;
}

/** TerminalTest */
function TerminalTest(board) {
  return(board.hasMoves(currentColor));
}