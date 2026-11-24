"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, Globe, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { cn } from "@/lib/utils";
import type { PlacementPageContent } from "@/lib/placement-page-content";

const TIMEZONE_OPTIONS = [
  "UTC (London, Dublin)",
  "EST (New York)",
  "PST (Los Angeles)",
  "CST (Chicago)",
  "MST (Denver)",
  "CET (Paris, Berlin)",
  "COT (Bogotá)",
  "PET (Lima)",
  "CLT (Santiago)",
  "ART (Buenos Aires)",
  "BRT (São Paulo)",
  "JST (Tokyo)",
  "AEST (Sydney)",
  "IST (Mumbai)",
  "CST (Beijing)",
];

type PlacementResult = {
  success: boolean;
  error?: string;
  data?: {
    type: string;
    birthData: {
      date: string;
      time: string;
      location: string;
      latitude: number;
      longitude: number;
      timezone: string;
    };
    placements: Array<{
      label: string;
      glyph: string;
      sign: string;
      degree: number;
      house: number;
      isRetrograde?: boolean;
    }>;
    sun?: {
      glyph: string;
      sign: string;
      degree: number;
    };
    usedDefaultNoon?: boolean;
    nearSignBoundary?: boolean;
    note: string;
  };
};

const FORM_COPY: Record<string, {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timezone: string;
  useCoordinates: string;
  useCityName: string;
  datePlaceholder: string;
  locationPlaceholder: string;
  coordinatesPlaceholder: string;
  tip: string;
  calculating: string;
  privacy: string;
  warning: string;
  defaultError: string;
  retryError: string;
  wholeSignHouse: (house: number) => string;
}> = {
  en: {
    birthDate: "Birth Date",
    birthTime: "Birth Time",
    birthLocation: "Birth Location",
    timezone: "Timezone",
    useCoordinates: "Use coordinates",
    useCityName: "Use city name",
    datePlaceholder: "YYYY-MM-DD",
    locationPlaceholder: "City, Country",
    coordinatesPlaceholder: "e.g. 40.7128, -74.006",
    tip: 'Tip: include country for better accuracy (e.g. "Paris, France").',
    calculating: "Calculating...",
    privacy: "We don't store your birth data.",
    warning: "Warning",
    defaultError: "Unable to calculate this placement.",
    retryError: "Unable to calculate this placement. Please try again.",
    wholeSignHouse: (house) => `Whole-sign house ${house}`,
  },
  zh: {
    birthDate: "出生日期",
    birthTime: "出生时间",
    birthLocation: "出生地点",
    timezone: "时区",
    useCoordinates: "使用坐标",
    useCityName: "使用城市名",
    datePlaceholder: "YYYY-MM-DD",
    locationPlaceholder: "城市，国家",
    coordinatesPlaceholder: "例如 40.7128, -74.006",
    tip: "提示：填写国家可以提升地点识别准确性，例如 Paris, France。",
    calculating: "计算中...",
    privacy: "我们不会存储你的出生数据。",
    warning: "提示",
    defaultError: "暂时无法计算这个位置。",
    retryError: "暂时无法计算这个位置，请稍后再试。",
    wholeSignHouse: (house) => `整宫制第 ${house} 宫`,
  },
  es: {
    birthDate: "Fecha de nacimiento",
    birthTime: "Hora de nacimiento",
    birthLocation: "Lugar de nacimiento",
    timezone: "Zona horaria",
    useCoordinates: "Usar coordenadas",
    useCityName: "Usar ciudad",
    datePlaceholder: "AAAA-MM-DD",
    locationPlaceholder: "Ciudad, pais",
    coordinatesPlaceholder: "ej. 40.7128, -74.006",
    tip: 'Consejo: incluye el pais para mayor precision (ej. "Paris, France").',
    calculating: "Calculando...",
    privacy: "No guardamos tus datos de nacimiento.",
    warning: "Aviso",
    defaultError: "No se pudo calcular esta posicion.",
    retryError: "No se pudo calcular esta posicion. Intentalo de nuevo.",
    wholeSignHouse: (house) => `Casa de signo entero ${house}`,
  },
  pt: {
    birthDate: "Data de nascimento",
    birthTime: "Hora de nascimento",
    birthLocation: "Local de nascimento",
    timezone: "Fuso horario",
    useCoordinates: "Usar coordenadas",
    useCityName: "Usar cidade",
    datePlaceholder: "AAAA-MM-DD",
    locationPlaceholder: "Cidade, pais",
    coordinatesPlaceholder: "ex. 40.7128, -74.006",
    tip: 'Dica: inclua o pais para mais precisao (ex. "Paris, France").',
    calculating: "Calculando...",
    privacy: "Nao armazenamos seus dados de nascimento.",
    warning: "Aviso",
    defaultError: "Nao foi possivel calcular esta posicao.",
    retryError: "Nao foi possivel calcular esta posicao. Tente novamente.",
    wholeSignHouse: (house) => `Casa por signo inteiro ${house}`,
  },
  de: {
    birthDate: "Geburtsdatum",
    birthTime: "Geburtszeit",
    birthLocation: "Geburtsort",
    timezone: "Zeitzone",
    useCoordinates: "Koordinaten nutzen",
    useCityName: "Stadtnamen nutzen",
    datePlaceholder: "JJJJ-MM-TT",
    locationPlaceholder: "Stadt, Land",
    coordinatesPlaceholder: "z. B. 40.7128, -74.006",
    tip: 'Tipp: Land angeben fur bessere Genauigkeit (z. B. "Paris, France").',
    calculating: "Berechnung...",
    privacy: "Wir speichern deine Geburtsdaten nicht.",
    warning: "Hinweis",
    defaultError: "Diese Position konnte nicht berechnet werden.",
    retryError: "Diese Position konnte nicht berechnet werden. Bitte erneut versuchen.",
    wholeSignHouse: (house) => `Ganzzeichen-Haus ${house}`,
  },
  it: {
    birthDate: "Data di nascita",
    birthTime: "Ora di nascita",
    birthLocation: "Luogo di nascita",
    timezone: "Fuso orario",
    useCoordinates: "Usa coordinate",
    useCityName: "Usa citta",
    datePlaceholder: "AAAA-MM-GG",
    locationPlaceholder: "Citta, paese",
    coordinatesPlaceholder: "es. 40.7128, -74.006",
    tip: 'Suggerimento: includi il paese per piu precisione (es. "Paris, France").',
    calculating: "Calcolo...",
    privacy: "Non salviamo i tuoi dati di nascita.",
    warning: "Avviso",
    defaultError: "Impossibile calcolare questa posizione.",
    retryError: "Impossibile calcolare questa posizione. Riprova.",
    wholeSignHouse: (house) => `Casa a segno intero ${house}`,
  },
};

