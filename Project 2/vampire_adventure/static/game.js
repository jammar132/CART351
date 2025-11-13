// Map
const baseMap = [
  // y = 0
  ["F","F","F","F","R","R","R","R","R","R","R","F","R","F","F","F","F","F","F","F"],
  // y = 1
  ["F","F","F","R","R",".","R",".","F","F","R","R","R","R","F","F","F","F","F","F"],
  // y = 2
  ["F","R","R","R",".","V","V","V",".","F","F","F","R","R","R","F","R","R","F","R"],
  // y = 3
  ["R","R","R",".","V","V","V","V","V",".","F","F","F","R","R","R","R","R","R","R"],
  // y = 4
  ["R","F",".","V","V","V","V","V","V","V",".",".","F","F",".",".","S","S","S","S"],
  // y = 5
  ["R","F","F",".","V","V","V","V","V",".","F",".",".",".","F",".",".","S","S","S"],
  // y = 6
  ["R",".","F","F",".","V","V","V",".","F","F","F",".",".",".",".","S","S","S","S"],
  // y = 7
  ["F",".",".","F","F",".","V",".","F","F",".",".",".","F","F",".",".","S","S","S"],
  // y = 8
  ["F","F",".",".","F","F",".","F","F","F","F","F",".","F","F","F","F",".","S","S"],
  // y = 9
  [".","F","F",".","F","F",".",".","F","F","F","F",".",".","F","F",".","F",".","S"],
  // y = 10
  ["F",".","F",".","F",".","F",".",".","F",".",".","F",".","F",".","F","F",".","."],
  // y = 11
  ["F","F","F","F",".",".","F","F",".",".",".","F","F","F",".","F","F",".","F","."],
  // y = 12
  ["F","F","F",".","F","F","F","F","F","F","F","F","F","F","F","F","F","F",".","F"],
  // y = 13
  ["F","F",".","F","F",".",".","F",".","F","F","F",".","F","F",".","H","H","F","F"],
  // y = 14
  ["F",".","G","G","G","F",".",".","F","F","F",".","F","F",".","F",".","H","F","."],
  // y = 15
  [".","G","F","F","G","F","G",".",".","F","F","F","F",".","F","F","F","F","F","."],
  // y = 16
  [".","F","C","F","G","G","G","G","F","F","F","F","F","F",".",".","F",".",".","."],
  // y = 17
  [".","C","C","C","G","G","F","F","G",".",".","F","F","F",".","F",".","F","F","."],
  // y = 18
  [".","C","C","C","G","G","G","G","F",".",".",".","F",".","F","F","F","F",".","."],
  // y = 19
  ["F","C","C","C","C","C","C","G","F","F",".",".",".","F","F","F","F",".",".","."]
];

// --- START --- 
let player = { x: 0, y: 3 };

// HP & time
let hp = 5; //start vulnerable
let turn = 0;
let gameOver = false;

// TIMER: 7 minutes
const TOTAL_TIME_SECONDS = 7 * 60;
let timeLeftSeconds = TOTAL_TIME_SECONDS;

// resources
let coins = 0;
let garlicHeads = 0;
let planks = 0;
let nails = 0;
let candles = 0;
let garlicCharms = 0;
let hasString = false;

// special items
let inventory = []; // e.g. "Holy Symbol", "Matches", "Hammer"

// leaderboard
let leaderboardVisible = false;

// house/defences
let wagonResolved = false;
let houseVisited = false;
let houseSearchDone = false;
let shedLooted = false;
let windowsBoardedSides = 0; // 0–4
let houseGarlicRing = false;
let litAreas = 0; // 0–4
let holySymbolFound = false;
let insideHouse = false;

// garlic market
let garlicMarketSeen = false;

// radiused hints
let wagonHintShown = false;
let garlicHintShown = false;

// random coin spots
let coinSpots = {}; // key "x,y" -> amount

// fog
const visible = baseMap.map(row => row.map(() => false));

// event locations
const wagonCrashTiles = [
    { x: 7, y: 1 },
    { x: 8, y: 1 }
];

// garlic stall occupies 3 tiles
const garlicStallTiles = [
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 6, y: 5 }
];

let lastOnGarlicStall = false;

// DOM
const outputEl = document.getElementById("output");
const mapEl = document.getElementById("map");
const promptEl = document.getElementById("prompt");
const inventoryEl = document.getElementById("inventory");
const statusEl = document.getElementById("status");

