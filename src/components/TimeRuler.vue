<script lang="ts">
import {defineComponent} from "vue";
import {HourRange} from "@/types";
import {formatHours} from "@/util";

export default defineComponent({
  name: "TimeRuler",
  props: {
    range: {
      type: HourRange,
    },
  },
  data() {
    const ticks = [] as number[];
    for (let i = this.range?.start!; i <= this.range?.end!; i++) {
      ticks.push(i);
      if (ticks.length > 24) {
        throw `invalid props ${this.range?.start} ${this.range?.end}`;
      }
    }
    return {
      ticks: ticks,
    };
  },
  methods: {
    formatHours,
    getTextAlignment(time: number): string {
      switch (time) {
        case this.range?.start:
          return "start";
        case this.range?.end:
          return "end";
        default:
          return "middle";
      }
    },
  },
});
</script>

<template>
  <svg class="time-ruler">
    <line x1="0%" y1="0%" x2="100%" y2="0%" stroke="black" />
    <g v-for="t in ticks" :key="t">
      <line
        y1="0%"
        y2="50%"
        :x1="range?.calcPercentage(t)"
        :x2="range?.calcPercentage(t)"
        stroke="black"
      />
      <line
        v-for="q in 3"
        :key="q"
        y1="0%"
        y2="25%"
        :x1="range?.calcPercentage(t + q / 4)"
        :x2="range?.calcPercentage(t + q / 4)"
        stroke="black"
      />

      <text :text-anchor="getTextAlignment(t)" :x="range?.calcPercentage(t)" y="100%">
        {{ formatHours(t) }}
      </text>
    </g>
  </svg>
</template>

<style scoped>
svg {
  height: 2rem;
  fill: var(--bs-body-color);
  margin-top: 2px;
}

line {
  stroke: var(--bs-body-color);
}
</style>