export function formatToman(value: number): string {
  return `${Math.round(value).toLocaleString("fa-IR")} تومان`;
}

export function formatInteger(value: number): string {
  return Math.round(value).toLocaleString("fa-IR");
}
