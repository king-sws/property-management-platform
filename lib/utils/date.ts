
// lib/utils/date.ts
import {
  format,
  formatDistance,
  formatDistanceToNow,
  isAfter,
  isBefore,
  differenceInDays,
  differenceInMonths,
  addDays,
  addMonths,
} from "date-fns";

export {
  format,
  formatDistance,
  formatDistanceToNow,
  isAfter,
  isBefore,
  differenceInDays,
  differenceInMonths,
  addDays,
  addMonths,
};

export function formatDate(
  date: Date | string,
  formatStr: string = "MMM d, yyyy"
): string {
  return format(new Date(date), formatStr);
}

export function getRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: Date | string): boolean {
  return isBefore(new Date(date), new Date());
}

export function getDaysUntil(date: Date | string): number {
  return differenceInDays(new Date(date), new Date());
}
