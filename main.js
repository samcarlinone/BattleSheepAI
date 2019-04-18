let boardDefs = [
  [[0,0],[-1,0.5],[1,0.5],[0,1],[-1,-1.5],[-1,-0.5],[1,-0.5],[0,-1],[0,-2],[1,-1.5],[2,-1],[2,0],[2,1],[1,1.5],[0,2],[-1,1.5],[-2,1],[-2,0],[-2,-1],[-3,-0.5],[-3,0.5],[-3,1.5],[-2,2],[3,-0.5],[3,0.5],[1,2.5],[2,2],[-2,-2],[-1,-2.5],[1,-2.5],[2,-2],[2,-3]]
];

let b = new Board();

let gameMode = true;

let main = SVG().addTo('#main');
let boardG = main.group();

if (gameMode) {
  let def = boardDefs[Math.floor(Math.random() * boardDefs.length)];
  for (let point of def)
    b.AddHex(...point);
  
  let renderer = new BoardRenderer(main, boardG, 0);
  renderer.Render(b, true);

}
else {
  b.AddHex(-1, 0.5);
  b.AddHex(1, 0.5);
  b.AddHex(0, 1);

  let renderer = new BoardRenderer(main, boardG, 3);
  let callbacks = {'click': function() {
    b.AddHex(...this);
    renderer.Render(b, false, callbacks);
    console.clear();
    console.log(b.hexes.map(hex => [hex.x, hex.y]));
  }};

  renderer.Render(b, false, callbacks);
}
