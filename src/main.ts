import {
  kgToLbs,
  lbsToKg,
  displayWeight,
  plateRound,
  kg,
  lbs,
  type Unit,
  type RoundingMode,
} from "./logic/units.ts";
import { weightToBarLoad, type Plate, type BarLoad } from "./logic/barload.ts";

// Plate color configuration
interface PlateColors {
  plateColor: string;
  textColor: string;
}

// State interface
interface SavedWeights {
  kg: { bar: number; collar: number };
  lbs: { bar: number; collar: number };
}

interface AppState {
  totalWeight: number;
  unit: Unit;
  rounding: RoundingMode;
  barWeight: number;
  collarWeight: number;
  useCollars: boolean;
  savedWeights: SavedWeights;
  availablePlatesKg: Plate[];
  availablePlatesLbs: Plate[];
  plateColors: Record<string, PlateColors>;
}

// State
const state: AppState = {
  totalWeight: 100,
  unit: "kg",
  rounding: "nearest",
  barWeight: 20,
  collarWeight: 2.5,
  useCollars: true,
  // Store per-unit bar/collar weights
  savedWeights: {
    kg: { bar: 20, collar: 2.5 },
    lbs: { bar: 45, collar: 5.51 },
  },
  availablePlatesKg: [
    { weight: 50, pairs: 0 },
    { weight: 25, pairs: 8 },
    { weight: 20, pairs: 1 },
    { weight: 15, pairs: 1 },
    { weight: 10, pairs: 1 },
    { weight: 5, pairs: 1 },
    { weight: 2.5, pairs: 1 },
    { weight: 1.25, pairs: 1 },
  ],
  availablePlatesLbs: [
    { weight: 45, pairs: 8 },
    { weight: 35, pairs: 0 },
    { weight: 25, pairs: 1 },
    { weight: 10, pairs: 1 },
    { weight: 5, pairs: 1 },
    { weight: 2.5, pairs: 1 },
  ],
  // Custom plate colors
  plateColors: {},
};

// LocalStorage functions
const STORAGE_KEY = "kilocalc-state";

interface SavedState {
  totalWeight?: number;
  unit?: Unit;
  rounding?: RoundingMode;
  useCollars?: boolean;
  savedWeights?: SavedWeights;
  availablePlatesKg?: Plate[];
  availablePlatesLbs?: Plate[];
  plateColors?: Record<string, PlateColors>;
}

