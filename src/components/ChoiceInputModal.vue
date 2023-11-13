<script lang="ts">
import {defineComponent} from "vue";
import {Modal} from "bootstrap";

export default defineComponent({
  name: "ChoiceInputModal",
  emits: ["cancel", "ok"],
  props: {
    question: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      currentlyOpen: false,
      okClicked: false,
      choices: new Map<string, any>(),
    };
  },
  methods: {
    open(choices: Map<string, any>) {
      this.choices = choices;
      this.currentlyOpen = true;
      this.$nextTick(() => {
        const modal = this.$refs.modal as HTMLDivElement;
        Modal.getOrCreateInstance(modal).show();
        modal.classList.add("show");
        modal.addEventListener(
          "hide.bs.modal",
          () => {
            if (!this.okClicked) {
              this.cancel();
            }
          },
          true,
        );
      });
    },
    ok(value: any) {
      this.okClicked = true;
      const modal = this.$refs.modal as HTMLDivElement;
      Modal.getOrCreateInstance(modal).hide();
      modal.addEventListener("hidden.bs.modal", () => {
        this.okClicked = false;
        this.currentlyOpen = false;
      });
      this.$emit("ok", value);
    },
    cancel() {
      this.currentlyOpen = false;
      this.$emit("cancel");
    },
  },
});
</script>

<template>
  <div
    v-if="currentlyOpen"
    class="modal fade"
    id="choiceInputModal"
    tabindex="-1"
    aria-labelledby="choiceInputModalLabel"
    aria-hidden="true"
    ref="modal"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="textInputModalLabel">{{ question }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="btn-group-vertical" role="group">
            <button
              v-for="txt in choices.keys()"
              :key="txt"
              type="button"
              class="btn btn-primary"
              @click="ok(choices.get(txt))"
            >
              {{ txt }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="ok">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>