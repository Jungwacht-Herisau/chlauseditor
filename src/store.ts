import {reactive, watch} from "vue";
import type {Client, ClientAvailability, JWler, JWlerAvailability, Location, Tour} from "@/api";
import {ApiClient} from "@/api";
import {
  extractId,
  getDayKeyOfClientAvailability,
  getDayKeyOfJwlerAvailability,
  getDayKeyOfTour,
} from "@/model_utils";
import type {DayKey} from "@/types";
import {groupBy} from "@/util";

export const store = reactive({
  jwlers: {} as Record<number, JWler>,
  jwlerAvailabilities: {} as Record<number, Array<JWlerAvailability>>,
  clients: {} as Record<number, Client>,
  clientAvailabilities: {} as Record<number, Array<ClientAvailability>>,
  locations: {} as Record<number, Location>,

  //working data
  tours: [] as Tour[],

  //derived data
  days: [] as DayKey[],
  toursByDay: {} as Record<DayKey, Tour[]>,
});

//constant data

const apiClient = new ApiClient({BASE: "http://127.0.0.1:8000"});

export function fetchData() {
  apiClient.api
    .listJWlers()
    .then(response => response.forEach(j => (store.jwlers[j.id!] = j)))
    .catch(console.log);
  apiClient.api
    .listJWlerAvailabilitys()
    .then(
      response =>
        (store.jwlerAvailabilities = groupBy(response, ja => parseInt(extractId(ja.jwler)))),
    )
    .catch(console.log);
  apiClient.api
    .listClients()
    .then(response => response.forEach(c => (store.clients[c.id!] = c)))
    .catch(console.log);
  apiClient.api
    .listClientAvailabilitys()
    .then(
      response =>
        (store.clientAvailabilities = groupBy(response, ca => parseInt(extractId(ca.client)))),
    )
    .catch(console.log);
  apiClient.api
    .listLocations()
    .then(response => response.forEach(l => (store.locations[l.id!] = l)))
    .catch(console.log);

  apiClient.api
    .listTours()
    .then(response => (store.tours = response))
    .catch(console.log);
}

function touch(x: any) {
  // noinspection BadExpressionStatementJS
  x;
}

watch(
  () => {
    touch(store.jwlerAvailabilities);
    touch(store.clientAvailabilities);
    return {};
  },
  () => {
    //console.log("jwlerAvailabilities", store.jwlerAvailabilities);
    const newDays = new Set<DayKey>();
    for (const jwlerId in store.jwlerAvailabilities) {
      store.jwlerAvailabilities[jwlerId].forEach(av =>
        newDays.add(getDayKeyOfJwlerAvailability(av)),
      );
    }
    for (const clientId in store.clientAvailabilities) {
      store.clientAvailabilities[clientId].forEach(av =>
        newDays.add(getDayKeyOfClientAvailability(av)),
      );
    }
    store.days = [...newDays].sort();
  },
);

watch(
  () => {
    touch(store.days);
    touch(store.tours);
    return {};
  },
  () => {
    store.toursByDay = groupBy(store.tours, getDayKeyOfTour, store.days);
  },
);
