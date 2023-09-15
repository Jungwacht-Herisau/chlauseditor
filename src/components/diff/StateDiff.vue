<script lang="ts">
import {defineComponent} from "vue";
import {StateData, useStore} from "@/model/store";
import DiffValueTableRow from "@/components/diff/DiffValueTableRow.vue";
import {formatDeltaSeconds} from "@/util";
import CollectionDiff from "@/components/diff/CollectionDiff.vue";
import TourDiff from "@/components/diff/TourDiff.vue";
import {modelEquals} from "@/model/model_utils";
import ChangedTourHeader from "@/components/diff/ChangedTourHeader.vue";
import CollapsibleContent from "@/components/CollapsibleContent.vue";
import ChangesetDiff from "@/components/diff/ChangesetDiff.vue";

export default defineComponent({
  name: "StateDiff",
  components: {ChangesetDiff, CollapsibleContent, ChangedTourHeader, TourDiff, CollectionDiff, DiffValueTableRow},
  data() {
    return {
      store: useStore(),
    };
  },
  methods: {
    formatDeltaSeconds,
    getUnassignedClientNames(data: StateData) {
      return Array.from(data.getUnassignedClients().values()).map(cl => cl.firstName + " " + cl.lastName);
    },
  },
  computed: {
    originalData() {
      return this.store.originalData;
    },
    changedData() {
      return this.store.data;
    },
    changedTours() {
      let pairs = Array.from(this.store.originalData.tours.keys())
        .filter(id => this.store.data.tours.has(id))
        .map(id => [this.store.originalData.tours.get(id)!, this.store.data.tours.get(id)!]);
      return pairs.filter(pair => !modelEquals(pair[0], pair[1]));
    },
    addedTours() {
      return Array.from(this.store.data.tours.values()).filter(t => !this.store.originalData.tours.has(t.id!));
    },
    removedTours() {
      return Array.from(this.store.originalData.tours.values()).filter(t => !this.store.data.tours.has(t.id!));
    },
  },
});
</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th></th>
        <th>Original</th>
        <th>Aktuell</th>
      </tr>
    </thead>
    <DiffValueTableRow
      attribute-name="Anzahl Touren"
      :original-value="originalData.tours.size"
      :changed-value="changedData.tours.size"
    />
    <DiffValueTableRow
      attribute-name="Anzahl Besuche"
      :original-value="originalData.countVisits()"
      :changed-value="changedData.countVisits()"
    />
    <DiffValueTableRow
      attribute-name="Fahrtzeit"
      :original-value="originalData.getTotalDriveTimeS()"
      :changed-value="changedData.getTotalDriveTimeS()"
      formatter="deltaSeconds"
      :more-is-better="false"
    />
  </table>
  <CollectionDiff
    v-if="originalData.getUnassignedClients().size > 0 || changedData.getUnassignedClients().size > 0"
    title="Unbesuchte Kunden"
    :more-is-better="false"
    :original="getUnassignedClientNames(originalData)"
    :changed="getUnassignedClientNames(changedData)"
  />
  <CollapsibleContent title="Veränderte Touren" header-tag="h4" :open="false">
    <template #afterheader>
      <span class="badge bg-secondary">{{ changedTours.length + removedTours.length + addedTours.length }}</span>
    </template>
    <TourDiff v-for="pair in changedTours" :key="pair[0].id" :original="pair[0]" :changed="pair[1]" />
    <ChangedTourHeader v-for="tour in removedTours" :key="tour.id" :old-name="tour.name" />
    <ChangedTourHeader v-for="tour in addedTours" :key="tour.id" :new-name="tour.name" />
  </CollapsibleContent>
  <CollapsibleContent title="Objektänderungen" header-tag="h4" :open="false">
    <ChangesetDiff />
  </CollapsibleContent>
</template>

<style scoped></style>