// tile data
const tileNames = {
    "F": "Forest",
    "R": "Road",
    "H": "Safe House",
    "C": "Church",
    "G": "Graveyard",
    "S": "Swamp",
    "V": "Village",
    ".": "Field"
};
const tileDescriptions = {
    "F": "Trees knit together overhead, swallowing the last light.",
    "R": "Packed earth and wagon ruts. It used to be busy here.",
    "H": "Two stories of peeling paint and boarded windows.",
    "C": "A stone church, its tower cutting the sky like a fang.",
    "G": "Crooked headstones. The earth here never quite settled.",
    "S": "Rotten water and reeds. Every step squelches.",
    "V": "Empty stalls and doors left half-open. The village fled quickly.",
    ".": "Open land. Grass whispers in the wind."
};

// Coin Staches
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function initCoinSpots() {
    const candidates = [];
    for (let y = 0; y < baseMap.length; y++) {
        for (let x = 0; x < baseMap[y].length; x++) {
            const t = baseMap[y][x];
            if (t === "R" || t === "V" || t === ".") {
                candidates.push({ x, y });
            }
        }
    }
    shuffle(candidates);
    const numSpots = 6;
    for (let i = 0; i < Math.min(numSpots, candidates.length); i++) {
        const c = candidates[i];
        coinSpots[`${c.x},${c.y}`] = 10; // 10 coins each
    }
}
initCoinSpots();

// Setup
print("Nightfall: Terminal Vampire Escape");
print("The sun has slipped below the horizon.");
print("Vampires will hunt the roads and fields until sunrise.");
print("You have 7 minutes until dawn. Use W/A/S/D or the Arrow Keys to move.\n");

revealAround(player.x, player.y);
renderMap();
describeSurroundings();
updateInventoryUI();
updateStatus();

const timerInterval = setInterval(tickTimer, 1000);

//Helpers
function print(text) {
    outputEl.innerText += text + "\n";
    outputEl.scrollTop = outputEl.scrollHeight;
}
function getTile(x, y) {
    if (y < 0 || y >= baseMap.length) return null;
    if (x < 0 || x >= baseMap[y].length) return null;
    return baseMap[y][x];
}
function revealAround(x, y) {
    const coords = [
        [x, y],
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
    ];
    for (const [cx, cy] of coords) {
        if (cy >= 0 && cy < visible.length && cx >= 0 && cx < visible[cy].length) {
            visible[cy][cx] = true;
        }
    }
}

function updateInventoryUI() {
    inventoryEl.innerHTML = "";
    const rows = [];
    rows.push(`Coins: ${coins}`);
    rows.push(`Garlic heads: ${garlicHeads}`);
    rows.push(`Garlic charms: ${garlicCharms}`);
    rows.push(`Planks: ${planks}`);
    rows.push(`Nails: ${nails}`);
    rows.push(`Candles: ${candles}`);
    rows.push(`String: ${hasString ? "yes" : "no"}`);
    rows.push("");
  
    if (inventory.length > 0) {
        rows.push("Other:");
        inventory.forEach(item => rows.push(`* ${item}`));
    }
    if (rows.length === 0) rows.push("(empty)");
    rows.forEach(txt => {
        const li = document.createElement("li");
        li.textContent = txt;
        inventoryEl.appendChild(li);
    });
}

function updateStatus() {
    const minutes = Math.floor(timeLeftSeconds / 60);
    const seconds = timeLeftSeconds % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    statusEl.textContent = `HP: ${hp} | Coins: ${coins} | Time until sunrise: ${timeStr}`;
}

function tickTimer() {
    if (gameOver) return;
    timeLeftSeconds -= 1;
    if (timeLeftSeconds <= 0) {
        timeLeftSeconds = 0;
        updateStatus();
        resolveNight();
        clearInterval(timerInterval);
    } else {
        updateStatus();
    }
}

function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Rendering
function renderMap() {
    let html = "";
    for (let y = 0; y < baseMap.length; y++) {
        for (let x = 0; x < baseMap[y].length; x++) {
            let typeChar, displayChar, classes = ["tile"];
            if (!visible[y][x]) {
                typeChar = "unknown";
                displayChar = "?";
            } else {
                typeChar = baseMap[y][x];
                displayChar = baseMap[y][x];
            }
            if (x === player.x && y === player.y) {
                classes.push("player");
                displayChar = "●";
            }
            html += `<span class="${classes.join(" ")}" data-type="${typeChar}">${displayChar}</span>`;
        }
        html += "<br>";
    }
    mapEl.innerHTML = html;
}

