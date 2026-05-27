// ============================================================
// DATERANGEFIELD — ФИЛЬТР ПО ДИАПАЗОНУ ДАТ
// ============================================================
// Два поля: "дата от" и "дата до".
//
// Для простоты используем нативный input type="date".
// В реальном проекте можно заменить на Radix Popover + календарь,
// или библиотеку react-day-picker.
//
// Здесь показан паттерн register — альтернатива Controller.
// register подходит для простых нативных элементов (input, select).
// Controller нужен для кастомных компонентов (как Radix).
//
// Что изучить: "react hook form register vs Controller"
// ============================================================

import { UseFormRegister, FieldValues, Path } from "react-hook-form";

interface DateRangeFieldProps<F extends FieldValues> {
  // register — функция из useForm(), регистрирует нативный input
  register: UseFormRegister<F>;
  nameFrom: Path<F>;  // Имя поля "дата от" в форме
  nameTo: Path<F>;    // Имя поля "дата до" в форме
  label: string;
}

export function DateRangeField<F extends FieldValues>({
  register,
  nameFrom,
  nameTo,
  label,
}: DateRangeFieldProps<F>) {
  return (
    <div className="filter-group">
      <label className="filter-group__label">{label}</label>
      <div className="date-range">
        <div className="date-range__field">
          <span className="date-range__sublabel">От</span>
          {/*
            register(name) возвращает { name, ref, onChange, onBlur }
            которые spread'ятся на input.
            Это самый простой способ подключить input к RHF.
          */}
          <input
            type="date"
            className="date-input"
            {...register(nameFrom)}
          />
        </div>
        <div className="date-range__field">
          <span className="date-range__sublabel">До</span>
          <input
            type="date"
            className="date-input"
            {...register(nameTo)}
          />
        </div>
      </div>
    </div>
  );
}
