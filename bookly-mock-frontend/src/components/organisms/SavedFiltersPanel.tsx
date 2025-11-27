import type { ReportFiltersState } from "@/components/molecules/ReportFilters";
import { Save, Star, StarOff, Trash2 } from "lucide-react";
import * as React from "react";

export interface SavedFilter {
  id: string;
  name: string;
  filters: ReportFiltersState;
  isFavorite: boolean;
  createdAt: string;
}

export interface SavedFiltersPanelProps {
  savedFilters: SavedFilter[];
  onLoadFilter: (filter: SavedFilter) => void;
  onSaveFilter: (name: string, filters: ReportFiltersState) => void;
  onDeleteFilter: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  currentFilters: ReportFiltersState;
  className?: string;
}

export const SavedFiltersPanel = React.memo<SavedFiltersPanelProps>(
  ({
    savedFilters,
    onLoadFilter,
    onSaveFilter,
    onDeleteFilter,
    onToggleFavorite,
    currentFilters,
    className = "",
  }) => {
    const [showSaveDialog, setShowSaveDialog] = React.useState(false);
    const [filterName, setFilterName] = React.useState("");

    const handleSave = () => {
      if (filterName.trim()) {
        onSaveFilter(filterName, currentFilters);
        setFilterName("");
        setShowSaveDialog(false);
      }
    };

    const favoriteFilters = savedFilters.filter((f) => f.isFavorite);
    const otherFilters = savedFilters.filter((f) => !f.isFavorite);

    return (
      <div
        className={`
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-lg p-4
          ${className}
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Filtros Guardados
          </h3>
          <button
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            className="p-2 text-[var(--color-primary-base)] hover:bg-[var(--color-primary-base)]/10 rounded-lg transition-colors"
            title="Guardar filtro actual"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>

        {showSaveDialog && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Nombre del filtro..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={!filterName.trim()}
                className="flex-1 px-3 py-1.5 text-sm bg-[var(--color-primary-base)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setFilterName("");
                }}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {favoriteFilters.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Favoritos
              </p>
              <div className="space-y-1">
                {favoriteFilters.map((filter) => (
                  <FilterItem
                    key={filter.id}
                    filter={filter}
                    onLoad={onLoadFilter}
                    onDelete={onDeleteFilter}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}

          {otherFilters.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Todos
              </p>
              <div className="space-y-1">
                {otherFilters.map((filter) => (
                  <FilterItem
                    key={filter.id}
                    filter={filter}
                    onLoad={onLoadFilter}
                    onDelete={onDeleteFilter}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </div>
            </div>
          )}

          {savedFilters.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No hay filtros guardados
            </p>
          )}
        </div>
      </div>
    );
  }
);

SavedFiltersPanel.displayName = "SavedFiltersPanel";

interface FilterItemProps {
  filter: SavedFilter;
  onLoad: (filter: SavedFilter) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const FilterItem: React.FC<FilterItemProps> = ({
  filter,
  onLoad,
  onDelete,
  onToggleFavorite,
}) => {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
      <button
        onClick={() => onToggleFavorite(filter.id)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
        title={
          filter.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"
        }
      >
        {filter.isFavorite ? (
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        ) : (
          <StarOff className="h-4 w-4 text-gray-400" />
        )}
      </button>

      <button
        onClick={() => onLoad(filter)}
        className="flex-1 text-left text-sm text-gray-900 dark:text-gray-100 hover:text-[var(--color-primary-base)]"
      >
        {filter.name}
      </button>

      <button
        onClick={() => onDelete(filter.id)}
        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded transition-all"
        title="Eliminar filtro"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
