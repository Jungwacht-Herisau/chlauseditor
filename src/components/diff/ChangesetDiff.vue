<script lang="ts">
import {defineComponent} from "vue";
import ChangesetDiffRow from "@/components/diff/ChangesetDiffRow.vue";
import {useStore} from "@/store";

export default defineComponent({
  name: "ChangesetDiff",
  components: {ChangesetDiffRow},
  data() {
    return {
      store: useStore(),
    };
  },
});
</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th></th>
        <th>Erstellt</th>
        <th>Geändert</th>
        <th>Gelöscht</th>
      </tr>
    </thead>
    <tbody>
      <ChangesetDiffRow title="Jungwächtler" :changeset="store.changeset.jwlers" />
      <ChangesetDiffRow title="Jungwächtler-Verfügbarkeit" :changeset="store.changeset.jwlerAvailabilities" />
      <ChangesetDiffRow title="Kunde" :changeset="store.changeset.clients" />
      <ChangesetDiffRow title="Kunden-Verfügbarkeit" :changeset="store.changeset.clientAvailabilities" />
      <ChangesetDiffRow title="Orte" :changeset="store.changeset.locations" />
      <ChangesetDiffRow title="Touren" :changeset="store.changeset.tours" />
      <ChangesetDiffRow title="Tour-Elemente" :changeset="store.changeset.tourElements" />
    </tbody>
  </table>
</template>

<style scoped></style>