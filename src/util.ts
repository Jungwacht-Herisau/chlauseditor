
export function parseApiDateTime(value: string): Date {
  return new Date(Date.parse(value));
}

export function sortAndUnique<T>(arr: T[]): T[] {
  return [...new Set(arr)].sort();
}

export function toDateISOString(date: Date): string {
  return date.toISOString().split("T", 1)[0];
}

export function groupBy<T, K extends keyof any>(
  objs: T[],
  keyExtractor: (obj: T) => K,
): Record<K, Array<T>> {
  const result = {} as Record<K, Array<T>>;
  objs.forEach(o => {
    const k = keyExtractor(o);
    if (k in result) {
      result[k].push(o);
    } else {
      result[k] = [o];
    }
  });
  return result;
}

export function formatHours(time: number): string {
  const hours = Math.floor(time);
  const minutes = (time - hours) * 60;
  return hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
}