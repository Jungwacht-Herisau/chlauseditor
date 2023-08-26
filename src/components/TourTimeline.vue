<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import type {JWlerAvailability, Tour} from "@/api";
import {getJwlerAvailabilitiesOfTour, getJwlersOfTour} from "@/model_utils";
import JWlerLabel from "@/components/JWlerLabel.vue";
import {parseApiDateTime} from "@/util";
import {HourRange} from "@/types";

export default defineComponent({
  name: "TourTimeline",
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
      date: parseApiDateTime(this.tour?.date!),
      jwlers: getJwlersOfTour(this.tour!),
      availabilities: getJwlerAvailabilitiesOfTour(this.tour!),
    };
  },
  created() {},
  methods: {
    parseApiDateTime,
    calcWidth(availability: JWlerAvailability): string {
      const endFraction = this.range?.calcFraction(parseApiDateTime(availability.end))!;
      const startFraction = this.range?.calcFraction(parseApiDateTime(availability.start))!;
      return (endFraction - startFraction) * 100 + "%";
    },
  },
});
</script>

<template>
  <div class="tour-timeline">
    <h3 class="tour-name">{{ tour!.name }}</h3>
    <div class="jwler-name-container">
      <div v-for="(_, i) in jwlers.length" :key="i">
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
        >
        </div>
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
