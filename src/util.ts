import type {StartEnd} from "@/types";

export interface HasForEach<T> {
  forEach(callback: (elem: T) => void): void;
}

export function sortAndUnique<T>(arr: T[]): T[] {
  return [...new Set(arr)].sort();
}

export function toDateISOString(date: Date): string {
  return date.toISOString().split("T", 1)[0];
}

export function groupBy<T, K extends keyof any>(
  objs: HasForEach<T>,
  keyExtractor: (obj: T) => K,
  keys: K[] = [],
): Map<K, Array<T>> {
  const result = new Map<K, Array<T>>();
  keys.forEach(k => result.set(k, []));
  objs.forEach(o => {
    const k = keyExtractor(o);
    const arr = result.get(k);
    if (arr) {
      arr.push(o);
    } else {
      result.set(k, [o]);
    }
  });
  return result;
}

export function formatHours(time: number): string {
  if (isNaN(time)) {
    return "";
  }
  return new Date(time * 60 * 60 * 1000).toUTCString().substring(17, 22);
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
  const start = obj.start;
  const end = obj.end;
  return formatHours(toFractionHours(start)) + "-" + formatHours(toFractionHours(end));
}

export function toFractionHours(date: Date): number {
  return date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
}