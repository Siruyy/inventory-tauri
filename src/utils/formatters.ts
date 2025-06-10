/**
 * Format a number as Philippine Peso
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to a readable format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format a percentage value
 * @param value The percentage value (e.g., 12.34)
 * @returns Formatted percentage string (e.g., "12.34%")
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
