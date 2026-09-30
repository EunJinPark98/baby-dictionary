"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  isThemePreference,
  resolveTheme,
  type ThemePreference,
} from "@/lib/theme";

const CHANGE_EVENT = "bsm-theme-change";

function readPreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference, window.matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[resolved]);
}

function savePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // 저장소를 쓸 수 없어도 이번 방문 동안은 적용된다.
  }
  applyTheme(preference);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

const OPTIONS: ReadonlyArray<{ value: ThemePreference; label: string; description: string; icon: string }> = [
  { value: "light", label: "라이트", description: "기본 · 밝은 아이보리", icon: "☀" },
  { value: "dark", label: "다크", description: "별마마파파 밤하늘", icon: "☾" },
  { value: "system", label: "기기 설정", description: "휴대폰 설정 따르기", icon: "◐" },
];

/** 화면 테마 선택. 누르는 즉시 적용되고 이 기기에 저장된다. */
export function ThemeSelector() {
  // 서버 렌더링 시에는 알 수 없으므로 null → 하이드레이션 후 실제 값
  const preference = useSyncExternalStore(subscribe, readPreference, () => null);

  // "기기 설정" 일 때는 OS 테마가 바뀌면 바로 따라간다.
  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  return (
    <div role="radiogroup" aria-label="화면 테마" className="grid grid-cols-3 gap-2">
      {OPTIONS.map((option) => {
        const selected = preference === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => savePreference(option.value)}
            className={`flex min-h-20 flex-col items-center justify-center gap-0.5 rounded-2xl border px-2 py-2 text-center transition-colors ${selected ? "border-gold-500/60 bg-gold-100 shadow-[0_0_20px_rgb(245_197_66/0.15)]" : "border-line bg-surface-2 hover:border-gold-500/30"}`}
          >
            <span aria-hidden className={`text-lg ${selected ? "text-gold-500" : "text-ink-faint"}`}>
              {option.icon}
            </span>
            <span className={`text-[15px] font-bold ${selected ? "text-gold-700" : "text-ink"}`}>{option.label}</span>
            <span className="text-[11px] leading-tight text-ink-faint">{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}
