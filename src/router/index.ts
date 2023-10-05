import {createRouter, createWebHistory} from "vue-router";
import TimelineView from "@/views/TimelineView.vue";
import LoginView from "@/views/LoginView.vue";
import ValidationView from "@/views/ValidationView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: LoginView,
    },
    {
      path: "/timeline",
      name: "Timeline",
      component: TimelineView,
    },
    {
      path: "/validation",
      name: "Validation",
      component: ValidationView,
    },
  ],
});

export default router;
