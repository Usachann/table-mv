<template>
  <button
    :class="[
      'start-button',
      buttonClass,
      { 'opacity-50 cursor-not-allowed': disabled || loading },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="loader"></span>
    <slot v-if="!loading"></slot>
  </button>
</template>

<script setup>
import { computed } from "vue";

const emit = defineEmits(["click"]);

const props = defineProps({
  type: {
    type: String,
    default: "primary", // "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "dark"
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const buttonClass = computed(() => {
  return {
    primary: "primary",
    secondary: "secondary",
    success: "success",
    danger: "danger",
    warning: "warning",
    info: "info",
    dark: "dark",
  }[props.type];
});

const handleClick = (event) => {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  if (!props.loading && !props.disabled) {
    emit("click", event);
  }
};
</script>

<style scoped>
.start-button {
  width: 100%;
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
}

/* Primary (синий) */
.start-button.primary {
  background-color: #3b82f6;
  color: white;
}
.start-button.primary:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

/* Secondary (зеленый) */
.start-button.secondary {
  background-color: #04aa6d;
  color: white;
  border: 1px solid #d1d5db;
}
.start-button.secondary:hover {
  background-color: #04aa6d;
  opacity: 0.8;
  transform: translateY(-1px);
}

/* Success (ярко-зеленый) */
.start-button.success {
  background-color: #22c55e;
  color: white;
}
.start-button.success:hover {
  background-color: #16a34a;
  transform: translateY(-1px);
}

/* Danger (красный) */
.start-button.danger {
  background-color: #ef4444;
  color: white;
}
.start-button.danger:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}

/* Warning (желтый) */
.start-button.warning {
  background-color: #fbbf24;
  color: #78350f;
}
.start-button.warning:hover {
  background-color: #f59e0b;
  transform: translateY(-1px);
}

/* Info (голубой) */
.start-button.info {
  background-color: #38bdf8;
  color: white;
}
.start-button.info:hover {
  background-color: #0ea5e9;
  transform: translateY(-1px);
}

/* Dark (темный) */
.start-button.dark {
  background-color: #374151;
  color: white;
}
.start-button.dark:hover {
  background-color: #1f2937;
  transform: translateY(-1px);
}

.loader {
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 0.5s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
