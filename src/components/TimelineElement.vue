<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import type {TourElement} from "@/api";
import {useStore} from "@/store";
import type {HourRange} from "@/types";
import {extractId} from "@/model_utils";
import {parseApiDateTime} from "@/util";
import ClientLabel from "@/components/ClientLabel.vue";

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
      return (this.startDate.getUTCHours() * this.startDate.getUTCMinutes()) / 60;
    },
    endHour() {
      return (this.endDate.getUTCHours() * this.endDate.getUTCHours()) / 60;
    },
    durationHours() {
      console.log(this.timelineWidthPx);
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
  },
});
</script>

<template>
  <div v-if="offset" class="spacer"></div>
  <div :data-type="tourElement?.type" class="timeline-element">
    <div v-if="tourElement!.type == 'V'">Besuch</div>
    <div v-else-if="tourElement!.type == 'D'">Fahrt</div>
    <div v-else-if="tourElement!.type == 'B'">Pause</div>
    <div v-if="client != null">Nr. {{ client.id }}</div>
    <div v-if="client != null">
      <ClientLabel :client="client" />
    </div>
  </div>
</template>

<style scoped>
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