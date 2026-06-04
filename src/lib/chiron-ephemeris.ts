import ephemeris from "@/data/chiron-ephemeris.json";
import { SIGNS, degreeInSign, normalizeDegrees, signIndexFromLongitude } from "@/lib/natal-chart-core";

const DAY_MS = 86400000;

type ChironEphemeris = {
  start: string;
  stepDays: number;
  scale: number;
  count: number;
  longitude: number[];
};

const CHIRON_DATA = ephemeris as ChironEphemeris;
const START_MS = Date.parse(CHIRON_DATA.start);
const STEP_MS = CHIRON_DATA.stepDays * DAY_MS;

export function getChironPlacement(utcDate: Date) {
  const position = (utcDate.getTime() - START_MS) / STEP_MS;
  if (!Number.isFinite(position) || position < 0 || position > CHIRON_DATA.count - 1) {
    throw new Error("Chiron ephemeris supports birth dates from 1900-01-01 through 2051-01-01.");
  }

  const index = Math.floor(position);
  const fraction = position - index;
  const current = CHIRON_DATA.longitude[index];
  const next = CHIRON_DATA.longitude[Math.min(index + 1, CHIRON_DATA.count - 1)];
  if (current == null || next == null) {
    throw new Error("Chiron ephemeris lookup failed.");
  }

  const unwrappedLongitude = (current + (next - current) * fraction) / CHIRON_DATA.scale;
  const longitude = normalizeDegrees(unwrappedLongitude);
  const signIndex = signIndexFromLongitude(longitude);
  const prev = CHIRON_DATA.longitude[Math.max(index - 1, 0)];
  const following = CHIRON_DATA.longitude[Math.min(index + 1, CHIRON_DATA.count - 1)];

  return {
    label: "Chiron",
    glyph: "⚷",
    longitude,
    sign: SIGNS[signIndex],
    degree: degreeInSign(longitude),
    isRetrograde: prev != null && following != null ? following < prev : false,
  };
}
