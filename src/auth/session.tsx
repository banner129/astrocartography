"use client";

import { SessionProvider } from "next-auth/react";
import { isAuthEnabled } from "@/lib/auth";

export function NextAuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAuthEnabled()) {
    return <>{children}</>;
  }

  return (
    <SessionProvider
      refetchInterval={0} // 禁用自动刷新，避免频繁请求
      refetchOnWindowFocus={true} // 窗口聚焦时刷新
    >
      {children}
    </SessionProvider>
  );
}
