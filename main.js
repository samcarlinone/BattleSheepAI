let b = new Board();

for (let x = -6; x < 6; x += 2) {

  for (let y = -6; y < 6; y++)
    if (Math.random() < 0.1)
      b.AddHex(x, y);

  for (let y = -5.5; y < 6; y++)
    if (Math.random() < 0.1)
      b.AddHex(x + 1, y);
}

let draw = SVG().addTo('#main')
  .size(300, 300)
  .viewbox(-10, -10, 20, 20);

b.hexes.forEach(hex => draw.circle(.4).center(...Coords.toCartesian(hex.x, hex.y)));

const hexLine = [];

for (let i = 0; i < 360; i += 60) {
  hexLine.push(Math.cos(i * toRad));
  hexLine.push(Math.sin(i * toRad));
}

let hex = draw.polygon(hexLine.map(n => n / 2))
  .fill('none')
  .stroke({ color: '#f06', width: .1, linecap: 'round', linejoin: 'round' });

for (let h of b.hexes) {
  let newHex = hex.clone().center(...Coords.toCartesian(h.x, h.y));
  draw.add(newHex);
}