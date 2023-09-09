import type {StartEnd} from "@/types";
import {toRaw} from "vue";

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
    if (result.length == 0) {
        result += "0s";
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

export function deepCloneMap<K, V>(value: Map<K, V>): Map<K, V> {
    const result = new Map();
    value.forEach((v, k) => result.set(k, deepCloneObject(v)));
    return result;
}

export function deepCloneObject<T>(obj: T): T {
    let clone: T;
    obj = toRaw(obj);
    try {
        clone = structuredClone(obj);
    } catch (e) {
        clone = JSON.parse(JSON.stringify(obj));
    }
    return clone;
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