<template>
  <div>
    <StartedForm @submit="handleRecordCreated" :isLoading="isContentLoading" />
  </div>
</template>

<script setup lang="ts">
import StartedForm from "../components/StartedForm.vue";
import type { Record } from "../../typings/record";
import type { ApiError } from "../../typings/apiError";

const { isContentLoading, toggleLoading, showError, showMessage } = useToast();
type NewRecord = Omit<Record, "id">;

async function handleRecordCreated(newRecord: NewRecord) {
  try {
    toggleLoading(true);
    await $fetch("/api/record", {
      method: "POST",
      body: newRecord,
    });

    navigateTo("/");
  } catch (error) {
    console.error("Ошибка при получении данных записи:", error);
    showError(error as ApiError);
  } finally {
    toggleLoading(false);
  }
}
</script>
