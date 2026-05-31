// ─── Domain types ─────────────────────────────────────────────────────────────

export type Period     = "все" | "последняя" | "сегодня" | "неделя" | "месяц";
export type EntityType = "участок" | "общество";

export interface Svodka {
  id:         string;
  title:      string;
  dateFrom:   string;   // "DD.MM.YYYY"
  customer:   string;
  contractor: string;
  sites:      string[];
  areas:      string[];
}

// ─── Form ─────────────────────────────────────────────────────────────────────

// Тип для useForm<SvodkiFiltersForm> в SvodkiList.
// Все компоненты фильтров получают Control<SvodkiFiltersForm> или SetValue<SvodkiFiltersForm>.
export interface SvodkiFiltersForm {
  period:             Period;
  entityType:         EntityType;
  dateRange:          { from: Date | undefined; to: Date | undefined };
  selectedSocieties:  string[];
  selectedSites:      string[];
}

export const DEFAULT_FORM_VALUES: SvodkiFiltersForm = {
  period:            "все",
  entityType:        "общество",
  dateRange:         { from: undefined, to: undefined },
  selectedSocieties: [],
  selectedSites:     [],
};

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "все",       label: "все" },
  { value: "последняя", label: "последняя" },
  { value: "сегодня",   label: "сегодня" },
  { value: "неделя",    label: "неделя" },
  { value: "месяц",     label: "месяц" },
];

// ─── Catalogs ─────────────────────────────────────────────────────────────────

// Участок → список обществ которым он принадлежит.
// В реальном приложении приходит с сервера.
export const SITE_SOCIETY_MAP: Record<string, string[]> = {
  "Кудринский":        ["ЮганскНГ", "СНГЕО СП-2"],
  "Тепловский":        ["ЮганскНГ", "СНГЕО СП-2"],
  "Тепловский 2":      ["ЮганскНГ"],
  "Тепловский 3":      ["БашНефть"],
  "Тепловский 4":      ["БашНефть", "СНГЕО СП-3"],
  "Мамонтовский":      ["ЮганскНГ"],
  "Ново-Арланский":    ["БашНефть", "СНГЕО СП-3"],
  "Арланский":         ["БашНефть"],
  "Озёрный":           ["Удмуртнефть", "СНГЕО СП-2"],
  "Дмитриевский":      ["Роснефть", "СНГЕО СП-3"],
  "Ромашкинский":      ["Татнефть", "СНГЕО СП-2"],
  "Западно-Сибирский": ["Удмуртнефть"],
};

export const MOCK_SOCIETIES: string[] = [
  "ЮганскНГ", "Удмуртнефть", "БашНефть",
  "СНГЕО СП-2", "СНГЕО СП-3", "Роснефть",
  "Газпром нефть", "Лукойл", "Татнефть",
];

export const MOCK_SITES: string[] = Object.keys(SITE_SOCIETY_MAP);

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_SVODKI: Svodka[] = [
  {
    id: "1", title: "3D ТЕПЛ, КУДРИНСКИЙ, МАМОНТОВСКИЙ",
    dateFrom: "07.04.2026", customer: "ЮганскНГ", contractor: "СНГЕО СП-2",
    sites: ["Кудринский", "Тепловский", "Мамонтовский"],
    areas: ["Тепловская площадь", "Кудринская площадь"],
  },
  {
    id: "2", title: "3D НОВО-АРЛАНСКИЙ",
    dateFrom: "07.04.2026", customer: "БашНефть", contractor: "СНГЕО СП-3",
    sites: ["Ново-Арланский", "Арланский"],
    areas: ["Арланская и Николо-березовская площадь"],
  },
  {
    id: "3", title: "2D ЗАПАДНО-СИБИРСКИЙ",
    dateFrom: "01.03.2026", customer: "Удмуртнефть", contractor: "СНГЕО СП-2",
    sites: ["Западно-Сибирский", "Озёрный"],
    areas: ["Озёрная площадь"],
  },
  {
    id: "4", title: "3D ДМИТРИЕВСКИЙ",
    dateFrom: "15.03.2026", customer: "Роснефть", contractor: "СНГЕО СП-3",
    sites: ["Дмитриевский"],
    areas: ["Дмитриевская площадь"],
  },
  {
    id: "5", title: "2D РОМАШКИНСКИЙ",
    dateFrom: "21.03.2026", customer: "Татнефть", contractor: "СНГЕО СП-2",
    sites: ["Ромашкинский"],
    areas: ["Ромашкинское месторождение"],
  },
];
