import {toDateISOString, toFractionHours} from "@/util";
import type {DayKey} from "@/types";
import {useStore} from "@/store";
import {DEFAULT_TIME_RANGE} from "@/const";
import {inject} from "vue";
import type {PromiseApiApi} from "@/api/types/PromiseAPI";
import type {Tour} from "@/api/models/Tour";
import type {JWlerAvailability} from "@/api/models/JWlerAvailability";
import type {ClientAvailability} from "@/api/models/ClientAvailability";
import type {JWler} from "@/api/models/JWler";
import type {TourElement} from "@/api/models/TourElement";
import {TourElementTypeEnum} from "@/api/models/TourElement";

export function getDayKeyOfDate(date: Date): DayKey {
  return toDateISOString(date);
}

export function getDayKeyOfTour(tour: Tour): DayKey {
  return tour.date!; //todo inline if it works
}

export function getDayKeyOfJwlerAvailability(ja: JWlerAvailability): DayKey {
  return toDateISOString(ja.start!);
}

export function getDayKeyOfClientAvailability(ca: ClientAvailability): DayKey {
  return toDateISOString(ca.start!);
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
  const tourDate = new Date(Date.parse(tour.date)).toDateString();
  const availabilities = [] as JWlerAvailability[];
  for (let iJw = 0; iJw < tour.jwlers.length!; iJw++) {
    const url = tour.jwlers[iJw]!;
    const jwlerId = parseInt(extractId(url));
    const allAv = useStore().jwlerAvailabilities.get(jwlerId)!;
    for (let iAv = 0; iAv < allAv.length; iAv++) {
      if (allAv[iAv].start.toDateString() == tourDate) {
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
      return toFractionHours(dstr);
    });
  });
}

export function getDisplayStartHourOfTour(tour: Tour): number {
  const hours = getHoursOfTour(tour);
  return hours.length == 0 ? DEFAULT_TIME_RANGE.start : Math.min(...hours);
}

export function getDisplayEndHourOfTour(tour: Tour): number {
  const hours = getHoursOfTour(tour);
  return hours.length == 0 ? DEFAULT_TIME_RANGE.end : Math.max(...hours);
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

export function findNewTourId(): number {
  let newId = 1;
  while (useStore().tours.has(newId)) {
    ++newId;
  }
  return newId;
}

export function findNewTourElementId(): number {
  let max = 1;
  useStore().tourElements.forEach(value => {
    max = Math.max(max, ...value.map(te => te.id!));
  });
  return max + 1;
}

export function getDurationMs(obj: TourElement): number {
  return obj.end.getTime() - obj.start.getTime();
}

export async function insertDriveElements(tour: Tour) {
  const store = useStore();
  const elements = store.tourElements.get(tour.id!)!;

  function searchElement(
    idx: number,
    direction: -1 | 1,
    type: TourElementTypeEnum,
  ): [number, TourElement] | [null, null] {
    let i = idx + direction;
    while (i >= 0 && i < elements.length) {
      if (elements[i].type == type) {
        return [i, elements[i]];
      }
      i += direction;
    }
    return [null, null];
  }

  for (let i = 0; i < elements.length; i++) {
    const iElement = elements[i];
    if (iElement.type == TourElementTypeEnum.V) {
      const [lastVisitIdx, lastVisitElement] = searchElement(i, -1, TourElementTypeEnum.V);
      const [lastDriveIdx, lastDriveElement] = searchElement(i, -1, TourElementTypeEnum.D);
      if (lastVisitIdx != null) {
        const lastClient = useStore().clients.get(parseInt(extractId(lastVisitElement.client!)))!;
        const currentClient = useStore().clients.get(parseInt(extractId(iElement.client!)))!;
        const lastLocation = parseInt(extractId(lastClient.visitLocation));
        const currentLocation = parseInt(extractId(currentClient.visitLocation));
        const betweenData = await(
          inject("apiClient") as PromiseApiApi,
        ).getTimeBetweenDrivingTimeMatrix(lastLocation, currentLocation);
        if (lastDriveIdx != null && lastDriveIdx > lastVisitIdx) {
          //there is already a drive between last visit and current visit
          //todo update time
        } else {
          //todo create drive element at i-1 (don't forget to update i)
        }
      } else {
        if (lastDriveIdx != null) {
          //drive from base to this location already exists
          //todo update time
        } else {
          //todo add drive from base to this location
        }
      }
    }
  }
  //todo make sure there is a drive element from last visit back to base
}
