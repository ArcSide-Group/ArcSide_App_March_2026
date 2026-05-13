export const DISCLAIMER_LAST_UPDATED = "2026-05-13";

export function formatDisclaimerDate(iso: string = DISCLAIMER_LAST_UPDATED): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  });
}
