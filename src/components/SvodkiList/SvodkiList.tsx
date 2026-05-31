import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiltersPanel } from "../Filters/FiltersPanel";
import { SvodkaCard } from "./SvodkaCard";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchSvodki,
  selectSvodki,
  selectSvodkiLoading,
  selectSocieties,
  selectSites,
  selectSiteSocietyMap,
} from "../../store/slices/svodkiSlice";
import type { SvodkiFiltersForm } from "../../types";
import { DEFAULT_FORM_VALUES } from "../../types";

export function SvodkiList() {
  const dispatch = useAppDispatch();

  // Данные из Redux
  const svodki        = useAppSelector(selectSvodki);
  const isLoading     = useAppSelector(selectSvodkiLoading);
  const societies     = useAppSelector(selectSocieties);
  const sites         = useAppSelector(selectSites);
  const siteSocietyMap = useAppSelector(selectSiteSocietyMap);

  // SvodkiList — владелец формы фильтров.
  // Методы control, setValue, reset передаются в FiltersPanel.
  const { control, watch, setValue, reset } = useForm<SvodkiFiltersForm>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const formValues = watch();

  // Когда фильтры изменяются — запрашиваем новый список сводок.
  // В реальном приложении здесь будет API-запрос через thunk.
  // Dependency: JSON.stringify обеспечивает стабильное сравнение объекта фильтров.
  useEffect(() => {
    dispatch(fetchSvodki(formValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(formValues)]);

  return (
    <div>
      <FiltersPanel
        control={control}
        setValue={setValue}
        reset={reset}
        societies={societies}
        sites={sites}
        siteSocietyMap={siteSocietyMap}
      />

      <div className="svodki-list">
        <div className="svodki-list__count">
          Найдено: {svodki.length} сводок
        </div>

        {isLoading && (
          <div className="svodki-list__loading">Загрузка...</div>
        )}

        {!isLoading && svodki.length === 0 && (
          <div className="empty-state">
            Сводки не найдены. Попробуйте изменить фильтры.
          </div>
        )}

        {!isLoading && svodki.map((svodka) => (
          <SvodkaCard key={svodka.id} svodka={svodka} />
        ))}
      </div>
    </div>
  );
}
