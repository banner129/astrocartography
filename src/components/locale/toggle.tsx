"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";

import { MdLanguage } from "react-icons/md";
import { localeNames, locales } from "@/i18n/locale";

export default function ({ isIcon = false }: { isIcon?: boolean }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // 获取当前语言，如果没有locale参数则说明是默认语言（英文）
  const locale = (params.locale as string) || "en";

  const handleSwitchLanguage = (value: string) => {
    if (value !== locale) {
      // 获取当前路径（usePathname 返回的路径不包含语言前缀）
      const currentPath = pathname || '/';
      
      // 获取当前浏览器中的实际路径（包含语言前缀）
      const currentActualPath = typeof window !== 'undefined' ? window.location.pathname : '';
      
      // 构建目标 URL
      // 如果目标语言是默认语言（en），且 localePrefix 是 "as-needed"，则不需要前缀
      let targetUrl = '';
      if (value === 'en') {
        // 默认语言：直接使用路径，不需要语言前缀
        targetUrl = currentPath === '/' ? '/' : `${currentPath}`;
      } else {
        // 其他语言：添加语言前缀
        targetUrl = `/${value}${currentPath === '/' ? '' : currentPath}`;
      }
      
      // 如果切换到英文，且当前实际路径包含语言前缀，需要使用 window.location 强制刷新
      // 因为 router.replace('/') 可能不会触发从 /zh/ 到 / 的导航
      if (value === 'en' && currentActualPath && currentActualPath.startsWith(`/${locale}/`)) {
        // 从带有语言前缀的路径切换到根路径，需要强制刷新
        window.location.href = targetUrl;
      } else {
        // 使用 router.replace 来切换语言，避免在历史记录中留下多个条目
        router.replace(targetUrl);
      }
    }
  };

  return (
    <Select 
      value={locale || "en"} 
      onValueChange={handleSwitchLanguage}
    >
      <SelectTrigger className="flex items-center gap-2 border-none text-muted-foreground outline-hidden hover:bg-transparent focus:ring-0 focus:ring-offset-0">
        <MdLanguage className="text-xl" />
        {!isIcon && (
          <span className="hidden md:block">{localeNames[locale]}</span>
        )}
      </SelectTrigger>
      <SelectContent className="z-50 bg-background">
        {Object.keys(localeNames).map((key: string) => {
          const name = localeNames[key];
          return (
            <SelectItem 
              className="cursor-pointer px-4" 
              key={key} 
              value={key}
            >
              {name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