const SIGN_ORDER = [
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
];

function optionalTimeHint(locale: string, toolType: string, fallback: string) {
  if (toolType === "mercury") {
    if (locale === "zh") return "大多数日期可以不填。水星换座比火星更频繁，换座日请补上时间。不填则按当地正午计算，宫位只作参考。";
    if (locale === "es") return "Opcional la mayoría de los días. Mercurio cambia de signo más a menudo que Marte; añade la hora si ese día cambió de signo. Sin hora usamos el mediodía local y la casa queda provisional.";
    if (locale === "pt") return "Opcional na maioria dos dias. Mercúrio muda de signo com mais frequência que Marte; acrescente a hora se nesse dia ele mudou de signo. Sem hora usamos o meio-dia local e a casa fica provisória.";
    if (locale === "de") return "An den meisten Tagen optional. Merkur wechselt öfter das Zeichen als Mars; am Wechseltag die Uhrzeit ergänzen. Ohne Uhrzeit rechnen wir mit lokalem Mittag, das Haus bleibt vorläufig.";
    if (locale === "it") return "Facoltativa nella maggior parte dei giorni. Mercurio cambia segno più spesso di Marte; aggiungi l'ora se quel giorno ha cambiato segno. Senza ora usiamo mezzogiorno locale e la casa resta provvisoria.";
    return "Optional for most birthdays. Mercury changes signs more often than Mars, so add a time on sign-change days. Without a time we use local noon, and the house stays provisional.";
  }
  if (toolType === "jupiter") {
    if (locale === "zh") return "绝大多数日期可以不填。木星通常在一个星座停留约一年。不填则按当地正午计算，宫位只作参考。";
    if (locale === "es") return "Opcional en casi todos los cumpleaños. Júpiter suele permanecer en un signo alrededor de un año. Sin hora usamos el mediodía local y la casa queda provisional.";
    if (locale === "pt") return "Opcional em quase todos os aniversários. Júpiter costuma ficar em um signo por cerca de um ano. Sem hora usamos o meio-dia local e a casa fica provisória.";
    if (locale === "de") return "An fast jedem Geburtstag optional. Jupiter bleibt meist etwa ein Jahr in einem Zeichen. Ohne Uhrzeit rechnen wir mit lokalem Mittag, das Haus bleibt vorläufig.";
    if (locale === "it") return "Facoltativa in quasi tutti i compleanni. Giove resta di solito in un segno per circa un anno. Senza ora usiamo mezzogiorno locale e la casa resta provvisoria.";
    return "Optional for almost every birthday. Jupiter usually stays in a sign for about a year. Without a time we use local noon, and the house stays provisional.";
  }
  if (toolType === "saturn") {
    if (locale === "zh") return "绝大多数日期可以不填。土星通常在一个星座停留约两到两年半。不填则按当地正午计算，宫位只作参考。";
    if (locale === "es") return "Opcional en casi todos los cumpleaños. Saturno suele permanecer en un signo unos dos o dos años y medio. Sin hora usamos el mediodía local y la casa queda provisional.";
    if (locale === "pt") return "Opcional em quase todos os aniversários. Saturno costuma ficar em um signo por cerca de dois a dois anos e meio. Sem hora usamos o meio-dia local e a casa fica provisória.";
    if (locale === "de") return "An fast jedem Geburtstag optional. Saturn bleibt meist etwa zwei bis zweieinhalb Jahre in einem Zeichen. Ohne Uhrzeit rechnen wir mit lokalem Mittag, das Haus bleibt vorläufig.";
    if (locale === "it") return "Facoltativa in quasi tutti i compleanni. Saturno resta di solito in un segno per circa due o due anni e mezzo. Senza ora usiamo mezzogiorno locale e la casa resta provvisoria.";
    return "Optional for almost every birthday. Saturn usually stays in a sign for about two to two and a half years. Without a time we use local noon, and the house stays provisional.";
  }
  if (locale === "en") {
    return "Optional for most birthdays. Add time for ingress days and a reliable Mars house; otherwise we use local noon.";
  }
  return fallback;
}

