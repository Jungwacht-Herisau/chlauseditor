<script lang="ts">
import DayTimeline from "@/components/DayTimeline.vue";
import {fetchData, store} from "@/store";

export default {
  components: {DayTimeline},
  data() {
    return {
      store: store,
    };
  },
  created() {
    fetchData();
  },
};
</script>

<template>
  <main>
    <DayTimeline
      v-for="(dayTours, dateKey) in store.toursByDay"
      :key="dateKey"
      :date="new Date(dateKey)"
      :tours="dayTours"
    />
  </main>
</template>
