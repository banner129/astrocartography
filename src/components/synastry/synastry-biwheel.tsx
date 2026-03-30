"use client";

type Planet = { name: string; glyph: string; longitude: number };

type Props = {
  labelInner: string;
  labelOuter: string;
  /** i18n: e.g. "inner" / "内圈" */
  wheelAxisInner: string;
  /** i18n: e.g. "outer" / "外圈" */
  wheelAxisOuter: string;
  /** i18n full sentence below the wheel */
  biwheelFootnote: string;
  planetsInner: Planet[];
  planetsOuter: Planet[];
  ascInner: number;
  ascOuter: number;
};

/** 0° Aries at top; longitude increases counter-clockwise (ecliptic order). */
function lonToAngleDeg(longitude: number): number {
  return 90 - longitude;
}

function polar(cx: number, cy: number, r: number, longitude: number) {
  const rad = (lonToAngleDeg(longitude) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

const ZODIAC = [
  "AR",
  "TA",
  "GE",
  "CN",
  "LE",
  "VI",
  "LI",
  "SC",
  "SG",
  "CP",
  "AQ",
  "PI",
];

export default function SynastryBiwheel({
  labelInner,
  labelOuter,
  wheelAxisInner,
  wheelAxisOuter,
  biwheelFootnote,
  planetsInner,
  planetsOuter,
  ascInner,
  ascOuter,
}: Props) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const rZodiac = 140;
  const rOuter = 118;
  const rInner = 78;

  const zodiacWedges = Array.from({ length: 12 }, (_, i) => {
    const lon = i * 30;
    const th = (lonToAngleDeg(lon) * Math.PI) / 180;
    const x2 = cx + rZodiac * Math.cos(th);
    const y2 = cy - rZodiac * Math.sin(th);
    return (
      <line
        key={`z-${i}`}
        x1={cx}
        y1={cy}
        x2={x2}
        y2={y2}
        stroke="hsl(var(--border))"
        strokeWidth={0.75}
      />
    );
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="max-w-full drop-shadow-lg"
        aria-hidden
      >
        <circle cx={cx} cy={cy} r={rZodiac + 4} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
        {zodiacWedges}
        <circle cx={cx} cy={cy} r={rOuter + 2} fill="none" stroke="hsl(var(--primary) / 0.35)" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={rInner} fill="hsl(var(--muted) / 0.08)" stroke="hsl(var(--primary) / 0.5)" strokeWidth={1} />

        {ZODIAC.map((z, i) => {
          const midLon = i * 30 + 15;
          const p = polar(cx, cy, rZodiac - 14, midLon);
          return (
            <text
              key={z}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px] font-semibold"
            >
              {z}
            </text>
          );
        })}

        {/* Asc markers */}
        {[
          { lon: ascInner, r: rInner, color: "hsl(280 70% 65%)" },
          { lon: ascOuter, r: rOuter, color: "hsl(190 80% 55%)" },
        ].map((m, idx) => {
          const p0 = polar(cx, cy, m.r - 18, m.lon);
          const p1 = polar(cx, cy, m.r + 6, m.lon);
          return (
            <line
              key={idx}
              x1={p0.x}
              y1={p0.y}
              x2={p1.x}
              y2={p1.y}
              stroke={m.color}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}

        {planetsInner.map((p) => {
          const pt = polar(cx, cy, rInner - 10, p.longitude);
          return (
            <g key={`in-${p.name}`}>
              <circle cx={pt.x} cy={pt.y} r={9} fill="hsl(280 60% 45% / 0.9)" stroke="white" strokeWidth={1} />
              <text
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white text-[10px] font-semibold"
              >
                {p.glyph}
              </text>
            </g>
          );
        })}

        {planetsOuter.map((p) => {
          const pt = polar(cx, cy, rOuter - 10, p.longitude);
          return (
            <g key={`out-${p.name}`}>
              <circle cx={pt.x} cy={pt.y} r={9} fill="hsl(190 70% 40% / 0.95)" stroke="white" strokeWidth={1} />
              <text
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white text-[10px] font-semibold"
              >
                {p.glyph}
              </text>
            </g>
          );
        })}

        <text x={cx} y={16} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
          {labelOuter} · {wheelAxisOuter}
        </text>
        <text x={cx} y={size - 10} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
          {labelInner} · {wheelAxisInner}
        </text>
      </svg>
      <p className="text-center text-xs text-muted-foreground max-w-sm">{biwheelFootnote}</p>
    </div>
  );
}
