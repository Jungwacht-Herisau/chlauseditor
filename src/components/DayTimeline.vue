<script lang="ts">
import {defineComponent} from "vue";
import TourTimeline from "@/components/TourTimeline.vue";
import type {Client, ClientAvailability, JWler, JWlerAvailability, Tour, TourElement} from "@/api";
import {
  extractId,
  getDayKeyOfClientAvailability,
  getDayKeyOfDate,
  getDayKeyOfTour,
  getDisplayEndHourOfTour,
  getDisplayStartHourOfTour,
  getJwlerAvailabilityOnDay,
} from "@/model_utils";
import TimeRuler from "@/components/TimeRuler.vue";
import {HourRange} from "@/types";
import {useStore} from "@/store";
import ClientLabel from "@/components/ClientLabel.vue";
import {formatDeltaSeconds, formatStartEnd} from "@/util";
import JWlerLabel from "@/components/JWlerLabel.vue";
import CollapsibleContent from "@/components/CollapsibleContent.vue";
import {ObjectType, startDrag} from "@/drag_drop";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import TimelineElement from "@/components/TimelineElement.vue";
import {getClientUrl} from "@/api_url_builder";

type PossibleClientData = {
  client: Client;
  locationString: string;
  availabilityToday: ClientAvailability;
  otherAvailabilities: ClientAvailability[];
};

type PossibleJwlerData = {
  jwler: JWler;
  availability: JWlerAvailability;
};

export default defineComponent({
  name: "DayTimeline",
  components: {
    TimelineElement,
    FontAwesomeIcon,
    CollapsibleContent,
    JWlerLabel,
    ClientLabel,
    TimeRuler,
    TourTimeline,
  },
  props: {
    date: {
      type: Date,
    },
  },
  data() {
    return {
      store: useStore(),
      mounted: false,
      ObjectType,
      draggingTourElement: {} as TourElement,
    };
  },
  mounted() {
    this.mounted = true;
  },
  methods: {
    startDrag,
    formatStartEnd,
    formatDeltaSeconds,
    extractId,
    getDayKeyOfTour,
    addNewTour() {
      this.store.createTour("Neue Tour", this.dayKey);
    },
    startPossibleClientDrag(possibleClient: PossibleClientData, event: DragEvent) {
      startDrag(event, ObjectType.CLIENT, possibleClient.client.id!);
      const endDate = new Date(
        this.rangeStartAsDate.getTime() + parseFloat(possibleClient.client.required_time!) * 1000,
      );
      this.draggingTourElement = {
        tour: "",
        start: this.rangeStartAsDate.toISOString(),
        end: endDate.toISOString(),
        type: "V" as TourElement.type,
        client: getClientUrl(possibleClient.client.id!),
      };

      const imgElement = (
        this.$refs.draggingElementImageContainer as HTMLElement
      ).getElementsByClassName("timeline-element")[0];
      event.dataTransfer!.setDragImage(imgElement, 0, 0);
    },
  },
  watch: {
    tours() {
      console.log(`tours of ${this.dayKey} changed`);
    },
  },
  computed: {
    tours(): Tour[] {
      return this.store.toursByDay.get(this.dayKey)!;
    },
    dayKey() {
      return getDayKeyOfDate(this.date!);
    },
    range() {
      const starts = this.tours.map(getDisplayStartHourOfTour) as number[];
      const ends = this.tours.map(getDisplayEndHourOfTour) as number[];
      if (starts.length == 0 || ends.length == 0) {
        return new HourRange(10, 23);
      }
      return new HourRange(Math.floor(Math.min(...starts)), Math.ceil(Math.max(...ends)));
    },
    rangeStartAsDate() {
      return new Date(this.date!.getTime() + this.range.start * 60 * 60 * 1000);
    },
    possibleClients() {
      const result = [] as PossibleClientData[];
      this.store.clients.forEach((client, clientId) => {
        const avs = this.store.clientAvailabilities.get(clientId)!;
        let avToday = null;
        let otherAvs = [];
        for (let i = 0; i < avs.length; i++) {
          if (getDayKeyOfDate(this.date!) == getDayKeyOfClientAvailability(avs[i])) {
            avToday = avs[i];
          } else {
            otherAvs.push(avs[i]);
          }
        }
        if (avToday != null) {
          const visitLocationId = parseInt(extractId(client.visit_location));
          const location = this.store.locations.get(visitLocationId);
          result.push({
            client: client,
            locationString: location ? location.string : "",
            availabilityToday: avToday,
            otherAvailabilities: otherAvs,
          });
        }
      });
      result.sort((a, b) => a.otherAvailabilities.length - b.otherAvailabilities.length);
      return result;
    },
    possibleJwlers() {
      const jwlerIds = new Set<number>();
      this.store.jwlers.forEach((_, id) => jwlerIds.add(id));
      this.tours.forEach(tour =>
        tour.jwlers
          .map(extractId)
          .map(x => parseInt(x))
          .forEach(id => jwlerIds.delete(id)),
      );
      const result = [] as PossibleJwlerData[];
      jwlerIds.forEach(id => {
        const av = getJwlerAvailabilityOnDay(id, this.dayKey);
        if (av != null) {
          result.push({
            jwler: this.store.jwlers.get(id)!,
            availability: av,
          });
        }
      });
      result.sort((a, b) => a.availability.start.localeCompare(b.availability.start));
      return result;
    },
    timelineWidthPx(): number {
      if (this.mounted) {
        const ruler = (this.$refs.rootElement as HTMLElement).getElementsByClassName(
          "time-ruler",
        )[0];
        return ruler.getBoundingClientRect().width;
      } else {
        return 0;
      }
    },
  },
});
</script>

