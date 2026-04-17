"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** Available built-in theme names. */
export const AVAILABLE_THEMES = ["default", "shibuya"] as const;

/** Union type of all available theme names. Derived from AVAILABLE_THEMES automatically. */
export type SquadbaseThemeName = (typeof AVAILABLE_THEMES)[number];

interface SquadbaseThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

const SquadbaseThemeContext = createContext<SquadbaseThemeContextValue>({
  theme: "default",
  setTheme: () => {},
});

export function useSquadbaseTheme() {
  return useContext(SquadbaseThemeContext);
}

/**
 * CVA の `theme` variant オブジェクトを型安全に定義するヘルパー。
 * すべての `SquadbaseThemeName` キーが揃っていないと TypeScript エラーになるため、
 * テーマ追加時の定義漏れを防ぐ。
 *
 * @example
 * const myVariants = cva("...", {
 *   variants: {
 *     theme: defineThemeVariant({ default: "", shibuya: "bg-muted" }),
 *   },
 * });
 */
export function defineThemeVariant(
  variants: Record<SquadbaseThemeName, string>,
): Record<SquadbaseThemeName, string> {
  return variants;
}

/**
 * コンポーネントの `theme` prop とコンテキストの現在テーマを解決するフック。
 * prop が指定されていればそちらを優先し、未指定なら `useSquadbaseTheme()` の値を使う。
 * 不明な値は `"default"` にフォールバックする。
 *
 * @example
 * const MyComponent = ({ theme: themeProp, ...props }) => {
 *   const theme = useResolvedTheme(themeProp);
 *   return <div className={cn(myVariants({ theme }))} />;
 * };
 */
export function useResolvedTheme(themeProp?: string): SquadbaseThemeName {
  const { theme: contextTheme } = useSquadbaseTheme();
  const resolved = (themeProp ?? contextTheme) as SquadbaseThemeName;
  return AVAILABLE_THEMES.includes(resolved) ? resolved : "default";
}

// ---------------------------------------------------------------------------
// コンポーネント
// ---------------------------------------------------------------------------

/**
 * `data-theme` 属性でテーマ CSS ファイルを切り替えるプロバイダー。
 *
 * テーマの実体は CSS ファイル（`[data-theme="name"]` セレクタ）で定義する。
 * このコンポーネントは `<html>` 要素に `data-theme` 属性を設定し、
 * 対応する CSS カスタムプロパティを有効にする。
 *
 * ダークモード（`.dark` クラス）の管理はこのコンポーネントの責務外。
 * next-themes 等のダークモードプロバイダーを別途ラップすること。
 *
 * @example
 * // 1. テーマ CSS をインポート
 * // @import "themes/theme-default.css";
 * //
 * // 2. プロバイダーでラップ
 * <SquadbaseTheme theme="default">
 *   <App />
 * </SquadbaseTheme>
 */
export function SquadbaseTheme({
  theme = "default",
  children,
}: {
  theme?: string;
  children: ReactNode;
}) {
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    window.dispatchEvent(new CustomEvent("squadbase-theme-change"));
    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, [currentTheme]);

  return (
    <SquadbaseThemeContext.Provider
      value={{ theme: currentTheme, setTheme: setCurrentTheme }}
    >
      {children}
    </SquadbaseThemeContext.Provider>
  );
}
