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
    <span class="jwler-name">{{ jwler!.name }}</span>
  </span>
</template>

<style scoped>
.jwler-label {
  display: inline-block;
  height: 1.6rem;
}
.icons-container {
  display: inline-block;
  width: 2.5rem;
  overflow-x: hidden;
  white-space: nowrap;
}

.jwler-name {
  vertical-align: top;
}
</style>