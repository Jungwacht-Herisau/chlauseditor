<script lang="ts">
import {defineComponent} from "vue";
import TourTimeline from "@/components/TourTimeline.vue";
import type {Tour} from "@/api";
import {getDayKeyOfTour, getDisplayEndHourOfTour, getDisplayStartHourOfTour} from "@/model_utils";
import TimeRuler from "@/components/TimeRuler.vue";
import {HourRange} from "@/types";

export default defineComponent({
  name: "DayTimeline",
  methods: {getDateKey: getDayKeyOfTour},
  components: {TimeRuler, TourTimeline},
  props: {
    date: {
      type: Date,
    },
    tours: {
      type: Array<Tour>,
    },
  },
  computed: {
    formattedDate() {
      return this.date!.toLocaleDateString();
    },
    range() {
      return new HourRange(
        Math.floor(Math.min(...(this.tours?.map(getDisplayStartHourOfTour) as number[]))),
        Math.ceil(Math.min(...(this.tours?.map(getDisplayEndHourOfTour) as number[]))),
      );
    },
  },
});
</script>

<template>
  <div class="day-timeline">
    <h2>{{ formattedDate }}</h2>
    <div class="tour-wrapper">
      <TourTimeline v-for="t in tours" :key="getDateKey(t)" :tour="t" :range="range" />
    </div>
    <div class="ruler-container">
      <div class="spacer"></div>
      <TimeRuler :range="range" />
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
</style>
