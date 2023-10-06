<script lang="ts">
import {RouterView} from "vue-router";
import {deleteApiToken, hasApiToken} from "@/api_client_factory";
import router from "@/router";
import {useStore} from "@/model/store";
import SaveDialog from "@/components/SaveDialog.vue";
import RouteNavItem from "@/components/RouteNavItem.vue";

export default {
  components: {
    RouteNavItem,
    SaveDialog,
    RouterView,
  },
  data() {
    return {
      store: useStore(),
    };
  },
  mounted() {
    document.body.setAttribute("data-bs-theme", "dark");
    if (!hasApiToken()) {
      router.push("/");
    } else if (!this.dataReady) {
      this.store.fetchData();
    }
  },
  methods: {
    logout() {
      deleteApiToken();
      router.push("/");
    },
  },
  computed: {
    dataReady() {
      return this.store.fetchingProgress.finished();
    },
    loadingProgress() {
      return this.store.fetchingProgress.progressFraction();
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
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <RouteNavItem name="Timeline" />
          <RouteNavItem name="Validation" />
        </ul>
        <div class="btn-group" role="group">
          <!--
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
          -->
          <button type="button" class="btn btn-lg btn-primary" data-bs-toggle="modal" data-bs-target="#saveModal">
            <font-awesome-icon icon="floppy-disk" />
          </button>
          <button type="button" class="btn btn-lg btn-secondary" @click="logout">
            <font-awesome-icon icon="right-from-bracket" />
          </button>
        </div>
      </div>
    </div>
  </nav>
  <main>
    <RouterView v-if="dataReady" />
    <div v-else id="spinner-container">
      <div class="progress">
        <div
          class="progress-bar"
          role="progressbar"
          :style="{width: loadingProgress * 100 + '%'}"
          aria-valuemin="0"
          :aria-valuenow="loadingProgress * 100"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  </main>
  <SaveDialog />
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

#spinner-container > * {
  margin: auto;
}

#spinner-container .progress {
  width: 50vw;
}

main {
  padding-top: 0.75rem;
  padding-left: 0.75rem;
}
</style>