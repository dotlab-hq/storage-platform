import { useCallback } from 'react'
import { useTheme as useNextTheme } from 'next-themes'

export type ThemeValue = 'light' | 'dark' | 'system'

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme()

  const resolvedMode = (resolvedTheme ?? 'light') as 'light' | 'dark'
  const currentTheme = (theme ?? 'system') as ThemeValue

  const toggleTheme = useCallback(() => {
    const next: ThemeValue =
      currentTheme === 'light'
        ? 'dark'
        : currentTheme === 'dark'
          ? 'system'
          : 'light'
    setTheme(next)
  }, [currentTheme, setTheme])

  return {
    theme: currentTheme,
    resolvedTheme: resolvedMode,
    setTheme,
    toggleTheme,
  }
}
