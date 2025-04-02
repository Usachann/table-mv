import type { ApiError } from "../../typings/apiError";
import { toast } from "vue3-toastify";

interface ToastOptions {
  position?:
    | "top-right"
    | "top-center"
    | "top-left"
    | "bottom-right"
    | "bottom-center"
    | "bottom-left";
  autoClose?: number | false;
  theme?: "light" | "dark" | "colored";
  type?: "success" | "info" | "error" | "warning" | "default";
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  hideProgressBar?: boolean;
  draggable?: boolean;
  transition?: "bounce" | "slide" | "zoom" | "flip";
  toastId?: string | number;
}

interface State {
  isContentLoading: boolean;
  appError: ApiError | null;
}

const state = reactive<State>({ isContentLoading: false, appError: null });

export default () => {
  const { isContentLoading, appError } = toRefs(state);

  const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 2000,
    theme: "light",
    closeOnClick: true,
    pauseOnHover: false,
    hideProgressBar: true,
    draggable: false,
  };

  const toggleLoading = (value: boolean) => {
    state.isContentLoading = value;
  };

  const toggleError = (error: ApiError | null) => {
    state.appError = error;
  };

  const showError = (err: ApiError, options = {}) => {
    const errorMessage =
      err.message || err.statusMessage || "Произошла неизвестная ошибка";

    toast.error(`Ошибка: ${errorMessage}`, {
      ...defaultOptions,
      ...options,
    });
  };

  const showMessage = (
    options: ToastOptions = {},
    text: string = "Данные успешно сохранены!"
  ) => {
    const finalOptions = { ...defaultOptions, ...options };

    toast.success(text, finalOptions);
  };

  return {
    isContentLoading,
    appError,
    toggleLoading,
    toggleError,
    showError,
    showMessage,
  };
};
