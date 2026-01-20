/**
 * @fileoverview 支付处理逻辑 Hook
 * @description 提供统一的支付处理逻辑，包括订单创建、Stripe/Creem支付跳转等功能
 * @author Miniatur AI Team
 * @created 2025-01-26
 * 
 * @features
 * - 支付参数验证和处理
 * - Stripe/Creem支付会话创建
 * - 用户认证状态检查
 * - 支付加载状态管理
 * - 错误处理和用户提示
 * - 支付方式选择支持
 * 
 * @usage
 * ```tsx
 * const { handleCheckout, isLoading, productId } = usePayment();
 * 
 * const onPayment = async () => {
 *   const result = await handleCheckout(pricingItem, false, 'stripe');
 *   if (result.success) {
 *     // 支付成功处理
 *   }
 * };
 * ```
 */

"use client";

import { useState } from 'react';
import { useAppContext } from '@/contexts/app';
import { useLocale } from 'next-intl';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import { PricingItem } from '@/types/blocks/pricing';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * 支付处理 Hook
 * @returns {Object} 支付相关的状态和方法
 * @returns {Function} handleCheckout - 处理支付的主函数
 * @returns {boolean} isLoading - 支付处理中的加载状态
 * @returns {string|null} productId - 当前正在处理的产品ID
 */
export function usePayment() {
  const { user, setShowSignModal } = useAppContext();
  const locale = useLocale();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);

  /**
   * 处理支付流程
   * @param {PricingItem} item - 定价项目信息
   * @param {boolean} cn_pay - 是否使用中国支付方式（支付宝/微信）
   * @param {string} paymentMethod - 支付方式: 'stripe' | 'creem'，默认为 'stripe'
   * @returns {Promise<Object>} 支付结果
   */
  const handleCheckout = async (
    item: PricingItem,
    cn_pay: boolean = false,
    paymentMethod: "stripe" | "creem" = "stripe"
  ) => {
    try {
      // 检查用户登录状态
      if (!user) {
        setShowSignModal(true);
        return { needAuth: true };
      }

      // 构建支付参数
      const params: {
        product_id: string;
        product_name?: string;
        credits?: number;
        interval: "month" | "year" | "one-time";
        amount?: number;
        currency?: string;
        valid_months?: number;
        locale: string;
        creem_product_id?: string;
      } = {
        product_id: item.product_id,
        product_name: item.product_name,
        credits: item.credits,
        interval: item.interval,
        amount: cn_pay ? item.cn_amount : item.amount,
        currency: cn_pay ? "cny" : item.currency,
        valid_months: item.valid_months,
        locale: locale || "en",
      };

      // 设置加载状态
      setIsLoading(true);
      setProductId(item.product_id);

      // 根据支付方式选择对应的 API 端点
      const apiEndpoint =
        paymentMethod === "creem" ? "/api/checkout/creem" : "/api/checkout";

      // 如果使用 Creem，根据 product_id 从环境变量获取对应的产品 ID
      if (paymentMethod === "creem") {
        // 根据 product_id 映射到对应的环境变量
        const creemProductIdMap: Record<string, string | undefined> = {
          "standard": process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_STANDARD,
          "professional": process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_PROFESSIONAL,
        };
        
        params.creem_product_id =
          item.creem_product_id ||  // 优先级1：配置文件中指定（可选）
          creemProductIdMap[item.product_id] ||  // 优先级2：根据 product_id 从环境变量读取
          process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID;  // 优先级3：默认值（后备）
      }

      // 调用后端API创建订单
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      // 处理未授权状态
      if (response.status === 401) {
        setIsLoading(false);
        setProductId(null);
        setShowSignModal(true);
        return { needAuth: true };
      }

      // 解析响应数据
      const { code, message, data } = await response.json();
      if (code !== 0) {
        toast.error(message);
        return { success: false, message };
      }

      // 根据支付方式处理跳转
      if (paymentMethod === "creem") {
        // Creem 支付：移动端直接跳转，桌面端新标签页打开
        // 🔥 原因：移动端浏览器限制异步回调中的 window.open，导致支付表单无法正常加载或交互
        // 移动端浏览器要求 window.open 必须在用户点击的同步上下文中调用
        // 当前代码在 await fetch 之后的异步回调中调用 window.open，违反了移动端浏览器的要求
        const { checkout_url } = data;
        if (checkout_url) {
          if (isMobile) {
            // 移动端：直接跳转，避免 window.open 导致的表单加载问题
            window.location.href = checkout_url;
          } else {
            // 桌面端：在新标签页打开
            window.open(checkout_url, '_blank', 'noopener,noreferrer');
          }
          return { success: true };
        } else {
          toast.error("Failed to get checkout URL");
          return { success: false, message: "Failed to get checkout URL" };
        }
      } else {
        // Stripe 支付：使用 Stripe SDK 跳转
        const { public_key, session_id } = data;
        const stripe = await loadStripe(public_key);
        
        if (!stripe) {
          toast.error("checkout failed");
          return { success: false };
        }

        // 跳转到Stripe支付页面
        const result = await stripe.redirectToCheckout({
          sessionId: session_id,
        });

        if (result.error) {
          toast.error(result.error.message);
          return { success: false, message: result.error.message };
        }

        return { success: true };
      }
    } catch (e) {
      console.log("checkout failed: ", e);
      toast.error("checkout failed");
      return { success: false };
    } finally {
      // 清理加载状态
      setIsLoading(false);
      setProductId(null);
    }
  };

  return {
    handleCheckout,
    isLoading,
    productId,
  };
}