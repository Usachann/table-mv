<template>
  <div class="mobile-table">
    <div
      v-for="(row, index) in rows"
      :key="index"
      class="mobile-row mb-4 p-4 bg-white rounded-lg shadow"
    >
      <div class="flex justify-between items-center mb-4">
        <h4 class="font-semibold">Запись #{{ index + 1 }}</h4>
        <select class="rounded-md" v-model="row.tableRecordStatus">
          <option value="Снимались">Снимались</option>
          <option value="Не снимались">Не снимались</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Этаж</label
          >
          <TextInput
            v-model:input="row.floor"
            input-type="number"
            placeholder="Этаж"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Медсестра</label
          >
          <TextInput
            v-model:input="row.nurseName"
            input-type="text"
            placeholder="Фамилия"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Фамилия</label
        >
        <TextInput
          v-model:input="row.surname"
          input-type="text"
          placeholder="Фамилия"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Мама</label>
        <TextInput
          v-model:input="row.motherPhone"
          input-type="text"
          placeholder="+7"
          class="mb-1"
          :max="17"
          @input="(e) => handlePhoneInput(e, row, 'motherPhone')"
        />
        <TextInput
          v-model:input="row.motherName"
          input-type="text"
          placeholder="Имя"
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Папа</label>
        <TextInput
          v-model:input="row.fatherPhone"
          input-type="text"
          placeholder="+7"
          class="mb-1"
          :max="17"
          @input="(e) => handlePhoneInput(e, row, 'fatherPhone')"
        />
        <TextInput
          v-model:input="row.fatherName"
          input-type="text"
          placeholder="Имя"
        />
      </div>

      <div class="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Пол</label
          >
          <select class="rounded-md w-full" v-model="row.gender">
            <option value="М">М</option>
            <option value="Ж">Ж</option>
            <option value="ДВ">ДВ</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Ребенок</label
          >
          <TextInput
            v-model:input="row.childNumber"
            input-type="number"
            placeholder="Номер"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Время</label
          >
          <TextInput
            :input="formatTimeForInput(row.time)"
            input-type="time"
            placeholder="Время"
            @input="handleTimeChange($event, row)"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Пометки</label
        >
        <textarea
          class="rounded-lg w-full"
          v-model="row.notes"
          rows="2"
          @input="autoResize($event)"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ОПН</label>
        <select class="rounded-md w-full" v-model="row.OPN">
          <option :value="true">Да</option>
          <option :value="false">Нет</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableData } from "../../typings/record";
import TextInput from "./Ui/TextInput.vue";

const props = defineProps<{
  rows: TableData[];
  formatTimeForInput: (date: Date) => string;
}>();

const emit = defineEmits<{
  (e: "update:rows", rows: TableData[]): void;
  (e: "phone-input", event: Event, row: TableData, field: string): void;
  (e: "time-change", event: Event, row: TableData): void;
  (e: "auto-resize", event: Event): void;
}>();

function handlePhoneInput(event: Event, row: TableData, field: string) {
  emit("phone-input", event, row, field);
}

function handleTimeChange(event: Event, row: TableData) {
  emit("time-change", event, row);
}

function autoResize(event: Event) {
  emit("auto-resize", event);
}
</script>

<style lang="scss" scoped>
.mobile-table {
  display: flex;
  flex-direction: column;
}

.mobile-row {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-bottom: 15px;
}

.mobile-row h4 {
  margin-bottom: 15px;
  font-weight: 600;
}

.mobile-row label {
  display: block;
  font-weight: 500;
  margin-bottom: 5px;
  color: #4a5568;
}

.mobile-row input,
.mobile-row select,
.mobile-row textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.mobile-row textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
