import type { ReportFiltersState } from "@/components/molecules/ReportFilters";
import { useCallback, useState } from "react";

export function useReportFilters(initialFilters: ReportFiltersState = {}) {
  const [filters, setFilters] = useState<ReportFiltersState>(initialFilters);

  const updateFilter = useCallback(
    (key: keyof ReportFiltersState, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const removeFilter = useCallback((key: keyof ReportFiltersState) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasFilters = Object.keys(filters).length > 0;

  return {
    filters,
    setFilters,
    updateFilter,
    removeFilter,
    clearFilters,
    hasFilters,
  };
}
