export const formatDate = (
  date: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' }
): string => {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
};

export const formatYear = (date: string | Date | undefined): string => {
  if (!date) return '';
  return new Date(date).getFullYear().toString();
};

export const formatDateRange = (
  startDate: string | Date | undefined,
  endDate: string | Date | undefined,
  isCurrent = false
): string => {
  const start = startDate ? formatDate(startDate, { year: 'numeric', month: 'short' }) : '';
  const end = isCurrent ? 'Present' : endDate ? formatDate(endDate, { year: 'numeric', month: 'short' }) : '';
  if (!start && !end) return '';
  if (!end) return start;
  if (!start) return end;
  return `${start} – ${end}`;
};

export const formatCurrency = (amount: number | undefined, currency = 'USD'): string => {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

export const truncate = (text: string, maxLength = 150): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
};

export const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};
