import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 按需缓存刷新 API
 * 
 * 用途：手动强制刷新页面缓存，无需等待 revalidate 时间到期
 * 
 * 使用场景：
 * - 修改了首页文案（en.json）后想立即生效
 * - 发布了新博客文章后想立即显示在列表
 * - 修改了法律页面后想立即更新
 * - 任何需要立即刷新缓存的场景
 * 
 * 使用方法：
 * 浏览器访问或 curl 请求：
 * https://astrocartography.net/api/revalidate?secret=你的密钥&path=/页面路径
 * 
 * 示例：
 * - 刷新首页: ?secret=xxx&path=/
 * - 刷新 About: ?secret=xxx&path=/about
 * - 刷新隐私政策: ?secret=xxx&path=/privacy-policy
 * - 刷新博客文章: ?secret=xxx&path=/posts/article-slug
 * - 刷新指定语言: ?secret=xxx&path=/&locale=zh
 */

export async function POST(request: NextRequest) {
  try {
    // ============================================
    // 1. 安全验证：检查密钥是否正确
    // ============================================
    const secret = request.nextUrl.searchParams.get('secret');
    
    // 从环境变量获取正确的密钥
    const correctSecret = process.env.REVALIDATE_SECRET;
    
    if (!correctSecret) {
      return NextResponse.json(
        { 
          success: false,
          message: '❌ Server configuration error: REVALIDATE_SECRET not set in environment variables.',
        },
        { status: 500 }
      );
    }
    
    if (secret !== correctSecret) {
      return NextResponse.json(
        { 
          success: false,
          message: '❌ Invalid secret token. Access denied.',
        },
        { status: 401 }
      );
    }

    // ============================================
    // 2. 获取参数：要刷新的路径和语言
    // ============================================
    const path = request.nextUrl.searchParams.get('path');
    const locale = request.nextUrl.searchParams.get('locale') || 'en';

    // 检查是否提供了 path 参数
    if (!path) {
      return NextResponse.json(
        { 
          success: false,
          message: '❌ Missing required parameter: "path"',
          usage: {
            description: 'Add ?path=/your-page-path to the URL',
            examples: [
              '?secret=xxx&path=/ (刷新首页)',
              '?secret=xxx&path=/about (刷新 About)',
              '?secret=xxx&path=/privacy-policy (刷新隐私政策)',
              '?secret=xxx&path=/posts/article-slug (刷新特定文章)',
            ],
          },
        },
        { status: 400 }
      );
    }

    // ============================================
    // 3. 执行缓存刷新
    // ============================================
    const revalidatedPaths: string[] = [];

    try {
      // 情况 1：刷新根路径（首页）
      if (path === '/' || path === '') {
        // 刷新根布局（会级联刷新所有子页面）
        revalidatePath('/', 'layout');
        revalidatedPaths.push('/');
        
        // 如果指定了语言，也刷新该语言版本
        if (locale && locale !== 'en') {
          revalidatePath(`/${locale}`, 'page');
          revalidatedPaths.push(`/${locale}`);
        }
      } 
      // 情况 2：刷新其他任意路径
      else {
        // 刷新指定路径
        revalidatePath(path);
        revalidatedPaths.push(path);
        
        // 如果路径不以 /locale 开头，也刷新多语言版本
        if (!path.startsWith(`/${locale}`) && locale !== 'en') {
          const localizedPath = `/${locale}${path}`;
          revalidatePath(localizedPath);
          revalidatedPaths.push(localizedPath);
        }
      }

      // ============================================
      // 4. 返回成功结果
      // ============================================
      return NextResponse.json({
        success: true,
        message: '✅ Cache revalidated successfully!',
        revalidated: revalidatedPaths,
        locale: locale,
        timestamp: new Date().toISOString(),
        tip: 'Visit the page URL to see the updated content.',
      });

    } catch (revalidateError) {
      // 处理刷新过程中的错误
      return NextResponse.json(
        {
          success: false,
          message: '❌ Failed to revalidate cache',
          error: String(revalidateError),
          attemptedPath: path,
        },
        { status: 500 }
      );
    }

  } catch (err) {
    // 处理整体错误
    console.error('❌ Revalidation API error:', err);
    return NextResponse.json(
      { 
        success: false,
        message: '❌ Internal server error',
        error: String(err),
      },
      { status: 500 }
    );
  }
}

/**
 * 同时支持 GET 请求
 * 方便在浏览器地址栏直接访问
 */
export async function GET(request: NextRequest) {
  return POST(request);
}

