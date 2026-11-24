"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PlacementPageContent } from "@/lib/placement-page-content";
import { cn } from "@/lib/utils";

const SIGN_GLYPH: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

const SIGN_LABELS: Record<string, Record<string, string>> = {
  en: {
    Aries: "Aries",
    Taurus: "Taurus",
    Gemini: "Gemini",
    Cancer: "Cancer",
    Leo: "Leo",
    Virgo: "Virgo",
    Libra: "Libra",
    Scorpio: "Scorpio",
    Sagittarius: "Sagittarius",
    Capricorn: "Capricorn",
    Aquarius: "Aquarius",
    Pisces: "Pisces",
  },
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

const TABLE_HEADERS: Record<string, { dates: string; sign: string }> = {
  en: { dates: "Dates", sign: "Sign" },
  zh: { dates: "日期", sign: "星座" },
  es: { dates: "Fechas", sign: "Signo" },
  pt: { dates: "Datas", sign: "Signo" },
  de: { dates: "Daten", sign: "Zeichen" },
  it: { dates: "Date", sign: "Segno" },
};

function localizeSign(locale: string, sign: string) {
  return SIGN_LABELS[locale]?.[sign] || SIGN_LABELS.en[sign] || sign;
}

export default function PlacementGuide({
  guide,
  locale = "en",
}: {
  guide: NonNullable<PlacementPageContent["guide"]>;
  locale?: string;
}) {
  const [openSign, setOpenSign] = useState<string | null>(guide.signs[0]?.sign ?? null);
  const headers = TABLE_HEADERS[locale] || TABLE_HEADERS.en;

  return (
    <article className="container max-w-3xl px-4 py-8 text-white">
      <h2 id="sign-meanings" className="text-2xl font-bold lg:text-3xl">
        {guide.meaningsTitle}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{guide.meaningsIntro}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {guide.signs.map((item) => {
          const open = openSign === item.sign;
          return (
            <section
              key={item.sign}
              className={cn(
                "rounded-2xl border border-white/10 bg-white/[0.04] transition-colors",
                open ? "sm:col-span-2 border-purple-400/30 bg-white/[0.06]" : "hover:border-white/20"
              )}
            >
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenSign(open ? null : item.sign)}
                className="flex w-full items-start gap-3 px-4 py-4 text-left"
              >
                <span
                  className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-lg text-purple-200"
                  aria-hidden="true"
                >
                  {SIGN_GLYPH[item.sign] || item.sign.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  <p className={cn("mt-1 text-sm leading-6 text-white/60", !open && "line-clamp-2")}>
                    {item.body}
                  </p>
                </span>
                <ChevronDown
                  className={cn(
                    "mt-1 size-4 shrink-0 text-white/45 transition-transform duration-200",
                    open && "rotate-180 text-purple-200"
                  )}
                />
              </button>
            </section>
          );
        })}
      </div>

      <h2 id="sign-by-year" className="mt-14 text-2xl font-bold lg:text-3xl">
        {guide.yearsTitle}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{guide.yearsIntro}</p>
      <div className="mt-5 max-h-[28rem] overflow-auto rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#12101c] text-white/55">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                {headers.dates}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                {headers.sign}
              </th>
            </tr>
          </thead>
          <tbody>
            {guide.years.map((row, index) => (
              <tr key={row.range} className={index % 2 === 0 ? "bg-white/[0.03]" : undefined}>
                <td className="px-4 py-2.5 text-white/80">{row.range}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-flex items-center gap-2 font-medium text-white">
                    <span aria-hidden="true" className="text-purple-200">
                      {SIGN_GLYPH[row.sign]}
                    </span>
                    {localizeSign(locale, row.sign)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-white/50">{guide.yearsNote}</p>

      <h2 className="mt-14 text-2xl font-bold lg:text-3xl">{guide.limitsTitle}</h2>
      <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
        {guide.limitsBody.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-white/70">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
