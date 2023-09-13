<script lang="ts">
import {defineComponent} from "vue";
import {StateData, useStore} from "@/store";
import DiffValueTableRow from "@/components/diff/DiffValueTableRow.vue";
import {formatDeltaSeconds} from "@/util";
import CollectionDiff from "@/components/diff/CollectionDiff.vue";
import TourDiff from "@/components/diff/TourDiff.vue";
import {tourEquals} from "@/model_utils";

export default defineComponent({
  name: "StateDiff",
  components: {TourDiff, CollectionDiff, DiffValueTableRow},
  data() {
    return {
    };
  },
  methods: {
    formatDeltaSeconds,
    getUnassignedClientNames(data: StateData) {
      return Array.from(data.getUnassignedClients().values())
          .map(cl => cl.firstName + ' ' + cl.lastName);
    }
  },
  computed: {
    originalData() {
      return useStore().originalData;
    },
    changedData() {
      return useStore().data;
    },
    changedTours() {
      const store = useStore();
      let pairs = Array.from(store.originalData.tours.keys())
          .filter(id => store.data.tours.has(id))
          .map(id => [store.originalData.tours.get(id)!, store.data.tours.get(id)!]);
      return pairs
          .filter(pair => !tourEquals(pair[0], pair[1]));
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
  <CollectionDiff v-if="originalData.getUnassignedClients().size>0 || changedData.getUnassignedClients().size>0"
                  title="Unbesuchte Kunden"
                  :more-is-better="false"
                  :original="getUnassignedClientNames(originalData)"
                  :changed="getUnassignedClientNames(changedData)"/>
  <TourDiff v-for="pair in changedTours" :key="pair[0].id" :original="pair[0]" :changed="pair[1]"/>
</template>

<style scoped>

</style>