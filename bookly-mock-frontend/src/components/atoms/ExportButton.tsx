import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import * as React from "react";

/**
 * ExportButton - Botón de exportación con formato específico
 *
 * Botón especializado para exportar datos en diferentes formatos.
 * Muestra el ícono apropiado según el formato.
 *
 * @component
 * @example
 * ```tsx
 * <ExportButton
 *   format="excel"
 *   onExport={(format) => handleExport(format)}
 *   loading={isExporting}
 * />
 * ```
 */

export interface ExportButtonProps {
  format: "csv" | "excel" | "pdf";
  onExport: (format: "csv" | "excel" | "pdf") => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export const ExportButton = React.memo<ExportButtonProps>(
  ({
    format,
    onExport,
    loading = false,
    disabled = false,
    className = "",
    size = "md",
    variant = "outline",
  }) => {
    // Configuración por formato
    const formatConfig = {
      csv: {
        label: "CSV",
        icon: FileText,
        color: "text-green-600 dark:text-green-400",
      },
      excel: {
        label: "Excel",
        icon: FileSpreadsheet,
        color: "text-green-700 dark:text-green-300",
      },
      pdf: {
        label: "PDF",
        icon: FileDown,
        color: "text-red-600 dark:text-red-400",
      },
    };

    const config = formatConfig[format];
    const Icon = config.icon;

    // Tamaños
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const iconSizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };

    // Variantes
    const variantClasses = {
      default: `
        bg-[var(--color-primary-base)] 
        text-white 
        hover:bg-[var(--color-primary-dark)] 
        border-transparent
      `,
      outline: `
        bg-transparent 
        border-gray-300 dark:border-gray-600 
        text-gray-700 dark:text-gray-300 
        hover:bg-gray-50 dark:hover:bg-gray-800
      `,
      ghost: `
        bg-transparent 
        border-transparent 
        text-gray-700 dark:text-gray-300 
        hover:bg-gray-100 dark:hover:bg-gray-800
      `,
    };

    return (
      <button
        onClick={() => onExport(format)}
        disabled={disabled || loading}
        className={`
          inline-flex items-center gap-2
          font-medium
          rounded-lg
          border
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-base)] focus:ring-offset-2
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${className}
        `}
        title={`Exportar como ${config.label}`}
      >
        {loading ? (
          <>
            <div
              className={`
                animate-spin rounded-full border-b-2 border-current
                ${iconSizeClasses[size]}
              `}
            />
            <span>Exportando...</span>
          </>
        ) : (
          <>
            <Icon className={`${iconSizeClasses[size]} ${config.color}`} />
            <span>Exportar {config.label}</span>
          </>
        )}
      </button>
    );
  }
);

ExportButton.displayName = "ExportButton";
