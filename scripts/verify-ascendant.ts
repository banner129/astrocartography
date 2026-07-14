/**
 * Regression: Lima 1970-10-27 18:42 PET must yield Taurus Ascendant
 * (customer case / Astro.com), not Aquarius (old buggy formula ≈ MC).
 */
import {
  calculateAscendantLongitude,
  computeWholeSignChart,
  localBirthTimeToUtc,
  SIGNS,
  signIndexFromLongitude,
} from "../src/lib/natal-chart-core";

const LIMA = { lat: -12.0464, lng: -77.0428 };
const utc = localBirthTimeToUtc("1970-10-27", "18:42", "PET (Lima)");
const ascLon = calculateAscendantLongitude(utc, LIMA.lat, LIMA.lng);
const sign = SIGNS[signIndexFromLongitude(ascLon)];
const chart = computeWholeSignChart(utc, LIMA.lat, LIMA.lng);

console.log("UTC:", utc.toISOString());
console.log("ASC longitude:", ascLon.toFixed(4));
console.log("ASC sign:", sign, chart.ascendant.degree.toFixed(2));

if (sign !== "Taurus") {
  console.error("FAIL: expected Taurus Ascendant, got", sign);
  process.exit(1);
}

if (utc.toISOString() !== "1970-10-27T23:42:00.000Z") {
  console.error("FAIL: expected UTC 1970-10-27T23:42:00.000Z, got", utc.toISOString());
  process.exit(1);
}

// Degree should be ~13° (Astro.com / standard formula), not ~15° Aquarius
if (chart.ascendant.degree < 10 || chart.ascendant.degree > 17) {
  console.error("FAIL: unexpected Taurus degree", chart.ascendant.degree);
  process.exit(1);
}

console.log("OK");
