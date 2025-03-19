<script setup lang="ts">
import type {
  Record,
  StaffInShift,
  TableData,
  RecordStatus,
} from "../../typings/record";
import { v4 as uuidv4 } from "uuid";
import {
  GENDER,
  TABLE_RECORD_STATUSES,
  RECORD_STATUS,
} from "../../typings/record";
import { ref, watch, computed } from "vue";
import TextInput from "./Ui/TextInput.vue";
import ConfirmModal from "./Ui/ConfirmModal.vue";
import UButton from "./Ui/UButton.vue";
import { preprocessPhoneInput } from "../../utils/phone";

const props = defineProps<{
  record: Record;
}>();

const emit = defineEmits<{
  (e: "update:record", record: Record): void;
  (e: "close-day", record: Record): void;
}>();

const staffData = ref<StaffInShift[]>([]);
const rows = ref<TableData[]>([]);

const recycling: Ref<string> = ref("");
const delayed: Ref<string> = ref(""); //уточнить
const showConfirmModal = ref(false);

const formatTimeForInput = computed(() => {
  return (date: Date) => {
    if (!date) return "";
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };
});

const shootsCount = computed(() => {
  return rows.value.filter(
    (row) => row.tableRecordStatus === TABLE_RECORD_STATUSES.SHOT
  ).length;
});

const hospitalDischargesCount = computed(() => {
  return rows.value.length;
});

watch(
  () => props.record,
  (newRecord) => {
    if (newRecord) {
      staffData.value = [...newRecord.staffInShift];
      rows.value = [...newRecord.tableData];
      recycling.value = newRecord.recycling || "";
      delayed.value = newRecord.delayed || "";
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
    floor: String(1),
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

const updateRecord = (status: RecordStatus | null = null) => {
  const updatedRecord: Record = {
    ...props.record,
    recordStatus: status || props.record.recordStatus,
    tableData: rows.value,
    staffInShift: staffData.value,
    recycling: recycling.value,
    delayed: delayed.value,
    shootsCount: shootsCount.value,
    hospitalDischargesCount: hospitalDischargesCount.value,
  };

  if (status === RECORD_STATUS.CLOSED) {
    emit("close-day", updatedRecord);
  } else {
    emit("update:record", updatedRecord);
  }
};

function getStaffLabel(index: number): string {
  const labels = ["Ведущая", "Фотограф", "Видеооператор"];
  return labels[index] || `Сотрудник ${index + 1}`;
}

function handleCloseDay() {
  showConfirmModal.value = true;
}

async function handleConfirmClose() {
  try {
    const updatedRecord = {
      ...props.record,
      recordStatus: RECORD_STATUS.CLOSED,
      tableData: rows.value,
      staffInShift: staffData.value,
      recycling: recycling.value,
      delayed: delayed.value,
      shootsCount: shootsCount.value,
      hospitalDischargesCount: hospitalDischargesCount.value,
    };
    const response = await $fetch("/api/close-record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ record: updatedRecord }),
    });
    console.log("response, ", response);

    if (!response.success) {
      throw new Error("Ошибка при закрытии дня");
    }

    updateRecord(RECORD_STATUS.CLOSED);
    showConfirmModal.value = false;
  } catch (error) {
    console.error("Error closing day:", error);
  }
}

function handleCancelClose() {
  showConfirmModal.value = false;
}
</script>

<template>
  <div class="table-container">
    <div v-if="record" class="record-info">
      <h3>
        Дата:
        <strong>{{ new Date(record.dateTime).toLocaleDateString() }}</strong>
        | Роддом:
        <strong>{{ record.hospitalName }}</strong>
      </h3>
      <h3>
        Проводилось:
        <strong>{{ shootsCount }}</strong>
      </h3>
      <h3>
        Выписывалось:
        <strong>{{ hospitalDischargesCount }}</strong>
      </h3>
    </div>
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
                input-type="phone"
                placeholder="Тел."
                class="mb-1"
                :max="11"
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
                input-type="phone"
                placeholder="Тел."
                class="mb-1"
                :max="11"
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
          </tr>
        </tbody>
      </table>
    </div>
    <div class="buttons-container">
      <UButton type="primary" @click.prevent="addRow">Добавить выписку</UButton>
      <UButton type="secondary" @click.prevent="updateRecord()">
        Сохранить
      </UButton>
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
      <TextInput
        v-model:input="recycling"
        input-type="text"
        placeholder="Время последней выписки"
      />

      <div style="margin-bottom: 10px">
        <label class="label">Опоздавшие:</label>
        <TextInput
          v-model:input="delayed"
          input-type="text"
          placeholder="Фамилии"
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
          <TextInput
            v-model:input="staff.staff"
            input-type="text"
            placeholder="Фамилия"
          />
          <TextInput
            v-model:input="staff.staffTransportCost"
            input-type="number"
            placeholder="Транспортный расход"
          />
        </div>
      </div>
    </div>
    <UButton type="secondary" @click.prevent="handleCloseDay">
      Закрыть день
    </UButton>

    <ConfirmModal
      :is-open="showConfirmModal"
      title="Подтверждение"
      message="Вы уверены, что хотите закрыть день? Это действие нельзя будет отменить."
      @confirm="handleConfirmClose"
      @cancel="handleCancelClose"
    />
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

.record-info {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.buttons-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
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

select,
textarea {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
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
  min-width: 0;
}

.staff-inputs :deep(input) {
  width: 100%;
}
</style>
