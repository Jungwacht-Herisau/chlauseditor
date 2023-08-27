import type {ClientAvailability, JWler, JWlerAvailability, Tour} from "@/api";
import {parseApiDateTime, toDateISOString} from "@/util";
import type {DayKey} from "@/types";
import {useStore} from "@/store";

export function getDayKeyOfDate(date: Date): DayKey {
  return toDateISOString(date);
}

export function getDayKeyOfTour(tour: Tour): DayKey {
  return toDateISOString(parseApiDateTime(tour.date!));
}

export function getDayKeyOfJwlerAvailability(ja: JWlerAvailability): DayKey {
  return toDateISOString(parseApiDateTime(ja.start!));
}

export function getDayKeyOfClientAvailability(ca: ClientAvailability): DayKey {
  return toDateISOString(parseApiDateTime(ca.start!));
}

export function extractId(url: string): string {
  return url.substring(url.lastIndexOf("/", url.length - 2) + 1, url.length - 1);
}

export function getJwlersOfTour(tour: Tour): JWler[] {
  const jwlers = [] as JWler[];
  for (let i = 0; i < tour.jwlers.length!; i++) {
    const url = tour.jwlers[i]!;
    const jwlerId = parseInt(extractId(url));
    jwlers.push(useStore().jwlers.get(jwlerId)!);
  }
  return jwlers;
}

export function getJwlerAvailabilitiesOfTour(tour: Tour): JWlerAvailability[] {
  const tourDate = parseApiDateTime(tour.date).toDateString();
  const availabilities = [] as JWlerAvailability[];
  for (let iJw = 0; iJw < tour.jwlers.length!; iJw++) {
    const url = tour.jwlers[iJw]!;
    const jwlerId = parseInt(extractId(url));
    const allAv = useStore().jwlerAvailabilities.get(jwlerId)!;
    for (let iAv = 0; iAv < allAv.length; iAv++) {
      if (parseApiDateTime(allAv[iAv].start).toDateString() == tourDate) {
        availabilities.push(allAv[iAv]);
        break;
      }
    }
  }
  return availabilities;
}

function getHoursOfTour(tour: Tour): number[] {
  return getJwlerAvailabilitiesOfTour(tour).flatMap(av => {
    return [av.start, av.end].map(dstr => {
      const date = parseApiDateTime(dstr);
      return date.getHours() + date.getMinutes() / 60;
    });
  });
}

export function getDisplayStartHourOfTour(tour: Tour): number {
  return Math.min(...getHoursOfTour(tour));
}

export function getDisplayEndHourOfTour(tour: Tour): number {
  return Math.max(...getHoursOfTour(tour));
}

export function getJwlerAvailabilityOnDay(jwlerId: number, day: DayKey): JWlerAvailability | null {
  const avs = useStore().jwlerAvailabilities.get(jwlerId);
  if (avs) {
    for (let i = 0; i < avs.length; i++) {
      if (getDayKeyOfJwlerAvailability(avs[i]) == day) {
        return avs[i];
      }
    }
  }
  return null;
}
