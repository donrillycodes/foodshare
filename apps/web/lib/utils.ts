import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes safely — prevents conflicting classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

// Format date with time
export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

// Get initials from name — for avatar placeholders
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// Format NGO status for display
export function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
}

// Get status colour classes for badges
export function getStatusColor(status: string): string {
  const colours: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    RESUBMITTED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
    SUSPENDED: "bg-gray-100 text-gray-800",
    OPEN: "bg-green-100 text-green-800",
    FULFILLED: "bg-blue-100 text-blue-800",
    CLOSED: "bg-gray-100 text-gray-800",
    EXPIRED: "bg-red-100 text-red-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800",
    DRAFT: "bg-yellow-100 text-yellow-800",
    ARCHIVED: "bg-gray-100 text-gray-800",
  };
  return colours[status] ?? "bg-gray-100 text-gray-800";
}
