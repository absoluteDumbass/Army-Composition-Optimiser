// Army composition data
const cost = {
  // name: [manpower, gold],
  line_infantry: [200, 50],
  light_infantry: [200, 75],
  guard: [300, 75],
  grenadier: [275, 50],
  militia: [150, 25],
  hussar: [75, 100],
  lancer: [100, 125],
  dragoon: [125, 100],
  cuirassier: [150, 125],
  "12lb": [50, 350],
  "8lb": [25, 275],
  "4lb": [25, 175],
  howitzer: [50, 200],
  horse_artillery: [75, 225],
}

const budget = {
  // name: [manpower, gold]
  skirmish: [1425, 725],
  clash: [2500, 1500],
  combat: [4750, 2450],
  battle: [8000, 4400],
  grandbattle: [15000, 7500],
}

const unitDisplayNames = {
    line_infantry: "Line Infantry",
    light_infantry: "Light Infantry",
    guard: "Guards",
    grenadier: "Grenadiers",
    militia: "Militia",
    hussar: "Hussars",
    lancer: "Lancers",
    dragoon: "Dragoons",
    cuirassier: "Cuirassiers",
    "12lb": "12-lb Foot Artillery",
    "8lb": "8-lb Foot Artillery",
    "4lb": "4-lb Foot Artillery",
    howitzer: "6-in Howitzers",
    horse_artillery: "4-lb Horse Artillery",
};

// State
let currentMode = "grandbattle";
let composition = {
    line_infantry: 50,
    light_infantry: 10,
    guard: 0,
    militia: -1,
    hussar: 0,
    lancer: 6,
    dragoon: 4,
    cuirassier: 7,
    "12lb": 0,
    "8lb": 6,
    howitzer: -1,
    horse_artillery: -1,
};

// DOM elements
const modeButtons = document.querySelectorAll(".mode-btn");
const resetBtn = document.getElementById("reset-btn");
const optimizeBtn = document.getElementById("optimize-btn");
const unitsTbody = document.getElementById("units-tbody");
const manpowerElement = document.getElementById("manpower");
const goldElement = document.getElementById("gold");
const manpowerLeftElement = document.getElementById("manpower-left");
const goldLeftElement = document.getElementById("gold-left");
const resultSection = document.getElementById("result-section");
const loader = document.getElementById("loader");
const optimizationResult = document.getElementById("optimization-result");
const themeToggle = document.getElementById("checkbox");
const modeIcon = document.querySelector(".mode-icon");

// Initialize
function init() {
    updateResourceDisplay();
    populateUnitsTable();

    // Check for saved theme preference or preferred color scheme
    const savedTheme =
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light");

    if (savedTheme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        themeToggle.checked = true;
        modeIcon.textContent = "🌙";
    } else {
        modeIcon.textContent = "☀️";
    }

    // Event listeners
    modeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            modeButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentMode = btn.dataset.mode;
            updateResourceDisplay();
            updateResourcesLeft();
        });
    });

    resetBtn.addEventListener("click", resetComposition);
    optimizeBtn.addEventListener("click", optimizeComposition);

    // Theme toggle event listener
    themeToggle.addEventListener("change", switchTheme, false);
}

function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        modeIcon.textContent = "🌙";
    } else {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
        modeIcon.textContent = "☀️";
    }
}

function updateResourceDisplay() {
    const [manpower, gold] = budget[currentMode];
    manpowerElement.textContent = manpower;
    goldElement.textContent = gold;
    updateResourcesLeft();
}

function populateUnitsTable() {
    unitsTbody.innerHTML = "";

    for (const unit in cost) {
        const [manpower, gold] = cost[unit];
        const row = document.createElement("tr");

        row.innerHTML = `
                    <td>${unitDisplayNames[unit]}</td>
                    <td>${manpower}</td>
                    <td>${gold}</td>
                    <td>
                        <div class="unit-controls">
                            <button class="unit-btn" data-unit="${unit}" data-action="decrease">-</button>
                            <span class="unit-count" id="${unit}-count">${
            composition[unit] >= 0 ? composition[unit] : 0
        }</span>
                            <button class="unit-btn" data-unit="${unit}" data-action="increase">+</button>
                        </div>
                    </td>
                    <td>
                        <input type="checkbox" class="unit-toggle" data-unit="${unit}" ${
            composition[unit] >= 0 ? "checked" : ""
        }>
                    </td>
                `;

        unitsTbody.appendChild(row);
    }

    // Add event listeners to buttons and checkboxes
    document.querySelectorAll(".unit-btn").forEach((btn) => {
        btn.addEventListener("click", handleUnitCountChange);
    });

    document.querySelectorAll(".unit-toggle").forEach((checkbox) => {
        checkbox.addEventListener("change", handleUnitToggle);
    });
}

