<script lang="ts">
import DayTimeline from "@/components/DayTimeline.vue";
import {useStore} from "@/store";
import AnimatedSpinner from "@/components/AnimatedSpinner.vue";
import CollapsibleContent from "@/components/CollapsibleContent.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {allowDropDeletableElements, deleteDroppedElement} from "@/drag_drop";

export default {
  methods: {deleteDroppedElement, allowDropEverything: allowDropDeletableElements},
  components: {FontAwesomeIcon, CollapsibleContent, AnimatedSpinner, DayTimeline},
  data() {
    return {
      store: useStore(),
    };
  },
  created() {
    this.store.fetchData();
  },
  watch: {
    dataReady() {
      if (this.dataReady) {
        this.store.clearUndoRedo();
      }
    },
  },
  computed: {
    dataReady() {
      return this.store.fetchedEntities.size >= 7;
    },
  },
};
</script>

<template>
  <nav class="navbar navbar-expand-sm bg-primary-subtle">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">ChlausEditor</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle Navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <div class="btn-group" role="group">
              <button
                type="button"
                class="btn btn-lg"
                @click="store.undo()"
                :disabled="!store.undoRedoData.undoPossible()"
              >
                <font-awesome-icon icon="rotate-left" />
              </button>
              <button
                type="button"
                class="btn btn-lg"
                @click="store.redo()"
                :disabled="!store.undoRedoData.redoPossible()"
              >
                <font-awesome-icon icon="rotate-right" />
              </button>
              <button type="button" class="btn btn-lg btn-primary">
                <font-awesome-icon icon="floppy-disk" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <main
    v-if="dataReady"
    @dragover="event => allowDropEverything(event)"
    @drop="event => deleteDroppedElement(event)"
  >
    <CollapsibleContent
      v-for="dateKey in store.days"
      :key="dateKey"
      :title="new Date(dateKey).toLocaleDateString()"
      header-tag="h2"
    >
      <DayTimeline :date="new Date(dateKey)" />
    </CollapsibleContent>
  </main>
  <div v-else id="spinner-container">
    <AnimatedSpinner />
  </div>
</template>

<style scoped>
#spinner-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
}

#spinner-container .animated-spinner {
  margin: auto;
}
</style>