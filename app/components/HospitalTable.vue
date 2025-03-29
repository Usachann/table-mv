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
import DesktopTable from "./DesktopTable.vue";
import MobileTable from "./MobileTable.vue";
import { validatePhone } from "../../utils/phone";
import { usePhoneInput } from "../composables/usePhoneInput";
import useVuelidate from "@vuelidate/core";
import StaffNamesAndTransportCost from "./StaffNamesAndTransportCost.vue";
import { useAutoSave } from "../composables/useAutoSave";

const validateRules = {
  motherPhone: {
    validatePhone,
  },
  fatherPhone: {
    validatePhone,
  },
};

const validationState = ref({
  motherPhone: "",
  fatherPhone: "",
});

const { handlePhoneInput } = usePhoneInput(validationState);

const props = defineProps<{
  record: Record;
  isLoadingOpenRecords: boolean;
}>();

const emit = defineEmits<{
  (e: "update:record", record: Record): void;
}>();

const staffData = ref<StaffInShift[]>([]);
const rows = ref<TableData[]>([]);

const staffComponent = ref<InstanceType<
  typeof StaffNamesAndTransportCost
> | null>(null);

const recycling: Ref<string> = ref("");
const delayed: Ref<string> = ref(""); //уточнить
const showConfirmModal: Ref<boolean> = ref(false);
const isAddingRow: Ref<boolean> = ref(false);

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

function autoResize(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  target.style.height = "auto";
  target.style.height = target.scrollHeight + "px";
}

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

function getStaffLabel(index: number): string {
  const labels = ["Ведущая", "Фотограф", "Видеооператор"];
  return labels[index] || `Сотрудник ${index + 1}`;
}

function addRow() {
  rows.value.push({
    recordId: uuidv4(),
    floor: 0,
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
    tableRecordStatus: TABLE_RECORD_STATUSES.SHOT,
    OPN: false,
    isSpecialCase: false,
  });
  isAddingRow.value = true;
}

function cancelAddRow() {
  rows.value.pop();
  isAddingRow.value = false;
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

const v$ = useVuelidate(validateRules, validationState);

const updateRecord = (status: RecordStatus | null = null) => {
  if (!rows.value.length) {
    return;
  }

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

  emit("update:record", updatedRecord);
  isAddingRow.value = false;
};

async function handleCloseDay() {
  v$.value.$touch();
  if (v$.value.$invalid) {
    return;
  }

  if (!rows.value.length) return;
  showConfirmModal.value = true;
}

async function handleConfirmClose() {
  v$.value.$touch();
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

    if (!response.success) {
      throw new Error("Ошибка при закрытии дня");
    }

    updateRecord(RECORD_STATUS.CLOSED);
    showConfirmModal.value = false;
    navigateTo("/crecteRecord");
  } catch (error) {
    console.error("Error closing day:", error);
  }
}

function handleCancelClose() {
  showConfirmModal.value = false;
}
if (rows.value.length > 0) useAutoSave(updateRecord, 10000);
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

    <!-- Десктопная версия таблицы -->
    <div class="hidden md:block">
      <DesktopTable
        :rows="rows"
        :formatTimeForInput="formatTimeForInput"
        @phone-input="handlePhoneInput"
        @time-change="handleTimeChange"
        @auto-resize="autoResize"
      />
    </div>

    <!-- Мобильная версия таблицы -->
    <div class="md:hidden">
      <MobileTable
        :rows="rows"
        :formatTimeForInput="formatTimeForInput"
        @phone-input="handlePhoneInput"
        @time-change="handleTimeChange"
        @auto-resize="autoResize"
      />
    </div>

    <div class="buttons-container">
      <template v-if="!isAddingRow">
        <UButton type="primary" @click.prevent="addRow"
          >Добавить выписку</UButton
        >
      </template>
      <template v-else>
        <UButton type="danger" @click.prevent="cancelAddRow">Отмена</UButton>
      </template>
      <UButton
        :loading="isLoadingOpenRecords"
        type="secondary"
        @click.prevent="updateRecord()"
        >Сохранить</UButton
      >
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
        <label class="block text-gray-700 font-semibold mb-1"
          >Опоздавшие:</label
        >
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

      <StaffNamesAndTransportCost
        ref="staffComponent"
        :staffData="staffData"
        :getStaffLabel="getStaffLabel"
      />
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
  margin-bottom: 50px;
  margin-top: 50px;
  padding: 0 10px;
}

.record-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.buttons-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.additional-info {
  padding: 10px;
}

h3 {
  font-size: 18px;
  margin-bottom: 10px;
}
</style>
