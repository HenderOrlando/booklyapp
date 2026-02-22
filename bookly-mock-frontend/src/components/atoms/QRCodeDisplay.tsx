import * as React from "react";

/**
 * QRCodeDisplay - Atom Component
 *
 * Componente para visualizar códigos QR utilizados en check-in/check-out.
 * Usa la librería qrcode.react para generar el código QR.
 *
 * @example
 * ```tsx
 * <QRCodeDisplay value={qrData} size={200} />
 * <QRCodeDisplay value={qrData} includeMargin={true} />
 * ```
 */

export interface QRCodeDisplayProps {
  /** Datos a codificar en el QR (JSON stringificado o texto) */
  value: string;
  /** Tamaño del QR en píxeles */
  size?: number;
  /** Nivel de corrección de errores */
  level?: "L" | "M" | "Q" | "H";
  /** Color de fondo */
  bgColor?: string;
  /** Color de los puntos */
  fgColor?: string;
  /** Incluir margen alrededor */
  includeMargin?: boolean;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

interface QRCodeSvgProps {
  value: string;
  size: number;
  level: "L" | "M" | "Q" | "H";
  bgColor: string;
  fgColor: string;
  includeMargin: boolean;
}

export const QRCodeDisplay = React.memo<QRCodeDisplayProps>(
  ({
    value,
    size = 200,
    level = "M",
    bgColor = "var(--color-bg-surface)",
    fgColor = "var(--color-text-primary)",
    includeMargin = false,
    className = "",
  }) => {
    // Lazy load QRCode component
    const [QRCode, setQRCode] =
      React.useState<React.ComponentType<QRCodeSvgProps> | null>(null);

    React.useEffect(() => {
      import("qrcode.react").then((module) => {
        setQRCode(() => module.QRCodeSVG);
      });
    }, []);

    if (!QRCode) {
      return (
        <div
          className={`flex items-center justify-center bg-[var(--color-bg-secondary)] ${className}`}
          style={{ width: size, height: size }}
        >
          <div className="animate-pulse text-sm text-[var(--color-text-secondary)]">
            Cargando QR...
          </div>
        </div>
      );
    }

    return (
      <div className={`inline-block ${className}`}>
        <QRCode
          value={value}
          size={size}
          level={level}
          bgColor={bgColor}
          fgColor={fgColor}
          includeMargin={includeMargin}
        />
      </div>
    );
  },
);

QRCodeDisplay.displayName = "QRCodeDisplay";