<template>
  <div class="day-timeline" ref="rootElement">
    <div class="btn-group-sm" role="group">
      <button type="button" class="btn btn-primary" @click="addNewTour">
        <font-awesome-icon icon="plus" />
        Neue Tour
      </button>
    </div>
    <div class="tour-wrapper">
      <TourTimeline v-for="t in tours" :key="t.id" :tour="t" :range="range" />
    </div>
    <div class="ruler-container">
      <div class="spacer"></div>
      <TimeRuler :range="range" />
    </div>
    <CollapsibleContent title="Verfügbar">
      <div class="list-container">
        <div class="client-list">
          <table>
            <thead>
              <tr>
                <th>Nr</th>
                <th>Name</th>
                <th>Addresse</th>
                <th>Dauer</th>
                <th>Besuchbar</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="cl in possibleClients"
                :key="cl.client.id"
                draggable="true"
                @dragstart="event => startPossibleClientDrag(cl, event)"
              >
                <td>{{ cl.client.id }}</td>
                <td>
                  <ClientLabel :client="cl.client" />
                </td>
                <td>{{ cl.locationString }}</td>
                <td>{{ formatDeltaSeconds(parseFloat(cl.client.required_time!)) }}</td>
                <td>
                  <span v-if="cl.otherAvailabilities.length == 0"> Nur heute </span>
                  <span v-else> Heute+{{ cl.otherAvailabilities.length }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="jwler-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Zeit</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="j in possibleJwlers"
                :key="j.jwler.id"
                draggable="true"
                @dragstart="event => startDrag(event, ObjectType.JWLER, j.jwler.id!)"
              >
                <td>
                  <JWlerLabel :jwler="j.jwler" />
                </td>
                <td>{{ formatStartEnd(j.availability) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </CollapsibleContent>
    <div class="offscreen" ref="draggingElementImageContainer">
      <TimelineElement
        :tour-element="draggingTourElement"
        :timeline-width-px="timelineWidthPx"
        :range="range"
      />
    </div>
  </div>
</template>

<style scoped>
.ruler-container {
  display: flex;
  flex-direction: row;
}

.ruler-container .spacer {
  width: calc(2rem + 12rem);
}

.ruler-container .time-ruler {
  flex-grow: 1;
}

.tour-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.list-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}
</style>