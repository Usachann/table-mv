export function validatePhone(value: string) {
  if (!value) return true; // Разрешаем пустое значение
  const phoneRegExp = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
  return phoneRegExp.test(value);
}
