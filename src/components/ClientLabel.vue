<script lang="ts">
import {defineComponent, PropType} from "vue";
import type {Client} from "@/api";

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
  <span> {{ client.first_name }} {{ client.last_name }} </span>
</template>

<style scoped></style>
