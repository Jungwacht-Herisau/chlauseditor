<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import type {Client} from "@/api/models/Client";

export default defineComponent({
  name: "ClientLabel",
  props: {
    client: {
      type: Object as PropType<Client>,
    },
  },
});
</script>

<template>
  <span> {{ client!.firstName }} {{ client!.lastName }} </span>
</template>

<style scoped></style>