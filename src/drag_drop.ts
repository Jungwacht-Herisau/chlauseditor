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
  const text = decodeUpperCase(event.dataTransfer!.types[0]);
  console.debug(text);
  if (text[0] == "{") {
    return JSON.parse(text);
  } else {
    return {} as DragData;
  }
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
      const otherElements = store.data.tourElements.get(tourId)!.filter(te => te.id != elementId);
      if (otherElements.length > 0) {
        store.data.tourElements.set(tourId, otherElements);
      } else {
        store.data.tourElements.delete(tourId);
      }
      break;
    }
    case ObjectType.ASSIGNED_JWLER: {
      const [tourId, jwlerId] = getTwoDraggedIds(event);
      const tour = store.data.tours.get(tourId)!;
      tour.jwlers = tour.jwlers.filter(jwlerUrl => parseInt(extractId(jwlerUrl)) != jwlerId);
      break;
    }
  }
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
  return poppedElement;
}

export function dropTourElement(event: DragEvent, newTour: Tour, newStart: Date) {
  event.stopPropagation();
  const store = useStore();
  const [oldTourId, elementId] = getTwoDraggedIds(event);
  const oldElement = popTourElement(oldTourId, elementId);
  const newElement = {
    id: oldElement.id,
    tour: getUrl("tour", newTour.id!),
    start: newStart,
    end: new Date(newStart.getTime() + oldElement.end.getTime() - oldElement.start.getTime()),
    type: oldElement.type,
    client: oldElement.client,
  } as TourElement;
  if (store.data.tourElements.has(newTour.id!)) {
    store.data.tourElements.get(newTour.id!)!.push(newElement);
  } else {
    store.data.tourElements.set(newTour.id!, [newElement]);
  }
}
