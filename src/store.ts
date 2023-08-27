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
import {API_URL} from "@/const";
import {defineStore} from "pinia";

export const useStore = defineStore("data", {
  state: () => {
    return {
      jwlers: new Map<number, JWler>(),
      jwlerAvailabilities: new Map<number, Array<JWlerAvailability>>(),
      clients: new Map<number, Client>(),
      clientAvailabilities: new Map<number, Array<ClientAvailability>>(),
      locations: new Map<number, Location>(),
      tours: new Map<number, Tour>(),
    };
  },
  getters: {
    days() {
      const newDays = new Set<DayKey>();
      this.jwlerAvailabilities.forEach(avs =>
        avs.forEach(av => newDays.add(getDayKeyOfJwlerAvailability(av))),
      );
      this.clientAvailabilities.forEach(avs =>
        avs.forEach(av => newDays.add(getDayKeyOfClientAvailability(av))),
      );
      return [...newDays].sort();
    },
    toursByDay() {
      const toursByDay = new Map<DayKey, Tour[]>();
      this.days.forEach(d => toursByDay.set(d, []));
      this.tours.forEach(t => toursByDay.get(getDayKeyOfTour(t))!.push(t));
      return toursByDay;
    },
  },
  actions: {
    createTour(name: string, date: string) {
      let newId = 1;
      while (this.tours.has(newId)) {
        ++newId;
      }
      this.tours.set(newId, {
        id: newId,
        name: name,
        date: date,
        jwlers: [],
        elements: [],
      });
      return newId;
    },
    fetchData() {
      apiClient.api
        .listJWlers()
        .then(response => response.forEach(j => this.jwlers.set(j.id!, j)))
        .catch(console.log);
      apiClient.api
        .listJWlerAvailabilitys()
        .then(response => {
          const grouped = groupBy(response, ja => parseInt(extractId(ja.jwler)));
          grouped.forEach((value, key) => this.jwlerAvailabilities.set(key, value));
        })
        .catch(console.log);
      apiClient.api
        .listClients()
        .then(response => response.forEach(c => this.clients.set(c.id!, c)))
        .catch(console.log);
      apiClient.api
        .listClientAvailabilitys()
        .then(response => {
          const grouped = groupBy(response, ca => parseInt(extractId(ca.client)));
          grouped.forEach((value, key) => this.clientAvailabilities.set(key, value));
        })
        .catch(console.log);
      apiClient.api
        .listLocations()
        .then(response => response.forEach(l => this.locations.set(l.id!, l)))
        .catch(console.log);

      apiClient.api
        .listTours()
        .then(response => response.forEach(t => this.tours.set(t.id!, t)))
        .catch(console.log);
    },
  },
});

const apiClient = new ApiClient({BASE: API_URL});

export function touch(x: any) {
  // noinspection BadExpressionStatementJS
  x;
}
