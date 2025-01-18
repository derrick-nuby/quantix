import Decimal from "decimal.js";

export const formatCurrency = (amount: number | Decimal): string => {
  // If amount is a Decimal, convert it to a number
  const numericAmount = amount instanceof Decimal ? amount.toNumber() : amount;

  return `RWF ${numericAmount.toLocaleString()}`;
};