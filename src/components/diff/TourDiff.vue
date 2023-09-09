<script lang="ts">
import {defineComponent} from 'vue'
import type {PropType} from 'vue'
import {Tour} from "@/api";

export default defineComponent({
  name: "TourDiff",
  props: {
    original: {
      type: Object as PropType<Tour>,
      required: true,
    },
    changed: {
      type: Object as PropType<Tour>,
      required: true,
    },
  }
})
</script>

<template>
  <span>TODO tour diff {{ original.id }}</span>
</template>

<style scoped>

</style>