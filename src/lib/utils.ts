import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateString: string) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateShort(dateString: string | undefined) {
  if (!dateString) return 'S/ Data';
  try {
    // Attempt to extract YYYY-MM-DD to avoid timezone shift
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0); // Noon to be safe
    if (isNaN(date.getTime())) return 'Data Inválida';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  } catch(e) {
    return 'Data Inválida';
  }
}

export function getLocalYYYYMMDD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseLocaleNumber(val: string) {
  if (!val) return 0;
  // Remove all non-numeric characters except comma and dot
  const cleanValue = val.replace(/[^\d.,]/g, '');
  
  // If there are both dots and commas, it's definitely a formatted string.
  // In PT-BR: 7.000,00 -> dot is thousands, comma is decimal.
  // In EN-US: 7,000.00 -> comma is thousands, dot is decimal.
  
  const hasComma = cleanValue.includes(',');
  const hasDot = cleanValue.includes('.');
  
  if (hasComma && hasDot) {
    // Find which comes last, that's likely the decimal separator
    const lastComma = cleanValue.lastIndexOf(',');
    const lastDot = cleanValue.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // PT-BR style: dots are thousands, comma is decimal
      return parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
    } else {
      // EN-US style: commas are thousands, dot is decimal
      return parseFloat(cleanValue.replace(/,/g, ''));
    }
  } else if (hasComma) {
    // Only commas: likely PT-BR decimal
    return parseFloat(cleanValue.replace(',', '.'));
  } else if (hasDot) {
    // Only dots: could be decimal (EN-US) or thousands (PT-BR).
    // Let's assume decimal unless it's exactly 3 digits after the dot AND it's a large number?
    // Actually, simple parseFloat(val) handles dot as decimal.
    return parseFloat(cleanValue);
  }
  
  return parseFloat(cleanValue) || 0;
}
