const MINOR_UNITS_PER_UNIT = 100;

export const formatPrice = (amountInMinorUnits: number, currency: string): string => {
  const amount = amountInMinorUnits / MINOR_UNITS_PER_UNIT;

  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

export const formatPriceRange = (min: number | null, max: number | null, currency: string): string => {
  if (min === null || max === null) {
    return 'Not available';
  }

  return min === max ? formatPrice(min, currency) : `${formatPrice(min, currency)} – ${formatPrice(max, currency)}`;
};

export const formatDateTime = (isoDate: string, timeZone: string): string => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return 'Date to be confirmed';
  }

  const options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

  try {
    return new Intl.DateTimeFormat(undefined, { ...options, timeZone }).format(date);
  } catch {
    return new Intl.DateTimeFormat(undefined, options).format(date);
  }
};
