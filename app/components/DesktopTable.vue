<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>Этаж</th>
          <th>Снимались</th>
          <th>Медсестра</th>
          <th>Фамилия</th>
          <th>Телефон и имя мамы</th>
          <th>Телефон и имя папы</th>
          <th>Пол</th>
          <th>Какой ребенок</th>
          <th>Время</th>
          <th>Пометки</th>
          <th>ОПН</th>
          <th>М/е, ин-цы</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index">
          <td>{{ index + 1 }}</td>
          <td>
            <select
              class="rounded-md"
              v-model="row.floor"
              :style="{
                borderColor: row.floor ? '' : '#ff0000',
                borderWidth: row.floor ? '' : '2px',
              }"
            >
              <option v-for="floor in 10" :key="floor" :value="floor">
                {{ floor }}
              </option>
            </select>
          </td>
          <td>
            <select class="rounded-md" v-model="row.tableRecordStatus">
              <option value="Снимались">Снимались</option>
              <option value="Не снимались">Не снимались</option>
            </select>
          </td>
          <td>
            <TextInput
              v-model:input="row.nurseName"
              input-type="text"
              placeholder="Фамилия"
            />
          </td>
          <td>
            <TextInput
              v-model:input="row.surname"
              input-type="text"
              placeholder="Фамилия"
            />
          </td>
          <td>
            <TextInput
              v-model:input="row.motherPhone"
              input-type="text"
              placeholder="Тел."
              class="mb-1"
              :max="17"
              @input="(e) => handlePhoneInput(e, row, 'motherPhone')"
            />
            <textarea
              v-model="row.motherName"
              class="rounded-md p-2"
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
          </td>
          <td>
            <TextInput
              v-model:input="row.fatherPhone"
              input-type="text"
              placeholder="Тел."
              class="mb-1"
              :max="17"
              @input="(e) => handlePhoneInput(e, row, 'fatherPhone')"
            />
            <textarea
              class="rounded-md p-2"
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
          </td>
          <td>
            <select
              class="rounded-md"
              v-model="row.gender"
              :style="{
                borderColor: row.gender ? '' : '#ff0000',
                borderWidth: row.gender ? '' : '2px',
              }"
            >
              <option value="М">М</option>
              <option value="Ж">Ж</option>
              <option value="ДВ">ДВ</option>
            </select>
          </td>
          <td>
            <select
              class="rounded-md"
              v-model="row.childNumber"
              :style="{
                borderColor: row.childNumber ? '' : '#ff0000',
                borderWidth: row.childNumber ? '' : '2px',
              }"
            >
              <option
                v-for="childNumber in 10"
                :key="childNumber"
                :value="childNumber"
              >
                {{ childNumber }}
              </option>
            </select>
          </td>
          <td>
            <TextInput
              :input="formatTimeForInput(row.time)"
              input-type="time"
              placeholder="Время"
              @input="handleTimeChange($event, row)"
            />
          </td>
          <td>
            <textarea
              class="rounded-md p-2 border-[#D1D5DB]"
              v-model="row.notes"
              rows="1"
              cols="30"
              style="resize: none; overflow: hidden; height: 50px"
              @input="autoResize($event)"
            ></textarea>
          </td>
          <td>
            <select class="rounded-md" v-model="row.OPN">
              <option :value="true">Да</option>
              <option :value="false">Нет</option>
            </select>
          </td>
          <td>
            <div class="flex items-center justify-center">
              <input
                type="checkbox"
                v-model="row.isSpecialCase"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
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
.table-wrapper {
  overflow-x: scroll;
  width: 100%;
  max-width: 100%;
  min-height: 40px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  margin-bottom: 20px;
  table-layout: auto;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  // text-align: left;
}
th:nth-child(4), td:nth-child(4), /* Телефон мамы */
th:nth-child(5), td:nth-child(5), /* Фамилия */
th:nth-child(6), td:nth-child(6), /* Телефон мамы */
th:nth-child(7), td:nth-child(7)  /* Телефон папы */ {
  min-width: 160px;
}

th:nth-child(11), td:nth-child(11) /* Пометки */ {
  min-width: 150px;
}

select,
textarea {
  width: 100%;
  border: 1px solid #ccc;
  font-size: 14px;
}
</style>
