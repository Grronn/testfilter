import { useState, useRef, useId } from "react";
import * as Popover from "@radix-ui/react-popover";
import { MagnifyingGlassIcon, CheckIcon } from "@radix-ui/react-icons";
import { useWatch, useController } from "react-hook-form";
import type { Control, UseFormSetValue } from "react-hook-form";
import type { SvodkiFiltersForm, EntityType, Svodka } from "../../../types";
import { MOCK_SVODKI } from "../../../types";
import styles from "./EntitySelector.module.scss";

interface EntitySelectorProps {
  control:        Control<SvodkiFiltersForm>;
  setValue:       UseFormSetValue<SvodkiFiltersForm>;
  societies:      string[];
  sites:          string[];
  siteSocietyMap: Record<string, string[]>;
}

export function EntitySelector({
  control,
  setValue,
  societies,
  sites,
  siteSocietyMap,
}: EntitySelectorProps) {
  const { field: entityTypeField } = useController({ name: "entityType", control });
  const selectedSocieties = useWatch({ control, name: "selectedSocieties" });
  const selectedSites     = useWatch({ control, name: "selectedSites" });

  const [open, setOpen]         = useState(false);
  const [searchText, setSearch] = useState("");
  const inputRef  = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const entityType = entityTypeField.value;

  // Зависимая фильтрация
  const availableSites: string[] = (() => {
    if (selectedSocieties.length === 0) return sites;
    const related = new Set<string>();
    selectedSocieties.forEach((soc) => {
      Object.entries(siteSocietyMap)
        .filter(([, socs]) => socs.includes(soc))
        .forEach(([site]) => related.add(site));
    });
    return sites.filter((s) => related.has(s));
  })();

  const availableSocieties: string[] = (() => {
    if (selectedSites.length === 0) return societies;
    const related = new Set<string>();
    selectedSites.forEach((site) => {
      siteSocietyMap[site]?.forEach((soc) => related.add(soc));
    });
    return societies.filter((s) => related.has(s));
  })();

  const entityList   = entityType === "общество" ? availableSocieties : availableSites;
  const selectedList = entityType === "общество" ? selectedSocieties : selectedSites;
  const fieldName    = entityType === "общество" ? "selectedSocieties" : "selectedSites";

  const query = searchText.trim().toLowerCase();

  const svodkaResults: Svodka[] = query
    ? MOCK_SVODKI.filter((s) =>
        entityType === "участок"
          ? s.sites.some((site) => site.toLowerCase().includes(query))
          : s.customer.toLowerCase().includes(query) ||
            s.contractor.toLowerCase().includes(query)
      )
    : [];

  const entityResults: string[] = entityList.filter((e) =>
    query ? e.toLowerCase().includes(query) : true
  );

  // Dropdown открыт пока open=true — закрывается только через blur/Escape.
  // Смена типа (участок/общество) не должна закрывать список.
  const showDropdown = open;

  const toggleEntity = (value: string) => {
    const next = selectedList.includes(value)
      ? selectedList.filter((v) => v !== value)
      : [...selectedList, value];
    setValue(fieldName, next, { shouldDirty: true });
  };

  const handleSelectSvodka = (svodka: Svodka) => {
    const value = entityType === "участок" ? svodka.sites[0] : svodka.customer;
    toggleEntity(value);
    setSearch("");
    inputRef.current?.focus();
  };

  const handleSelectEntity = (value: string) => {
    toggleEntity(value);
    setSearch("");
    inputRef.current?.focus();
  };

  const handleTypeChange = (type: EntityType) => {
    entityTypeField.onChange(type);
    // Возвращаем фокус и держим список открытым
    inputRef.current?.focus();
    setOpen(true);
  };

  const hasResults = entityResults.length > 0 || svodkaResults.length > 0;

  return (
    <Popover.Root open={showDropdown} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div className={styles.searchWrapper}>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Найти"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            value={searchText}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setOpen(false); setSearch(""); }
            }}
          />

          <div className={styles.inputSuffix}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <div className={styles.typeToggle}>
              {(["участок", "общество"] as EntityType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.typeBtn} ${entityType === type ? styles.typeBtnActive : ""}`}
                  // onMouseDown + preventDefault: input не теряет фокус при клике по кнопке
                  onMouseDown={(e) => { e.preventDefault(); handleTypeChange(type); }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          className={styles.dropdown}
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <ul id={listboxId} role="listbox" className={styles.dropdownList}>
            {svodkaResults.map((svodka) => {
              const label =
                entityType === "участок"
                  ? svodka.sites.join(", ")
                  : `${svodka.customer} / ${svodka.contractor}`;
              return (
                <li
                  key={`svodka-${svodka.id}`}
                  role="option"
                  aria-selected={false}
                  className={`${styles.item} ${styles.itemSvodka}`}
                  onMouseDown={(e) => { e.preventDefault(); handleSelectSvodka(svodka); }}
                >
                  <span className={styles.checkPlaceholder} />
                  <HighlightText text={label} query={searchText} styles={styles} />
                </li>
              );
            })}

            {svodkaResults.length > 0 && entityResults.length > 0 && (
              <li role="separator" className={styles.divider} />
            )}

            {entityResults.map((entity) => {
              const isSelected = selectedList.includes(entity);
              return (
                <li
                  key={`entity-${entity}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.item} ${isSelected ? styles.itemSelected : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); handleSelectEntity(entity); }}
                >
                  {isSelected
                    ? <CheckIcon className={styles.checkIcon} />
                    : <span className={styles.checkPlaceholder} />
                  }
                  <HighlightText text={entity} query={searchText} styles={styles} />
                </li>
              );
            })}

            {!hasResults && (
              <li className={styles.emptyText}>
                {query ? "Ничего не найдено" : "Список пуст"}
              </li>
            )}
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function HighlightText({
  text,
  query,
  styles: s,
}: {
  text: string;
  query: string;
  styles: Record<string, string>;
}) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className={s.highlight}>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}
