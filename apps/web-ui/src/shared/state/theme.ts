import { create } from "zustand";

export enum Theme {
	light = "light",
	dark = "dark",
}

type ThemeStore = {
	theme: Theme;
	toggleTheme: () => void;
	setThemeFromStorageOrSystem: () => void;
};

const getThemeFromStorageOrSystem = (): Theme => {
	const storedTheme = localStorage.getItem("theme") as Theme | null;
	if (storedTheme) return storedTheme;

	const systemPrefersDark = window.matchMedia(
		"(prefers-color-scheme: dark)",
	).matches;

	return systemPrefersDark ? Theme.dark : Theme.light;
};

export const useThemeStore = create<ThemeStore>((set) => ({
	theme: Theme.dark,
	toggleTheme: () =>
		set((state) => ({
			theme: state.theme === Theme.light ? Theme.dark : Theme.light,
		})),
	setThemeFromStorageOrSystem: () => {
		const storedOrSystemTheme = getThemeFromStorageOrSystem();
		set({
			theme: storedOrSystemTheme,
		});
	},
}));