/** Localized methodology note shown under the placement result (API still returns English). */
function placementResultNote(locale: string, toolType: string, usedDefaultNoon?: boolean): string | null {
  if (toolType !== "jupiter" && toolType !== "saturn") return null;

  const notes: Record<"jupiter" | "saturn", Record<string, { base: string; noon: string }>> = {
    jupiter: {
      en: {
        base: "Jupiter is calculated from geocentric ecliptic longitude (astronomy-engine) in the tropical zodiac and shown with whole-sign house placement. Jupiter usually stays in one sign for about a year. Exact birth time matters on the rare ingress day and for the house. This calculator does not use the Swiss Ephemeris.",
        noon: " No birth time was provided, so Jupiter was calculated for local noon at the birth place. That is enough for the sign on nearly every birthday, but not for house placement.",
      },
      zh: {
        base: "木星按地心黄道经度（astronomy-engine）在回归黄道中计算，并以整宫制显示宫位。木星通常在一个星座停留约一年。准确出生时间主要影响少见的换座日和宫位。本计算器不使用瑞士星历。",
        noon: " 未提供出生时间，故按出生地当地正午计算木星。这对几乎所有生日的星座足够，但不足以定宫。",
      },
      es: {
        base: "Júpiter se calcula a partir de la longitud eclíptica geocéntrica (astronomy-engine) en el zodiaco tropical y se muestra con casas de signo completo. Júpiter suele permanecer en un signo alrededor de un año. La hora exacta importa en el raro día de ingreso y para la casa. Esta calculadora no usa la Efemérides Suiza.",
        noon: " No se indicó hora de nacimiento, así que Júpiter se calculó al mediodía local del lugar de nacimiento. Eso basta para el signo en casi todos los cumpleaños, pero no para la casa.",
      },
      pt: {
        base: "Júpiter é calculado a partir da longitude eclíptica geocêntrica (astronomy-engine) no zodíaco tropical e mostrado com casas de signo inteiro. Júpiter costuma ficar em um signo por cerca de um ano. A hora exata importa no raro dia de ingresso e para a casa. Esta calculadora não usa a Efeméride Suíça.",
        noon: " Nenhuma hora de nascimento foi informada, então Júpiter foi calculado para o meio-dia local do local de nascimento. Isso basta para o signo em quase todos os aniversários, mas não para a casa.",
      },
      de: {
        base: "Jupiter wird aus geozentrischer ekliptikaler Länge (astronomy-engine) im tropischen Tierkreis berechnet und mit Ganzzeichen-Häusern gezeigt. Jupiter bleibt meist etwa ein Jahr in einem Zeichen. Die genaue Geburtszeit zählt am seltenen Wechseltag und für das Haus. Dieser Rechner nutzt nicht die Schweizer Ephemeride.",
        noon: " Ohne Geburtszeit wurde Jupiter für den lokalen Mittag am Geburtsort berechnet. Das reicht für das Zeichen an fast jedem Geburtstag, aber nicht für das Haus.",
      },
      it: {
        base: "Giove è calcolato dalla longitudine eclittica geocentrica (astronomy-engine) nello zodiaco tropicale e mostrato con case a segno intero. Giove resta di solito in un segno per circa un anno. L'ora esatta conta nel raro giorno di ingresso e per la casa. Questo calcolatore non usa le Effemeridi Svizzere.",
        noon: " Nessuna ora di nascita è stata fornita, quindi Giove è stato calcolato per il mezzogiorno locale del luogo di nascita. Basta per il segno in quasi tutti i compleanni, ma non per la casa.",
      },
    },
    saturn: {
      en: {
        base: "Saturn is calculated from geocentric ecliptic longitude (astronomy-engine) in the tropical zodiac and shown with whole-sign house placement. Saturn usually stays in one sign for about two to two and a half years. Exact birth time matters on the rare ingress day and for the house. This calculator does not use the Swiss Ephemeris.",
        noon: " No birth time was provided, so Saturn was calculated for local noon at the birth place. That is enough for the sign on nearly every birthday, but not for house placement.",
      },
      zh: {
        base: "土星按地心黄道经度（astronomy-engine）在回归黄道中计算，并以整宫制显示宫位。土星通常在一个星座停留约两到两年半。准确出生时间主要影响少见的换座日和宫位。本计算器不使用瑞士星历。",
        noon: " 未提供出生时间，故按出生地当地正午计算土星。这对几乎所有生日的星座足够，但不足以定宫。",
      },
      es: {
        base: "Saturno se calcula a partir de la longitud eclíptica geocéntrica (astronomy-engine) en el zodiaco tropical y se muestra con casas de signo completo. Saturno suele permanecer en un signo unos dos o dos años y medio. La hora exacta importa en el raro día de ingreso y para la casa. Esta calculadora no usa la Efemérides Suiza.",
        noon: " No se indicó hora de nacimiento, así que Saturno se calculó al mediodía local del lugar de nacimiento. Eso basta para el signo en casi todos los cumpleaños, pero no para la casa.",
      },
      pt: {
        base: "Saturno é calculado a partir da longitude eclíptica geocêntrica (astronomy-engine) no zodíaco tropical e mostrado com casas de signo inteiro. Saturno costuma ficar em um signo por cerca de dois a dois anos e meio. A hora exata importa no raro dia de ingresso e para a casa. Esta calculadora não usa a Efeméride Suíça.",
        noon: " Nenhuma hora de nascimento foi informada, então Saturno foi calculado para o meio-dia local do local de nascimento. Isso basta para o signo em quase todos os aniversários, mas não para a casa.",
      },
      de: {
        base: "Saturn wird aus geozentrischer ekliptikaler Länge (astronomy-engine) im tropischen Tierkreis berechnet und mit Ganzzeichen-Häusern gezeigt. Saturn bleibt meist etwa zwei bis zweieinhalb Jahre in einem Zeichen. Die genaue Geburtszeit zählt am seltenen Wechseltag und für das Haus. Dieser Rechner nutzt nicht die Schweizer Ephemeride.",
        noon: " Ohne Geburtszeit wurde Saturn für den lokalen Mittag am Geburtsort berechnet. Das reicht für das Zeichen an fast jedem Geburtstag, aber nicht für das Haus.",
      },
      it: {
        base: "Saturno è calcolato dalla longitudine eclittica geocentrica (astronomy-engine) nello zodiaco tropicale e mostrato con case a segno intero. Saturno resta di solito in un segno per circa due o due anni e mezzo. L'ora esatta conta nel raro giorno di ingresso e per la casa. Questo calcolatore non usa le Effemeridi Svizzere.",
        noon: " Nessuna ora di nascita è stata fornita, quindi Saturno è stato calcolato per il mezzogiorno locale del luogo di nascita. Basta per il segno in quasi tutti i compleanni, ma non per la casa.",
      },
    },
  };

  const pack = notes[toolType][locale] || notes[toolType].en;
  return pack.base + (usedDefaultNoon ? pack.noon : "");
}

