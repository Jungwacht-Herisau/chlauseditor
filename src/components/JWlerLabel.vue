<script lang="ts">
import {defineComponent, PropType} from "vue";
import type {JWler} from "@/api";

export default defineComponent({
  name: "JWlerLabel",
  props: {
    jwler: {
      type: Object as PropType<JWler>,
    },
  },
});
</script>

<template>
  <p>
    <span>{{ jwler.name }}</span>
    <span v-if="jwler?.driver">🚗</span>
    <span v-if="jwler?.chlaus">🎅</span>
    <span v-else>🥷</span>
  </p>
</template>

<style scoped></style>
