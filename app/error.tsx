"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-3xl">Something slipped.</h1>
      <p className="max-w-md text-sm text-muted-foreground">The portfolio could not render this view. Try again after checking configuration.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
