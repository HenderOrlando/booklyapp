"use client";

/**
 * Dynamic Chart Components — Lazy-loaded wrappers for Recharts-based charts.
 *
 * These wrappers ensure recharts (~200KB) is only loaded when a chart
 * component actually renders, keeping it out of the initial page bundle.
 *
 * Usage:
 *   import { DynamicBarChartCard } from "@/components/molecules/charts-dynamic";
 *   <DynamicBarChartCard data={data} xKey="name" yKey="count" />
 */

import dynamic from "next/dynamic";
import * as React from "react";

function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="animate-pulse bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-tertiary)] rounded-lg"
      style={{ height }}
    />
  );
}

export const DynamicLineChartCard = dynamic(
  () =>
    import("@/components/molecules/LineChartCard").then(
      (mod) => mod.LineChartCard,
    ),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  },
);

export const DynamicBarChartCard = dynamic(
  () =>
    import("@/components/molecules/BarChartCard").then(
      (mod) => mod.BarChartCard,
    ),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  },
);

export const DynamicAreaChartCard = dynamic(
  () =>
    import("@/components/molecules/AreaChartCard").then(
      (mod) => mod.AreaChartCard,
    ),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  },
);

export const DynamicPieChartCard = dynamic(
  () =>
    import("@/components/molecules/PieChartCard").then(
      (mod) => mod.PieChartCard,
    ),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  },
);

export const DynamicScatterChartCard = dynamic(
  () =>
    import("@/components/molecules/ScatterChartCard").then(
      (mod) => mod.ScatterChartCard,
    ),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  },
);
