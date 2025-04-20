
import { format, parseISO, addMinutes } from 'date-fns';

/**
 * Format a datetime string to IST display format
 * This function assumes the input is already in IST
 */
export function formatDateTimeIST(dateTimeStr: string) {
  try {
    console.log("formatDateTimeIST - Original:", dateTimeStr);
    
    // Parse the datetime string that's already in IST
    const date = parseISO(dateTimeStr);
    console.log("formatDateTimeIST - Parsed date:", date);
    
    // Format the date - no timezone conversion needed since input is IST
    const formatted = format(date, 'EEE, dd MMM yyyy hh:mm a');
    console.log("formatDateTimeIST - Formatted:", formatted);
    
    return formatted;
  } catch (error) {
    console.error('Error formatting IST datetime:', error);
    return dateTimeStr;
  }
}

/**
 * Format a datetime string to IST time range display format
 * This function assumes the input is already in IST and uses a default 30-minute slot
 */
export function formatTimeRangeIST(dateTimeStr: string, durationMinutes: number = 30) {
  try {
    console.log("formatTimeRangeIST - Original:", dateTimeStr);
    
    // Parse the datetime string that's already in IST
    const startDate = parseISO(dateTimeStr);
    const endDate = addMinutes(startDate, durationMinutes);
    
    // Format start and end times
    const startTime = format(startDate, 'hh:mm a');
    const endTime = format(endDate, 'hh:mm a');
    
    const formattedTimeRange = `${startTime} - ${endTime}`;
    console.log("formatTimeRangeIST - Formatted:", formattedTimeRange);
    
    return formattedTimeRange;
  } catch (error) {
    console.error('Error formatting IST time range:', error);
    return dateTimeStr;
  }
}

/**
 * Format time (hour and minute) for IST display
 */
export function formatTimeIST(timeStr: string) {
  try {
    // Create a full datetime string for today with the given time
    const today = new Date().toISOString().split('T')[0];
    const dateTimeStr = `${today}T${timeStr}`;
    const date = parseISO(dateTimeStr);
    // For time-only strings, we don't need timezone conversion
    return format(date, 'hh:mm a');
  } catch (error) {
    console.error('Error formatting IST time:', error);
    return timeStr;
  }
}

/**
 * Creates a date string in ISO format that's explicitly in IST timezone
 * for storing in the database
 */
export function createISTDateTimeForDB(dateStr: string, timeStr: string): string {
  // Simply combine date and time as they are already in IST
  return `${dateStr} ${timeStr}`;
}
