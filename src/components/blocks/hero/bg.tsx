/**
 * Hero 背景图片 - 使用 hero-web.webp（next/image 优化 + 优先加载以利 LCP）
 */
import Image from "next/image";

export default function Bg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-50 overflow-hidden">
      <Image
        src="/imgs/features/hero-web.webp"
        alt="Astrocartography Calculator Background"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />

      {/* 遮罩层：降低背景透明度，提升文字可读性 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />
    </div>
  );
}
