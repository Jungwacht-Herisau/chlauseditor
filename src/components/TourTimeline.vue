<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import type {Tour} from "@/api";
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
  methods: {parseApiDateTime},
});
</script>

<template>
  <div class="container">
    <h3 class="tour-name">{{ tour!.name }}</h3>
    <div class="jwler-name-container">
      <div v-for="(_, i) in jwlers.length" :key="i">
        <JWlerLabel :jwler="jwlers[i]" />
      </div>
    </div>
    <div class="timeline">Timeline {{range!.start}}-{{ range!.end}}</div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
}

.tour-name {
  writing-mode: tb;
  transform: rotate(180deg);
  margin: 0;
  box-sizing: border-box;
  width: 2rem;
}

.jwler-name-container {
  width: 12rem;
}

.jwler-name-container .jwler-label {
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.timeline {
  background-color: antiquewhite;
  flex-grow: 1;
}
</style>