function describeSurroundings() {
    const here = getTile(player.x, player.y);
    const hereName = tileNames[here] || "Unknown";
    const hereDesc = tileDescriptions[here] || "";
  
    print(`[You are on: ${hereName}]`);
    if (hereDesc) print(hereDesc);
  
    const neighbors = [
        { dir: "north", x: player.x, y: player.y - 1 },
        { dir: "south", x: player.x, y: player.y + 1 },
        { dir: "west",  x: player.x - 1, y: player.y },
        { dir: "east",  x: player.x + 1, y: player.y }
    ];
  
    let line = "Around you: ";
    neighbors.forEach(n => {
        const t = getTile(n.x, n.y);
        if (t) line += `${n.dir} → ${tileNames[t] || "Unknown"}; `;
    });

    print(line.trim());
    print("");
}

// Prompts
function clearPrompt() {
    promptEl.innerHTML = "";
}

function showPrompt(text, options) {
    promptEl.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = text;
    promptEl.appendChild(p);
  
    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.textContent = opt.label;
        btn.addEventListener("click", () => {
            clearPrompt();
            opt.onSelect();
        });
        promptEl.appendChild(btn);
    });
}

// Movement
function move(dir) {
    if (gameOver) return;

    // If inside the house, movement keys don't move you
    if (insideHouse) {
        print("You’re inside the house. Decide what to do using the options below.");
        return;
    }  
    let dx = 0, dy = 0;

    if (dir === "north") dy = -1;
    else if (dir === "south") dy = 1;
    else if (dir === "west") dx = -1;
    else if (dir === "east") dx = 1;
    else return;

    const nx = player.x + dx;
    const ny = player.y + dy;

    const tile = getTile(nx, ny);
    if (!tile) {
        print("You feel the edge of the world pressing back. You can't move that way.");
        return;
    }
    player.x = nx;
    player.y = ny;
    turn += 1;
  
    revealAround(player.x, player.y);
    renderMap();
    describeSurroundings();
    updateStatus();
    checkProximityHints();
  
    if (tile === "H") {
        enterHouse();
        logAction(`enter_house`);
        return;
    }

    // garlic stall detection edge: only when stepping onto one of the tiles
    const nowOnGarlic = garlicStallTiles.some(t => t.x === player.x && t.y === player.y);
    if (nowOnGarlic && !lastOnGarlicStall) {
        garlicMarketPrompt();
    }
    lastOnGarlicStall = nowOnGarlic;
  
    checkEvents(tile);
    logAction(`move_${dir}`);
}

// Proximity hints for wagon & garlic stall
function checkProximityHints() {
    // wagon hint if within distance 4 of ANY wagon tile
    if (!wagonHintShown) {
        const d = Math.min( ...wagonCrashTiles.map(t => manhattan(player, t)));
        if (d <= 4) {
            wagonHintShown = true;
            print("In the distance, you glimpse the splintered silhouette of a collapsed wagon on the road.");
        }
    }
    // garlic stall hint if within distance 2 of ANY garlic tile
    if (!garlicHintShown) {
        const d = Math.min(...garlicStallTiles.map(t => manhattan(player, t)));
        if (d <= 2) {
            garlicHintShown = true;
            print("A sharp smell of garlic cuts through the night air somewhere nearby.");
        }
    }
}

