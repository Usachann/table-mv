<template>
  <div>
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
    </div>

    <HospitalTable
      v-else-if="currentRecord"
      :record="currentRecord"
      @update:record="handleRecordUpdate"
      @close-day="handleRecordUpdate"
      :key="`record-${currentRecord.id}`"
    />

    <div v-else class="no-records">
      <div class="no-records-content">
        <div class="error-message">Записи за сегодня не найдены.</div>
        <UButton type="primary" @click="navigateTo('/crecteRecord')">
          Создать запись
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Record } from "../../typings/record";
import UButton from "../components/Ui/UButton.vue";

const isLoading = ref(true);
const currentRecord = ref<Record | null>(null);
const fechedOpenRecord = ref<Record | null>(null);

async function fetchTodayRecords() {
  try {
    isLoading.value = true;
    const today = new Date().toISOString().split("T")[0];

    const data = await $fetch(`/api/record/date/${today}`);

    if (data && data.length > 0) {
      // 🔍 Ищем запись с recordStatus === "открыто"
      const openRecord = data.find(
        (record: Record) => record.recordStatus === "открыто"
      );

      console.log("openRecord, ", openRecord);
      if (openRecord) {
        currentRecord.value = openRecord;
      } else {
        currentRecord.value = null;
      }
    } else {
      currentRecord.value = null;
      console.warn("❗ Нет данных на сегодня.");
    }

    isLoading.value = false;
  } catch (err) {
    console.error("Ошибка при загрузке данных:", err);
  } finally {
    isLoading.value = false;
  }
}

async function handleRecordUpdate(updatedRecord: Record) {
  try {
    isLoading.value = true;
    await $fetch(`/api/update-record/${updatedRecord.id}`, {
      method: "POST",
      body: updatedRecord,
    });
    currentRecord.value = updatedRecord;
  } catch (err) {
    console.error("Ошибка при обновлении данных:", err);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchTodayRecords();
});

// async function handleRecordCreated(recordId: string) {
//   try {
//     isLoading.value = true;
//     const { data, error } = await $fetch(`/api/record/${recordId}`);

//     if (error.value) {
//       throw error.value;
//     }

//     currentRecord.value = data.value;
//   } catch (error) {
//     console.error("Ошибка при получении данных записи:", error);
//     // TODO: Добавить отображение ошибки пользователю
//   } finally {
//     isLoading.value = false;
//   }
// }
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  gap: 1rem;
  color: #374151;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.no-records {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.no-records-content {
  text-align: center;
}

.error-message {
  color: #6b7280;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.create-record-btn {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}
</style>
