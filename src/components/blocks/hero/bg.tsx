/**
 * Hero 背景图片 - 使用 hero-web.webp
 */
export default function Bg() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-50 overflow-hidden">
      {/* 背景图片 - 延迟加载优化 CPU */}
      <img
        src="/imgs/features/hero-web.webp"
        alt="Astrocartography Calculator Background"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      
      {/* 遮罩层：降低背景透明度，提升文字可读性 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75" />
    </div>
  );
}