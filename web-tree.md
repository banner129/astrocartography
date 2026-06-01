# AstroCarto 网站结构

## 实际页面目录（/src/app/[locale]/(default)/）

### 顶级目录页面（直接在 (default)/ 下）：
- rising-sign-calculator/            关键词：Rising Sign Calculator
- astrocartography-calculator/       关键词：Astrocartography Calculator
- astrocartography-lines/            关键词：Astrocartography Lines
- composite-chart-calculator/        关键词：Composite Chart Calculator
- jupiter-line-astrocartography/     关键词：Jupiter Line Astrocartography
- mars-line-astrocartography/        关键词：Mars Line Astrocartography
- mercury-line-astrocartography/     关键词：Mercury Line Astrocartography
- moon-line-astrocartography/        关键词：Moon Line Astrocartography
- natal-chart/                       关键词：Natal Chart（顶级）
- relocation-chart-calculator/       关键词：Relocation Chart Calculator
- saturn-line-astrocartography/      关键词：Saturn Line Astrocartography
- solar-return-chart-calculator/     关键词：Solar Return Chart Calculator
- sun-line-astrocartography/         关键词：Sun Line Astrocartography
- synastry-chart-calculator/         关键词：Synastry Chart Calculator
- transit-chart-calculator/          关键词：Transit Chart Calculator
- venus-line-astrocartography/       关键词：Venus Line Astrocartography
- about/
- contact/
- pricing/
- posts/[slug]                       （Blog）
- ai-chat-history/[id]
- showcase/
- color/
- converter/
- i/[code]

### 子目录 chart/（chart 相关页面）：
- chart/                             关键词：Birth Chart（首页）
  └── chart/natal-chart/             关键词：Natal Chart

### 子目录 tools/（共3个子页）：
- tools/birth-chart/                 关键词：Birth Chart
- tools/birth-chart-generator/       关键词：Birth Chart Generator
- tools/rising-sign-calculator/      关键词：Rising Sign Calculator（注：顶级也有同名页）

---

## 建议导航结构（基于 SEO 优化）：

主导航：
├── Home
├── Tools（顶级计算器 + 新增）
│   ├── rising-sign-calculator/              关键词：Rising Sign Calculator        已有（顶级）
│   ├── astrocartography-calculator/         关键词：Astrocartography Calculator   已有（顶级）
│   ├── synastry-chart-calculator/           关键词：Synastry Chart Calculator     已有（顶级）
│   ├── composite-chart-calculator/          关键词：Composite Chart Calculator    已有（顶级）
│   ├── solar-return-chart-calculator/       关键词：Solar Return Chart Calculator 已有（顶级）
│   ├── relocation-chart-calculator/         关键词：Relocation Chart Calculator   已有（顶级）
│   ├── transit-chart-calculator/            关键词：Transit Chart Calculator      已有（顶级）
│   ├── venus-sign-calculator/               关键词：Venus Sign Calculator         新增
│   ├── numerology-calculator/               关键词：Numerology Calculator         新增
│   └── retrograde-calendar/                 关键词：Retrograde Calendar           新增
├── Chart（Birth Chart / Natal Chart 相关）
│   ├── natal-chart/                         关键词：Natal Chart                   已有（顶级）
│   ├── chart/natal-chart/                   关键词：Natal Chart                   已有（chart子目录）
│   ├── tools/birth-chart/                   关键词：Birth Chart                   已有（tools子目录）
│   └── tools/birth-chart-generator/         关键词：Birth Chart Generator         已有（tools子目录）
├── Astrocartography Lines
│   ├── astrocartography-lines/              关键词：Astrocartography Lines        已有
│   ├── sun-line-astrocartography/           关键词：Sun Line Astrocartography     已有
│   ├── moon-line-astrocartography/          关键词：Moon Line Astrocartography    已有
│   ├── mercury-line-astrocartography/       关键词：Mercury Line Astrocartography 已有
│   ├── venus-line-astrocartography/         关键词：Venus Line Astrocartography   已有
│   ├── mars-line-astrocartography/          关键词：Mars Line Astrocartography    已有
│   ├── jupiter-line-astrocartography/       关键词：Jupiter Line Astrocartography 已有
│   └── saturn-line-astrocartography/        关键词：Saturn Line Astrocartography  已有
├── Learn / Astrology                        ← 新增一级菜单
│   ├── zodiac-signs/                        关键词：Zodiac Signs                  新增
│   ├── planets/                             关键词：Astrology Planets             新增
│   ├── houses/                              关键词：Astrology Houses              新增
│   ├── aspects/                             关键词：Astrology Aspects             新增
│   ├── north-south-node/                    关键词：North Node South Node         新增
│   └── chiron/                              关键词：Chiron Astrology              新增
├── Horoscope                                ← 新增一级菜单（高流量入口）
│   ├── daily-horoscope/                     关键词：Daily Horoscope               新增
│   └── monthly-horoscope/                   关键词：Monthly Horoscope             新增
├── Blog                                     已有
├── Pricing                                  已有
└── More
    ├── about/                               已有
    ├── contact/                             已有
    └── ai-chat-history/                     已有
