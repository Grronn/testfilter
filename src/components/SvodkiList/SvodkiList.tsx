import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiltersPanel } from "../Filters/FiltersPanel";
import { SvodkaCard } from "./SvodkaCard";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchSvodki,
  selectSvodki,
  selectSvodkiLoading,
  selectGroupCompanies,
  selectLicensies,
} from "../../store/slices/svodkiSlice";
import type { SvodkiFiltersForm } from "../../types";
import { DEFAULT_FORM_VALUES } from "../../types";

export function SvodkiList() {
  const dispatch = useAppDispatch();

  const svodki        = useAppSelector(selectSvodki);
  const isLoading     = useAppSelector(selectSvodkiLoading);
  const groupCompanies = useAppSelector(selectGroupCompanies);
  const licensies      = useAppSelector(selectLicensies);

  const { control, watch, reset } = useForm<SvodkiFiltersForm>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const formValues = watch();

  // Запрашиваем сводки при каждом изменении фильтров.
  // В реальном приложении здесь будет API-запрос через thunk.
  useEffect(() => {
    dispatch(fetchSvodki(formValues));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(formValues)]);

  return (
    <div>
      <FiltersPanel
        control={control}
        reset={reset}
        groupCompanies={groupCompanies}
        licensies={licensies}
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
