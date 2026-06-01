import { useMemo } from "react";
import { useWatch, useController } from "react-hook-form";
import type { UseFormReset, Control } from "react-hook-form";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Cross2Icon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import type { SvodkiFiltersForm, GroupCompany, License } from "../../types";
import { DEFAULT_FORM_VALUES } from "../../types";
import { PeriodSelect } from "./PeriodSelect";
import { DateRangePicker } from "./DateRangePicker/DateRangePicker";
import { MultiSelect } from "./MultiSelect/MultiSelect";

interface FiltersPanelProps {
  control:        Control<SvodkiFiltersForm>;
  reset:          UseFormReset<SvodkiFiltersForm>;
  groupCompanies: GroupCompany[];
  licensies:      License[];
}

export function FiltersPanel({
  control,
  reset,
  groupCompanies,
  licensies,
}: FiltersPanelProps) {
  const { field: gcField  } = useController({ name: "groupCompanies", control });
  const { field: licField } = useController({ name: "licensies",      control });

  // useMemo на списки опций: сюда в реальном проекте можно подставить уже
  // подготовленные массивы после нужной фильтрации в родительском компоненте.
  const groupCompanyOptions = useMemo(() => groupCompanies, [groupCompanies]);
  const licensyOptions      = useMemo(() => licensies,      [licensies]);

  return (
    <div className="filters-panel">
      <div className="filters-bar">
        <PeriodSelect control={control} />
        <DateRangePicker control={control} />
        <div className="filters-bar__divider" />
        <MultiSelect
          groupCompanies={groupCompanyOptions}
          licensies={licensyOptions}
          selectedGroupCompanyIds={gcField.value}
          selectedLicensyIds={licField.value}
          onGroupCompaniesChange={gcField.onChange}
          onLicensiesChange={licField.onChange}
          placeholder="Найти"
        />
        <button
          type="button"
          className="filters-clear-btn"
          onClick={() => reset(DEFAULT_FORM_VALUES)}
        >
          очистить
        </button>
        <button type="button" className="filter-icon-btn filter-icon-btn--settings">
          <MixerHorizontalIcon width={16} height={16} />
        </button>
      </div>

      <ActiveChips
        control={control}
        groupCompanies={groupCompanies}
        licensies={licensies}
      />
    </div>
  );
}

// ─── Active chips ─────────────────────────────────────────────────────────────

interface ActiveChipsProps {
  control:        Control<SvodkiFiltersForm>;
  groupCompanies: GroupCompany[];
  licensies:      License[];
}

function ActiveChips({ control, groupCompanies, licensies }: ActiveChipsProps) {
  const { field: dateField } = useController({ name: "dateRange",      control });
  const { field: gcField   } = useController({ name: "groupCompanies", control });
  const { field: licField  } = useController({ name: "licensies",      control });

  const dateRange          = useWatch({ control, name: "dateRange" });
  const selectedGcIds      = gcField.value;
  const selectedLicensyIds = licField.value;

  // Map id → title для отображения в чипах
  const gcTitles  = useMemo(
    () => new Map(groupCompanies.map((c) => [c.id, c.title])),
    [groupCompanies],
  );
  const licTitles = useMemo(
    () => new Map(licensies.map((l) => [l.id, l.title])),
    [licensies],
  );

  const hasAny =
    dateRange?.from ||
    selectedGcIds.length > 0 ||
    selectedLicensyIds.length > 0;

  if (!hasAny) return null;

  const fmt = (d: Date) => format(d, "dd.MM.yyyy", { locale: ru });
  const dateLabel = dateRange?.from
    ? dateRange.to && dateRange.to !== dateRange.from
      ? `период ${fmt(dateRange.from)} — ${fmt(dateRange.to)}`
      : `период ${fmt(dateRange.from)}`
    : null;

  return (
    <div className="active-chips">
      {dateLabel && (
        <Chip
          label={dateLabel}
          onRemove={() => dateField.onChange({ from: undefined, to: undefined })}
        />
      )}
      {selectedGcIds.map((id) => (
        <Chip
          key={`gc-${id}`}
          label={gcTitles.get(id) ?? String(id)}
          onRemove={() => gcField.onChange(selectedGcIds.filter((v) => v !== id))}
        />
      ))}
      {selectedLicensyIds.map((id) => (
        <Chip
          key={`lic-${id}`}
          label={licTitles.get(id) ?? String(id)}
          onRemove={() => licField.onChange(selectedLicensyIds.filter((v) => v !== id))}
        />
      ))}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="chip">
      <span className="chip__label">{label}</span>
      <button
        type="button"
        className="chip__remove"
        onClick={onRemove}
        aria-label={`Убрать ${label}`}
      >
        <Cross2Icon width={10} height={10} />
      </button>
    </span>
  );
}