function formatDeg(deg: number) {
  const whole = Math.floor(deg);
  const min = Math.round((deg - whole) * 60);
  return `${whole}°${String(min).padStart(2, "0")}'`;
}

function localizedPlanetLabel(locale: string, toolType: string, fallback: string) {
  if (toolType === "jupiter") {
    if (locale === "zh") return "木星";
    if (locale === "es" || locale === "pt") return "Júpiter";
    if (locale === "de") return "Jupiter";
    if (locale === "it") return "Giove";
  }
  if (toolType === "saturn") {
    if (locale === "zh") return "土星";
    if (locale === "es" || locale === "pt" || locale === "it") return "Saturno";
    if (locale === "de") return "Saturn";
  }
  return fallback;
}

const SIGN_NAME_BY_LOCALE: Record<string, Record<string, string>> = {
  zh: {
    Aries: "白羊座",
    Taurus: "金牛座",
    Gemini: "双子座",
    Cancer: "巨蟹座",
    Leo: "狮子座",
    Virgo: "处女座",
    Libra: "天秤座",
    Scorpio: "天蝎座",
    Sagittarius: "射手座",
    Capricorn: "摩羯座",
    Aquarius: "水瓶座",
    Pisces: "双鱼座",
  },
  es: {
    Aries: "Aries",
    Taurus: "Tauro",
    Gemini: "Géminis",
    Cancer: "Cáncer",
    Leo: "Leo",
    Virgo: "Virgo",
    Libra: "Libra",
    Scorpio: "Escorpio",
    Sagittarius: "Sagitario",
    Capricorn: "Capricornio",
    Aquarius: "Acuario",
    Pisces: "Piscis",
  },
  pt: {
    Aries: "Áries",
    Taurus: "Touro",
    Gemini: "Gêmeos",
    Cancer: "Câncer",
    Leo: "Leão",
    Virgo: "Virgem",
    Libra: "Libra",
    Scorpio: "Escorpião",
    Sagittarius: "Sagitário",
    Capricorn: "Capricórnio",
    Aquarius: "Aquário",
    Pisces: "Peixes",
  },
  de: {
    Aries: "Widder",
    Taurus: "Stier",
    Gemini: "Zwillinge",
    Cancer: "Krebs",
    Leo: "Löwe",
    Virgo: "Jungfrau",
    Libra: "Waage",
    Scorpio: "Skorpion",
    Sagittarius: "Schütze",
    Capricorn: "Steinbock",
    Aquarius: "Wassermann",
    Pisces: "Fische",
  },
  it: {
    Aries: "Ariete",
    Taurus: "Toro",
    Gemini: "Gemelli",
    Cancer: "Cancro",
    Leo: "Leone",
    Virgo: "Vergine",
    Libra: "Bilancia",
    Scorpio: "Scorpione",
    Sagittarius: "Sagittario",
    Capricorn: "Capricorno",
    Aquarius: "Acquario",
    Pisces: "Pesci",
  },
};

