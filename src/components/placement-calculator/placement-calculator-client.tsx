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

function formatDeg(deg: number) {
  const whole = Math.floor(deg);
  const min = Math.round((deg - whole) * 60);
  return `${whole}°${String(min).padStart(2, "0")}'`;
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

  const canSubmit = Boolean(birthDate && birthTime && birthLocation && timezone && !isLoading);

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
              </label>
              <Input
                id={`${page.slug}-time`}
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                className="h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
              />
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
                        <p className="text-purple-300">{placement.label}</p>
                        <p className="mt-1 font-medium text-white">
                          {placement.glyph} {placement.sign} {formatDeg(placement.degree)}
                          {placement.isRetrograde ? " R" : ""}
                        </p>
                        <p className="mt-1 text-white/60">{copy.wholeSignHouse(placement.house)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-white/80">{result.note}</p>
                )}
                {result.placements.length > 0 && <p className="text-sm leading-relaxed text-white/65">{result.note}</p>}
                <div className="mt-6">
                  <a
                    href={chartUrl || "#"}
                    className={cn(
                      "inline-flex w-full items-center justify-center rounded-md bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700",
                      !chartUrl && "pointer-events-none opacity-50"
                    )}
                  >
                    {page.result.cta}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
