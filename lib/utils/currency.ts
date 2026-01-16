// lib/utils/currency.ts
export function formatCurrency(
  amount: number | string,
  options: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
  } = {}
): string {
  const {
    locale = "en-US",
    currency = "USD",
    minimumFractionDigits = 2,
  } = options;

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
  }).format(numAmount);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
}
