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
            <TextInput
              v-model:input="row.floor"
              input-type="number"
              placeholder="Этаж"
            />
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
            <TextInput
              v-model:input="row.motherName"
              input-type="text"
              placeholder="Имя"
            />
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
            <TextInput
              v-model:input="row.fatherName"
              input-type="text"
              placeholder="Имя"
            />
          </td>
          <td>
            <select class="rounded-md" v-model="row.gender">
              <option value="М">М</option>
              <option value="Ж">Ж</option>
              <option value="ДВ">ДВ</option>
            </select>
          </td>
          <td>
            <TextInput
              v-model:input="row.childNumber"
              input-type="number"
              placeholder="Номер"
            />
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
              class="rounded-lg"
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
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  margin-bottom: 20px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

select,
textarea {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}
</style>
