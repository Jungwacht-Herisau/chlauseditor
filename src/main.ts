import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.min.css";

import "bootstrap";

import {createApp} from "vue";
import App from "./App.vue";

import router from "./router";
import {createPinia} from "pinia";

import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {addIconsToLibrary} from "@/icons_library";
import {PiniaUndoRedo} from "@/pinia_undo_redo";
import {ApiClient} from "@/api";
import {API_URL} from "@/const";

addIconsToLibrary();

const pinia = createPinia();
pinia.use(PiniaUndoRedo);

createApp(App)
  .use(router)
  .use(pinia)
  .component("font-awesome-icon", FontAwesomeIcon)
  .provide("apiClient", new ApiClient({BASE: API_URL}))
  .mount("#app");
