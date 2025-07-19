/**
 * @file formatTimestamp.ts
 * @description Utility function to format Date objects into a user-friendly string.
 */

export const formatTimestamp = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid date';
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};
