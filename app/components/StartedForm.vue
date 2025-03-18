<template>
  <div class="container">
    <div v-if="!formVisible" class="buttons-container">
      <button @click.prevent="startShift" class="start-button primary">
        Начать смену
      </button>

      <button @click.prevent="continueShift" class="start-button secondary">
        Продолжить активную смену
      </button>
    </div>

    <div v-if="formVisible" class="form">
      <h2 class="title">Начало смены</h2>

      <div class="form-group">
        <label>Дата:</label>
        <input v-model="form.date" type="date" class="input-field" />
      </div>

      <div class="form-group">
        <label>Роддом:</label>
        <select v-model="form.hospital" class="input-field">
          <option
            v-for="hospital in hospitals"
            :key="hospital"
            :value="hospital"
          >
            {{ hospital }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Начало рабочего дня:</label>
        <p class="work-time">{{ form.workTime }}</p>
      </div>

      <div class="form-group">
        <label>Сотрудники на смене:</label>
        <div
          v-for="(staff, index) in form.staff"
          :key="index"
          class="staff-row"
        >
          <div class="staff-inputs">
            <input
              v-model="staff.name"
              type="text"
              :placeholder="'Сотрудник ' + (index + 1)"
              class="input-field staff-name"
            />
            <input
              v-model.number="staff.transportCost"
              type="number"
              placeholder="Транспортный расход"
              class="input-field transport-cost"
            />
          </div>
        </div>
      </div>

      <button @click="submitForm" class="submit-button">Начать</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { RECORD_STATUS } from "../../typings/record";
import type { Record } from "../../typings/record";
import { v4 as uuidv4 } from "uuid";

interface Form {
  date: string;
  hospital: string;
  staff: Array<{
    name: string;
    transportCost: number;
  }>;
  workTime: string;
}
type NewRecord = Omit<Record, "id">;

const formVisible = ref(false);
const hospitals = ["Роддом №1", "Роддом №2", "Роддом №3", "Роддом №4"];

const getCurrentTime = computed(() => {
  const now = new Date();
  return (
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0")
  );
});

function startShift() {
  formVisible.value = true;
  form.value.workTime = getCurrentTime.value;
}

const form = ref<Form>({
  date: new Date().toISOString().substr(0, 10),
  hospital: "",
  staff: [
    { name: "", transportCost: 0 },
    { name: "", transportCost: 0 },
    { name: "", transportCost: 0 },
  ],
  workTime: getCurrentTime.value,
});

const emit = defineEmits(["submit"]);

async function continueShift() {
  navigateTo("/");
}

async function submitForm() {
  const [hours, minutes] = form.value.workTime.split(":").map(Number);
  const dateTime = new Date(
    `${form.value.date}T${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:00`
  );

  const newRecord: NewRecord = {
    dateTime,
    workTimeEnd: 0,
    hospitalName: form.value.hospital,
    recordStatus: RECORD_STATUS.OPEN,
    shootsCount: 0,
    hospitalDischargesCount: 0,
    staffInShift: form.value.staff.map((staff) => ({
      recordId: uuidv4(),
      staff: "",
      staffName: staff.name,
      staffTransportCost: staff.transportCost,
      inShift: true,
    })),
    tableData: [],
  };

  try {
    const { data, error } = await useFetch("/api/record", {
      method: "POST",
      body: newRecord,
    });

    if (error.value) {
      throw error.value;
    }

    console.log("Запись успешно создана:", data.value);
    emit("submit", data.value.id);
    formVisible.value = false;
  } catch (error) {
    console.error("Ошибка:", error);
    // TODO: Добавить отображение ошибки пользователю
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f9fafb;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 380px;
}

.start-button {
  width: 100%;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  padding-block: 0.75rem;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border: none;

  &.primary {
    background-color: #3b82f6;
    color: white;
    &:hover {
      background-color: #2563eb;
      transform: translateY(-1px);
    }
  }

  &.secondary {
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    &:hover {
      background-color: #e5e7eb;
      transform: translateY(-1px);
    }
  }
}

.form {
  width: 100%;
  max-width: 380px;
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
  label {
    display: block;
    color: #374151;
    margin-bottom: 0.25rem;
  }
}

.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: #374151;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
}

.work-time {
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;
}

.staff-row {
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.staff-inputs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.staff-name {
  flex: 2;
}

.transport-cost {
  flex: 1;
}

.submit-button {
  width: 100%;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  background-color: #3b82f6;
  color: white;
  font-size: 1.125rem;
  padding-block: 0.75rem;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text &:hover {
    background-color: #2563eb;
  }
}
</style>
