<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "ValidationSuccessMessage",
});
</script>

<template>
  <span class="success-message">
    <font-awesome-icon icon="check" />
    <span>
      <slot></slot>
    </span>
  </span>
</template>

<style scoped>
.success-message {
  font-weight: bold;
  color: var(--bs-form-valid-color);
}

.success-message > span {
  margin-left: 0.5rem;
}
</style>