function saveState(): void {
  const toSave: SavedState = {
    totalWeight: state.totalWeight,
    unit: state.unit,
    rounding: state.rounding,
    useCollars: state.useCollars,
    savedWeights: state.savedWeights,
    availablePlatesKg: state.availablePlatesKg,
    availablePlatesLbs: state.availablePlatesLbs,
    plateColors: state.plateColors,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function loadState(): void {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed: SavedState = JSON.parse(saved);
    state.totalWeight = parsed.totalWeight !== undefined ? parsed.totalWeight : 100;
    state.unit = parsed.unit || "kg";
    state.rounding = parsed.rounding || "nearest";
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
    if (parsed.plateColors) {
      state.plateColors = parsed.plateColors;
    }
  } catch (e) {
    console.error("Failed to load state:", e);
  }
}

// Helper functions
function getPlates(unit: Unit): Plate[] {
  const plates = unit === "kg" ? state.availablePlatesKg : state.availablePlatesLbs;
  return plates.filter((plate) => plate.pairs > 0);
}

function getSmallestPlate(unit: Unit): number {
  const plates = getPlates(unit);
  return plates[plates.length - 1].weight;
}

function getPlateColor(weight: number, unit: Unit): PlateColors {
  // Check for custom color
  const customKey = `${weight}-${unit}`;
  if (state.plateColors[customKey]) {
    return state.plateColors[customKey];
  }

  // Default colors
  if (unit === "kg") {
    switch (weight) {
      case 25:
        return { plateColor: "red", textColor: "black" };
      case 20:
        return { plateColor: "blue", textColor: "white" };
      case 15:
        return { plateColor: "yellow", textColor: "black" };
      case 10:
        return { plateColor: "green", textColor: "black" };
      case 5:
        return { plateColor: "white", textColor: "black" };
      case 2.5:
        return { plateColor: "black", textColor: "white" };
      case 1.25:
        return { plateColor: "gray", textColor: "black" };
      default:
        return { plateColor: "black", textColor: "white" };
    }
  }
  return { plateColor: "gray", textColor: "black" };
}

function getPlateHeight(weight: number, unit: Unit): number {
  const maxHeight = 110;

  const kgHeights: Record<number, number> = {
    15: maxHeight * 0.9,
    10: maxHeight * 0.8,
    5: maxHeight * 0.7,
    2.5: maxHeight * 0.6,
    1.25: maxHeight * 0.5,
    1: maxHeight * 0.4,
    0.5: maxHeight * 0.3,
    0.25: maxHeight * 0.2,
  };

  const lbsHeights: Record<number, number> = {
    25: maxHeight * 0.9,
    10: maxHeight * 0.8,
    5: maxHeight * 0.7,
    2.5: maxHeight * 0.6,
    1.25: maxHeight * 0.5,
    1: maxHeight * 0.4,
    0.5: maxHeight * 0.3,
    0.25: maxHeight * 0.2,
  };

  const heights = unit === "kg" ? kgHeights : lbsHeights;
  return heights[weight] || maxHeight;
}

function createPlateElement(weight: number, unit: Unit): HTMLDivElement {
  const plate = document.createElement("div");
  plate.className = "plate";

  const colors = getPlateColor(weight, unit);
  const height = getPlateHeight(weight, unit);

  plate.style.height = `${height}px`;
  plate.style.backgroundColor = colors.plateColor;
  plate.style.color = colors.textColor;

  const text = document.createElement("span");
  text.className = "plate-text";
  text.textContent = String(weight);
  plate.appendChild(text);

  return plate;
}

function createBarbellElement(
  barLoad: BarLoad,
  _weight: number,
  unit: Unit,
  platesAvailable: Plate[],
  barWeightVal: string,
  collarWeightVal: string,
): HTMLDivElement {
  const container = document.createElement("div");

  const plateContainer = document.createElement("div");
  plateContainer.className = "plate-container";

  // Bar
  const bar = document.createElement("div");
  bar.className = "bar";
  bar.textContent = barWeightVal;
  plateContainer.appendChild(bar);

  // Plates
  barLoad.forEach((plateWeight) => {
    const numWeight = typeof plateWeight === "string" ? parseFloat(plateWeight) : plateWeight;
    if (platesAvailable.some((p) => p.weight === numWeight)) {
      const plate = createPlateElement(numWeight, unit);
      plateContainer.appendChild(plate);
    }
  });

  // Collar
  const collarWeightNum = parseFloat(collarWeightVal);
  if (collarWeightNum > 0) {
    const collar = document.createElement("div");
    collar.className = "collar";
    collar.textContent = collarWeightVal;
    plateContainer.appendChild(collar);

    const barEnd = document.createElement("div");
    barEnd.className = "bar";
    barEnd.innerHTML = "&nbsp;";
    plateContainer.appendChild(barEnd);
  }

  container.appendChild(plateContainer);

  // Remainder
  const remainder = barLoad.filter((plateWeight) => {
    const numWeight = typeof plateWeight === "string" ? parseFloat(plateWeight) : plateWeight;
    return !platesAvailable.some((p) => p.weight === numWeight);
  });

  if (remainder.length > 0) {
    const remainderText = document.createElement("p");
    remainderText.className = "remainder-text";
    remainderText.textContent = `+ ${remainder}${unit} remainder`;
    container.appendChild(remainderText);
  }

  return container;
}

function renderBarbells(): void {
  const barbellsView = document.getElementById("barbells-view");
  if (!barbellsView) return;
  barbellsView.innerHTML = "";

  if (state.totalWeight === 0) {
    return;
  }

  const container = document.createElement("div");
  container.className = "barbells-container";

  // Calculate effective collar weight based on useCollars
  const effectiveCollarWeight = state.useCollars ? state.collarWeight : 0;

  // If total weight < bar + collars, don't show collars in UI
  const displayCollarWeight =
    state.totalWeight < state.barWeight + effectiveCollarWeight * 2 ? 0 : effectiveCollarWeight;

  // Primary barbell
  const barLoad = weightToBarLoad(
    state.totalWeight,
    getPlates(state.unit),
    state.barWeight,
    effectiveCollarWeight,
  );

  const primaryCol = document.createElement("div");
  primaryCol.className = "barbell-col";

  const primaryTitle = document.createElement("h2");
  primaryTitle.textContent = `${state.totalWeight}${state.unit}`;
  primaryCol.appendChild(primaryTitle);

  const primaryBarbell = createBarbellElement(
    barLoad,
    state.totalWeight,
    state.unit,
    getPlates(state.unit),
    displayWeight(state.barWeight),
    displayWeight(displayCollarWeight),
  );
  primaryCol.appendChild(primaryBarbell);

  // Converted barbell
  const convert =
    state.unit === "kg" ? (v: number) => kgToLbs(kg(v)) : (v: number) => lbsToKg(lbs(v));
  const otherUnit: Unit = state.unit === "kg" ? "lbs" : "kg";
  const otherSmallestPlate = getSmallestPlate(otherUnit);
  const convertedWeight = convert(state.totalWeight);
  const otherWeight = plateRound(convertedWeight, otherSmallestPlate, state.rounding);

  let otherBarWeight: number;
  if (otherUnit === "lbs" && state.barWeight === 20) {
    otherBarWeight = 45;
  } else if (otherUnit === "kg" && state.barWeight === 45) {
    otherBarWeight = 20;
  } else {
    otherBarWeight = convert(state.barWeight);
  }

  let otherCollarWeight: number;
  if (!state.useCollars) {
    otherCollarWeight = 0;
  } else if (otherUnit === "kg") {
    otherCollarWeight = 2.5;
  } else {
    // lbs: convert 2.5kg to lbs
    otherCollarWeight = kgToLbs(kg(2.5));
  }

  // If total weight < bar + collars, don't show collars in UI
  const otherDisplayCollarWeight =
    otherWeight < otherBarWeight + otherCollarWeight * 2 ? 0 : otherCollarWeight;

  const otherBarLoad = weightToBarLoad(
    otherWeight,
    getPlates(otherUnit),
    otherBarWeight,
    otherCollarWeight,
  );

  const otherCol = document.createElement("div");
  otherCol.className = "barbell-col";

  const otherTitle = document.createElement("h2");
  otherTitle.textContent = `${displayWeight(convertedWeight)}${otherUnit}`;
  otherCol.appendChild(otherTitle);

  const otherBarbell = createBarbellElement(
    otherBarLoad,
    otherWeight,
    otherUnit,
    getPlates(otherUnit),
    displayWeight(otherBarWeight),
    displayWeight(otherDisplayCollarWeight),
  );
  otherCol.appendChild(otherBarbell);

  const roundedText = document.createElement("p");
  roundedText.className = "rounded-text";
  roundedText.textContent = `Rounded ${state.rounding}: ${plateRound(otherWeight, otherSmallestPlate, state.rounding)}${otherUnit}`;
  otherCol.appendChild(roundedText);

  container.appendChild(primaryCol);
  container.appendChild(otherCol);

  barbellsView.appendChild(container);
}

function renderPlatesInputs(): void {
  const kgContainer = document.getElementById("plates-kg-container");
  const lbsContainer = document.getElementById("plates-lbs-container");

  if (!kgContainer || !lbsContainer) return;

  kgContainer.innerHTML = "";
  lbsContainer.innerHTML = "";

  state.availablePlatesKg.forEach((plate) => {
    const div = document.createElement("div");
    div.className = "plate-input";

    const label = document.createElement("label");
    label.className = "plate-label";
    label.textContent = `${plate.weight}kg:`;

    const colors = getPlateColor(plate.weight, "kg");
    const colorIndicator = document.createElement("span");
    colorIndicator.className = "color-indicator";
    colorIndicator.style.backgroundColor = colors.plateColor;
    colorIndicator.style.border = colors.plateColor === "white" ? "1px solid #ccc" : "none";

    label.insertBefore(colorIndicator, label.firstChild);
    label.style.cursor = "pointer";
    label.addEventListener("click", () => openColorPicker(plate.weight, "kg"));

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = String(plate.pairs);
    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const newPairs = Number(target.value);
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

  state.availablePlatesLbs.forEach((plate) => {
    const div = document.createElement("div");
    div.className = "plate-input";

    const label = document.createElement("label");
    label.className = "plate-label";
    label.textContent = `${plate.weight}lbs:`;

    const colors = getPlateColor(plate.weight, "lbs");
    const colorIndicator = document.createElement("span");
    colorIndicator.className = "color-indicator";
    colorIndicator.style.backgroundColor = colors.plateColor;
    colorIndicator.style.border = colors.plateColor === "white" ? "1px solid #ccc" : "none";

    label.insertBefore(colorIndicator, label.firstChild);
    label.style.cursor = "pointer";
    label.addEventListener("click", () => openColorPicker(plate.weight, "lbs"));

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = String(plate.pairs);
    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const newPairs = Number(target.value);
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

// Color picker
function openColorPicker(weight: number, unit: Unit): void {
  const customKey = `${weight}-${unit}`;

  // Create modal
  const modal = document.createElement("div");
  modal.className = "color-picker-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "color-picker-content";

  const title = document.createElement("h3");
  title.textContent = `${weight}${unit} Plate Color`;
  modalContent.appendChild(title);

  // Predefined colors
  const colors = [
    { name: "Red", bg: "red", text: "black" },
    { name: "Blue", bg: "blue", text: "white" },
    { name: "Yellow", bg: "yellow", text: "black" },
    { name: "Green", bg: "green", text: "black" },
    { name: "White", bg: "white", text: "black" },
    { name: "Black", bg: "black", text: "white" },
    { name: "Gray", bg: "gray", text: "black" },
    { name: "Orange", bg: "orange", text: "black" },
    { name: "Lime", bg: "#32CD32", text: "black" },
    { name: "Dark Orange", bg: "#FF8C00", text: "black" },
  ];

  const colorGrid = document.createElement("div");
  colorGrid.className = "color-grid";

  colors.forEach((color) => {
    const colorBtn = document.createElement("button");
    colorBtn.className = "color-option";
    colorBtn.style.backgroundColor = color.bg;
    colorBtn.style.color = color.text;
    colorBtn.textContent = String(weight);
    if (color.bg === "white") {
      colorBtn.style.border = "1px solid #ccc";
    }

    colorBtn.addEventListener("click", () => {
      state.plateColors[customKey] = {
        plateColor: color.bg,
        textColor: color.text,
      };
      saveState();
      renderBarbells();
      renderPlatesInputs();
      document.body.removeChild(modal);
    });

    colorGrid.appendChild(colorBtn);
  });

  modalContent.appendChild(colorGrid);

  // Reset button
  const resetBtn = document.createElement("button");
  resetBtn.className = "color-reset-btn";
  resetBtn.textContent = "Reset to Default";
  resetBtn.addEventListener("click", () => {
    delete state.plateColors[customKey];
    saveState();
    renderBarbells();
    renderPlatesInputs();
    document.body.removeChild(modal);
  });
  modalContent.appendChild(resetBtn);

  modal.appendChild(modalContent);

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  document.body.appendChild(modal);
}

// Event handlers
function setupEventListeners(): void {
  // Total weight input
  const totalWeightInput = document.getElementById("total-weight-input");
  if (totalWeightInput) {
    totalWeightInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      state.totalWeight = Number(target.value) || 0;
      saveState();
      renderBarbells();
    });
  }

  // Unit toggle buttons
  document.querySelectorAll<HTMLButtonElement>(".unit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;
      const oldUnit = state.unit;
      const newUnit = target.dataset.unit as Unit;

      // Save current weights for old unit
      state.savedWeights[oldUnit] = {
        bar: state.barWeight,
        collar: state.collarWeight,
      };

      // Restore weights for new unit
      state.unit = newUnit;
      state.barWeight = state.savedWeights[newUnit].bar;
      state.collarWeight = state.savedWeights[newUnit].collar;

      // Update input fields
      const barWeightInput = document.getElementById("bar-weight-input") as HTMLInputElement | null;
      const collarWeightInput = document.getElementById(
        "collar-weight-input",
      ) as HTMLInputElement | null;

      if (barWeightInput) barWeightInput.value = String(state.barWeight);
      if (collarWeightInput) collarWeightInput.value = String(state.collarWeight);

      // Update unit labels
      const barUnitLabel = document.getElementById("bar-unit-label");
      const collarUnitLabel = document.getElementById("collar-unit-label");

      if (barUnitLabel) barUnitLabel.textContent = newUnit;
      if (collarUnitLabel) collarUnitLabel.textContent = newUnit;

      // Update active state
      document
        .querySelectorAll<HTMLButtonElement>(".unit-btn")
        .forEach((b) => b.classList.remove("active"));
      target.classList.add("active");

      // Update hidden radio for compatibility
      const unitRadio = document.getElementById(`unit-${newUnit}`) as HTMLInputElement | null;
      if (unitRadio) unitRadio.checked = true;

      saveState();
      renderBarbells();
    });
  });

  // Rounding radios
  document.querySelectorAll<HTMLInputElement>('input[name="rounding"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      state.rounding = target.value as RoundingMode;
      saveState();
      renderBarbells();
    });
  });

  // Bar weight
  const barWeightInput = document.getElementById("bar-weight-input");
  if (barWeightInput) {
    barWeightInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      state.barWeight = Number(target.value) || 0;
      // Save to current unit
      state.savedWeights[state.unit].bar = state.barWeight;
      saveState();
      renderBarbells();
    });
  }

  // Collar weight
  const collarWeightInput = document.getElementById("collar-weight-input");
  if (collarWeightInput) {
    collarWeightInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      state.collarWeight = Number(target.value) || 0;
      // Save to current unit
      state.savedWeights[state.unit].collar = state.collarWeight;
      saveState();
      renderBarbells();
    });
  }

  // Use collars checkbox
  const useCollarsCheckbox = document.getElementById("use-collars-checkbox");
  if (useCollarsCheckbox) {
    useCollarsCheckbox.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      state.useCollars = target.checked;

      // Update collar weight input to reflect effective value
      const collarInput = document.getElementById("collar-weight-input") as HTMLInputElement | null;
      if (collarInput) {
        if (state.useCollars) {
          // Set to saved collar weight for this unit
          state.collarWeight = state.savedWeights[state.unit].collar;
          collarInput.value = String(state.collarWeight);
          collarInput.disabled = false;
        } else {
          // Show 0 but don't change saved value
          collarInput.value = "0";
          collarInput.disabled = true;
        }
      }

      saveState();
      renderBarbells();
    });
  }

  // Drawer functionality
  const drawer = document.getElementById("settings-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const drawerHandle = document.getElementById("drawer-handle");
  let isDrawerOpen = false;

  function toggleDrawer(): void {
    isDrawerOpen = !isDrawerOpen;
    if (isDrawerOpen) {
      drawer?.classList.add("open");
      backdrop?.classList.add("active");
      document.body.style.overflow = "hidden";
    } else {
      drawer?.classList.remove("open");
      backdrop?.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  drawerHandle?.addEventListener("click", toggleDrawer);
  backdrop?.addEventListener("click", toggleDrawer);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setupEventListeners();
  renderPlatesInputs();
  renderBarbells();

  // Update UI to match loaded state
  const totalWeightInput = document.getElementById("total-weight-input") as HTMLInputElement | null;
  if (totalWeightInput) {
    totalWeightInput.value = String(state.totalWeight) || "";
  }

  // Update unit toggle
  document.querySelectorAll<HTMLButtonElement>(".unit-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.unit === state.unit);
  });
  const unitRadio = document.getElementById(`unit-${state.unit}`) as HTMLInputElement | null;
  if (unitRadio) unitRadio.checked = true;

  // Update bar/collar inputs
  const barWeightInput = document.getElementById("bar-weight-input") as HTMLInputElement | null;
  const collarInput = document.getElementById("collar-weight-input") as HTMLInputElement | null;

  if (barWeightInput) barWeightInput.value = String(state.barWeight);
  if (collarInput) {
    collarInput.value = state.useCollars ? String(state.collarWeight) : "0";
    collarInput.disabled = !state.useCollars;
  }

  // Update unit labels
  const barUnitLabel = document.getElementById("bar-unit-label");
  const collarUnitLabel = document.getElementById("collar-unit-label");

  if (barUnitLabel) barUnitLabel.textContent = state.unit;
  if (collarUnitLabel) collarUnitLabel.textContent = state.unit;

  // Update use collars checkbox
  const useCollarsCheckbox = document.getElementById(
    "use-collars-checkbox",
  ) as HTMLInputElement | null;
  if (useCollarsCheckbox) useCollarsCheckbox.checked = state.useCollars;

  // Update rounding radio
  const roundingRadio = document.querySelector<HTMLInputElement>(
    `input[name="rounding"][value="${state.rounding}"]`,
  );
  if (roundingRadio) roundingRadio.checked = true;
});
