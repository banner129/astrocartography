import { NextResponse } from 'next/server';

/**
 * 调试环境变量 API
 * GET /api/debug-env
 * 用于检查环境变量是否正确加载
 */
export async function GET() {
  // 检查关键环境变量
  const envVars = {
    // 基础配置
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL || 'NOT_SET',
    NEXT_PUBLIC_PROJECT_NAME: process.env.NEXT_PUBLIC_PROJECT_NAME || 'NOT_SET',
    
    // 认证配置
    NEXT_PUBLIC_AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED || 'NOT_SET',
    NEXT_PUBLIC_AUTH_GOOGLE_ID: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID || 'NOT_SET',
    NEXT_PUBLIC_AUTH_GOOGLE_ENABLED: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED || 'NOT_SET',
    
    // 分析工具
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || 'NOT_SET',
    NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'NOT_SET',
    
    // 其他
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'NOT_SET',
    NEXT_PUBLIC_DEFAULT_THEME: process.env.NEXT_PUBLIC_DEFAULT_THEME || 'NOT_SET',
    
    // 环境信息
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
    CF_PAGES: process.env.CF_PAGES || 'NOT_SET',
    CF_WORKERS: process.env.CF_WORKERS || 'NOT_SET',
  };

  return NextResponse.json({
    success: true,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    variables: envVars,
    note: '如果看到 NOT_SET，说明环境变量未正确加载',
  });
}
