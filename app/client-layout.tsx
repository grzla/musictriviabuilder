"use client";
import { StrictMode } from "react";
import { DragDropContext } from "react-beautiful-dnd";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <StrictMode>
      {children}
    </StrictMode>
  );
}
