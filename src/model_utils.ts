import {toDateISOString, toFractionHours} from "@/util";
import type {DayKey} from "@/types";
import {useStore} from "@/store";
import {DEFAULT_TIME_RANGE} from "@/const";
import type {Tour} from "@/api/models/Tour";
import type {JWlerAvailability} from "@/api/models/JWlerAvailability";
import type {ClientAvailability} from "@/api/models/ClientAvailability";
import type {JWler} from "@/api/models/JWler";
import type {TourElement} from "@/api/models/TourElement";
import {TourElementTypeEnum} from "@/api/models/TourElement";
import {getUrl} from "@/api_url_builder";

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
    jwlers.push(useStore().data.jwlers.get(jwlerId)!);
  }
  return jwlers;
}

export function getJwlerAvailabilitiesOfTour(tour: Tour): JWlerAvailability[] {
  const tourDate = new Date(Date.parse(tour.date)).toDateString();
  const availabilities = [] as JWlerAvailability[];
  for (let iJw = 0; iJw < tour.jwlers.length!; iJw++) {
    const url = tour.jwlers[iJw]!;
    const jwlerId = parseInt(extractId(url));
    const allAv = useStore().data.jwlerAvailabilities.get(jwlerId)!;
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
  const avs = useStore().data.jwlerAvailabilities.get(jwlerId);
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
  while (useStore().data.tours.has(newId)) {
    ++newId;
  }
  return newId;
}

export function findNewTourElementId(): number {
  let max = 1;
  useStore().data.tourElements.forEach(value => {
    max = Math.max(max, ...value.map(te => te.id!));
  });
  return max + 1;
}

export function getDurationMs(obj: TourElement): number {
  return obj.end.getTime() - obj.start.getTime();
}

export function getDriveTimeMs(location0: number, location1: number): number {
  const dtm = useStore().data.drivingTimeMatrix;
  const locIdxs = dtm.locationsCSV.split(";").map(s => parseInt(s));
  const idx0 = locIdxs.indexOf(location0);
  const idx1 = locIdxs.indexOf(location1);
  if (idx0 < 0 || idx1 < 0) {
    throw RangeError(`location(s) [${location0}, ${location1}] not in matrix ${locIdxs}`);
  }
  return dtm.matrix[idx0][idx1] * 1000;
}

export async function insertDriveElements(tour: Tour) {
  //todo there are still some ordering issues
  const store = useStore();
  const oldElements = store.data.tourElements
    .get(tour.id!)!
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const newElements = [] as TourElement[];
  const hoursOfTour = getHoursOfTour(tour);
  const earliestPossibleTourStart = new Date(
    Date.parse(tour.date) + Math.min(...hoursOfTour) * 60 * 60 * 1000,
  );

  function searchElement(
    idx: number,
    direction: -1 | 1,
    type: TourElementTypeEnum,
  ): [number, TourElement] | [null, null] {
    let i = idx + direction;
    while (i >= 0 && i < newElements.length) {
      if (newElements[i].type == type) {
        return [i, newElements[i]];
      }
      i += direction;
    }
    return [null, null];
  }

  function adjustExistingDriveElementTime(
    driveIdx: number,
    driveElement: TourElement,
    driveTimeMs: number,
  ) {
    const elementAfterLastDrive = oldElements[driveIdx + 1];
    const elementBeforeLastDrive = driveIdx >= 1 ? oldElements[driveIdx - 1] : null;
    const driveEarliestStart =
      elementBeforeLastDrive != null ? elementBeforeLastDrive.end : earliestPossibleTourStart;
    const driveLatestEnd = elementAfterLastDrive.start;
    if (driveLatestEnd.getTime() - driveEarliestStart.getTime() > driveTimeMs) {
      //no overlapping needed
      if (driveEarliestStart.getTime() > driveElement.start.getTime()) {
        //currently overlaps with previous element
        driveElement.start = driveEarliestStart;
        driveElement.end = new Date(driveEarliestStart.getTime() + driveTimeMs);
      } else if (driveLatestEnd.getTime() < driveElement.end.getTime()) {
        //currently overlaps with next element
        driveElement.end = driveLatestEnd;
        driveElement.start = new Date(driveLatestEnd.getTime() - driveTimeMs);
      }
    } else {
      driveElement.end = driveLatestEnd;
      driveElement.start = new Date(driveLatestEnd.getTime() - driveTimeMs);
    }
  }

  let nextNewElementId = findNewTourElementId();
  function insertNewDriveElementBefore(idx: number, element: TourElement, driveTimeMs: number) {
    console.log("nextNewElementId", nextNewElementId);
    const driveElement: TourElement = {
      id: nextNewElementId,
      start: new Date(element.start.getTime() - driveTimeMs),
      end: element.start,
      tour: getUrl("tour", tour.id!),
      type: TourElementTypeEnum.D,
      client: null,
    };
    newElements.push(driveElement);
    nextNewElementId += 1;
  }

  let drivenSinceLastVisit = false;
  for (let i = 0; i < oldElements.length; i++) {
    const iElement = oldElements[i];
    if (iElement.type == TourElementTypeEnum.V) {
      const [lastVisitIdx, lastVisitElement] = searchElement(
        newElements.length,
        -1,
        TourElementTypeEnum.V,
      );
      const [lastDriveIdx, lastDriveElement] = searchElement(
        newElements.length,
        -1,
        TourElementTypeEnum.D,
      );
      const currentClient = useStore().data.clients.get(parseInt(extractId(iElement.client!)))!;
      const currentLocation = parseInt(extractId(currentClient.visitLocation));
      if (lastVisitIdx != null && lastVisitElement != null) {
        const lastClient = useStore().data.clients.get(
          parseInt(extractId(lastVisitElement.client!)),
        )!;
        const lastLocation = parseInt(extractId(lastClient.visitLocation));
        const driveTimeMs = getDriveTimeMs(lastLocation, currentLocation);
        if (lastDriveIdx != null && lastDriveElement != null && lastDriveIdx > lastVisitIdx) {
          //there is already a drive between last visit and current visit
          adjustExistingDriveElementTime(lastDriveIdx, lastDriveElement, driveTimeMs);
        } else {
          insertNewDriveElementBefore(i, iElement, driveTimeMs);
        }
      } else {
        const driveTimeMs = getDriveTimeMs(store.data.baseLocation.id!, currentLocation);
        if (lastDriveIdx != null && lastDriveElement != null) {
          //drive from base to this location already exists
          adjustExistingDriveElementTime(lastDriveIdx, lastDriveElement, driveTimeMs);
        } else {
          insertNewDriveElementBefore(i, iElement, driveTimeMs);
        }
      }
    } else if (iElement.type == TourElementTypeEnum.D) {
      if (drivenSinceLastVisit) {
        continue;
      } else {
        drivenSinceLastVisit = true;
      }
    }
    newElements.push(iElement);
  }
  const [lastVisitIdx, lastVisitElement] = searchElement(
    newElements.length,
    -1,
    TourElementTypeEnum.V,
  );
  const [lastDriveIdx, lastDriveElement] = searchElement(
    newElements.length,
    -1,
    TourElementTypeEnum.D,
  );
  if (lastVisitIdx != null && (lastDriveIdx == null || lastVisitIdx > lastDriveIdx)) {
    const lastClient = store.data.clients.get(parseInt(extractId(lastVisitElement.client!)))!;
    const driveTimeMs = getDriveTimeMs(
      parseInt(extractId(lastClient.visitLocation)),
      store.data.baseLocation.id!,
    );
    const driveElement: TourElement = {
      id: nextNewElementId,
      start: lastVisitElement.end,
      end: new Date(lastVisitElement.end.getTime() + driveTimeMs),
      tour: getUrl("tour", tour.id!),
      type: TourElementTypeEnum.D,
      client: null,
    };
    newElements.push(driveElement);
  }
  store.data.tourElements.set(tour.id!, newElements);

  newElements.forEach(el => {
    console.log(el.start.toLocaleTimeString(), el.end.toLocaleTimeString(), el.type);
  });
}
