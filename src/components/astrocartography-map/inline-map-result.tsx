"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Expand,
  GitCompareArrows,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AstroChat from "@/components/astro-chat";
import type { AstrocartographyMapHandle } from "@/components/astrocartography-map";
import type { User } from "@/types/user";
import { askAIEvents, homeInlineMapEvents } from "@/lib/analytics";

const AstrocartographyMap = dynamic(
  () => import("@/components/astrocartography-map"),
  { ssr: false }
);

type PlanetLine = {
  planet: string;
  type: "AS" | "DS" | "MC" | "IC";
  coordinates: [number, number][];
  color: string;
};

type InlineBirthData = {
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
};

type InlineChartData = {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  timezone: string;
};

type InlineMapResultProps = {
  birthData: InlineBirthData;
  chartData: InlineChartData;
  planetLines: PlanetLine[];
  chartPath: string;
  user: User | null;
  onRequireLogin: () => void;
};

export default function InlineMapResult({
  birthData,
  chartData,
  planetLines,
  chartPath,
  user,
  onRequireLogin,
}: InlineMapResultProps) {
  const t = useTranslations("astrocartographyGenerator");
  const mapRef = useRef<AstrocartographyMapHandle>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [askOtherPrefillText, setAskOtherPrefillText] = useState<string | null>(
    null
  );
  const [askOtherPrefillKey, setAskOtherPrefillKey] = useState(0);

  const openAskAI = () => {
    setAskOtherPrefillText(null);
    setChatOpen(true);
    askAIEvents.dialogOpened("manual");
    homeInlineMapEvents.askAIClicked();
  };

  const openCheckCity = () => {
    mapRef.current?.openCheckCity();
    homeInlineMapEvents.checkCityClicked();
  };

  const openCompareCities = () => {
    mapRef.current?.openCompareCities();
    homeInlineMapEvents.compareCitiesClicked();
  };

  const handleAskOther = (prefillText: string) => {
    setAskOtherPrefillText(prefillText);
    setAskOtherPrefillKey((prev) => prev + 1);
    setChatOpen(true);
    askAIEvents.dialogOpened("manual");
  };

  return (
    <div className="mt-8 overflow-hidden rounded-[24px] border border-amber-200/20 bg-[#100b18]/95 shadow-2xl shadow-purple-950/30 backdrop-blur-md md:rounded-[28px]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="flex flex-col gap-2 border-b border-white/10 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase leading-none tracking-[0.18em] text-amber-200 md:text-xs md:tracking-[0.22em]">
                {t("inlineResult.eyebrow")}
              </div>
              <h3 className="mt-1 truncate text-base font-bold leading-tight text-white md:text-2xl">
                {t("inlineResult.title")}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/60 md:mt-2 md:text-xs">
                <span>📅 {birthData.date}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5 text-amber-200" />
                  {birthData.location}
                </span>
              </div>
            </div>
            <Link
              href={chartPath}
              onClick={() => homeInlineMapEvents.openFullMapClicked()}
              className="hidden shrink-0 md:block"
            >
              <Button
                variant="outline"
                className="w-full rounded-full border-amber-200/40 bg-amber-200/10 px-5 text-amber-100 hover:bg-amber-200/20 md:w-auto"
              >
                <Expand className="mr-2 size-4" />
                {t("inlineResult.openFullMap")}
              </Button>
            </Link>
          </div>

          <div className="bg-[#080d16] md:bg-black">
            <div className="relative h-[390px] overflow-hidden bg-black sm:h-[420px] md:h-[560px] lg:h-[640px]">
              <AstrocartographyMap
                ref={mapRef}
                birthData={birthData}
                planetLines={planetLines}
                onAskOther={handleAskOther}
                defaultPanelOpen={false}
                showInitialGuide={false}
                embedded
              />

              <Link
                href={chartPath}
                onClick={() => homeInlineMapEvents.openFullMapClicked()}
                className="absolute bottom-4 right-4 z-[1200] flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/75 text-white shadow-xl backdrop-blur-md transition hover:bg-black md:hidden"
                aria-label={t("inlineResult.openFullMap")}
              >
                <Expand className="size-5" />
              </Link>
            </div>

            <div className="border-t border-white/10 bg-[#080d16] p-2.5 md:hidden">
              <Link
                href={chartPath}
                onClick={() => homeInlineMapEvents.openFullMapClicked()}
                className="mb-2 flex h-9 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-200/10 text-xs font-bold text-amber-100 transition hover:bg-amber-200/15"
              >
                {t("inlineResult.mobileFullMapHint")}
              </Link>
              <Button
                onClick={openAskAI}
                className="h-12 w-full rounded-2xl bg-gradient-to-r from-amber-300 via-pink-400 to-purple-600 text-sm font-bold text-[#160e1d] shadow-lg hover:opacity-95"
              >
                <Sparkles className="mr-2 size-4" />
                {t("messages.buttons.askAI")}
              </Button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={openCheckCity}
                  className="h-11 rounded-2xl border-white/10 bg-white/[0.08] px-2 text-xs font-bold text-white hover:bg-white/15"
                >
                  <Search className="mr-1.5 size-4 text-purple-300" />
                  {t("messages.buttons.checkCity")}
                </Button>
                <Button
                  variant="outline"
                  onClick={openCompareCities}
                  className="h-11 rounded-2xl border-white/10 bg-white/[0.08] px-2 text-xs font-bold text-white hover:bg-white/15"
                >
                  <GitCompareArrows className="mr-1.5 size-4 text-amber-300" />
                  {t("messages.buttons.compareCities")}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden border-t border-white/10 bg-[#100816]/95 p-4 md:block md:p-6 lg:border-l lg:border-t-0">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-pink-300 to-purple-500 text-white shadow-lg">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">
                {t("inlineResult.interpretTitle")}
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                {t("inlineResult.interpretDescription")}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Button
              onClick={openAskAI}
              className="h-12 rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-purple-600 text-sm font-bold text-[#160e1d] shadow-lg hover:opacity-95"
            >
              <Sparkles className="mr-2 size-4" />
              {t("messages.buttons.askAI")}
            </Button>
            <Button
              variant="outline"
              onClick={openCheckCity}
              className="h-12 justify-center rounded-2xl border-white/10 bg-white/[0.035] text-white hover:bg-white/10"
            >
              <Search className="mr-2 size-4 text-purple-300" />
              {t("messages.buttons.checkCity")}
            </Button>
            <Button
              variant="outline"
              onClick={openCompareCities}
              className="h-12 justify-center rounded-2xl border-white/10 bg-white/[0.035] text-white hover:bg-white/10"
            >
              <GitCompareArrows className="mr-2 size-4 text-amber-300" />
              {t("messages.buttons.compareCities")}
            </Button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
              {t("inlineResult.nextStepTitle")}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              {t("inlineResult.nextStepDescription")}
            </p>
          </div>
        </aside>
      </div>

      <AstroChat
        open={chatOpen}
        onOpenChange={setChatOpen}
        askOtherPrefillText={askOtherPrefillText}
        askOtherPrefillKey={askOtherPrefillKey}
        chartData={{
          birthData: {
            date: birthData.date,
            time: birthData.time,
            location: birthData.location,
            latitude: birthData.latitude,
            longitude: birthData.longitude,
            timezone: chartData.timezone || "UTC",
          },
          planetLines,
        }}
        user={user}
        onRequireLogin={onRequireLogin}
      />
    </div>
  );
}
