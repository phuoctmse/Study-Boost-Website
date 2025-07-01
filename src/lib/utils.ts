import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert any date string or Date object to ISO string format for Appwrite queries
 * @param date Date string or Date object
 * @returns ISO string format
 */
export function toAppwriteDate(date: string | Date): string {
  if (typeof date === 'string') {
    // If the date is already in ISO format, return it
    if (date.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)) {
      return date;
    }
    // Convert string to Date object
    date = new Date(date);
  }
  
  // Ensure we're working with UTC
  return date.toISOString();
} 