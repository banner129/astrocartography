import Blog from "@/components/blocks/blog";
import { BlogItem, Blog as BlogType } from "@/types/blocks/blog";
import { getPostsByLocaleWithFallback } from "@/models/post";
import { getCanonicalUrl } from "@/lib/utils";
import { getTranslations } from "next-intl/server";

// Posts 列表从数据库查询，必须使用 SSR（无法静态生成）
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

  return {
    title: t("blog.title"),
    description: t("blog.description"),
    alternates: {
      canonical: getCanonicalUrl(locale, "/posts"),
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
