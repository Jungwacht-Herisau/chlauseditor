import {useStore} from "@/store";
import {extractId} from "@/model_utils";
import {Tour, TourElement} from "@/api";
import {getUrl} from "@/api_url_builder";
import {decodeUpperCase, encodeUpperCase} from "@/util";

export enum ObjectType {
  /**id=jwler*/
  JWLER,
  /**id=tour;jwler*/
  ASSIGNED_JWLER,
  /**id=client*/
  CLIENT,
  /*id=tour;tourElement*/
  TOUR_ELEMENT,
}

type DragData = {
  type: ObjectType;
  id: number | string;
  cursorOffsetX: number;
  cursorOffsetY: number;
};

export function startDrag(
  event: DragEvent,
  type: ObjectType,
  id: number | string,
  cursorOffsetX: number = 0,
  cursorOffsetY: number = 0,
) {
  const data: DragData = {
    type: type,
    id: id,
    cursorOffsetX: cursorOffsetX,
    cursorOffsetY: cursorOffsetY,
  };
  event.dataTransfer!.setData(encodeUpperCase(JSON.stringify(data)), "");
}

export function allowDrop(event: DragEvent, ...types: ObjectType[]) {
  const data: DragData = getDragData(event);
  if (types.includes(data.type)) {
    event.preventDefault();
  }
}

export function getDragData(event: DragEvent): DragData {
  return JSON.parse(decodeUpperCase(event.dataTransfer!.types[0]));
}

export function getDraggedIdInt(event: DragEvent): number {
  const data = getDragData(event);
  if (typeof data.id == "string") {
    return parseInt(data.id);
  }
  return data.id;
}

export function getTwoDraggedIds(event: DragEvent) {
  const [oldTourId, elementId] = (getDragData(event).id as string).split(";");
  const tourIdInt = parseInt(oldTourId);
  const elementIdInt = parseInt(elementId);
  return [tourIdInt, elementIdInt];
}

export function allowDropDeletableElements(event: DragEvent) {
  allowDrop(event, ObjectType.TOUR_ELEMENT, ObjectType.ASSIGNED_JWLER);
}

export function deleteDroppedElement(event: DragEvent) {
  const dragData = getDragData(event);
  const store = useStore();
  switch (dragData.type) {
    case ObjectType.TOUR_ELEMENT: {
      const [tourId, elementId] = getTwoDraggedIds(event);
      const otherElements = store.tourElements.get(tourId)!.filter(te => te.id != elementId);
      if (otherElements.length > 0) {
        store.tourElements.set(tourId, otherElements);
      } else {
        store.tourElements.delete(tourId);
      }
      break;
    }
    case ObjectType.ASSIGNED_JWLER: {
      const [tourId, jwlerId] = getTwoDraggedIds(event);
      const tour = store.tours.get(tourId)!;
      tour.jwlers = tour.jwlers.filter(jwlerUrl => parseInt(extractId(jwlerUrl)) != jwlerId);
      break;
    }
  }
}

export function dropTourElement(event: DragEvent, currentTour: Tour, newStart: Date) {
  event.stopPropagation();
  const store = useStore();
  const [oldTourId, elementId] = getTwoDraggedIds(event);
  const oldElement = store.tourElements.get(oldTourId)!.find(te => te.id == elementId)!;
  const oldTourRemainingElements = store.tourElements
    .get(oldTourId)!
    .filter(te => te.id != elementId);
  if (oldTourRemainingElements.length > 0) {
    store.tourElements.set(oldTourId, oldTourRemainingElements);
  } else {
    store.tourElements.delete(oldTourId);
  }
  const newElement = {
    id: oldElement.id,
    tour: getUrl("tour", currentTour.id!),
    start: newStart,
    end: new Date(newStart.getTime() + oldElement.end.getTime() - oldElement.start.getTime()),
    type: oldElement.type,
    client: oldElement.client,
  } as TourElement;
  if (store.tourElements.has(currentTour.id!)) {
    store.tourElements.get(currentTour.id!)!.push(newElement);
  } else {
    store.tourElements.set(currentTour.id!, [newElement]);
  }
}
