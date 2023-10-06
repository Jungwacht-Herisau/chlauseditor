import type {HasId} from "@/util";
import {arrayEquals, toDateISOString, toFractionHours} from "@/util";
import type {DayKey} from "@/types";
import {useStore} from "@/model/store";
import {DEFAULT_TIME_RANGE} from "@/const";
import {TourElementTypeEnum} from "@/api/models/TourElement";
import {
  AdultInfo,
  ChildInfo,
  Client,
  ClientAvailability,
  DrivingTimeMatrix,
  FamilyClientDetails,
  JWler,
  JWlerAvailability,
  Location,
  OrganisationClientDetails,
  TimeBetweenData,
  Tour,
  TourElement,
} from "@/api";
import {toRaw} from "vue";

export const MODEL_TYPES = [
  AdultInfo,
  ChildInfo,
  Client,
  ClientAvailability,
  DrivingTimeMatrix,
  FamilyClientDetails,
  JWler,
  JWlerAvailability,
  Location,
  OrganisationClientDetails,
  TimeBetweenData,
  Tour,
  TourElement,
];
export type AnyModelType =
  | AdultInfo
  | ChildInfo
  | Client
  | ClientAvailability
  | DrivingTimeMatrix
  | FamilyClientDetails
  | JWler
  | JWlerAvailability
  | Location
  | OrganisationClientDetails
  | TimeBetweenData
  | Tour
  | TourElement;

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

export function getJwlersOfTour(tour: Tour): JWler[] {
  const jwlers = [] as JWler[];
  for (let i = 0; i < tour.jwlers!.length!; i++) {
    const jwlerId = tour.jwlers![i];
    jwlers.push(useStore().data.jwlers.get(jwlerId)!);
  }
  return jwlers;
}

