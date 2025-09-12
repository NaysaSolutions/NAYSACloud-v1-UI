
export const useGetCurrentDay = () => new Date().toISOString().split('T')[0];



export function useFormatToDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return ""; // handle invalid dates
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}