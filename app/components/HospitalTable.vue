<script setup lang="ts">
import type { Record, StaffInShift, TableData } from "../../typings/record";
import { v4 as uuidv4 } from "uuid";
import { GENDER, TABLE_RECORD_STATUSES } from "../../typings/record";
import { ref, watch, computed } from "vue";

const props = defineProps<{
  record: Record;
}>();

const emit = defineEmits<{
  (e: "update:record", record: Record): void;
}>();

const staffData = ref<StaffInShift[]>([]);
const rows = ref<TableData[]>([]);

const recycling = ref("");
const nurses = ref("");
const delayed = ref("");
const staff = ref("");
const leader = ref("");
const photographer = ref("");
const videographer = ref("");
const staffTransportCost = ref<number | null>(null);
const leaderTransportCost = ref<number | null>(null);
const photographerTransportCost = ref<number | null>(null);
const videographerTransportCost = ref<number | null>(null);

const formatTimeForInput = computed(() => {
  return (date: Date) => {
    if (!date) return "";
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };
});

watch(
  () => props.record,
  (newRecord) => {
    if (newRecord) {
      staffData.value = [...newRecord.staffInShift];
      rows.value = [...newRecord.tableData];
    }
  },
  { immediate: true }
);

function autoResize(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  target.style.height = "auto";
  target.style.height = target.scrollHeight + "px";
}

function addRow() {
  const newRow: TableData = {
    recordId: uuidv4(),
    floor: "1",
    nurseName: "",
    surname: "",
    motherPhone: "",
    motherName: "",
    fatherPhone: "",
    fatherName: "",
    gender: GENDER.MALE,
    childNumber: 1,
    time: new Date(),
    notes: "",
    tableRecordStatus: TABLE_RECORD_STATUSES.NOT_SHOT,
    OPN: false,
  };

  rows.value.push(newRow);
}

function handleTimeChange(event: Event, row: TableData) {
  const target = event.target as HTMLInputElement;
  const timeParts = target.value.split(":");
  if (timeParts.length !== 2) return;

  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);
  if (isNaN(hours) || isNaN(minutes)) return;

  const newDate = new Date(row.time);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  row.time = newDate;
}

const submit = () => {
  // Собираем все данные из формы
  const updatedRecord: Record = {
    ...props.record,
    staffInShift: staffData.value.map((staff) => ({
      recordId: props.record.id,
      staffName: staff.staffName || "",
      staff: staff.staff,
      staffTransportCost: staff.staffTransportCost,
      inShift: staff.inShift,
    })),
    tableData: rows.value.map((row) => ({
      recordId: props.record.id,
      floor: String(row.floor),
      nurseName: row.nurseName,
      surname: row.surname,
      motherPhone: row.motherPhone,
      motherName: row.motherName,
      fatherPhone: row.fatherPhone,
      fatherName: row.fatherName,
      gender: row.gender,
      childNumber: row.childNumber,
      time: new Date(row.time),
      notes: row.notes,
      tableRecordStatus: row.tableRecordStatus,
      OPN: Boolean(row.OPN),
    })),
  };

  emit("update:record", updatedRecord);
};

function getStaffLabel(index: number): string {
  const labels = ["Ведущая", "Фотограф", "Видеооператор"];
  return labels[index] || `Сотрудник ${index + 1}`;
}
</script>

