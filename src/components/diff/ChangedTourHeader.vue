<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: "ChangedTourHeader",
  props: {
    oldName: {
      type: String,
      required: false,
    },
    newName: {
      type: String,
      required: false,
    },
  }
})
</script>

<template>
  <h5>
    <font-awesome-icon v-if="oldName && newName" icon="file-pen"/>
    <font-awesome-icon v-else-if="oldName" icon="file-circle-minus"/>
    <font-awesome-icon v-else icon="file-circle-plus"/>
    <template v-if="oldName && newName && oldName!==newName">
      <span v-if="oldName" class="removed-text">{{ oldName }}</span>
      <span v-if="newName" class="added-text">{{ newName }}</span>
    </template>
    <template v-else-if="oldName">
      <span>{{ oldName }}</span>
    </template>
    <template v-else>
      <span>{{ newName }}</span>
    </template>
  </h5>
</template>

<style scoped>
span {
  margin-left: 0.5rem;
}
</style>