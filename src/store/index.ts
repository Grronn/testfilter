// ============================================================
// REDUX STORE — ЦЕНТРАЛЬНОЕ ХРАНИЛИЩЕ СОСТОЯНИЯ
// ============================================================
// configureStore из RTK заменяет createStore из старого Redux.
// Он автоматически добавляет middleware (thunk, devtools и др.)
// ============================================================

import { configureStore } from "@reduxjs/toolkit";
import svodkiReducer from "./slices/svodkiSlice";

export const store = configureStore({
  reducer: {
    // Ключ "svodki" — это путь в глобальном state: state.svodki
    svodki: svodkiReducer,
  },
});

// Типы для TypeScript — экспортируй их и используй везде
// вместо "any" чтобы получить автодополнение и проверку типов
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ============================================================
// Типизированные хуки — создай их один раз и используй везде
// вместо useSelector и useDispatch из "react-redux"
// Так TypeScript знает типы state и dispatch
// ============================================================
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
