/**
 * @file SkeletonLoader.tsx
 * @description Enhanced skeleton loading with shimmer effects and wave animations
 */

import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 6,
  className,
  variant = 'card',
  width,
  height
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'h-40 w-40 rounded-lg';
      case 'text':
        return 'h-4 w-full rounded';
      case 'circle':
        return 'h-12 w-12 rounded-full';
      case 'rectangular':
        return 'h-24 w-full rounded-md';
      default:
        return 'h-40 w-40 rounded-lg';
    }
  };

  const skeletonStyle = {
    width: width,
    height: height,
  };

  return (
    <div className="flex flex-wrap gap-4">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "relative overflow-hidden bg-gradient-to-br from-muted to-muted/60",
            getVariantClasses(),
            className
          )}
          style={skeletonStyle}
          initial={shouldReduceMotion ? { opacity: 0.5 } : { opacity: 0, scale: 0.9 }}
          animate={shouldReduceMotion ? { opacity: [0.5, 0.8, 0.5] } : { 
            opacity: [0.7, 1, 0.7], 
            scale: 1 
          }}
          transition={shouldReduceMotion ? {
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1
          } : {
            duration: 0.4,
            delay: i * 0.1,
            ease: "easeOut",
            opacity: {
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.2
            }
          }}
        >
          {/* Shimmer Effect */}
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15
              }}
            />
          )}
          
          {/* Content placeholders for card variant */}
          {variant === 'card' && (
            <div className="p-4 space-y-3">
              <motion.div
                className="h-3 bg-muted-foreground/20 rounded w-3/4"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.1 + 0.2
                }}
              />
              <motion.div
                className="h-2 bg-muted-foreground/15 rounded w-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.1 + 0.4
                }}
              />
              <motion.div
                className="h-2 bg-muted-foreground/15 rounded w-5/6"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  delay: i * 0.1 + 0.6
                }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Specialized skeleton for search results
interface SearchSkeletonProps {
  count?: number;
}

export const SearchSkeleton: React.FC<SearchSkeletonProps> = ({ count = 4 }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30"
          initial={shouldReduceMotion ? { opacity: 0.5 } : { opacity: 0, x: -20 }}
          animate={shouldReduceMotion ? { opacity: [0.5, 0.8, 0.5] } : { 
            opacity: 1, 
            x: 0 
          }}
          transition={shouldReduceMotion ? {
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1
          } : {
            duration: 0.3,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        >
          {/* Favicon skeleton */}
          <motion.div
            className="w-4 h-4 bg-muted rounded-sm relative overflow-hidden"
            animate={shouldReduceMotion ? {} : { opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.1 + 0.1
            }}
          >
            {!shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            )}
          </motion.div>
          
          {/* Text content skeleton */}
          <div className="flex-1 space-y-2">
            <motion.div
              className="h-3 bg-muted rounded w-3/4 relative overflow-hidden"
              animate={shouldReduceMotion ? {} : { opacity: [0.5, 0.9, 0.5] }}
              transition={{
                duration: 1.3,
                repeat: Infinity,
                delay: i * 0.1 + 0.2
              }}
            >
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: i * 0.25 + 0.1
                  }}
                />
              )}
            </motion.div>
            
            <motion.div
              className="h-2 bg-muted/70 rounded w-1/2 relative overflow-hidden"
              animate={shouldReduceMotion ? {} : { opacity: [0.3, 0.7, 0.3] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                delay: i * 0.1 + 0.4
              }}
            >
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: i * 0.3 + 0.2
                  }}
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Skeleton for tool call results
interface ToolCallSkeletonProps {
  type?: 'search' | 'crawl' | 'python';
}

export const ToolCallSkeleton: React.FC<ToolCallSkeletonProps> = ({ type = 'search' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="space-y-4 p-4 rounded-lg bg-muted/20 border border-border/50"
      initial={shouldReduceMotion ? { opacity: 0.5 } : { opacity: 0, scale: 0.98 }}
      animate={shouldReduceMotion ? { opacity: [0.5, 0.8, 0.5] } : { 
        opacity: 1, 
        scale: 1 
      }}
      transition={shouldReduceMotion ? {
        duration: 1.5,
        repeat: Infinity
      } : {
        duration: 0.3,
        ease: "easeOut"
      }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3">
        <motion.div
          className="w-5 h-5 bg-primary/30 rounded relative overflow-hidden"
          animate={shouldReduceMotion ? {} : { 
            rotate: [0, 360],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            opacity: { duration: 1.5, repeat: Infinity }
          }}
        />
        
        <motion.div
          className="h-4 bg-muted rounded w-32 relative overflow-hidden"
          animate={shouldReduceMotion ? {} : { opacity: [0.4, 0.8, 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: 0.1
          }}
        >
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                delay: 0.2
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Content based on type */}
      {type === 'search' && <SearchSkeleton count={3} />}
      
      {type === 'crawl' && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="h-3 bg-muted rounded relative overflow-hidden"
              style={{ width: `${60 + Math.random() * 30}%` }}
              animate={shouldReduceMotion ? {} : { opacity: [0.3, 0.7, 0.3] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.1 + 0.3
              }}
            >
              {!shouldReduceMotion && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: i * 0.2 + 0.4
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
      
      {type === 'python' && (
        <motion.div
          className="bg-muted/50 rounded p-3 relative overflow-hidden"
          animate={shouldReduceMotion ? {} : { opacity: [0.4, 0.8, 0.4] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: 0.2
          }}
        >
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="h-2 bg-muted-foreground/20 rounded"
                style={{ width: `${70 + Math.random() * 25}%` }}
                animate={shouldReduceMotion ? {} : { opacity: [0.2, 0.5, 0.2] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: i * 0.15 + 0.5
                }}
              />
            ))}
          </div>
          
          {!shouldReduceMotion && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.8
              }}
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
};