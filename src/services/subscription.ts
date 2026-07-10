import { getOrdersByUserUuid } from "@/models/order";
import type { orders } from "@/db/schema";
import type { Pricing } from "@/types/blocks/pricing";

export const PLUS_PRODUCT_IDS = new Set(["plus-monthly", "plus-yearly"]);

export function isPlusProductId(productId: string | null | undefined): boolean {
  if (!productId) return false;
  return PLUS_PRODUCT_IDS.has(productId);
}

export function isSubscriptionInterval(
  interval: string | null | undefined
): boolean {
  return interval === "month" || interval === "year";
}

export function isSubscriptionEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SUBSCRIPTION_ENABLED !== "false";
}

/** Hide Plus items when subscription flag is off (pricing page, homepage, API). */
export function applySubscriptionPricingFilter(
  pricing: Pricing | undefined
): Pricing | undefined {
  if (!pricing?.items || isSubscriptionEnabled()) {
    return pricing;
  }
  return {
    ...pricing,
    items: pricing.items.filter((item) => !isPlusProductId(item.product_id)),
    groups: pricing.groups?.filter((g) => g.name !== "subscription"),
  };
}

type OrderRow = typeof orders.$inferSelect;

function isOrderSubscriptionActive(order: OrderRow, nowSec: number): boolean {
  if (!isPlusProductId(order.product_id)) return false;

  if (order.sub_period_end && order.sub_period_end > nowSec) {
    return true;
  }

  if (order.expired_at && new Date(order.expired_at).getTime() > Date.now()) {
    return true;
  }

  return false;
}

/** Latest active Plus subscription order for a user, if any. */
export async function getActivePlusSubscription(
  user_uuid: string
): Promise<OrderRow | null> {
  const paidOrders = await getOrdersByUserUuid(user_uuid);
  if (!paidOrders?.length) return null;

  const nowSec = Math.floor(Date.now() / 1000);

  for (const order of paidOrders) {
    if (isOrderSubscriptionActive(order, nowSec)) {
      return order;
    }
  }

  return null;
}

export function hasActivePlusSubscription(order: OrderRow | null): boolean {
  if (!order) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return isOrderSubscriptionActive(order, nowSec);
}

export interface ActiveSubscriptionSummary {
  product_id: string;
  product_name?: string | null;
  interval?: string | null;
  sub_period_end?: number | null;
  renewal_label?: string;
  is_active: boolean;
}

export async function getActivePlusSubscriptionSummary(
  user_uuid: string
): Promise<ActiveSubscriptionSummary | null> {
  const order = await getActivePlusSubscription(user_uuid);
  if (!order) return null;

  const renewal_label = order.sub_period_end
    ? new Date(order.sub_period_end * 1000).toISOString().slice(0, 10)
    : order.expired_at
      ? new Date(order.expired_at).toISOString().slice(0, 10)
      : undefined;

  return {
    product_id: order.product_id || "",
    product_name: order.product_name,
    interval: order.interval,
    sub_period_end: order.sub_period_end,
    renewal_label,
    is_active: true,
  };
}

/** Parse Creem subscription fields from webhook payloads. */
export function extractCreemSubscriptionFields(data: any): {
  sub_id: string;
  sub_period_start: number;
  sub_period_end: number;
  customer_email: string;
  last_transaction_id: string;
} {
  const root = data?.object ?? data;
  const subscription =
    root?.subscription && typeof root.subscription === "object"
      ? root.subscription
      : root?.object === "subscription"
        ? root
        : root;

  const sub_id =
    subscription?.id ||
    root?.subscription?.id ||
    (typeof root?.subscription === "string" ? root.subscription : "") ||
    "";

  const periodStartRaw =
    subscription?.current_period_start_date ||
    subscription?.current_period_start ||
    root?.current_period_start_date;
  const periodEndRaw =
    subscription?.current_period_end_date ||
    subscription?.current_period_end ||
    root?.current_period_end_date;

  const sub_period_start = periodStartRaw
    ? Math.floor(new Date(periodStartRaw).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  const sub_period_end = periodEndRaw
    ? Math.floor(new Date(periodEndRaw).getTime() / 1000)
    : sub_period_start + 30 * 24 * 60 * 60;

  const customer_email =
    root?.customer?.email ||
    subscription?.customer?.email ||
    data?.customer_email ||
    data?.email ||
    "";

  const last_transaction_id =
    subscription?.last_transaction_id ||
    root?.order?.id ||
    data?.id ||
    "";

  return {
    sub_id,
    sub_period_start,
    sub_period_end,
    customer_email,
    last_transaction_id,
  };
}

export function orderStatusIsPaid(status: string): boolean {
  return status === "paid";
}
