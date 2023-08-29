<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import type {JWler} from "@/api/models/JWler";

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
      <template v-if="jwler?.chlaus">🎅</template>
      <template v-else>🥷</template>
      <template v-if="jwler?.driver">🚗</template>
    </span>
    <span>{{ jwler!.name }}</span>
  </span>
</template>

<style scoped>
.icons-container {
  display: inline-block;
  width: 2.5rem;
  overflow-x: hidden;
  white-space: nowrap;
}
</style>