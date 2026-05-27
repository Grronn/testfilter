// ============================================================
// FILTERSPANEL — главная панель фильтров
// ============================================================
// Тёмная горизонтальная полоса сверху страницы.
// Содержит все элементы управления фильтрами.
//
// СТРУКТУРА:
//   ┌─────────────────────────────────────────────────────────┐
//   │ [период ▼] [📅] [🔍 Найти          ] [участок|общество] [очистить] [⚙]│
//   └─────────────────────────────────────────────────────────┘
//   [07.04.2026 ×] [ЮганскНГ ×] [Удмуртнефть ×]  ← ActiveChips
//
// Роль React Hook Form здесь:
//   Форма управляет "временным" состоянием UI:
//     - period    → в Redux немедленно через watch()
//     - entityType → меняет что ищет SearchCombobox
//     - search    → текст в поле поиска (не фильтрует сам по себе)
//   Чипы хранятся в Redux напрямую (не в форме).
//
// Что изучить:
//   "react hook form useForm", "useWatch"
// ============================================================

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { SvodkiFilters, DEFAULT_FILTERS } from "../../types";
import { useAppDispatch, useAppSelector } from "../../store";
import { setFilters, clearChips, selectFilters } from "../../store/slices/svodkiSlice";
import { PeriodSelect } from "./PeriodSelect";
import { DatePickerButton } from "./DatePickerButton";
import { SearchCombobox } from "./SearchCombobox";
import { EntityTypeToggle } from "./EntityTypeToggle";
import { ActiveChips } from "./ActiveChips";

export function FiltersPanel() {
  const dispatch = useAppDispatch();
  const currentFilters = useAppSelector(selectFilters);

  // ============================================================
  // useForm — инициализируем форму значениями из Redux.
  // Так форма "синхронизирована" с сохранённым состоянием.
  // ============================================================
  const { control, reset, getValues } = useForm<SvodkiFilters>({
    defaultValues: currentFilters,
  });

  // ============================================================
  // useWatch — следим за конкретными полями.
  // Более эффективно чем watch() — подписывается только на нужные поля.
  // Вызывает ре-рендер только когда period или entityType меняются.
  //
  // Разница между watch() и useWatch():
  //   watch()     — функция, вызывается в render, всегда ре-рендерит
  //   useWatch()  — хук, более гранулярная подписка, лучше для production
  // ============================================================
  const period = useWatch({ control, name: "period" });
  const entityType = useWatch({ control, name: "entityType" });

  // Синхронизируем period и entityType в Redux при изменении
  useEffect(() => {
    dispatch(setFilters({ ...getValues(), period, entityType }));
  }, [period, entityType]); // eslint-disable-line

  // Кнопка "Очистить" — сбрасывает и форму и чипы в Redux
  const handleClear = () => {
    reset(DEFAULT_FILTERS);
    dispatch(clearChips());
    dispatch(setFilters(DEFAULT_FILTERS));
  };

  return (
    <div className="filters-panel">
      {/* ===== ТЁМНАЯ ПОЛОСА С КОНТРОЛАМИ ===== */}
      <div className="filters-bar">
        {/* --- Период (дропдаун) --- */}
        <PeriodSelect control={control} />

        {/* --- Датапикер (иконка-кнопка) --- */}
        <DatePickerButton />

        {/* --- Разделитель --- */}
        <div className="filters-bar__divider" />

        {/* --- Поиск с подсказками --- */}
        <SearchCombobox control={control} />

        {/* --- Переключатель участок/общество --- */}
        <EntityTypeToggle control={control} />

        {/* --- Кнопка "Очистить" --- */}
        <button type="button" className="filters-clear-btn" onClick={handleClear}>
          очистить
        </button>

        {/* --- Кнопка доп. настроек (placeholder) --- */}
        <button type="button" className="filter-icon-btn filter-icon-btn--settings">
          <MixerHorizontalIcon width={16} height={16} />
        </button>
      </div>

      {/* ===== СТРОКА ЧИПОВ (если есть выбранные фильтры) ===== */}
      <ActiveChips />
    </div>
  );
}
