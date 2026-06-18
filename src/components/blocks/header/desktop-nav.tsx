"use client";

import { useState, useEffect } from "react";
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
 * 🔥 SSR 优化：延迟挂载 DropdownMenu，避免 hydration 错误
 * Cloudflare Workers 兼容：不依赖 Node.js 特定 API
 */
export default function DesktopNav({ header }: { header: HeaderType }) {
  const [isMounted, setIsMounted] = useState(false);

  // 🔥 关键优化：等待客户端挂载后再渲染交互式组件
  // 这样 SSR 时只渲染静态链接，客户端 hydration 后再启用下拉菜单
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!header.nav?.items || header.nav.items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-0 whitespace-nowrap">
      {header.nav.items.map((item, i) => {
        if (item.children && item.children.length > 0) {
          const isLinesMenu = item.url === "/astrocartography-lines";

          // 🔥 SSR 时渲染静态按钮，客户端挂载后渲染完整的 DropdownMenu
          if (!isMounted) {
            return (
              <button
                key={i}
                className={cn(
                  "text-muted-foreground",
                  buttonVariants({ variant: "ghost" }),
                  "flex items-center gap-1"
                )}
                disabled
              >
                {item.icon && (
                  <Icon name={item.icon} className="size-3 shrink-0 mr-1" />
                )}
                <span>{item.title}</span>
                <Icon name="RiArrowDownSLine" className="size-3 ml-1 opacity-60" />
              </button>
            );
          }

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
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className={cn(
                  "p-3",
                  isLinesMenu
                    ? "grid w-[32rem] grid-cols-2 gap-2 rounded-xl border-border/60 bg-popover/95 p-2 shadow-2xl backdrop-blur-xl"
                    : "w-80"
                )}
              >
                {item.children.map((iitem, ii) => {
                  const isViewAll =
                    isLinesMenu && iitem.url === item.url;

                  return (
                    <Link
                      key={ii}
                      className={cn(
                        "flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        isLinesMenu &&
                          !isViewAll &&
                          "group min-h-[5.25rem] gap-3 rounded-lg border border-transparent hover:border-border/60 hover:bg-accent/60",
                        isViewAll &&
                          "col-span-2 mt-1 items-center rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-primary hover:border-primary/30 hover:bg-primary/10 focus:bg-primary/10"
                      )}
                      href={iitem.url as any}
                      target={iitem.target}
                    >
                      {iitem.icon && (
                        <span
                          className={cn(
                            "flex shrink-0 items-center justify-center",
                            isLinesMenu &&
                              !isViewAll &&
                              "size-9 rounded-lg bg-foreground/5 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary",
                            isViewAll && "size-8 rounded-full bg-primary/10"
                          )}
                        >
                          <Icon
                            name={iitem.icon}
                            className={cn(
                              "size-5 shrink-0",
                              isViewAll && "size-4"
                            )}
                          />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div
                          className={cn(
                            "text-sm font-semibold",
                            isViewAll && "text-primary"
                          )}
                        >
                          {iitem.title}
                        </div>
                        <p
                          className={cn(
                            "mt-1 text-sm leading-snug text-muted-foreground",
                            isViewAll && "text-xs"
                          )}
                        >
                          {iitem.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
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
