// ─── Domain types ─────────────────────────────────────────────────────────────

export type Period = "все" | "последняя" | "сегодня" | "неделя" | "месяц";

export interface Svodka {
  id:         string;
  title:      string;
  dateFrom:   string;   // "DD.MM.YYYY"
  customer:   string;
  contractor: string;
  sites:      string[];
  areas:      string[];
}

// Базовый интерфейс для MultiSelect — у объектов много полей, но нужны только id + title.
// На реальном проекте GroupCompany и License расширяют этот тип дополнительными полями.
export interface SelectableItem {
  id:    number;
  title: string;
}

export interface GroupCompany extends SelectableItem {}
export interface License      extends SelectableItem {}

// ─── Form ─────────────────────────────────────────────────────────────────────

// useForm<SvodkiFiltersForm> в SvodkiList.
// MultiSelect-поля хранят ID (number[]), не строки и не объекты.
export interface SvodkiFiltersForm {
  period:         Period;
  dateRange:      { from: Date | undefined; to: Date | undefined };
  groupCompanies: number[];   // ID выбранных обществ
  licensies:      number[];   // ID выбранных участков
}

export const DEFAULT_FORM_VALUES: SvodkiFiltersForm = {
  period:         "все",
  dateRange:      { from: undefined, to: undefined },
  groupCompanies: [],
  licensies:      [],
};

export const PERIOD_OPTIONS: Array<{ value: Period; label: string }> = [
  { value: "все", label: "все" },
  { value: "последняя", label: "последняя" },
  { value: "сегодня", label: "сегодня" },
  { value: "неделя", label: "неделя" },
  { value: "месяц", label: "месяц" },
];

// ─── Mock catalogs ────────────────────────────────────────────────────────────

export const MOCK_GROUP_COMPANIES: GroupCompany[] = [
  { id: 1, title: "ЮганскНГ" },
  { id: 2, title: "Удмуртнефть" },
  { id: 3, title: "БашНефть" },
  { id: 4, title: "СНГЕО СП-2" },
  { id: 5, title: "СНГЕО СП-3" },
  { id: 6, title: "Роснефть" },
  { id: 7, title: "Газпром нефть" },
  { id: 8, title: "Лукойл" },
  { id: 9, title: "Татнефть" },
];

export const MOCK_LICENSES: License[] = [
  { id: 1,  title: "Кудринский" },
  { id: 2,  title: "Тепловский" },
  { id: 3,  title: "Тепловский 2" },
  { id: 4,  title: "Тепловский 3" },
  { id: 5,  title: "Тепловский 4" },
  { id: 6,  title: "Мамонтовский" },
  { id: 7,  title: "Ново-Арланский" },
  { id: 8,  title: "Арланский" },
  { id: 9,  title: "Озёрный" },
  { id: 10, title: "Дмитриевский" },
  { id: 11, title: "Ромашкинский" },
  { id: 12, title: "Западно-Сибирский" },
];

// ─── Mock svodki ──────────────────────────────────────────────────────────────

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
