import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Svodka, SvodkiFiltersForm } from "../../types";
import {
  MOCK_SVODKI,
  MOCK_SOCIETIES,
  MOCK_SITES,
  SITE_SOCIETY_MAP,
} from "../../types";

// ─── State ───────────────────────────────────────────────────────────────────

interface SvodkiState {
  items:          Svodka[];
  societies:      string[];
  sites:          string[];
  siteSocietyMap: Record<string, string[]>;
  isLoading:      boolean;
}

const initialState: SvodkiState = {
  // В реальном приложении каталоги приходят с сервера.
  // Здесь инициализируем моком — заменить на thunk при подключении API.
  societies:      MOCK_SOCIETIES,
  sites:          MOCK_SITES,
  siteSocietyMap: SITE_SOCIETY_MAP,
  items:          MOCK_SVODKI,
  isLoading:      false,
};

// ─── Async thunk ─────────────────────────────────────────────────────────────

// Симулирует запрос к бекенду с параметрами фильтра.
// В реальном приложении здесь будет fetch/axios к API.
export const fetchSvodki = createAsyncThunk(
  "svodki/fetch",
  async (filters: SvodkiFiltersForm) => {
    // TODO: заменить на реальный API-вызов, например:
    // const response = await api.get("/svodki", { params: toApiParams(filters) });
    // return response.data as Svodka[];
    return filterSvodki(MOCK_SVODKI, filters);
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const svodkiSlice = createSlice({
  name: "svodki",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSvodki.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSvodki.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSvodki.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default svodkiSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

type RootState = { svodki: SvodkiState };

export const selectSvodki         = (s: RootState) => s.svodki.items;
export const selectSvodkiLoading  = (s: RootState) => s.svodki.isLoading;
export const selectSocieties      = (s: RootState) => s.svodki.societies;
export const selectSites          = (s: RootState) => s.svodki.sites;
export const selectSiteSocietyMap = (s: RootState) => s.svodki.siteSocietyMap;

// ─── Filtering (используется и в thunk, и в тестах) ──────────────────────────

function filterSvodki(svodki: Svodka[], filters: SvodkiFiltersForm): Svodka[] {
  return svodki.filter((s) => {
    if (filters.period !== "все") {
      const date = parseDDMMYYYY(s.dateFrom);
      if (!matchesPeriod(date, new Date(), filters.period)) return false;
    }

    if (filters.dateRange?.from) {
      const date = parseDDMMYYYY(s.dateFrom);
      const from = filters.dateRange.from;
      const to   = filters.dateRange.to ?? from;
      if (date < startOfDay(from) || date > endOfDay(to)) return false;
    }

    if (filters.selectedSocieties.length > 0) {
      const match = filters.selectedSocieties.some(
        (soc) => s.customer === soc || s.contractor === soc
      );
      if (!match) return false;
    }

    if (filters.selectedSites.length > 0) {
      const match = filters.selectedSites.some((site) => s.sites.includes(site));
      if (!match) return false;
    }

    return true;
  });
}

function parseDDMMYYYY(str: string): Date {
  const [d, m, y] = str.split(".");
  return new Date(+y, +m - 1, +d);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
}

function matchesPeriod(date: Date, today: Date, period: string): boolean {
  const diffDays = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (period === "сегодня")   return diffDays < 1;
  if (period === "неделя")    return diffDays <= 7;
  if (period === "месяц")     return diffDays <= 30;
  if (period === "последняя") return diffDays < 1;
  return true;
}
