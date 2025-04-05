<template>
  <div>
    <input
      :placeholder="placeholder"
      :maxlength="max"
      @focus="isFocused = true"
      @blur="isFocused = false"
      :class="[
        inputType === 'checkbox' ? 'w-6 h-6' : 'w-full p-2',
        'bg-white text-gray-800 border text-sm border-[#D1D5DB] rounded-md placeholder-gray-500 focus:outline-none',
        isFocused ? 'border-gray-900' : '',
        error ? 'border-red-500' : '',
        $attrs.class,
      ]"
      :type="inputType"
      v-model="inputComputed"
    />
    <span
      v-if="error"
      class="text-red-500 text-[12px] font-semibold min-h-[20px]"
    >
      Обязательное поле
    </span>
    <span v-else class="min-h-[20px]"></span>
  </div>
</template>
<script setup>
import { ref, toRefs, computed, defineEmits } from "vue";

const emit = defineEmits(["update:input"]);
const props = defineProps([
  "input",
  "placeholder",
  "max",
  "inputType",
  "error",
]);
const { input, placeholder, max, inputType, error } = toRefs(props);

let isFocused = ref(false);

const inputComputed = computed({
  get: () => input.value,
  set: (val) => {
    emit("update:input", val);
  },
});
</script>
