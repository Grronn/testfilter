import { useAppSelector } from "../../store";
import { selectFilteredSvodki } from "../../store/slices/svodkiSlice";
import { SvodkaCard } from "./SvodkaCard";

export function SvodkiList() {
  const svodki = useAppSelector(selectFilteredSvodki);

  if (svodki.length === 0) {
    return (
      <div className="empty-state">
        Сводки не найдены. Попробуйте изменить фильтры.
      </div>
    );
  }

  return (
    <div className="svodki-list">
      {svodki.map((svodka) => (
        <SvodkaCard key={svodka.id} svodka={svodka} />
      ))}
    </div>
  );
}
