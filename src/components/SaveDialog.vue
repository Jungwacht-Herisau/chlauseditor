<script lang="ts">
import {defineComponent} from "vue";
import StateDiff from "@/components/diff/StateDiff.vue";

export default defineComponent({
  name: "SaveDialog",
  components: {StateDiff},
  data() {
    return {
      showing: false,
    }
  },
  mounted() {
    const element = document.getElementById("saveModal")!;
    const observer = new MutationObserver(mutations => {
      this.showing = element.classList.contains("show");
    });
    observer.observe(element, {attributes: true, attributeFilter: ["class"]});
  },
});
</script>

<template>
  <div
      class="modal fade"
      id="saveModal"
      tabindex="-1"
      aria-labelledby="saveModalLabel"
      aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="saveModalLabel">Änderungen speichern</h1>
          <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Schliessen"
          ></button>
        </div>
        <div class="modal-body">
          <StateDiff v-if="showing"/>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
          <button type="button" class="btn btn-primary">Speichern</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>