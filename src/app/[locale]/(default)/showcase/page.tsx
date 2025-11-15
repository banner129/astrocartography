import Showcase from "@/components/blocks/showcase";
import { getShowcasePage } from "@/services/page";

// 🔥 CPU 优化：Showcase 页面 7 天缓存
export const revalidate = 604800;  // 7天缓存（内容很少变化，延长缓存降低 CPU）
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
