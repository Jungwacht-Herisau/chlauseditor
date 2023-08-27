import "./assets/main.css";
import "bootstrap/dist/css/bootstrap.min.css";

import "bootstrap";

import {createApp} from "vue";
import App from "./App.vue";

import router from "./router";
import {createPinia} from "pinia";

import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {addIconsToLibrary} from "@/icons_library";

addIconsToLibrary();

createApp(App)
  .use(router)
  .use(createPinia())
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");
