import {API_URL} from "@/const";

export function getJwlerUrl(id: number | string): string {
  return getUrl("jwler", id);
}

export function getClientUrl(id: number | string): string {
  return getUrl("client", id);
}

export function getUrl(entityName: string, id: number | string): string {
  return `${API_URL}/api/${entityName}/${id}/`;
}
