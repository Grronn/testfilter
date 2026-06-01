// ============================================================
// DATERANGEPICKER — выбор диапазона дат
// ============================================================
// Иконка-кнопка 📅 → Radix Popover → Calendar (react-day-picker)
//
// shadcn UI Date Picker (Range) реализован точно так же:
//   https://ui.shadcn.com/docs/components/date-picker#date-range-picker
//   "The Date Picker is built using a composition of
//    the <Popover /> and the <Calendar /> components."
//
// Отличие от shadcn: мы не устанавливаем shadcn/ui и Tailwind.
// Мы берём ТОТ ЖЕ принцип и реализуем своими стилями.
//
// СВЯЗЬ С REACT HOOK FORM:
//   useController({ name: "dateRange", control })
//   field.value → { from: Date | undefined, to: Date | undefined }
//   field.onChange → вызывается когда пользователь нажимает "применить"
//
// Что изучить:
//   https://react-day-picker.js.org/guides/range-selection
//   https://www.radix-ui.com/primitives/docs/components/popover
// ============================================================

import { useState, useMemo, useCallback } from "react";
import type { DateRange } from "react-day-picker";
import * as Popover from "@radix-ui/react-popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { isBefore } from "date-fns";
import { useController } from "react-hook-form";
import type { Control } from "react-hook-form";
import { Calendar } from "./Calendar";
import type { SvodkiFiltersForm } from "../../../types";
import styles from "./DateRangePicker.module.scss";

interface DateRangePickerProps {
  control: Control<SvodkiFiltersForm>;
}

export function DateRangePicker({ control }: DateRangePickerProps) {
  // ──────────────────────────────────────────────────────────
  // useController — связываем с полем "dateRange" в форме
  //
  // field.value  = { from: Date | undefined, to: Date | undefined }
  // field.onChange = функция для сохранения выбранного диапазона
  //
  // Мы НЕ сохраняем в форму при каждом клике по дню.
  // Сохраняем только при нажатии "применить".
  // Поэтому держим локальный state "pendingRange" для календаря.
  // ──────────────────────────────────────────────────────────
  const { field } = useController({ name: "dateRange", control });

  const [open, setOpen] = useState(false);

  const [pendingRange, setPendingRange] = useState<DateRange | undefined>(
    field.value?.from ? (field.value as DateRange) : undefined
  );

  // Дата под курсором — нужна для hover-превью диапазона
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>();

  // react-day-picker v10 при первом клике создаёт { from, to: from } (одна дата),
  // а не { from, to: undefined }. «Одиночный» выбор = from === to.
  const isSingleDaySelected = !!(
    pendingRange?.from &&
    pendingRange?.to &&
    pendingRange.from.getTime() === pendingRange.to.getTime()
  );

  // Отображаемый диапазон: реальный выбор ИЛИ превью при наведении.
  // Превью показываем только когда выбрана ровно одна дата (from === to).
  const displayedRange = useMemo<DateRange | undefined>(() => {
    if (isSingleDaySelected && hoveredDate && pendingRange?.from) {
      const from = pendingRange.from;
      return isBefore(from, hoveredDate)
        ? { from, to: hoveredDate }
        : { from: hoveredDate, to: from };
    }
    return pendingRange;
  }, [isSingleDaySelected, pendingRange, hoveredDate]);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setPendingRange(field.value?.from ? (field.value as DateRange) : undefined);
    } else {
      setHoveredDate(undefined);
    }
    setOpen(next);
  };

  // Обрабатываем клик с учётом hover-превью.
  // Когда prevRange = { from, to: from } (одна дата) и показывается превью,
  // react-day-picker видит полный диапазон и «перезапускает» выбор,
  // возвращая { from: clicked, to: clicked }. Перехватываем и достраиваем.
  const handleSelect = useCallback((range: DateRange | undefined) => {
    const prevFrom = pendingRange?.from;
    const prevTo   = pendingRange?.to;
    const wasSingleDay = !!(prevFrom && prevTo &&
      prevFrom.getTime() === prevTo.getTime());

    if (!range) {
      setPendingRange(undefined);
      setHoveredDate(undefined);
      return;
    }

    if (
      wasSingleDay &&
      range.from && range.to &&
      range.from.getTime() === range.to.getTime() &&
      range.from.getTime() !== prevFrom!.getTime()
    ) {
      // Были в режиме "первая дата выбрана" с превью.
      // react-day-picker увидел полный превью-диапазон и «перезапустил» выбор:
      // range.from = кликнутая дата. Строим правильный диапазон вручную.
      const from = isBefore(prevFrom!, range.from) ? prevFrom! : range.from;
      const to   = isBefore(prevFrom!, range.from) ? range.from : prevFrom!;
      setPendingRange({ from, to });
      setHoveredDate(undefined);
      return;
    }

    setPendingRange(range);
    setHoveredDate(undefined);
  }, [pendingRange]);

  const handleDayMouseEnter = useCallback((date: Date) => {
    if (isSingleDaySelected) {
      setHoveredDate(date);
    }
  }, [isSingleDaySelected]);

  const handleDayMouseLeave = useCallback(() => {
    setHoveredDate(undefined);
  }, []);

  const handleApply = () => {
    if (!pendingRange?.from) return;
    field.onChange(pendingRange);
    setOpen(false);
  };

  return (
    // ──────────────────────────────────────────────────────────
    // Popover.Root в controlled режиме (open + onOpenChange).
    // Controlled нужен чтобы закрывать попап программно после "применить".
    // Uncontrolled (без open/onOpenChange) сам управляет открытием.
    // ──────────────────────────────────────────────────────────
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        {/*
          asChild — Radix "сливает" свой поведение (click → open)
          с нашим button, не добавляя лишний DOM элемент.
        */}
        <button type="button" className="filter-icon-btn" title="Выбрать период">
          <CalendarIcon width={16} height={16} />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.popover}
          sideOffset={6}
          align="start"
        >
          {/* Иконка в шапке — как на скриншоте */}
          <div className={styles.popoverHeader}>
            <CalendarIcon width={16} height={16} />
          </div>

          <Calendar
            mode="range"
            selected={displayedRange}
            onSelect={handleSelect}
            onDayMouseEnter={handleDayMouseEnter}
            onDayMouseLeave={handleDayMouseLeave}
            defaultMonth={pendingRange?.from ?? new Date()}
          />

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.applyBtn}
              onClick={handleApply}
              disabled={!pendingRange?.from}
            >
              применить
            </button>
          </div>

          <Popover.Arrow className={styles.arrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
