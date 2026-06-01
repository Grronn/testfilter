// ============================================================
// Calendar — обёртка над react-day-picker v10
// ============================================================
// v10 vs v8 — ключевые отличия в classNames:
//
//   v8 → v10
//   cell      → day       (td элемент)
//   day       → day_button (кнопка внутри td)
//   head_row  → weekdays
//   head_cell → weekday
//   row       → week
//   table     → month_grid
//   caption   → month_caption
//   nav_button_previous → button_previous
//   nav_button_next     → button_next
//   day_selected  → selected
//   day_today     → today
//   day_outside   → outside
//   day_disabled  → disabled
//   day_range_start → range_start  (на td, не на кнопке!)
//   day_range_end   → range_end
//   day_range_middle → range_middle
//   day_hidden  → hidden
//
// В v10 range классы применяются к <td> (day),
// а не к <button> (day_button)!
// Это позволяет стилизовать фон ячейки для полосы диапазона.
//
// В v10: components.MonthCaption (не Caption как в v8)
// ============================================================

import { DayPicker } from "react-day-picker";
import type { DayPickerProps, ClassNames } from "react-day-picker";
import { ru } from "date-fns/locale";
import styles from "./Calendar.module.scss";
import { CustomCaption } from "./CustomCaption";

type DistributiveOmit<T, K extends keyof any> = T extends unknown ? Omit<T, K> : never;
type CalendarProps = DistributiveOmit<DayPickerProps, "locale" | "components">;

// react-day-picker without classNames uses its own selectors (rdp-root, rdp-day…)
// that don't match CSS Modules scoped names. This maps each element to our class.
// satisfies keeps the exact inferred type so TypeScript can resolve DayPickerProps union.
const CLASS_NAMES = {
  root:            styles.root,
  months:          styles.months,
  month:           styles.month,
  month_caption:   styles.month_caption,
  caption_label:   styles.caption_label,
  nav:             styles.nav,
  button_previous: styles.button_previous,
  button_next:     styles.button_next,
  month_grid:      styles.month_grid,
  weekdays:        styles.weekdays,
  weekday:         styles.weekday,
  weeks:           styles.weeks,
  week:            styles.week,
  day:             styles.day,
  day_button:      styles.day_button,
  selected:        styles.selected,
  today:           styles.today,
  outside:         styles.outside,
  disabled:        styles.disabled,
  hidden:          styles.hidden,
  focused:         styles.focused,
  range_start:     styles.range_start,
  range_end:       styles.range_end,
  range_middle:    styles.range_middle,
} satisfies Partial<ClassNames>;

export function Calendar(props: CalendarProps) {
  return (
    <DayPicker
      locale={ru}
      showOutsideDays
      classNames={CLASS_NAMES}
      components={{ MonthCaption: CustomCaption }}
      {...props}
    />
  );
}
