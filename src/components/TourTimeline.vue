<script lang="ts">
import type {PropType} from "vue";
import {defineComponent, toRaw} from "vue";
import {
  addTourElement,
  findNewTourElementId,
  getDayKeyOfTour,
  getJwlerAvailabilitiesOfTour,
  getJwlersOfTour,
  insertDriveElements,
} from "@/model/model_utils";
import JWlerLabel from "@/components/JWlerLabel.vue";
import {HourRange} from "@/types";
import {allowDrop, dropTourElement, getDragData, getDraggedIdInt, ObjectType, startDrag} from "@/drag_drop";
import {getClientUrl, getJwlerUrl, getUrl} from "@/api_url_builder";
import {useStore} from "@/model/store";
import TimelineElement from "@/components/TimelineElement.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import type {TourElement} from "@/api/models/TourElement";
import {TourElementTypeEnum} from "@/api/models/TourElement";
import type {JWlerAvailability} from "@/api/models/JWlerAvailability";
import type {Tour} from "@/api/models/Tour";
import TextInputModal from "@/components/TextInputModal.vue";

export default defineComponent({
  name: "TourTimeline",
  components: {TextInputModal, FontAwesomeIcon, TimelineElement, JWlerLabel},
  props: {
    tour: {
      type: Object as PropType<Tour>,
    },
    range: {
      type: HourRange,
    },
  },
  data() {
    return {
      ObjectType,
      store: useStore(),
    };
  },
  computed: {
    date() {
      return this.tour?.date!;
    },
    jwlers() {
      return getJwlersOfTour(this.tour!);
    },
    availabilities() {
      return getJwlerAvailabilitiesOfTour(this.tour!);
    },
    elements() {
      return this.store.data.tourElements.get(this.tour!.id!);
    },
    tourId(): number {
      return this.tour!.id!;
    },
  },
  methods: {
    insertDriveElements,
    startDrag,
    drop: getDraggedIdInt,
    allowDrop,
    parseApiDateTime: function (value: Date): Date {
      return value;
    },
    calcWidth(availability: JWlerAvailability): string {
      const endFraction = this.range?.calcFraction(availability.end)!;
      const startFraction = this.range?.calcFraction(availability.start)!;
      return (endFraction - startFraction) * 100 + "%";
    },
    dropJwler(event: DragEvent) {
      const dragData = getDragData(event);
      let jwlerId =
        dragData.type == ObjectType.JWLER ? getDraggedIdInt(event) : parseInt((dragData.id as string).split(";")[1]);
      const jwlerUrl = getJwlerUrl(jwlerId);
      const sameDayTours = this.store.toursByDay.get(getDayKeyOfTour(this.tour!))!;
      const currentTourMutable = this.store.data.tours.get(this.tour!.id!)!;
      sameDayTours.forEach(to => {
        const idx = to.jwlers.indexOf(jwlerUrl);
        if (idx >= 0) {
          to.jwlers.splice(idx, 1);
        }
      });
      currentTourMutable.jwlers.push(jwlerUrl);
    },
    dropClient(event: DragEvent) {
      const dragData = getDragData(event);
      const dropZoneRect = (this.$refs.dropZone as HTMLElement).getBoundingClientRect();
      const x = (event.clientX - dragData.cursorOffsetX - dropZoneRect.left) / dropZoneRect.width;
      const hourStart = this.range!.start + x * this.range!.span();
      const todayMorning = new Date(this.tour!.date);
      const start = new Date(todayMorning.getTime() + hourStart * 60 * 60 * 1000);
      if (dragData.type == ObjectType.CLIENT) {
        const clientId = getDraggedIdInt(event);
        const durationSecs = parseFloat(this.store.data.clients.get(clientId)!.requiredTime!);
        const end = new Date(start.getTime() + durationSecs * 1000);
        const newElement: TourElement = {
          id: findNewTourElementId(),
          tour: getUrl("tour", this.tourId),
          start: start,
          end: end,
          type: TourElementTypeEnum.V,
          client: getClientUrl(clientId),
        };
        addTourElement(this.tourId, newElement);
      } else if (dragData.type == ObjectType.TOUR_ELEMENT) {
        dropTourElement(event, this.tour!, start);
      }
    },
    renameTour() {
      (this.$refs.tourNameModal as typeof TextInputModal).open(this.tour!.name);
    },
    deleteTour() {
      this.store.data.tourElements.delete(this.tourId);
      this.store.data.tours.delete(this.tourId);
    },
    printDebugInfo() {
      console.debug(toRaw(this.tour));
      console.debug(toRaw(this.elements));
    },
  },
});
</script>

