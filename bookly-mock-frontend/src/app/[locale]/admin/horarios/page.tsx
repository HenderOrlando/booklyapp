"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import { Checkbox } from "@/components/atoms/Checkbox";
import { TimeInput } from "@/components/atoms/TimeInput";
import { MainLayout } from "@/components/templates/MainLayout";
import {
  useGlobalSchedules,
  useSaveSchedules,
  type TimeSlotConfig,
} from "@/hooks/useSchedules";
import { cn } from "@/lib/utils";
import { Clock, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Page: Configuración de Horarios Disponibles — RF-07
 *
 * Permite configurar franjas horarias por recurso o de forma global:
 * - Horarios por día de la semana
 * - Bloqueos por festivos
 * - Periodos académicos
 */

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const defaultSlots: TimeSlotConfig[] = DAYS.map((_, i) => ({
  id: `slot-${i}`,
  dayOfWeek: i,
  startTime: i < 5 ? "07:00" : "08:00",
  endTime: i < 5 ? "21:00" : "14:00",
  enabled: i < 6,
}));

export default function HorariosPage() {
  const _t = useTranslations("admin");
  const { data: serverSlots, isLoading: _isLoading } = useGlobalSchedules();
  const saveSchedules = useSaveSchedules();
  const [slots, setSlots] = React.useState<TimeSlotConfig[]>(defaultSlots);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (serverSlots && serverSlots.length > 0) {
      setSlots(serverSlots);
    }
  }, [serverSlots]);

  const toggleDay = (dayOfWeek: number) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, enabled: !s.enabled } : s,
      ),
    );
    setSaved(false);
  };

  const updateSlot = (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s,
      ),
    );
    setSaved(false);
  };

  const handleSave = () => {
    saveSchedules.mutate(slots, {
      onSuccess: () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Horarios Disponibles
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              Configura las franjas horarias de disponibilidad global para
              recursos
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {saved ? "Guardado" : "Guardar cambios"}
          </Button>
        </div>

        {/* Schedule Grid */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-[var(--color-bg-muted)]">
                    <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                      Día
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                      Hora inicio
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                      Hora fin
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                      Duración
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => {
                    const startH = parseInt(slot.startTime.split(":")[0]);
                    const endH = parseInt(slot.endTime.split(":")[0]);
                    const duration = endH - startH;

                    return (
                      <tr
                        key={slot.id}
                        className={cn(
                          "border-b last:border-0",
                          !slot.enabled && "opacity-50",
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                            <span className="font-medium text-[var(--color-text-primary)]">
                              {DAYS[slot.dayOfWeek]}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={slot.enabled}
                              onCheckedChange={() => toggleDay(slot.dayOfWeek)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <TimeInput
                            value={slot.startTime}
                            onChange={(val) =>
                              updateSlot(slot.dayOfWeek, "startTime", val)
                            }
                            disabled={!slot.enabled}
                            className="w-32 mx-auto"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <TimeInput
                            value={slot.endTime}
                            onChange={(val) =>
                              updateSlot(slot.dayOfWeek, "endTime", val)
                            }
                            disabled={!slot.enabled}
                            className="w-32 mx-auto"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {slot.enabled ? (
                            <Badge
                              variant={
                                duration >= 12
                                  ? "success"
                                  : duration >= 6
                                    ? "primary"
                                    : "warning"
                              }
                            >
                              {duration}h
                            </Badge>
                          ) : (
                            <Badge>Cerrado</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Holidays / Blocked dates info */}
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Fechas bloqueadas y festivos
          </h3>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Los días festivos institucionales se sincronizan automáticamente
            desde el calendario académico. Para bloquear fechas específicas, usa
            la configuración de cada recurso.
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
