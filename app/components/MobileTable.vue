<template>
  <div class="mobile-table">
    <div
      v-for="(row, index) in rows"
      :key="index"
      class="mobile-row mb-4 p-4 bg-white rounded-lg shadow"
    >
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-semibold">Запись #{{ index + 1 }}</h4>
        <select class="rounded-md w-3/4" v-model="row.tableRecordStatus">
          <option value="Снимались">Снимались</option>
          <option value="Не снимались">Не снимались</option>
        </select>
      </div>

      <div v-if="row.tableRecordStatus === 'Снимались'">
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div style="display: none">
            <label class="text-m font-medium text-gray-700 mb-1">Этаж</label>
            <select
              class="rounded-md w-full"
              v-model="row.floor"
              :style="{
                borderColor: row.floor ? '' : '#ff0000',
                borderWidth: row.floor ? '' : '2px',
              }"
            >
              <option v-for="floor in 5" :key="floor" :value="floor">
                {{ floor }}
              </option>
            </select>
          </div>
          <div style="display: none">
            <label class="block text-m font-medium text-gray-700 mb-1">
              Медсестра
            </label>
            <TextInput
              v-model:input="row.nurseName"
              input-type="text"
              placeholder="Фамилия"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-m font-medium text-gray-700 mb-1"
            >Мама</label
          >
          <TextInput
            v-model:input="row.motherPhone"
            input-type="text"
            placeholder="+7"
            class="mb-1"
            :max="17"
            @input="(e) => handlePhoneInput(e, row, 'motherPhone')"
          />
          <textarea
            v-model="row.motherName"
            class="rounded-md p-2 w-full"
            :style="{
              borderColor: row.motherName ? '' : '#ff0000',
              borderWidth: row.fatherName ? '' : '2px',
            }"
            rows="1"
            cols="30"
            placeholder="Имя мамы"
            style="resize: none; overflow: hidden"
            @input="autoResize($event)"
          ></textarea>
        </div>

        <div class="mb-4">
          <label class="block text-m font-medium text-gray-700 mb-1"
            >Папа</label
          >
          <TextInput
            v-model:input="row.fatherPhone"
            input-type="text"
            placeholder="+7"
            class="mb-1"
            :max="17"
            @input="(e) => handlePhoneInput(e, row, 'fatherPhone')"
          />
          <textarea
            class="rounded-md p-2 w-full"
            v-model="row.fatherName"
            rows="1"
            cols="30"
            placeholder="Имя папы"
            :style="{
              borderColor: row.fatherName ? '' : '#ff0000',
              borderWidth: row.fatherName ? '' : '2px',
            }"
            style="resize: none; overflow: hidden"
            @input="autoResize($event)"
          ></textarea>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-m font-medium text-gray-700 mb-1"
              >Пол</label
            >
            <select
              class="rounded-md w-full"
              v-model="row.gender"
              :style="{
                borderColor: row.gender ? '' : '#ff0000',
                borderWidth: row.gender ? '' : '2px',
              }"
            >
              <option value="М">М</option>
              <option value="Ж">Д</option>
              <option value="ДВ">ДВ</option>
            </select>
          </div>
          <div style="display: none">
            <label class="block text-m font-medium text-gray-700 mb-1">
              Ребенок
            </label>
            <select
              class="rounded-md w-full"
              v-model="row.childNumber"
              :style="{
                borderColor: row.childNumber ? '' : '#ff0000',
                borderWidth: row.childNumber ? '' : '2px',
              }"
            >
              <option
                v-for="childNumber in 5"
                :key="childNumber"
                :value="childNumber"
              >
                {{ childNumber }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-m font-medium text-gray-700 mb-1"
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

        <div class="mb-3">
          <label class="block text-m font-medium text-gray-700 mb-1">ОПН</label>
          <TextInput
            input-type="checkbox"
            v-model:input="row.OPN"
            class="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="block text-m font-medium text-gray-700 mb-1">
            М/е, ин-цы
          </label>
          <TextInput
            input-type="checkbox"
            v-model:input="row.isSpecialCase"
            class="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-m font-medium text-gray-700 mb-1"
          >Фамилия</label
        >
        <TextInput
          v-model:input="row.surname"
          input-type="text"
          placeholder="Фамилия"
        />
      </div>

      <div class="mb-4">
        <label class="block text-m font-medium text-gray-700 mb-1"
          >Пометки</label
        >
        <textarea
          class="rounded-lg w-full"
          v-model="row.notes"
          rows="2"
          @input="autoResize($event)"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableData } from "../../typings/record";
import TextInput from "./Ui/TextInput.vue";

defineProps<{
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
  // margin-bottom: 15px;
  font-weight: 600;
  margin-right: 10px;
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
  // width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background-color: #ffffff;
}

.mobile-row textarea {
  resize: vertical;
  // min-height: 80px;
}
</style>
