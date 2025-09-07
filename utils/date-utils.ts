// utils/date-utils.ts
// Utility functions for proper date handling without timezone issues

/**
 * Safely parses a date string in YYYY-MM-DD format without timezone conversion
 * This prevents the common issue where dates shift by one day due to UTC/local timezone differences
 */
export function parseScheduledDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  // If it's already a full ISO string with time, use it as-is
  if (dateString.includes('T') || dateString.includes(' ')) {
    return new Date(dateString);
  }
  
  // For date-only strings (YYYY-MM-DD), parse in local timezone
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Formats a scheduled date string to Bulgarian locale without timezone issues
 */
export function formatScheduledDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = parseScheduledDate(dateString);
  
  // If specific options are provided, use toLocaleDateString
  if (options) {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric', 
      day: 'numeric'
    };
    return date.toLocaleDateString('bg-BG', { ...defaultOptions, ...options });
  }
  
  // For basic formatting, use manual formatting to avoid timezone issues
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
}

/**
 * Formats a scheduled date string to show weekday and date
 */
export function formatScheduledDateWithWeekday(dateString: string): string {
  return formatScheduledDate(dateString, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Checks if a scheduled date is today (in local timezone)
 */
export function isScheduledDateToday(dateString: string): boolean {
  const scheduledDate = parseScheduledDate(dateString);
  const today = new Date();
  
  return scheduledDate.getDate() === today.getDate() &&
         scheduledDate.getMonth() === today.getMonth() &&
         scheduledDate.getFullYear() === today.getFullYear();
}

/**
 * Checks if a scheduled date is tomorrow (in local timezone)  
 */
export function isScheduledDateTomorrow(dateString: string): boolean {
  const scheduledDate = parseScheduledDate(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return scheduledDate.getDate() === tomorrow.getDate() &&
         scheduledDate.getMonth() === tomorrow.getMonth() &&
         scheduledDate.getFullYear() === tomorrow.getFullYear();
}

/**
 * Gets today's date in YYYY-MM-DD format (local timezone)
 * This prevents the common UTC/local timezone issues
 */
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a Date object to YYYY-MM-DD string in local timezone
 * This prevents the common UTC/local timezone issues when using toISOString()
 */
export function dateToLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}