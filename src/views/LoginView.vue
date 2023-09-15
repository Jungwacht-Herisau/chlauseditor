<script lang="ts">
import {defineComponent} from "vue";
import {getApiToken} from "@/api_client_factory";
import router from "@/router";

export default defineComponent({
  name: "LoginView",
  data() {
    return {
      user: "",
      pass: "",
      error: "",
    };
  },
  methods: {
    async tryLogin() {
      const err = await getApiToken(this.user, this.pass);
      if (err == null) {
        console.info("login successful");
        return router.push("/timeline");
      } else {
        console.log(err);
        this.error = err;
      }
    },
  },
});
</script>

<template>
  <form class="card">
    <div class="mb-3">
      <label for="inputUser" class="form-label">Benutzername</label>
      <input type="text" class="form-control" id="inputUser" aria-describedby="userHelp" v-model="user" />
      <div id="userHelp" class="form-text">Format: vorname.nachname</div>
    </div>
    <div class="mb-3">
      <label for="inputPass" class="form-label">Passwort</label>
      <input type="password" class="form-control" id="inputPass" v-model="pass" autocomplete="current-password" />
    </div>
    <div class="invalid-feedback mb-3" v-if="error">{{ error }}</div>
    <button type="button" class="btn btn-primary" @click="tryLogin">Login</button>
  </form>
</template>

<style scoped>
form {
  width: fit-content;
  height: fit-content;
  padding: 1rem;

  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  margin: auto;
}

.invalid-feedback {
  display: block;
}
</style>