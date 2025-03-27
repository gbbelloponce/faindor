import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";

import { Theme, useThemeStore } from "../state/theme";
import { Button } from "./ui/button";

const ThemeToIcon = {
	[Theme.light]: <Moon />,
	[Theme.dark]: <Sun />,
};

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
		<Button
			className="bg-background hover:bg-accent text-primary"
			onClick={toggleTheme}
		>
			{ThemeToIcon[theme]}
		</Button>
	);
};
