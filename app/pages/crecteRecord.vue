<template>
  <div>
    <StartedForm @submit="handleRecordCreated" />
  </div>
</template>

<script setup lang="ts">
import StartedForm from "../components/StartedForm.vue";
const isLoading = ref(false);

async function handleRecordCreated(recordId: string) {
  try {
    isLoading.value = true;
    navigateTo("/");
  } catch (error) {
    console.error("Ошибка при получении данных записи:", error);
  } finally {
    isLoading.value = false;
  }
}
</script>
