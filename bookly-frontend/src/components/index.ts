/**
 * Barrel exports para componentes Bookly
 *
 * Estructura basada en Atomic Design:
 * - Atoms: Componentes básicos e indivisibles
 * - Molecules: Combinación de átomos
 * - Organisms: Secciones complejas de UI
 * - Templates: Layouts de página
 * - Pages: Páginas completas
 */

// ============================================
// ATOMS - Componentes Básicos
// ============================================
export { LoadingSpinner } from "./atoms/LoadingSpinner";
export { Toast } from "./atoms/Toast";

// ============================================
// MOLECULES - Composiciones de Átomos
// ============================================
export { ButtonWithLoading } from "./molecules/ButtonWithLoading";
export { LoadingState } from "./molecules/LoadingState";

// ============================================
// ORGANISMS - Secciones Complejas
// ============================================
export { AppSidebar } from "./organisms/AppSidebar/AppSidebar";
export { ToastContainer } from "./organisms/ToastContainer";

// ============================================
// EXPORTS DE TIPOS
// ============================================
export type { LoadingSpinnerProps } from "./atoms/LoadingSpinner";
export type { ToastProps } from "./atoms/Toast";
export type { ButtonWithLoadingProps } from "./molecules/ButtonWithLoading";
export type { LoadingStateProps } from "./molecules/LoadingState";
