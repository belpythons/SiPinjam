import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function handleAsync<T>(promise: Promise<T>): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function getFromLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const item = localStorage.getItem(key)
    if (!item) return fallback
    const parsed = JSON.parse(item)
    return deserializeDates(parsed)
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return fallback
  }
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

export function deserializeDates(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === "string") {
    // Check if string is an ISO date
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    if (isoDateRegex.test(obj)) {
      const date = new Date(obj)
      // Validate the date is actually valid
      return isNaN(date.getTime()) ? obj : date
    }
    return obj
  }
  if (Array.isArray(obj)) {
    return obj.map(deserializeDates)
  }
  if (typeof obj === "object") {
    const result: any = {}
    for (const key in obj) {
      // Special handling for known date fields
      if (["startDate", "endDate", "createdAt", "approvedAt", "deactivatedAt", "reactivateAt", "date"].includes(key)) {
        const value = obj[key]
        if (value) {
          const date = new Date(value)
          result[key] = isNaN(date.getTime()) ? value : date
        } else {
          result[key] = value
        }
      } else {
        result[key] = deserializeDates(obj[key])
      }
    }
    return result
  }
  return obj
}

export function safeFormatDate(date: Date | string | null | undefined, formatStr = "dd/MM/yyyy"): string {
  if (!date) return "-"

  const dateObj = date instanceof Date ? date : new Date(date)

  if (!isValid(dateObj)) return "-"

  try {
    return format(dateObj, formatStr)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "-"
  }
}