<template>
  <div class="tour-timeline">
    <div class="tour-name-container">
      <div class="dropdown">
        <button
          class="btn btn-sm btn-outline-primary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        ></button>
        <ul class="dropdown-menu">
          <li>
            <button type="button" class="dropdown-item" @click="insertDriveElements(tour!)">
              <font-awesome-icon icon="car-side" />
              Fahrten einfügen
            </button>
            <button type="button" class="dropdown-item" @click="renameTour">
              <font-awesome-icon icon="pen" />
              Umbenennen
            </button>
            <button type="button" class="dropdown-item text-danger" @click="deleteTour">
              <font-awesome-icon icon="trash-can" />
              Löschen
            </button>
            <button type="button" class="dropdown-item" @click="printDebugInfo">
              <font-awesome-icon icon="bug" />
              Debug
            </button>
          </li>
        </ul>
      </div>
      <h5 class="tour-name">{{ tour!.name }}</h5>
    </div>
    <div
      class="jwler-name-container"
      @dragover="event => allowDrop(event, ObjectType.JWLER, ObjectType.ASSIGNED_JWLER)"
      @drop="event => dropJwler(event)"
    >
      <div
        v-for="(_, i) in jwlers.length"
        :key="i"
        draggable="true"
        @dragstart="event => startDrag(event, ObjectType.ASSIGNED_JWLER, `${tourId};${jwlers[i].id!}`)"
      >
        <JWlerLabel :jwler="jwlers[i]" />
      </div>
    </div>
    <div class="timeline">
      <div class="jwler-availability">
        <div
          v-for="av in availabilities"
          :key="av.jwler"
          :style="{
            'margin-left': range?.calcPercentage(parseApiDateTime(av.start)),
            width: calcWidth(av),
          }"
        ></div>
      </div>
      <div
        @dragover="event => allowDrop(event, ObjectType.CLIENT, ObjectType.TOUR_ELEMENT)"
        @drop="event => dropClient(event)"
        ref="dropZone"
        class="drop-zone"
      ></div>
      <TimelineElement v-for="e in elements" :key="e.id" :tour-element="e" :range="range" />
    </div>
  </div>
  <TextInputModal question="Tourname" ref="tourNameModal" @ok="(newName: string) => (tour!.name = newName)" />
</template>

<style scoped>
.tour-timeline {
  display: flex;
  flex-direction: row;
  height: var(--tour-timeline-height);
}

.tour-timeline:not(:last-child) {
  border-bottom: none;
}

.tour-name {
  writing-mode: tb;
  transform: rotate(180deg);
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  width: var(--tour-name-width);
  height: calc(var(--tour-timeline-height) - 2rem);
}

.jwler-name-container {
  width: var(--tour-jwler-width);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.jwler-name-container .jwler-label {
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin: 0;
  height: 2rem;
}

.timeline {
  background-color: antiquewhite;
  width: var(--tour-timeline-width);

  display: grid;
}

.timeline * {
  grid-column: 1;
  grid-row: 1;
}

.timeline .jwler-availability {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.jwler-availability div {
  flex-grow: 1;
  background-color: palegreen;
}

.drop-zone {
  /*pointer-events: none;*/
}
</style>