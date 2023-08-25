import type {Tour} from "@/api";
import {parseApiDateTime, toDateISOString} from "@/util";

export function getDateKey(tour: Tour): string {
    return toDateISOString(parseApiDateTime(tour.date!));
}