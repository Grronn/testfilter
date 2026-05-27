// ============================================================
// SEARCHCOMBOBOX — поиск с двумя типами результатов
// ============================================================
// Дропдаун показывает два вида строк:
//
//   1) СВОДКА-результат (жирный текст):
//      "Тепловский, Кудринский, Мамонтовский"
//      → это сводка целиком, чьи участки/компании содержат запрос.
//      При клике — добавляется чип с НАЗВАНИЕМ этой сводки.
//
//   2) ENTITY-результат (обычный/серый текст):
//      "Тепловский 2", "Тепловский 3" и т.д.
//      → отдельный участок или общество из справочника.
//      Переключатель участок/общество определяет ЧТО здесь показывается.
//
// Оба типа результатов показываются в ОДНОМ списке, без заголовков —
// как на скриншоте. Визуально отличаются стилем (bold vs normal/grey).
//
// ============================================================
// ТЕХНИЧЕСКАЯ РЕАЛИЗАЦИЯ:
//   - Radix Popover.Anchor + Popover.Content для позиционирования
//   - useController для связи input-value с React Hook Form
//   - Данные сводок берём из Redux (selectAllSvodki)
//   - onMouseDown вместо onClick (см. комментарий внутри)
// ============================================================

import { useState, useRef, useId } from "react";
import * as Popover from "@radix-ui/react-popover";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useController, Control } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../../store";
import { addChip, selectFilters, selectAllSvodki } from "../../store/slices/svodkiSlice";
import { SvodkiFilters, FilterChip, MOCK_SOCIETIES, MOCK_SITES } from "../../types";
import type { Svodka } from "../../types";

// Тип одной строки в дропдауне
type SuggestionItem =
  | {
      kind: "svodka"; // сводка целиком
      svodka: Svodka;
      label: string; // "Тепловский, Кудринский, Мамонтовский"
    }
  | {
      kind: "entity"; // отдельный участок или общество
      value: string;
      isSecondary: boolean; // серый стиль (например, уже добавлен или подчинённый)
    };

interface SearchComboboxProps {
  control: Control<SvodkiFilters>;
}

