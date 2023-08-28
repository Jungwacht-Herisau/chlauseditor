<script lang="ts">
import {RouterView} from "vue-router";

export default {
  components: {
    RouterView,
  },
  mounted() {
    document.body.setAttribute("data-bs-theme", "dark");
  },
};
</script>

<template>
  <RouterView />
</template>

<style scoped></style>