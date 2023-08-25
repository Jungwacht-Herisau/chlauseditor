<script lang="ts">
import {defineComponent} from "vue";
import type {PropType} from "vue";
import type {JWler, JWlerAvailability, Tour} from "@/api";
import {ApiClient} from "@/api";
import {inject} from "vue";
import {extractId} from "@/model_utils";
import JWlerLabel from "@/components/JWlerLabel.vue";

export default defineComponent({
  name: "TourTimeline",
  components: {JWlerLabel},
  props: {
    tour: {
      type: Object as PropType<Tour>,
    },
  },
  data() {
    return {
      jwlers: [] as Array<JWler>,
      availabilities: [] as Array<JWlerAvailability>,
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      const apiClient: ApiClient = inject("api")!;
      for (let i = 0; i < this.tour?.jwlers.length!; i++) {
        this.jwlers.push({
          id: 0,
          name: "",
          chlaus: false,
          driver: false,
          active: false,
          availabilities: [],
        });
        const url = this.tour?.jwlers[i]!;
        apiClient.api
          .retrieveJWler(extractId(url))
          .then(jwler => {
            this.jwlers[i] = jwler;
          })
          .catch(console.log);
        //todo retrieve availabilities
      }
    },
  },
});
</script>

<template>
  <div class="tour-timeline">
    <h3>{{ tour!.name }}</h3>
    <div v-for="j in jwlers" :key="j.id">
      <JWlerLabel :jwler="j" />
    </div>
  </div>
</template>

<style scoped></style>
