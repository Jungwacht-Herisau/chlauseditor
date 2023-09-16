<script lang="ts">
import {defineComponent} from "vue";
import {Modal} from "bootstrap";

export default defineComponent({
  name: "TextInputModal",
  emits: ["cancel", "ok"],
  props: {
    question: {
      type: String,
      required: true,
      default: "Please enter a text",
    },
  },
  data() {
    return {
      currentlyOpen: false,
      okClicked: false,
      value: "",
    };
  },
  methods: {
    open(initialValue: string) {
      this.value = initialValue;
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
    ok() {
      this.okClicked = true;
      const modal = this.$refs.modal as HTMLDivElement;
      Modal.getOrCreateInstance(modal).hide();
      modal.addEventListener("hidden.bs.modal", () => {
        this.okClicked = false;
        this.currentlyOpen = false;
      });
      this.$emit("ok", this.value);
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
    id="textInputModal"
    tabindex="-1"
    aria-labelledby="textInputModalLabel"
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
          <input type="text" v-model="value" id="textInput" class="form-control" />
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