<template>
  <div class="table-container">
    <h3 v-if="record">
      Дата: {{ new Date(record.dateTime).toLocaleDateString() }} | Роддом:
      <strong>{{ record.hospitalName }}</strong>
    </h3>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>№</th>
            <th>Этаж</th>
            <th>Медсестра</th>
            <th>Фамилия</th>
            <th>Телефон и имя мамы</th>
            <th>Телефон и имя папы</th>
            <th>Пол</th>
            <th>Какой ребенок</th>
            <th>Время</th>
            <th>Время и Пометки</th>
            <th>Снимались</th>
            <th>ОПН</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td>{{ index + 1 }}</td>
            <td><input v-model="row.floor" type="number" /></td>
            <td>
              <input
                v-model="row.nurseName"
                type="text"
                placeholder="Фамилия"
              />
            </td>
            <td>
              <input v-model="row.surname" type="text" placeholder="Фамилия" />
            </td>
            <td>
              <input v-model="row.motherPhone" type="text" placeholder="Тел." />
              <input v-model="row.motherName" type="text" placeholder="Имя" />
            </td>
            <td>
              <input v-model="row.fatherPhone" type="text" placeholder="Тел." />
              <input v-model="row.fatherName" type="text" placeholder="Имя" />
            </td>
            <td>
              <select v-model="row.gender">
                <option value="М">М</option>
                <option value="Ж">Ж</option>
              </select>
            </td>
            <td><input v-model="row.childNumber" type="number" min="1" /></td>
            <td>
              <input
                :value="formatTimeForInput(row.time)"
                type="time"
                @input="handleTimeChange($event, row)"
              />
            </td>
            <td>
              <textarea
                v-model="row.notes"
                rows="1"
                cols="30"
                style="resize: none; overflow: hidden; height: 50px"
                @input="autoResize($event)"
              ></textarea>
            </td>
            <td>
              <select v-model="row.tableRecordStatus">
                <option value="Снимались">Снимались</option>
                <option value="Не снимались">Не снимались</option>
              </select>
            </td>
            <td>
              <select v-model="row.OPN">
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="buttons-container">
      <button class="primary" @click.prevent="addRow">Добавить строку</button>
      <button class="secondary" @click.prevent="submit">Сохранить</button>
    </div>

    <div class="additional-info">
      <h4
        style="
          font-weight: 500;
          font-size: 20px;
          text-align: center;
          margin-bottom: 10px;
        "
      >
        Переработка
      </h4>
      <input
        class="input-field"
        v-model="recycling"
        type="text"
        placeholder="Время последней выписки"
      />

      <div style="margin-bottom: 10px">
        <label class="label">Опоздавшие:</label>
        <input
          class="input-field"
          v-model="delayed"
          type="text"
          placeholder="Фамилия"
        />
      </div>

      <div style="margin-bottom: 10px">
        <h4 style="font-weight: 500; font-size: 20px; text-align: center">
          Персонал
        </h4>
      </div>

      <div v-for="(staff, index) in staffData" :key="index" class="staff-row">
        <label class="label">{{ getStaffLabel(index) }}:</label>
        <div class="staff-inputs">
          <input
            class="input-field staff-name"
            v-model="staff.staffName"
            type="text"
            placeholder="Фамилия"
          />
          <input
            class="input-field staff-cost"
            v-model.number="staff.staffTransportCost"
            type="number"
            placeholder="Транспортный расход"
          />
        </div>
      </div>
    </div>
    <button class="secondary" @click.prevent="submit">Закрыть день</button>
  </div>
</template>

<style lang="scss" scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
  margin-bottom: 50px;
  margin-top: 50px;
  padding: 0 10px;
}

.buttons-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.input-field {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: #374151;
  margin-bottom: 2px;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
}
.label {
  font-size: 12px;
  margin-bottom: 0;
}

.additional-info {
  padding: 10px;
}

h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

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

input,
select,
textarea {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

button {
  width: 200px;
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
    background-color: #04aa6d;
    color: white;
    border: 1px solid #d1d5db;
    &:hover {
      background-color: #04aa6d;
      opacity: 0.8;
      transform: translateY(-1px);
    }
  }
}

@media (max-width: 768px) {
  .mobile-table {
    display: flex;
    flex-direction: column;
  }
  .mobile-row {
    background: #f9f9f9;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
  }
  .mobile-row h4 {
    margin-bottom: 10px;
  }
  .mobile-row label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  .mobile-row input,
  .mobile-row select,
  .mobile-row textarea {
    width: 100%;
  }
}

.staff-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 10px;
}

.staff-inputs {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.staff-name {
  flex: 2;
}

.staff-cost {
  flex: 1;
}
</style>
