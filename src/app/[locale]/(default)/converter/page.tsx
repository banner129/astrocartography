import { Metadata } from "next";
import ConverterClient from "./converter-client";
import { getConverterPage } from "@/services/page";
import { getCanonicalUrl } from "@/lib/utils";

// 🔥 CPU 优化：Converter 页面 7 天缓存
export const revalidate = 604800;  // 7天缓存（内容很少变化，延长缓存降低 CPU）
export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  return [{ locale: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getConverterPage(locale);

  return {
    title: page.metadata.title,
    description: page.metadata.description,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description,
      type: "website",
      url: getCanonicalUrl(locale, '/converter'),
      siteName: "Wplace Pixel",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: "Wplace Pixel Art Converter - Free Online Tool",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metadata.title,
      description: page.metadata.description,
      images: ["/logo.png"],
    },
    alternates: {
      canonical: getCanonicalUrl(locale, '/converter'),
    },
  };
}

export default async function ConverterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getConverterPage(locale);
  return <ConverterClient page={page} locale={locale} />;
}