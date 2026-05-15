import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getBaseDescription = (desc: string) => {
  if (!desc) return '';
  return desc.replace(/\s*\(\d+\s*[\/\-]\s*\d+\)$/, '').trim();
};

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

export function getColorForAccount(name: string | undefined): string {
  if (!name) return 'rgba(0,0,0,0.1)';
  const n = name.toUpperCase();
  if (n.includes('NUBANK')) return '#8B3DFF';
  if (n.includes('ITAU') || n.includes('ITAÚ')) return '#EC7000';
  if (n.includes('BRADESCO')) return '#CC092F';
  if (n.includes('SANTANDER')) return '#CC0000';
  if (n.includes('CAIXA')) return '#005CA9';
  if (n.includes('INTER')) return '#FF7A00';
  if (n.includes('C6')) return '#242424';
  if (n.includes('BB') || n.includes('BRASIL')) return '#FCEE21';
  if (n.includes('BTG')) return '#002B49';
  if (n.includes('XP')) return '#000000';
  if (n.includes('PIX')) return '#32BCAD';
  if (n.includes('DINHEIRO') || n.includes('CASH')) return '#22C55E';
  
  let hash = 0;
  for (let i = 0; i < n.length; i++) {
    hash = n.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.abs(hash).toString(16).substring(0, 6);
  return `#${'000000'.substring(0, 6 - color.length)}${color}`;
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
