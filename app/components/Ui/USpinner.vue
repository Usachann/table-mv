<template>
  <div
    v-if="isLoading"
    :class="[
      'loading',
      background ? 'bg-opacity-80' : 'bg-opacity-0',
      position === 'fixed' ? 'fixed' : 'absolute',
    ]"
  >
    <div
      class="spinner"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: `${borderWidth}px`,
        borderColor: `${color} transparent transparent transparent`,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  size: {
    type: Number,
    default: 40,
  },
  color: {
    type: String,
    default: "#3b82f6",
  },
  borderWidth: {
    type: Number,
    default: 4,
  },
  background: {
    type: Boolean,
    default: true,
  },
  position: {
    type: String as () => "fixed" | "absolute",
    default: "fixed",
  },
});
</script>

<style scoped lang="scss">
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 1);
  z-index: 9999;
  pointer-events: none;
}

.spinner {
  border-radius: 50%;
  animation: spin 1s linear infinite;
  pointer-events: none;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
