<script lang="ts">
import type {PropType} from "vue";
import {defineComponent} from "vue";
import {useStore} from "@/model/store";
import type {HourRange} from "@/types";
import {formatHours, formatStartEnd, toFractionHours} from "@/util";
import ClientLabel from "@/components/ClientLabel.vue";
import {Tooltip} from "bootstrap";
import {allowDrop, dropTourElement, getDragData, ObjectType, startDrag} from "@/drag_drop";
import type {TourElement} from "@/api/models/TourElement";

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
    allowDrop,
    otherElementDropped(event: DragEvent) {
      const dragData = getDragData(event);
      const spacerRect = (this.$refs.spacer as HTMLElement).getBoundingClientRect();
      const x =
        (event.clientX - dragData.cursorOffsetX - spacerRect.left) /
        (spacerRect.width / this.range!.calcFraction(this.durationHours, true));
      const hourStart = this.range!.start + x * this.range!.span();
      const todayMorning = new Date(this.tour!.date);
      const start = new Date(todayMorning.getTime() + hourStart * 60 * 60 * 1000);
      dropTourElement(event, this.tour!, start);
    },
    fractionToCssWidth(fraction: number) {
      return this.timelineWidthPx != 0 ? fraction * this.timelineWidthPx + "px" : fraction * 100 + "%";
    },
    startDrag(event: DragEvent) {
      const rect = (this.$refs.timelineElement as HTMLElement).getBoundingClientRect();
      startDrag(
        event,
        ObjectType.TOUR_ELEMENT,
        `${this.tour?.id};${this.tourElement?.id}`,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    },
  },
  computed: {
    ObjectType() {
      return ObjectType;
    },
    tour() {
      return this.store.data.tours.get(this.tourElement!.tour);
    },
    startDate() {
      return this.tourElement?.start ?? new Date(0);
    },
    endDate() {
      return this.tourElement?.end ?? new Date(0);
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
        return this.store.data.clients.get(this.tourElement!.client);
      } else {
        return null;
      }
    },
    tooltipHtml() {
      let html = `Zeit: ${formatStartEnd(this.tourElement!)}<br>Dauer: ${formatHours(this.durationHours)}<br>`;
      if (this.client != null) {
        html += "<hr>";
        const locationStr = this.store.data.locations.get(this.client!.visitLocation)?.string;
        html += `${this.client?.firstName} ${this.client?.lastName}<br>`;
        html += `${locationStr}<br>`;
        html += "<hr>";
        const allAvailabilities = this.store.data.clientAvailabilities.get(this.client.id!);
        const avsOnThisDay = allAvailabilities?.filter(av => av.start.toDateString() === this.startDate.toDateString());
        if (avsOnThisDay && avsOnThisDay.length > 0) {
          const startStr = formatHours(toFractionHours(avsOnThisDay[0].start));
          const endStr = formatHours(toFractionHours(avsOnThisDay[0].end));
          html += `Verfügbar ${startStr}-${endStr}<br>`;
        } else {
          html += "Heute nicht verfügbar<br>";
        }
        html += `Besuchbar an ${allAvailabilities?.length ?? 0} Tagen`;
      }
      return html;
    },
  },
});
</script>

<template>
  <div class="timeline-element-container">
    <div v-if="offset" class="spacer" ref="spacer"></div>
    <div
      :data-type="tourElement?.type"
      class="timeline-element"
      data-bs-toggle="tooltip"
      data-bs-placement="top"
      data-bs-html="true"
      :data-bs-title="tooltipHtml"
      ref="timelineElement"
      draggable="true"
      @dragstart="event => startDrag(event)"
      @dragover="event => allowDrop(event, ObjectType.TOUR_ELEMENT)"
      @drop="event => otherElementDropped(event)"
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

  font-size: small;
}

[data-type="V"] {
  background-color: rgba(52, 152, 219, 0.5);
}

[data-type="D"] {
  background-color: rgba(139, 69, 19, 0.5);
}

[data-type="B"] {
  background-color: rgba(255, 165, 0, 0.5);
}
</style>