import type { Ref } from "vue";

export function usePhoneInput(validationState: Ref<{ [key: string]: string }>) {
  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/\D/g, "");

    if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
      cleaned = cleaned.slice(1);
    }

    cleaned = cleaned.slice(0, 10);

    const part1 = cleaned.slice(0, 3);
    const part2 = cleaned.slice(3, 6);
    const part3 = cleaned.slice(6, 8);
    const part4 = cleaned.slice(8, 10);

    let formatted = "+7";

    if (part1) formatted += ` ${part1}`;
    if (part2) formatted += ` ${part2}`;
    if (part3) formatted += ` ${part3}`;
    if (part4) formatted += ` ${part4}`;

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

    if (validationState?.value) {
      validationState.value[field] = formatted;
    }
  };

  return {
    handlePhoneInput,
    formatPhoneNumber,
  };
}
