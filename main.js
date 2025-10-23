import { kgToLbs, lbsToKg, displayWeight, plateRound } from './logic/units.js';
import { weightToBarLoad } from './logic/barload.js';

// State
const state = {
  totalWeight: 0,
  unit: 'kg',
  rounding: 'nearest',
  barWeight: 20,
  collarWeight: 2.5,
  useCollars: true,
  // Store per-unit bar/collar weights
  savedWeights: {
    kg: { bar: 20, collar: 2.5 },
    lbs: { bar: 45, collar: 5.51 }
  },
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

// LocalStorage functions
const STORAGE_KEY = 'kilocalc-state';

function saveState() {
  const toSave = {
    totalWeight: state.totalWeight,
    unit: state.unit,
    rounding: state.rounding,
    useCollars: state.useCollars,
    savedWeights: state.savedWeights,
    availablePlatesKg: state.availablePlatesKg,
    availablePlatesLbs: state.availablePlatesLbs
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    state.totalWeight = parsed.totalWeight || 0;
    state.unit = parsed.unit || 'kg';
    state.rounding = parsed.rounding || 'nearest';
    state.useCollars = parsed.useCollars !== undefined ? parsed.useCollars : true;

    if (parsed.savedWeights) {
      state.savedWeights = parsed.savedWeights;
    }

    state.barWeight = state.savedWeights[state.unit].bar;
    state.collarWeight = state.savedWeights[state.unit].collar;

    if (parsed.availablePlatesKg) {
      state.availablePlatesKg = parsed.availablePlatesKg;
    }
    if (parsed.availablePlatesLbs) {
      state.availablePlatesLbs = parsed.availablePlatesLbs;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
}

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

  // Calculate effective collar weight based on useCollars
  const effectiveCollarWeight = state.useCollars ? state.collarWeight : 0;

  // Primary barbell
  const barLoad = weightToBarLoad(
    state.totalWeight,
    getPlates(state.unit),
    state.barWeight,
    effectiveCollarWeight
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
    displayWeight(effectiveCollarWeight)
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
  if (!state.useCollars) {
    otherCollarWeight = 0;
  } else if (otherUnit === 'kg') {
    otherCollarWeight = 2.5;
  } else {
    // lbs: convert 2.5kg to lbs
    otherCollarWeight = kgToLbs(2.5);
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
    displayWeight(otherCollarWeight)
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
        saveState();
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
        saveState();
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
    saveState();
    renderBarbells();
  });

  // Unit toggle buttons
  document.querySelectorAll('.unit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const oldUnit = state.unit;
      const newUnit = e.target.dataset.unit;

      // Save current weights for old unit
      state.savedWeights[oldUnit] = {
        bar: state.barWeight,
        collar: state.collarWeight
      };

      // Restore weights for new unit
      state.unit = newUnit;
      state.barWeight = state.savedWeights[newUnit].bar;
      state.collarWeight = state.savedWeights[newUnit].collar;

      // Update input fields
      document.getElementById('bar-weight-input').value = state.barWeight;
      document.getElementById('collar-weight-input').value = state.collarWeight;

      // Update unit labels
      document.getElementById('bar-unit-label').textContent = newUnit;
      document.getElementById('collar-unit-label').textContent = newUnit;

      // Update active state
      document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      // Update hidden radio for compatibility
      document.getElementById(`unit-${newUnit}`).checked = true;

      saveState();
      renderBarbells();
    });
  });

  // Rounding radios
  document.querySelectorAll('input[name="rounding"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.rounding = e.target.value;
      saveState();
      renderBarbells();
    });
  });

  // Bar weight
  document.getElementById('bar-weight-input').addEventListener('input', (e) => {
    state.barWeight = Number(e.target.value) || 0;
    // Save to current unit
    state.savedWeights[state.unit].bar = state.barWeight;
    saveState();
    renderBarbells();
  });

  // Collar weight
  document.getElementById('collar-weight-input').addEventListener('input', (e) => {
    state.collarWeight = Number(e.target.value) || 0;
    // Save to current unit
    state.savedWeights[state.unit].collar = state.collarWeight;
    saveState();
    renderBarbells();
  });

  // Use collars checkbox
  document.getElementById('use-collars-checkbox').addEventListener('change', (e) => {
    state.useCollars = e.target.checked;

    // Update collar weight input to reflect effective value
    const collarInput = document.getElementById('collar-weight-input');
    if (state.useCollars) {
      // Set to saved collar weight for this unit
      state.collarWeight = state.savedWeights[state.unit].collar;
      collarInput.value = state.collarWeight;
    } else {
      // Show 0 but don't change saved value
      collarInput.value = 0;
    }

    saveState();
    renderBarbells();
  });

  // Drawer functionality
  const drawer = document.getElementById('settings-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const drawerHandle = document.getElementById('drawer-handle');
  let isDrawerOpen = false;

  function toggleDrawer() {
    isDrawerOpen = !isDrawerOpen;
    if (isDrawerOpen) {
      drawer.classList.add('open');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      drawer.classList.remove('open');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  drawerHandle.addEventListener('click', toggleDrawer);
  backdrop.addEventListener('click', toggleDrawer);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupEventListeners();
  renderPlatesInputs();
  renderBarbells();

  // Update UI to match loaded state
  const totalWeightInput = document.getElementById('total-weight-input');
  if (totalWeightInput) {
    totalWeightInput.value = state.totalWeight || '';
  }

  // Update unit toggle
  document.querySelectorAll('.unit-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.unit === state.unit);
  });
  document.getElementById(`unit-${state.unit}`).checked = true;

  // Update bar/collar inputs
  document.getElementById('bar-weight-input').value = state.barWeight;
  document.getElementById('collar-weight-input').value = state.useCollars ? state.collarWeight : 0;

  // Update unit labels
  document.getElementById('bar-unit-label').textContent = state.unit;
  document.getElementById('collar-unit-label').textContent = state.unit;

  // Update use collars checkbox
  document.getElementById('use-collars-checkbox').checked = state.useCollars;

  // Update rounding radio
  document.querySelector(`input[name="rounding"][value="${state.rounding}"]`).checked = true;
});
