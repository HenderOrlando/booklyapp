import type { UserReport } from "@/types/entities/report";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import * as React from "react";

export interface UserActivityTableProps {
  data: UserReport[];
  loading?: boolean;
  onUserClick?: (userId: string) => void;
  className?: string;
}

type SortKey =
  | "userName"
  | "totalReservations"
  | "totalHours"
  | "cancelledReservations";
type SortOrder = "asc" | "desc";

export const UserActivityTable = React.memo<UserActivityTableProps>(
  ({ data, loading = false, onUserClick, className = "" }) => {
    const [search, setSearch] = React.useState("");
    const [sortKey, setSortKey] = React.useState<SortKey>("totalReservations");
    const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");

    const handleSort = (key: SortKey) => {
      if (sortKey === key) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortKey(key);
        setSortOrder("desc");
      }
    };

    const filteredData = data.filter((user) =>
      (user.userName ?? "").toLowerCase().includes(search.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const multiplier = sortOrder === "asc" ? 1 : -1;
      return aVal > bVal ? multiplier : -multiplier;
    });

    return (
      <div
        className={`bg-white dark:bg-[var(--color-bg-inverse)] border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] rounded-lg ${className}`}
      >
        <div className="p-4 border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)] rounded-lg bg-white dark:bg-[var(--color-bg-inverse)] text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)]">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort("userName")}
                    className="flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
                  >
                    Usuario
                    {sortKey === "userName" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort("totalReservations")}
                    className="flex items-center gap-1 ml-auto text-xs font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
                  >
                    Reservas
                    {sortKey === "totalReservations" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort("totalHours")}
                    className="flex items-center gap-1 ml-auto text-xs font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
                  >
                    Horas
                    {sortKey === "totalHours" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort("cancelledReservations")}
                    className="flex items-center gap-1 ml-auto text-xs font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
                  >
                    Canceladas
                    {sortKey === "cancelledReservations" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-[var(--color-text-secondary)]"
                  >
                    Cargando...
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-[var(--color-text-secondary)]"
                  >
                    No hay datos
                  </td>
                </tr>
              ) : (
                sortedData.map((user) => (
                  <tr
                    key={user.userId}
                    onClick={() => onUserClick?.(user.userId)}
                    className={
                      onUserClick
                        ? "cursor-pointer hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-elevated)]/50"
                        : ""
                    }
                  >
                    <td className="px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                      {user.userName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                      {user.totalReservations}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                      {user.totalHours}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                      {user.cancelledReservations}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

UserActivityTable.displayName = "UserActivityTable";
