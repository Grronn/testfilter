// ============================================================
// CHECKBOXGROUP — КОМПОНЕНТ ГРУППЫ ЧЕКБОКСОВ
// ============================================================
// Используется для фильтров где можно выбрать несколько значений
// (статусы, типы, регионы).
//
// React Hook Form не работает напрямую с Radix Checkbox,
// поэтому мы используем паттерн "Controller":
//
//   Controller — это обёртка RHF для сторонних UI компонентов.
//   Она связывает RHF state (register, watch, setValue) с
//   компонентом через props: { field: { value, onChange } }
//
// Что изучить: "react hook form Controller", "Radix Checkbox"
// ============================================================

import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { useController, Control, FieldValues, Path } from "react-hook-form";

interface Option<T extends string> {
  value: T;
  label: string;
}

// Generic-компонент — T это тип значения (SvodkaStatus, SvodkaType и т.д.)
// F extends FieldValues — тип всей формы (SvodkiFilters)
interface CheckboxGroupProps<T extends string, F extends FieldValues> {
  // name — путь к полю в форме, например "statuses" или "types"
  // Path<F> гарантирует что такое поле существует в форме
  name: Path<F>;
  control: Control<F>;   // control — объект из useForm(), передаётся вниз
  options: Option<T>[];  // Список вариантов для отображения
  label: string;         // Заголовок группы
}

export function CheckboxGroup<T extends string, F extends FieldValues>({
  name,
  control,
  options,
  label,
}: CheckboxGroupProps<T, F>) {
  // ============================================================
  // useController — хук для интеграции с RHF
  // field.value  — текущее значение поля из RHF store
  // field.onChange — функция для обновления значения в RHF
  //
  // Альтернатива: Controller компонент (обёртка над useController)
  // Используй useController когда хочешь логику без JSX-обёртки
  // ============================================================
  const { field } = useController({ name, control });

  // field.value здесь — массив выбранных значений (T[])
  const selectedValues: T[] = field.value || [];

  // Обработчик клика на чекбокс
  // checked может быть boolean | "indeterminate" (Radix feature)
  const handleChange = (value: T, checked: boolean | "indeterminate") => {
    if (checked === true) {
      // Добавляем значение в массив
      field.onChange([...selectedValues, value]);
    } else {
      // Удаляем значение из массива
      field.onChange(selectedValues.filter((v) => v !== value));
    }
  };

  return (
    <div className="filter-group">
      <label className="filter-group__label">{label}</label>
      <div className="checkbox-list">
        {options.map((option) => (
          <div key={option.value} className="checkbox-item">
            {/*
              Radix Checkbox.Root — кастомный чекбокс
              checked — контролируемое значение (есть ли в массиве)
              onCheckedChange — колбек при изменении
              id нужен для связи с label через htmlFor
            */}
            <Checkbox.Root
              id={`${String(name)}-${option.value}`}
              className="checkbox-root"
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) => handleChange(option.value, checked)}
            >
              {/*
                Checkbox.Indicator — отображается только когда checked=true
                Внутри ставим иконку галочки
              */}
              <Checkbox.Indicator className="checkbox-indicator">
                <CheckIcon />
              </Checkbox.Indicator>
            </Checkbox.Root>

            {/* label связан с чекбоксом через htmlFor = id чекбокса */}
            <label
              htmlFor={`${String(name)}-${option.value}`}
              className="checkbox-label"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
