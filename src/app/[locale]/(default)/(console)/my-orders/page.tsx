import { getOrdersByPaidEmail, getOrdersByUserUuid, getAllOrdersByUserUuid, getAllOrdersByUserEmail } from "@/models/order";
import { getUserEmail, getUserUuid } from "@/services/user";

import { TableColumn } from "@/types/blocks/table";
import TableSlot from "@/components/console/slots/table";
import { Table as TableSlotType } from "@/types/slots/table";
import { getTranslations } from "next-intl/server";
import moment from "moment";
import { redirect } from "next/navigation";

export default async function () {
  const t = await getTranslations();

  const user_uuid = await getUserUuid();
  const user_email = await getUserEmail();

  const callbackUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/my-orders`;
  if (!user_uuid) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  // 🔥 临时调试：先获取所有订单（包括未支付的），看看订单是否存在
  let allOrders = await getAllOrdersByUserUuid(user_uuid);
  console.log("🔔 [My Orders] 用户所有订单（调试）:", {
    user_uuid,
    user_email,
    total_orders: allOrders?.length || 0,
    orders: allOrders?.map(o => ({
      order_no: o.order_no,
      status: o.status,
      amount: o.amount,
      user_uuid: o.user_uuid,
      user_email: o.user_email,
      paid_email: o.paid_email,
      created_at: o.created_at,
      paid_at: o.paid_at,
    })) || [],
  });

  // 🔥 临时：也通过邮箱查找所有订单（包括未支付的）
  let allOrdersByEmail = await getAllOrdersByUserEmail(user_email);
  console.log("🔔 [My Orders] 通过用户邮箱查找的所有订单（调试）:", {
    user_email,
    total_orders: allOrdersByEmail?.length || 0,
    orders: allOrdersByEmail?.map(o => ({
      order_no: o.order_no,
      status: o.status,
      amount: o.amount,
      user_uuid: o.user_uuid,
      user_email: o.user_email,
      paid_email: o.paid_email,
      created_at: o.created_at,
      paid_at: o.paid_at,
    })) || [],
  });

  // 只显示已支付的订单
  let orders = await getOrdersByUserUuid(user_uuid);
  if (!orders || orders.length === 0) {
    orders = await getOrdersByPaidEmail(user_email);
  }
  
  console.log("🔔 [My Orders] 已支付订单:", {
    paid_orders_count: orders?.length || 0,
  });

  const columns: TableColumn[] = [
    { name: "order_no", title: t("my_orders.table.order_no") },
    { name: "paid_email", title: t("my_orders.table.email") },
    { name: "product_name", title: t("my_orders.table.product_name") },
    {
      name: "amount",
      title: t("my_orders.table.amount"),
      callback: (item: any) =>
        `${item.currency.toUpperCase() === "CNY" ? "¥" : "$"} ${
          item.amount / 100
        }`,
    },
    {
      name: "paid_at",
      title: t("my_orders.table.paid_at"),
      callback: (item: any) =>
        moment(item.paid_at).format("YYYY-MM-DD HH:mm:ss"),
    },
  ];

  const table: TableSlotType = {
    title: t("my_orders.title"),
    // TODO: 暂时隐藏 Read Docs 按钮
    /* toolbar: {
      items: [
        {
          title: t("my_orders.read_docs"),
          icon: "RiBookLine",
          url: "https://docs.shipany.ai",
          target: "_blank",
          variant: "default",
        },
      ],
    }, */
    columns: columns,
    data: orders,
    empty_message: t("my_orders.no_orders"),
  };

  return <TableSlot {...table} />;
}
