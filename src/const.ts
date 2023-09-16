import {HourRange} from "@/types";

export const DEVELOPMENT_MODE =
  window.location.host.includes("127.0.0.1") || window.location.host.includes("localhost");

export const API_URL = DEVELOPMENT_MODE ? "http://127.0.0.1:8000" : "https://chlausplanner.azurewebsites.net";

export const DEFAULT_TIME_RANGE = new HourRange(10, 23);

export const FETCHED_ENTITY_TYPE_COUNT = 9;
