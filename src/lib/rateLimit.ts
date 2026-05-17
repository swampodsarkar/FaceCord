// Simple client-side rate limiter
const actionTimestamps: Record<string, number> = {};

export function rateLimit(action: string, cooldownMs: number = 2000): boolean {
  const now = Date.now();
  if (actionTimestamps[action] && now - actionTimestamps[action] < cooldownMs) {
    console.warn(`Rate limited: ${action}`);
    return false;
  }
  actionTimestamps[action] = now;
  return true;
}
