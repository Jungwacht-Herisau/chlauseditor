<script lang="ts">
import DayTimeline from "@/components/DayTimeline.vue";
import {useStore} from "@/store";
import AnimatedSpinner from "@/components/AnimatedSpinner.vue";
import CollapsibleContent from "@/components/CollapsibleContent.vue";

export default {
  components: {CollapsibleContent, AnimatedSpinner, DayTimeline},
  data() {
    return {
      store: useStore(),
    };
  },
  created() {
    this.store.fetchData();
  },
  computed: {
    dataReady() {
      return (
        this.store.locations.size > 0 &&
        this.store.days.length > 0 &&
        this.store.clients.size > 0 &&
        this.store.clientAvailabilities.size > 0 &&
        this.store.jwlers.size > 0 &&
        this.store.jwlerAvailabilities.size > 0 &&
        this.store.toursByDay.size > 0
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
      <DayTimeline :date="new Date(dateKey)" />
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
