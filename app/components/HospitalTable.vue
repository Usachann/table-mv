<script setup lang="ts">
import type {
  Record,
  StaffInShift,
  TableData,
  RecordStatus,
} from "../../typings/record";
import type { ApiError } from "../../typings/apiError";
import { v4 as uuidv4 } from "uuid";
import { TABLE_RECORD_STATUS, RECORD_STATUS } from "../../typings/record";
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
import { debounce } from "lodash-es";

const { isContentLoading, toggleLoading, showError, showMessage } = useToast();

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

const recycling: Ref<Date | null> = ref(null);

const delayed: Ref<string> = ref(""); //уточнить
const showConfirmModal: Ref<boolean> = ref(false);
const isAddingRow: Ref<boolean> = ref(false);

const formatTimeForInput = computed(() => {
  return (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };
});

const shootsCount = computed(() => {
  return rows.value.filter(
    (row) => row.tableRecordStatus === TABLE_RECORD_STATUS.SHOT
  ).length;
});

const hospitalDischargesCount = computed(() => {
  return rows.value.length;
});

function handleTimeChangeForRecycling(event: Event) {
  const target = event.target as HTMLInputElement;
  const timeParts = target.value.split(":");
  if (timeParts.length !== 2) return;

  const hours = Number(timeParts[0]);
  const minutes = Number(timeParts[1]);
  if (isNaN(hours) || isNaN(minutes)) return;

  if (!recycling.value) {
    recycling.value = new Date();
  }

  const newDate = new Date(recycling.value);
  newDate.setHours(hours);
  newDate.setMinutes(minutes);
  recycling.value = newDate;
}

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
      recycling.value = newRecord.recycling || null;
      delayed.value = newRecord.delayed || "";
    }
  },
  { immediate: true }
);

function getStaffLabel(index: number): string {
  const labels = ["Администратор", "Фотограф", "Видеооператор"];
  return labels[index] || `Сотрудник ${index + 1}`;
}
function addRow() {
  const rowTime = new Date();

  rows.value.push({
    recordId: uuidv4(),
    floor: 0,
    nurseName: "",
    surname: "",
    motherPhone: "",
    motherName: "",
    fatherPhone: "",
    fatherName: "",
    gender: "",
    childNumber: 0,
    time: rowTime,
    notes: "",
    tableRecordStatus: TABLE_RECORD_STATUS.SHOT,
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

const { saveToLocalStorage, getFromLocalStorage, clearLocalStorage } =
  useAutoSave(() => {
    getFromLocalStorage();
  }, 10000);

const updateRecord = (status: RecordStatus | null = null) => {
  if (!rows.value.length) {
    return;
  }

  const updatedRecord: Record = {
    ...props.record,
    recordStatus: status || props.record.recordStatus,
    tableData: rows.value,
    staffInShift: staffData.value,
    recycling: recycling.value ?? undefined,
    delayed: delayed.value,
    shootsCount: shootsCount.value,
    hospitalDischargesCount: hospitalDischargesCount.value,
  };

  // console.log("updatedRecord", updatedRecord);
  clearLocalStorage();
  saveToLocalStorage(updatedRecord);

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
      body: { record: updatedRecord },
    });

    if (!response.success) {
      throw new Error("Ошибка при закрытии дня");
    }
    updateRecord(RECORD_STATUS.CLOSED);
    showConfirmModal.value = false;
    clearLocalStorage();
    navigateTo("/crecteRecord");
  } catch (error) {
    showError(error as ApiError, { autoClose: 1000 });
    console.error("Error closing day:", error);
  }
}

function handleCancelClose() {
  showConfirmModal.value = false;
}

const debouncedUpdateRecord = debounce(() => {
  if (rows.value.length > 0) {
    updateRecord();
  }
}, 2000);

watch(
  [rows, staffData, recycling, delayed, shootsCount, hospitalDischargesCount],
  () => {
    nextTick(() => {
      debouncedUpdateRecord();
    });
  },
  { deep: true, flush: "post" }
);
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
      <div class="flex flex-row items-end gap-4 md:items-end mb-2">
        <div class="w-full md:w-1/2">
          <label class="block text-gray-700 font-semibold mb-1">
            Время последней выписки:
          </label>
          <TextInput
            :input="formatTimeForInput(recycling)"
            input-type="time"
            placeholder="Время последней выписки"
            @input="handleTimeChangeForRecycling"
          />
        </div>

        <div class="w-full flex flex-col md:w-1/2">
          <label class="block text-gray-700 font-semibold mb-1">
            Опоздавшие:
          </label>
          <TextInput
            v-model:input="delayed"
            input-type="text"
            placeholder="Фамилии"
          />
        </div>
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
