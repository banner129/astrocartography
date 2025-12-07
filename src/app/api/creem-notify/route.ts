/**
 * @fileoverview Creem Webhook 处理路由
 * @description 处理 Creem 支付成功的回调通知
 */

import { respOk, respErr } from "@/lib/resp";
import { verifyCreemWebhookSignature, parseCreemWebhookEvent } from "@/services/creem";
import { findOrderByOrderNo, OrderStatus, updateOrderStatus, findOrderByEmailAndAmount } from "@/models/order";
import { updateCreditForOrder } from "@/services/credit";
import { updateAffiliateForOrder } from "@/services/affiliate";
import { sendOrderConfirmationEmail } from "@/services/email";
import { getIsoTimestr } from "@/lib/time";
import { Order } from "@/types/order";

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("CREEM_WEBHOOK_SECRET is not configured");
      return respErr("webhook secret not configured");
    }

    // 获取请求签名
    const signature = req.headers.get("x-creem-signature") || 
                     req.headers.get("creem-signature") ||
                     req.headers.get("signature") || 
                     "";

    // 读取请求体
    const body = await req.text();

    if (!body) {
      return respErr("invalid request body");
    }

    // 🔥 添加详细日志：打印原始请求数据
    console.log("🔔 [Creem Webhook] ========== 收到 Webhook 请求 ==========");
    console.log("🔔 [Creem Webhook] 请求头:", Object.fromEntries(req.headers.entries()));
    console.log("🔔 [Creem Webhook] 签名:", signature || "(无签名)");
    console.log("🔔 [Creem Webhook] 原始请求体:", body);

    // 验证签名（如果 Creem 提供签名验证）
    if (signature) {
      const isValid = verifyCreemWebhookSignature(
        body,
        signature,
        webhookSecret
      );

      if (!isValid) {
        console.error("❌ [Creem Webhook] 签名验证失败");
        return Response.json({ error: "invalid signature" }, { status: 401 });
      } else {
        console.log("✅ [Creem Webhook] 签名验证通过");
      }
    } else {
      console.log("⚠️ [Creem Webhook] 未提供签名，跳过验证");
    }

    // 解析事件
    let eventData: any;
    try {
      eventData = JSON.parse(body);
    } catch (e) {
      console.error("❌ [Creem Webhook] JSON 解析失败:", e);
      return respErr("invalid json body");
    }

    // 🔥 添加详细日志：打印解析后的数据
    console.log("🔔 [Creem Webhook] 解析后的完整数据:", JSON.stringify(eventData, null, 2));
    console.log("🔔 [Creem Webhook] 数据的所有键:", Object.keys(eventData));

    // 解析事件类型和数据
    const { type, data } = parseCreemWebhookEvent(eventData);

    // 🔥 添加详细日志：打印解析后的事件类型和数据
    console.log("🔔 [Creem Webhook] 事件类型:", type);
    console.log("🔔 [Creem Webhook] 事件数据:", JSON.stringify(data, null, 2));
    console.log("🔔 [Creem Webhook] 事件数据的所有键:", Object.keys(data || {}));

    // 处理不同类型的事件
    switch (type) {
      case "payment.succeeded":
      case "payment.success":
      case "checkout.completed":
      case "charge.succeeded": {
        // 🔥 直接处理支付成功事件，避免调用可能出错的 handleCreemOrder
        await handleCreemPaymentSuccess(data);
        break;
      }

      case "payment.failed":
      case "charge.failed": {
        // 处理支付失败事件（可选）
        console.log("Payment failed:", data);
        break;
      }

      case "subscription.created":
      case "subscription.updated": {
        // 处理订阅事件（可选）
        console.log("Subscription event:", data);
        break;
      }

      default:
        console.log("Unhandled Creem webhook event type:", type);
    }

    return respOk();
  } catch (e: any) {
    console.error("creem webhook failed: ", e);
    return Response.json(
      { error: `handle creem webhook failed: ${e.message}` },
      { status: 500 }
    );
  }
}

