<script lang="ts">
import type {PropType} from 'vue'
import {defineComponent} from 'vue'
import {Tour, TourElement, TourElementTypeEnum} from "@/api";
import DiffValueTableRow from "@/components/diff/DiffValueTableRow.vue";
import {useStore} from "@/store";
import ChangedTourHeader from "@/components/diff/ChangedTourHeader.vue";

export default defineComponent({
  name: "TourDiff",
  components: {ChangedTourHeader, DiffValueTableRow},
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
    sumElementTimeS(elements: Array<TourElement>, type: TourElementTypeEnum): number {
      return elements
          .filter(e => e.type == type)
          .map(e => e.end.getTime() - e.start.getTime())
          .map(ms => ms / 1000)
          .reduce((a, b) => a + b, 0);
    },
    getTotalTimeS(elements: Array<TourElement>): number {
      return elements.length == 0
          ? 0
          : (elements[elements.length - 1].end.getTime() - elements[0].start.getTime()) / 1000;
    },
    getTotalBreakTimeS(elements: Array<TourElement>): number {
      if (elements.length == 0) {
        return 0;
      }
      let totalMs = 0;
      let lastEnd = elements[0].start.getTime();
      for (const e of elements) {
        const breakUntil = (e.type == TourElementTypeEnum.B ? e.end : e.start).getTime();
        totalMs += breakUntil - lastEnd;
        lastEnd = e.end.getTime();
      }
      return totalMs / 1000;
    }
  }
})
</script>

<template>
  <ChangedTourHeader :old-name="original.name" :new-name="changed.name"/>
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
        :original-value="getTotalTimeS(originalElements)"
        :changed-value="getTotalTimeS(changedElements)"
        formatter="deltaSeconds"
    />
    <DiffValueTableRow
        attribute-name="∑ Besuche"
        :original-value="sumElementTimeS(originalElements, TourElementTypeEnum.V)"
        :changed-value="sumElementTimeS(changedElements, TourElementTypeEnum.V)"
        formatter="deltaSeconds"
    />
    <DiffValueTableRow
        attribute-name="∑ Fahrt"
        :original-value="sumElementTimeS(originalElements, TourElementTypeEnum.D)"
        :changed-value="sumElementTimeS(changedElements, TourElementTypeEnum.D)"
        formatter="deltaSeconds"
    />
    <DiffValueTableRow
        attribute-name="∑ Pause"
        :original-value="getTotalBreakTimeS(originalElements)"
        :changed-value="getTotalBreakTimeS(changedElements)"
        formatter="deltaSeconds"
    />
  </table>
</template>

<style scoped>
table {
  margin-left: 1rem;
}
</style>