export function SearchCombobox({ control }: SearchComboboxProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);

  // Берём все сводки из Redux для поиска по ним
  const allSvodki = useAppSelector(selectAllSvodki);

  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { field } = useController({ name: "search", control });

  const query = field.value.trim().toLowerCase();

  // ============================================================
  // ФОРМИРУЕМ СПИСОК ПОДСКАЗОК
  // ============================================================

  const suggestions: SuggestionItem[] = [];

  if (query.length > 0) {
    // --- Часть 1: Сводки, в которых есть совпадение ---
    // В зависимости от entityType ищем по разным полям сводки:
    //   участок  → ищем в svodka.sites
    //   общество → ищем в svodka.customer + svodka.contractor
    const matchedSvodki = allSvodki.filter((s) => {
      if (filters.entityType === "участок") {
        return s.sites.some((site) => site.toLowerCase().includes(query));
      } else {
        return (
          s.customer.toLowerCase().includes(query) ||
          s.contractor.toLowerCase().includes(query)
        );
      }
    });

    for (const svodka of matchedSvodki) {
      // Формируем лейбл: перечисляем все участки или компании через запятую
      const label =
        filters.entityType === "участок"
          ? svodka.sites.join(", ")
          : `${svodka.customer} / ${svodka.contractor}`;

      suggestions.push({ kind: "svodka", svodka, label });
    }

    // --- Часть 2: Отдельные сущности из справочника ---
    const entityList =
      filters.entityType === "общество" ? MOCK_SOCIETIES : MOCK_SITES;

    const matchedEntities = entityList.filter((e) =>
      e.toLowerCase().includes(query)
    );

    for (const value of matchedEntities) {
      // isSecondary = true → серый стиль.
      // Помечаем уже добавленные в чипы сущности как вторичные.
      const alreadyAdded = filters.chips.some(
        (c) => c.type === "entity" && c.value === value
      );
      suggestions.push({ kind: "entity", value, isSecondary: alreadyAdded });
    }
  }

  // ============================================================
  // ОБРАБОТЧИКИ ВЫБОРА
  // ============================================================

  const handleSelectSvodka = (svodka: Svodka) => {
    const chip: FilterChip = {
      id: `svodka-${svodka.id}`,
      type: "entity",
      label: svodka.title,
      value: svodka.id, // будем фильтровать по id сводки
    };
    dispatch(addChip(chip));
    field.onChange("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleSelectEntity = (value: string) => {
    const chip: FilterChip = {
      id: `entity-${value}-${Date.now()}`,
      type: "entity",
      label: value,
      value,
    };
    dispatch(addChip(chip));
    field.onChange("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const showDropdown = open && query.length > 0 && suggestions.length > 0;

  return (
    <Popover.Root open={showDropdown} onOpenChange={setOpen}>
      {/*
        Popover.Anchor — якорь для позиционирования Content.
        Content будет выровнен по ширине и позиции этого элемента.
        Мы НЕ используем Trigger здесь — открываем вручную через setOpen.
      */}
      <Popover.Anchor asChild>
        <div className="search-combobox">
          <MagnifyingGlassIcon className="search-combobox__icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-combobox__input"
            placeholder="Найти"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls={listboxId}
            value={field.value}
            onChange={(e) => {
              field.onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => { if (field.value.trim()) setOpen(true); }}
            onBlur={() => {
              // Задержка нужна! Иначе onBlur срабатывает раньше onMouseDown
              // у элемента списка и мы закрываем дропдаун до клика.
              setTimeout(() => setOpen(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
                field.onChange("");
              }
            }}
          />
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className="search-suggestions"
          align="start"
          sideOffset={4}
          // Не перехватываем фокус при открытии — фокус остаётся на input
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={() => setOpen(false)}
        >
          <ul id={listboxId} role="listbox" className="search-suggestions__list">
            {suggestions.map((item, idx) => {
              if (item.kind === "svodka") {
                // ==============================
                // СВОДКА — жирный стиль
                // ==============================
                return (
                  <li
                    key={`svodka-${item.svodka.id}-${idx}`}
                    role="option"
                    aria-selected={false}
                    className="search-suggestions__item search-suggestions__item--svodka"
                    onMouseDown={(e) => {
                      // onMouseDown + preventDefault — стандартный трюк для комбобоксов.
                      // preventDefault не даёт input потерять фокус (что сбросило бы
                      // onBlur → setTimeout → setOpen(false)) до того как мы кликнули.
                      e.preventDefault();
                      handleSelectSvodka(item.svodka);
                    }}
                  >
                    <HighlightedText text={item.label} query={field.value} />
                  </li>
                );
              }

              // ==============================
              // СУЩНОСТЬ — обычный или серый стиль
              // ==============================
              return (
                <li
                  key={`entity-${item.value}-${idx}`}
                  role="option"
                  aria-selected={false}
                  className={[
                    "search-suggestions__item",
                    item.isSecondary
                      ? "search-suggestions__item--secondary"
                      : "",
                  ].join(" ")}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!item.isSecondary) {
                      // Уже добавленные (серые) не добавляем повторно
                      handleSelectEntity(item.value);
                    }
                  }}
                >
                  <HighlightedText text={item.value} query={field.value} />
                </li>
              );
            })}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

// ============================================================
// ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ — подсветка совпадающей части
// ============================================================
// Разбиваем строку на три части: до совпадения, само совпадение, после.
// Совпадение оборачиваем в <strong>.
// ============================================================
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <strong className="search-highlight">
        {text.slice(idx, idx + query.length)}
      </strong>
      {text.slice(idx + query.length)}
    </>
  );
}
