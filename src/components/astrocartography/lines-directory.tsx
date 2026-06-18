import Icon from "@/components/icon";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LineEntry = {
  title: string;
  description: string;
  icon: string;
  color: string;
  url?: string;
  status?: string;
};

const coreLines: LineEntry[] = [
  {
    title: "Sun Line",
    description: "Visibility, confidence, leadership, and authentic self-expression.",
    icon: "RiSunLine",
    color: "text-amber-300 bg-amber-300/10 border-amber-300/20",
    url: "/sun-line-astrocartography",
  },
  {
    title: "Moon Line",
    description: "Home, emotional security, intuition, family, and belonging.",
    icon: "RiMoonLine",
    color: "text-slate-200 bg-slate-200/10 border-slate-200/20",
    url: "/moon-line-astrocartography",
  },
  {
    title: "Mercury Line",
    description: "Communication, learning, writing, networking, and business.",
    icon: "RiMessage3Line",
    color: "text-cyan-300 bg-cyan-300/10 border-cyan-300/20",
    url: "/mercury-line-astrocartography",
  },
  {
    title: "Venus Line",
    description: "Love, beauty, social ease, creativity, and relationships.",
    icon: "RiHeartLine",
    color: "text-pink-300 bg-pink-300/10 border-pink-300/20",
    url: "/venus-line-astrocartography",
  },
  {
    title: "Mars Line",
    description: "Drive, courage, physical energy, ambition, and competition.",
    icon: "RiFireLine",
    color: "text-red-300 bg-red-300/10 border-red-300/20",
    url: "/mars-line-astrocartography",
  },
  {
    title: "Jupiter Line",
    description: "Expansion, opportunity, education, optimism, and growth.",
    icon: "RiStarLine",
    color: "text-violet-300 bg-violet-300/10 border-violet-300/20",
    url: "/jupiter-line-astrocartography",
  },
  {
    title: "Saturn Line",
    description: "Discipline, responsibility, mastery, structure, and endurance.",
    icon: "RiShieldLine",
    color: "text-blue-300 bg-blue-300/10 border-blue-300/20",
    url: "/saturn-line-astrocartography",
  },
];

const outerLines: LineEntry[] = [
  {
    title: "Uranus Line",
    description: "Freedom, sudden change, innovation, and reinvention.",
    icon: "RiFlashlightLine",
    color: "text-teal-300 bg-teal-300/10 border-teal-300/20",
    url: "/uranus-line-astrocartography",
  },
  {
    title: "Neptune Line",
    description: "Imagination, spirituality, sensitivity, ideals, and uncertainty.",
    icon: "RiWaterFlashLine",
    color: "text-sky-300 bg-sky-300/10 border-sky-300/20",
    status: "Guide planned",
  },
  {
    title: "Pluto Line",
    description: "Transformation, intensity, power, regeneration, and deep change.",
    icon: "RiContrastDrop2Line",
    color: "text-rose-300 bg-rose-300/10 border-rose-300/20",
    url: "/pluto-line-astrocartography",
  },
];

const specialPoints: LineEntry[] = [
  {
    title: "North Node Line",
    description: "Growth direction, unfamiliar opportunities, and developmental themes.",
    icon: "RiNodeTree",
    color: "text-lime-300 bg-lime-300/10 border-lime-300/20",
    status: "Guide planned",
  },
  {
    title: "Chiron Line",
    description: "Healing, vulnerability, teaching, and the wounded-healer theme.",
    icon: "RiFirstAidKitLine",
    color: "text-emerald-300 bg-emerald-300/10 border-emerald-300/20",
    status: "Not currently on the map",
  },
  {
    title: "Lilith Line",
    description: "Autonomy, shadow themes, boundaries, and uncompromising expression.",
    icon: "RiMoonClearLine",
    color: "text-fuchsia-300 bg-fuchsia-300/10 border-fuchsia-300/20",
    status: "Guide planned",
  },
];

const goals = [
  { title: "Love & Connection", detail: "Venus, Moon, and supportive Jupiter lines", url: "/venus-line-astrocartography", icon: "RiHeartLine" },
  { title: "Career & Visibility", detail: "Sun, Jupiter, Saturn, and Mars MC lines", url: "/sun-line-astrocartography", icon: "RiBriefcaseLine" },
  { title: "Home & Belonging", detail: "Moon IC, Venus IC, and grounding lines", url: "/moon-line-astrocartography", icon: "RiHomeHeartLine" },
  { title: "Travel & Learning", detail: "Jupiter and Mercury lines for exploration", url: "/jupiter-line-astrocartography", icon: "RiFlightTakeoffLine" },
  { title: "Change & Reinvention", detail: "Uranus lines for new chapters and freedom", url: "/uranus-line-astrocartography", icon: "RiRefreshLine" },
  { title: "Discipline & Mastery", detail: "Saturn and Mars lines for demanding goals", url: "/saturn-line-astrocartography", icon: "RiFocus3Line" },
];

function LineCard({ line }: { line: LineEntry }) {
  const content = (
    <>
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-md border", line.color)}>
        <Icon name={line.icon} className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">{line.title}</h3>
          {line.status && (
            <span className="rounded-sm border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {line.status}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{line.description}</p>
      </div>
      {line.url && <Icon name="RiArrowRightLine" className="mt-1 size-4 shrink-0 text-primary" />}
    </>
  );

  if (!line.url) {
    return <div className="flex min-h-28 gap-4 border-b border-border/60 py-5 opacity-75">{content}</div>;
  }

  return (
    <Link
      href={line.url as any}
      className="group flex min-h-28 gap-4 border-b border-border/60 py-5 transition-colors hover:border-primary/40"
    >
      {content}
    </Link>
  );
}

function DirectoryGroup({ title, description, lines }: { title: string; description: string; lines: LineEntry[] }) {
  return (
    <section>
      <div className="mb-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div>{lines.map((line) => <LineCard key={line.title} line={line} />)}</div>
    </section>
  );
}

export default function LinesDirectory() {
  return (
    <section id="lines-directory" className="border-y border-border/60 bg-card/20 py-16 lg:py-20">
      <div className="container">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase text-primary">Line directory</span>
          <h2 className="mt-3 text-3xl font-bold text-foreground lg:text-4xl">Explore Every Astrocartography Line</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Start with a planet, or choose the life goal you want to explore. Published guides open directly; planned guides are shown without creating broken links.
          </p>
        </div>

        <div className="mt-12 grid gap-x-12 gap-y-14 lg:grid-cols-3">
          <DirectoryGroup
            title="Core Planetary Lines"
            description="The seven traditional planetary lines used for everyday location questions."
            lines={coreLines}
          />
          <DirectoryGroup
            title="Outer Planet Lines"
            description="Slower-moving planets associated with collective and long-term transformation."
            lines={outerLines}
          />
          <DirectoryGroup
            title="Points & Minor Bodies"
            description="Advanced layers that require separate calculation and careful interpretation."
            lines={specialPoints}
          />
        </div>

        <div className="mt-16 border-t border-border/60 pt-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground">Browse Lines by Life Goal</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              There is no universally best line. The useful question is which planetary theme matches what you want from a place now.
            </p>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
              <Link
                key={goal.title}
                href={goal.url as any}
                className="group flex min-h-24 items-center gap-4 rounded-md border border-border/60 bg-background/40 p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
              >
                <Icon name={goal.icon} className="size-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary">{goal.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{goal.detail}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
