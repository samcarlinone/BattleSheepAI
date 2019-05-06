importScripts('Board.js', 'Util.js');

//set up timer in case of timeout on large search tree
let startTime;
let maxThinkTime = 30 * 1000; // Should be in ms
let maxDepth = 5;

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
  startTime = Date.now();
  startColor = color;

  let move = MaxMoveValue(board, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0);
  return move;
}

// Same as MaxValue but remembers and returns best Move instead of highest score
function MaxMoveValue(board, a, b, depth) {
  UpdateColor(true);

  let v = Number.MIN_SAFE_INTEGER;
  let bestMove = null;
  let moves = Actions(board);
  if(moves.length === 0) moves = ['no-op'];
  
  for (let move of moves) {
    if (move !== 'no-op') board.Execute(move);

    let newV = MinValue(board, a, b, depth + 1);

    if (newV > v) {
      v = newV;
      bestMove = move;
      console.log(bestMove);
    }

    if (move !== 'no-op') board.Revert(1);

    // if (v >= b) return bestMove; (b will always be max value, so this never works)
    a = Math.max(a, v);
  }
  
  return bestMove;
}

function MaxValue(board, a, b, depth) {
  UpdateColor(true);
  if (TerminalTest(board, depth)) return Utility(board);

  let v = Number.MIN_SAFE_INTEGER;

  var moves = Actions(board);
  if(moves.length === 0) moves = ['no-op'];
  
  for (let move of moves) {
    if (move !== 'no-op') board.Execute(move);
    v = Math.max(v, MinValue(board, a, b, depth + 1));
    if (move !== 'no-op') board.Revert(1);

    if (v >= b) return v;
    a = Math.max(a, v);
  }

  return v;
}

function MinValue(board, a, b, depth) {
  UpdateColor(false);
  if (TerminalTest(board, depth)) return Utility(board);

  let v = Number.MAX_SAFE_INTEGER;
  
  let moves = Actions(board);
  if (moves.length === 0) moves = ['no-op'];
  
  for (let move of moves) {
    if (move !== 'no-op') board.Execute(move);
    v = Math.min(v, MaxValue(board, a, b, depth + 1));
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
  var hexes = board.hexes;
  var moves = [];

  for(let h of hexes) {
    if (h.color === currentColor && h.count > 1) {

      let open = [false, false, false, false, false, false];

      for (let dir = 0; dir < 6; dir++)
        open[dir] = board.IsOpen(h.links[dir]);

      // Since splitting near even stacks is often the most optimal move this "pre-sorting"
      // can significantly reduce search times. The speedup is definitely worth the increased
      // overhead and code complexity.
      let half = Math.floor(h.count / 2);

      for (let numTokens = 1; numTokens < half; numTokens++)
        for (let dir = 0; dir < 6; dir++)
          if (open[dir])
            moves.push(new Move(dir, numTokens, h.x, h.y));

      for (let numTokens = half; numTokens < h.count; numTokens++)
        for (let dir = 0; dir < 6; dir++)
          if (open[dir])
            moves.push(new Move(dir, numTokens, h.x, h.y));
    }
  }

  return moves;
}

/** Utility: Returns the Utility score for a given board */
function Utility(board) {
  var utility = 0;
  var hexes = board.hexes;
  
  for(let h of hexes){
    //count # of moves our own stacks can make
    if(h.color === startColor) {
      for (let linked of h.links) {
        if (board.IsOpen(linked)) utility += h.count;
      }
    }
    
    //check if our opponent has no moves
    if(h.color !== startColor  && h.color !== null && h.count > 1 && !board.CanMove(h))
      utility += 20 * h.count;

    //check if we have no moves
    if(h.color === startColor && h.count > 1 && !board.CanMove(h))
      utility -= 50 * h.count;
  }

  return utility;
}

/** TerminalTest */
function TerminalTest(board, depth) {
  if (depth > maxDepth)
    return true;

  if(Date.now() - startTime > maxThinkTime) {
    console.log('Time limit reached');
    return true;
  }

  return !board.HasMoves(red) && !board.HasMoves(blue);
}