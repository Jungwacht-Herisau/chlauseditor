<script lang="ts">
import type {PropType} from 'vue'
import {defineComponent} from 'vue'
import {Tour, TourElement, TourElementTypeEnum} from "@/api";
import DiffValueTableRow from "@/components/diff/DiffValueTableRow.vue";
import {useStore} from "@/store";

export default defineComponent({
  name: "TourDiff",
  components: {DiffValueTableRow},
  props: {
    original: {
      type: Object as PropType<Tour>,
      required: true,
    },
    changed: {
      type: Object as PropType<Tour>,
      required: true,
    },
  },
  computed: {
    TourElementTypeEnum() {
      return TourElementTypeEnum
    },
    originalElements() {
      return useStore().originalData.tourElements.get(this.original.id!) ?? [];
    },
    changedElements() {
      return useStore().data.tourElements.get(this.changed.id!) ?? [];
    },
  },
  methods: {
    sumElementTimeH(elements: Array<TourElement>, type: TourElementTypeEnum): number {
      return elements
          .filter(e => e.type == type)
          .map(e => e.end.getTime() - e.start.getTime())
          .map(ms => ms / (1000 * 60 * 60))
          .reduce((a, b) => a + b, 0);
    },
    getTotalTimeH(elements: Array<TourElement>): number {
      return elements.length == 0
          ? 0
          : (elements[elements.length - 1].end.getTime() - elements[0].start.getTime()) / (1000 * 60 * 60);
    },
    getTotalBreakTimeH(elements: Array<TourElement>): number {
      if (elements.length == 0) {
        return 0;
      }
      let totalMs = 0;
      let lastEnd = elements[0].start.getTime();
      elements.forEach(e => {
        const breakUntil = (e.type == TourElementTypeEnum.B ? e.end : e.start).getTime();
        totalMs += lastEnd - breakUntil;
        lastEnd = e.end.getTime();
      });
      return totalMs / (1000 * 60 * 60);
    }
  }
})
</script>

<template>
  <h5 v-if="original.name!==changed.name">
    <span class="removed-text">{{ original.name }}</span>
    <span class="added-text">{{ changed.name }}</span>
  </h5>
  <h5 v-else>{{ original.name }}</h5>
  <table class="table">
    <thead>
    <tr>
      <th></th>
      <th>Original</th>
      <th>Aktuell</th>
    </tr>
    </thead>
    <DiffValueTableRow
        attribute-name="Anzahl Besuche"
        :original-value="originalElements.filter(e => e.type==TourElementTypeEnum.V).length"
        :changed-value="changedElements.filter(e => e.type==TourElementTypeEnum.V).length"
    />
    <DiffValueTableRow
        attribute-name="Gesamtzeit"
        :original-value="getTotalTimeH(originalElements)"
        :changed-value="getTotalTimeH(changedElements)"
    />
    <DiffValueTableRow
        attribute-name="∑ Besuche"
        :original-value="sumElementTimeH(originalElements, TourElementTypeEnum.V)"
        :changed-value="sumElementTimeH(changedElements, TourElementTypeEnum.V)"
    />
    <DiffValueTableRow
        attribute-name="∑ Fahrt"
        :original-value="sumElementTimeH(originalElements, TourElementTypeEnum.D)"
        :changed-value="sumElementTimeH(changedElements, TourElementTypeEnum.D)"
    />
    <DiffValueTableRow
        attribute-name="∑ Pause"
        :original-value="getTotalBreakTimeH(originalElements)"
        :changed-value="getTotalBreakTimeH(changedElements)"
    />
  </table>
</template>

<style scoped>

</style>