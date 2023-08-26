<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
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
  <span class="jwler-label">
    <span class="icons-container">
      <span v-if="jwler?.chlaus">🎅</span>
      <span v-else>🥷</span>
      <span v-if="jwler?.driver">🚗</span>
    </span>
    <span>{{ jwler!.name }}</span>
  </span>
</template>

<style scoped>
.icons-container {
  display: inline-block;
  width: 2rem;
}
</style>
