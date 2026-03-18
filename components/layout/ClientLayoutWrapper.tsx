"use client";

import { useState } from "react";
import Header from "@/components/ui/header";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`app-layout ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Header isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} /> 
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}