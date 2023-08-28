export enum ObjectType {
  JWLER,
  CLIENT,
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
  event.dataTransfer!.setData("object", JSON.stringify(data));
}

export function allowDrop(event: DragEvent, ...types: ObjectType[]) {
  const data: DragData = JSON.parse(event.dataTransfer!.getData("object"));
  if (types.includes(data.type)) {
    event.preventDefault();
  }
}

export function getDragData(event: DragEvent): DragData {
  return JSON.parse(event.dataTransfer!.getData("object"));
}

export function getDraggedIdInt(event: DragEvent): number {
  const data = getDragData(event);
  if (typeof data.id == "string") {
    return parseInt(data.id);
  }
  return data.id;
}
