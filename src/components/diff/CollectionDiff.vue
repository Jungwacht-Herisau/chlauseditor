<script lang="ts">
import {defineComponent,} from 'vue'
import type {PropType} from 'vue'
import CollapsibleContent from "@/components/CollapsibleContent.vue";

export default defineComponent({
  name: "CollectionDiff",
  components: {CollapsibleContent},
  props: {
    original: {
      type: Object as PropType<string[]>,
      required: true,
    },
    changed: {
      type: Object as PropType<string[]>,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    moreIsBetter: {
      type: Boolean,
      required: false,
      default: true,
    },
    headerTag: {
      type: String,
      required: false,
      default: "h4",
    },
  },
  computed: {
    unchangedElements() {
      return this.original.filter(x => this.changed.includes(x));
    },
    removedElements() {
      return this.original.filter(x => !this.changed.includes(x));
    },
    addedElements() {
      return this.changed.filter(x => !this.original.includes(x));
    },
    moreBgClass() {
      return this.moreIsBetter ? "bg-success" : "bg-danger";
    },
    lessBgClass() {
      return this.moreIsBetter ? "bg-danger" : "bg-success";
    },
    addedClass() {
      return this.moreIsBetter ? "good-container": "bad-container";
    },
    removedClass() {
      return this.moreIsBetter ? "bad-container" : "good-container";
    },
  }
})
</script>

<template>
  <CollapsibleContent :title="title" :header-tag="headerTag" :open="false">
    <template #afterheader>
      <span v-if="addedElements.length>0" :class="['badge', moreBgClass]">+{{ addedElements.length }}</span>
      <span v-if="removedElements.length>0" :class="['badge', lessBgClass]">-{{ removedElements.length }}</span>
      <span v-if="addedElements.length==0 && removedElements.length==0" class="badge bg-secondary">±0</span>
    </template>
    <div class="row">
      <div class="col-6">
        <h4>Original ({{ original.length }})</h4>
      </div>
      <div class="col-6">
        <h4>Aktuell ({{ changed.length }})</h4>
      </div>
    </div>
    <div v-if="addedElements.length>0" :class="['row', addedClass]">
      <div class="col-6"></div>
      <div class="col-6">
        <ul>
          <li v-for="x in addedElements" :key="x">{{ x }}</li>
        </ul>
      </div>
    </div>
    <div v-if="removedElements.length>0" :class="['row', removedClass]">
      <div class="col-6">
        <ul>
          <li v-for="x in removedElements" :key="x">{{ x }}</li>
        </ul>
      </div>
      <div class="col-6"></div>
    </div>
    <div v-if="unchangedElements.length>0" class="unchanged-container row">
      <div class="col-6" v-for="i in 2" :key="i">
        <ul>
          <li v-for="x in unchangedElements" :key="x">
            {{ x }}
          </li>
        </ul>
      </div>
    </div>
  </CollapsibleContent>
</template>

<!--suppress CssUnusedSymbol -->
<style scoped>
.good-container {
  color: var(--bs-green);
}

.bad-container {
  color: var(--bs-red);
}

.unchanged-container {
  color: var(--bs-secondary);
}

ul {
  padding-left: 1rem;
  margin-bottom: 0;
}
</style>