function localizedSignName(locale: string, sign: string) {
  return SIGN_NAME_BY_LOCALE[locale]?.[sign] || sign;
}

function PlacementReading({
  page,
  sign,
  house,
  usedDefaultNoon,
}: {
  page: PlacementPageContent;
  sign: string;
  house: number;
  usedDefaultNoon?: boolean;
}) {
  const signBody = page.guide?.signs.find((item) => item.sign === sign)?.body ?? page.result.signReadings?.[sign];
  const houseBody = usedDefaultNoon ? undefined : page.result.houseReadings?.[String(house)];
  if (!signBody && !houseBody) return null;
  return (
    <>
      {signBody ? <p className="text-sm leading-relaxed text-white/85">{signBody}</p> : null}
      {houseBody ? <p className="text-sm leading-relaxed text-white/75">{houseBody}</p> : null}
    </>
  );
}

function sunRelation(mercurySign: string, sunSign: string, templates: PlacementPageContent["result"]) {
  const mercuryIndex = SIGN_ORDER.indexOf(mercurySign);
  const sunIndex = SIGN_ORDER.indexOf(sunSign);
  if (mercuryIndex < 0 || sunIndex < 0) return "";
  const distance = Math.min((mercuryIndex - sunIndex + 12) % 12, (sunIndex - mercuryIndex + 12) % 12);
  const template = distance === 0 ? templates.sunSame : distance === 1 ? templates.sunAdjacent : templates.sunFar;
  const localSun = templates.signNames?.[sunSign] || sunSign;
  return template ? template.replace("{sign}", localSun) : "";
}

