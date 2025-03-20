<template>
  <div class="container">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
    </div>

    <HospitalTable
      v-else-if="currentRecord"
      :record="currentRecord"
      @update:record="handleRecordUpdate"
      :key="`record-${currentRecord.id}`"
    />

    <div v-else class="no-records">
      <div class="no-records-content">
        <UButton type="primary" @click.prevent="navigateTo('/crecteRecord')">
          Создать новую запись
        </UButton>

        <div v-if="fetchedOpenRecords.length > 0" class="open-records">
          <h3 class="text-left mb-4">Открытые записи:</h3>
          <div class="records-list">
            <div
              v-for="record in fetchedOpenRecords"
              :key="record.id"
              class="record-item"
              @click="selectRecord(record)"
            >
              <div class="record-info">
                <span class="hospital-name">{{ record.hospitalName }}</span>
                <span class="record-time">{{
                  formatTime(record.dateTime)
                }}</span>
              </div>
              <div class="record-stats">
                <span>Выписок: {{ record.hospitalDischargesCount }}</span>
                <span>Съемок: {{ record.shootsCount }}</span>
              </div>
            </div>
          </div>
        </div>
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
const fetchedOpenRecords = ref<Record[]>([]);

function formatTime(dateTime: string | Date) {
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function selectRecord(record: Record) {
  currentRecord.value = record;
}

async function fetchTodayRecords() {
  try {
    isLoading.value = true;
    const today = new Date().toISOString().split("T")[0];

    const data = await $fetch(`/api/record/date/${today}`);

    if (data && data.length > 0) {
      // Сохраняем все открытые записи
      fetchedOpenRecords.value = data.filter(
        (record: Record) => record.recordStatus === "открыто"
      );
      currentRecord.value = null;
    } else {
      currentRecord.value = null;
      fetchedOpenRecords.value = [];
      console.warn("❗ Нет данных на сегодня.");
    }
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
.no-records {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.no-records-content {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;

  :deep(.button) {
    width: 100%;
    max-width: 600px;
    height: 48px;
    font-size: 1.125rem;
  }
}

.open-records {
  width: 100%;

  h3 {
    font-size: 1.25rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 1rem;
  }
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-item {
  padding: 15px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: white;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .record-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .hospital-name {
      font-weight: 500;
      color: #1f2937;
    }

    .record-time {
      color: #6b7280;
    }
  }

  .record-stats {
    display: flex;
    gap: 15px;
    font-size: 0.875rem;
    color: #6b7280;
  }
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.8);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  pointer-events: none;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  pointer-events: none;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