// Event handeling 
function checkEvents(tile) {
    if (gameOver) return;
    // Coin spot at current tile
    const key = `${player.x},${player.y}`;
    if (coinSpots[key] && coinSpots[key] > 0) {
        const amount = coinSpots[key];
        showPrompt(
            `You notice a scattered stash of coins glinting faintly in the dark. (${amount} coins)`,
            [
                {
                    label: `Take ${amount} coins`,
                    onSelect: () => {
                        coins += amount;
                        coinSpots[key] = 0;
                        print(`You pocket ${amount} coins.`);
                        updateInventoryUI();
                        updateStatus();
                        logAction("coins_take_spot");
                    }
                },
                {
                    label: "Leave them",
                    onSelect: () => {
                        print("You leave the coins where they lie.");
                        logAction("coins_leave_spot");
                    }
                }
            ]
        );
        return; // only process coins this turn
    }
    
    // Swamp 
    if (tile === "S") {
        print("The swamp clings to your boots, sucking at each step.");
        logAction("swamp_step");
    }
    // Graveyard logic
    if (tile === "G") {
        handleGraveyard();
    }

    // Wagon crash (2 tiles)
    if (!wagonResolved && wagonCrashTiles.some(t => t.x === player.x && t.y === player.y)) {
        wagonCrashPrompt();
        return;
    }

    // Garlic stall (3 tiles) — prompt when standing on it (initially triggered above)
    if (garlicStallTiles.some(t => t.x === player.x && t.y === player.y)) {
    }

    // Church symbol on ANY church tile
    if (!holySymbolFound && tile === "C") {
        churchSymbolPrompt();
    }
}

function wagonCrashPrompt() {
    showPrompt(
        "You reach a shattered wagon blocking the road. Crates lie smashed open, planks, nails and a pouch spill across the dirt. Tangled in the wreckage is also a coil of string.",
        [
            {
                label: "Salvage everything",
                onSelect: () => {
                    print("You gather planks, nails, a heavy pouch of coins, and a length of sturdy string.");
                    planks += 24;
                    nails += 96;
                    coins += 45;
                    hasString = true;
                    wagonResolved = true;    

                    updateInventoryUI();
                    updateStatus();
                    logAction("wagon_salvage_all");
                }
            },
            {
                label: "Just grab the pouch and hurry on",
                onSelect: () => {
                    print("You snatch the coin pouch and move on, leaving the broken wood behind.");
                    coins += 45;
                    wagonResolved = true;             
                    updateInventoryUI();
                    updateStatus();
                    logAction("wagon_pouch_only");
                }
            },
            {
                label: "Leave the wreckage untouched",
                onSelect: () => {
                    print("You edge around the wagon, unnerved by the silence surrounding it.");
                    wagonResolved = true;              
                    logAction("wagon_leave");
                }
            }
        ]  
    );
}


function churchSymbolPrompt() {
    showPrompt(
        "At the edge of the church grounds, a tarnished silver symbol lies half-buried in the dirt.",
        [
            {
                label: "Take the holy symbol",
                onSelect: () => {
                    print("You lift the symbol. It hums with a faint warmth against your skin.");
                    if (!inventory.includes("Holy Symbol")) inventory.push("Holy Symbol");
                    holySymbolFound = true;
                    updateInventoryUI();
                    logAction("symbol_take_any_church");
                }
            },
            {
                label: "Leave it",
                onSelect: () => {
                    print("You leave the symbol where it lies, uneasy about taking it.");
                    holySymbolFound = true;
                    logAction("symbol_leave_any_church");
                }
            }
        ]
    );
}

function handleGraveyard() {
    // warning if vulnerable
    if (garlicCharms < 4) {
        print("You feel the graves watching you. Without at least four garlic charms, this ground will eat away at you.");
    }
    if (garlicCharms >= 4) {
        print("Your garlic charms grow warm against your skin. The air seems to push the shadows away.");
        logAction("graveyard_protected");
        return;
    }
    if (garlicCharms > 0) {
        garlicCharms -= 1;
        hp -= 2;
        print("One of your garlic charms splits and crumbles. Something unseen presses closer. (Charm lost, −2 HP)");
        if (garlicCharms === 0) {
            print("You’ve used up your last charm. The graveyard only grows hungrier.");
        }
        updateInventoryUI();
        updateStatus();
        logAction("graveyard_charm_break");
        if (hp <= 0) {
            gameOver = true;
            print("You collapse among the tombstones as the last charm disintegrates.");
            logAction("death_graveyard_charms");
        }
        return;
    }
    hp -= 3;
    print("Cold pressure squeezes your chest. Invisible teeth graze your skin. (−3 HP)");
    print("Without garlic charms, the graveyard is feeding on you.");
    updateStatus();  
    logAction("graveyard_unprotected");

    if (hp <= 0) {
        gameOver = true;
        print("The graves claim you long before dawn.");
        logAction("death_graveyard_unprotected");
    }
}

