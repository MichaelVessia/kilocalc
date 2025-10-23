import { kgToLbs, lbsToKg, displayWeight, plateRound } from './logic/units.js';
import { weightToBarLoad } from './logic/barload.js';

// State
const state = {
  totalWeight: 0,
  unit: 'kg',
  rounding: 'nearest',
  barWeight: 20,
  collarWeight: 2.5,
  availablePlatesKg: [
    { weight: 50, pairs: 0 },
    { weight: 25, pairs: 8 },
    { weight: 20, pairs: 1 },
    { weight: 15, pairs: 1 },
    { weight: 10, pairs: 1 },
    { weight: 5, pairs: 1 },
    { weight: 2.5, pairs: 1 },
    { weight: 1.25, pairs: 1 }
  ],
  availablePlatesLbs: [
    { weight: 45, pairs: 8 },
    { weight: 35, pairs: 0 },
    { weight: 25, pairs: 1 },
    { weight: 10, pairs: 1 },
    { weight: 5, pairs: 1 },
    { weight: 2.5, pairs: 1 }
  ]
};

// Helper functions
function getPlates(unit) {
  const plates = unit === 'kg' ? state.availablePlatesKg : state.availablePlatesLbs;
  return plates.filter(plate => plate.pairs > 0);
}

function getSmallestPlate(unit) {
  const plates = getPlates(unit);
  return plates[plates.length - 1].weight;
}

function getPlateColor(weight, unit) {
  if (unit === 'kg') {
    switch (weight) {
      case 25: return { plateColor: 'red', textColor: 'black' };
      case 20: return { plateColor: 'blue', textColor: 'white' };
      case 15: return { plateColor: 'yellow', textColor: 'black' };
      case 10: return { plateColor: 'green', textColor: 'black' };
      case 5: return { plateColor: 'white', textColor: 'black' };
      case 2.5: return { plateColor: 'black', textColor: 'white' };
      case 1.25: return { plateColor: 'gray', textColor: 'black' };
      default: return { plateColor: 'black', textColor: 'white' };
    }
  }
  return { plateColor: 'gray', textColor: 'black' };
}

function getPlateHeight(weight, unit) {
  const maxHeight = 160;

  const kgHeights = {
    15: maxHeight * 0.9,
    10: maxHeight * 0.8,
    5: maxHeight * 0.7,
    2.5: maxHeight * 0.6,
    1.25: maxHeight * 0.5,
    1: maxHeight * 0.4,
    0.5: maxHeight * 0.3,
    0.25: maxHeight * 0.2
  };

  const lbsHeights = {
    25: maxHeight * 0.9,
    10: maxHeight * 0.8,
    5: maxHeight * 0.7,
    2.5: maxHeight * 0.6,
    1.25: maxHeight * 0.5,
    1: maxHeight * 0.4,
    0.5: maxHeight * 0.3,
    0.25: maxHeight * 0.2
  };

  const heights = unit === 'kg' ? kgHeights : lbsHeights;
  return heights[weight] || maxHeight;
}

function createPlateElement(weight, unit) {
  const plate = document.createElement('div');
  plate.className = 'plate';

  const colors = getPlateColor(weight, unit);
  const height = getPlateHeight(weight, unit);

  plate.style.height = `${height}px`;
  plate.style.backgroundColor = colors.plateColor;
  plate.style.color = colors.textColor;

  const text = document.createElement('span');
  text.className = 'plate-text';
  text.textContent = weight;
  plate.appendChild(text);

  return plate;
}

function createBarbellElement(barLoad, weight, unit, platesAvailable, barWeightVal, collarWeightVal) {
  const container = document.createElement('div');

  const plateContainer = document.createElement('div');
  plateContainer.className = 'plate-container';

  // Bar
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.textContent = barWeightVal;
  plateContainer.appendChild(bar);

  // Plates
  barLoad.forEach((plateWeight, i) => {
    if (platesAvailable.some(p => p.weight === plateWeight)) {
      const plate = createPlateElement(plateWeight, unit);
      plateContainer.appendChild(plate);
    }
  });

  // Collar
  if (collarWeightVal > 0) {
    const collar = document.createElement('div');
    collar.className = 'collar';
    collar.textContent = collarWeightVal;
    plateContainer.appendChild(collar);

    const barEnd = document.createElement('div');
    barEnd.className = 'bar';
    barEnd.innerHTML = '&nbsp;';
    plateContainer.appendChild(barEnd);
  }

  container.appendChild(plateContainer);

  // Remainder
  const remainder = barLoad.filter(
    plate => !platesAvailable.some(p => p.weight === plate)
  );

  if (remainder.length > 0) {
    const remainderText = document.createElement('p');
    remainderText.className = 'remainder-text';
    remainderText.textContent = `+ ${remainder}${unit} remainder`;
    container.appendChild(remainderText);
  }

  return container;
}

