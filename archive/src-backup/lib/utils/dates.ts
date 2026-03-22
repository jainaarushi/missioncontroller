import { format, isToday, isThisWeek, formatDistanceToNow } from "date-fns";

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function formatRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatTime(date: string): string {
  return format(new Date(date), "h:mm a");
}

export function isTodayDate(date: string): boolean {
  return isToday(new Date(date));
}

export function isThisWeekDate(date: string): boolean {
  return isThisWeek(new Date(date));
}

export function formatCost(costUsd: number): string {
  if (costUsd === 0) return "$0.00";
  if (costUsd < 0.01) return `$${costUsd.toFixed(4)}`;
  return `$${costUsd.toFixed(2)}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
