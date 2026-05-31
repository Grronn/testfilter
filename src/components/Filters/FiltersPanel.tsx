import { useWatch } from "react-hook-form";
import type { UseFormSetValue, UseFormReset, Control } from "react-hook-form";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Cross2Icon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import type { SvodkiFiltersForm } from "../../types";
import { DEFAULT_FORM_VALUES } from "../../types";
import { PeriodSelect } from "./PeriodSelect";
import { DateRangePicker } from "./DateRangePicker/DateRangePicker";
import { EntitySelector } from "./EntitySelector/EntitySelector";

interface FiltersPanelProps {
  control:         Control<SvodkiFiltersForm>;
  setValue:        UseFormSetValue<SvodkiFiltersForm>;
  reset:           UseFormReset<SvodkiFiltersForm>;
  societies:       string[];
  sites:           string[];
  siteSocietyMap:  Record<string, string[]>;
}

export function FiltersPanel({
  control,
  setValue,
  reset,
  societies,
  sites,
  siteSocietyMap,
}: FiltersPanelProps) {
  return (
    <div className="filters-panel">
      <div className="filters-bar">
        <PeriodSelect control={control} />
        <DateRangePicker control={control} />
        <div className="filters-bar__divider" />
        <EntitySelector
          control={control}
          setValue={setValue}
          societies={societies}
          sites={sites}
          siteSocietyMap={siteSocietyMap}
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

      <ActiveChips control={control} setValue={setValue} />
    </div>
  );
}

// ─── Active chips ─────────────────────────────────────────────────────────────

interface ActiveChipsProps {
  control:  Control<SvodkiFiltersForm>;
  setValue: UseFormSetValue<SvodkiFiltersForm>;
}

function ActiveChips({ control, setValue }: ActiveChipsProps) {
  const dateRange         = useWatch({ control, name: "dateRange" });
  const selectedSocieties = useWatch({ control, name: "selectedSocieties" });
  const selectedSites     = useWatch({ control, name: "selectedSites" });

  const hasAny =
    dateRange?.from ||
    selectedSocieties.length > 0 ||
    selectedSites.length > 0;

  if (!hasAny) return null;

  const formatDate = (d: Date) => format(d, "dd.MM.yyyy", { locale: ru });

  const dateLabel = dateRange?.from
    ? dateRange.to && dateRange.to !== dateRange.from
      ? `период ${formatDate(dateRange.from)} — ${formatDate(dateRange.to)}`
      : `период ${formatDate(dateRange.from)}`
    : null;

  return (
    <div className="active-chips">
      {dateLabel && (
        <Chip
          label={dateLabel}
          onRemove={() => setValue("dateRange", { from: undefined, to: undefined })}
        />
      )}
      {selectedSocieties.map((society) => (
        <Chip
          key={society}
          label={society}
          onRemove={() =>
            setValue("selectedSocieties", selectedSocieties.filter((s) => s !== society))
          }
        />
      ))}
      {selectedSites.map((site) => (
        <Chip
          key={site}
          label={site}
          onRemove={() =>
            setValue("selectedSites", selectedSites.filter((s) => s !== site))
          }
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
