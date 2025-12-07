"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Pricing from "@/components/blocks/pricing";
import { Pricing as PricingType } from "@/types/blocks/pricing";
import { useTranslations } from "next-intl";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pricing: PricingType;
  onSuccess?: () => void;
}

/**
 * 价格弹窗组件
 * 复用现有的 Pricing 组件，包装在 Dialog/Drawer 中
 */
export default function PricingModal({
  open,
  onOpenChange,
  pricing,
  onSuccess,
}: PricingModalProps) {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // 桌面端使用 Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-5 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-2xl font-bold">
                {pricing.title || t('payment.modal.title')}
              </DialogTitle>
              {pricing.description && (
                <DialogDescription className="text-base">
                  {pricing.description}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="overflow-y-auto">
              <Pricing pricing={pricing} />
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
  }

  // 移动端使用 Drawer
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t">
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="text-xl font-bold">
            {pricing.title || t('payment.modal.title')}
          </DrawerTitle>
          {pricing.description && (
            <DrawerDescription className="text-sm">
              {pricing.description}
            </DrawerDescription>
          )}
        </DrawerHeader>
        <div className="px-3 pb-3 overflow-y-auto">
          <Pricing pricing={pricing} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

