"use client";

import { Button } from "@/components/atoms/Button/Button";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { Star, X } from "lucide-react";
import * as React from "react";

/**
 * FeedbackModal — RF-34: Registro de feedback de calidad de servicio
 *
 * Modal post-reserva para que el usuario deje rating y comentarios
 * sobre la calidad del recurso y la experiencia.
 */

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  resourceName: string;
  onSubmit: (data: FeedbackData) => Promise<void>;
}

export interface FeedbackData {
  reservationId: string;
  rating: number;
  comment: string;
  categories: string[];
}

const FEEDBACK_CATEGORIES = [
  "Limpieza",
  "Equipamiento",
  "Iluminación",
  "Temperatura",
  "Ruido",
  "Accesibilidad",
  "Puntualidad",
  "Estado general",
];

export function FeedbackModal({
  open,
  onOpenChange,
  reservationId,
  resourceName,
  onSubmit,
}: FeedbackModalProps) {
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [categories, setCategories] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await onSubmit({ reservationId, rating, comment, categories });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    setCategories([]);
    setSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-[var(--color-bg-surface)] p-6 shadow-lg">
          {submitted ? (
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-state-success-100">
                <Star
                  className="h-6 w-6 text-state-success-600"
                  fill="currentColor"
                />
              </div>
              <Dialog.Title className="text-lg font-semibold">
                ¡Gracias por tu feedback!
              </Dialog.Title>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Tu opinión nos ayuda a mejorar el servicio.
              </p>
              <Button className="mt-4" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              <Dialog.Title className="text-lg font-semibold text-[var(--color-text-primary)]">
                Califica tu experiencia
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-[var(--color-text-secondary)]">
                ¿Cómo fue tu experiencia con <strong>{resourceName}</strong>?
              </Dialog.Description>

              <div className="mt-4 space-y-4">
                {/* Star Rating */}
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`${star} estrellas`}
                    >
                      <Star
                        className={cn(
                          "h-8 w-8 transition-colors",
                          (hoverRating || rating) >= star
                            ? "text-state-warning-500 fill-state-warning-500"
                            : "text-[var(--color-text-tertiary)]",
                        )}
                      />
                    </button>
                  ))}
                </div>

                {/* Categories */}
                <div>
                  <p className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
                    ¿Qué aspectos quieres destacar? (opcional)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {FEEDBACK_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          categories.includes(cat)
                            ? "bg-brand-primary-500 text-white"
                            : "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]/80",
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Cuéntanos más sobre tu experiencia..."
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={handleClose}>
                  Omitir
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={rating === 0 || loading}
                >
                  {loading ? "Enviando..." : "Enviar feedback"}
                </Button>
              </div>

              <Dialog.Close asChild>
                <button
                  className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
                  onClick={handleClose}
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
