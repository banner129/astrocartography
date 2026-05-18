import { PostStatus, findPostBySlug } from "@/models/post";

import BlogDetail from "@/components/blocks/blog-detail";
import Empty from "@/components/blocks/empty";
import { Post } from "@/types/post";

// Posts 详情从数据库查询，必须使用 SSR（无法静态生成）
export const dynamic = 'force-dynamic';

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

  // Build hreflang alternates for multi-language SEO
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
  
  return {
    title: post?.title,
    description: post?.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/posts/${slug}`,
        'zh': `${baseUrl}/zh/posts/${slug}`,
        'pt': `${baseUrl}/pt/posts/${slug}`,
        'es': `${baseUrl}/es/posts/${slug}`,
        'it': `${baseUrl}/it/posts/${slug}`,
        'de': `${baseUrl}/de/posts/${slug}`,
        'x-default': `${baseUrl}/posts/${slug}`,
      },
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

  // Generate hreflang links for the head
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
  const hreflangLinks = [
    { lang: 'en', url: `${baseUrl}/posts/${slug}` },
    { lang: 'zh', url: `${baseUrl}/zh/posts/${slug}` },
    { lang: 'pt', url: `${baseUrl}/pt/posts/${slug}` },
    { lang: 'es', url: `${baseUrl}/es/posts/${slug}` },
    { lang: 'it', url: `${baseUrl}/it/posts/${slug}` },
    { lang: 'de', url: `${baseUrl}/de/posts/${slug}` },
    { lang: 'x-default', url: `${baseUrl}/posts/${slug}` },
  ];

  // Generate Article Schema Markup for SEO
  const currentUrl = locale === 'en' 
    ? `${baseUrl}/posts/${slug}` 
    : `${baseUrl}/${locale}/posts/${slug}`;
  
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: `${baseUrl}/imgs/features/astrocartography-lines-calculation.webp`,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Organization',
      name: 'AstroCartography',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AstroCartography',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    inLanguage: locale,
  };

  return (
    <>
      {/* Hreflang tags for multi-language SEO */}
      {hreflangLinks.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Article Schema Markup for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      
      <BlogDetail post={post as unknown as Post} />
    </>
  );
}
