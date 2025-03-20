const cost = {
  // name: [manpower, gold],
  line_infantry: [200, 50],
  light_infantry: [225, 75],
  guard: [300, 75],
  hussar: [100, 125],
  lancer: [150, 150],
  cuirassier: [150, 200],
  "12lb": [25, 300],
  howitzer: [25, 250],
  horse_artillery: [25, 200],
}
const budget = {
  // name: [manpower, gold]
  clash: [2150, 1200],
  combat: [3550, 1975],
  battle: [5175, 3000],
  grandbattle: [10550, 6000],
}
let previousPly = [];
let ply = [];
let hashes = [];
let plyCount = 0;

// put all your inputs in "starting" and "mode"
// please note that this program is made and is equipped PURELY for optimisation
// if you can, please spam the rest of the resources to line infantry or any unit
const starting = { 
  line_infantry: 2,
  light_infantry: 4, // put -1 for restricted/banned
  guard: 2,
  hussar: 2,
  lancer: 0,
  cuirassier: -1,
  "12lb": -1, 
  howitzer: -1,
  horse_artillery: 2,
}
const mode = "clash"; // lowercase, no space

function totalCost(comp) {
  let manpower = 0;
  let gold = 0;
  for (let unit in comp) {
    manpower += cost[unit][0]*comp[unit];
    gold += cost[unit][1]*comp[unit]
  }
  return [manpower, gold]
}
console.log(totalCost(starting))

function budgetLeft(cost) {
  let [manpower, gold] = budget[mode];
  return [manpower - cost[0], gold - cost[1]];
}
console.log(budgetLeft(totalCost(starting)))

function hash(obj) { // no idea what this does internally
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash * 31 + char) | 0;
    }
    return hash.toString(16);
}
console.log(hash(starting))

let done = false;
let time = Date.now();
let temp = {};

for (let unit in starting) {
  if (starting[unit] != -1) temp[unit] = starting[unit];
}
console.log(temp)
previousPly.push(temp);

// BEWARE: my code was not made for public usage.
console.log("Searching.");
setInterval(() => {
  if (done) return; // hehehe sorry im lazy
  time = Date.now();
  
  for (let i = 0; i < previousPly.length; i++) {
    for (let unit in previousPly[i]) {
      for (let j = 0; j < 2; j++) {
        let current = structuredClone(previousPly[i]);
        current[unit] += (j*2)-1; // -1 if j=0, +1 if j=1
        if (current[unit] < 0) continue;
        
        let budget = budgetLeft(totalCost(current));
        if (budget[0] >= 0 && budget[1] >= 0) {
          if (budget[0] == 0 && budget[1] == 0) {
            console.log("Found it!", current);
            done = true; // dont force the current ply to stop otherwise alternate combinations wont work
          }
          
          // this hash lookup table system is integral for the speed of this script
          const currentHash = hash(current)
          if (!hashes.includes(currentHash)) {
            ply.push(current);
            hashes.push(currentHash)
          }
        }
      }
    }
  }
  
  console.log(`Ply size: ${ply.length} (${plyCount}) (Took ${(Date.now()-time)*0.001}s)`)
  previousPly = ply
  ply = [];
  plyCount++;
}, 1000)