// ============================================================
// SELECTFIELD — КОМПОНЕНТ SELECT (ВЫПАДАЮЩИЙ СПИСОК)
// ============================================================
// Используется для фильтров с одним выбором (например, приоритет).
//
// Radix Select состоит из нескольких частей:
//   Root      — провайдер состояния
//   Trigger   — кнопка которую кликает пользователь
//   Value     — отображает выбранное значение
//   Icon      — стрелочка
//   Portal    — рендерит контент вне DOM-дерева (избегает overflow)
//   Content   — выпадающий список
//   Item      — один пункт списка
//   ItemText  — текст пункта
//
// Что изучить: "Radix UI Select", "react hook form Controller"
// ============================================================

import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useController, Control, FieldValues, Path } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps<F extends FieldValues> {
  name: Path<F>;
  control: Control<F>;
  options: Option[];
  label: string;
  placeholder?: string;
}

export function SelectField<F extends FieldValues>({
  name,
  control,
  options,
  label,
  placeholder = "Выберите...",
}: SelectFieldProps<F>) {
  const { field } = useController({ name, control });

  return (
    <div className="filter-group">
      <label className="filter-group__label">{label}</label>

      {/*
        Select.Root — управляет открытием/закрытием и выбранным значением.
        value/onValueChange — контролируемый режим (мы управляем значением).
        "" означает "ничего не выбрано" — для сброса.
      */}
      <Select.Root
        value={field.value || ""}
        onValueChange={(val) => {
          // Если выбрали тот же пункт — сбрасываем (toggle)
          // или просто устанавливаем новое значение
          field.onChange(val === field.value ? undefined : val);
        }}
      >
        {/*
          Select.Trigger — кнопка-триггер.
          asChild можно использовать чтобы сделать своим элементом.
        */}
        <Select.Trigger className="select-trigger">
          {/* Select.Value отображает label выбранного Item */}
          <Select.Value placeholder={placeholder} />
          <Select.Icon className="select-icon">
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>

        {/*
          Select.Portal — рендерит контент вне текущего DOM узла.
          Это нужно чтобы избежать проблем с overflow: hidden у родителей.
          Изучи: "Radix UI Portal" для понимания зачем это нужно.
        */}
        <Select.Portal>
          <Select.Content className="select-content" position="popper">
            {/* Кнопка прокрутки вверх (появляется если много пунктов) */}
            <Select.ScrollUpButton className="select-scroll-button">
              <ChevronUpIcon />
            </Select.ScrollUpButton>

            <Select.Viewport className="select-viewport">
              {options.map((option) => (
                /*
                  Select.Item — пункт списка.
                  value — значение которое попадёт в форму.
                  Radix сам управляет focus, aria-selected и keyboard nav.
                */
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="select-item"
                >
                  {/* Select.ItemText — текст который ищет Select.Value */}
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>

            <Select.ScrollDownButton className="select-scroll-button">
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
