/**
 * ActivityTimeline - Línea de tiempo de actividades recientes
 *
 * Muestra actividades en orden cronológico con iconos y estados
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";

interface Activity {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  type: "success" | "warning" | "error" | "info";
  icon?: string;
}

interface ActivityTimelineProps {
  title?: string;
  activities: Activity[];
  maxItems?: number;
}

const typeStyles = {
  success: {
    bg: "bg-green-500/20",
    border: "border-green-500",
    text: "text-green-400",
  },
  warning: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500",
    text: "text-yellow-400",
  },
  error: {
    bg: "bg-red-500/20",
    border: "border-red-500",
    text: "text-red-400",
  },
  info: {
    bg: "bg-blue-500/20",
    border: "border-blue-500",
    text: "text-blue-400",
  },
};

export function ActivityTimeline({
  title = "Actividad Reciente",
  activities,
  maxItems = 10,
}: ActivityTimelineProps) {
  const displayedActivities = activities.slice(0, maxItems);

  function formatTimestamp(timestamp: Date | string): string {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay actividades recientes
            </p>
          ) : (
            displayedActivities.map((activity, index) => {
              const styles = typeStyles[activity.type];
              const isLast = index === displayedActivities.length - 1;

              return (
                <div key={activity.id} className="flex gap-3">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full ${styles.bg} border-2 ${styles.border} flex items-center justify-center`}
                    >
                      <span className="text-sm">{activity.icon || "•"}</span>
                    </div>
                    {!isLast && (
                      <div className="w-0.5 h-full bg-gray-700 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`font-medium ${styles.text}`}>
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-gray-400 mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
