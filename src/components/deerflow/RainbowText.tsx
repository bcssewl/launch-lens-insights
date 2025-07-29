import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface RainbowTextProps {
  children: React.ReactNode;
  animated?: boolean;
  className?: string;
  duration?: number;
}

export const RainbowText: React.FC<RainbowTextProps> = ({ 
  children, 
  animated = false, 
  className,
  duration = 2
}) => {
  if (!animated) {
    return <span className={cn("text-foreground", className)}>{children}</span>;
  }

  return (
    <motion.span
      className={cn(
        "inline-block bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent",
        "bg-[length:200%_100%]",
        className
      )}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--purple-500)), hsl(var(--primary)))"
      }}
    >
      {children}
    </motion.span>
  );
};