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
    const store = useStore();
    return {
      store,
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
    changedTours() {
      let pairs = Array.from(this.store.originalData.tours.keys())
          .filter(id => this.store.data.tours.has(id))
          .map(id => [this.store.originalData.tours.get(id)!, this.store.data.tours.get(id)!]);
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
        :original-value="store.originalData.tours.size"
        :changed-value="store.data.tours.size"
    />
    <DiffValueTableRow
        attribute-name="Anzahl Besuche"
        :original-value="store.originalData.countVisits()"
        :changed-value="store.data.countVisits()"
    />
    <DiffValueTableRow
        attribute-name="Fahrtzeit"
        :original-value="store.originalData.getTotalDriveTimeS()"
        :changed-value="store.data.getTotalDriveTimeS()"
        formatter="deltaSeconds"
        :more-is-better="false"
    />
  </table>
  <CollectionDiff v-if="store.originalData.getUnassignedClients().size>0 || store.data.getUnassignedClients().size>0"
                  title="Unbesuchte Kunden"
                  :more-is-better="false"
                  :original="getUnassignedClientNames(store.originalData)"
                  :changed="getUnassignedClientNames(store.data)"/>
  <span>{{ changedTours }}</span>
  <TourDiff v-for="pair in changedTours" :key="pair[0].id" :original="pair[0]" :changed="pair[1]"/>
</template>

<style scoped>

</style>