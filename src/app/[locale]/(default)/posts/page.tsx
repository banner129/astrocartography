import Blog from "@/components/blocks/blog";
import { BlogItem, Blog as BlogType } from "@/types/blocks/blog";
import { getPostsByLocaleWithFallback } from "@/models/post";
import { getTranslations } from "next-intl/server";

// 🔥 CPU 优化：Posts 列表 1 小时缓存（可能有新文章）
export const revalidate = 3600;  // 1小时缓存
export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  return [{ locale: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/posts`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/posts`;
  }

  return {
    title: t("blog.title"),
    description: t("blog.description"),
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function PostsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  const posts = await getPostsByLocaleWithFallback(locale);

  const blog: BlogType = {
    title: t("blog.title"),
    description: t("blog.description"),
    items: posts as unknown as BlogItem[],
    read_more_text: t("blog.read_more_text"),
    tools_notice: {
      text: t("blog.tools_notice.text"),
      link_text: t("blog.tools_notice.link_text"),
      suffix: t("blog.tools_notice.suffix"),
    },
  };

  return <Blog blog={blog} />;
}
