import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { useTranslations } from "next-intl";

/**
 * SearchBar - Molecule Component
 *
 * Barra de búsqueda reutilizable con botón de búsqueda avanzada opcional.
 * Elimina código duplicado en páginas de listado.
 *
 * Design System:
 * - Input usa tokens de formulario: bg.surface, border.subtle, border.focus
 * - Botón secundario con action.secondary
 * - Estados: default, hover, focus (accesibilidad)
 * - Spacing en múltiplos de 8px
 */

export interface SearchBarProps {
  /** Placeholder del input */
  placeholder?: string;
  /** Valor actual */
  value: string;
  /** Callback al cambiar el valor */
  onChange: (value: string) => void;
  /** Callback al limpiar */
  onClear?: () => void;
  /** Si muestra el botón de búsqueda avanzada */
  showAdvancedSearch?: boolean;
  /** Callback al hacer click en búsqueda avanzada */
  onAdvancedSearch?: () => void;
  /** Clases CSS adicionales */
  className?: string;
}

export function SearchBar({
  placeholder,
  value,
  onChange,
  onClear,
  showAdvancedSearch = false,
  onAdvancedSearch,
  className = "",
}: SearchBarProps) {
  const t = useTranslations("common");
  const resolvedPlaceholder = placeholder || t("search_placeholder");

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={resolvedPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-8"
        />
        {value && onClear && (
          <button
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label={t("clear_filters")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {showAdvancedSearch && onAdvancedSearch && (
        <Button variant="outline" onClick={onAdvancedSearch}>
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          {t("search")}
        </Button>
      )}
    </div>
  );
}
