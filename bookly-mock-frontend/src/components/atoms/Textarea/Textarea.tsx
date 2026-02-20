import { cn } from "@/lib/utils";
import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] ring-offset-background placeholder:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[var(--color-border-subtle)] disabled:bg-[var(--color-bg-muted)] disabled:text-[var(--color-text-tertiary)] disabled:opacity-80",
            error &&
              "border-[var(--color-state-error-border)] focus-visible:ring-[var(--color-state-error-border)]",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--color-state-error-text)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
