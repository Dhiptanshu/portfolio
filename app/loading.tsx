export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Loading
        </p>
      </div>
    </div>
  );
}
