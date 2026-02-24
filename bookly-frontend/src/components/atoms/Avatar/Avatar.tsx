"use client";

import { cn } from "@/lib/utils";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

/**
 * Avatar Component - Bookly Design System
 *
 * Muestra imágenes de perfil de usuarios con fallback a iniciales
 * Usado en headers, listas de usuarios, comentarios, etc.
 *
 * Design System:
 * - Grid de 8px: tamaños en múltiplos (32, 40, 48, 64px)
 * - Tokens semánticos: brand.primary para fallback
 * - Rounded-full para forma circular
 * - Accesible con aspect-square para imágenes
 *
 * Variantes de tamaño:
 * - sm: 32px (h-8 w-8) - 4 * 8px
 * - md: 40px (h-10 w-10) - 5 * 8px - default
 * - lg: 48px (h-12 w-12) - 6 * 8px
 * - xl: 64px (h-16 w-16) - 8 * 8px
 */

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: "sm" | "md" | "lg" | "xl";
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full font-medium",
      "bg-[var(--color-brand-primary-100)] text-[var(--color-brand-primary-700)]",
      "dark:bg-[var(--color-brand-primary-900)] dark:text-[var(--color-brand-primary-300)]",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarFallback, AvatarImage };
