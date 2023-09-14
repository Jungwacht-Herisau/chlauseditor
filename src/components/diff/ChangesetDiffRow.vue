<script lang="ts">
import {defineComponent} from "vue";
import {ModelChangeset} from "@/changeset";

export default defineComponent({
  name: "ChangesetDiffRow",
  props: {
    title: {
      type: String,
      required: true,
    },
    changeset: {
      type: ModelChangeset,
      required: true,
    },
  },
  computed: {
    totalChanges() {
      return this.changeset.added.length + this.changeset.changed.length + this.changeset.removed.length;
    },
  },
});
</script>

<template>
  <tr v-if="totalChanges > 0">
    <th scope="row">{{ title }}</th>
    <td :class="{'added-text': changeset.added.length > 0}">{{ changeset.added.length }}</td>
    <td :class="{'changed-text': changeset.changed.length > 0}">{{ changeset.changed.length }}</td>
    <td :class="{'removed-text': changeset.removed.length > 0}">{{ changeset.removed.length }}</td>
  </tr>
</template>

<style scoped></style>