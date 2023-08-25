import type {Tour} from "@/api";
import {parseApiDateTime, toDateISOString} from "@/util";

export function getDateKey(tour: Tour): string {
  return toDateISOString(parseApiDateTime(tour.date!));
}

export function extractId(url: string): string {
  return url.substring(url.lastIndexOf("/", url.length - 2)+1, url.length-1);
}
