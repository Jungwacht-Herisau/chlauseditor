<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import type {JWlerAvailability, Tour, TourElement} from "@/api";
import {
  findNewTourElementId,
  getDayKeyOfTour,
  getJwlerAvailabilitiesOfTour,
  getJwlersOfTour,
} from "@/model_utils";
import JWlerLabel from "@/components/JWlerLabel.vue";
import {parseApiDateTime} from "@/util";
import {HourRange} from "@/types";
import {
  allowDrop,
  getDragData,
  getDraggedIdInt,
  getTwoDraggedIds,
  ObjectType,
  startDrag,
} from "@/drag_drop";
import {getClientUrl, getJwlerUrl, getUrl} from "@/api_url_builder";
import {useStore} from "@/store";
import TimelineElement from "@/components/TimelineElement.vue";

export default defineComponent({
  name: "TourTimeline",
  components: {TimelineElement, JWlerLabel},
  props: {
    tour: {
      type: Object as PropType<Tour>,
    },
    range: {
      type: HourRange,
    },
  },
  data() {
    return {
      ObjectType,
      store: useStore(),
    };
  },
  computed: {
    date() {
      return parseApiDateTime(this.tour?.date!);
    },
    jwlers() {
      return getJwlersOfTour(this.tour!);
    },
    availabilities() {
      return getJwlerAvailabilitiesOfTour(this.tour!);
    },
    elements() {
      return this.store.tourElements.get(this.tour!.id!);
    },
    tourId(): number {
      return this.tour!.id!;
    },
  },
  methods: {
    startDrag,
    drop: getDraggedIdInt,
    allowDrop,
    parseApiDateTime,
    calcWidth(availability: JWlerAvailability): string {
      const endFraction = this.range?.calcFraction(parseApiDateTime(availability.end))!;
      const startFraction = this.range?.calcFraction(parseApiDateTime(availability.start))!;
      return (endFraction - startFraction) * 100 + "%";
    },
    dropJwler(event: DragEvent) {
      const dragData = getDragData(event);
      let jwlerId =
        dragData.type == ObjectType.JWLER
          ? getDraggedIdInt(event)
          : parseInt((dragData.id as string).split(";")[1]);
      const jwlerUrl = getJwlerUrl(jwlerId);
      const sameDayTours = this.store.toursByDay.get(getDayKeyOfTour(this.tour!))!;
      const currentTourMutable = this.store.tours.get(this.tour!.id!)!;
      sameDayTours.forEach(to => {
        const idx = to.jwlers.indexOf(jwlerUrl);
        if (idx >= 0) {
          to.jwlers.splice(idx, 1);
        }
      });
      currentTourMutable.jwlers.push(jwlerUrl);
    },
    dropClient(event: DragEvent) {
      const dragData = getDragData(event);
      const dropZoneRect = (this.$refs.dropZone as HTMLElement).getBoundingClientRect();
      const x = (event.clientX - dragData.cursorOffsetX - dropZoneRect.left) / dropZoneRect.width;
      const hourStart = this.range!.start + x * this.range!.span();
      const todayMorning = new Date(this.tour!.date);
      const start = new Date(todayMorning.getTime() + hourStart * 60 * 60 * 1000);
      if (dragData.type == ObjectType.CLIENT) {
        const clientId = getDraggedIdInt(event);
        const durationSecs = parseFloat(this.store.clients.get(clientId)!.required_time!);
        const end = new Date(start.getTime() + durationSecs * 1000);
        const newElement: TourElement = {
          id: findNewTourElementId(),
          tour: getUrl("tour", this.tourId),
          start: start.toISOString(),
          end: end.toISOString(),
          type: "V" as TourElement.type,
          client: getClientUrl(clientId),
        };
        if (this.store.tourElements.has(this.tourId)) {
          this.store.tourElements.get(this.tourId)!.push(newElement);
        } else {
          this.store.tourElements.set(this.tourId, [newElement]);
        }
      } else if (dragData.type == ObjectType.TOUR_ELEMENT) {
        const [oldTourId, elementId] = getTwoDraggedIds(event);
        const element = this.store.tourElements.get(oldTourId)!.find(te => te.id == elementId)!;
        if (oldTourId != this.tourId) {
          this.store.tourElements.set(
            oldTourId,
            this.store.tourElements.get(oldTourId)!.filter(te => te.id != elementId),
          );
          if (this.store.tourElements.has(this.tourId)) {
            this.store.tourElements.get(this.tourId)!.push(element);
          } else {
            this.store.tourElements.set(this.tourId, [element]);
          }
          element.tour = getUrl("tour", this.tourId);
        }
        const durationMs =
          parseApiDateTime(element.end).getTime() - parseApiDateTime(element.start).getTime();
        element.start = start.toISOString();
        element.end = new Date(start.getTime() + durationMs).toISOString();
      }
    },
  },
});
</script>

<template>
  <div class="tour-timeline">
    <h5 class="tour-name">{{ tour!.name }}</h5>
    <div
      class="jwler-name-container"
      @dragover="event => allowDrop(event, ObjectType.JWLER, ObjectType.ASSIGNED_JWLER)"
      @drop="event => dropJwler(event)"
    >
      <div
        v-for="(_, i) in jwlers.length"
        :key="i"
        draggable="true"
        @dragstart="
          event => startDrag(event, ObjectType.ASSIGNED_JWLER, `${tourId};${jwlers[i].id!}`)
        "
      >
        <JWlerLabel :jwler="jwlers[i]" />
      </div>
    </div>
    <div class="timeline">
      <div class="jwler-availability">
        <div
          v-for="av in availabilities"
          :key="av.jwler"
          :style="{
            'margin-left': range?.calcPercentage(parseApiDateTime(av.start)),
            width: calcWidth(av),
          }"
        ></div>
      </div>
      <div
        @dragover="event => allowDrop(event, ObjectType.CLIENT, ObjectType.TOUR_ELEMENT)"
        @drop="event => dropClient(event)"
        ref="dropZone"
        class="drop-zone"
      ></div>
      <TimelineElement v-for="e in elements" :key="e.id" :tour-element="e" :range="range" />
    </div>
  </div>
</template>

<style scoped>
.tour-timeline {
  display: flex;
  flex-direction: row;
  height: var(--tour-timeline-height);
}

.tour-timeline:not(:last-child) {
  border-bottom: none;
}

.tour-name {
  writing-mode: tb;
  transform: rotate(180deg);
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  width: var(--tour-name-width);
}

.jwler-name-container {
  width: var(--tour-jwler-width);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.jwler-name-container .jwler-label {
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin: 0;
  height: 2rem;
}

.timeline {
  background-color: antiquewhite;
  width: var(--tour-timeline-width);

  display: grid;
}

.timeline * {
  grid-column: 1;
  grid-row: 1;
}

.timeline .jwler-availability {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.jwler-availability div {
  flex-grow: 1;
  background-color: palegreen;
}

.drop-zone {
  /*pointer-events: none;*/
}
</style>