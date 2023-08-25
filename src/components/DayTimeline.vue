<script lang="ts">
import {defineComponent} from "vue";
import TourTimeline from "@/components/TourTimeline.vue";
import type {Tour} from "@/api";
import {getDateKey} from "@/model_utils";

export default defineComponent({
  name: "DayTimeline",
  methods: {getDateKey},
  components: {TourTimeline},
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
  },
});
</script>

<template>
  <div class="day-timeline">
    <h2>{{ formattedDate }}</h2>
    <TourTimeline v-for="t in tours" :key="getDateKey(t)" :tour="t" />
  </div>
</template>

<style scoped></style>