function renderBarbells() {
  const barbellsView = document.getElementById('barbells-view');
  barbellsView.innerHTML = '';

  if (state.totalWeight === 0) {
    return;
  }

  const container = document.createElement('div');
  container.className = 'barbells-container';

  // Primary barbell
  const barLoad = weightToBarLoad(
    state.totalWeight,
    getPlates(state.unit),
    state.barWeight,
    state.collarWeight
  );

  const primaryCol = document.createElement('div');
  primaryCol.className = 'barbell-col';

  const primaryTitle = document.createElement('h2');
  primaryTitle.textContent = `${state.totalWeight}${state.unit}`;
  primaryCol.appendChild(primaryTitle);

  const primaryBarbell = createBarbellElement(
    barLoad,
    state.totalWeight,
    state.unit,
    getPlates(state.unit),
    displayWeight(state.barWeight),
    state.collarWeight
  );
  primaryCol.appendChild(primaryBarbell);

  // Converted barbell
  const convert = state.unit === 'kg' ? kgToLbs : lbsToKg;
  const otherUnit = state.unit === 'kg' ? 'lbs' : 'kg';
  const otherSmallestPlate = getSmallestPlate(otherUnit);
  const otherWeight = plateRound(
    convert(state.totalWeight),
    otherSmallestPlate,
    state.rounding
  );

  let otherBarWeight;
  if (otherUnit === 'lbs' && state.barWeight === 20) {
    otherBarWeight = 45;
  } else if (otherUnit === 'kg' && state.barWeight === 45) {
    otherBarWeight = 20;
  } else {
    otherBarWeight = convert(state.barWeight);
  }

  let otherCollarWeight;
  if (otherUnit === 'lbs' || (otherUnit === 'kg' && state.collarWeight === 0)) {
    otherCollarWeight = 0;
  } else if (otherUnit === 'kg' && state.collarWeight > 0) {
    otherCollarWeight = 2.5;
  } else {
    otherCollarWeight = 5.51;
  }

  const otherBarLoad = weightToBarLoad(
    otherWeight,
    getPlates(otherUnit),
    otherBarWeight,
    otherCollarWeight
  );

  const otherCol = document.createElement('div');
  otherCol.className = 'barbell-col';

  const otherTitle = document.createElement('h2');
  otherTitle.textContent = `${displayWeight(convert(state.totalWeight))}${otherUnit}`;
  otherCol.appendChild(otherTitle);

  const otherBarbell = createBarbellElement(
    otherBarLoad,
    otherWeight,
    otherUnit,
    getPlates(otherUnit),
    displayWeight(otherBarWeight),
    otherCollarWeight
  );
  otherCol.appendChild(otherBarbell);

  const roundedText = document.createElement('p');
  roundedText.className = 'rounded-text';
  roundedText.textContent = `Rounded ${state.rounding}: ${plateRound(otherWeight, otherSmallestPlate, state.rounding)}${otherUnit}`;
  otherCol.appendChild(roundedText);

  container.appendChild(primaryCol);
  container.appendChild(otherCol);

  barbellsView.appendChild(container);
}

function renderPlatesInputs() {
  const kgContainer = document.getElementById('plates-kg-container');
  const lbsContainer = document.getElementById('plates-lbs-container');

  kgContainer.innerHTML = '';
  lbsContainer.innerHTML = '';

  state.availablePlatesKg.forEach(plate => {
    const div = document.createElement('div');
    div.className = 'plate-input';

    const label = document.createElement('label');
    label.textContent = `${plate.weight}kg:`;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.value = plate.pairs;
    input.addEventListener('input', (e) => {
      const newPairs = Number(e.target.value);
      if (!isNaN(newPairs)) {
        plate.pairs = newPairs;
        renderBarbells();
      }
    });

    div.appendChild(label);
    div.appendChild(input);
    kgContainer.appendChild(div);
  });

  state.availablePlatesLbs.forEach(plate => {
    const div = document.createElement('div');
    div.className = 'plate-input';

    const label = document.createElement('label');
    label.textContent = `${plate.weight}lbs:`;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.value = plate.pairs;
    input.addEventListener('input', (e) => {
      const newPairs = Number(e.target.value);
      if (!isNaN(newPairs)) {
        plate.pairs = newPairs;
        renderBarbells();
      }
    });

    div.appendChild(label);
    div.appendChild(input);
    lbsContainer.appendChild(div);
  });
}

// Event handlers
function setupEventListeners() {
  // Total weight input
  document.getElementById('total-weight-input').addEventListener('input', (e) => {
    state.totalWeight = Number(e.target.value) || 0;
    renderBarbells();
  });

  // Unit radios
  document.querySelectorAll('input[name="unit"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.unit = e.target.value;
      document.getElementById('unit-display').textContent = state.unit;
      renderBarbells();
    });
  });

  // Rounding radios
  document.querySelectorAll('input[name="rounding"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.rounding = e.target.value;
      renderBarbells();
    });
  });

  // Bar weight
  document.getElementById('bar-weight-input').addEventListener('input', (e) => {
    state.barWeight = Number(e.target.value) || 0;
    renderBarbells();
  });

  // Collar weight
  document.getElementById('collar-weight-input').addEventListener('input', (e) => {
    state.collarWeight = Number(e.target.value) || 0;
    renderBarbells();
  });

  // Advanced options toggle
  const toggleBtn = document.getElementById('toggle-advanced');
  const advancedContent = document.getElementById('advanced-content');
  let isOpen = false;

  toggleBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    advancedContent.style.display = isOpen ? 'block' : 'none';
    toggleBtn.textContent = isOpen ? 'Hide Advanced Options' : 'Show Advanced Options';
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  renderPlatesInputs();
  renderBarbells();
});
