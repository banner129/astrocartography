import Showcase from "@/components/blocks/showcase";
import { getShowcasePage } from "@/services/page";

// 🔥 CPU 优化：Showcase 页面 24 小时缓存
export const revalidate = 86400;  // 24小时缓存
export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  return [{ locale: 'en' }];
}

export default async function ShowcasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getShowcasePage(locale);

  return <>{page.showcase && <Showcase section={page.showcase} />}</>;
}
