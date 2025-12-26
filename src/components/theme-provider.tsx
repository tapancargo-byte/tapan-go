"use client";

import {
	ThemeProvider as NextThemesProvider,
	type ThemeProviderProps,
	useTheme as useNextTheme,
} from "next-themes";
import * as React from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="light"
			enableSystem={false}
			{...props}
		>
			{children}
		</NextThemesProvider>
	);
}

export function useTheme() {
	const { theme, setTheme } = useNextTheme();

	const toggleTheme = React.useCallback(() => {
		setTheme(theme === "light" ? "dark" : "light");
	}, [theme, setTheme]);

	return {
		theme: theme as "light" | "dark",
		setTheme,
		toggleTheme,
	};
}
