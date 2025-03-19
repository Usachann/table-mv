export function preprocessPhoneInput(value: string): string {
  console.log("Original value:", value);
  let phone = value;

  // Проверка на 8 или 7 на позиции 4
  if (value.charAt(4) === "8" || value.charAt(4) === "7") {
    phone = setCharAt(value, 4, ""); // Удаляем символ на позиции 4
    console.log("Character removed at position 4:", phone);
  }

  console.log("Processed phone:", phone);
  return phone;
}

function setCharAt(str: string, index: number, chr: string) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}
