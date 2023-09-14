import type {AnyModelType} from "@/model_utils";
import {
  deepCloneMap,
  deepCloneObject,
  extractIdInt,
  getDayKeyOfClientAvailability,
  getDayKeyOfJwlerAvailability,
  getDayKeyOfTour,
} from "@/model_utils";
import type {DayKey} from "@/types";
import type {HasId} from "@/util";
import {groupBy} from "@/util";
import {defineStore} from "pinia";
import {inject} from "vue";
import type {PromiseApiApi} from "@/api/types/PromiseAPI";
import {TourElementTypeEnum} from "@/api/models/TourElement";
import {
  Client,
  ClientAvailability,
  DrivingTimeMatrix,
  JWler,
  JWlerAvailability,
  Location,
  Tour,
  TourElement,
} from "@/api";
import {Changeset, ModelChangeset} from "@/changeset";

class FetchingProgress {
  total: number = -1;
  fetched: number = 0;

  progressFraction() {
    return this.fetched / this.total;
  }

  finished() {
    return this.fetched >= this.total;
  }
}

export class StateData {
  jwlers = new Map<number, JWler>();
  jwlerAvailabilities = new Map<number, JWlerAvailability[]>();
  clients = new Map<number, Client>();
  clientAvailabilities = new Map<number, ClientAvailability[]>();
  locations = new Map<number, Location>();
  tours = new Map<number, Tour>();
  tourElements = new Map<number, TourElement[]>();
  baseLocation = {} as Location;
  drivingTimeMatrix = {} as DrivingTimeMatrix;

  constructor() {}

  countVisits() {
    let sum = 0;
    this.tourElements.forEach(elements => {
      sum += elements.filter(e => e.type == TourElementTypeEnum.V).length;
    });
    return sum;
  }

  getTotalDriveTimeS() {
    let sum = 0;
    this.tourElements.forEach(elements => {
      elements
        .filter(e => e.type == TourElementTypeEnum.D)
        .forEach(drive => {
          sum += (drive.end.getTime() - drive.start.getTime()) / 1000;
        });
    });
    return sum;
  }

  getUnassignedClients(): Map<number, Client> {
    const result = new Map<number, Client>();
    this.clients.forEach((value, key) => result.set(key, value));
    this.tours.forEach(t => {
      const elements = this.tourElements.get(t.id!);
      if (elements != undefined) {
        elements!.forEach(te => {
          if (te.client != null) {
            result.delete(extractIdInt(te.client));
          }
        });
      }
    });
    return result;
  }

  _assign(other: StateData) {
    this.jwlers = deepCloneMap(other.jwlers);
    this.jwlerAvailabilities = deepCloneMap(other.jwlerAvailabilities);
    this.clients = deepCloneMap(other.clients);
    this.clientAvailabilities = deepCloneMap(other.clientAvailabilities);
    this.locations = deepCloneMap(other.locations);
    this.tours = deepCloneMap(other.tours);
    this.tourElements = deepCloneMap(other.tourElements);
    this.baseLocation = deepCloneObject(other.baseLocation);
    this.drivingTimeMatrix = deepCloneObject(other.drivingTimeMatrix);
  }
}

