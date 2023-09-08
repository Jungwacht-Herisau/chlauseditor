<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default defineComponent({
  name: "DiffValueTableRow",
  components: {FontAwesomeIcon},
  props: {
    attributeName: {
      type: String,
      required: true,
    },
    originalValue: {
      type: Object as PropType<number | string>,
      required: true,
    },
    changedValue: {
      type: Object as PropType<number | string>,
      required: true,
    },
    formatter: {
      type: Object as PropType<(x: number | string) => string>,
      required: false,
      default: (x: number | string) => JSON.stringify(x),
    },
    moreIsBetter: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  computed: {
    hasChange() {
      return this.originalValue != this.changedValue;
    },
    isNumberChange() {
      return typeof this.originalValue == "number" && typeof this.changedValue == "number";
    },
    numberDiff() {
      if (this.isNumberChange) {
        const diff = (this.changedValue as number) - (this.originalValue as number);
        const deltaStr = this.formatValue(Math.abs(Math.round(diff)).toFixed(0));
        const sign = diff > 0 ? "+" : "-";
        return sign + deltaStr;
      } else {
        return "";
      }
    },
    badgeBgClass() {
      if (this.isNumberChange) {
        return this.changedValue > this.originalValue !== this.moreIsBetter
          ? "bg-danger"
          : "bg-success";
      } else {
        return "bg-primary";
      }
    },
  },
  methods: {
    formatValue(value: number | string) {
      try {
        return this.formatter(value);
      } catch (e) {
        return value;
      }
    },
  },
});
</script>

<template>
  <tr>
    <td>{{ attributeName }}</td>
    <td>{{ formatValue(originalValue) }}</td>
    <td>
      {{ formatValue(changedValue) }}
      <span v-if="hasChange" :class="['badge', badgeBgClass]">
        <template v-if="isNumberChange">{{ numberDiff }}</template>
        <font-awesome-icon v-else icon="pen" />
      </span>
    </td>
  </tr>
</template>

<style scoped></style>