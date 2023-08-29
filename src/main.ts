import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.min.css";

import "bootstrap";

import {createApp} from "vue";
import App from "./App.vue";

import router from "./router";
import {createPinia} from "pinia";

import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {addIconsToLibrary} from "@/icons_library";
//import {PiniaUndoRedo} from "@/pinia_undo_redo";
import {API_URL} from "@/const";
import {PromiseApiApi} from "@/api/types/PromiseAPI";
import {createConfiguration} from "@/api/configuration";
import {ServerConfiguration} from "@/api/servers";

addIconsToLibrary();

const pinia = createPinia();
//pinia.use(PiniaUndoRedo);

const apiCient = new PromiseApiApi(
  createConfiguration({baseServer: new ServerConfiguration(API_URL, {})}),
);
createApp(App)
  .use(router)
  .use(pinia)
  .component("font-awesome-icon", FontAwesomeIcon)
  .provide("apiClient", apiCient)
  .mount("#app");
