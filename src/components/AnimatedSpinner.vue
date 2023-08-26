<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "AnimatedSpinner",
});
</script>

<template>
  <div class="animated-spinner"></div>
</template>

<style scoped>
.animated-spinner {
  border: 16px solid #f3f3f3;
  border-top: 16px solid #3498db;
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