// 支持 GET 请求用于验证（某些平台需要）
export async function GET(req: Request) {
  return Response.json({ message: "Creem Webhook endpoint is active" });
}

/**
 * 处理 Creem 支付成功事件（直接在 webhook 中处理，避免 chunk 加载错误）
 */
async function handleCreemPaymentSuccess(data: any) {
  try {
    console.log("🔔 [Creem Webhook] 开始处理支付成功事件");
    
    // 🔥 从 request_id 获取订单号（最高优先级）
    let order_no =
      data.request_id ||
      (data as any).object?.request_id ||
      data.order_no ||
      data.order_id ||
      data.metadata?.order_no ||
      (data as any).object?.metadata?.order_no ||
      "";

    console.log("🔔 [Creem Webhook] 提取的订单号:", order_no || "(未找到)");

    // 如果找不到订单号，尝试通过邮箱和金额匹配
    let order = null;
    if (order_no) {
      order = await findOrderByOrderNo(order_no);
    }

    if (!order && !order_no) {
      // 尝试通过邮箱和金额匹配
      const customerEmail =
        (data as any).object?.order?.customer_email ||
        (data as any).object?.customer?.email ||
        data.customer_email ||
        data.email ||
        "";
      const amount =
        (data as any).object?.order?.amount ||
        data.amount ||
        0;

      if (customerEmail && amount > 0) {
        console.log("🔔 [Creem Webhook] 尝试通过邮箱和金额匹配订单:", { customerEmail, amount });
        const matchedOrder = await findOrderByEmailAndAmount(customerEmail, amount);
        if (matchedOrder && matchedOrder.status === OrderStatus.Created) {
          order = matchedOrder;
          order_no = matchedOrder.order_no;
          console.log("✅ [Creem Webhook] 通过邮箱和金额匹配到订单:", order_no);
        }
      }
    }

    if (!order) {
      console.error("❌ [Creem Webhook] 无法找到订单:", order_no || "未提供订单号");
      return; // 找不到订单，但不返回错误，避免 Creem 重复发送
    }

    // 检查订单状态（防止重复处理）
    if (order.status !== OrderStatus.Created) {
      console.log("⚠️ [Creem Webhook] 订单已处理，跳过:", order_no, order.status);
      return;
    }

    // 更新订单状态
    const paid_at = getIsoTimestr();
    const paid_email =
      (data as any).object?.order?.customer_email ||
      (data as any).object?.customer?.email ||
      data.customer_email ||
      data.email ||
      order.user_email ||
      "";
    const paid_detail = JSON.stringify(data);

    await updateOrderStatus(
      order_no,
      OrderStatus.Paid,
      paid_at,
      paid_email,
      paid_detail
    );
    console.log("✅ [Creem Webhook] 订单状态已更新为 Paid:", order_no);

    // 发放积分
    if (order.user_uuid && order.credits > 0) {
      try {
        await updateCreditForOrder(order as unknown as Order);
        console.log("✅ [Creem Webhook] 积分已发放:", order.credits);
      } catch (e: any) {
        console.error("❌ [Creem Webhook] 发放积分失败:", e);
      }
    }

    // 更新推荐人收益
    if (order.user_uuid) {
      try {
        await updateAffiliateForOrder(order as unknown as Order);
        console.log("✅ [Creem Webhook] 推荐人收益已更新");
      } catch (e: any) {
        console.error("❌ [Creem Webhook] 更新推荐人收益失败:", e);
      }
    }

    // 发送订单确认邮件
    if (paid_email) {
      try {
        await sendOrderConfirmationEmail({
          order: order as unknown as Order,
          customerEmail: paid_email,
        });
        console.log("✅ [Creem Webhook] 订单确认邮件已发送");
      } catch (e: any) {
        console.error("❌ [Creem Webhook] 发送邮件失败:", e);
      }
    }

    console.log("✅ [Creem Webhook] 支付成功事件处理完成:", order_no);
  } catch (e: any) {
    console.error("❌ [Creem Webhook] 处理支付成功事件失败:", e);
    // 不抛出错误，避免 Creem 重复发送 webhook
  }
}




