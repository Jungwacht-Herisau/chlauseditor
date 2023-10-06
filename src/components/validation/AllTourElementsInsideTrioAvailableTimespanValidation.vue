<script lang="ts">
import {defineComponent} from "vue";
import {useStore} from "@/model/store";
import {JWler, JWlerAvailability, Tour, TourElement} from "@/api";
import type {StartEnd} from "@/types";
import {getJwlerAvailabilityOnDay, getJwlersOfTour, getTourElementDescription} from "@/model/model_utils";
import {formatDate, formatStartEnd, getCommonTimeSpan} from "@/util";
import ValidationSuccessMessage from "@/components/validation/ValidationSuccessMessage.vue";
import JWlerLabel from "@/components/JWlerLabel.vue";

interface JwlerAvailabilityPair {
  jwler: JWler;
  availability: JWlerAvailability;
}

interface InvalidTour {
  tour: Tour;
  jwlerAvailabilities: JwlerAvailabilityPair[];
  workingTimeSpan: StartEnd | null;
  violatingElements: TourElement[];
}

export default defineComponent({
  name: "AllTourElementsInsideTrioAvailableTimespanValidation",
  methods: {getTourElementDescription, formatStartEnd, formatDate},
  components: {JWlerLabel, ValidationSuccessMessage},
  data() {
    return {
      store: useStore(),
    };
  },
  computed: {
    invalidTours() {
      return Array.from(this.store.data.tours.values())
        .map(tour => {
          const jwlers = getJwlersOfTour(tour);
          const availabilities = jwlers
            .map(j => getJwlerAvailabilityOnDay(j.id!, tour.date))
            .filter(av => av != null)
            .map(av => av!);
          const tourElements = this.store.data.tourElements.get(tour.id!) ?? [];
          const commonTimeSpan = getCommonTimeSpan(availabilities);
          return {
            tour: tour,
            jwlerAvailabilities: jwlers.map(
              (jwler, i) => ({jwler: jwler, availability: availabilities[i]}) as JwlerAvailabilityPair,
            ),
            workingTimeSpan: commonTimeSpan,
            violatingElements: tourElements.filter(
              element =>
                commonTimeSpan == null || element.start > commonTimeSpan.end || element.end < commonTimeSpan.start,
            ),
          } as InvalidTour;
        })
        .filter(it => it.violatingElements.length > 0);
    },
  },
});
</script>

<template>
  <h3>Tour-Elemente ausserhalb der JWler-Verfügbarkeit</h3>
  <template v-for="it in invalidTours" :key="it.tour.id">
    <h4>{{ it.tour.name }} am {{ formatDate(new Date(it.tour.date)) }}</h4>
    <table>
      <tbody>
        <template v-if="it.workingTimeSpan == null">
          <tr>
            <th>Verfügbarkeit</th>
            <td colspan="2">Keine gemeinsame Verfügbarkeit</td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <th :rowspan="it.jwlerAvailabilities.length + 1">Verfügbarkeit</th>
            <td>Insgesamt</td>
            <td>{{ formatStartEnd(it.workingTimeSpan) }}</td>
          </tr>
          <tr v-for="ja in it.jwlerAvailabilities" :key="ja.jwler.id">
            <td>
              <JWlerLabel :jwler="ja.jwler" />
            </td>
            <td>{{ formatStartEnd(ja.availability) }}</td>
          </tr>
        </template>
        <tr v-for="(el, index) in it.violatingElements" :key="el.id">
          <th v-if="index == 0" :rowspan="it.violatingElements.length">Elemente ausserhalb:</th>
          <td>{{ getTourElementDescription(el) }}</td>
          <td>{{ formatStartEnd(el) }}</td>
        </tr>
      </tbody>
    </table>
  </template>
  <ValidationSuccessMessage v-if="invalidTours.length == 0">
    Alle Elemente innerhalb der Verfügbarkeit
  </ValidationSuccessMessage>
</template>

<style scoped>
th {
  vertical-align: top;
}
</style>