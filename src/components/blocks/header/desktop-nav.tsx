"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { Header as HeaderType } from "@/types/blocks/header";
import Icon from "@/components/icon";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * 桌面端导航菜单组件
 * 使用 DropdownMenu 替代 NavigationMenu，确保下拉框精确定位在 trigger 正下方
 */
export default function DesktopNav({ header }: { header: HeaderType }) {
  if (!header.nav?.items || header.nav.items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {header.nav.items.map((item, i) => {
        if (item.children && item.children.length > 0) {
          return (
            <DropdownMenu key={i}>
              <DropdownMenuTrigger
                className={cn(
                  "text-muted-foreground",
                  buttonVariants({ variant: "ghost" }),
                  "flex items-center gap-1"
                )}
              >
                {item.icon && (
                  <Icon name={item.icon} className="size-3 shrink-0 mr-1" />
                )}
                <span>{item.title}</span>
                <Icon name="RiArrowDownSLine" className="size-3 ml-1 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 p-3">
                {item.children.map((iitem, ii) => (
                  <Link
                    key={ii}
                    className={cn(
                      "flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    )}
                    href={iitem.url as any}
                    target={iitem.target}
                  >
                    {iitem.icon && (
                      <Icon name={iitem.icon} className="size-5 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-semibold">{iitem.title}</div>
                      <p className="text-sm leading-snug text-muted-foreground">
                        {iitem.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }

        return (
          <Link
            key={i}
            className={cn(
              "text-muted-foreground",
              buttonVariants({ variant: "ghost" })
            )}
            href={item.url as any}
            target={item.target}
          >
            {item.icon && (
              <Icon name={item.icon} className="size-3 shrink-0 mr-1" />
            )}
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}