export function getJwlerAvailabilitiesOfTour(tour: Tour): JWlerAvailability[] {
  const tourDate = new Date(Date.parse(tour.date)).toDateString();
  const availabilities = [] as JWlerAvailability[];
  for (let iJw = 0; iJw < tour.jwlers!.length; iJw++) {
    const jwlerId = tour.jwlers![iJw];
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
  const oldElements = store.data.tourElements.get(tour.id!)!.sort((a, b) => a.start.getTime() - b.start.getTime());
  const newElements = [] as TourElement[];
  const hoursOfTour = getHoursOfTour(tour);
  const earliestPossibleTourStart = new Date(Date.parse(tour.date) + Math.min(...hoursOfTour) * 60 * 60 * 1000);

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

  function adjustExistingDriveElementTime(driveIdx: number, driveElement: TourElement, driveTimeMs: number) {
    const elementAfterLastDrive = oldElements[driveIdx + 1];
    const elementBeforeLastDrive = driveIdx >= 1 ? oldElements[driveIdx - 1] : null;
    const driveEarliestStart = elementBeforeLastDrive != null ? elementBeforeLastDrive.end : earliestPossibleTourStart;
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
      tour: tour.id!,
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
      const [lastVisitIdx, lastVisitElement] = searchElement(newElements.length, -1, TourElementTypeEnum.V);
      const [lastDriveIdx, lastDriveElement] = searchElement(newElements.length, -1, TourElementTypeEnum.D);
      const currentClient = useStore().data.clients.get(iElement.client!)!;
      const currentLocation = currentClient.visitLocation;
      if (lastVisitIdx != null && lastVisitElement != null) {
        const lastClient = useStore().data.clients.get(lastVisitElement.client!)!;
        const lastLocation = lastClient.visitLocation;
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
  const [lastVisitIdx, lastVisitElement] = searchElement(newElements.length, -1, TourElementTypeEnum.V);
  const [lastDriveIdx, lastDriveElement] = searchElement(newElements.length, -1, TourElementTypeEnum.D);
  if (lastVisitIdx != null && (lastDriveIdx == null || lastVisitIdx > lastDriveIdx)) {
    const lastClient = store.data.clients.get(lastVisitElement.client!)!;
    const driveTimeMs = getDriveTimeMs(lastClient.visitLocation, store.data.baseLocation.id!);
    const driveElement: TourElement = {
      id: nextNewElementId,
      start: lastVisitElement.end,
      end: new Date(lastVisitElement.end.getTime() + driveTimeMs),
      tour: tour.id!,
      type: TourElementTypeEnum.D,
      client: null,
    };
    newElements.push(driveElement);
  }
  store.data.tourElements.set(tour.id!, newElements);

  tour.elements = newElements.map(el => el.id!);

  newElements.forEach(el => {
    console.log(el.start.toLocaleTimeString(), el.end.toLocaleTimeString(), el.type);
  });
}

export function deepCloneMap<K, V>(value: Map<K, V>): Map<K, V> {
  const result = new Map();
  value.forEach((v, k) => result.set(k, deepCloneObject(v)));
  return result;
}

export function deepCloneObject<T>(obj: T): T {
  //this seems to be the simplest solution that is reliable enough...
  const clone = JSON.parse(JSON.stringify(obj));
  Object.setPrototypeOf(clone, Object.getPrototypeOf(obj));
  return clone;
}

export function popTourElement(tourId: number, elementId: number): TourElement {
  const store = useStore();
  const elements = store.data.tourElements.get(tourId)!;
  const poppedElement = elements.find(te => te.id == elementId)!;
  if (elements.length == 1) {
    store.data.tourElements.delete(tourId);
  } else {
    const remainingElements = elements.filter(te => te.id != elementId);
    store.data.tourElements.set(tourId, remainingElements);
  }
  const tour = store.data.tours.get(tourId);
  if (tour) {
    tour.elements = tour.elements!.filter(e => e != elementId);
  }
  return poppedElement;
}

export function addTourElement(tourId: number, newElement: TourElement) {
  const store = useStore();
  if (store.data.tourElements.has(tourId)) {
    store.data.tourElements.get(tourId)!.push(newElement);
  } else {
    store.data.tourElements.set(tourId, [newElement]);
  }
  store.data.tours.get(tourId)!.elements!.push(newElement.id!);
}

export function modelEquals<T extends {[key: string]: any}>(a: T, b: T) {
  a = toRaw(a);
  b = toRaw(b);
  for (const type of MODEL_TYPES) {
    if (a instanceof type || b instanceof type) {
      return type.getAttributeTypeMap().every(attr => {
        const va = a[attr.name];
        const vb = b[attr.name];
        let equals: boolean;
        if (attr.type == "Date") {
          equals = Math.abs(new Date(va).getTime() - new Date(vb).getTime()) < 1000;
        } else if (attr.type.includes("Array")) {
          equals = arrayEquals(va, vb);
        } else {
          equals = va == vb;
        }
        return equals;
      });
    }
  }
  console.warn("type not in list, doing json comparison", a, b);
  return JSON.stringify(a) == JSON.stringify(b);
}

/**
 * @param changes key is old id and value is object with new id
 */
export function handleIdChangeAfterApiCreate<T extends AnyModelType & HasId>(changes: Map<T, T>) {
  const store = useStore();
  const newTourElements = new Map<number, TourElement[]>();
  const newClientAvailabilities = new Map<number, ClientAvailability[]>();
  const newJWlerAvailabilities = new Map<number, JWlerAvailability[]>();
  changes.forEach((newObj, oldObj) => {
    const oldId = oldObj.id!;
    const newId = newObj.id!;
    if (newObj instanceof Tour) {
      const elements = store.data.tourElements.get(oldId);
      if (elements) {
        elements.forEach(e => (e.tour = newId));
        store.data.tourElements.delete(oldId);
        newTourElements.set(newId, elements);
      }
    } else if (newObj instanceof Client) {
      const availabilities = store.data.clientAvailabilities.get(oldId);
      if (availabilities) {
        availabilities.forEach(av => (av.client = newId));
        store.data.clientAvailabilities.delete(oldId);
        newClientAvailabilities.set(newId, availabilities);
      }
    } else if (newObj instanceof JWler) {
      const availabilities = store.data.jwlerAvailabilities.get(oldId);
      if (availabilities) {
        availabilities.forEach(av => (av.jwler = newId));
        store.data.jwlerAvailabilities.delete(oldId);
        newJWlerAvailabilities.set(newId, availabilities);
      }
    }
    oldObj.id = newId; //because of reactivity, this change is propagated back to the store
  });
  newTourElements.forEach((v, k) => store.data.tourElements.set(k, v));
}

/**
 * This function deletes referenced elements when an element is deleted because the same thing is happening on the server
 * @param obj the object which was destroyed
 */
export function handleAfterApiDestroy<T extends AnyModelType & HasId>(obj: T) {
  const rawObj = toRaw(obj);
  const store = useStore();
  const id = obj.id!;
  if (rawObj instanceof Tour) {
    store.data.tourElements.delete(id);
  } else if (rawObj instanceof JWler) {
    store.data.jwlerAvailabilities.delete(id);
  } else if (rawObj instanceof Client) {
    store.data.clientAvailabilities.delete(id);
  }
}

export function getTourElementDescription(element: TourElement): string {
  switch (element.type) {
    case TourElementTypeEnum.V:
      return `Besuch ${element.client}`;
    case TourElementTypeEnum.D:
      return "Fahrt";
    case TourElementTypeEnum.B:
      return "Pause";
  }
  return "?";
}
