<template>
  <div class="container">
    <div v-if="!formVisible" class="buttons-container">
      <UButton type="primary" @click.prevent="startShift">
        Начать смену
      </UButton>

      <UButton type="secondary" @click.prevent="continueShift">
        Продолжить активную смену
      </UButton>
    </div>

    <div v-if="formVisible" class="form">
      <h2 class="title">Начало смены</h2>

      <div class="form-group">
        <label>Дата:</label>
        <TextInput
          v-model:input="form.date"
          input-type="date"
          placeholder="Выберите дату"
        />
      </div>

      <div class="form-group">
        <label>Роддом:</label>
        <select v-model="form.hospital" class="input-field">
          <option
            v-for="hospital in hospitals"
            :key="hospital.id"
            :value="hospital.name"
          >
            {{ hospital.name }}
          </option>
        </select>
        <p v-if="v$.hospital.$error" class="error">Роддом обязателен</p>
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
            <TextInput
              v-model:input="staff.name"
              input-type="text"
              :placeholder="staff.staffName"
              class="staff-name"
            />
            <TextInput
              v-model:input="staff.transportCost"
              input-type="number"
              placeholder="Транспортный расход"
              class="i transport-cost"
            />
          </div>
        </div>
      </div>

      <UButton @click="submitForm" type="primary" :loading="isLoading"
        >Начать</UButton
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import TextInput from "./Ui/TextInput.vue";
import UButton from "./Ui/UButton.vue";

import { ref, computed } from "vue";
import { RECORD_STATUS } from "../../typings/record";
import type { Record } from "../../typings/record";
import { v4 as uuidv4 } from "uuid";
import { useHospitalStore } from "../stores/hospitals";
import useVuelidate from "@vuelidate/core";
import { required } from "@vuelidate/validators";

const validateRules = {
  hospital: {
    required,
  },
};

interface Form {
  date: string;
  hospital: string;
  staff: Array<{
    staffName: string;
    name: string;
    transportCost: number;
  }>;
  workTime: string;
}
type NewRecord = Omit<Record, "id">;
const emit = defineEmits(["submit"]);

const formVisible = ref(false);
const hospitals = useHospitalStore().allHospitals;
const isLoading = ref(false);

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
    { staffName: "Ведущая", name: "", transportCost: 0 },
    { staffName: "Фотограф", name: "", transportCost: 0 },
    { staffName: "Оператор", name: "", transportCost: 0 },
  ],
  workTime: getCurrentTime.value,
});

const v$ = useVuelidate(validateRules, form);

async function continueShift() {
  navigateTo("/");
}

async function submitForm() {
  v$.value.$touch();
  if (v$.value.$invalid) {
    return;
  }

  isLoading.value = true;
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
      staff: staff.name,
      staffName: staff.staffName,
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
    isLoading.value = false;
    emit("submit", data.value.id);
    formVisible.value = false;
  } catch (error) {
    console.error("Ошибка:", error);
    // TODO: Добавить отображение ошибки пользователю
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.error {
  @include Error;
}

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
</style>
