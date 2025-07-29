import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface RainbowTextProps {
  children: React.ReactNode;
  animated?: boolean;
  className?: string;
}

export const RainbowText: React.FC<RainbowTextProps> = ({ 
  children, 
  animated = false, 
  className 
}) => {
  return (
    <motion.div
      className={cn(
        "inline-flex items-center",
        animated && "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_100%]",
        !animated && "text-foreground",
        className
      )}
      animate={animated ? {
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
      } : {}}
      transition={animated ? {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      } : {}}
      style={animated ? {
        backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--purple-500)), hsl(var(--primary)))"
      } : {}}
    >
      {children}
    </motion.div>
  );
};