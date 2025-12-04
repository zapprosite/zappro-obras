import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Format date to DD/MM/YYYY (Brazilian standard)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "-";
    return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "-";
  }
}

/**
 * Format date and time to DD/MM/YYYY HH:mm
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "-";
    return format(dateObj, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "-";
  }
}

/**
 * Format currency to BRL
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Format number with locale
 */
export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "0";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parse date input (YYYY-MM-DD) to display format (DD/MM/YYYY)
 */
export function inputDateToDisplay(dateString: string): string {
  if (!dateString) return "";
  return formatDate(dateString);
}

/**
 * Parse display date (DD/MM/YYYY) to input format (YYYY-MM-DD)
 */
export function displayToInputDate(displayDate: string): string {
  if (!displayDate || displayDate === "-") return "";
  const [day, month, year] = displayDate.split("/");
  return `${year}-${month}-${day}`;
}

/**
 * Escape CSV value (handles commas, quotes, newlines)
 */
export function escapeCSVValue(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
