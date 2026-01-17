import {
  LanguageModelV1,
  streamText,
} from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { respErr } from "@/lib/resp";
import { formatChartContext, getSystemPrompt } from "@/lib/astro-format";
import { getUserUuid } from "@/services/user";
import { getUserCredits, decreaseCredits, CreditsTransType } from "@/services/credit";
import { getAIChatCreditCost } from "@/services/config";

// 检测用户问题的语言
function detectUserLanguage(text: string): string {
  const trimmedText = text.trim();
  
  // 检测中文（包含中文字符）
  if (/[\u4e00-\u9fa5]/.test(trimmedText)) {
    return '中文';
  }
  
  // 检测西班牙文（包含西班牙语特殊字符）
  if (/[áéíóúñüÁÉÍÓÚÑÜ]/.test(trimmedText)) {
    return '西班牙文';
  }
  
  // 检测意大利文（包含意大利语特殊字符）
  if (/[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/.test(trimmedText)) {
    return '意大利文';
  }
  
  // 检测葡萄牙文（包含葡萄牙语特殊字符）
  if (/[ãõçÃÕÇ]/.test(trimmedText)) {
    return '葡萄牙文';
  }
  
  // 检测是否有英文字母（大部分情况下是英文）
  if (/[a-zA-Z]/.test(trimmedText)) {
    return '英文';
  }
  
  // 默认英文
  return '英文';
}

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  chartData: {
    birthData: {
      date: string;
      time: string;
      location: string;
      latitude?: number;
      longitude?: number;
      timezone?: string;
    };
    planetLines: {
      planet: string;
      type: 'AS' | 'DS' | 'MC' | 'IC';
      coordinates: [number, number][];
      color: string;
    }[];
  };
  questionCount?: number; // 当前是第几个问题
  remainingFreeQuestions?: number; // 剩余免费问题数量
  userLocale?: string; // 🔥 新增：用户语言环境（用于优化 AI 回答）
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, chartData, questionCount, remainingFreeQuestions, userLocale } = body;

    // 🔥 调试：记录接收到的数据
    console.log('📥 [API] 接收到的请求数据:', {
      hasMessages: !!messages,
      messagesLength: messages?.length || 0,
      hasChartData: !!chartData,
      hasBirthData: !!chartData?.birthData,
      hasPlanetLines: !!chartData?.planetLines,
      planetLinesLength: chartData?.planetLines?.length || 0,
      birthDataKeys: chartData?.birthData ? Object.keys(chartData.birthData) : [],
    });

    // 验证必需参数
    if (!messages || messages.length === 0) {
      return respErr("Messages cannot be empty");
    }

    // 获取最后一条用户消息
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'user' || !lastMessage.content.trim()) {
      return respErr("Question cannot be empty");
    }

    // 🔥 详细检查 chartData
    if (!chartData) {
      console.error('❌ [API] chartData 为空');
      return respErr("Chart data is incomplete");
    }
    
    if (!chartData.birthData) {
      console.error('❌ [API] chartData.birthData 为空');
      return respErr("Chart data is incomplete");
    }
    
    if (!chartData.planetLines) {
      console.error('❌ [API] chartData.planetLines 为空');
      return respErr("Chart data is incomplete");
    }
    
    // 检查 birthData 的必需字段
    if (!chartData.birthData.date || !chartData.birthData.time || !chartData.birthData.location) {
      console.error('❌ [API] birthData 缺少必需字段:', {
        hasDate: !!chartData.birthData.date,
        hasTime: !!chartData.birthData.time,
        hasLocation: !!chartData.birthData.location,
        birthData: chartData.birthData,
        allKeys: Object.keys(chartData.birthData),
      });
      return respErr("Chart data is incomplete");
    }
    
    // 检查 planetLines 是否为空数组
    if (!Array.isArray(chartData.planetLines) || chartData.planetLines.length === 0) {
      console.error('❌ [API] planetLines 是空数组或不是数组:', {
        isArray: Array.isArray(chartData.planetLines),
        length: chartData.planetLines?.length || 0,
        planetLines: chartData.planetLines,
      });
      return respErr("Chart data is incomplete");
    }
    
    // 检查第一个 planetLine 是否有 type 字段
    const firstLine = chartData.planetLines[0];
    if (!firstLine || !firstLine.type) {
      console.error('❌ [API] planetLines[0] 缺少 type 字段或为空:', {
        firstLine,
        hasType: !!firstLine?.type,
        allKeys: firstLine ? Object.keys(firstLine) : [],
        planetLinesSample: chartData.planetLines.slice(0, 3),
      });
      return respErr("Chart data is incomplete");
    }
    
    // ✅ 所有检查通过
    console.log('✅ [API] chartData 验证通过:', {
      birthData: {
        date: chartData.birthData.date,
        time: chartData.birthData.time,
        location: chartData.birthData.location,
      },
      planetLinesCount: chartData.planetLines.length,
      firstLineType: chartData.planetLines[0].type,
    });

    // 🔥 检查用户是否登录
    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      // 返回 401 状态码，添加 type 字段标识为需要登录
      return new Response(
        JSON.stringify({ 
          code: 401, 
          type: 'auth_required',
          message: "Please sign in to continue using Astro Chat" 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 🔥 获取 AI 聊天消耗的积分数量（从配置读取）
    const creditCost = getAIChatCreditCost();
    
    // 🔥 检查用户积分余额
    const userCredits = await getUserCredits(user_uuid);
    if (userCredits.left_credits < creditCost) {
      // 返回 402 状态码，添加 type 字段标识为积分不足
      return new Response(
        JSON.stringify({
          code: 402,
          type: 'insufficient_credits',
          message: `Insufficient credits. ${creditCost} credits required, current balance: ${userCredits.left_credits} credits`,
          creditCost,
          currentBalance: userCredits.left_credits,
        }),
        {
          status: 402,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 🔥 消耗积分（在调用 AI 之前）
    try {
      await decreaseCredits({
        user_uuid,
        trans_type: CreditsTransType.AIChat,
        credits: creditCost,
      });
      console.log(`✅ [Astro Chat] 用户 ${user_uuid} 消耗 ${creditCost} 积分进行 AI 聊天`);
    } catch (creditError: any) {
      console.error("❌ [Astro Chat] 消耗积分失败:", creditError);
      return new Response(
        JSON.stringify({ code: 500, message: "Failed to deduct credits, please try again later" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查 DeepSeek API Key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error("DEEPSEEK_API_KEY not configured");
      return respErr("AI service not configured: DEEPSEEK_API_KEY environment variable is not set");
    }

    // 初始化 DeepSeek 模型
    // 使用 deepseek-chat 模型（性能好、成本低、中文支持佳）
    // deepseek() 会自动从环境变量 DEEPSEEK_API_KEY 读取 API Key
    const textModel: LanguageModelV1 = deepseek("deepseek-chat");

    // 检测用户问题的语言
    const userLanguage = detectUserLanguage(lastMessage.content);
    
    // 计算问题数量（如果未提供，从 messages 计算）
    const actualQuestionCount = questionCount ?? messages.filter(m => m.role === 'user').length;
    const actualRemainingFreeQuestions = remainingFreeQuestions ?? 0;
    
    // 格式化星盘数据为上下文
    const chartContext = formatChartContext(chartData);
    
    // 根据用户语言和问题次数生成系统提示词（传递 userLocale 以优化回答）
    const systemPrompt = getSystemPrompt(userLanguage, actualQuestionCount, actualRemainingFreeQuestions, userLocale);
    
    // 注意：追问建议由前端在 onFinish 回调中生成，不需要在这里生成
    
    // 构建系统消息（包含星盘上下文）
    // 根据用户语言调整星盘数据说明的语言
    const chartDataIntro = userLanguage === '中文' 
      ? '以下是用户的星盘数据：'
      : userLanguage === '英文'
      ? 'Below is the user\'s astrocartography chart data:'
      : 'Below is the user\'s astrocartography chart data:';
    
    const systemMessage = {
      role: 'system' as const,
      content: `${systemPrompt}\n\n${chartDataIntro}\n\n${chartContext}`,
    };

    // 🔥 修复：构建完整的对话上下文（系统消息 + 所有用户消息，包括当前问题）
    // useChat 会将当前输入添加到 messages 的最后一条，我们必须包含它，否则 AI 看不到当前问题
    const conversationMessages = [
      systemMessage,
      ...messages, // ✅ 包含所有消息，包括当前用户问题（最后一条）
    ];

    // 调用 AI 生成流式响应
    const result = await streamText({
      model: textModel,
      messages: conversationMessages,
      maxTokens: 3000, // 🔥 优化：增加 maxTokens 以支持更详细的回答（从 2000 增至 3000）
      temperature: 0.5, // 🔥 优化：降低 temperature 提高准确性和一致性（从 0.7 降至 0.5）
    });

    // 返回流式响应
    // 注意：追问建议由前端在 onFinish 回调中生成，不需要在这里追加
    return result.toDataStreamResponse({
      sendReasoning: false, // DeepSeek chat 不支持推理过程
    });

  } catch (err) {
    console.error("astro-chat error:", err);
    const errorMessage = err instanceof Error ? err.message : "AI chat service error";
    return respErr(errorMessage);
  }
}

