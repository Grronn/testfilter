// ============================================================
// CustomCaption — кастомная шапка для react-day-picker v10
// ============================================================
// В v10 компонент шапки называется MonthCaption (не Caption как в v8).
// Получает { calendarMonth, displayIndex } через props.
// calendarMonth.date — Date объект первого дня отображаемого месяца.
//
// useDayPicker() — главный хук v10, возвращает:
//   goToMonth(date)   — перейти к месяцу
//   nextMonth         — следующий месяц (Date | undefined)
//   previousMonth     — предыдущий месяц (Date | undefined)
//
// addMonths/subMonths/addYears/subYears — утилиты date-fns
// ============================================================

import { useDayPicker } from "react-day-picker";
import type { MonthCaptionProps } from "react-day-picker";
import { addMonths, subMonths, addYears, subYears, format } from "date-fns";
import { ru } from "date-fns/locale";
import styles from "./Calendar.module.scss";

export function CustomCaption({ calendarMonth }: MonthCaptionProps) {
  // v10: useDayPicker вместо useNavigation (который был в v8)
  const { goToMonth } = useDayPicker();

  // calendarMonth.date — первый день отображаемого месяца
  const month = calendarMonth.date;

  return (
    <div className={styles.customCaption}>
      {/* ── Навигация по месяцу ── */}
      <div className={styles.captionGroup}>
        <button
          type="button"
          className={styles.captionBtn}
          onClick={() => goToMonth(subMonths(month, 1))}
          aria-label="Предыдущий месяц"
        >
          ‹
        </button>
        <span className={styles.captionLabel}>
          {format(month, "LLLL", { locale: ru })}
        </span>
        <button
          type="button"
          className={styles.captionBtn}
          onClick={() => goToMonth(addMonths(month, 1))}
          aria-label="Следующий месяц"
        >
          ›
        </button>
      </div>

      {/* ── Навигация по году ── */}
      <div className={styles.captionGroup}>
        <button
          type="button"
          className={styles.captionBtn}
          onClick={() => goToMonth(subYears(month, 1))}
          aria-label="Предыдущий год"
        >
          ‹
        </button>
        <span className={styles.captionLabel}>
          {month.getFullYear()}
        </span>
        <button
          type="button"
          className={styles.captionBtn}
          onClick={() => goToMonth(addYears(month, 1))}
          aria-label="Следующий год"
        >
          ›
        </button>
      </div>
    </div>
  );
}
