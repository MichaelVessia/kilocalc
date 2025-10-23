export const kgToLbs = kg => {
  return kg * 2.20462262;
};

export const lbsToKg = lbs => {
  return lbs / 2.20462262;
};

export const displayWeight = weight => {
  return weight.toFixed(2).replace(".00", "");
};

export const plateRound = (weight, smallestPlate, rounding) => {
  const roundTo = smallestPlate * 2;
  let roundingFn;
  if (rounding === "up") {
    roundingFn = Math.ceil;
  } else if (rounding === "down") {
    roundingFn = Math.floor;
  } else {
    roundingFn = Math.round;
  }
  return roundingFn(weight / roundTo) * roundTo;
};
