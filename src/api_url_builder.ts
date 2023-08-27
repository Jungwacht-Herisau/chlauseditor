import {API_URL} from "@/const";

export function getJwlerUrl(id: number | string): string {
  return `${API_URL}/api/jwler/${id}/`;
}
