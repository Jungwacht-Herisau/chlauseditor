<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "RouteNavItem",
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  computed: {
    url() {
      return this.$router.resolve({name: this.name}).href;
    },
    classes() {
      return this.$route.name == this.name ? ["active"] : [];
    },
  },
});
</script>

<template>
  <li class="nav-item">
    <a class="nav-link" :class="classes" aria-current="page" :href="url">{{ name }}</a>
  </li>
</template>

<style scoped></style>