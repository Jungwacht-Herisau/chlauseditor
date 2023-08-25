<script lang="ts">
import {defineComponent} from "vue";
import type {PropType} from "vue";
import type {Tour} from "@/api";

export default defineComponent({
  name: "TourTimeline",
  props: {
    tour: {
      type: Object as PropType<Tour>,
    },
  },
  data() {
    return {};
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {},
  },
});
</script>

<template>
  <div class="tour-timeline">
    <h3>{{ tour!.name }}</h3>
  </div>
</template>

<style scoped></style>
