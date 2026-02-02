import { useState, useEffect } from "react";

interface SidebarLayoutState {
  sidebarSize: number; // Percentage (15-30)
  mainSize: number; // Percentage (70-85)
}

const STORAGE_KEY = "sidebar-layout";
const DEFAULT_LAYOUT: SidebarLayoutState = {
  sidebarSize: 20,
  mainSize: 80,
};

export function useSidebarLayout() {
  const [layout, setLayout] = useState<SidebarLayoutState>(() => {
    // Try to load from localStorage on initial render
    if (typeof window === "undefined") return DEFAULT_LAYOUT;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate the parsed data
        if (
          typeof parsed.sidebarSize === "number" &&
          typeof parsed.mainSize === "number" &&
          parsed.sidebarSize >= 15 &&
          parsed.sidebarSize <= 30 &&
          parsed.mainSize >= 50 &&
          parsed.mainSize <= 85
        ) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Failed to load sidebar layout from localStorage:", error);
    }

    return DEFAULT_LAYOUT;
  });

  const saveLayout = (sizes: number[]) => {
    if (sizes.length >= 2) {
      const newLayout: SidebarLayoutState = {
        sidebarSize: sizes[0],
        mainSize: sizes[1],
      };
      setLayout(newLayout);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
      } catch (error) {
        console.error("Failed to save sidebar layout to localStorage:", error);
      }
    }
  };

  return { layout, saveLayout };
}
