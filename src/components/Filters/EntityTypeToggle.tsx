// ============================================================
// ENTITYTYPETOGGLE — переключатель «участок | общество»
// ============================================================
// Сегментированный контрол — два варианта, один активен.
// Выглядит как пилюля: [участок] [общество] на тёмном фоне.
//
// Используем @radix-ui/react-toggle-group:
//   ToggleGroup.Root  — контейнер, type="single" = только один активен
//   ToggleGroup.Item  — каждый вариант
//
// Паттерн: useController (как для CheckboxGroup).
// Radix ToggleGroup не нативный элемент → нужен Controller.
//
// Что изучить:
//   https://www.radix-ui.com/primitives/docs/components/toggle-group
// ============================================================

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useController, Control } from "react-hook-form";
import { SvodkiFilters, EntityType } from "../../types";

interface EntityTypeToggleProps {
  control: Control<SvodkiFilters>;
}

export function EntityTypeToggle({ control }: EntityTypeToggleProps) {
  const { field } = useController({ name: "entityType", control });

  return (
    /*
      ToggleGroup.Root с type="single":
        value        — текущее активное значение (из RHF через field.value)
        onValueChange — колбек при изменении

      ВАЖНО: если пользователь кликает на уже активный элемент,
      ToggleGroup вызывает onValueChange("") — пустая строка.
      Мы обрабатываем это: если пришла пустая строка — не меняем.
    */
    <ToggleGroup.Root
      type="single"
      value={field.value}
      onValueChange={(val: string) => {
        // Не допускаем сброс в пустое значение (хотя бы один должен быть активен)
        if (val) field.onChange(val as EntityType);
      }}
      className="entity-toggle"
      aria-label="Тип сущности для поиска"
    >
      <ToggleGroup.Item value="участок" className="entity-toggle__item" aria-label="участок">
        участок
      </ToggleGroup.Item>
      <ToggleGroup.Item value="общество" className="entity-toggle__item" aria-label="общество">
        общество
      </ToggleGroup.Item>
    </ToggleGroup.Root>
  );
}
