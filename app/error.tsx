"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
          Something went wrong
        </p>
        <h1 className="mt-3 font-serif text-3xl text-foreground">
          An error occurred
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {error.message || "Please try refreshing the page."}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-sm border border-border px-5 py-2 text-xs uppercase tracking-[0.12em] text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
