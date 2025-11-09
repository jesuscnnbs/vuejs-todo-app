<template>
  <div>
    <h1>Not found</h1>
    <div class="content">
      <p>This is the 404 page content</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composition API imports if needed
import { ref, onMounted } from 'vue'

// Component logic here
const pageTitle = ref('Not found View')

onMounted(() => {
  console.log('Not found view component mounted')
})
</script>

<style scoped>
.content {
  margin-top: 20px;
}
</style>
