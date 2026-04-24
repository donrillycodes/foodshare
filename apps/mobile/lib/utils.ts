// Format currency — always two decimal places
export function formatCurrency(
  amount: number | string,
  currency: string = "CAD",
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(num);
}

// Format date — human readable
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

// Format relative time — "2 hours ago"
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return formatDate(date);
}

// Truncate text with ellipsis
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

// Get initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Format NGO category for display
export function formatCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Format status for display
export function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
}

// Get progress percentage
export function getProgress(fulfilled: number, required: number): number {
  if (required === 0) return 0;
  return Math.min(Math.round((fulfilled / required) * 100), 100);
}

// Brand colours — used across components
export const COLORS = {
  green: "#1A7A4A",
  greenDk: "#145E38",
  greenLt: "#E8F5EE",
  greenMid: "#2D9E64",
  gray: "#4A4A4A",
  grayLt: "#F5F5F5",
  grayMd: "#E0E0E0",
  white: "#FFFFFF",
  black: "#1A1A1A",
  red: "#DC2626",
  amber: "#D97706",
  blue: "#1D4ED8",
  background: "#F9FAFB",
};
