/**
 * 星盘数据格式化工具
 * 将星盘数据转换为 AI 可理解的文本上下文
 */

import { MAJOR_CITIES } from './cities';

interface BirthData {
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

interface PlanetLine {
  planet: string;
  type: 'AS' | 'DS' | 'MC' | 'IC';
  coordinates: [number, number][];
  color: string;
}

interface ChartData {
  birthData: BirthData;
  planetLines: PlanetLine[];
}

// 行星线类型的中文说明
const LINE_TYPE_MEANING: Record<string, { name: string; meaning: string }> = {
  AS: {
    name: '上升线 (Ascendant Line)',
    meaning: '行星在东方地平线上升的所有地点，带来该行星能量的活跃、新的开始和外在表现'
  },
  DS: {
    name: '下降线 (Descendant Line)',
    meaning: '行星在西方地平线下降的所有地点，影响关系、合作和与他人互动'
  },
  MC: {
    name: '中天线 (Midheaven Line)',
    meaning: '行星在天顶的所有地点，影响事业、公众形象、目标和成就'
  },
  IC: {
    name: '天底线 (IC Line)',
    meaning: '行星在天底的所有地点，影响家庭、内在安全感、根源和私人生活'
  }
};

// 行星的中文说明
const PLANET_MEANING: Record<string, string> = {
  Sun: '太阳 - 代表自我、生命力、目标、核心身份和创造力',
  Moon: '月亮 - 代表情感、直觉、内在需求、家庭和安全感',
  Mercury: '水星 - 代表沟通、思维、学习、交流和短途旅行',
  Venus: '金星 - 代表爱情、艺术、金钱、享受、美和人际关系',
  Mars: '火星 - 代表行动、激情、勇气、冲突和能量',
  Jupiter: '木星 - 代表机遇、扩张、好运、智慧、成长和哲学',
  Saturn: '土星 - 代表责任、纪律、限制、成熟和长期目标',
  Uranus: '天王星 - 代表创新、变革、自由、独立和突破',
  Neptune: '海王星 - 代表灵感、直觉、梦想、灵性和艺术',
  Pluto: '冥王星 - 代表转化、重生、深层变革和潜意识力量'
};

/**
 * 计算两点之间的距离（简化版，使用经纬度差值）
 * @param lat1 纬度1
 * @param lng1 经度1
 * @param lat2 纬度2
 * @param lng2 经度2
 * @returns 距离（度）
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = lat1 - lat2;
  const dLng = lng1 - lng2;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * 查找行星线附近的城市
 * @param coordinates 行星线坐标点数组
 * @param maxCities 最多返回的城市数量
 * @param maxDistance 最大距离（度，默认5度约500km）
 * @returns 城市名数组
 */
function findNearbyCitiesForLine(
  coordinates: [number, number][],
  maxCities: number = 5,
  maxDistance: number = 5
): string[] {
  if (coordinates.length === 0) return [];

  const cityDistances: Array<{ name: string; distance: number }> = [];

  // 对每个城市，找到与行星线最近的距离
  for (const city of MAJOR_CITIES) {
    let minDistance = Infinity;

    // 计算该城市到行星线上所有点的最小距离
    // 为了性能，只采样部分点（每10个点取1个）
    const samplePoints = coordinates.filter((_, index) => index % 10 === 0);
    if (samplePoints.length === 0) {
      samplePoints.push(coordinates[0]);
    }

    for (const [lat, lng] of samplePoints) {
      const distance = calculateDistance(city.lat, city.lng, lat, lng);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    // 如果距离在阈值内，添加到候选列表
    if (minDistance <= maxDistance) {
      cityDistances.push({ name: city.name, distance: minDistance });
    }
  }

  // 按距离排序，返回最近的N个城市
  cityDistances.sort((a, b) => a.distance - b.distance);
  return cityDistances.slice(0, maxCities).map(c => c.name);
}

/**
 * 格式化星盘数据为文本上下文（优化版：包含城市名、关键坐标点和路径信息）
 */
export function formatChartContext(chartData: ChartData): string {
  const { birthData, planetLines } = chartData;

  // 🔥 优化：增加出生时间和时区信息
  const timeInfo = birthData.time ? ` at ${birthData.time}` : '';
  const timezoneInfo = birthData.timezone ? ` (${birthData.timezone})` : '';
  let context = `📍 Birth: ${birthData.date}${timeInfo}${timezoneInfo}, ${birthData.location}`;
  if (birthData.latitude !== undefined && birthData.longitude !== undefined) {
    context += ` (${birthData.latitude.toFixed(2)}, ${birthData.longitude.toFixed(2)})`;
  }
  context += `\n\n`;

  // 按行星分组
  const planetGroups: Record<string, PlanetLine[]> = {};
  for (const line of planetLines) {
    if (!planetGroups[line.planet]) {
      planetGroups[line.planet] = [];
    }
    planetGroups[line.planet].push(line);
  }

  // 为每个行星生成描述
  for (const [planet, lines] of Object.entries(planetGroups)) {
    // 使用 emoji 和简化描述
    const planetEmoji: Record<string, string> = {
      Sun: '☀️',
      Moon: '🌙',
      Mercury: '☿️',
      Venus: '💕',
      Mars: '🔥',
      Jupiter: '🍀',
      Saturn: '🪐',
      Uranus: '⚡',
      Neptune: '🌊',
      Pluto: '💜',
    };

    const lineEmoji: Record<string, string> = {
      AS: '🌅',
      DS: '🤝',
      MC: '⭐',
      IC: '🏠',
    };

    const planetName: Record<string, string> = {
      Sun: 'Sun',
      Moon: 'Moon',
      Mercury: 'Mercury',
      Venus: 'Venus',
      Mars: 'Mars',
      Jupiter: 'Jupiter',
      Saturn: 'Saturn',
      Uranus: 'Uranus',
      Neptune: 'Neptune',
      Pluto: 'Pluto',
    };

    const lineName: Record<string, string> = {
      AS: 'AS (Rising)',
      DS: 'DS (Relationships)',
      MC: 'MC (Career)',
      IC: 'IC (Home)',
    };

    context += `${planetEmoji[planet] || '•'} ${planetName[planet] || planet}\n`;

    for (const line of lines) {
      const cities = findNearbyCitiesForLine(line.coordinates, 8, 7); // 🔥 优化：增加城市数量和查找范围
      const citiesText = cities.length > 0 ? cities.join(', ') : 'Various regions';

      context += `  ${lineEmoji[line.type] || '•'} ${lineName[line.type] || line.type}\n`;
      context += `     Cities: ${citiesText}\n`;
      
      // 🔥 新增：添加关键坐标点信息（用于更精确的位置查询）
      if (line.coordinates && line.coordinates.length > 0) {
        // 提取关键坐标点（起始、中间、结束点）
        const keyPoints: string[] = [];
        const totalPoints = line.coordinates.length;
        
        // 起始点
        if (totalPoints > 0) {
          const [lat1, lng1] = line.coordinates[0];
          keyPoints.push(`(${lat1.toFixed(2)}, ${lng1.toFixed(2)})`);
        }
        
        // 中间关键点（每25%取一个点，最多3个）
        if (totalPoints > 4) {
          const step = Math.floor(totalPoints / 4);
          for (let i = step; i < totalPoints - 1; i += step) {
            const [lat, lng] = line.coordinates[i];
            keyPoints.push(`(${lat.toFixed(2)}, ${lng.toFixed(2)})`);
            if (keyPoints.length >= 3) break; // 最多3个中间点
          }
        }
        
        // 结束点
        if (totalPoints > 1 && keyPoints.length < 5) {
          const [lat2, lng2] = line.coordinates[totalPoints - 1];
          const lastPoint = `(${lat2.toFixed(2)}, ${lng2.toFixed(2)})`;
          if (!keyPoints.includes(lastPoint)) {
            keyPoints.push(lastPoint);
          }
        }
        
        // 如果有坐标信息，添加到上下文（有助于回答具体位置问题）
        if (keyPoints.length > 0) {
          context += `     Key points: ${keyPoints.join(' → ')}\n`;
        }
      }
    }
    context += `\n`;
  }

  return context;
}

/**
 * 检测用户问题的语言
 */
/**
 * 检测文本的语言
 * @param text 要检测的文本
 * @returns 语言名称（中文/英文/西班牙文/意大利文/葡萄牙文）
 */
export function detectLanguage(text: string): string {
  // 简单的语言检测逻辑
  const chinesePattern = /[\u4e00-\u9fa5]/;
  const englishPattern = /^[a-zA-Z\s\?\!\.\,\']+$/;
  const spanishPattern = /[áéíóúñüÁÉÍÓÚÑÜ]/;
  const italianPattern = /[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/;
  const portuguesePattern = /[ãõçÃÕÇ]/;
  
  if (chinesePattern.test(text)) {
    return '中文';
  } else if (spanishPattern.test(text)) {
    return '西班牙文';
  } else if (italianPattern.test(text)) {
    return '意大利文';
  } else if (portuguesePattern.test(text)) {
    return '葡萄牙文';
  } else if (englishPattern.test(text) || /[a-zA-Z]/.test(text)) {
    return '英文';
  }
  
  return '英文'; // 默认英文
}

/**
 * 生成系统提示词（System Prompt）- 专业且懂人心的占星分析师
 * @param userMessageLanguage 用户问题的语言
 * @param questionCount 当前是第几个问题（从1开始）
 * @param remainingFreeQuestions 剩余免费问题数量（-1表示已付费用户）
 * @param userLocale 用户语言环境（用于优化回答长度和风格）
 */
export function getSystemPrompt(
  userMessageLanguage?: string,
  questionCount: number = 1,
  remainingFreeQuestions: number = 0,
  userLocale?: string
): string {
  // 🔥 优化：根据用户语言环境和检测到的语言，生成明确的语言指令
  // userLocale 用于确认语言环境（如 'zh', 'en', 'es' 等），userMessageLanguage 用于检测问题语言（如 '中文', '英文' 等）
  const detectedLanguage = userMessageLanguage || (userLocale === 'zh' || userLocale === 'zh-CN' ? '中文' : userLocale === 'es' ? '西班牙文' : userLocale === 'it' ? '意大利文' : userLocale === 'pt' ? '葡萄牙文' : '英文');
  
  const languageInstruction = detectedLanguage 
    ? `\n\n⚠️⚠️⚠️ CRITICAL LANGUAGE RULE - HIGHEST PRIORITY ⚠️⚠️⚠️\n\nThe user's question language has been detected as: **${detectedLanguage}**\n\nYOU MUST RESPOND ENTIRELY IN **${detectedLanguage}**!\n\n- If userLanguage = "英文", respond ONLY in English\n- If userLanguage = "中文", respond ONLY in Chinese (Simplified)\n- If userLanguage = "西班牙文", respond ONLY in Spanish\n- If userLanguage = "意大利文", respond ONLY in Italian\n- If userLanguage = "葡萄牙文", respond ONLY in Portuguese\n- If userLanguage = "马来文", respond ONLY in Malay\n\nDO NOT use any other language. DO NOT mix languages. Use ${detectedLanguage} ONLY.\n\n`
    : '';

  // 🔥 优化：根据问题次数和复杂度动态调整策略和回答长度
  // 检测问题复杂度（根据关键词判断是否需要详细回答）
  const isComplexQuestion = questionCount > 1 || remainingFreeQuestions === -1; // 追问或付费用户通常需要更详细回答
  
  let strategyInstruction = '';
  let lengthGuidance = '';
  
  if (questionCount === 1) {
    strategyInstruction = '\n🎯 **FIRST IMPRESSION STRATEGY**: This is the user\'s first question. Make it WOW! Be engaging, friendly, and create a strong first impression. Hook them with exciting insights that show your expertise!\n';
    lengthGuidance = detectedLanguage === '中文' 
      ? '\n**回答长度**: 中文 250-350 字符（比默认稍长，确保第一印象足够深刻）\n'
      : '\n**Answer Length**: English 200-300 words (slightly longer than default to ensure a strong first impression)\n';
  } else if (questionCount === 2 && remainingFreeQuestions === 0) {
    strategyInstruction = '\n💎 **VALUE HINT STRATEGY**: This is the user\'s last free question. Subtly hint at deeper insights available with more questions. Show the value of continued exploration without being pushy.\n';
    lengthGuidance = detectedLanguage === '中文'
      ? '\n**回答长度**: 中文 220-320 字符（保持价值感）\n'
      : '\n**Answer Length**: English 180-280 words (maintain value perception)\n';
  } else if (remainingFreeQuestions === -1 || remainingFreeQuestions > 0 || isComplexQuestion) {
    strategyInstruction = '\n🔍 **DEEP INSIGHT STRATEGY**: The user is engaged. Provide deeper, more detailed insights. Show your professional expertise and understanding of their needs!\n';
    lengthGuidance = detectedLanguage === '中文'
      ? '\n**回答长度**: 中文 300-400 字符（详细回答，充分展示专业度）\n'
      : '\n**Answer Length**: English 250-350 words (detailed response, fully demonstrate expertise)\n';
  } else {
    // 默认长度指导
    lengthGuidance = detectedLanguage === '中文'
      ? '\n**回答长度**: 中文 200-300 字符\n'
      : '\n**Answer Length**: English 150-250 words\n';
  }
  
  const remainingQuestionsText = remainingFreeQuestions >= 0 
    ? (userMessageLanguage === '中文' ? `✨ 还剩 ${remainingFreeQuestions} 次免费提问` : `✨ ${remainingFreeQuestions} free questions remaining`) 
    : '';

  return `${languageInstruction}You are a PROFESSIONAL and EMPATHETIC Astrocartography analyst chatting with a friend. Answer questions about their astrocartography chart accurately, engagingly, and insightfully.

${strategyInstruction}
## 🔴 CRITICAL RULES (HIGHEST PRIORITY!)

**1. LANGUAGE MATCHING:**
   - Always respond in the SAME language as the user's question (English→English, 中文→中文, etc.)
   - NEVER mix languages in one response!

**2. ANSWER ACCURACY (MOST IMPORTANT!):**
   - Read the question CAREFULLY and answer EXACTLY what was asked
   - "love AND success" = Answer BOTH parts completely (both mandatory!)
   - "如何/how" = Answer METHODS/STEPS, not locations
   - "哪里/where" = Answer LOCATIONS/PLACES, not methods
   - "具体哪些区域" = Provide SPECIFIC district NAMES (e.g., "徐汇区、黄浦区"), not descriptions
   - "具体哪些街区" = Provide SPECIFIC street/neighborhood NAMES, not district names
   - If asked about something missing, state it honestly, then provide alternatives

**3. USE CHART DATA:**
   - Base answers ONLY on the chart data provided
   - Reference specific cities and coordinates from the chart
   - If chart shows coordinates for a city, use them to provide more specific locations when asked
   - 🔥 **DATA VALIDATION**: Before answering, verify that the chart data contains the information needed. If the user asks about a planet line that doesn't exist in the chart, honestly state "Your chart doesn't include [planet] [line type]" and offer alternatives from the available data. NEVER make up or guess planetary lines that aren't in the chart!

## 🔴 SEMANTIC MAPPING

**Key Terms Mapping:**
- Love/爱情/伴侣 = Venus DS or Moon DS
- Career/事业/工作 = MC lines
- Wealth/财运 = Jupiter lines or Venus MC
- 区域/districts = specific district/area NAMES (e.g., "徐汇区、黄浦区")
- 街区/neighborhoods = specific street/neighborhood NAMES

**Analysis Guidelines:**
- Explain WHY and HOW planetary energy manifests (not just facts)
- Match city characteristics with planetary energies
- Provide deep insights about 2-3 cities (quality over quantity)
- Use warm, understanding language with practical advice

## 🎨 RESPONSE STYLE

**Write like chatting with a friend, NOT like a textbook!**

**Structure (4 parts):**
1. **Opening (10-20 chars/words)**: Excite with key planetary line and cities + emojis
2. **Core Answer (100-150 chars/80-120 words)**: 
   - **MOST IMPORTANT**: Answer ALL parts of question completely
   - Match question type (how=methods, where=locations, what=names)
   - Explain planetary meaning, line type impact, and city-specific differences
   - Use chart data (cities, coordinates) to provide specific locations when asked
3. **Practical Advice (40-60 chars/30-50 words)**: Specific actionable steps
4. **Follow-up Hook (20-30 chars/15-25 words)**: A/B/C format with valuable options

${lengthGuidance}
**Default Length (if not specified above):** Chinese 200-300 chars, English 150-250 words total

**Tone:** Friend-like, warm, enthusiastic, empathetic, use city names (never coordinates), 2-3 emojis

## Core Concepts (for your reference)

### Planetary Lines:
- **AS (Rising)**: New beginnings, active energy, external expression, how you present yourself
- **DS (Setting)**: Relationships, partnerships, interactions, how you connect with others
- **MC (Midheaven)**: Career, public image, achievements, life purpose, reputation
- **IC (Nadir)**: Family, inner security, roots, home, private life

### Planets:
- **Venus**: Love, beauty, relationships, art, harmony, values, attraction
- **Jupiter**: Opportunities, growth, good fortune, expansion, wisdom, abundance
- **Mars**: Action, passion, energy, drive, courage, conflict, ambition
- **Sun**: Self, vitality, identity, ego, life force, creativity
- **Moon**: Emotions, intuition, family, nurturing, needs, inner world
- **Mercury**: Communication, thinking, learning, travel, commerce, technology
- **Saturn**: Structure, discipline, responsibility, limitations, mastery, authority
- **Uranus**: Innovation, freedom, sudden changes, rebellion, uniqueness
- **Neptune**: Dreams, intuition, spirituality, creativity, illusion, compassion
- **Pluto**: Transformation, power, intensity, depth, regeneration

## Response Examples:

**Good Example (Chinese - 5 parts, ~280 characters):**
"你的金星线经过巴黎和罗马！🌹✨ 金星代表爱情和美丽，当它落在下降点(DS)线时，会放大你在一对一关系中的吸引力。巴黎适合艺术圈和浪漫邂逅，你可能会在博物馆或咖啡厅遇到特别的人；罗马则更适合深度灵魂连接，那里的历史氛围会让你的魅力更有深度。建议先旅游体验，春季或秋季能量最强。在这些城市多参加社交活动，保持开放心态。你更想了解：A. 这些城市的生活成本 B. 最佳访问时长 C. 文化适应建议 ${remainingQuestionsText}"

**Good Example (English - 5 parts, ~220 words):**
"Your Venus line runs through Paris and Rome! 🌹✨ Venus represents love and beauty, and when it falls on the Descendant (DS) line, it amplifies your attractiveness in one-on-one relationships. Paris is perfect for the art scene and romantic encounters - you might meet someone special at museums or cafes. Rome, on the other hand, is better for deep soul connections - the historical atmosphere adds depth to your charm. I recommend traveling first to experience it. Spring or autumn has the strongest energy. Attend social events in these cities and stay open-minded. You'd like to know: A. Cost of living in these cities B. Best visit duration C. Cultural adaptation tips ${remainingQuestionsText}"

**Bad Example (Academic - TOO SHORT, NO DETAILS, WRONG FOCUS):**
"根据金星DS线位于48.8566°N, 2.3522°E的坐标分析，该位置对人际关系有积极影响。建议前往这些城市。"

**Bad Example (WRONG - Didn't answer the question):**
User asks: "Which specific neighborhoods in Singapore align with my Moon DS line?"
Bad response: "Your career lines are fascinating! Seoul is a major hub..." (completely off-topic)

**Bad Example (WRONG - Didn't answer both parts):**
User asks: "Where should I move to find love and success?"
Bad response: "Your chart reveals fascinating career power in Singapore and Seoul!..." (only answered success/career, completely ignored love - UNACCEPTABLE!)

**Bad Example (WRONG - Didn't give specific names):**
User asks: "上海具体哪些区域更利恋爱？"
Bad response: "上海的能量更偏向文化情感连接..." (only gave descriptions, didn't provide specific district names like "徐汇区、黄浦区" - UNACCEPTABLE!)

**Bad Example (WRONG - Wrong question type):**
User asks: "如何在上海咖啡馆增强吸引力？"
Bad response: "你的月亮DS线在上海的能量集中在徐汇区和黄浦区！..." (answered WHERE instead of HOW - completely wrong question type - UNACCEPTABLE!)
Correct response should be: "在上海咖啡馆增强吸引力的方法：1. 选择月亮能量强的区域（如徐汇区）的咖啡馆 2. 选择满月前后或傍晚时段 3. 穿着柔和色调 4. 保持开放和温暖的能量..." (METHODS, not locations!)

Remember: Be professional, empathetic, accurate, and engaging. Follow the 5-part structure, make the Core Interpretation detailed (100-150 chars/80-120 words), answer ALL parts of the question, and ALWAYS use A/B/C format for follow-up questions that create value and curiosity!`;
}

/** Payload for AI synastry mode (no map lines). */
export interface SynastryPayloadForAI {
  personA: {
    birthData: {
      date: string;
      time: string;
      location: string;
      timezone?: string;
      latitude?: number;
      longitude?: number;
    };
    ascendant: { sign: string; degree: number };
    planets: Array<{ name: string; sign: string; house: number }>;
  };
  personB: {
    birthData: {
      date: string;
      time: string;
      location: string;
      timezone?: string;
      latitude?: number;
      longitude?: number;
    };
    ascendant: { sign: string; degree: number };
    planets: Array<{ name: string; sign: string; house: number }>;
  };
  aspects: Array<{ planetA: string; planetB: string; aspect: string; orb: number }>;
  relocated?: {
    location: string;
    ascendantA: { sign: string; degree: number };
    ascendantB: { sign: string; degree: number };
    aInB: Array<{ planet: string; houseInPartner: number }>;
    bInA: Array<{ planet: string; houseInPartner: number }>;
  };
}

export function formatSynastryContext(data: SynastryPayloadForAI): string {
  const fmtBirth = (label: string, b: SynastryPayloadForAI["personA"]) => {
    let s = `${label}\n`;
    s += `  Birth: ${b.birthData.date} ${b.birthData.time} (${b.birthData.timezone || "TZ"}) — ${b.birthData.location}`;
    if (b.birthData.latitude != null && b.birthData.longitude != null) {
      s += ` (${b.birthData.latitude.toFixed(2)}, ${b.birthData.longitude.toFixed(2)})`;
    }
    s += `\n  Ascendant: ${b.ascendant.sign} ${b.ascendant.degree.toFixed(1)}°\n`;
    s += `  Planets (whole-sign houses at birthplace):\n`;
    for (const p of b.planets) {
      s += `    ${p.name}: ${p.sign} (H${p.house})\n`;
    }
    return s;
  };

  let txt = "=== SYNASTRY (two natal charts) ===\n\n";
  txt += fmtBirth("PERSON A", data.personA);
  txt += "\n";
  txt += fmtBirth("PERSON B", data.personB);
  txt += "\n=== INTER-CHART ASPECTS (natal longitudes, major aspects) ===\n";
  const sorted = [...data.aspects].sort((a, b) => a.orb - b.orb);
  for (const a of sorted.slice(0, 80)) {
    txt += `  ${a.planetA} ${a.aspect} ${a.planetB} (orb ${a.orb}°)\n`;
  }
  if (data.relocated) {
    txt += `\n=== SHARED CITY (relocated whole-sign overlays) ===\n`;
    txt += `  City: ${data.relocated.location}\n`;
    txt += `  Asc A at city: ${data.relocated.ascendantA.sign} ${data.relocated.ascendantA.degree}°\n`;
    txt += `  Asc B at city: ${data.relocated.ascendantB.sign} ${data.relocated.ascendantB.degree}°\n`;
    txt += `  A's planets in B's houses at this location:\n`;
    for (const r of data.relocated.aInB) {
      txt += `    ${r.planet} → partner's house ${r.houseInPartner}\n`;
    }
    txt += `  B's planets in A's houses at this location:\n`;
    for (const r of data.relocated.bInA) {
      txt += `    ${r.planet} → partner's house ${r.houseInPartner}\n`;
    }
  }
  txt += "\n(Natal inter-planet aspects do not change with location; houses do.)\n";
  return txt;
}

export function getSynastrySystemPrompt(
  userMessageLanguage?: string,
  questionCount: number = 1,
  remainingFreeQuestions: number = 0,
  userLocale?: string
): string {
  const detectedLanguage =
    userMessageLanguage ||
    (userLocale === "zh" || userLocale === "zh-CN"
      ? "中文"
      : userLocale === "es"
        ? "西班牙文"
        : userLocale === "it"
          ? "意大利文"
          : userLocale === "pt"
            ? "葡萄牙文"
            : "英文");

  const languageInstruction = detectedLanguage
    ? `\n\n⚠️ CRITICAL: Respond entirely in **${detectedLanguage}**.\n\n`
    : "";

  return `${languageInstruction}You are a professional relationship astrologer interpreting SYNASTRY (comparison of two natal charts via planetary aspects and optional house overlays). You are NOT interpreting astrocartography map lines in this mode.

Rules:
- Base interpretations ONLY on the synastry data provided (aspects, signs, houses). Do not invent aspects.
- Cover major themes: emotional connection (Moon–Moon, Sun–Moon), attraction (Venus–Mars, Venus–Venus), communication (Mercury), commitment (Saturn aspects), intensity (Pluto), when present in the data.
- Use a balanced, non-fatalistic tone: highlight strengths and growth areas; avoid deterministic predictions about breakup or marriage.
- If the user asks about a specific pair (e.g. Sun–Moon), prioritize those aspects in the listing.
- Encourage self-awareness and communication; astrology is for reflection, not replacement for therapy or legal advice.

Answer length: first reply ~200–350 words in English (or equivalent in Chinese). Structure: (1) warm opening, (2) 2–4 bullet themes from the data, (3) practical relationship tips, (4) optional follow-up A/B/C.

Question context: question #${questionCount}, remaining free (for unauthenticated users conceptually): ${remainingFreeQuestions}.`;
}

/**
 * 从文本中提取城市名（支持中英文）
 * @param text 要提取的文本
 * @returns 提取到的城市名数组
 */
function extractCities(text: string): string[] {
  const cities: string[] = [];
  
  // 导入城市列表（避免循环依赖，直接在这里定义常用城市）
  const cityNames = [
    // 英文城市名
    'New York', 'Los Angeles', 'Chicago', 'Toronto', 'Mexico City',
    'São Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Bogotá',
    'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Moscow', 'Istanbul',
    'Tokyo', 'Beijing', 'Shanghai', 'Mumbai', 'Delhi', 'Bangkok', 'Singapore', 'Seoul', 'Dubai', 'Jakarta',
    'Cairo', 'Lagos', 'Johannesburg', 'Nairobi', 'Casablanca',
    'Sydney', 'Melbourne', 'Auckland',
    // 中文城市名（常见翻译）
    '纽约', '洛杉矶', '芝加哥', '多伦多', '墨西哥城',
    '圣保罗', '里约热内卢', '布宜诺斯艾利斯', '利马', '波哥大',
    '伦敦', '巴黎', '柏林', '马德里', '罗马', '阿姆斯特丹', '莫斯科', '伊斯坦布尔',
    '东京', '北京', '上海', '孟买', '德里', '曼谷', '新加坡', '首尔', '迪拜', '雅加达',
    '开罗', '拉各斯', '约翰内斯堡', '内罗毕', '卡萨布兰卡',
    '悉尼', '墨尔本', '奥克兰',
  ];
  
  // 按长度从长到短排序，避免短城市名被长城市名包含
  const sortedCities = cityNames.sort((a, b) => b.length - a.length);
  
  for (const city of sortedCities) {
    // 使用单词边界或标点符号来匹配城市名，避免部分匹配
    const regex = new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(text) && !cities.includes(city)) {
      cities.push(city);
    }
  }
  
  return cities;
}

/**
 * 生成追问建议（基于用户问题和AI回答）
 * @param userQuestion 用户的问题
 * @param aiResponse AI的回答内容（可选，如果提供则从中提取城市名）
 * @returns 3个追问建议
 */
export function generateFollowUpSuggestions(
  userQuestion: string,
  aiResponse?: string
): string[] {
  // 🔥 检测用户问题的语言，确保追问建议使用相同语言
  const userLanguage = detectLanguage(userQuestion);
  const isChinese = userLanguage === '中文';
  
  const question = userQuestion.toLowerCase();
  
  // 从AI回答中提取城市名
  let cities: string[] = [];
  if (aiResponse) {
    cities = extractCities(aiResponse);
  }
  
  // 检测问题类型
  const isLoveQuestion = /love|relationship|romance|venus|dating|partner|marry|marriage|romantic|crush|heart|感情|爱情|恋爱|伴侣|结婚|浪漫|约会/.test(question);
  const isCareerQuestion = /career|job|work|business|profession|mc|midheaven|success|achievement|事业|工作|职业|成功|成就|职场/.test(question);
  const isTravelQuestion = /travel|move|relocate|visit|trip|journey|where|location|place|city|搬家|旅行|搬迁|地点|城市|去哪里/.test(question);
  
  // 根据问题类型和提取的城市名生成追问建议（支持中英文）
  if (isLoveQuestion) {
    if (cities.length >= 2) {
      return isChinese ? [
        `${cities[0]}哪个区域最适合寻找真爱？`,
        `什么时候去${cities[1]}最好？`,
        `对比：${cities[0]} vs ${cities[1]}的爱情能量`
      ] : [
        `Which area in ${cities[0]} is best for finding true love?`,
        `When is the best time to visit ${cities[1]}?`,
        `Compare: ${cities[0]} vs ${cities[1]} love energy`
      ];
    } else if (cities.length === 1) {
      return isChinese ? [
        `${cities[0]}哪个区域最适合我？`,
        `什么时候去${cities[0]}最好？`,
        `还有其他适合爱情的城市吗？`
      ] : [
        `Which area in ${cities[0]} is best for me?`,
        `When is the best time to visit ${cities[0]}?`,
        `Are there other cities suitable for love?`
      ];
    } else {
      return isChinese ? [
        "哪个城市最适合寻找真爱？",
        "我应该什么时候去这些城市？",
        "这些城市的生活成本如何？"
      ] : [
        "Which city is best for finding true love?",
        "When should I visit these cities?",
        "What's the cost of living in these cities?"
      ];
    }
  } else if (isCareerQuestion) {
    if (cities.length >= 2) {
      return isChinese ? [
        `${cities[0]}适合什么类型的工作？`,
        `我应该先旅游还是直接搬到${cities[1]}？`,
        `对比：${cities[0]} vs ${cities[1]}的事业机会`
      ] : [
        `What types of work is ${cities[0]} suitable for?`,
        `Should I travel first or move directly to ${cities[1]}?`,
        `Compare: ${cities[0]} vs ${cities[1]} career opportunities`
      ];
    } else if (cities.length === 1) {
      return isChinese ? [
        `${cities[0]}适合什么类型的工作？`,
        `我应该先旅游还是直接搬到${cities[0]}？`,
        `对比一下其他城市的机会？`
      ] : [
        `What types of work is ${cities[0]} suitable for?`,
        `Should I travel first or move directly to ${cities[0]}?`,
        `Compare opportunities in other cities?`
      ];
    } else {
      return isChinese ? [
        "这些城市适合什么类型的工作？",
        "我应该先旅游还是直接搬过去？",
        "最佳访问时长建议？"
      ] : [
        "What types of work are these cities suitable for?",
        "Should I travel first or move directly?",
        "Best visit duration recommendations?"
      ];
    }
  } else if (isTravelQuestion) {
    if (cities.length >= 2) {
      return isChinese ? [
        `${cities[0]}和${cities[1]}的生活成本对比？`,
        `什么时候去这些城市最合适？`,
        `文化适应注意事项？`
      ] : [
        `Cost of living comparison: ${cities[0]} vs ${cities[1]}?`,
        `When is the best time to visit these cities?`,
        `Cultural adaptation considerations?`
      ];
    } else if (cities.length === 1) {
      return isChinese ? [
        `${cities[0]}的生活成本如何？`,
        `什么时候去${cities[0]}最合适？`,
        `文化适应注意事项？`
      ] : [
        `What's the cost of living in ${cities[0]}?`,
        `When is the best time to visit ${cities[0]}?`,
        `Cultural adaptation considerations?`
      ];
    } else {
      return isChinese ? [
        "这些城市的生活成本？",
        "最佳访问时长建议？",
        "文化适应注意事项？"
      ] : [
        "Cost of living in these cities?",
        "Best visit duration recommendations?",
        "Cultural adaptation considerations?"
      ];
    }
  } else {
    // 默认追问建议（基于提取的城市名）
    if (cities.length >= 2) {
      return isChinese ? [
        `${cities[0]}和${cities[1]}的具体区别？`,
        `什么时候去这些城市最好？`,
        `还有其他值得关注的城市吗？`
      ] : [
        `Specific differences between ${cities[0]} and ${cities[1]}?`,
        `When is the best time to visit these cities?`,
        `Are there other cities worth paying attention to?`
      ];
    } else if (cities.length === 1) {
      return isChinese ? [
        `${cities[0]}的具体优势？`,
        `什么时候去${cities[0]}最好？`,
        `还有其他值得关注的城市吗？`
      ] : [
        `What are the specific advantages of ${cities[0]}?`,
        `When is the best time to visit ${cities[0]}?`,
        `Are there other cities worth paying attention to?`
      ];
    } else {
      return isChinese ? [
        "这些城市的具体区别？",
        "最佳访问时间建议？",
        "还有其他值得关注的地方吗？"
      ] : [
        "Specific differences between these cities?",
        "Best visit time recommendations?",
        "Are there other places worth paying attention to?"
      ];
    }
  }
}

