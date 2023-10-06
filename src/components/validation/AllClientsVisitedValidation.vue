<script lang="ts">
import {defineComponent} from "vue";
import {useStore} from "@/model/store";
import ClientLabel from "@/components/ClientLabel.vue";
import {formatDate, formatStartEnd} from "../../util";
import ValidationSuccessMessage from "@/components/validation/ValidationSuccessMessage.vue";

export default defineComponent({
  name: "AllClientsVisitedValidation",
  methods: {formatDate, formatStartEnd},
  components: {ValidationSuccessMessage, ClientLabel},
  data() {
    return {
      store: useStore(),
    };
  },
});
</script>

<template>
  <h3>Nicht besuchte Kunden</h3>
  <ul v-if="store.unassignedClients.size > 0">
    <li v-for="client in store.unassignedClients.values()" :key="client.id">
      <ClientLabel :client="client" />
      <ul>
        <li v-for="av in store.data.clientAvailabilities.get(client.id!)" :key="av.id">
          Verfügbar {{ formatDate(av.start) }} {{ formatStartEnd(av) }}
        </li>
      </ul>
    </li>
  </ul>
  <ValidationSuccessMessage v-else>Alle Kunden werden besucht</ValidationSuccessMessage>
</template>

<style scoped></style>