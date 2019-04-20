
function Debug() {
  b.AddHex(-1, 0.5);
  b.AddHex(1, 0.5);
  b.AddHex(0, 1);
  
  let renderer = new BoardRenderer(main, boardG, 3, false);
  let callbacks = {'click': function() {
    b.AddHex(...this);
    renderer.Render(b, false, callbacks);
    console.clear();
    console.log(b.hexes.map(hex => [hex.x, hex.y]));
  }};
  
  renderer.Render(b, false, callbacks);
}
