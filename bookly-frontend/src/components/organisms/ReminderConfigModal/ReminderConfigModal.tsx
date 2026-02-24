"use client";

import { Button } from "@/components/atoms/Button/Button";
// import { Input } from "@/components/atoms/Input/Input";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { Bell, X, Plus, Trash2 } from "lucide-react";
import * as React from "react";

/**
 * ReminderConfigModal — RF-29: Recordatorios de reserva personalizables
 *
 * Permite al usuario configurar recordatorios previos a sus reservas:
 * - Cuántos minutos/horas antes
 * - Canal (email, push)
 * - Habilitar/deshabilitar
 */

interface Reminder {
  id: string;
  minutesBefore: number;
  channel: "email" | "push" | "both";
  enabled: boolean;
}

interface ReminderConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminders: Reminder[];
  onSave: (reminders: Reminder[]) => Promise<void>;
}

const CHANNEL_LABELS = {
  email: "Email",
  push: "Notificación push",
  both: "Email + Push",
};

const TIME_PRESETS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "2 horas", value: 120 },
  { label: "1 día", value: 1440 },
];

export function ReminderConfigModal({
  open,
  onOpenChange,
  reminders: initialReminders,
  onSave,
}: ReminderConfigModalProps) {
  const [reminders, setReminders] = React.useState<Reminder[]>(initialReminders);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setReminders(initialReminders);
  }, [initialReminders]);

  const addReminder = () => {
    setReminders((prev) => [
      ...prev,
      {
        id: `rem-${Date.now()}`,
        minutesBefore: 30,
        channel: "email",
        enabled: true,
      },
    ]);
  };

  const removeReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const updateReminder = (id: string, field: keyof Reminder, value: any) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(reminders);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const _formatTime = (minutes: number): string => {
    if (minutes >= 1440) return `${Math.floor(minutes / 1440)} día(s)`;
    if (minutes >= 60) return `${Math.floor(minutes / 60)} hora(s)`;
    return `${minutes} min`;
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-[var(--color-bg-surface)] p-6 shadow-lg">
          <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text-primary)]">
            <Bell className="h-5 w-5" />
            Configurar Recordatorios
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Configura cuándo y cómo recibir recordatorios antes de tus reservas.
          </Dialog.Description>

          <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
            {reminders.length === 0 ? (
              <p className="py-4 text-center text-sm text-[var(--color-text-tertiary)]">
                No hay recordatorios configurados
              </p>
            ) : (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={cn(
                    "flex items-center gap-3 rounded-md border p-3",
                    !reminder.enabled && "opacity-50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={(e) => updateReminder(reminder.id, "enabled", e.target.checked)}
                    className="rounded"
                  />
                  <select
                    value={reminder.minutesBefore}
                    onChange={(e) => updateReminder(reminder.id, "minutesBefore", parseInt(e.target.value))}
                    className="rounded-md border bg-background px-2 py-1 text-sm"
                  >
                    {TIME_PRESETS.map((preset) => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label} antes
                      </option>
                    ))}
                  </select>
                  <select
                    value={reminder.channel}
                    onChange={(e) => updateReminder(reminder.id, "channel", e.target.value)}
                    className="rounded-md border bg-background px-2 py-1 text-sm"
                  >
                    {Object.entries(CHANNEL_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeReminder(reminder.id)}
                    className="rounded p-1 text-[var(--color-text-tertiary)] hover:text-state-error-500"
                    aria-label="Eliminar recordatorio"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full gap-2"
            onClick={addReminder}
          >
            <Plus className="h-4 w-4" />
            Agregar recordatorio
          </Button>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
