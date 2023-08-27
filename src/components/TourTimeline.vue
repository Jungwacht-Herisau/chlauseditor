<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import type {JWlerAvailability, Tour} from "@/api";
import {getDayKeyOfTour, getJwlerAvailabilitiesOfTour, getJwlersOfTour} from "@/model_utils";
import JWlerLabel from "@/components/JWlerLabel.vue";
import {parseApiDateTime} from "@/util";
import {HourRange} from "@/types";
import {allowDrop, drop, ObjectType, startDrag} from "@/drag_drop";
import {getJwlerUrl} from "@/api_url_builder";
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
  },
  methods: {
    startDrag,
    drop,
    allowDrop,
    parseApiDateTime,
    calcWidth(availability: JWlerAvailability): string {
      const endFraction = this.range?.calcFraction(parseApiDateTime(availability.end))!;
      const startFraction = this.range?.calcFraction(parseApiDateTime(availability.start))!;
      return (endFraction - startFraction) * 100 + "%";
    },
    addJwler(id: number) {
      const jwlerUrl = getJwlerUrl(id);
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
  },
});
</script>

<template>
  <div class="tour-timeline">
    <h5 class="tour-name">{{ tour!.name }}</h5>
    <div
      class="jwler-name-container"
      @dragover="event => allowDrop(event, ObjectType.JWLER)"
      @drop="event => addJwler(drop(event) as number)"
    >
      <div
        v-for="(_, i) in jwlers.length"
        :key="i"
        draggable="true"
        @dragstart="event => startDrag(event, ObjectType.JWLER, jwlers[i].id!)"
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
      <TimelineElement v-for="e in elements" :key="e.id" :tour-element="e" />
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
</style>