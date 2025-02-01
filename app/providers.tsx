"use client";
import { StrictMode } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StrictMode>
      {children}
    </StrictMode>
  );
}
