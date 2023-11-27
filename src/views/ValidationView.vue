<script lang="ts">
import AllClientsVisitedValidation from "@/components/validation/AllClientsVisitedValidation.vue";
import AllTourElementsInsideTrioAvailableTimespanValidation from "@/components/validation/AllTourElementsInsideTrioAvailableTimespanValidation.vue";

export default {
  name: "ValidationView",
  components: {AllTourElementsInsideTrioAvailableTimespanValidation, AllClientsVisitedValidation},

  mounted() {
    console.log("ValidationView mounted");
  },
};
</script>

<template>
  <AllClientsVisitedValidation />
  <AllTourElementsInsideTrioAvailableTimespanValidation />
</template>

<style scoped></style>