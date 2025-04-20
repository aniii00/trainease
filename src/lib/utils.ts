
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, parse, addMinutes } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Consistent date formatter with proper time zone handling
export function formatDateString(dateTimeStr: string, formatPattern: string): string {
  try {
    if (!dateTimeStr) return "Invalid date";
    
    // Create date object from the original string to preserve timezone
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateTimeStr);
      return "Invalid date";
    }
    
    return format(date, formatPattern);
  } catch (e) {
    console.error("Error formatting date:", e, dateTimeStr);
    return "Date format error";
  }
}

// Format time with consistent time zone handling
export function formatTimeWithTimezone(dateTimeStr: string): string {
  try {
    if (!dateTimeStr) return "Invalid time";
    
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) {
      console.error("Invalid time:", dateTimeStr);
      return "Invalid time";
    }
    
    // Apply consistent time format (12-hour with AM/PM)
    return format(date, 'hh:mm a');
  } catch (e) {
    console.error("Error formatting time:", e, dateTimeStr);
    return "Time format error";
  }
}

// Calculate end time from start time with proper time zone handling
export function calculateEndTime(dateTimeStr: string, durationMinutes: number = 30): string {
  try {
    if (!dateTimeStr) return "";
    
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) {
      console.error("Invalid date for end time calculation:", dateTimeStr);
      return "";
    }
    
    const endDate = addMinutes(date, durationMinutes);
    return format(endDate, 'hh:mm a');
  } catch (e) {
    console.error("Error calculating end time:", e, dateTimeStr);
    return "";
  }
}
