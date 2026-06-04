# AstroCarto 当前网站内页与关键词资产清单

> 生成时间：2026-06-01  
> 数据来源：`src/app/[locale]/(default)` 实际路由、`src/i18n/pages/*/en.json`、`src/i18n/messages/en.json`。  
> 用途：作为 `seo-keyword-gap` SOP 的 `site_inventory` 输入，后续与竞品 landing page / keyword 数据做差距分析。

## 1. 核心结论

- 当前网站核心 SEO 资产集中在：Astrocartography Calculator、Astrocartography Lines、行星线系列页、出生盘/合盘/推运/迁移盘等计算器页。
- Astrocartography 主题相关度较高的页面已经比较完整，但行星线系列目前缺少 `Uranus / Neptune / Pluto` 三条线。
- Birth Chart / Natal Chart 存在多 URL 同主题风险，需要持续避免关键词内耗。
- `/chart`、`/tools/birth-chart`、AI history、用户中心类页面不应作为 SEO 页面重点，它们更多是功能或跳转页。
- `color`、`converter`、部分 about 文案偏向 Wplace/Pixel Art，和 Astrocartography 主站主题不一致，后续需要决定是否保留为独立业务线。



网站的导航目录结构






## 2. 主导航与页面结构

```txt
Home
├── /

Tools
├── /astrocartography-calculator  关键词名  
├── /tools/birth-chart-generator
├── /rising-sign-calculator

Chart
├── /chart/natal-chart
├── /transit-chart-calculator
├── /relocation-chart-calculator
├── /synastry-chart-calculator
├── /composite-chart-calculator
├── /solar-return-chart-calculator

Lines
├── /astrocartography-lines
├── /sun-line-astrocartography
├── /moon-line-astrocartography
├── /mercury-line-astrocartography
├── /venus-line-astrocartography
├── /mars-line-astrocartography
├── /jupiter-line-astrocartography
├── /saturn-line-astrocartography

Blog
├── /posts
├── /posts/[slug]

Commercial / Support
├── /pricing
├── /about
├── /contact

Utility / Non-core
├── /color
├── /converter
├── /showcase
├── /i/[code]

Functional / Noindex / Protected
├── /chart
├── /tools/birth-chart
├── /ai-chat-history
├── /ai-chat-history/[id]
├── /api-keys
├── /api-keys/create
├── /my-orders
├── /my-invites
├── /my-credits

Legal
├── /privacy-policy
├── /refund-policy
├── /terms-of-service
```

## 3. SEO 页面资产表

| URL | 页面类型 | 主关键词 | 次关键词 / 当前 metadata keywords | 当前判断 |
|---|---|---|---|---|
| `/` | 核心工具首页 | free astrocartography calculator | AI astrocartography, astrocartography map online free, birth chart location map, astrocartography lines, relocation astrology tool, planetary lines calculator, astrocartography AI interpretation, accurate astrocartography chart, best free astrology map | 核心 P0 页面 |
| `/astrocartography-calculator` | 工具页 | astrocartography calculator | free astrocartography calculator, astrocartography calculator online, how astrocartography calculator works, astrocartography calculation method | 核心 P0 页面 |
| `/astrocartography-lines` | 主题枢纽页 | astrocartography lines | astrocartography lines meaning, planetary lines astrocartography, what are astrocartography lines, astrocartography line guide, best astrocartography lines, ASC DSC MC IC | 核心 P0 页面 |
| `/sun-line-astrocartography` | 行星线 SEO 页 | sun line astrocartography | sun line meaning astrocartography, sun line career, sun MC line, sun ASC line, astrocartography career line | 已覆盖 |
| `/moon-line-astrocartography` | 行星线 SEO 页 | moon line astrocartography | moon line meaning, moon IC line, home family astrocartography, best astrocartography line to live | 已覆盖 |
| `/mercury-line-astrocartography` | 行星线 SEO 页 | mercury line astrocartography | mercury line meaning, mercury MC line, communication line, best line for writing | 已覆盖 |
| `/venus-line-astrocartography` | 行星线 SEO 页 | venus line astrocartography | venus line meaning, venus line love astrocartography, venus DSC/ASC/MC/IC, astrocartography love line, best line for love | 已覆盖，高转化 |
| `/mars-line-astrocartography` | 行星线 SEO 页 | mars line astrocartography | mars line meaning, mars MC/ASC/DSC/IC, is mars line bad, astrocartography energy line | 已覆盖 |
| `/jupiter-line-astrocartography` | 行星线 SEO 页 | jupiter line astrocartography | jupiter line meaning, best place to live astrocartography, jupiter MC/ASC/DSC/IC, astrocartography luck | 已覆盖，高转化 |
| `/saturn-line-astrocartography` | 行星线 SEO 页 | saturn line astrocartography | saturn line meaning, is saturn line bad, saturn MC/ASC/DSC/IC, challenging lines | 已覆盖 |
| `/relocation-chart-calculator` | 工具页 | relocation chart | relocation chart calculator, free relocation chart, relocated chart, relocation astrology, astrocartography, natal chart relocation | 已覆盖 |
| `/solar-return-chart-calculator` | 工具页 | solar return chart | solar return chart calculator, annual solar return, solar return astrology, birthday chart astrology, relocated solar return chart, year ahead chart | 已覆盖 |
| `/synastry-chart-calculator` | 工具页 | synastry chart | synastry chart calculator, relationship astrology, birth chart compatibility, couple chart, Venus Mars synastry, Sun Moon synastry | 已覆盖 |
| `/composite-chart-calculator` | 工具页 | composite chart calculator | composite chart, free composite chart, relationship astrology, couple chart, midpoint method, birth chart compatibility | 已覆盖 |
| `/transit-chart-calculator` | 工具页 | transit chart calculator | transit chart, free transit chart, planetary transits, transit chart by date, natal transit chart | 已覆盖 |
| `/rising-sign-calculator` | 工具页 | rising sign calculator | ascendant calculator, calculate rising sign, free ascendant, birth time astrology | 已覆盖 |
| `/tools/birth-chart-generator` | 工具页 | birth chart generator | free birth chart generator, natal chart generator, birth chart wheel, planet positions, zodiac signs, houses, ascendant calculator | 已覆盖 |
| `/chart/natal-chart` | 教程 + 工具页 | natal chart | natal chart calculator, free natal chart, birth chart meaning, natal chart interpretation, natal chart houses | 已覆盖，但与 birth chart 相关页需避免内耗 |
| `/posts` | 博客列表 | blog | Blog | 内容承载页 |
| `/posts/[slug]` | 博客详情 | 按文章而定 | 按文章而定 | 动态内容页 |
| `/pricing` | 商业页 | pricing | paid AI chat / credits | 转化页，不是主要 SEO 获客页 |
| `/about` | 品牌页 | about | 当前 metadata 偏 Wplace / pixel art | 主题不一致，建议复核 |
| `/contact` | 支持页 | contact astrocartography | astrocartography support, contact form, astrocartography calculator help | 支持页 |
| `/color` | 非核心工具页 | Wplace Color Converter | Wplace color palette, pixel art converter, 64 color palette | 与主站主题不一致 |
| `/converter` | 非核心工具页 | Wplace Pixel Art Converter | 当前 keywords 为空 | 与主站主题不一致 |
| `/showcase` | 展示页 | showcase | 未发现明确 SEO keywords | 低优先级 |

