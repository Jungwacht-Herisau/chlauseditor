export enum ObjectType {
  JWLER,
  CLIENT,
}

type DragData = {
  type: ObjectType;
  id: number | string;
};

export function startDrag(event: DragEvent, type: ObjectType, id: number | string) {
  const data: DragData = {
    type: type,
    id: id,
  };
  event.dataTransfer!.setData("object", JSON.stringify(data));
}

export function allowDrop(event: DragEvent, type: ObjectType) {
  const data: DragData = JSON.parse(event.dataTransfer!.getData("object"));
  if (data.type == type) {
    event.preventDefault();
  }
}

export function drop(event: DragEvent): number {
  const data: DragData = JSON.parse(event.dataTransfer!.getData("object"));
  if (typeof data.id == "string") {
    return parseInt(data.id);
  }
  return data.id;
}