function garlicMarketPrompt() {
    if (!garlicMarketSeen) {
        garlicMarketSeen = true;
        print("You reach the village square. An overturned garlic stall still reeks sharply in the cool air.");
        print("Bundles of garlic heads are scattered across the cobblestones.\n");
    }
    const options = [];
    if (coins >= 10) {
         options.push({
            label: "Buy 10 garlic heads (10 coins)",
            onSelect: () => {
                coins -= 10;
                garlicHeads += 10;
                print("You count out ten coins and take a bundled stack of garlic heads.");
                updateInventoryUI();
                updateStatus();
                logAction("garlic_buy_10");
            }
        });
    }
  
    options.push({
        label: "Try to steal 10 garlic heads",
        onSelect: () => {
            const caught = Math.random() < 0.3;
            if (caught) {
                print("Hands seize your wrist. You’re dragged into a storage room and locked in.");
                print("By the time you wrestle your way out, two minutes of the night are gone.");
                timeLeftSeconds = Math.max(0, timeLeftSeconds - 2 * 60);
                updateStatus();
                logAction("garlic_steal_caught");
                if (timeLeftSeconds <= 0) resolveNight();
            } else {
                garlicHeads += 10;
                print("You sweep a bundle of garlic heads into your bag while no one is looking.");
                updateInventoryUI();
                logAction("garlic_steal_success");
            }
        }
    });
    
    options.push({
        label: "Walk away from the stall",
        onSelect: () => {
            print("You move away from the market stall. The smell of garlic clings to you.");
            logAction("garlic_leave_stall");
        }
    });
    
    showPrompt(
        "The garlic stall is a rare chance at protection. How do you handle it?",
        options
    );
}

// House
function enterHouse() {
    insideHouse = true;
    print("You step into the house. The door closes with a heavy, tired sound.");
    if (!houseVisited) {
        houseVisited = true;
        print("Dust motes float in the air. You could rest here, search, or begin turning it into a fortress.");
    }
    houseMenuPrompt();
}

function houseMenuPrompt() {
    if (!insideHouse || gameOver) return;

    const options = [
        {
            label: "Rest for a moment",
            onSelect: () => {
                print("You barricade the door for a while and let your breathing slow.");
                hp = Math.min(10, hp + 4);
                timeLeftSeconds = Math.max(0, timeLeftSeconds - 15); // Take away 15 seconds
                updateStatus();
                logAction("house_rest");
                if (timeLeftSeconds <= 0) {
                    resolveNight();
                } else {
                    houseMenuPrompt();
                }
            }
        },
        {
            label: "Search the rooms",
            onSelect: () => {
                if (!houseSearchDone) {
                    houseSearchDone = true;
                    print("You rummage through the rooms and gather candles and a box of matches.");
                    if (!inventory.includes("Matches")) inventory.push("Matches");
                    candles += 16; // 4 areas * 4 candles
                    updateInventoryUI();
                    logAction("house_search_rooms_first");
                } else {
                    print("You’ve already looted the rooms. Only dust and broken furniture remain.");
                    logAction("house_search_rooms_repeat");
                }
                houseMenuPrompt();
            }
        },
        {
            label: "Search outside for a shed",
            onSelect: () => {
                if (!shedLooted) {
                    shedLooted = true;
                    print("Behind the house, you find a leaning shed. Inside: stacked planks, a crate of nails, and a heavy hammer.");
                    planks += 12;
                    nails += 48;
                    if (!inventory.includes("Hammer")) inventory.push("Hammer");
                    updateInventoryUI();
                    logAction("house_shed_loot");
                } else {
                    print("You circle the house again. The shed is as empty as you left it.");
                    logAction("house_shed_repeat");
                }
                houseMenuPrompt();
            }
        },
        {
            label: "Work on defences",
            onSelect: () => {
                houseDefencePrompt();
            }
        },
        {
            label: "Craft garlic charms",
            onSelect: () => {
                craftCharmPrompt();
            }
        },
        {
            label: "I’m ready for sunset",
            onSelect: () => {
                print("You decide your preparations are as good as they will get. You wait for the coven to arrive…");
                logAction("ready_for_sunset");
                resolveNight(); // ends the run now, using current timeLeftSeconds
            }
        },
        {
            label: "Leave the house",
            onSelect: () => {
                insideHouse = false;
                print("You slip back outside, the night air colder than you remember.");
                clearPrompt();
                logAction("house_leave");
            }
        }
    ];
    showPrompt("Inside the safe house, you can decide how to use the time you have left.", options);
}

