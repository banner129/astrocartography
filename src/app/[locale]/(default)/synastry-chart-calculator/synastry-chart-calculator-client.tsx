"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SynastryBiwheel from "@/components/synastry/synastry-biwheel";
import AstroChat from "@/components/astro-chat";
import { useAppContext } from "@/contexts/app";
import type { SynastryPayloadForAI } from "@/lib/astro-format";
import { Calendar, Clock, Globe, Heart, MapPin, MessageCircle, Sparkles, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";

const SynastryDualMap = dynamic(() => import("@/components/synastry/synastry-dual-map"), { ssr: false });

const TIMEZONE_OPTIONS = [
  "UTC (London, Dublin)",
  "EST (New York)",
  "PST (Los Angeles)",
  "CST (Chicago)",
  "MST (Denver)",
  "CET (Paris, Berlin)",
  "CST (Mexico City)",
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

type ToolLabels = {
  form: {
    personA: string;
    personB: string;
    wheelAxisInner: string;
    wheelAxisOuter: string;
    biwheelFootnote: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    timezone: string;
    relocateLocation: string;
    submit: string;
  };
  tabs: { synastry: string; relocated: string; maps: string };
  result: {
    title: string;
    aspectsTitle: string;
    planetA: string;
    planetB: string;
    aspect: string;
    orb: string;
    relocatedEmptyHint: string;
    relocatedTitle: string;
    ascA: string;
    ascB: string;
    overlayATitle: string;
    overlayBTitle: string;
    planet: string;
    house: string;
    mapsTitle: string;
    mapsDesc: string;
    mapLinkA: string;
    mapLinkB: string;
    dualMapTitle: string;
    dualMapDesc: string;
    dualMapLegendSolid: string;
    dualMapLegendDashed: string;
    dualMapFootnote: string;
    aiTitle: string;
    aiButton: string;
    aiHint: string;
    footnote: string;
  };
  errors: { required: string; generic: string };
};

type ApiData = {
  personA: {
    birthData: {
      date: string;
      time: string;
      location: string;
      latitude: number;
      longitude: number;
      timezone: string;
    };
    ascendant: { sign: string; degree: number; longitude: number };
    planets: Array<{ name: string; glyph: string; longitude: number; sign: string; degree: number; house: number }>;
  };
  personB: {
    birthData: {
      date: string;
      time: string;
      location: string;
      latitude: number;
      longitude: number;
      timezone: string;
    };
    ascendant: { sign: string; degree: number; longitude: number };
    planets: Array<{ name: string; glyph: string; longitude: number; sign: string; degree: number; house: number }>;
  };
  aspects: Array<{ planetA: string; planetB: string; aspect: string; orb: number }>;
  relocated?: {
    location: string;
    latitude: number;
    longitude: number;
    ascendantA: { sign: string; degree: number };
    ascendantB: { sign: string; degree: number };
    aInB: Array<{ planet: string; glyph: string; houseInPartner: number }>;
    bInA: Array<{ planet: string; glyph: string; houseInPartner: number }>;
  };
};

function buildSynastryPayloadForAI(d: ApiData): SynastryPayloadForAI {
  return {
    personA: {
      birthData: {
        date: d.personA.birthData.date,
        time: d.personA.birthData.time,
        location: d.personA.birthData.location,
        timezone: d.personA.birthData.timezone,
        latitude: d.personA.birthData.latitude,
        longitude: d.personA.birthData.longitude,
      },
      ascendant: { sign: d.personA.ascendant.sign, degree: d.personA.ascendant.degree },
      planets: d.personA.planets.map((p) => ({ name: p.name, sign: p.sign, house: p.house })),
    },
    personB: {
      birthData: {
        date: d.personB.birthData.date,
        time: d.personB.birthData.time,
        location: d.personB.birthData.location,
        timezone: d.personB.birthData.timezone,
        latitude: d.personB.birthData.latitude,
        longitude: d.personB.birthData.longitude,
      },
      ascendant: { sign: d.personB.ascendant.sign, degree: d.personB.ascendant.degree },
      planets: d.personB.planets.map((p) => ({ name: p.name, sign: p.sign, house: p.house })),
    },
    aspects: d.aspects,
    relocated: d.relocated
      ? {
          location: d.relocated.location,
          ascendantA: d.relocated.ascendantA,
          ascendantB: d.relocated.ascendantB,
          aInB: d.relocated.aInB.map(({ planet, houseInPartner }) => ({ planet, houseInPartner })),
          bInA: d.relocated.bInA.map(({ planet, houseInPartner }) => ({ planet, houseInPartner })),
        }
      : undefined,
  };
}

function toMapBirthPayload(b: ApiData["personA"]["birthData"]) {
  return {
    birthDate: b.date,
    birthTime: b.time,
    birthLocation: b.location,
    timezone: b.timezone,
    latitude: b.latitude,
    longitude: b.longitude,
  };
}

export default function SynastryChartCalculatorClient({ tool }: { tool: ToolLabels }) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { user, setShowSignModal } = useAppContext();
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [autoSendQuestion, setAutoSendQuestion] = useState<string | null>(null);
  const [autoSendQuestionKey, setAutoSendQuestionKey] = useState(0);

  const [aDate, setADate] = useState("");
  const [aTime, setATime] = useState("");
  const [aLoc, setALoc] = useState("");
  const [aTz, setATz] = useState(TIMEZONE_OPTIONS[0]);
  const [aCoords, setACoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [bDate, setBDate] = useState("");
  const [bTime, setBTime] = useState("");
  const [bLoc, setBLoc] = useState("");
  const [bTz, setBTz] = useState(TIMEZONE_OPTIONS[0]);
  const [bCoords, setBCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [relocateLocation, setRelocateLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiData | null>(null);

  const prefix = locale === "en" ? "" : `/${locale}`;

  useEffect(() => {
    if (!data) return;
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const t = window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [data]);

  const canSubmit =
    Boolean(aDate && aLoc?.trim() && aTz && bDate && bLoc?.trim() && bTz) && !loading;

  async function handleSubmit() {
    if (!canSubmit) {
      setError(tool.errors.required);
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const payload: Record<string, unknown> = {
        personA: {
          birthDate: aDate,
          birthTime: aTime || undefined,
          birthLocation: aLoc.trim(),
          timezone: aTz,
        },
        personB: {
          birthDate: bDate,
          birthTime: bTime || undefined,
          birthLocation: bLoc.trim(),
          timezone: bTz,
        },
      };
      if (aCoords) {
        (payload.personA as Record<string, unknown>).latitude = aCoords.latitude;
        (payload.personA as Record<string, unknown>).longitude = aCoords.longitude;
      }
      if (bCoords) {
        (payload.personB as Record<string, unknown>).latitude = bCoords.latitude;
        (payload.personB as Record<string, unknown>).longitude = bCoords.longitude;
      }
      if (relocateLocation.trim()) payload.relocateLocation = relocateLocation.trim();

      const res = await fetch("/api/calculate-synastry-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { success: boolean; error?: string; data?: ApiData };
      if (!json.success || !json.data) {
        setError(json.error || tool.errors.generic);
        return;
      }
      setData(json.data);
    } catch {
      setError(tool.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  const mapUrl = (birth: ApiData["personA"]["birthData"]) =>
    `${prefix}/chart?${new URLSearchParams({
      birthDate: birth.date,
      birthTime: birth.time,
      birthLocation: birth.location,
      timezone: birth.timezone,
      latitude: String(birth.latitude),
      longitude: String(birth.longitude),
    }).toString()}`;

  const synastryForAI = useMemo(() => (data ? buildSynastryPayloadForAI(data) : null), [data]);

  const astroChatChartData = useMemo(() => {
    if (!data) return null;
    return {
      birthData: {
        date: data.personA.birthData.date,
        time: data.personA.birthData.time,
        location: data.personA.birthData.location,
        timezone: data.personA.birthData.timezone,
        latitude: data.personA.birthData.latitude,
        longitude: data.personA.birthData.longitude,
      },
      planetLines: [] as {
        planet: string;
        type: "AS" | "DS" | "MC" | "IC";
        coordinates: [number, number][];
        color: string;
      }[],
    };
  }, [data]);

  const openSynastryAI = useCallback(() => {
    if (!user) {
      setShowSignModal(true);
      return;
    }
    setAutoSendQuestion(
      "Please interpret our synastry from the data provided. Start with Sun–Moon and Venus–Mars (if present), note one growth area from Saturn or challenging aspects, and keep a balanced, non-fatalistic tone."
    );
    setAutoSendQuestionKey((k) => k + 1);
    setChatOpen(true);
  }, [user, setShowSignModal]);

  return (
    <div className="container max-w-4xl px-4 pb-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <Card className="shadow-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-visible">
          <CardContent className="p-6 md:p-8 space-y-8">
            {[
              { id: "a" as const, label: tool.form.personA, icon: Users, color: "text-purple-300" },
              { id: "b" as const, label: tool.form.personB, icon: Heart, color: "text-cyan-300" },
            ].map((block) => (
              <div key={block.id} className="space-y-4">
                <h2 className={`flex items-center gap-2 text-lg font-bold ${block.color}`}>
                  <block.icon className="h-5 w-5" />
                  {block.label}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                      <Calendar className="h-4 w-4" />
                      {tool.form.birthDate}
                    </label>
                    <DatePicker
                      value={block.id === "a" ? aDate : bDate}
                      onChange={block.id === "a" ? setADate : setBDate}
                      placeholder="YYYY-MM-DD"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                      <Clock className="h-4 w-4" />
                      {tool.form.birthTime}
                    </label>
                    <Input
                      type="time"
                      value={block.id === "a" ? aTime : bTime}
                      onChange={(e) => (block.id === "a" ? setATime : setBTime)(e.target.value)}
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                    <Globe className="h-4 w-4" />
                    {tool.form.birthLocation}
                  </label>
                  <LocationAutocomplete
                    value={block.id === "a" ? aLoc : bLoc}
                    onChange={(value) => {
                      (block.id === "a" ? setALoc : setBLoc)(value);
                      if (!value) (block.id === "a" ? setACoords : setBCoords)(null);
                    }}
                    onSelect={(r) => (block.id === "a" ? setACoords : setBCoords)(r.coordinates)}
                    placeholder="City, Country"
                    className="h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-purple-200">
                    <Globe className="h-4 w-4" />
                    {tool.form.timezone}
                  </label>
                  <select
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
                    value={block.id === "a" ? aTz : bTz}
                    onChange={(e) => (block.id === "a" ? setATz : setBTz)(e.target.value)}
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz} value={tz} className="bg-zinc-900">
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <div className="space-y-1.5 border-t border-white/10 pt-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-amber-200/90">
                <MapPin className="h-4 w-4" />
                {tool.form.relocateLocation}
              </label>
              <LocationAutocomplete
                value={relocateLocation}
                onChange={setRelocateLocation}
                placeholder="e.g. Paris, France"
                className="h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <Button
              type="button"
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "…" : tool.form.submit}
            </Button>
          </CardContent>
        </Card>

        {data && (
          <div ref={resultsRef}>
            <h2 className="text-center text-xl font-bold text-white mb-4">{tool.result.title}</h2>
            <Tabs defaultValue="synastry" className="w-full">
              <TabsList className="mx-auto flex w-full max-w-lg flex-wrap justify-center gap-1 h-auto py-1">
                <TabsTrigger value="synastry">{tool.tabs.synastry}</TabsTrigger>
                <TabsTrigger value="relocated">{tool.tabs.relocated}</TabsTrigger>
                <TabsTrigger value="maps">{tool.tabs.maps}</TabsTrigger>
              </TabsList>

              <div className="mt-6 rounded-xl border border-purple-500/25 bg-purple-950/20 px-4 py-5 text-center space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-300" />
                  {tool.result.aiTitle}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">{tool.result.aiHint}</p>
                <Button
                  type="button"
                  onClick={openSynastryAI}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                >
                  <Sparkles className="h-4 w-4" />
                  {tool.result.aiButton}
                </Button>
              </div>

              <TabsContent value="synastry" className="mt-6 space-y-8">
                <div className="flex justify-center">
                  <SynastryBiwheel
                    labelInner={tool.form.personA}
                    labelOuter={tool.form.personB}
                    wheelAxisInner={tool.form.wheelAxisInner}
                    wheelAxisOuter={tool.form.wheelAxisOuter}
                    biwheelFootnote={tool.form.biwheelFootnote}
                    planetsInner={data.personA.planets}
                    planetsOuter={data.personB.planets}
                    ascInner={data.personA.ascendant.longitude}
                    ascOuter={data.personB.ascendant.longitude}
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-purple-300 mb-3">{tool.result.aspectsTitle}</h3>
                  <div className="overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-left text-muted-foreground">
                          <th className="p-2 font-medium">{tool.result.planetA}</th>
                          <th className="p-2 font-medium">{tool.result.aspect}</th>
                          <th className="p-2 font-medium">{tool.result.planetB}</th>
                          <th className="p-2 font-medium">{tool.result.orb}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.aspects.map((row, i) => (
                          <tr key={`${row.planetA}-${row.aspect}-${row.planetB}-${i}`} className="border-b border-white/5">
                            <td className="p-2 text-purple-200">
                              {row.planetA} {data.personA.planets.find((p) => p.name === row.planetA)?.glyph}
                            </td>
                            <td className="p-2 font-medium text-white">{row.aspect}</td>
                            <td className="p-2 text-cyan-200">
                              {row.planetB} {data.personB.planets.find((p) => p.name === row.planetB)?.glyph}
                            </td>
                            <td className="p-2 text-muted-foreground">{row.orb}°</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">{tool.result.footnote}</p>
              </TabsContent>

              <TabsContent value="relocated" className="mt-6 space-y-6">
                {data.relocated ? (
                  <>
                    <p className="text-center text-white font-medium">
                      {tool.result.relocatedTitle}: {data.relocated.location}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="text-muted-foreground">{tool.result.ascA}</div>
                        <div className="text-lg font-semibold text-purple-200">
                          {data.relocated.ascendantA.sign} {data.relocated.ascendantA.degree}°
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="text-muted-foreground">{tool.result.ascB}</div>
                        <div className="text-lg font-semibold text-cyan-200">
                          {data.relocated.ascendantB.sign} {data.relocated.ascendantB.degree}°
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-purple-300 mb-2">{tool.result.overlayATitle}</h4>
                      <div className="overflow-x-auto rounded-lg border border-white/10">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="p-2 text-left">{tool.result.planet}</th>
                              <th className="p-2 text-left">{tool.result.house}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.relocated.aInB.map((r) => (
                              <tr key={r.planet} className="border-b border-white/5">
                                <td className="p-2">
                                  {r.glyph} {r.planet}
                                </td>
                                <td className="p-2">{r.houseInPartner}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-cyan-300 mb-2">{tool.result.overlayBTitle}</h4>
                      <div className="overflow-x-auto rounded-lg border border-white/10">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              <th className="p-2 text-left">{tool.result.planet}</th>
                              <th className="p-2 text-left">{tool.result.house}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.relocated.bInA.map((r) => (
                              <tr key={r.planet} className="border-b border-white/5">
                                <td className="p-2">
                                  {r.glyph} {r.planet}
                                </td>
                                <td className="p-2">{r.houseInPartner}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground">{tool.result.relocatedEmptyHint}</p>
                )}
              </TabsContent>

              <TabsContent value="maps" className="mt-6 space-y-6 text-center">
                <h3 className="text-lg font-semibold text-white">{tool.result.mapsTitle}</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">{tool.result.mapsDesc}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild variant="secondary" className="gap-2">
                    <Link href={mapUrl(data.personA.birthData) as any}>{tool.result.mapLinkA}</Link>
                  </Button>
                  <Button asChild variant="secondary" className="gap-2">
                    <Link href={mapUrl(data.personB.birthData) as any}>{tool.result.mapLinkB}</Link>
                  </Button>
                </div>

                <div className="text-left space-y-3 pt-4 border-t border-white/10">
                  <h4 className="text-base font-semibold text-white text-center">{tool.result.dualMapTitle}</h4>
                  <p className="text-xs text-muted-foreground text-center max-w-lg mx-auto">{tool.result.dualMapDesc}</p>
                  <SynastryDualMap
                    labelA={tool.form.personA}
                    labelB={tool.form.personB}
                    legendSolid={tool.result.dualMapLegendSolid}
                    legendDashed={tool.result.dualMapLegendDashed}
                    footnote={tool.result.dualMapFootnote}
                    personA={toMapBirthPayload(data.personA.birthData)}
                    personB={toMapBirthPayload(data.personB.birthData)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {data && synastryForAI && astroChatChartData && (
          <AstroChat
            open={chatOpen}
            onOpenChange={setChatOpen}
            autoSendQuestion={autoSendQuestion}
            autoSendQuestionKey={autoSendQuestionKey}
            chartData={astroChatChartData}
            synastryData={synastryForAI}
            user={user ?? undefined}
            onRequireLogin={() => setShowSignModal(true)}
          />
        )}
      </div>
    </div>
  );
}