## 4. Noindex / 功能 / 保护页

| URL | 类型 | SEO 判断 |
|---|---|---|
| `/chart` | 星盘地图生成结果页 | 已设置 `index: false`，适合作为功能页 |
| `/tools/birth-chart` | 跳转页 | redirect 到 `/tools/birth-chart-generator`，已设置 noindex |
| `/ai-chat-history` | 付费/登录功能页 | 不作为 SEO 获客页 |
| `/ai-chat-history/[id]` | 聊天详情页 | 不作为 SEO 获客页 |
| `/api-keys` | 用户中心 | 不作为 SEO 页面 |
| `/api-keys/create` | 用户中心 | 不作为 SEO 页面 |
| `/my-orders` | 用户中心 | 不作为 SEO 页面 |
| `/my-invites` | 用户中心 | 不作为 SEO 页面 |
| `/my-credits` | 用户中心 | 不作为 SEO 页面 |
| `/i/[code]` | 邀请/分享动态页 | 不作为常规 SEO 页面 |

## 5. Legal 页面

| URL | 类型 |
|---|---|
| `/privacy-policy` | 法务 |
| `/refund-policy` | 法务 |
| `/terms-of-service` | 法务 |

## 6. 当前明显缺口

| 缺口 | 说明 | 优先级 |
|---|---|---|
| `/uranus-line-astrocartography` | 行星线系列缺 Uranus | P1 |
| `/neptune-line-astrocartography` | 行星线系列缺 Neptune | P1 |
| `/pluto-line-astrocartography` | 行星线系列缺 Pluto | P1 |
| `how to read astrocartography map` 独立教程页 | 首页和 lines 页已覆盖一部分，但缺专门教程落地页 | P0/P1 |
| `astrocartography love lines` 或 `astrocartography for love` | Venus 页覆盖一部分，但可做更贴近转化的爱情主题页 | P0 |
| `best places to live astrology / astrocartography` | Jupiter/Moon 相关页覆盖一部分，但缺“居住地选择”主题页 | P0 |
| `ephemeris` | 当前无独立星历页 | P2/P3 |
| `mars sign calculator` | 当前无 Mars Sign Calculator | P2，泛占星工具，和主产品相关性中等 |

## 7. 关键词内耗提醒

| 主题 | 涉及 URL | 风险 |
|---|---|---|
| Birth Chart / Natal Chart | `/tools/birth-chart-generator`, `/chart/natal-chart`, `/tools/birth-chart` | `/tools/birth-chart` 已 redirect/noindex，风险可控；前两个页面需明确一个做 generator，一个做 natal chart meaning/calculator |
| Astrocartography Calculator / Chart | `/`, `/astrocartography-calculator`, `/chart` | `/chart` noindex；`/` 和 `/astrocartography-calculator` 要区分首页品牌工具入口和 calculator 专门页 |
| Line Meaning | `/astrocartography-lines` + 各行星线页 | 结构合理，建议继续补齐 Uranus/Neptune/Pluto |

