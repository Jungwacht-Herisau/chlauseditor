<script lang="ts">
import DayTimeline from "@/components/DayTimeline.vue";
import {ApiClient} from "@/api";
import type {Tour} from "@/api";
import {inject} from "vue";
import {sortAndUnique} from "@/util";
import {getDateKey} from "@/model_utils";

type DayKey = string;
export default {
  components: {DayTimeline},
  data() {
    return {
      days: [] as DayKey[],
      toursByDay: {} as Record<DayKey, Tour[]>,
    };
  },
  created() {
    const apiClient: ApiClient = inject("api")!;
    apiClient.api.listTours().then(tours => {
      this.days = sortAndUnique(tours.map(t => getDateKey(t)));
      this.days.forEach(d => (this.toursByDay[d] = []));
      tours.forEach(t => {
        this.toursByDay[getDateKey(t)].push(t);
      });
    });
  },
};
</script>

<template>
  <main>
    <DayTimeline
      v-for="(dayTours, dateKey) in toursByDay"
      :key="dateKey"
      :date="new Date(dateKey)"
      :tours="dayTours"
    />
  </main>
</template>
