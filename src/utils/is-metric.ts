export default function isMetric(country: string): boolean {
  if (country === "United States" || country === "Liberia" || country === "Myanmar") {
    return false
  }
  return true
}