export default function PlacementCalculatorClient({ page }: { page: PlacementPageContent }) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const copy = FORM_COPY[locale] || FORM_COPY.en;
  const resultRef = useRef<HTMLDivElement | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [timezone, setTimezone] = useState(TIMEZONE_OPTIONS[0]);
  const [useCoordinates, setUseCoordinates] = useState(false);
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlacementResult["data"] | null>(null);

  // Mars and Mercury can resolve a sign from the date on most days. Moon still requires a time.
  const birthTimeOptional =
    page.toolType === "mars" || page.toolType === "mercury" || page.toolType === "jupiter" || page.toolType === "saturn";
  const canSubmit = Boolean(
    birthDate && birthLocation && timezone && !isLoading && (birthTimeOptional || birthTime)
  );

  useEffect(() => {
    if (!result) return;
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    const timeoutId = window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior, block: "start" });
      resultHeadingRef.current?.focus({ preventScroll: true });
    }, 50);
    return () => window.clearTimeout(timeoutId);
  }, [result]);

  const chartUrl = useMemo(() => {
    if (!result) return null;
    return `${locale === "en" ? "" : `/${locale}`}/chart?${new URLSearchParams({
      birthDate: result.birthData.date,
      birthTime: result.birthData.time,
      birthLocation: result.birthData.location,
      timezone: result.birthData.timezone,
      latitude: String(result.birthData.latitude),
      longitude: String(result.birthData.longitude),
    }).toString()}`;
  }, [locale, result]);

  const displayedNote = useMemo(() => {
    if (!result) return "";
    return (
      placementResultNote(locale, page.toolType, result.usedDefaultNoon) || result.note
    );
  }, [locale, page.toolType, result]);

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        type: page.toolType,
        birthDate,
        birthTime,
        birthLocation,
        timezone,
      };
      if (selectedLocationCoords) {
        payload.latitude = selectedLocationCoords.latitude;
        payload.longitude = selectedLocationCoords.longitude;
      }
      const res = await fetch("/api/calculate-placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as PlacementResult;
      if (!json.success || !json.data) {
        setError(json.error || copy.defaultError);
        return;
      }
      setResult(json.data);
    } catch {
      setError(copy.retryError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-4xl px-4 pb-16">
      <div className="mx-auto max-w-3xl">
        <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-md relative overflow-visible">
          <CardContent className="p-6 md:p-8 relative overflow-visible">
            <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor={`${page.slug}-date`} className="flex items-center gap-2 text-sm font-semibold text-purple-300">
                <Calendar className="size-4 text-purple-400" />
                {copy.birthDate}
              </label>
              <DatePicker
                id={`${page.slug}-date`}
                value={birthDate}
                onChange={setBirthDate}
                onTimeChange={setBirthTime}
                timeValue={birthTime}
                placeholder={copy.datePlaceholder}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${page.slug}-time`} className="flex items-center gap-2 text-sm font-semibold text-purple-300">
                <Clock className="size-4 text-purple-400" />
                {copy.birthTime}
                {birthTimeOptional ? (
                  <span className="font-normal text-white/50">
                    {locale === "zh" ? "（可选）" : locale === "es" ? "(opcional)" : locale === "pt" ? "(opcional)" : locale === "de" ? "(optional)" : locale === "it" ? "(facoltativo)" : "(optional)"}
                  </span>
                ) : null}
              </label>
              <Input
                id={`${page.slug}-time`}
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
              />
              {birthTimeOptional ? (
                <p className="text-xs text-white/50">{optionalTimeHint(locale, page.toolType, copy.tip)}</p>
              ) : null}
            </div>

            <div className="space-y-1.5 relative z-10">
              <div className="flex items-center justify-between">
                <label htmlFor={`${page.slug}-location`} className="flex items-center gap-2 text-sm font-semibold text-purple-300">
                  <MapPin className="size-4 text-purple-400" />
                  {copy.birthLocation}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setUseCoordinates((value) => !value);
                    setSelectedLocationCoords(null);
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 underline"
                >
                  {useCoordinates ? copy.useCityName : copy.useCoordinates}
                </button>
              </div>
              {useCoordinates ? (
                <Input
                  id={`${page.slug}-location`}
                  type="text"
                  value={birthLocation}
                  onChange={(e) => {
                    const next = e.target.value;
                    setBirthLocation(next);
                    const m = next.trim().match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
                    if (m) {
                      const lat = Number(m[1]);
                      const lng = Number(m[2]);
                      if (Number.isFinite(lat) && Number.isFinite(lng)) {
                        setSelectedLocationCoords({ latitude: lat, longitude: lng });
                        return;
                      }
                    }
                    setSelectedLocationCoords(null);
                  }}
                  className="h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  placeholder={copy.coordinatesPlaceholder}
                />
              ) : (
                <LocationAutocomplete
                  id={`${page.slug}-location`}
                  value={birthLocation}
                  onChange={(value) => {
                    setBirthLocation(value);
                    if (!value) setSelectedLocationCoords(null);
                  }}
                  onSelect={(r) => setSelectedLocationCoords(r.coordinates)}
                  placeholder={copy.locationPlaceholder}
                  className="h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
              )}
              <p className="text-xs text-white/55">{copy.tip}</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${page.slug}-timezone`} className="flex items-center gap-2 text-sm font-semibold text-purple-300">
                <Globe className="size-4 text-purple-400" />
                {copy.timezone}
              </label>
              <select
                id={`${page.slug}-timezone`}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-md bg-white/10 border border-white/20 text-white focus:border-purple-500 focus:ring-purple-500 focus:outline-none focus:ring-2"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz} className="bg-gray-900">
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {copy.calculating}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  {page.form.submit}
                </>
              )}
            </Button>

            <p className="text-center text-xs text-white/55">{copy.privacy}</p>
            {error && <p className="text-sm text-red-300">{copy.warning}: {error}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {result && (
        <div ref={resultRef} className="mt-10 space-y-6">
          <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-md">
            <CardContent className="p-6 md:p-8">
              <h2 ref={resultHeadingRef} tabIndex={-1} className="text-lg font-semibold text-white focus:outline-none">
                {page.result.title}
              </h2>
              <div className="mt-4 space-y-4">
                {result.placements.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.placements.map((placement) => (
                      <div key={placement.label} className="rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/90">
                        <p className="text-purple-300">{localizedPlanetLabel(locale, page.toolType, placement.label)}</p>
                        <p className="mt-1 font-medium text-white">
                          {placement.glyph}{" "}
                          {page.toolType === "jupiter" || page.toolType === "saturn"
                            ? localizedSignName(locale, placement.sign)
                            : placement.sign}{" "}
                          {formatDeg(placement.degree)}
                          {placement.isRetrograde ? " R" : ""}
                        </p>
                        <p className="mt-1 text-white/60">
                          {copy.wholeSignHouse(placement.house)}
                          {result.usedDefaultNoon && page.result.provisionalHouse ? ` · ${page.result.provisionalHouse}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-white/80">{displayedNote}</p>
                )}
                {result.placements[0] ? (
                  <PlacementReading page={page} sign={result.placements[0].sign} house={result.placements[0].house} usedDefaultNoon={result.usedDefaultNoon} />
                ) : null}
                {result.sun ? (
                  <p className="text-sm leading-relaxed text-white/75">
                    <span className="text-white/90">
                      {result.sun.glyph} Sun {result.sun.sign} {formatDeg(result.sun.degree)}
                    </span>
                    {result.placements[0] ? ` ${sunRelation(result.placements[0].sign, result.sun.sign, page.result)}` : ""}
                  </p>
                ) : null}
                {result.nearSignBoundary && page.result.boundaryNote ? (
                  <p className="text-sm leading-relaxed text-amber-200/90">{page.result.boundaryNote}</p>
                ) : null}
                {result.placements.length > 0 && <p className="text-sm leading-relaxed text-white/65">{displayedNote}</p>}
                <div className="mt-6 space-y-3">
                  <a
                    href={chartUrl || "#"}
                    className={cn(
                      "inline-flex w-full items-center justify-center rounded-md bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700",
                      !chartUrl && "pointer-events-none opacity-50"
                    )}
                  >
                    {page.result.cta}
                  </a>
                  {page.result.lineCta && page.result.lineUrl ? (
                    <a
                      href={`${locale === "en" ? "" : `/${locale}`}${page.result.lineUrl}`}
                      className="inline-flex w-full items-center justify-center text-sm font-medium text-purple-300 underline-offset-4 hover:underline"
                    >
                      {page.result.lineCta}
                    </a>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
