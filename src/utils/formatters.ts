import Decimal from "decimal.js";

export const formatCurrency = (amount: number | Decimal): string => {
  // If amount is a Decimal, convert it to a number
  const numericAmount = amount instanceof Decimal ? amount.toNumber() : amount;

  // Use Intl.NumberFormat for proper formatting with commas and currency symbol
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};
