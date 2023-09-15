import type {AnyModelType} from "@/model/model_utils";
import {handleAfterApiDestroy, handleIdChangeAfterApiCreate} from "@/model/model_utils";
import type {HasId} from "@/util";
import {Changeset, ModelChangeset} from "@/model/changeset";
import {ApiException, Client, ClientAvailability, JWler, JWlerAvailability, Location, Tour, TourElement} from "@/api";
import {PromiseApiApi} from "@/api/types/PromiseAPI";
import {ApiClientFactory} from "@/api_client_factory";

export class StoreUploader {
  static async upload(changeset: Changeset): Promise<[number, string[]]> {
    const apiClient = ApiClientFactory.getInstance();

    const res0 = await Promise.allSettled([
      StoreUploader.uploadJWlers(apiClient, changeset.jwlers),
      StoreUploader.uploadClients(apiClient, changeset.clients),
      StoreUploader.uploadLocations(apiClient, changeset.locations),
      StoreUploader.uploadTours(apiClient, changeset.tours),
    ]);
    const res1 = await Promise.allSettled([
      StoreUploader.uploadJWlerAvailabilities(apiClient, changeset.jwlerAvailabilities),
      StoreUploader.uploadClientAvailabilities(apiClient, changeset.clientAvailabilities),
      StoreUploader.uploadTourElements(apiClient, changeset.tourElements),
    ]);

    let successes = 0;
    const errors = [] as string[];
    for (const res of [...res0, ...res1]) {
      if (res.status == "rejected") {
        throw res.reason;
      } else if (res.value.length > 0) {
        errors.push(...res.value);
      } else {
        ++successes;
      }
    }

    console.info(successes, errors);
    return [successes, errors];
  }

  static uploadJWlerAvailabilities(apiClient: PromiseApiApi, changeset: ModelChangeset<JWlerAvailability>) {
    return this._uploadModelChangeset(
      changeset,
      obj => apiClient.createJWlerAvailability(obj),
      (id, obj) => apiClient.updateJWlerAvailability(id, obj),
      id => apiClient.destroyJWlerAvailability(id),
    );
  }

  static uploadClientAvailabilities(apiClient: PromiseApiApi, changeset: ModelChangeset<ClientAvailability>) {
    return this._uploadModelChangeset(
      changeset,
      obj => apiClient.createClientAvailability(obj),
      (id, obj) => apiClient.updateClientAvailability(id, obj),
      id => apiClient.destroyClientAvailability(id),
    );
  }

  static uploadTourElements(apiClient: PromiseApiApi, changeset: ModelChangeset<TourElement>) {
    return this._uploadModelChangeset(
      changeset,
      obj => apiClient.createTourElement(obj),
      (id, obj) => apiClient.updateTourElement(id, obj),
      id => apiClient.destroyTourElement(id),
    );
  }

  static uploadTours(apiClient: PromiseApiApi, changeset: ModelChangeset<Tour>) {
    return this._uploadModelChangeset(
      changeset,
      obj => apiClient.createTour(obj),
      (id, obj) => apiClient.updateTour(id, obj),
      id => apiClient.destroyTour(id),
    );
  }

  static uploadLocations(apiClient: PromiseApiApi, changeset: ModelChangeset<Location>) {
    return this._uploadModelChangeset(
      changeset,
      obj => apiClient.createLocation(obj),
      (id, obj) => apiClient.updateLocation(id, obj),
      id => apiClient.destroyLocation(id),
    );
  }

  static uploadClients(apiClient: PromiseApiApi, changeset: ModelChangeset<Client>) {
    return this._uploadModelChangeset(
      changeset,
      obj => apiClient.createClient(obj),
      (id, obj) => apiClient.updateClient(id, obj),
      id => apiClient.destroyClient(id),
    );
  }

  static uploadJWlers(apiClient: PromiseApiApi, changeset: ModelChangeset<JWler>) {
    return this._uploadModelChangeset(
      changeset,
      obj => apiClient.createJWler(obj),
      (id, obj) => apiClient.updateJWler(id, obj),
      id => apiClient.destroyJWler(id),
    );
  }

  static async _uploadModelChangeset<T extends AnyModelType & HasId>(
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
  }
}
