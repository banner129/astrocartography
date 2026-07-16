/**
 * Spot-check Midheaven for Lima 1970-10-27 18:42 PET.
 * Expected: Aquarius MC (~16°), distinct from Taurus Ascendant.
 */
import {
  calculateAscendantLongitude,
  calculateMidheavenLongitude,
  degreeInSign,
  localBirthTimeToUtc,
  SIGNS,
  signIndexFromLongitude,
} from "../src/lib/natal-chart-core";

const LIMA = { lat: -12.0464, lng: -77.0428 };
const utc = localBirthTimeToUtc("1970-10-27", "18:42", "PET (Lima)");
const mcLon = calculateMidheavenLongitude(utc, LIMA.lng);
const ascLon = calculateAscendantLongitude(utc, LIMA.lat, LIMA.lng);
const mcSign = SIGNS[signIndexFromLongitude(mcLon)];
const ascSign = SIGNS[signIndexFromLongitude(ascLon)];
const mcDeg = degreeInSign(mcLon);

console.log("UTC:", utc.toISOString());
console.log("MC longitude:", mcLon.toFixed(4), "→", mcSign, mcDeg.toFixed(2));
console.log("ASC longitude:", ascLon.toFixed(4), "→", ascSign);

if (mcSign !== "Aquarius") {
  console.error("FAIL: expected Aquarius Midheaven, got", mcSign);
  process.exit(1);
}

if (ascSign !== "Taurus") {
  console.error("FAIL: ASC regression — expected Taurus, got", ascSign);
  process.exit(1);
}

// Expected Aquarius MC (~12° with our sidereal/obliquity model); ASC must stay Taurus
if (mcDeg < 8 || mcDeg > 20) {
  console.error("FAIL: unexpected Aquarius MC degree", mcDeg);
  process.exit(1);
}

console.log("OK");
