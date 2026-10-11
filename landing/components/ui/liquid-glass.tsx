'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export interface LiquidGlassCardProps {
  children?: React.ReactNode;
  className?: string;
  draggable?: boolean;
  expandable?: boolean;
  width?: string | number;
  height?: string | number;
  expandedWidth?: string | number;
  expandedHeight?: string | number;
  blurIntensity?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  borderRadius?: string;
  glowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadowIntensity?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  bgClassName?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className = '',
  draggable = false,
  expandable = false,
  width,
  height,
  expandedWidth,
  expandedHeight,
  blurIntensity = 'xl',
  borderRadius = '32px',
  glowIntensity = 'sm',
  shadowIntensity = 'md',
  bgClassName,
  style = {},
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpansion = (e: React.MouseEvent) => {
    if (!expandable) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest('a, button, input, select, textarea')) return;
    setIsExpanded(!isExpanded);
  };

  const blurClasses: Record<string, string> = {
    sm: 'backdrop-blur-xs',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl',
    '3xl': 'backdrop-blur-3xl',
  };

  const shadowStyles: Record<string, string> = {
    none: 'none',
    xs: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2)',
    sm: 'inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.25)',
    md: 'inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.35)',
    lg: 'inset 0 2px 1.5px 0 rgba(255, 255, 255, 1), inset 0 -1px 1.5px 0 rgba(255, 255, 255, 0.4)',
    xl: 'inset 0 2.5px 2px 0 rgba(255, 255, 255, 1), inset 0 -1.5px 2px 0 rgba(255, 255, 255, 0.45)',
    '2xl':
      'inset 0 3px 2px 0 rgba(255, 255, 255, 1), inset 0 -2px 2px 0 rgba(255, 255, 255, 0.5)',
  };

  const glowStyles: Record<string, string> = {
    none: 'none',
    xs: '0 4px 16px -2px rgba(255, 79, 43, 0.06)',
    sm: '0 8px 24px -4px rgba(0, 0, 0, 0.05), 0 2px 8px -2px rgba(255, 79, 43, 0.08)',
    md: '0 12px 32px -4px rgba(0, 0, 0, 0.06), 0 4px 16px -4px rgba(255, 79, 43, 0.12)',
    lg: '0 20px 48px -10px rgba(255, 79, 43, 0.16), 0 8px 24px -4px rgba(0, 0, 0, 0.06)',
    xl: '0 24px 60px -12px rgba(255, 79, 43, 0.2), 0 12px 32px -4px rgba(0, 0, 0, 0.08)',
    '2xl':
      '0 32px 72px -16px rgba(255, 79, 43, 0.25), 0 16px 40px -6px rgba(0, 0, 0, 0.1)',
  };

  const containerVariants = expandable
    ? {
        collapsed: {
          width: width || 'auto',
          height: height || 'auto',
          transition: {
            duration: 0.4,
            ease: [0.5, 1.5, 0.5, 1] as any,
          },
        },
        expanded: {
          width: expandedWidth || 'auto',
          height: expandedHeight || 'auto',
          transition: {
            duration: 0.4,
            ease: [0.5, 1.5, 0.5, 1] as any,
          },
        },
      }
    : undefined;

  const MotionComponent = (draggable || expandable ? motion.div : 'div') as any;

  const motionProps =
    draggable || expandable
      ? {
          variants: expandable ? containerVariants : undefined,
          animate: expandable
            ? isExpanded
              ? 'expanded'
              : 'collapsed'
            : undefined,
          onClick: expandable ? handleToggleExpansion : undefined,
          drag: draggable,
          dragConstraints: draggable
            ? { left: 0, right: 0, top: 0, bottom: 0 }
            : undefined,
          dragElastic: draggable ? 0.3 : undefined,
          dragTransition: draggable
            ? {
                bounceStiffness: 300,
                bounceDamping: 10,
                power: 0.3,
              }
            : undefined,
          whileDrag: draggable ? { scale: 1.02 } : undefined,
          whileHover: draggable ? { scale: 1.01 } : undefined,
          whileTap: draggable ? { scale: 0.98 } : undefined,
        }
      : {};

  return (
    <>
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter
            id="glass-blur"
            x="0"
            y="0"
            width="100%"
            height="100%"
            filterUnits="objectBoundingBox"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.003 0.007"
              numOctaves="1"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <MotionComponent
        className={cn(
          `relative ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${
            expandable ? 'cursor-pointer' : ''
          }`,
          className
        )}
        style={{
          borderRadius,
          ...(width && !expandable && { width }),
          ...(height && !expandable && { height }),
          ...style,
        }}
        {...motionProps}
        {...props}
      >
        {/* Capa de Cristal Líquido Real: Alta refracción y saturación sin opacidad sucia */}
        <div
          className={cn(
            `absolute inset-0 ${blurClasses[blurIntensity] || 'backdrop-blur-2xl'} z-0`,
            bgClassName || 'bg-gradient-to-br from-white/70 via-white/40 to-white/60 dark:from-slate-900/70 dark:via-slate-900/40 dark:to-slate-900/60'
          )}
          style={{
            borderRadius,
            backdropFilter: 'blur(28px) saturate(190%) contrast(105%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%) contrast(105%)',
          }}
        />

        {/* Reflejo de luz cenital (Specular Sheen) propio del cristal físico Apple */}
        <div
          className="absolute inset-0 z-10 pointer-events-none rounded-[inherit]"
          style={{
            borderRadius,
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.06) 35%, transparent 100%)',
          }}
        />

        {/* Resplandor y halo exterior sutil */}
        <div
          className="absolute inset-0 z-10 pointer-events-none rounded-[inherit]"
          style={{
            borderRadius,
            boxShadow: glowStyles[glowIntensity] || glowStyles.sm,
          }}
        />

        {/* Borde biselado especular de luz */}
        <div
          className="absolute inset-0 z-20 pointer-events-none rounded-[inherit]"
          style={{
            borderRadius,
            boxShadow: shadowStyles[shadowIntensity] || shadowStyles.md,
          }}
        />

        <div className="relative z-30 w-full h-full">
          {children}
        </div>
      </MotionComponent>
    </>
  );
};

export default LiquidGlassCard;
