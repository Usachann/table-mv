import { onMounted, onBeforeUnmount, watch } from "vue";

/**
 * @param callback Функция, которая будет вызываться автоматически
 * @param interval Интервал в миллисекундах (по умолчанию 5000 мс)
 * @param deps Массив зависимостей для слежения и автосохранения (можно без этой хрени)
 */
export function useAutoSave(callback: () => void, interval: number = 20000) {
  let autoSaveInterval: ReturnType<typeof setInterval> | null = null;

  const startAutoSave = () => {
    autoSaveInterval = setInterval(() => {
      callback();
    }, interval);
  };

  const stopAutoSave = () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = null;
    }
  };

  onMounted(() => {
    startAutoSave();
  });

  onBeforeUnmount(() => {
    stopAutoSave();
  });
}
