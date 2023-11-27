<script lang="ts">
import DayTimeline from "@/components/DayTimeline.vue";
import {useStore} from "@/model/store";
import CollapsibleContent from "@/components/CollapsibleContent.vue";
import {allowDropDeletableElements, deleteDroppedElement} from "@/drag_drop";

export default {
  components: {CollapsibleContent, DayTimeline},

  data() {
    return {
      store: useStore(),
    };
  },
  mounted() {
    console.log("TimelineView mounted");
  },
  methods: {
    deleteDroppedElement,
    allowDropDeletableElements,
  },
  watch: {},
};
</script>

<template>
  <main
    v-if="store.fetchingProgress.finished()"
    @dragover="event => allowDropDeletableElements(event)"
    @drop="event => deleteDroppedElement(event)"
  >
    <CollapsibleContent
      v-for="dateKey in store.days"
      :key="dateKey"
      :title="new Date(dateKey).toLocaleDateString()"
      header-tag="h2"
    >
      <DayTimeline :date="new Date(dateKey)" />
    </CollapsibleContent>
  </main>
</template>

<style scoped></style>