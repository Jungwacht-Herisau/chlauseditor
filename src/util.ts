export function parseApiDateTime(value: string): Date {
  return new Date(Date.parse(value));
}

export function sortAndUnique<T>(arr: T[]): T[] {
  return [...new Set(arr)].sort();
}

export function toDateISOString(date: Date): string {
  return date.toISOString().split("T", 1)[0];
}