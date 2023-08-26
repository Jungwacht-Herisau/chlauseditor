<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "CollapsibleContent",
  props: {
    title: {
      type: String,
    },
    open: {
      type: Boolean,
      default: true,
    },
    headerTag: {
      type: String,
      default: "h3",
    },
  },
  data() {
    return {
      mutableOpen: this.open,
    };
  },
});
</script>

<template>
  <component :is="headerTag">
    <button @click="mutableOpen = !mutableOpen">
      <span v-if="mutableOpen"> &#10134; </span>
      <span v-else> &#10133; </span>
    </button>
    {{ title }}
  </component>
  <div v-if="mutableOpen" class="content">
    <slot></slot>
  </div>
</template>
<style scoped></style>
