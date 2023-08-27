<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import type {TourElement} from "@/api";
import {useStore} from "@/store";
import type {HourRange} from "@/types";
import {extractId} from "@/model_utils";
import {formatHours, formatStartEnd, parseApiDateTime, toFractionHours} from "@/util";
import ClientLabel from "@/components/ClientLabel.vue";
import {Tooltip} from "bootstrap";

export default defineComponent({
  name: "TimelineElement",
  components: {ClientLabel},
  props: {
    tourElement: {
      type: Object as PropType<TourElement>,
    },
    range: {
      type: Object as PropType<HourRange>,
    },
    offset: {
      type: Boolean,
      default: true,
    },
    timelineWidthPx: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      store: useStore(),
    };
  },
  mounted() {
    new Tooltip(this.$refs.timelineElement as Element);
  },
  methods: {
    fractionToCssWidth(fraction: number) {
      const cssWidth =
        this.timelineWidthPx != 0 ? fraction * this.timelineWidthPx + "px" : fraction * 100 + "%";
      console.log(fraction, cssWidth);
      return cssWidth;
    },
  },
  computed: {
    tour() {
      return this.store.tours.get(parseInt(extractId(this.tourElement?.tour!)));
    },
    startDate() {
      return parseApiDateTime(this.tourElement?.start!);
    },
    endDate() {
      return parseApiDateTime(this.tourElement?.end!);
    },
    startHour() {
      return toFractionHours(this.startDate);
    },
    endHour() {
      return toFractionHours(this.endDate);
    },
    durationHours() {
      return this.endHour - this.startHour;
    },
    spacerWidth() {
      return this.fractionToCssWidth(this.range!.calcFraction(this.startHour));
    },
    elementWidth() {
      return this.fractionToCssWidth(this.range!.calcFraction(this.durationHours, true));
    },
    client() {
      if (this.tourElement!.client != null) {
        return this.store.clients.get(parseInt(extractId(this.tourElement!.client)));
      } else {
        return null;
      }
    },
    tooltipHtml() {
      let html =
        `Zeit: ${formatStartEnd(this.tourElement!)}<br>` +
        `Dauer: ${formatHours(this.durationHours)}<br>`;
      if (this.client != null) {
        html += "<hr>";
        const locationStr = this.store.locations.get(
          parseInt(extractId(this.client!.visit_location)),
        )?.string;
        html += `${this.client?.first_name} ${this.client?.last_name}<br>`;
        html += `${locationStr}<br>`;
      }
      return html;
    },
  },
});
</script>

<template>
  <div class="timeline-element-container">
    <div v-if="offset" class="spacer"></div>
    <div
      :data-type="tourElement?.type"
      class="timeline-element"
      data-bs-toggle="tooltip"
      data-bs-placement="top"
      data-bs-html="true"
      :data-bs-title="tooltipHtml"
      ref="timelineElement"
    >
      <div v-if="tourElement!.type == 'D'">
        <font-awesome-icon icon="car-side" />
      </div>
      <div v-else-if="tourElement!.type == 'B'">
        <font-awesome-icon icon="mug-hot" />
      </div>
      <div v-if="client != null">
        <ClientLabel :client="client" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline-element-container {
  display: flex;
  flex-direction: row;
  pointer-events: none;
}

.spacer {
  width: v-bind(spacerWidth);
}

.timeline-element {
  height: var(--tour-timeline-height);
  width: v-bind(elementWidth);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  overflow: hidden;
  pointer-events: auto;
}

[data-type="V"] {
  background-color: #3498db;
}

[data-type="D"] {
  background-color: saddlebrown;
}

[data-type="B"] {
  background-color: orange;
}
</style>