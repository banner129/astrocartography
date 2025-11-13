import { PostStatus, findPostBySlug } from "@/models/post";

import BlogDetail from "@/components/blocks/blog-detail";
import Empty from "@/components/blocks/empty";
import { Post } from "@/types/post";

// 🔥 CPU 优化：文章详情 7 天缓存（发布后很少修改）
export const revalidate = 604800;  // 7天缓存
export const dynamic = 'force-static';
export const dynamicParams = true;

// 按需生成（访问时才生成，减少构建时间）
export async function generateStaticParams() {
  return [];  // 空数组表示按需生成
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const post = await findPostBySlug(slug, locale);

  let canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/posts/${slug}`;

  if (locale !== "en") {
    canonicalUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${locale}/posts/${slug}`;
  }

  return {
    title: post?.title,
    description: post?.description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function ({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await findPostBySlug(slug, locale);

  if (!post || post.status !== PostStatus.Online) {
    return <Empty message="Post not found" />;
  }

  return <BlogDetail post={post as unknown as Post} />;
}
