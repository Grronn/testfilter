// ============================================================
// PERIODSELECT — дропдаун «все / последняя / сегодня / неделя / месяц»
// ============================================================
// Это левый элемент в панели фильтров.
//
// Radix Select — доступный (a11y) кастомный select.
// Он рендерит кнопку-триггер + выпадающее содержимое через Portal.
//
// Паттерн: Controller (useController) — потому что Select.Root
// это не нативный <select>, а кастомный компонент.
// useController даёт нам { field } — объект с value и onChange.
//
// Что изучить:
//   https://www.radix-ui.com/primitives/docs/components/select
//   "react hook form useController"
// ============================================================

import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useController } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { SvodkiFiltersForm, Period } from "../../types";
import { PERIOD_OPTIONS } from "../../types";

interface PeriodSelectProps {
  control: Control<SvodkiFiltersForm>;
}

export function PeriodSelect({ control }: PeriodSelectProps) {
  // useController подписывается на поле "period" в форме.
  // field.value — текущее значение (например "все")
  // field.onChange — вызываем когда пользователь выбрал новый период
  const { field } = useController({ name: "period", control });

  return (
    <Select.Root
      value={field.value}
      onValueChange={(val) => field.onChange(val as Period)}
    >
      {/*
        Select.Trigger — кнопка которую нажимает пользователь.
        aria-label нужен для скринридеров (доступность).
      */}
      <Select.Trigger className="period-select__trigger" aria-label="Выбрать период">
        <Select.Value />
        <Select.Icon className="period-select__icon">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      {/*
        Select.Portal рендерит контент вне текущего DOM-узла (в document.body).
        Это решает проблему когда родитель имеет overflow:hidden или z-index.
        Без Portal выпадающий список мог бы обрезаться родительским элементом.
      */}
      <Select.Portal>
        <Select.Content className="period-select__content" position="popper" sideOffset={4}>
          <Select.ScrollUpButton className="select__scroll-btn">
            <ChevronUpIcon />
          </Select.ScrollUpButton>

          <Select.Viewport>
            {PERIOD_OPTIONS.map((opt) => (
              /*
                Select.Item — один пункт списка.
                Radix автоматически управляет:
                  - клавиатурной навигацией (стрелки, Enter, Escape)
                  - фокусом
                  - aria-selected
                Нам не нужно это реализовывать вручную.
              */
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="period-select__item"
              >
                {/* Select.ItemText — текст который отображает Select.Value в триггере */}
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="select__scroll-btn">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
