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
    <button @click="mutableOpen = !mutableOpen" class="btn">
      <font-awesome-icon v-if="mutableOpen" icon="caret-down" />
      <font-awesome-icon v-else icon="caret-right" />
    </button>
    {{ title }}
    <slot name="afterheader" />
  </component>
  <div v-if="mutableOpen" class="content">
    <slot />
  </div>
</template>
<style scoped>
.content {
  margin-left: 1rem;
}

button {
  padding-left: 0;
  padding-right: 0;
}
</style>