function houseDefencePrompt() {
    const options = [];
    // Board one side: 8 planks + 32 nails
    if (planks >= 8 && nails >= 32 && windowsBoardedSides < 4) {
        options.push({
            label: "Board up a side (8 planks, 32 nails)",
            onSelect: () => {
                planks -= 8;
                nails -= 32;
                windowsBoardedSides += 1;
                print(`You reinforce another wall. (${windowsBoardedSides}/4 sides protected)`);
                updateInventoryUI();
                logAction("house_board_side");
                houseDefencePrompt();
            }
        });
    }
    // Garlic ring: 50 heads
    if (!houseGarlicRing && garlicHeads >= 50) {
        options.push({
            label: "Scatter 50 garlic heads around the house",
            onSelect: () => {
                garlicHeads -= 50;
                houseGarlicRing = true;
                print("You scatter garlic heads along the outer walls, creating a stinging halo of scent.");
                updateInventoryUI();
                logAction("house_garlic_ring");
                houseDefencePrompt();
            }
        });
    }

    // Light areas: 4 candles each, 4 areas
    if (candles >= 4 && litAreas < 4) {
        options.push({
            label: "Place 4 lights in an area",
            onSelect: () => {
                candles -= 4;
                litAreas += 1;
                print(`You light another part of the house. (${litAreas}/4 areas lit)`);
                updateInventoryUI();
                logAction("house_light_area");
                houseDefencePrompt();
            }
        });
    }
    options.push({
        label: "Back to main house menu",
        onSelect: () => {
            houseMenuPrompt();
        }
    });
    
    if (options.length === 1) {
        print("You don’t have the right materials to improve your defences right now.");
        houseMenuPrompt();
        return;
    }
    showPrompt("How do you reinforce the house?", options);
}

function craftCharmPrompt() {
    const options = [];
    
    if (hasString && garlicHeads >= 10) {
        options.push({
            label: "Weave one garlic charm (10 heads)",
            onSelect: () => {
                if (garlicHeads < 10) {
                    print("You don’t have enough garlic heads to finish a charm.");
                    craftCharmPrompt();
                    return;
                }
                garlicHeads -= 10;
                garlicCharms += 1;
                print(`You twist garlic and string into a crude charm. (Charms: ${garlicCharms})`);
                updateInventoryUI();
                logAction("house_craft_charm");
                craftCharmPrompt();
            }
        });
    }
    
    options.push({
        label: "Back to main house menu",
        onSelect: () => {
            houseMenuPrompt();
        }
    });
    
    if (options.length === 1) {
        print("You need both garlic heads and string to make charms.");
        houseMenuPrompt();
        return;
    }
    
    showPrompt("Garlic charms protect you in the graveyard. What do you do?", options);
}

// Night Resolution
function resolveNight() {
    if (gameOver) return;
    gameOver = true;
    clearPrompt();
    const tile = getTile(player.x, player.y);  
    print("The last trace of twilight disappears. Night settles in fully.");

    if (tile === "H") {
        let defenceScore = 0;
        defenceScore += windowsBoardedSides;     // up to 4
        if (houseGarlicRing) defenceScore += 2;
        defenceScore += litAreas * 0.5;          // up to 2
        if (inventory.includes("Holy Symbol")) defenceScore += 1;
        if (defenceScore >= 6) {
            print("The coven hurls itself against your defences. Boards groan, garlic sizzles, candles flare—but nothing breaks.");
            print("When sunlight knifes through the cracks, the house is still standing. So are you.");
            logAction("survive_house_strong");
        } else if (defenceScore >= 3) {
            print("The house shudders under the assault. One window bursts, another board splinters, but your makeshift fortress holds just long enough.");
            print("You crawl into dawn battered and shaking, but alive.");
            logAction("survive_house_barely");
        } else {
            print("The house was never truly safe. The boards are thin, the dark corners too many, the garlic too sparse.");
            print("By the time the sun rises, the house is quiet again.");
            logAction("death_house_weak");
        }
    } else if (tile === "C" && inventory.includes("Holy Symbol")) {
        print("You cling to the church doorway, pressing the holy symbol to your chest.");
        print("Shadows circle, hissing, but something in the stone and silver keeps them at bay.");
        print("Dawn finds you shivering on the steps, but alive.");
        logAction("survive_church_symbol");
    } else if (tile === "C") {
        print("You shelter near the church, but without a true ward the shadows slip through broken glass and cracked stone.");
        print("The first light of morning never reaches you.");
        logAction("death_church_unprotected");
    } else {
        print("You are caught in the open when the coven descends. Fields and roads offer nowhere to hide.");
        print("By morning, the village is just a little quieter.");
        logAction("death_open_ground");
    }
}

