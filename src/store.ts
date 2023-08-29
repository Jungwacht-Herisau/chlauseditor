import type {
  Client,
  ClientAvailability,
  JWler,
  JWlerAvailability,
  Location,
  Tour,
  TourElement,
} from "@/api";
import {ApiClient} from "@/api";
import {
  extractId,
  getDayKeyOfClientAvailability,
  getDayKeyOfJwlerAvailability,
  getDayKeyOfTour,
} from "@/model_utils";
import type {DayKey} from "@/types";
import {groupBy} from "@/util";
import {defineStore} from "pinia";
import {inject} from "vue";

export const useStore = defineStore("data", {
  state: () => {
    return {
      jwlers: new Map<number, JWler>(),
      jwlerAvailabilities: new Map<number, Array<JWlerAvailability>>(),
      clients: new Map<number, Client>(),
      clientAvailabilities: new Map<number, Array<ClientAvailability>>(),
      locations: new Map<number, Location>(),
      tours: new Map<number, Tour>(),
      tourElements: new Map<number, TourElement[]>(),

      fetchedEntities: new Set<string>(),
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
    unassignedClients() {
      const result = new Map<number, Client>();
      this.clients.forEach((value, key) => result.set(key, value));
      this.tours.forEach(t => {
        const elements = this.tourElements.get(t.id!);
        if (elements != undefined) {
          elements!.forEach(te => {
            if (te.client != null) {
              result.delete(parseInt(extractId(te.client)));
            }
          });
        }
      });
      return result;
    },
  },
  actions: {
    fetchData() {
      const apiClient = inject("apiClient") as ApiClient;
      apiClient.api
        .listJWlers()
        .then(response => response.forEach(j => this.jwlers.set(j.id!, j)))
        .catch(console.log)
        .finally(() => this.fetchedEntities.add("jwler"));
      apiClient.api
        .listJWlerAvailabilitys()
        .then(response => {
          const grouped = groupBy(response, ja => parseInt(extractId(ja.jwler)));
          grouped.forEach((value, key) => this.jwlerAvailabilities.set(key, value));
        })
        .catch(console.log)
        .finally(() => this.fetchedEntities.add("jwlerAvailability"));
      apiClient.api
        .listClients()
        .then(response => response.forEach(c => this.clients.set(c.id!, c)))
        .catch(console.log)
        .finally(() => this.fetchedEntities.add("client"));
      apiClient.api
        .listClientAvailabilitys()
        .then(response => {
          const grouped = groupBy(response, ca => parseInt(extractId(ca.client)));
          grouped.forEach((value, key) => this.clientAvailabilities.set(key, value));
        })
        .catch(console.log)
        .finally(() => this.fetchedEntities.add("clientAvailability"));
      apiClient.api
        .listLocations()
        .then(response => response.forEach(l => this.locations.set(l.id!, l)))
        .catch(console.log)
        .finally(() => this.fetchedEntities.add("location"));

      apiClient.api
        .listTours()
        .then(response => response.forEach(t => this.tours.set(t.id!, t)))
        .catch(console.log)
        .finally(() => this.fetchedEntities.add("tour"));
      apiClient.api
        .listTourElements()
        .then(response => {
          const grouped = groupBy(response, te => parseInt(extractId(te.tour)));
          grouped.forEach((value, key) => this.tourElements.set(key, value));
        })
        .catch(console.log)
        .finally(() => this.fetchedEntities.add("tourElement"));
    },
  },
});
