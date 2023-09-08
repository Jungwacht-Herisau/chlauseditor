<script lang="ts">
import {defineComponent} from "vue";
import {useStore} from "@/store";
import DiffValueTableRow from "@/components/diff/DiffValueTableRow.vue";
import {formatDeltaSeconds} from "@/util";

export default defineComponent({
  name: "StateDiff",
  methods: {formatDeltaSeconds},
  components: {DiffValueTableRow},
  data() {
    const store = useStore();
    return {
      store,
      original: store.originalData,
      changed: store.data,
    };
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
      :original-value="original.tours.size"
      :changed-value="changed.tours.size"
    />
    <DiffValueTableRow
      attribute-name="Anzahl Besuche"
      :original-value="original.countVisits()"
      :changed-value="changed.countVisits()"
    />
    <DiffValueTableRow
      attribute-name="Fahrtzeit"
      :original-value="original.getTotalDriveTimeS()"
      :changed-value="changed.getTotalDriveTimeS()"
      :formatter="x => formatDeltaSeconds(x as number)"
      :more-is-better="false"
    />
  </table>
</template>

<style scoped></style>