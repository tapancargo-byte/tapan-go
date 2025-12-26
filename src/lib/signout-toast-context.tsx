"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";
import { SignoutToast } from "@/components/auth/signout-toast";

interface SignoutToastContextType {
	showSignoutToast: (userName: string) => void;
}

const SignoutToastContext = createContext<SignoutToastContextType | null>(null);

export function SignoutToastProvider({ children }: { children: ReactNode }) {
	const [toastState, setToastState] = useState<{
		isVisible: boolean;
		userName: string;
	}>({
		isVisible: false,
		userName: "",
	});

	const showSignoutToast = useCallback((userName: string) => {
		setToastState({
			isVisible: true,
			userName,
		});
	}, []);

	const hideToast = useCallback(() => {
		setToastState((prev) => ({ ...prev, isVisible: false }));
	}, []);

	return (
		<SignoutToastContext.Provider value={{ showSignoutToast }}>
			{children}
			<SignoutToast
				isVisible={toastState.isVisible}
				userName={toastState.userName}
				onClose={hideToast}
				duration={3000}
			/>
		</SignoutToastContext.Provider>
	);
}

export function useSignoutToastContext() {
	const context = useContext(SignoutToastContext);
	if (!context) {
		throw new Error(
			"useSignoutToastContext must be used within SignoutToastProvider",
		);
	}
	return context;
}