export const useStore = defineStore("data", {
  state: () => {
    return {
      data: new StateData(),
      originalData: new StateData(),

      fetchingProgress: new FetchingProgress(),
    };
  },
  getters: {
    days() {
      const newDays = new Set<DayKey>();
      this.data.jwlerAvailabilities.forEach(avs => avs.forEach(av => newDays.add(getDayKeyOfJwlerAvailability(av))));
      this.data.clientAvailabilities.forEach(avs => avs.forEach(av => newDays.add(getDayKeyOfClientAvailability(av))));
      return [...newDays].sort();
    },
    toursByDay() {
      const toursByDay = new Map<DayKey, Tour[]>();
      this.days.forEach(d => toursByDay.set(d, []));
      this.data.tours.forEach(t => toursByDay.get(getDayKeyOfTour(t))!.push(t));
      return toursByDay;
    },
    unassignedClients(): Map<number, Client> {
      return this.data.getUnassignedClients();
    },
    changeset(): Changeset {
      console.warn("calc changeset");
      return new Changeset(this.originalData, this.data);
    },
  },
  actions: {
    fetchData() {
      const apiClient = inject("apiClient") as PromiseApiApi;

      const fetchers = [
        [
          () =>
            apiClient
              .listJWlers()
              .then(response => response.forEach(j => this.data.jwlers.set(j.id!, j)))
              .then(() => "jwlers"),
        ],
        [
          () =>
            apiClient
              .listJWlerAvailabilitys()
              .then(response => {
                const grouped = groupBy(response, ja => extractIdInt(ja.jwler));
                grouped.forEach((value, key) => this.data.jwlerAvailabilities.set(key, value));
              })
              .then(() => "jwlerAvailabilities"),
        ],
        [
          () =>
            apiClient
              .listClients()
              .then(response => response.forEach(c => this.data.clients.set(c.id!, c)))
              .then(() => "clients"),
        ],
        [
          () =>
            apiClient
              .listClientAvailabilitys()
              .then(response => {
                const grouped = groupBy(response, ca => extractIdInt(ca.client));
                grouped.forEach((value, key) => this.data.clientAvailabilities.set(key, value));
              })
              .then(() => "clientAvailabilities"),
        ],
        [
          () =>
            apiClient
              .listLocations()
              .then(response => {
                response.forEach(l => this.data.locations.set(l.id!, l));
              })
              .then(() => "locations"),
          () => {
            const locationsCSV = Array.from(this.data.locations.keys())
              .sort((a, b) => a - b)
              .join(";");
            return apiClient
              .retrieveDrivingTimeMatrix(locationsCSV)
              .then(response => (this.data.drivingTimeMatrix = response))
              .then(() => "drivingTimeMatrix");
          },
        ],
        [
          () =>
            apiClient
              .listTours()
              .then(response => response.forEach(t => this.data.tours.set(t.id!, t)))
              .then(() => "tours"),
        ],
        [
          () =>
            apiClient
              .listTourElements()
              .then(response => {
                const grouped = groupBy(response, te => extractIdInt(te.tour));
                grouped.forEach((value, key) => this.data.tourElements.set(key, value));
              })
              .then(() => "tourElements"),
        ],
        [
          () =>
            apiClient
              .baseLocation()
              .then(response => (this.data.baseLocation = response))
              .then(() => "baseLocation"),
        ],
      ];
      this.fetchingProgress.total = fetchers.map(arr => arr.length).reduce((a, b) => a + b, 0);
      const runFunc = (progress: FetchingProgress, funcs: Array<() => Promise<any>>, i: number) => {
        funcs[i]()
          .then(eName => console.log(`successfully fetched ${eName}`))
          .catch(error => {
            console.log("Error while fetching entity: ", error);
          })
          .finally(() => {
            if (funcs.length > i + 1) {
              runFunc(progress, funcs, i + 1);
            }
            progress.fetched += 1;
            if (progress.finished()) {
              this._afterFetch();
            }
          });
      };
      fetchers.forEach(farr => runFunc(this.fetchingProgress, farr, 0));
    },
    uploadDataChanges() {
      const apiClient = inject("apiClient") as PromiseApiApi;

      const stage0promises = [
        ...this._uploadModelChangeset(
          this.changeset.jwlerAvailabilities,
          apiClient.createJWlerAvailability,
          apiClient.updateJWlerAvailability,
          apiClient.destroyJWlerAvailability,
        ),
        ...this._uploadModelChangeset(
          this.changeset.clientAvailabilities,
          apiClient.createClientAvailability,
          apiClient.updateClientAvailability,
          apiClient.destroyClientAvailability,
        ),
        ...this._uploadModelChangeset(
          this.changeset.tourElements,
          apiClient.createTourElement,
          apiClient.updateTourElement,
          apiClient.destroyTourElement,
        ),
      ];

      Promise.allSettled(stage0promises).then(result => {
        console.log(result); //todo error handling
        const stage1promises = [
          ...this._uploadModelChangeset(
            this.changeset.jwlers,
            apiClient.createJWler,
            apiClient.updateJWler,
            apiClient.destroyJWler,
          ),
          ...this._uploadModelChangeset(
            this.changeset.clients,
            apiClient.createClient,
            apiClient.updateClient,
            apiClient.destroyClient,
          ),
          ...this._uploadModelChangeset(
            this.changeset.locations,
            apiClient.createLocation,
            apiClient.updateLocation,
            apiClient.destroyLocation,
          ),
          ...this._uploadModelChangeset(
            this.changeset.tours,
            apiClient.createTour,
            apiClient.updateTour,
            apiClient.destroyTour,
          ),
        ];
        Promise.allSettled(stage1promises).then(result => {
          //todo error handling
          console.log(result);
        });
      });
    },
    _uploadModelChangeset<T extends AnyModelType & HasId>(
      changeset: ModelChangeset<T>,
      createFunc: (obj: T) => Promise<any>,
      updateFunc: (id: string, obj: T) => Promise<any>,
      destroyFunc: (id: string) => Promise<any>,
    ) {
      return [
        ...changeset.added.map(obj => createFunc(obj)),
        ...changeset.changed.map(obj => updateFunc(obj.id!.toString(), obj)),
        ...changeset.removed.map(obj => destroyFunc(obj.id!.toString())),
      ];
    },

    _afterFetch() {
      this.originalData._assign(this.data);
    },
  },
});
