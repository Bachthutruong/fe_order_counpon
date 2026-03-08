import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format as Taiwanese Dollar (NT$) like WooCommerce: NT$1,234 */
export function formatCurrency(amount: number): string {
  if (amount == null || isNaN(amount)) return 'NT$0'
  const rounded = Math.round(amount * 100) / 100
  const hasDecimals = rounded % 1 !== 0
  return 'NT$' + new Intl.NumberFormat('en-US', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(rounded)
}
