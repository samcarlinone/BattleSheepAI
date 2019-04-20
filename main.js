let boardDefs = [
  [[0,0],[-1,0.5],[1,0.5],[0,1],[-1,-1.5],[-1,-0.5],[1,-0.5],[0,-1],[0,-2],[1,-1.5],[2,-1],[2,0],[2,1],[1,1.5],[0,2],[-1,1.5],[-2,1],[-2,0],[-2,-1],[-3,-0.5],[-3,0.5],[-3,1.5],[-2,2],[3,-0.5],[3,0.5],[1,2.5],[2,2],[-2,-2],[-1,-2.5],[1,-2.5],[2,-2],[2,-3]]
];

// Create and populate board
let board = new Board();
let main = SVG().addTo('#main');
let boardG = main.group();
let renderer = new BoardRenderer(main, boardG);

let def = boardDefs[Math.floor(Math.random() * boardDefs.length)];
for (let point of def)
  board.AddHex(...point);

// AI Worker thread (if you get an error here follow the instructions in README.md)
let aiWorker = new Worker('Ai.js');
aiWorker.onmessage = AiMessage;

// HTML refs
let sidebar = document.querySelector('.sidebar');
let controls = document.querySelector('.controls');

// Game states
const pick = 'pick';
const play = 'play';
const ai_go = 'ai_go';
const over = 'over';
const make = 'make';

// Pick vars
let start = null;

// Play vars
let selected = null;
let selectedCount = 0;
let target = null;
let targetHex = null;

let take = 1;

// Begin the game
Game(pick);

function Game(state) {
  if (state === pick) {
    Pick();
    return;
  }
  
  if (state === make) {
    Debug();
    return;
  }

  let redMove = board.HasMoves(red);
  let blueMove = board.HasMoves(blue);
    
  if (blueMove && (state === ai_go || (state === play && !redMove))) {
    AiGo();
    return;
  }

  if (redMove && (state === play || (state === ai_go && !blueMove))) {
    Play();
    return;
  }

  Over();
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

    Game(pick);
  };

  renderer.Render(board, { click });
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

  // Update state
  Game(play);
}

function ClearPlay() {
  if (selected) {
    board.GetHex(...selected).count = selectedCount;

    if (target !== null) {
      targetHex.count = 0;
      targetHex.color = null;
      target = null;
    }
  }
}

function Play() {
  // Update sidebar class
  sidebar.classList.remove('is-ai');

  // Controls
  if (!selected) {
    controls.innerHTML = '<span> Select a red stack </span>';
  }
  else {
    if (target === null) {
      controls.innerHTML = '<span> Select a target direction </span>';
    }
    else {
      let split =  document.querySelector('#split');

      // Ensure take remains bounded [1, selectedCount -1]
      take = Math.max(1, Math.min(take, selectedCount - 1));

      if (!split) {
        controls.innerHTML = `
          <span> Move how many? </span>
          <div class="split-controls">
            <input id="split" type="range" value="${take}" step="1" min="1" max="${selectedCount - 1}"/>
            <label id="split-label">${take}</label>
          </div>
          <button onclick="PlayerMove()"> Move </button>
        `;

        document.querySelector('#split').oninput = e => { take = e.target.value; Play(); }
        window.onwheel = e => { take += Math.sign(e.wheelDelta); Play(); };
      }
      else {
        split.value = take;
        document.querySelector('#split-label').innerText = take;
      }
    }
  }

  // Update
  if (selected && target !== null) {
    board.GetHex(...selected).count = selectedCount - take;
    targetHex.count = take;
  }

  // Click on board action
  function click() {
    ClearPlay();

    // Select new
    let hex = board.GetHex(...this);

    // Red stack to select?
    if (hex.color === red && hex.count > 1) {
      selected = this;
      selectedCount = hex.count;
    }
    
    // Can we get a line?
    if (selected && hex.color === null) {
      let src = board.GetHex(...selected);
      let direction = board.GetDirection(src, hex);

      if (direction !== null && src.links[direction] !== null) {
        target = direction;
        targetHex = board.Trace(selected[0], selected[1], target);
        targetHex.color = white;
      }
    }

    Game(play);
  };

  // Push highlights for board renderer
  let highlights = [];

  if (selected) 
    highlights.push({ point: selected, class: 'selected-hex', zIndex: 2 });
  
  if (target !== null) {
    let hex = board.GetHex(...selected);

    while(hex.links[target] && (hex.links[target].color === null)) {
      hex = hex.links[target];
      highlights.push({ point: Vector.from(hex), class: 'line-hex', zIndex: 0 });
    }

    highlights.push({ point: Vector.from(targetHex), class: 'target', zIndex: 1 });
  }

  renderer.Render(board, { click }, highlights);
}

function PlayerMove() {
  let dir = target;
  ClearPlay();

  if (!board.Execute(new Move(dir, take, selected[0], selected[1])))
    alert('The given move could not be executed');

  selected = null;

  Game(ai_go);
}

function AiGo() {
  // Update sidebar class
  sidebar.classList.add('is-ai');

  // Begin thinking worker
  aiWorker.postMessage(board.GetData());

  // Render the board
  renderer.Render(board);
}

function AiMessage({ data: { move } }) {
  board.Execute(move);
  Game(play);
}

function Over() {
  sidebar.classList.remove('is-ai');
  controls.innerHTML = '<span> Game Over </span>';
  renderer.Render(board);
}