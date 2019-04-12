let b = new Board();
b.AddHex(-1, 0.5);
b.AddHex(1, 0.5);
b.AddHex(0, 1);

rojo = b.GetHex(0, 0);
azul = b.GetHex(-1, 0.5);

rojo.color = red;
rojo.count = 1;

azul.color = blue;
azul.count = 10;

let renderer = new BoardRenderer(3);
let callbacks = {'click': function() {b.AddHex(...this); renderer.Render(b, false, callbacks);} }
renderer.Render(b, false, callbacks);

// Move hex to mouse
// draw.mousemove(({ screenX, screenY }) => {
//   let point = draw.point(screenX, screenY);
//   let hexPos = Coords.toHex(point.x, point.y);
//   hexPos[0] = Math.round(hexPos[0]);
//   hexPos[1] = Math.round(hexPos[1]) + (hexPos[0] % 2 === 0 ? 0 : Math.sign(hexPos[1]) * 0.5) + (hexPos[1] < 0 ? -2 : -2);

//   hex.center(...Coords.toCartesian(...hexPos));
// });

// draw.click(({ screenX, screenY }) => {
//   let point = draw.point(screenX, screenY);
//   let hexPos = Coords.toHex(point.x, point.y);
//   hexPos[0] = Math.round(hexPos[0]);
//   hexPos[1] = Math.round(hexPos[1]) + (hexPos[0] % 2 === 0 ? 0 : Math.sign(hexPos[1]) * 0.5) + (hexPos[1] < 0 ? -2 : -2);

//   hex.center(...Coords.toCartesian(...hexPos));
// })