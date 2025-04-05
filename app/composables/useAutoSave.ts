import { onMounted, onBeforeUnmount } from "vue";

const STORAGE_KEY = "autosave_record";

/**
 * @param callback Функция для отправки данных на сервер
 * @param interval Интервал в миллисекундах (по умолчанию 10 сек)
 */
export function useAutoSave(callback: () => void, interval: number = 10000) {
  let autoSaveInterval: ReturnType<typeof setInterval> | null = null;

  const saveToLocalStorage = (data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Ошибка при сохранении в localStorage:", error);
    }
  };

  const getFromLocalStorage = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Ошибка при получении данных из localStorage:", error);
      return null;
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ Данные удалены из localStorage");
  };

  const checkNetworkAndSync = async () => {
    if (navigator.onLine) {
      const offlineData = getFromLocalStorage();
      if (offlineData) {
        try {
          callback();
          clearLocalStorage();
        } catch (err) {
          console.error("Ошибка при синхронизации данных:", err);
        }
      }
    }
  };

  const startAutoSave = () => {
    const offlineData = getFromLocalStorage();
    if (!navigator.onLine && offlineData) {
      saveToLocalStorage(offlineData);
    } else {
      callback();
    }
  };

  const handleOnline = async () => {
    await checkNetworkAndSync();
  };

  onMounted(() => {
    window.addEventListener("online", handleOnline);
    startAutoSave();
  });

  onBeforeUnmount(() => {
    window.removeEventListener("online", handleOnline);
  });

  return {
    saveToLocalStorage,
    getFromLocalStorage,
    clearLocalStorage,
  };
}
