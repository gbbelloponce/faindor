import { useEffect } from "react";
import { Theme, useThemeStore } from "../state/theme";

export const ThemeToggler = () => {
	const { theme, toggleTheme, setThemeFromStorageOrSystem } = useThemeStore();

	useEffect(() => {
		setThemeFromStorageOrSystem();
	}, [setThemeFromStorageOrSystem]);

	useEffect(() => {
		localStorage.setItem("theme", theme);

		const html = document.documentElement;
		html.classList.remove(Theme.light, Theme.dark);
		html.classList.add(theme);
	}, [theme]);

	return (
		<button
			type="button"
			className="bg-blue-500 p-2 rounded-md"
			onClick={() => toggleTheme()}
		>
			{theme}
		</button>
	);
};
