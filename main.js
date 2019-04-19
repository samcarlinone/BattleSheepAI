let boardDefs = [
  [[0,0],[-1,0.5],[1,0.5],[0,1],[-1,-1.5],[-1,-0.5],[1,-0.5],[0,-1],[0,-2],[1,-1.5],[2,-1],[2,0],[2,1],[1,1.5],[0,2],[-1,1.5],[-2,1],[-2,0],[-2,-1],[-3,-0.5],[-3,0.5],[-3,1.5],[-2,2],[3,-0.5],[3,0.5],[1,2.5],[2,2],[-2,-2],[-1,-2.5],[1,-2.5],[2,-2],[2,-3]]
];

// Create and populate board
let board = new Board();

let main = SVG().addTo('#main');
let boardG = main.group();

let def = boardDefs[Math.floor(Math.random() * boardDefs.length)];
for (let point of def)
  board.AddHex(...point);

// HTML refs
let sidebar = document.querySelector('.sidebar');
let controls = document.querySelector('.controls');

// Game states
const pick = 'pick';
const play = 'play';
const make = 'make';

// Pick vars
let start = null;

// Play vars
let playerTurn = true;
let selected = null;
let target = null;

let reds = [];
let blues = [];

// Game vars
let state = pick;

// Begin the game
Game();

function Game() {
  if (state === pick)
    Pick();
    
  if (state === play)
    Play();

  if (state === make)
    Debug();
}

function Pick() {
  // Update controls
  if (start === null)
    controls.innerHTML = '<span> Select a border hex </span>';
  else {
    if (start === -1)
      controls.innerHTML = '<span class="error-span"> Invalid start hex </span>';
    else
      controls.innerHTML = '<button onclick="Begin()"> Confirm </button>';
  }
  
  // Renderer
  let renderer = new BoardRenderer(main, boardG);

  function click() {
    let border = false;
    for (let offset of Coords.offsets) {
      if (board.GetHex(...Vector.add(this, offset)) === null)
        border = true;
    }

    if (start instanceof Array)
      board.GetHex(...start).color = null;

    if (border) {
      start = this;

      let hex = board.GetHex(...start);
      hex.color = red;
      hex.count = 16;
    }
    else
      start = -1;

    Game();
  };

  renderer.Render(board, true, { click });
}

function Begin() {
  // Find blue start
  let best = null;
  let bestCount = -1;

  // Don't pick the same start each time
  let hexes = shuffle(board.hexes.slice());

  for (let start of hexes) {
    // Don't select the player's spot
    if (start.color !== null)
      continue;

    let count = 0;

    for (let offset of Coords.offsets)
      if (board.GetHex(start.x + offset[0], start.y + offset[1]) != null)
        count++;

    // Count of 6 means that it's not a border hex
    if (count > bestCount && count < 6) {
      best = start;
      bestCount = count;
    }
  }

  // Update and add starting hexes
  best.color = blue;
  best.count = 16;
  blues.push(best);

  reds.push(board.GetHex(...start));

  // Update state
  state = play;
  Game();
}

function Play() {
  // Controls
  if (playerTurn)
    controls.innerHTML = '<span> Select a red stack </span>';

  // Renderer
  let renderer = new BoardRenderer(main, boardG);

  function click() {
    if (!playerTurn)
      return;

    let hex = board.GetHex(...this);

    if (hex.color === red)
      selected = this;
    
    if (hex.color === null)
      target = this;

    Game();
  };

  let highlights = [];

  if (selected) 
    highlights.push({ point: selected, class: 'selected-hex'});
  
  if (target)
    highlights.push({ point: target, class: 'target-hex'});

  console.log(highlights);

  renderer.Render(board, true, { click }, highlights);
}
