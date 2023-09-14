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
    const sizes = [24 * 60 * 60, 60 * 60, 60, 1];
    const units = ["d", "h", "m", "s"];
    for (let i = 0; i < sizes.length; i++) {
        if (seconds > sizes[i] || i + 1 == sizes.length) {
            const value = seconds / sizes[i];
            const valueAtLeast2SignificantDigits = value < 10
                ? value.toFixed(1)
                : Math.round(value).toFixed(0);
            return valueAtLeast2SignificantDigits + units[i];
        }
    }
    return "0s";
}

export function formatStartEnd(obj: StartEnd): string {
    const start = obj.start;
    const end = obj.end;
    return formatHours(toFractionHours(start)) + "-" + formatHours(toFractionHours(end));
}

export function toFractionHours(date: Date): number {
    return date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
}

const UPPERCASE_PREFIX = "^{";
const UPPERCASE_SUFFIX = "}^";

export function encodeUpperCase(str: string): string {
    return str.replace(/([A-Z]+)/g, `${UPPERCASE_PREFIX}$1${UPPERCASE_SUFFIX}`);
}

export function decodeUpperCase(str: string): string {
    const escapeRegExp = (escape: string) => ["", ...escape.split("")].join("\\");

    return str.replace(
        new RegExp(`${escapeRegExp(UPPERCASE_PREFIX)}(.*?)${escapeRegExp(UPPERCASE_SUFFIX)}`, "g"),
        (_, p1: string) => p1.toUpperCase(),
    );
}

export function arrayEquals<T>(a: T[], b: T[]): boolean {
    if (a.length != b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

/**
 * returns [added, unchanged, removed]
 */
export function mapEntryDiff<K, V>(oldMap: Map<K, V>, newMap: Map<K, V>): [V[], [V, V][], V[]] {
    const unchanged = [] as [V, V][];
    const added = [] as V[];
    const removed = [] as V[];
    const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);
    allKeys.forEach(key => {
        if (oldMap.has(key)) {
            if (newMap.has(key)) {
                unchanged.push([oldMap.get(key)!, newMap.get(key)!]);
            } else {
                removed.push(oldMap.get(key)!);
            }
        } else {
            added.push(newMap.get(key)!);
        }
    })
    return [added, unchanged, removed];
}

export interface HasId {
    'id'?: number;
}

export function flattenMapToArray<T extends HasId>(map: Map<any, T[]>): Map<number, T> {
    const result = new Map<number, T>();
    for (const arr of map.values()) {
        for (const elem of arr) {
            result.set(elem.id!, elem);
        }
    }
    return result;
}