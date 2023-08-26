<script lang="ts">
import DayTimeline from "@/components/DayTimeline.vue";
import {fetchData, store} from "@/store";
import AnimatedSpinner from "@/components/AnimatedSpinner.vue";
import CollapsibleContent from "@/components/CollapsibleContent.vue";

export default {
  components: {CollapsibleContent, AnimatedSpinner, DayTimeline},
  data() {
    return {
      store: store,
    };
  },
  created() {
    fetchData();
  },
  computed: {
    dataReady() {
      return (
        Object.keys(store.locations).length > 0 &&
        store.days.length > 0 &&
        Object.keys(store.clients).length > 0 &&
        Object.keys(store.clientAvailabilities).length > 0 &&
        Object.keys(store.jwlers).length > 0 &&
        Object.keys(store.jwlerAvailabilities).length > 0 &&
        Object.keys(store.toursByDay).length > 0
      );
    },
  },
};
</script>

<template>
  <main v-if="dataReady">
    <CollapsibleContent
      v-for="dateKey in store.days"
      :key="dateKey"
      :title="new Date(dateKey).toLocaleDateString()"
      header-tag="h2"
    >
      <DayTimeline :date="new Date(dateKey)" :tours="store.toursByDay[dateKey]" />
    </CollapsibleContent>
  </main>
  <div v-else id="spinner-container">
    <AnimatedSpinner />
  </div>
</template>

<style scoped>
#spinner-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
}

#spinner-container .animated-spinner {
  margin: auto;
}
</style>
