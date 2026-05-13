export const TRIAL_DURATION_HOURS = 72;
export const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;
export const BILLING_CYCLE_DAYS = 30;
export const BILLING_CYCLE_MS = BILLING_CYCLE_DAYS * 24 * 60 * 60 * 1000;

export const PRO_FIRST_CHARGE_ZAR = 99;
export const PRO_RECURRING_ZAR = 299;
export const PROMO_USER_LIMIT = 1000;

const zarFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatZar(amount: number): string {
  return zarFormatter.format(amount).replace(/\u00A0/g, " ");
}

const sastFormatter = new Intl.DateTimeFormat("en-ZA", {
  timeZone: "Africa/Johannesburg",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDateSast(input: Date | string | null | undefined): string | null {
  if (!input) return null;
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return null;
  return `${sastFormatter.format(date)} (SAST)`;
}
