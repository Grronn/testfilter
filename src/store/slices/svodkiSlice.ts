import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Svodka, SvodkiFiltersForm, GroupCompany, License } from "../../types";
import { MOCK_SVODKI, MOCK_GROUP_COMPANIES, MOCK_LICENSES } from "../../types";

// ─── State ───────────────────────────────────────────────────────────────────

interface SvodkiState {
  items:          Svodka[];
  groupCompanies: GroupCompany[];
  licensies:      License[];
  isLoading:      boolean;
}

const initialState: SvodkiState = {
  // Каталоги — в реальном приложении загружаются с API при старте.
  groupCompanies: MOCK_GROUP_COMPANIES,
  licensies:      MOCK_LICENSES,
  items:          MOCK_SVODKI,
  isLoading:      false,
};

// ─── Async thunk ─────────────────────────────────────────────────────────────

// Симулирует запрос к API с параметрами фильтра.
// getState нужен чтобы достать каталоги для перевода ID → название.
export const fetchSvodki = createAsyncThunk(
  "svodki/fetch",
  async (filters: SvodkiFiltersForm, thunkAPI) => {
    const state = thunkAPI.getState() as { svodki: SvodkiState };
    // TODO: заменить на реальный API-вызов:
    // return await api.get<Svodka[]>("/svodki", { params: toApiParams(filters) });
    return filterSvodki(
      MOCK_SVODKI,
      filters,
      state.svodki.groupCompanies,
      state.svodki.licensies,
    );
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const svodkiSlice = createSlice({
  name: "svodki",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSvodki.pending,   (state) => { state.isLoading = true; })
      .addCase(fetchSvodki.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSvodki.rejected,  (state) => { state.isLoading = false; });
  },
});

export default svodkiSlice.reducer;

// ─── Selectors ───────────────────────────────────────────────────────────────

type RootState = { svodki: SvodkiState };

export const selectSvodki            = (s: RootState) => s.svodki.items;
export const selectSvodkiLoading     = (s: RootState) => s.svodki.isLoading;
export const selectGroupCompanies    = (s: RootState) => s.svodki.groupCompanies;
export const selectLicensies         = (s: RootState) => s.svodki.licensies;

// ─── Filtering ───────────────────────────────────────────────────────────────

// Форма хранит ID выбранных обществ и участков.
// Сводки ссылаются на них по названию (customer, contractor, sites).
// Поэтому переводим ID → название перед сравнением.
function filterSvodki(
  svodki:         Svodka[],
  filters:        SvodkiFiltersForm,
  groupCompanies: GroupCompany[],
  licensies:      License[],
): Svodka[] {
  const selectedCompanyNames = new Set(
    groupCompanies
      .filter((c) => filters.groupCompanies.includes(c.id))
      .map((c) => c.title)
  );

  const selectedLicenseNames = new Set(
    licensies
      .filter((l) => filters.licensies.includes(l.id))
      .map((l) => l.title)
  );

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

    if (selectedCompanyNames.size > 0) {
      if (!selectedCompanyNames.has(s.customer) && !selectedCompanyNames.has(s.contractor)) {
        return false;
      }
    }

    if (selectedLicenseNames.size > 0) {
      if (!s.sites.some((site) => selectedLicenseNames.has(site))) return false;
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
  const diff = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (period === "сегодня")   return diff < 1;
  if (period === "неделя")    return diff <= 7;
  if (period === "месяц")     return diff <= 30;
  if (period === "последняя") return diff < 1;
  return true;
}
