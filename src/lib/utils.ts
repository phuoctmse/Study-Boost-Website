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

/**
 * Format a date for Appwrite queries
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateForAppwrite(date: Date): string {
  // Ensure we're working with a new Date object
  const d = new Date(date);
  // Format to ISO string without milliseconds
  return d.toISOString().split('.')[0];
}

/**
 * Format a date for display
 * @param date Date to format
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
} 