import { NextResponse } from 'next/server';
import { getAIChatCreditCost } from '@/services/config';

/**
 * 获取 AI 聊天消耗的积分数量
 * GET /api/ai-chat-credit-cost
 */
export async function GET() {
  try {
    const creditCost = getAIChatCreditCost();
    return NextResponse.json({
      success: true,
      creditCost,
    });
  } catch (error) {
    console.error('Failed to get AI chat credit cost:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get credit cost',
        creditCost: 10, // 默认值
      },
      { status: 500 }
    );
  }
}

