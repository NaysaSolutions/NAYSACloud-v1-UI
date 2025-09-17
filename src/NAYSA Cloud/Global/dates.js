
export const useGetCurrentDay = () => new Date().toISOString().split('T')[0];



export function useFormatToDate(value) {
  if (!value) return "";

  // If it's already a plain YYYY-MM-DD string, return as-is (no timezone math).
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/);
    if (m && !value.includes("T")) return m[1];
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  // Convert to "local ISO" by removing the TZ offset, then slice the date part.
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10); // YYYY-MM-DD (in local time)
}
