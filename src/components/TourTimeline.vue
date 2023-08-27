<script lang="ts">
import type {PropType} from "vue";
import {defineComponent, reactive} from "vue";
import type {JWlerAvailability, Tour} from "@/api";
import {getDayKeyOfTour, getJwlerAvailabilitiesOfTour, getJwlersOfTour} from "@/model_utils";
import JWlerLabel from "@/components/JWlerLabel.vue";
import {parseApiDateTime} from "@/util";
import {HourRange} from "@/types";
import {allowDrop, drop, ObjectType, startDrag} from "@/drag_drop";
import {getJwlerUrl} from "@/api_url_builder";
import {useStore} from "@/store";

export default defineComponent({
  name: "TourTimeline",
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
  },
  components: {JWlerLabel},
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
  created() {},
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
    <h3 class="tour-name">{{ tour!.name }}</h3>
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
    </div>
  </div>
</template>

<style scoped>
.tour-timeline {
  display: flex;
  flex-direction: row;
  height: 8rem;
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
  width: 2rem;
}

.jwler-name-container {
  width: 12rem;
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
  flex-grow: 1;

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
