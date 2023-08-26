import type {StartEnd} from "@/types";

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
  keys: K[] = [],
): Record<K, Array<T>> {
  const result = {} as Record<K, Array<T>>;
  keys.forEach(k => (result[k] = []));
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

export function formatDeltaSeconds(seconds: number): string {
  const date = new Date(seconds * 1000);
  let result = "";
  if (date.getUTCHours() > 0) {
    result += date.getUTCHours() + "h";
  }
  if (date.getUTCMinutes() > 0) {
    result += date.getUTCMinutes() + "m";
  }
  if (date.getUTCSeconds() > 0) {
    result += date.getUTCSeconds() + "s";
  }
  return result;
}

export function formatStartEnd(obj: StartEnd): string {
  const start = parseApiDateTime(obj.start);
  const end = parseApiDateTime(obj.end);
  return (
    formatHours(start.getHours() + start.getMinutes() * 60) +
    "-" +
    formatHours(end.getHours() + end.getMinutes() * 60)
  );
}
