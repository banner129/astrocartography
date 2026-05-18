"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Section as SectionType } from "@/types/blocks/section";
import Icon from "@/components/icon";
import { ArrowRight, MapPin, Compass, Star, Target } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// 图标映射：将 Ri 图标名称映射到 lucide-react 图标
const iconMap: Record<string, any> = {
  RiMapPinLine: MapPin,
  RiCompassLine: Compass,
  RiStarLine: Star,
  RiTargetLine: Target,
};

interface FeatureCardProps {
  icon: string | undefined;
  title: string | undefined;
  description: string | undefined;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
  // 尝试使用 lucide-react 图标
  const LucideIcon = icon ? iconMap[icon] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
        delay: index * 0.1,
      }}
      className={cn(
        "group relative rounded-2xl border bg-card p-8 text-card-foreground transition-all duration-300",
        "hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
      )}
    >
      <div className="flex items-start gap-6">
        {/* Icon/Image on the left */}
        {icon && (
          <div className="flex-shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              {LucideIcon ? (
                <LucideIcon className="h-8 w-8 text-primary" />
              ) : (
                <Icon name={icon} className="h-8 w-8 text-primary" />
              )}
            </div>
          </div>
        )}

        {/* Content on the right */}
        <div className="flex-1 space-y-3">
          {title && (
            <h3 className="text-xl font-semibold leading-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
          
          {/* Arrow icon - appears on hover */}
          <div className="flex items-center text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function FeatureGrid({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, {
    once: true,
    margin: "-50px",
    amount: 0.3,
  });

  const featuresData = section.items || [];
  const cta = section.cta;

  return (
    <section id={section.name} className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="relative z-10 mx-auto max-w-4xl space-y-4 pb-12 text-center"
        >
          {section.label && (
            <Badge variant="outline" className="mb-2">
              {section.label}
            </Badge>
          )}
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            {section.title}
          </h2>
          {section.description && (
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
              {section.description}
            </p>
          )}
        </motion.div>

        {/* Features Grid - 2x2 layout */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* CTA Button */}
        {cta && cta.button && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            {cta.title && (
              <h3 className="mb-2 text-xl font-semibold">
                {cta.title}
              </h3>
            )}
            {cta.description && (
              <p className="mb-6 text-muted-foreground">
                {cta.description}
              </p>
            )}
            <Button
              asChild
              variant={cta.button.variant as any || "default"}
              size="lg"
              className="group"
            >
              <Link href={cta.button.url || "#"}>
                {cta.button.icon && (
                  <Icon name={cta.button.icon} className="mr-2 h-5 w-5" />
                )}
                {cta.button.title}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
