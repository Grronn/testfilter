// ============================================================
// ACTIVECHIPS — строка с выбранными фильтрами (чипы)
// ============================================================
// Отображается под панелью фильтров.
// Каждый чип показывает выбранный элемент (дата или сущность).
// Крестик на чипе удаляет его.
//
// Данные берём напрямую из Redux — этот компонент
// не связан с формой RHF, он просто читает store.
// ============================================================

import { Cross2Icon } from "@radix-ui/react-icons";
import { useAppDispatch, useAppSelector } from "../../store";
import { removeChip, selectChips } from "../../store/slices/svodkiSlice";

export function ActiveChips() {
  const dispatch = useAppDispatch();
  const chips = useAppSelector(selectChips);

  // Если нет чипов — не рендерим ничего
  if (chips.length === 0) return null;

  return (
    <div className="active-chips">
      {chips.map((chip) => (
        <span key={chip.id} className="chip">
          <span className="chip__label">{chip.label}</span>
          {/*
            Крестик удаляет чип из Redux.
            dispatch(removeChip(id)) → reducer убирает чип из массива
            → selectFilteredSvodki пересчитывается
            → SvodkiList автоматически обновляется
          */}
          <button
            type="button"
            className="chip__remove"
            onClick={() => dispatch(removeChip(chip.id))}
            aria-label={`Удалить фильтр ${chip.label}`}
          >
            <Cross2Icon width={10} height={10} />
          </button>
        </span>
      ))}
    </div>
  );
}