function handleUnitCountChange(e) {
    const unit = e.target.dataset.unit;
    const action = e.target.dataset.action;

    if (composition[unit] < 0) {
        composition[unit] = 0;
    }

    if (action === "increase") {
        composition[unit]++;
    } else if (action === "decrease" && composition[unit] > 0) {
        composition[unit]--;
    }

    document.getElementById(`${unit}-count`).textContent = composition[unit];
    updateResourcesLeft();
}

function handleUnitToggle(e) {
    const unit = e.target.dataset.unit;
    const isChecked = e.target.checked;

    if (isChecked) {
        if (composition[unit] < 0) {
            composition[unit] = 0;
        }
    } else {
        composition[unit] = -1;
        document.getElementById(`${unit}-count`).textContent = 0;
    }

    updateResourcesLeft();
}

function totalCost(comp) {
    let manpower = 0;
    let gold = 0;

    for (let unit in comp) {
        if (comp[unit] > 0) {
            manpower += cost[unit][0] * comp[unit];
            gold += cost[unit][1] * comp[unit];
        }
    }

    return [manpower, gold];
}

function budgetLeft(costArray) {
    let [manpower, gold] = budget[currentMode];
    return [manpower - costArray[0], gold - costArray[1]];
}

function updateResourcesLeft() {
    const costs = totalCost(composition);
    const [manpowerLeft, goldLeft] = budgetLeft(costs);

    manpowerLeftElement.textContent = manpowerLeft;
    goldLeftElement.textContent = goldLeft;

    // Change color based on remaining resources
    manpowerLeftElement.style.color =
        manpowerLeft < 0 ? "var(--british-red)" : "inherit";
    goldLeftElement.style.color =
        goldLeft < 0 ? "var(--british-red)" : "inherit";
}

function resetComposition() {
    composition = {
        line_infantry: 0,
        light_infantry: 0,
        guard: 0,
        grenadier: 0,
        militia: 0,
        hussar: 0,
        lancer: 0,
        dragoon: 0,
        cuirassier: 0,
        "12lb": 0,
        "8lb": 0,
        "4lb": 0,
        howitzer: 0,
        horse_artillery: 0,
    };

    populateUnitsTable();
    updateResourcesLeft();
    resultSection.classList.remove("show");
}

function hash(obj) {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash * 31 + char) | 0;
    }
    return hash.toString(16);
}

function optimizeComposition() {
    // Show loading state
    resultSection.classList.add("show");
    loader.style.display = "block";
    optimizationResult.innerHTML = "";

    // Clean up composition to only include enabled units
    let startingComp = {};
    for (let unit in composition) {
        if (composition[unit] >= 0) {
            startingComp[unit] = composition[unit];
        }
    }

    // Start optimization process
    let previousPly = [startingComp];
    console.log(startingComp)
    let ply = [];
    let hashes = new Set(hash(startingComp));
    let max = [100000, 100000];
    let curmax = [0, 0]
    let plyCount = 0;
    let hasFoundBestSolution = false;
    let solutions = [];

    // Set timeout to prevent blocking UI
    setTimeout(function runOptimization() {
        for (let i = 0; i < previousPly.length; i++) {
            for (let unit in previousPly[i]) {
                for (let j = 0; j < 2; j++) {
                    let current = structuredClone(previousPly[i]);
                    current[unit] += (j * 2) - 1; // -1 if j=0, +1 if j=1
                    if (current[unit] < 0) continue;

                    let budget = budgetLeft(totalCost(current));
                    if (budget[0] >= 0 && 
                        budget[1] >= 0 && 
                        budget[0] < max[0] && 
                        budget[1] < max[1]) {
                        // clamp down on comps with too much leftovers
                        curmax[0] = Math.max(budget[0], 650);
                        curmax[1] = Math.max(budget[1], 650);
                        
                        const currentHash = hash(current);

                        if (!hashes.has(currentHash)) {
                          if (
                              budget[0] == 0 &&
                              budget[1] == 0
                          ) {
                              solutions.push(current);
                              hasFoundBestSolution = true;
                          }

                          ply.push(current);
                          hashes.add(currentHash);
                        }
                    }
                }
            }
        }

        max = curmax;
        if (ply.length < 100) {
          max = [100000, 100000];
        }
        previousPly = ply;
        ply = [];
        plyCount++;

        // Display optimization progress
        optimizationResult.innerHTML = `<p>The Imperial Staff is deliberating... Strategy iteration ${plyCount} (${previousPly.length} combinations)</p>`;

        // If nothing found after 20 plies or solution found, stop
        if (plyCount > 20 || hasFoundBestSolution) {
            if (!hasFoundBestSolution) {
                // Find best partial solution
                let bestComps = [];
                let minLeftover = Infinity;

                for (let comp of previousPly) {
                    const [manLeft, goldLeft] = budgetLeft(totalCost(comp));
                    if (manLeft >= 0 && goldLeft >= 0) {
                        const leftover = manLeft + goldLeft;
                        if (leftover < minLeftover) {
                            minLeftover = leftover;
                            bestComps = [comp];
                        } else if (leftover == minLeftover) {
                            bestComps.push(comp);
                        }
                    }
                }

                solutions = bestComps || startingComp;
            }

            displayResults(solutions, 0);
        } else {
            setTimeout(runOptimization, 0); // Continue optimization
        }
    }, 0);
}

