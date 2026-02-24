import type { ReportFiltersState } from "@/components/molecules/ReportFilters";
import type { SavedFilter } from "@/components/organisms/SavedFiltersPanel";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bookly_saved_filters";

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading saved filters:", error);
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  }, [savedFilters]);

  const saveFilter = useCallback(
    (name: string, filters: ReportFiltersState) => {
      const newFilter: SavedFilter = {
        id: `filter_${Date.now()}`,
        name,
        filters,
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };
      setSavedFilters((prev) => [...prev, newFilter]);
    },
    []
  );

  const deleteFilter = useCallback((id: string) => {
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setSavedFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  }, []);

  const loadFilter = useCallback((filter: SavedFilter) => {
    return filter.filters;
  }, []);

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    toggleFavorite,
    loadFilter,
  };
}
