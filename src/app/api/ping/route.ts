import { respData, respErr } from "@/lib/resp";
import { getUserUuid } from "@/services/user";

/**
 * Ping API - 测试接口
 * 用于测试 API 连通性，不消耗积分
 */
export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return respErr("invalid params");
    }

    const user_uuid = await getUserUuid();
    if (!user_uuid) {
      return respErr("no auth");
    }

    // 测试接口不消耗积分
    return respData({
      pong: `received message: ${message}`,
    });
  } catch (e) {
    console.log("test failed:", e);
    return respErr("test failed");
  }
}