// Logging to flask
function logAction(commandText) {
    fetch("/log_action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            session_id: SESSION_ID,
            turn: turn,
            x: player.x,
            y: player.y,
            hp: hp,
            time_left_seconds: timeLeftSeconds,
            command: commandText,
            state: {
                coins,
                garlicHeads,
                planks,
                nails,
                candles,
                garlicCharms,
                hasString,
                windowsBoardedSides,
                houseGarlicRing,
                litAreas,
                holySymbolFound
            }
        })
    }).catch(() => {});
}

// Listener Events (keys)
window.addEventListener("keydown", (e) => {
    let dir = null;

    if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") dir = "north";
    else if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") dir = "south";
    else if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") dir = "west";
    else if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") dir = "east";

    if (dir) {
        e.preventDefault();
        move(dir);
    }
});

// Leaderboard
function renderLeaderboard(data) {
    const el = document.getElementById("leaderboard");
    const top = data.top || [];
    if (top.length === 0) {
        el.innerHTML = "<p>No surviving runs logged yet.</p>";
        return;
    }
    let html = "<h4>Top Surviving Runs</h4><ol>";
    top.forEach(run => {
        const ready = run.ready_time_left || 0;
        const m = Math.floor(ready / 60);
        const s = ready % 60;  
        const readyStr = `${m}:${s.toString().padStart(2, "0")}`;

        html += "<li>";
        html += `<strong>Session:</strong> ${run.session_id.slice(0, 8)}…<br>`;
        html += `<strong>Ready for sunset at:</strong> ${readyStr}<br>`;
        html += `<strong>Total resources collected</strong><br>`;
        html += `Garlic: ${run.total_garlic}, Coins: ${run.total_coins}<br>`;
        html += `Planks: ${run.total_planks}, Nails: ${run.total_nails}, Candles: ${run.total_candles}, Charms: ${run.total_charms}<br>`;
        html += `<em>Outcome:</em> ${run.final_outcome || "unknown"}`;
        html += "</li>";
    });
    html += "</ol>";
    el.innerHTML = html;
}

function renderLeaderboard(data) {
    const el = document.getElementById("leaderboard");  
    const top = data.top || [];

    if (top.length === 0) {
        el.innerHTML = "<p>No surviving runs logged yet.</p>";
        return;
    }
    let html = "<h4>Top Surviving Runs</h4><ol>";
    top.forEach(run => {
        const ready = run.ready_time_left || 0;
        const m = Math.floor(ready / 60);
        const s = ready % 60;
        const readyStr = `${m}:${s.toString().padStart(2, "0")}`;
        html += "<li>";
        html += `<strong>Ready for sunset at:</strong> ${readyStr}<br>`;
        html += `<strong>Total resources collected</strong><br>`;
        html += `Garlic: ${run.total_garlic}, Coins: ${run.total_coins}<br>`;
        html += `Planks: ${run.total_planks}, Nails: ${run.total_nails}, Candles: ${run.total_candles}, Charms: ${run.total_charms}<br>`;
        html += `<em>Outcome:</em> ${run.final_outcome || "unknown"}`;
        html += "</li>";
    });
    html += "</ol>";
    el.innerHTML = html;
}

function toggleLeaderboard() {  
    const el = document.getElementById("leaderboard");

    // if it's visible, hide it and stop
    if (leaderboardVisible) {
        el.style.display = "none";
        leaderboardVisible = false;
        return;
    }
    // otherwise fetch and show
    fetch("/leaderboard")
    .then(res => res.json())
      .then(data => {
        renderLeaderboard(data);
        el.style.display = "block";
        leaderboardVisible = true;
    })
    .catch(() => {
        el.innerHTML = "<p>Could not load leaderboard.</p>";
        el.style.display = "block";
        leaderboardVisible = true;
    });
}

// attach click handler after page loads
window.addEventListener("load", () => {
    const btn = document.getElementById("leaderboardBtn");
    if (btn) {
        btn.addEventListener("click", toggleLeaderboard);
    }
});