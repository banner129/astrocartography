import { handleCreemOrder } from "@/services/order";
import { findOrderByOrderNo } from "@/models/order";
import { OrderStatus } from "@/models/order";
import { redirect } from "@/i18n/navigation";

/**
 * Creem 支付成功页面
 * 当用户从 Creem 支付成功后跳转回来时，作为 webhook 的兜底处理
 * 主要逻辑由 webhook 处理，此页面确保即使 webhook 延迟也能正确处理订单
 * 
 * 根据 Creem 文档：支付成功后会重定向到 success_url，并带有查询参数：
 * - request_id: 创建 checkout 时传递的 referenceId（对应我们的 order_no）
 * - checkout_id, order_id, customer_id 等
 */
export default async function ({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; order_no?: string }>;
  searchParams: Promise<{ request_id?: string; checkout_id?: string; order_id?: string; [key: string]: string | undefined }>;
}) {
  let redirectLocale = "en";

  try {
    const { locale, order_no: orderNoFromPath } = await params;
    const urlSearchParams = await searchParams;
    
    if (locale) {
      redirectLocale = locale;
    }

    // 🔥 优先从查询参数 request_id 获取订单号（Creem API 方式）
    // 如果没有，则从路径参数获取（产品 ID 直接链接方式）
    const order_no = urlSearchParams.request_id || orderNoFromPath;

    if (!order_no) {
      console.error("❌ [Creem Pay Success] 无法获取订单号", {
        request_id: urlSearchParams.request_id,
        order_no_from_path: orderNoFromPath,
        all_search_params: urlSearchParams,
      });
      throw new Error("order_no is required");
    }

    console.log("🔔 [Creem Pay Success] 获取到订单号:", {
      order_no,
      source: urlSearchParams.request_id ? "request_id (API方式)" : "path (产品ID方式)",
      all_params: urlSearchParams,
    });

    // 查询订单
    const order = await findOrderByOrderNo(order_no);
    if (!order) {
      console.error("Order not found:", order_no);
      throw new Error("Order not found");
    }

    // 如果订单已经处理过，直接跳转到订单页面（防止重复处理）
    if (order.status !== OrderStatus.Created) {
      console.log("Order already processed:", order_no, order.status);
      redirect({
        href: "/my-orders",
        locale: redirectLocale,
      });
      return;
    }

    // 构造 Creem 支付数据（作为 webhook 的兜底处理）
    // 这里假设支付已成功（因为用户被重定向到成功页面）
    const creemPaymentData = {
      order_no: order_no,
      status: "paid",
      payment_status: "paid",
      customer_email: order.user_email || "",
      email: order.user_email || "",
      metadata: {
        order_no: order_no,
        user_email: order.user_email || "",
        user_uuid: order.user_uuid || "",
        credits: order.credits?.toString() || "0",
      },
      amount: order.amount,
      currency: order.currency || undefined,
    };

    // 调用处理函数（会检查订单状态，防止重复处理）
    await handleCreemOrder(creemPaymentData);
  } catch (e: any) {
    console.error("Handle Creem payment success failed:", e);
    // 即使处理失败，也跳转到订单页面，让用户查看订单状态
    redirect({
      href: "/my-orders",
      locale: redirectLocale,
    });
    return;
  }

  // 处理成功，跳转到订单页面
  redirect({
    href: "/my-orders",
    locale: redirectLocale,
  });
}

