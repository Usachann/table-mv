<template>
  <div v-for="(staff, index) in staffData" :key="index" class="staff-row mb-2">
    <label class="label block text-gray-700 font-semibold mb-1">
      {{ getStaffLabel(index) }}:
    </label>
    <div class="staff-inputs grid grid-cols-2 gap-4">
      <TextInput
        v-model:input="staff.staff"
        input-type="text"
        placeholder="Фамилия"
        :error="v$.staffData?.$each?.$response.$errors[index].staff.length"
      />
      <TextInput
        v-model:input="staff.staffTransportCost"
        input-type="number"
        placeholder="Транспортный расход"
        :error="
          v$.staffData?.$each?.$response.$errors[index].staffTransportCost
            .length
        "
      />
      <!-- <pre>{{ v$.staffData?.$each?.$response.$errors[index] }}</pre> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import TextInput from "./Ui/TextInput.vue";
import { useVuelidate } from "@vuelidate/core";
import { required, helpers, minValue } from "@vuelidate/validators";
import type { StaffInShift } from "../../typings/record";

const props = defineProps<{
  staffData: StaffInShift[];
  getStaffLabel: (index: number) => string;
}>();

const rules = {
  staffData: {
    $each: helpers.forEach({
      staff: { required },
      staffTransportCost: {
        required,
        minValue: minValue(1),
      },
    }),
  },
};
const reactiveStaffData = computed(() => props.staffData);
const v$ = useVuelidate(rules, { staffData: reactiveStaffData });
</script>
