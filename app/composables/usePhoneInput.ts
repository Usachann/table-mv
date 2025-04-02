import type { Ref } from "vue";

export function usePhoneInput(validationState: Ref<{ [key: string]: string }>) {
  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/\D/g, "");

    if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
      cleaned = cleaned.slice(1);
    }

    if (cleaned.length === 0) return "";

    let formatted = "+7";
    if (cleaned.length > 0) formatted += " " + cleaned.slice(0, 3);
    if (cleaned.length > 3) formatted += " " + cleaned.slice(3, 6);
    if (cleaned.length > 6) formatted += " " + cleaned.slice(6, 8);
    if (cleaned.length > 8) formatted += " " + cleaned.slice(8, 10);

    return formatted;
  };

  const handlePhoneInput = (
    event: Event,
    target: { [key: string]: any },
    field: string
  ) => {
    const input = event.target as HTMLInputElement;
    const formatted = formatPhoneNumber(input.value);

    target[field] = formatted;
    if (validationState) {
      validationState.value[field] = formatted;
    }
  };

  return {
    handlePhoneInput,
    formatPhoneNumber,
  };
}
