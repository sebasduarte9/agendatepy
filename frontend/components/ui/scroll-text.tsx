'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TextAnimationProps {
  text: string;
  as?: React.ElementType;
  classname?: string;
  className?: string;
  variants?: Variants;
  letterAnime?: boolean;
  lineAnime?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}

export default function TextAnimation({
  text,
  as: Component = 'div',
  classname = '',
  className = '',
  variants,
  letterAnime = false,
  lineAnime = false,
  direction = 'up',
  delay = 0,
  duration = 0.5,
}: TextAnimationProps) {
  const getDirectionOffset = () => {
    switch (direction) {
      case 'down':
        return { y: -25, x: 0 };
      case 'left':
        return { x: 25, y: 0 };
      case 'right':
        return { x: -25, y: 0 };
      case 'up':
      default:
        return { y: 25, x: 0 };
    }
  };

  const defaultContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: letterAnime ? 0.025 : lineAnime ? 0.15 : 0.06,
        delayChildren: delay,
      },
    },
  };

  const offset = getDirectionOffset();
  const defaultItemVariants: Variants = {
    hidden: {
      opacity: 0,
      filter: 'blur(8px)',
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const itemVariants = variants || defaultItemVariants;
  const mergedClasses = cn('inline-block leading-tight', classname, className);

  // Modo animar letra por letra
  if (letterAnime) {
    const letters = text.split('');
    return (
      <Component className={mergedClasses}>
        <motion.span
          className="inline-block"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={defaultContainerVariants}
        >
          {letters.map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              className="inline-block"
              variants={itemVariants}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.span>
      </Component>
    );
  }

  // Modo animar línea por línea
  if (lineAnime) {
    const lines = text.split('\n');
    return (
      <Component className={mergedClasses}>
        <motion.span
          className="inline-flex flex-col"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={defaultContainerVariants}
        >
          {lines.map((line, index) => (
            <motion.span
              key={`${line}-${index}`}
              className="inline-block"
              variants={itemVariants}
            >
              {line}
            </motion.span>
          ))}
        </motion.span>
      </Component>
    );
  }

  // Modo estándar palabra por palabra
  const words = text.split(' ');
  return (
    <Component className={mergedClasses}>
      <motion.span
        className="inline-block"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={defaultContainerVariants}
      >
        {words.map((word, index) => (
          <span key={`${word}-${index}`} className="inline-block whitespace-nowrap">
            <motion.span className="inline-block" variants={itemVariants}>
              {word}
            </motion.span>
            {index < words.length - 1 && '\u00A0'}
          </span>
        ))}
      </motion.span>
    </Component>
  );
}
