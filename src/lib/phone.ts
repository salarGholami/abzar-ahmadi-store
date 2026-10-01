const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC = "٠١٢٣٤٥٦٧٨٩";

export function toEnglishDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC.indexOf(d)));
}

/** Normalizes Iranian mobile numbers to 09XXXXXXXXX. Returns "" when the value cannot be normalized. */
export function normalizePhone(value: unknown) {
  if (typeof value !== "string") return "";
  let digits = toEnglishDigits(value).replace(/[\s\-()]/g, "");
  if (digits.startsWith("+98")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("0098")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("98") && digits.length === 12) digits = `0${digits.slice(2)}`;
  else if (/^9\d{9}$/.test(digits)) digits = `0${digits}`;
  return /^09\d{9}$/.test(digits) ? digits : "";
}
