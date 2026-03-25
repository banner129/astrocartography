import * as Astronomy from "astronomy-engine";

export type PlanetName =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export const PLANETS: Array<{ body: Astronomy.Body; name: PlanetName; glyph: string }> = [
  { body: Astronomy.Body.Sun, name: "Sun", glyph: "☉" },
  { body: Astronomy.Body.Moon, name: "Moon", glyph: "☽" },
  { body: Astronomy.Body.Mercury, name: "Mercury", glyph: "☿" },
  { body: Astronomy.Body.Venus, name: "Venus", glyph: "♀" },
  { body: Astronomy.Body.Mars, name: "Mars", glyph: "♂" },
  { body: Astronomy.Body.Jupiter, name: "Jupiter", glyph: "♃" },
  { body: Astronomy.Body.Saturn, name: "Saturn", glyph: "♄" },
  { body: Astronomy.Body.Uranus, name: "Uranus", glyph: "♅" },
  { body: Astronomy.Body.Neptune, name: "Neptune", glyph: "♆" },
  { body: Astronomy.Body.Pluto, name: "Pluto", glyph: "♇" },
];

export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export function getGeocentricEclipticLongitude(body: Astronomy.Body, time: Astronomy.AstroTime): number {
  if (body === Astronomy.Body.Sun) {
    const sun = Astronomy.SunPosition(time);
    return normalizeDegrees(sun.elon);
  }
  const vec = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(vec);
  return normalizeDegrees(ecl.elon);
}

export function normalizeDegrees(deg: number): number {
  let x = deg % 360;
  if (x < 0) x += 360;
  return x;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function parseTimezoneOffset(timezone: string): number {
  const timezoneMap: Record<string, number> = {
    UTC: 0,
    EST: -5,
    PST: -8,
    CST: -6,
    MST: -7,
    CET: 1,
    COT: -5,
    PET: -5,
    CLT: -4,
    ART: -3,
    BRT: -3,
    JST: 9,
    AEST: 10,
    IST: 5.5,
  };

  for (const [tz, offset] of Object.entries(timezoneMap)) {
    if (timezone.toUpperCase().includes(tz)) {
      if (tz === "CST" && (timezone.includes("Beijing") || timezone.includes("China"))) {
        return 8;
      }
      return offset;
    }
  }
  return 0;
}

export function getLocalSiderealTime(dateUtc: Date, longitude: number): number {
  const time = Astronomy.MakeTime(dateUtc);
  const gmstHours = Astronomy.SiderealTime(time);
  const lstDeg = (gmstHours * 15 + longitude) % 360;
  return lstDeg < 0 ? lstDeg + 360 : lstDeg;
}

export function calculateAscendantLongitude(dateUtc: Date, latitude: number, longitude: number): number {
  const epsDeg = 23.4392911;
  const eps = degToRad(epsDeg);
  const phi = degToRad(latitude);
  const theta = degToRad(getLocalSiderealTime(dateUtc, longitude));
  const asc = Math.atan2(Math.sin(theta), Math.cos(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps));
  return normalizeDegrees(radToDeg(asc));
}

export function signIndexFromLongitude(lon: number): number {
  return Math.floor(normalizeDegrees(lon) / 30);
}

export function degreeInSign(lon: number): number {
  return normalizeDegrees(lon) % 30;
}

export function localBirthTimeToUtc(
  birthDate: string,
  birthTime: string,
  timezone: string
): Date {
  const timezoneOffset = parseTimezoneOffset(timezone);
  const [hours, minutes] = birthTime.split(":").map(Number);
  const localTime = new Date(
    `${birthDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
  );
  return new Date(localTime.getTime() - timezoneOffset * 60 * 60 * 1000);
}

export type PlanetRow = {
  name: PlanetName;
  glyph: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number;
};

export type AngleRow = {
  longitude: number;
  sign: string;
  degree: number;
};

/**
 * Whole-sign houses from ascendant at the given place and UTC moment.
 */
export function computeWholeSignChart(utcDate: Date, latitude: number, longitude: number): {
  ascendant: AngleRow;
  planets: PlanetRow[];
} {
  const ascLon = calculateAscendantLongitude(utcDate, latitude, longitude);
  const ascSignIndex = signIndexFromLongitude(ascLon);
  const time = Astronomy.MakeTime(utcDate);

  const planets = PLANETS.map(({ body, name, glyph }) => {
    const lon = getGeocentricEclipticLongitude(body, time);
    const pSignIndex = signIndexFromLongitude(lon);
    const house = ((pSignIndex - ascSignIndex + 12) % 12) + 1;
    return {
      name,
      glyph,
      longitude: lon,
      sign: SIGNS[pSignIndex],
      degree: degreeInSign(lon),
      house,
    };
  });

  return {
    ascendant: {
      longitude: ascLon,
      sign: SIGNS[ascSignIndex],
      degree: degreeInSign(ascLon),
    },
    planets,
  };
}
