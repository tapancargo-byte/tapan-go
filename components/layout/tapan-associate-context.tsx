"use client";

import React, { createContext, useContext, useState } from "react";

interface TapanAssociateContextValue {
  moduleContext: unknown | null;
  setModuleContext: (context: unknown | null) => void;
}

const TapanAssociateContext = createContext<TapanAssociateContextValue | undefined>(
  undefined
);

export function TapanAssociateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [moduleContext, setModuleContext] = useState<unknown | null>(null);

  const value: TapanAssociateContextValue = {
    moduleContext,
    setModuleContext,
  };

  return (
    <TapanAssociateContext.Provider value={value}>
      {children}
    </TapanAssociateContext.Provider>
  );
}

export function useTapanAssociateContext(): TapanAssociateContextValue {
  const ctx = useContext(TapanAssociateContext);
  if (!ctx) {
    throw new Error(
      "useTapanAssociateContext must be used within a TapanAssociateProvider"
    );
  }
  return ctx;
}
