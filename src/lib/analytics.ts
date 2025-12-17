/**
 * Google Analytics 4 (GA4) 事件跟踪工具
 * 
 * 使用 Next.js 的 @next/third-parties/google 包，通过 gtag 发送事件
 */

// 扩展 Window 接口，添加 gtag 类型
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set' | 'js',
      targetId: string | Date,
      config?: {
        [key: string]: any;
      }
    ) => void;
  }
}

/**
 * 发送 GA4 事件
 * @param eventName 事件名称
 * @param eventParams 事件参数
 */
export function trackEvent(
  eventName: string,
  eventParams?: {
    [key: string]: any;
  }
) {
  // 只在客户端和生产环境执行
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    // 开发环境打印日志，方便调试
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [GA4 Event]', eventName, eventParams);
    }
    return;
  }

  // 检查 gtag 是否可用
  if (!window.gtag) {
    console.warn('GA4 gtag is not available');
    return;
  }

  try {
    window.gtag('event', eventName, {
      ...eventParams,
      // 添加时间戳
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to track GA4 event:', error);
  }
}

/**
 * Ask AI 相关事件
 */
export const askAIEvents = {
  /**
   * 打开 Ask AI 对话框
   * @param source 来源：'auto' | 'manual'
   */
  dialogOpened: (source: 'auto' | 'manual') => {
    trackEvent('ai_dialog_opened', {
      source,
      event_category: 'Ask AI',
      event_label: source === 'auto' ? 'Auto Popup' : 'Manual Click',
    });
  },

  /**
   * 关闭 Ask AI 对话框
   * @param questionCount 已问问题数量
   * @param userType 用户类型：'logged_in' | 'guest'
   */
  dialogClosed: (questionCount: number, userType: 'logged_in' | 'guest') => {
    trackEvent('ai_dialog_closed', {
      question_count: questionCount,
      user_type: userType,
      event_category: 'Ask AI',
    });
  },

  /**
   * 发送问题
   * @param questionNumber 问题序号（第几个问题）
   * @param isFreeQuestion 是否是免费问题
   * @param userType 用户类型
   */
  questionSent: (
    questionNumber: number,
    isFreeQuestion: boolean,
    userType: 'logged_in' | 'guest'
  ) => {
    trackEvent('ai_question_sent', {
      question_number: questionNumber,
      is_free_question: isFreeQuestion,
      user_type: userType,
      event_category: 'Ask AI',
    });
  },

  /**
   * 收到 AI 回复
   * @param questionNumber 问题序号
   * @param responseLength 回复长度（字符数）
   */
  responseReceived: (questionNumber: number, responseLength: number) => {
    trackEvent('ai_response_received', {
      question_number: questionNumber,
      response_length: responseLength,
      event_category: 'Ask AI',
    });
  },

  /**
   * 积分不足提示
   * @param creditsRemaining 剩余积分
   * @param creditsRequired 所需积分
   */
  insufficientCredits: (creditsRemaining: number, creditsRequired: number) => {
    trackEvent('ai_insufficient_credits', {
      credits_remaining: creditsRemaining,
      credits_required: creditsRequired,
      event_category: 'Ask AI',
      event_label: 'Insufficient Credits',
    });
  },
};

/**
 * 付费相关事件
 */
export const paymentEvents = {
  /**
   * 打开价格弹窗
   * @param triggerSource 触发来源：'insufficient_credits' | 'manual' | 'other'
   */
  pricingModalOpened: (triggerSource: 'insufficient_credits' | 'manual' | 'other') => {
    trackEvent('pricing_modal_opened', {
      trigger_source: triggerSource,
      event_category: 'Payment',
      event_label: 'Pricing Modal',
    });
  },

  /**
   * 查看价格方案
   * @param planName 方案名称
   * @param planPrice 方案价格
   */
  planViewed: (planName: string, planPrice: number) => {
    trackEvent('pricing_plan_viewed', {
      plan_name: planName,
      plan_price: planPrice,
      event_category: 'Payment',
      event_label: planName,
    });
  },

  /**
   * 点击购买按钮
   * @param planName 方案名称
   * @param planPrice 方案价格
   * @param planId 方案 ID
   */
  buyButtonClicked: (planName: string, planPrice: number, planId: string) => {
    trackEvent('pricing_buy_clicked', {
      plan_name: planName,
      plan_price: planPrice,
      plan_id: planId,
      event_category: 'Payment',
      event_label: planName,
      value: planPrice, // 用于 GA4 的货币价值追踪
      currency: 'USD',
    });
  },

  /**
   * 开始支付流程
   * @param planName 方案名称
   * @param planPrice 方案价格
   * @param planId 方案 ID
   */
  paymentInitiated: (planName: string, planPrice: number, planId: string) => {
    trackEvent('payment_initiated', {
      plan_name: planName,
      plan_price: planPrice,
      plan_id: planId,
      event_category: 'Payment',
      event_label: 'Payment Started',
      value: planPrice,
      currency: 'USD',
    });
  },

  /**
   * 支付成功
   * @param planName 方案名称
   * @param planPrice 方案价格
   * @param planId 方案 ID
   * @param transactionId 交易 ID
   */
  paymentSuccess: (
    planName: string,
    planPrice: number,
    planId: string,
    transactionId?: string
  ) => {
    trackEvent('purchase', {
      // 使用 GA4 标准的 purchase 事件
      transaction_id: transactionId || `plan_${planId}_${Date.now()}`,
      value: planPrice,
      currency: 'USD',
      items: [
        {
          item_id: planId,
          item_name: planName,
          price: planPrice,
          quantity: 1,
        },
      ],
      event_category: 'Payment',
      event_label: 'Payment Success',
    });
  },

  /**
   * 支付失败
   * @param planName 方案名称
   * @param planPrice 方案价格
   * @param planId 方案 ID
   * @param errorReason 失败原因
   */
  paymentFailed: (
    planName: string,
    planPrice: number,
    planId: string,
    errorReason?: string
  ) => {
    trackEvent('payment_failed', {
      plan_name: planName,
      plan_price: planPrice,
      plan_id: planId,
      error_reason: errorReason || 'unknown',
      event_category: 'Payment',
      event_label: 'Payment Failed',
    });
  },
};

/**
 * 页面访问事件
 */
export const pageEvents = {
  /**
   * 访问地图页面
   */
  chartPageViewed: () => {
    trackEvent('page_view', {
      page_title: 'Astrocartography Chart',
      page_location: window.location.href,
      event_category: 'Page View',
    });
  },
};

