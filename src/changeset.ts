import type {StateData} from "@/store";
import type {AnyModelType} from "@/model_utils";
import {modelEquals} from "@/model_utils";
import {flattenMapToArray, mapEntryDiff} from "@/util";
import {Client, ClientAvailability, JWler, JWlerAvailability, Location, Tour, TourElement} from "@/api";

export class Changeset {
  jwlers: ModelChangeset<JWler>;
  jwlerAvailabilities: ModelChangeset<JWlerAvailability>;
  clients: ModelChangeset<Client>;
  clientAvailabilities: ModelChangeset<ClientAvailability>;
  locations: ModelChangeset<Location>;
  tours: ModelChangeset<Tour>;
  tourElements: ModelChangeset<TourElement>;

  constructor(original: StateData, changed: StateData) {
    this.jwlers = new ModelChangeset<JWler>(original.jwlers, changed.jwlers);
    this.jwlerAvailabilities = new ModelChangeset<JWlerAvailability>(
      flattenMapToArray(original.jwlerAvailabilities),
      flattenMapToArray(changed.jwlerAvailabilities),
    );
    this.clients = new ModelChangeset<Client>(original.clients, changed.clients);
    this.clientAvailabilities = new ModelChangeset<ClientAvailability>(
      flattenMapToArray(original.clientAvailabilities),
      flattenMapToArray(changed.clientAvailabilities),
    );
    this.locations = new ModelChangeset<Location>(original.locations, changed.locations);
    this.tours = new ModelChangeset<Tour>(original.tours, changed.tours);
    this.tourElements = new ModelChangeset<TourElement>(
      flattenMapToArray(original.tourElements),
      flattenMapToArray(changed.tourElements),
    );
  }
}

export class ModelChangeset<T extends AnyModelType> {
  added: T[];
  changed: T[];
  removed: T[];

  constructor(original: Map<number, T>, changed: Map<number, T>) {
    const [added, possiblyChanged, removed] = mapEntryDiff(original, changed);
    this.added = added;
    this.changed = possiblyChanged.filter(pair => !modelEquals(pair[0], pair[1])).map(pair => pair[1]);
    this.removed = removed;
  }
}
