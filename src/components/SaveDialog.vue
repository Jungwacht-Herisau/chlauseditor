<script lang="ts">
import {defineComponent} from "vue";
import StateDiff from "@/components/diff/StateDiff.vue";
import {useStore} from "@/model/store";
import {Modal} from "bootstrap";

export default defineComponent({
  name: "SaveDialog",
  components: {StateDiff},
  data() {
    return {
      showing: false,
      successes: -1,
      errors: [] as string[],
    };
  },
  mounted() {
    const element = document.getElementById("saveModal")!;
    element.addEventListener("show.bs.modal", () => (this.showing = true));
    element.addEventListener("hidden.bs.modal", () => (this.showing = false));
  },
  methods: {
    async save() {
      this.successes = -1;
      this.errors = [];
      const [s, e] = await useStore().uploadDataChanges();
      this.successes = s;
      this.errors = e;
      if (this.errors.length == 0) {
        const element = document.getElementById("saveModal")!;
        Modal.getOrCreateInstance(element).hide();
      }
    },
  },
});
</script>

<template>
  <div class="modal fade" id="saveModal" tabindex="-1" aria-labelledby="saveModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="saveModalLabel">Änderungen speichern</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schliessen"></button>
        </div>
        <div class="modal-body">
          <StateDiff v-if="showing" />
          <hr />
          <span v-for="e in errors" :key="e" class="save-error-msg">{{ e }}</span>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
          <button type="button" class="btn btn-primary" @click="save">Speichern</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.save-error-msg {
  color: var(--bs-form-invalid-color);
}
</style>