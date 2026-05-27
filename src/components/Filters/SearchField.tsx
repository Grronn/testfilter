// ============================================================
// SEARCHFIELD — ПОЛЕ ПОИСКА
// ============================================================
// Простое текстовое поле с иконкой.
// Использует register (не Controller) — это нативный input.
// ============================================================

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { UseFormRegister, FieldValues, Path } from "react-hook-form";

interface SearchFieldProps<F extends FieldValues> {
  register: UseFormRegister<F>;
  name: Path<F>;
  placeholder?: string;
}

export function SearchField<F extends FieldValues>({
  register,
  name,
  placeholder = "Поиск...",
}: SearchFieldProps<F>) {
  return (
    <div className="search-field">
      <MagnifyingGlassIcon className="search-field__icon" />
      <input
        type="text"
        className="search-field__input"
        placeholder={placeholder}
        // register подключает input к RHF — он знает о его значении
        {...register(name)}
      />
    </div>
  );
}
