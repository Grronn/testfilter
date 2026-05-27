// ============================================================
// REDUX SLICE для сводок и фильтров
// ============================================================

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Svodka, SvodkiFilters, FilterChip, DEFAULT_FILTERS } from "../../types";

interface SvodkiState {
  items: Svodka[];
  filters: SvodkiFilters;
  isLoading: boolean;
}

// Мок данные — основаны на карточках из скриншота
const MOCK_SVODKI: Svodka[] = [
  {
    id: "1",
    title: "3D ТЕПЛ, КУДРИНСКИЙ, МАМОНТОВСКИЙ",
    dateFrom: "07.04.2026",
    customer: "ЮганскНГ",
    contractor: "СНГЕО СП-2",
    sites: ["Кудринский", "Тепловский", "Мамонтовский"],
    areas: ["Тепловский", "Кудринский", "Мамонтовский"],
  },
  {
    id: "2",
    title: "3D НОВО-АРЛАНСКИЙ",
    dateFrom: "07.04.2026",
    customer: "БашНефть",
    contractor: "СНГЕО СП-3",
    sites: ["Ново-Арланский", "Арланский"],
    areas: ["Арланская и Николо-березовская площадь", "Ново-Хазинская площадь"],
  },
  {
    id: "3",
    title: "2D ЗАПАДНО-СИБИРСКИЙ",
    dateFrom: "06.04.2026",
    customer: "Удмуртнефть",
    contractor: "СНГЕО СП-2",
    sites: ["Западно-Сибирский", "Озёрный"],
    areas: ["Озёрная площадь"],
  },
  {
    id: "4",
    title: "3D ДМИТРИЕВСКИЙ",
    dateFrom: "05.04.2026",
    customer: "Роснефть",
    contractor: "СНГЕО СП-3",
    sites: ["Дмитриевский"],
    areas: ["Дмитриевская площадь"],
  },
  {
    id: "5",
    title: "2D РОМАШКИНСКИЙ",
    dateFrom: "07.04.2026",
    customer: "Татнефть",
    contractor: "СНГЕО СП-2",
    sites: ["Ромашкинский"],
    areas: ["Ромашкинское месторождение"],
  },
];

const initialState: SvodkiState = {
  items: MOCK_SVODKI,
  filters: DEFAULT_FILTERS,
  isLoading: false,
};

const svodkiSlice = createSlice({
  name: "svodki",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<SvodkiFilters>) {
      state.filters = action.payload;
    },
    resetFilters(state) {
      state.filters = DEFAULT_FILTERS;
    },
    // Добавить чип (когда пользователь выбирает элемент из поиска или дату)
    addChip(state, action: PayloadAction<FilterChip>) {
      // Не добавляем дубликаты
      const exists = state.filters.chips.some(
        (c) => c.value === action.payload.value && c.type === action.payload.type
      );
      if (!exists) {
        state.filters.chips.push(action.payload);
      }
    },
    // Удалить один чип (клик на ×)
    removeChip(state, action: PayloadAction<string>) {
      state.filters.chips = state.filters.chips.filter((c) => c.id !== action.payload);
    },
    // Сбросить только чипы
    clearChips(state) {
      state.filters.chips = [];
      state.filters.selectedDate = "";
    },
  },
});

export const { setFilters, resetFilters, addChip, removeChip, clearChips } =
  svodkiSlice.actions;

// ============================================================
// ТИПИЗИРОВАННЫЕ ХУКИ — определены здесь для удобства
// ============================================================
type RootState = { svodki: SvodkiState };

export const selectFilters = (state: RootState) => state.svodki.filters;
export const selectChips = (state: RootState) => state.svodki.filters.chips;
// Все сводки (нужен SearchCombobox для поиска по ним)
export const selectAllSvodki = (state: RootState) => state.svodki.items;

// Основная логика фильтрации
export const selectFilteredSvodki = (state: RootState): Svodka[] => {
  const { items, filters } = state.svodki;

  return items.filter((svodka) => {
    // Фильтр по периоду
    if (filters.period !== "все") {
      const today = new Date();
      const svodkaDate = parseDDMMYYYY(svodka.dateFrom);
      if (!matchesPeriod(svodkaDate, today, filters.period)) return false;
    }

    // Фильтр по чипам — каждый чип должен совпасть (AND логика)
    for (const chip of filters.chips) {
      if (chip.type === "date") {
        // Чип-дата: совпадение по полю "сводка от"
        if (svodka.dateFrom !== chip.label) return false;
      } else {
        // Чип-сущность может быть:
        //   a) id сводки (добавлена через клик на svodka-результат)
        //   b) название участка или общества (добавлен через entity-результат)
        const matchesSvodkaId = svodka.id === chip.value;
        const matchesCustomer = svodka.customer.toLowerCase().includes(chip.value.toLowerCase());
        const matchesContractor = svodka.contractor.toLowerCase().includes(chip.value.toLowerCase());
        const matchesSite = svodka.sites.some((s) =>
          s.toLowerCase().includes(chip.value.toLowerCase())
        );
        if (!matchesSvodkaId && !matchesCustomer && !matchesContractor && !matchesSite) {
          return false;
        }
      }
    }

    return true;
  });
};

// Утилиты для работы с датами
function parseDDMMYYYY(str: string): Date {
  const [d, m, y] = str.split(".");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function matchesPeriod(date: Date, today: Date, period: string): boolean {
  const diffMs = today.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (period === "сегодня") return diffDays < 1;
  if (period === "неделя") return diffDays <= 7;
  if (period === "месяц") return diffDays <= 30;
  if (period === "последняя") return diffDays < 1;
  return true;
}

export default svodkiSlice.reducer;
