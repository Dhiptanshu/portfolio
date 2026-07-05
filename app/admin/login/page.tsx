"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) setError(loginError.message);
      else router.push(search.get("next") ?? "/admin");
    } catch {
      setError("Unable to reach Supabase Auth. Verify NEXT_PUBLIC_SUPABASE_URL and that the project is active.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={login} className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <h1 className="font-serif text-2xl">Admin login</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in with the Supabase admin account.</p>
        <div className="mt-6 grid gap-3">
          <Input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit">Sign in</Button>
        </div>
      </form>
    </main>
  );
}
