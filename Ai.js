importScripts('Board.js', 'Util.js');

onmessage = function(e) {
  let board = new Board();
  board.SetData(e.data);

  let blueHex = board.HasMoves(blue);
  let direction = [0, 1, 2, 3, 4, 5].find(n => blueHex.links[n] !== null && blueHex.links[n].color === null);
  let take = Math.floor(Math.random() * (blueHex.count - 2)) + 1;

  postMessage({ move: new Move(direction, take, blueHex.x, blueHex.y) });
}