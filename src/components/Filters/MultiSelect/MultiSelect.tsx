import { useState, useRef, useId } from "react";
import * as Popover from "@radix-ui/react-popover";
import { MagnifyingGlassIcon, CheckIcon } from "@radix-ui/react-icons";
import type { GroupCompany, License } from "../../../types";
import styles from "./MultiSelect.module.scss";

type EntityType = "licensies" | "groupCompanies";

interface MultiSelectProps {
  groupCompanies:           GroupCompany[];
  licensies:                License[];
  selectedGroupCompanyIds:  number[];
  selectedLicensyIds:       number[];
  onGroupCompaniesChange:   (ids: number[]) => void;
  onLicensiesChange:        (ids: number[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  groupCompanies,
  licensies,
  selectedGroupCompanyIds,
  selectedLicensyIds,
  onGroupCompaniesChange,
  onLicensiesChange,
  placeholder = "Найти",
}: MultiSelectProps) {
  const [open, setOpen]         = useState(false);
  const [searchText, setSearch] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("licensies");
  const inputRef  = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const query = searchText.trim().toLowerCase();
  const items = entityType === "groupCompanies" ? groupCompanies : licensies;
  const selectedIds = entityType === "groupCompanies"
    ? selectedGroupCompanyIds
    : selectedLicensyIds;

  const filteredItems = query
    ? items.filter((item) => item.title.toLowerCase().includes(query))
    : items;

  const showDropdown = open;

  const closeDropdown = () => {
    if (open) {
      console.log("MultiSelect form values", {
        groupCompanies: selectedGroupCompanyIds,
        licensies: selectedLicensyIds,
      });
    }
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
    } else {
      closeDropdown();
    }
  };

  const toggle = (id: number) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((v) => v !== id)
      : [...selectedIds, id];
    if (entityType === "groupCompanies") {
      onGroupCompaniesChange(next);
    } else {
      onLicensiesChange(next);
    }
  };

  const handleTypeChange = (type: EntityType) => {
    setEntityType(type);
    inputRef.current?.focus();
    setOpen(true);
  };

  return (
    <Popover.Root open={showDropdown} onOpenChange={handleOpenChange}>
      <Popover.Anchor asChild>
        <div className={styles.searchWrapper}>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            value={searchText}
            onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(closeDropdown, 200)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { closeDropdown(); setSearch(""); }
            }}
          />
          <div className={styles.inputSuffix}>
            <MagnifyingGlassIcon className={styles.searchIcon} />
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.typeBtn} ${entityType === "licensies" ? styles.typeBtnActive : ""}`}
                onMouseDown={(e) => { e.preventDefault(); handleTypeChange("licensies"); }}
              >
                участок
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${entityType === "groupCompanies" ? styles.typeBtnActive : ""}`}
                onMouseDown={(e) => { e.preventDefault(); handleTypeChange("groupCompanies"); }}
              >
                общество
              </button>
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
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <li
                  key={`${entityType}-${item.id}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.item} ${isSelected ? styles.itemSelected : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); toggle(item.id); }}
                >
                  {isSelected
                    ? <CheckIcon className={styles.checkIcon} />
                    : <span className={styles.checkPlaceholder} />
                  }
                  <HighlightText text={item.title} query={searchText} />
                </li>
              );
            })}

            {filteredItems.length === 0 && (
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

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <strong className={styles.highlight}>{text.slice(idx, idx + query.length)}</strong>
      {text.slice(idx + query.length)}
    </>
  );
}
