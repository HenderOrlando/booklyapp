/**
 * PageSkeleton — Reusable loading skeleton for route transitions.
 *
 * Used by Next.js loading.tsx files to show instant loading UI
 * while the page chunk and data are being loaded.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface PageSkeletonProps {
  variant?: "dashboard" | "table" | "form" | "detail";
  className?: string;
}

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-tertiary)]",
        className,
      )}
    />
  );
}

function KPISkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--color-border-subtle)] p-6 space-y-3"
        >
          <Pulse className="h-4 w-24" />
          <Pulse className="h-8 w-16" />
          <Pulse className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Pulse className="h-8 w-48" />
        <Pulse className="h-9 w-32" />
      </div>
      <div className="rounded-lg border border-[var(--color-border-subtle)] overflow-hidden">
        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <Pulse className="h-4 w-1/4" />
            <Pulse className="h-4 w-1/4" />
            <Pulse className="h-4 w-1/4" />
            <Pulse className="h-4 w-1/4" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Pulse className="h-5 w-1/4" />
              <Pulse className="h-5 w-1/4" />
              <Pulse className="h-5 w-1/4" />
              <Pulse className="h-5 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Pulse className="h-[300px] w-full rounded-lg" />
      </div>
      <Pulse className="h-[300px] w-full rounded-lg" />
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <Pulse className="h-8 w-64" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Pulse className="h-10 w-32" />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Pulse className="h-6 w-6" />
        <Pulse className="h-8 w-64" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-[var(--color-border-subtle)] p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Pulse className="h-4 w-24" />
              <Pulse className="h-4 w-32" />
            </div>
          ))}
        </div>
        <Pulse className="h-[250px] w-full rounded-lg" />
      </div>
    </div>
  );
}

export function PageSkeleton({ variant = "table", className }: PageSkeletonProps) {
  return (
    <div className={cn("space-y-6 p-0", className)}>
      {variant === "dashboard" && (
        <>
          <Pulse className="h-8 w-48" />
          <KPISkeleton />
          <ChartSkeleton />
        </>
      )}
      {variant === "table" && (
        <>
          <Pulse className="h-8 w-48" />
          <TableSkeleton />
        </>
      )}
      {variant === "form" && <FormSkeleton />}
      {variant === "detail" && <DetailSkeleton />}
    </div>
  );
}
