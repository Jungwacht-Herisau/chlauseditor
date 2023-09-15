import type {AnyModelType} from "@/model_utils";
import {
  deepCloneMap,
  deepCloneObject,
  extractIdInt,
  getDayKeyOfClientAvailability,
  getDayKeyOfJwlerAvailability,
  getDayKeyOfTour,
  handleAfterApiDestroy,
  handleIdChangeAfterApiCreate,
} from "@/model_utils";
import type {DayKey} from "@/types";
import type {HasId} from "@/util";
import {groupBy} from "@/util";
import {defineStore} from "pinia";
import {TourElementTypeEnum} from "@/api/models/TourElement";
import {
  ApiException,
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
import {ApiClientFactory} from "@/api_client_factory";
import type {PromiseApiApi} from "@/api/types/PromiseAPI";

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
      const apiClient = ApiClientFactory.getInstance();

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
          .then(eName => console.debug(`successfully fetched ${eName}`))
          .catch(error => {
            console.error("Error while fetching entity: ", error);
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
    async uploadDataChanges(): Promise<[number, string[]]> {
      const apiClient = ApiClientFactory.getInstance();

      const errors = [] as string[];
      let successes = 0;
      const addErrors = (res: PromiseSettledResult<string[]>) => {
        if (res.status == "rejected") {
          throw res.reason;
        } else if (res.value.length > 0) {
          errors.push(...res.value);
        } else {
          ++successes;
        }
      };

      const res0 = await Promise.allSettled([
        this._uploadJWlers(apiClient),
        this._uploadClients(apiClient),
        this._uploadLocations(apiClient),
        this._uploadTours(apiClient),
      ]);
      const res1 = await Promise.allSettled([
        this._uploadJWlerAvailabilities(apiClient),
        this._uploadClientAvailabilities(apiClient),
        this._uploadTourElements(apiClient),
      ]);
      res0.forEach(addErrors);
      res1.forEach(addErrors);

      console.info(successes, errors);
      return [successes, errors];
    },
    _uploadJWlerAvailabilities(apiClient: PromiseApiApi) {
      return this._uploadModelChangeset(
        this.changeset.jwlerAvailabilities,
        obj => apiClient.createJWlerAvailability(obj),
        (id, obj) => apiClient.updateJWlerAvailability(id, obj),
        id => apiClient.destroyJWlerAvailability(i),
      );
    },
    _uploadClientAvailabilities(apiClient: PromiseApiApi) {
      return this._uploadModelChangeset(
        this.changeset.clientAvailabilities,
        obj => apiClient.createClientAvailability(obj),
        (id, obj) => apiClient.updateClientAvailability(id, obj),
        id => apiClient.destroyClientAvailability(i),
      );
    },
    _uploadTourElements(apiClient: PromiseApiApi) {
      return this._uploadModelChangeset(
        this.changeset.tourElements,
        obj => apiClient.createTourElement(obj),
        (id, obj) => apiClient.updateTourElement(id, obj),
        id => apiClient.destroyTourElement(i),
      );
    },
    _uploadTours(apiClient: PromiseApiApi) {
      return this._uploadModelChangeset(
        this.changeset.tours,
        obj => apiClient.createTour(obj),
        (id, obj) => apiClient.updateTour(id, obj),
        id => apiClient.destroyTour(i),
      );
    },
    _uploadLocations(apiClient: PromiseApiApi) {
      return this._uploadModelChangeset(
        this.changeset.locations,
        obj => apiClient.createLocation(obj),
        (id, obj) => apiClient.updateLocation(id, obj),
        id => apiClient.destroyLocation(id),
      );
    },
    _uploadClients(apiClient: PromiseApiApi) {
      return this._uploadModelChangeset(
        this.changeset.clients,
        obj => apiClient.createClient(obj),
        (id, obj) => apiClient.updateClient(id, obj),
        id => apiClient.destroyClient(id),
      );
    },
    _uploadJWlers(apiClient: PromiseApiApi) {
      return this._uploadModelChangeset(
        this.changeset.jwlers,
        obj => apiClient.createJWler(obj),
        (id, obj) => apiClient.updateJWler(id, obj),
        id => apiClient.destroyJWler(id),
      );
    },
    async _uploadModelChangeset<T extends AnyModelType & HasId>(
      changeset: ModelChangeset<T>,
      createFunc: (obj: T) => Promise<T>,
      updateFunc: (id: string, obj: T) => Promise<T>,
      destroyFunc: (id: string) => Promise<void>,
    ) {
      const errors = [] as string[];
      const handleException = (e: any) => {
        if (e instanceof ApiException) {
          const apiExc = e as ApiException<string>;
          return errors.push(apiExc.body);
        } else {
          throw e;
        }
      };

      const idChanges = new Map<T, T>();
      for (const obj of changeset.added) {
        try {
          const newObj = await createFunc(obj);
          if (obj.id != newObj.id) {
            idChanges.set(obj, newObj);
          }
        } catch (e) {
          handleException(e);
        }
      }
      handleIdChangeAfterApiCreate(idChanges);

      for (const obj of changeset.changed) {
        try {
          await updateFunc(obj.id!.toString(), obj);
        } catch (e) {
          handleException(e);
        }
      }

      for (const obj of changeset.removed) {
        try {
          await destroyFunc(obj.id!.toString());
          handleAfterApiDestroy(obj);
        } catch (e) {
          handleException(e);
        }
      }
      return errors;
    },

    _afterFetch() {
      this.originalData._assign(this.data);
    },
  },
});