function displayResults(solutions, solutionIndex) {
  console.log(solutions)
    const solution = solutions[solutionIndex];
    optimizationResult.innerHTML = ``;
    loader.style.display = "none";
    if (!solution) {
        optimizationResult.innerHTML = `
                    <div class="alert">
                        <p>The Imperial Staff could not devise an optimal battle plan. Consider adjusting your unit selections, Field Marshal.</p>
                    </div>
                `;
        return;
    }

    const costs = totalCost(solution);
    const [manpowerLeft, goldLeft] = budgetLeft(costs);

    let resultHTML = `
                <div class="decoration">
                    <hr><span>⚜</span><hr>
                </div>
                
                <div class="resources">
                    <div class="resource">
                        <h3>Manpower Committed</h3>
                        <div class="resource-value">${costs[0]}</div>
                        <div>In Reserve: ${manpowerLeft}</div>
                    </div>
                    <div class="resource">
                        <h3>Treasury Spent</h3>
                        <div class="resource-value">${costs[1]}</div>
                        <div>Remaining: ${goldLeft}</div>
                    </div>
                </div>
                
                <h3>Optimal Deployment ${solutionIndex + 1} / ${
        solutions.length
    }<span class="emblem">⚔</span></h3>
                
                <div class="optimization-result">
                    <table class="units-table">
                        <thead>
                            <tr>
                                <th>Regiment</th>
                                <th>Battalions</th>
                                <th>Manpower</th>
                                <th>Gold</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

    for (const unit in solution) {
        if (solution[unit] > 0) {
            resultHTML += `
                        <tr>
                            <td>${unitDisplayNames[unit]}</td>
                            <td><strong>${solution[unit]}</strong></td>
                            <td>${cost[unit][0] * solution[unit]}</td>
                            <td>${cost[unit][1] * solution[unit]}</td>
                        </tr>
                    `;
        }
    }

    resultHTML += `
                        </tbody>
                    </table>
                </div>
                
                <div class="decoration">
                    <hr><span>✠</span><hr>
                </div>
                
                <div class="buttons">
                    <button class="btn result-nav-button" id="previous-solution-button"> < </button>
                    <button class="btn" id="apply-btn">Implement Battle Plan</button>
                    <button class="btn result-nav-button" id="next-solution-button"> > </button>
                    
                </div>
            `;

    optimizationResult.innerHTML = resultHTML;

    // Add event listener to the apply button
    document.getElementById("apply-btn").addEventListener("click", () => {
        composition = { ...composition, ...solution };
        populateUnitsTable();
        updateResourcesLeft();
    });

    document
        .getElementById("previous-solution-button")
        .addEventListener("click", () => {
            if (solutionIndex < 1) {
                return;
            }
            displayResults(solutions, solutionIndex - 1);
        });

    document
        .getElementById("next-solution-button")
        .addEventListener("click", () => {
            if (solutionIndex + 1 > solutions.length - 1) {
                return;
            }
            displayResults(solutions, solutionIndex + 1);
        });
}

// Initialize the application
document.addEventListener("DOMContentLoaded", init);

var slideTimeMilis = 600;

document.addEventListener('DOMContentLoaded', function() {
    const modalWindow = document.getElementById('guide-modal');
    const modal = document.getElementsByClassName('modal-content')[0];
    const guideBtn = document.getElementById('guide-btn');
    const closeBtn = document.querySelector('.close');
    
    // Open the modal when the guide button is clicked
    guideBtn.addEventListener('click', function() {
        modalWindow.style.display = 'block';
        modal.classList.toggle('showing');
        modal.classList.toggle('hiding');
    });
    
    // Close the modal when the close button is clicked
    closeBtn.addEventListener('click', function() {
        
        setTimeout(function() {
            modalWindow.style.display = 'none';
        }, slideTimeMilis); // Wait for the hiding animation to finish

        modal.classList.toggle('showing');
        modal.classList.toggle('hiding');
    });
    
    // Close the modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modalWindow) {
            
            setTimeout(function() {
                modalWindow.style.display = 'none';
            }, slideTimeMilis); // Wait for the hiding animation to finish

            modal.classList.toggle('showing');
            modal.classList.toggle('hiding');
        }
    });
});
