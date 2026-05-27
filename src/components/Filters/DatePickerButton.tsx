// ============================================================
// DATEPICKERBUTTON — кнопка-иконка календаря + попап с датой
// ============================================================
// Нажимаешь на иконку календаря → появляется Popover с input[type=date].
// Выбираешь дату → она добавляется как чип в Redux.
//
// Radix Popover — "контролируемый" попап:
//   Root    — управляет open/close состоянием
//   Trigger — кнопка открытия (у нас иконка календаря)
//   Portal  — рендерит содержимое вне DOM (избегает overflow-hidden)
//   Content — само содержимое попапа
//   Arrow   — стрелочка
//   Close   — кнопка закрытия
//
// Что изучить:
//   https://www.radix-ui.com/primitives/docs/components/popover
// ============================================================

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { CalendarIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useAppDispatch } from "../../store";
import { addChip } from "../../store/slices/svodkiSlice";
import { FilterChip } from "../../types";

// Форматируем YYYY-MM-DD → DD.MM.YYYY (как в дизайне "07.04.2026")
function formatDateLabel(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

export function DatePickerButton() {
  const dispatch = useAppDispatch();

  // Локальный state для значения date input внутри попапа.
  // Не нужен в RHF форме потому что мы не храним "текущую дату picker'а" —
  // мы сразу создаём чип при применении.
  const [dateValue, setDateValue] = useState("");

  // Контролируем открытие попапа вручную (controlled Popover)
  // чтобы закрыть его после применения даты
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    if (!dateValue) return;

    const label = formatDateLabel(dateValue);
    const chip: FilterChip = {
      id: `date-${dateValue}`,
      type: "date",
      label,
      value: dateValue,
    };

    dispatch(addChip(chip));
    setDateValue("");
    setOpen(false); // закрываем попап после выбора
  };

  return (
    /*
      Popover.Root — контейнер состояния.
      open + onOpenChange — "controlled" режим: мы сами управляем открытием.
      Без этих пропсов было бы "uncontrolled" — Radix управляет сам.
      Controlled нужен когда хотим закрывать попап программно (после apply).
    */
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        {/*
          asChild означает: не создавай дополнительный DOM-элемент,
          а "слейся" с дочерним (нашей кнопкой).
          Это позволяет использовать свою кнопку как триггер.
        */}
        <button type="button" className="filter-icon-btn" title="Выбрать дату">
          <CalendarIcon width={16} height={16} />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className="datepicker-popover" sideOffset={6} align="start">
          <div className="datepicker-popover__header">
            <span className="datepicker-popover__title">Выбрать дату</span>
            <Popover.Close asChild>
              <button type="button" className="popover-close-btn">
                <Cross2Icon />
              </button>
            </Popover.Close>
          </div>

          <input
            type="date"
            className="datepicker-input"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
          />

          <button
            type="button"
            className="datepicker-apply-btn"
            onClick={handleApply}
            disabled={!dateValue}
          >
            Применить
          </button>

          <Popover.Arrow className="popover-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
