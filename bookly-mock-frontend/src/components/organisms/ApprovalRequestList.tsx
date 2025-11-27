import { Badge } from "@/components/atoms/Badge";
import { ApprovalCard } from "@/components/molecules/ApprovalCard";
import type {
  ApprovalFilters,
  ApprovalLevel,
  ApprovalPriority,
  ApprovalRequest,
  ApprovalStatus,
} from "@/types/entities/approval";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import * as React from "react";

/**
 * ApprovalRequestList - Organism Component
 *
 * Lista completa de solicitudes de aprobación con filtros avanzados,
 * búsqueda, paginación y acciones masivas.
 *
 * @example
 * ```tsx
 * <ApprovalRequestList
 *   requests={requests}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   loading={loading}
 * />
 * ```
 */

export interface ApprovalRequestListProps {
  /** Lista de solicitudes */
  requests: ApprovalRequest[];
  /** Handler para aprobar */
  onApprove?: (id: string) => void;
  /** Handler para rechazar */
  onReject?: (id: string) => void;
  /** Handler para ver detalles */
  onViewDetails?: (id: string) => void;
  /** Filtros activos */
  filters?: ApprovalFilters;
  /** Handler para cambio de filtros */
  onFiltersChange?: (filters: ApprovalFilters) => void;
  /** Estado de carga */
  loading?: boolean;
  /** Mostrar acciones en las tarjetas */
  showActions?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

const STATUS_OPTIONS: { value: ApprovalStatus; label: string }[] = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_REVIEW", label: "En Revisión" },
  { value: "APPROVED", label: "Aprobada" },
  { value: "REJECTED", label: "Rechazada" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "EXPIRED", label: "Expirada" },
];

const LEVEL_OPTIONS: { value: ApprovalLevel; label: string }[] = [
  { value: "FIRST_LEVEL", label: "Primer Nivel" },
  { value: "SECOND_LEVEL", label: "Segundo Nivel" },
  { value: "FINAL_LEVEL", label: "Nivel Final" },
];

const PRIORITY_OPTIONS: { value: ApprovalPriority; label: string }[] = [
  { value: "LOW", label: "Baja" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

export const ApprovalRequestList = React.memo<ApprovalRequestListProps>(
  ({
    requests,
    onApprove,
    onReject,
    onViewDetails,
    filters = {},
    onFiltersChange,
    loading = false,
    showActions = true,
    className = "",
  }) => {
    const [searchQuery, setSearchQuery] = React.useState(filters.search || "");
    const [showFilters, setShowFilters] = React.useState(false);
    const [localFilters, setLocalFilters] =
      React.useState<ApprovalFilters>(filters);

    // Sincronizar filtros locales con prop filters
    React.useEffect(() => {
      setLocalFilters(filters);
      setSearchQuery(filters.search || "");
    }, [filters]);

    // Filtrar localmente por búsqueda
    const filteredRequests = React.useMemo(() => {
      if (!searchQuery) return requests;

      const query = searchQuery.toLowerCase();
      return requests.filter(
        (req) =>
          req.userName.toLowerCase().includes(query) ||
          req.resourceName.toLowerCase().includes(query) ||
          req.purpose?.toLowerCase().includes(query) ||
          req.userEmail.toLowerCase().includes(query)
      );
    }, [requests, searchQuery]);

    const handleSearchChange = (value: string) => {
      setSearchQuery(value);
      onFiltersChange?.({ ...localFilters, search: value });
    };

    const handleFilterChange = (key: keyof ApprovalFilters, value: any) => {
      const newFilters = { ...localFilters, [key]: value };
      setLocalFilters(newFilters);
      onFiltersChange?.(newFilters);
    };

    const handleClearFilters = () => {
      const emptyFilters: ApprovalFilters = { search: searchQuery };
      setLocalFilters(emptyFilters);
      onFiltersChange?.(emptyFilters);
    };

    const activeFiltersCount = React.useMemo(() => {
      let count = 0;
      if (localFilters.status) count++;
      if (localFilters.level) count++;
      if (localFilters.priority) count++;
      if (localFilters.resourceId) count++;
      if (localFilters.userId) count++;
      return count;
    }, [localFilters]);

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Barra de búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, recurso, email o propósito..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-base)]"
            />
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <Badge variant="primary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Filtros Avanzados
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Limpiar filtros
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro de Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={localFilters.status || ""}
                  onChange={(e) =>
                    handleFilterChange("status", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Nivel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nivel
                </label>
                <select
                  value={localFilters.level || ""}
                  onChange={(e) =>
                    handleFilterChange("level", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todos</option>
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro de Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad
                </label>
                <select
                  value={localFilters.priority || ""}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Todas</option>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Lista de solicitudes */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-base)]" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Cargando solicitudes...
            </span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRequests.map((request) => (
              <ApprovalCard
                key={request.id}
                request={request}
                onApprove={onApprove}
                onReject={onReject}
                onViewDetails={onViewDetails}
                showActions={showActions && request.status === "PENDING"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron solicitudes
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  handleClearFilters();
                }}
                className="mt-2 text-sm text-[var(--color-primary-base)] hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            )}
          </div>
        )}

        {/* Contador de resultados */}
        {!loading && filteredRequests.length > 0 && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Mostrando {filteredRequests.length} de {requests.length} solicitudes
          </div>
        )}
      </div>
    );
  }
);

ApprovalRequestList.displayName = "ApprovalRequestList";
