/**
 * Remove house number from address string (e.g., "123 Main St" → "Main St")
 * This ensures privacy by not showing exact house numbers.
 */
export function removeHouseNumber(address: string): string {
  if (!address) return address;
  // Remove leading digits, letters (for unit numbers like 45A), hyphens, and spaces
  return address.replace(/^[\d\w\-]+\s+/, '').trim();
}
