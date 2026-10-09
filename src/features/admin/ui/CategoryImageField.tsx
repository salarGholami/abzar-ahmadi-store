"use client";

import AdminImageField from "./AdminImageField";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
};

export default function CategoryImageField({ value, onChange, disabled }: Props) {
  return (
    <AdminImageField
      value={value}
      onChange={onChange}
      disabled={disabled}
      purpose="CATEGORY"
      label="تصویر دسته‌بندی"
    />
  );
}
